from __future__ import annotations

import calendar
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
from typing import Any
from urllib.parse import urlencode

from .country_continents import CONTINENT_NAMES, COUNTRY_TO_CONTINENT_CODE
from .doaj_api import DoajApiClient, read_json
from .utils import month_bucket, normalize_text, parse_datetime, percent, top_counter_items, unique_preserve_order


FULL_CORPUS_QUERY = "created_date:[1900-01-01 TO 2100-12-31]"
STATISTICS_REFRESH_HOURS = 3
SUPPORTED_APC_CURRENCIES = ("EUR", "USD")
API_PAGE_SIZE = 100
API_MAX_PAGES = 10
API_MAX_RECORDS_PER_QUERY = API_PAGE_SIZE * API_MAX_PAGES
MAX_PARTITION_WORKERS = 4


def chart_items(counter: Counter[str], limit: int) -> list[dict[str, int]]:
    return [{"name": key, "value": value} for key, value in counter.most_common(limit)]


def created_date_query(start_date: date, end_date: date) -> str:
    return f"created_date:[{start_date.isoformat()} TO {end_date.isoformat()}]"


def period_total(client: DoajApiClient, start_date: date, end_date: date) -> int:
    return client.search(
        "journals",
        created_date_query(start_date, end_date),
        page_size=1,
        max_pages=1,
        max_records=1,
    ).total


def partition_queries(client: DoajApiClient, *, start_year: int, end_year: int) -> tuple[list[str], list[str]]:
    queries: list[str] = []
    warnings: list[str] = []

    for year in range(start_year, end_year + 1):
        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)
        year_total = period_total(client, year_start, year_end)
        if year_total <= 0:
            continue
        if year_total <= API_MAX_RECORDS_PER_QUERY:
            queries.append(created_date_query(year_start, year_end))
            continue

        month_ranges = [
            (date(year, month, 1), date(year, month, calendar.monthrange(year, month)[1]))
            for month in range(1, 13)
        ]
        with ThreadPoolExecutor(max_workers=MAX_PARTITION_WORKERS) as executor:
            month_totals = list(executor.map(lambda period: period_total(client, period[0], period[1]), month_ranges))

        for (month_start, month_end), month_total in zip(month_ranges, month_totals, strict=False):
            if month_total <= 0:
                continue
            if month_total <= API_MAX_RECORDS_PER_QUERY:
                queries.append(created_date_query(month_start, month_end))
                continue

            day_ranges = [(date(year, month_start.month, day), date(year, month_start.month, day)) for day in range(1, month_end.day + 1)]
            with ThreadPoolExecutor(max_workers=MAX_PARTITION_WORKERS) as executor:
                day_totals = list(executor.map(lambda period: period_total(client, period[0], period[1]), day_ranges))

            for (day_start, _), day_total in zip(day_ranges, day_totals, strict=False):
                if day_total <= 0:
                    continue
                if day_total > API_MAX_RECORDS_PER_QUERY:
                    warnings.append(
                        f"Daily partition {day_start.isoformat()} exceeds the DOAJ page cap and may be incomplete."
                    )
                queries.append(created_date_query(day_start, day_start))

    return queries, warnings


def unique_strings(values: list[str]) -> list[str]:
    return unique_preserve_order(str(value).strip() for value in values if str(value).strip())


def pick_first(values: list[str], fallback: str = "-") -> str:
    return values[0] if values else fallback


def to_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def format_iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def iso_country_code(value: str | None) -> str:
    raw = str(value or "").strip().upper()
    if len(raw) == 2 and raw.isalpha():
        return raw
    return raw


def continent_name(country_code: str | None) -> str:
    code = iso_country_code(country_code)
    continent_code = COUNTRY_TO_CONTINENT_CODE.get(code, "")
    return CONTINENT_NAMES.get(continent_code, "Unknown")


def frankfurter_rates(source_currency: str) -> tuple[dict[str, float], str]:
    targets = ",".join(target for target in SUPPORTED_APC_CURRENCIES if target != source_currency)
    if not targets:
        return {source_currency: 1.0}, "Frankfurter API"
    url = f"https://api.frankfurter.app/latest?{urlencode({'from': source_currency, 'to': targets})}"
    payload = read_json(url, timeout=30)
    rates = {source_currency: 1.0}
    for key, value in (payload.get("rates") or {}).items():
        numeric = to_float(value)
        if numeric:
            rates[str(key).upper()] = numeric
    return rates, "Frankfurter API"


def fallback_erapi_rates(source_currency: str) -> tuple[dict[str, float], str]:
    url = f"https://open.er-api.com/v6/latest/{source_currency}"
    payload = read_json(url, timeout=30)
    rates = {source_currency: 1.0}
    for key, value in (payload.get("rates") or {}).items():
        key_upper = str(key).upper()
        if key_upper not in SUPPORTED_APC_CURRENCIES:
            continue
        numeric = to_float(value)
        if numeric:
            rates[key_upper] = numeric
    return rates, "open.er-api.com"


def fetch_exchange_matrix(source_currencies: set[str]) -> tuple[dict[str, dict[str, float]], dict[str, Any]]:
    matrix: dict[str, dict[str, float]] = {}
    provider_counts: Counter[str] = Counter()
    warnings: list[str] = []

    for source in sorted(currency for currency in source_currencies if currency):
        rates: dict[str, float] | None = None
        provider = ""
        try:
            rates, provider = frankfurter_rates(source)
        except Exception:
            try:
                rates, provider = fallback_erapi_rates(source)
            except Exception:
                warnings.append(f"Unable to load FX rates for {source}.")
                continue

        provider_counts[provider] += 1
        normalized_rates = {source: 1.0}
        for target in SUPPORTED_APC_CURRENCIES:
            if target == source:
                normalized_rates[target] = 1.0
                continue
            value = to_float(rates.get(target))
            if value:
                normalized_rates[target] = value
        matrix[source] = normalized_rates

    return matrix, {
        "fetched_at": format_iso_now(),
        "providers": dict(provider_counts),
        "supported_currencies": list(SUPPORTED_APC_CURRENCIES),
        "warnings": warnings,
    }


def apc_prices(record: dict[str, Any]) -> list[dict[str, Any]]:
    apc = (record.get("bibjson") or {}).get("apc") or {}
    prices = []
    for item in apc.get("max") or []:
        currency = str(item.get("currency") or "").strip().upper()
        price = to_float(item.get("price"))
        if not currency or price is None:
            continue
        prices.append({"currency": currency, "price": price})
    return prices


def max_apc_in_target(prices: list[dict[str, Any]], target_currency: str, matrix: dict[str, dict[str, float]]) -> float | None:
    converted: list[float] = []
    for item in prices:
        source_currency = item["currency"]
        price = item["price"]
        if source_currency == target_currency:
            converted.append(price)
            continue
        rate = matrix.get(source_currency, {}).get(target_currency)
        if rate:
            converted.append(price * rate)
    if not converted:
        return None
    return round(max(converted), 2)


def max_native_apc_display(prices: list[dict[str, Any]]) -> str:
    if not prices:
        return ""
    formatted = [f"{int(item['price']) if item['price'].is_integer() else item['price']} {item['currency']}" for item in prices]
    return " / ".join(formatted)


def normalize_journal_row(record: dict[str, Any], fx_matrix: dict[str, dict[str, float]]) -> dict[str, Any]:
    bib = record.get("bibjson") or {}
    publisher = bib.get("publisher") or {}
    created_date = str(record.get("created_date") or "").strip()
    last_updated = str(record.get("last_updated") or "").strip()
    country = iso_country_code(publisher.get("country"))
    subjects = unique_strings([item.get("term") for item in (bib.get("subject") or []) if isinstance(item, dict)])
    languages = unique_strings(list(bib.get("language") or []))
    license_types = unique_strings([item.get("type") for item in (bib.get("license") or []) if isinstance(item, dict)])
    peer_review_types = unique_strings(list((bib.get("editorial") or {}).get("review_process") or []))
    pid_schemes = unique_strings(list((bib.get("pid_scheme") or {}).get("scheme") or []))
    preservation_services = unique_strings(list((bib.get("preservation") or {}).get("service") or []))
    prices = apc_prices(record)
    article_number = (bib.get("article") or {}).get("number")
    if isinstance(article_number, int):
        article_records = article_number
    elif isinstance(article_number, str) and article_number.isdigit():
        article_records = int(article_number)
    else:
        article_records = None
    refs = bib.get("ref") or {}
    search_text = normalize_text(
        " ".join(
            [
                str(bib.get("title") or ""),
                str(publisher.get("name") or ""),
                country,
                CONTINENT_NAMES.get(COUNTRY_TO_CONTINENT_CODE.get(country, ""), ""),
                " ".join(subjects),
                " ".join(languages),
                " ".join(license_types),
            ]
        )
    )

    return {
        "id": str(record.get("id") or "").strip(),
        "title": str(bib.get("title") or "").strip(),
        "publisher_name": str(publisher.get("name") or "").strip(),
        "country": country,
        "continent": continent_name(country),
        "subjects": subjects,
        "subject_display": " · ".join(subjects[:2]) or "-",
        "languages": languages,
        "language_display": ", ".join(languages) or "-",
        "license_types": license_types,
        "license_display": ", ".join(license_types) or "-",
        "apc_has": bool((bib.get("apc") or {}).get("has_apc")),
        "apc_native_display": max_native_apc_display(prices),
        "apc_max_eur": max_apc_in_target(prices, "EUR", fx_matrix),
        "apc_max_usd": max_apc_in_target(prices, "USD", fx_matrix),
        "author_retains": (bib.get("copyright") or {}).get("author_retains"),
        "peer_review_types": peer_review_types,
        "peer_review_display": ", ".join(peer_review_types) or "-",
        "pid_schemes": pid_schemes,
        "preservation_services": preservation_services,
        "created_date": created_date,
        "created_year": (parse_datetime(created_date).year if parse_datetime(created_date) else None),
        "created_month": month_bucket(created_date),
        "last_updated": last_updated,
        "website": refs.get("journal") or refs.get("oa_statement") or refs.get("aims_scope") or "",
        "author_guidelines_url": refs.get("author_instructions") or "",
        "article_records_exposed": article_records,
        "search_text": search_text,
    }


def journal_rows(records: list[dict[str, Any]], fx_matrix: dict[str, dict[str, float]]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for record in records:
        journal_id = str(record.get("id") or "").strip()
        if not journal_id:
            continue
        by_id[journal_id] = normalize_journal_row(record, fx_matrix)
    return sorted(
        by_id.values(),
        key=lambda item: (
            item["last_updated"] or "",
            item["created_date"] or "",
            item["title"].lower(),
        ),
        reverse=True,
    )


def top_subjects_by_country(rows: list[dict[str, Any]], limit: int = 20) -> list[dict[str, int]]:
    counter: Counter[str] = Counter()
    for row in rows:
        country = row.get("country") or ""
        if not country:
            continue
        for subject in row.get("subjects") or []:
            counter[f"{country} — {subject}"] += 1
    return chart_items(counter, limit)


def timeline_items(rows: list[dict[str, Any]]) -> list[dict[str, int]]:
    counter: Counter[str] = Counter()
    for row in rows:
        created_month = str(row.get("created_month") or "").strip()
        if created_month:
            counter[created_month] += 1
    return [{"name": key, "value": counter[key]} for key in sorted(counter.keys())]


def country_apc_totals(rows: list[dict[str, Any]], currency: str, limit: int = 20) -> list[dict[str, float]]:
    key = "apc_max_eur" if currency == "EUR" else "apc_max_usd"
    totals: Counter[str] = Counter()
    for row in rows:
        amount = to_float(row.get(key))
        country = str(row.get("country") or "").strip()
        if not amount or not country:
            continue
        totals[country] += amount
    return [{"name": key, "value": round(value, 2)} for key, value in totals.most_common(limit)]


def build_statistics_summary(rows: list[dict[str, Any]], article_total: int, fx_meta: dict[str, Any], warnings: list[str] | None = None) -> dict[str, Any]:
    combined_warnings = [*(warnings or []), *((fx_meta or {}).get("warnings") or [])]
    country_counts = Counter(row["country"] for row in rows if row.get("country"))
    continent_counts = Counter(row["continent"] for row in rows if row.get("continent") and row["continent"] != "Unknown")
    language_counts = Counter(language for row in rows for language in row.get("languages") or [])
    subject_counts = Counter(subject for row in rows for subject in row.get("subjects") or [])
    license_counts = Counter(license_type for row in rows for license_type in row.get("license_types") or [])
    peer_review_counts = Counter(item for row in rows for item in row.get("peer_review_types") or [])
    pid_counts = Counter(item for row in rows for item in row.get("pid_schemes") or [])
    preservation_counts = Counter(item for row in rows for item in row.get("preservation_services") or [])
    publisher_counts = Counter(row["publisher_name"] for row in rows if row.get("publisher_name"))
    authors_retain_counts = Counter(
        "Yes" if row.get("author_retains") is True else "No" if row.get("author_retains") is False else "Unknown"
        for row in rows
    )
    apc_counts = Counter("Yes" if row.get("apc_has") else "No" for row in rows)
    year_values = [int(row["created_year"]) for row in rows if isinstance(row.get("created_year"), int)]

    return {
        "generated_at": format_iso_now(),
        "source_scope": "doaj_api_statistics",
        "query": FULL_CORPUS_QUERY,
        "refresh_interval_hours": STATISTICS_REFRESH_HOURS,
        "journal_total": len(rows),
        "article_total": article_total,
        "kpis": [
            {"label": "Journals", "value": len(rows)},
            {"label": "Countries", "value": len(country_counts)},
            {"label": "Article records", "value": article_total, "detail": "Global DOAJ article total"},
            {"label": "Languages", "value": len(language_counts)},
            {"label": "No APC", "value": percent(apc_counts.get("No", 0), len(rows)), "detail": "Share of journals"},
        ],
        "filters": {
            "countries": sorted(country_counts.keys()),
            "subjects": sorted(subject_counts.keys()),
            "license_types": sorted(license_counts.keys()),
            "peer_review_types": sorted(peer_review_counts.keys()),
            "languages": sorted(language_counts.keys()),
            "continents": [name for name in CONTINENT_NAMES.values() if continent_counts.get(name)],
            "created_year": {
                "min": min(year_values) if year_values else None,
                "max": max(year_values) if year_values else None,
            },
            "apc_currencies": list(SUPPORTED_APC_CURRENCIES),
        },
        "charts": {
            "top_subjects_by_country": {"title": "Top subjects by country (top 20)", "kind": "bar", "items": top_subjects_by_country(rows, 20)},
            "apc_distribution": {"title": "Article Processing Charges", "kind": "pie", "items": top_counter_items(apc_counts, 10)},
            "author_retains_copyright": {"title": "Authors retain copyright", "kind": "pie", "items": top_counter_items(authors_retain_counts, 10)},
            "top_countries": {"title": "Top 10 countries", "kind": "bar", "items": chart_items(country_counts, 10)},
            "journals_by_continent": {"title": "Journals in each continent", "kind": "pie", "items": chart_items(continent_counts, 10)},
            "top_languages": {"title": "Top 10 languages", "kind": "bar", "items": chart_items(language_counts, 10)},
            "top_subjects": {"title": "Top 10 subjects", "kind": "bar", "items": chart_items(subject_counts, 10)},
            "license_usage": {"title": "License usage", "kind": "pie", "items": chart_items(license_counts, 10)},
            "top_peer_review": {"title": "Top 5 peer-review type", "kind": "bar", "items": chart_items(peer_review_counts, 5)},
            "top_pid_schemes": {"title": "Top 5 Persistent Identifiers", "kind": "bar", "items": chart_items(pid_counts, 5)},
            "top_preservation_services": {"title": "Top 5 Preservation Services", "kind": "bar", "items": chart_items(preservation_counts, 5)},
            "top_publishers": {"title": "Top 10 publishers", "kind": "bar", "items": chart_items(publisher_counts, 10)},
            "journals_added_timeline": {
                "title": "Timeline of journals added to DOAJ (monthly)",
                "kind": "timeline",
                "categories": [item["name"] for item in timeline_items(rows)],
                "series": [{"name": "Journals added", "data": [item["value"] for item in timeline_items(rows)]}],
            },
            "top_country_apc_eur": {
                "title": "Top 20 countries by APC amount (EUR)",
                "kind": "bar",
                "items": country_apc_totals(rows, "EUR", 20),
            },
            "country_map": {
                "title": "Country of publishers",
                "kind": "map",
                "items": [{"name": key, "value": value} for key, value in country_counts.most_common()],
            },
        },
        "fx": fx_meta,
        "table_defaults": {"page_size": 25, "sort": "last_updated_desc"},
        "warnings": combined_warnings,
    }


def build_statistics_dataset() -> dict[str, Any]:
    client = DoajApiClient()
    warnings: list[str] = []
    current_year = datetime.now(timezone.utc).year
    query_partitions, partition_warnings = partition_queries(client, start_year=2000, end_year=current_year)
    warnings.extend(partition_warnings)

    journal_by_id: dict[str, dict[str, Any]] = {}
    with ThreadPoolExecutor(max_workers=MAX_PARTITION_WORKERS) as executor:
        journal_results = list(
            executor.map(
                lambda query: client.search(
                    "journals",
                    query,
                    page_size=API_PAGE_SIZE,
                    max_pages=API_MAX_PAGES,
                    max_records=API_MAX_RECORDS_PER_QUERY,
                ),
                query_partitions,
            )
        )

    for query, journal_result in zip(query_partitions, journal_results, strict=False):
        if journal_result.capped:
            warnings.append(f"Journal harvest reached the record cap for partition: {query}")
        for record in journal_result.results:
            journal_id = str(record.get("id") or "").strip()
            if not journal_id:
                continue
            journal_by_id[journal_id] = record

    article_total = client.search("articles", "*", page_size=1, max_pages=1, max_records=1).total

    currencies: set[str] = set()
    for record in journal_by_id.values():
        for price in apc_prices(record):
            currencies.add(price["currency"])

    fx_matrix, fx_meta = fetch_exchange_matrix(currencies)
    rows = journal_rows(list(journal_by_id.values()), fx_matrix)
    summary = build_statistics_summary(rows, article_total, fx_meta, warnings)

    generated_at = summary["generated_at"]
    journals_payload = {
        "generated_at": generated_at,
        "query": FULL_CORPUS_QUERY,
        "item_count": len(rows),
        "items": rows,
    }

    return {"summary": summary, "journals": journals_payload}
