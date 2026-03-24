from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

from .doaj_api import DoajApiClient, DoajDumpClient
from .nlp import build_completeness_note, build_theme_summary, top_terms
from .utils import (
    compact_number,
    flatten,
    month_bucket,
    normalize_text,
    percent,
    slugify,
    top_counter_items,
    unique_preserve_order,
    write_json,
    year_from_date,
)


@dataclass
class SnapshotTarget:
    entity_type: str
    title: str
    query: str
    entity_key: str | None = None
    match_title: str | None = None
    match_publisher: str | None = None
    match_issn: str | None = None
    match_doi: str | None = None
    note: str | None = None


def load_snapshot_targets(path: Path) -> tuple[dict[str, Any], list[SnapshotTarget]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    defaults = payload.get("defaults", {})
    raw_targets = payload.get("targets", [])
    targets: list[SnapshotTarget] = []
    for item in raw_targets:
        targets.append(
            SnapshotTarget(
                entity_type=str(item["entity_type"]).strip().lower(),
                title=str(item.get("title") or item.get("name") or item.get("query") or "").strip(),
                query=str(item.get("query") or item.get("title") or item.get("name") or "").strip(),
                entity_key=item.get("entity_key"),
                match_title=item.get("match_title"),
                match_publisher=item.get("match_publisher"),
                match_issn=item.get("match_issn"),
                match_doi=item.get("match_doi"),
                note=item.get("note"),
            )
        )
    return defaults, targets


def journal_bib(record: dict[str, Any]) -> dict[str, Any]:
    return record.get("bibjson", {})


def article_bib(record: dict[str, Any]) -> dict[str, Any]:
    return record.get("bibjson", {})


def journal_title(record: dict[str, Any]) -> str:
    return str(journal_bib(record).get("title") or "").strip()


def journal_publisher_name(record: dict[str, Any]) -> str:
    return str(journal_bib(record).get("publisher", {}).get("name") or "").strip()


def journal_country(record: dict[str, Any]) -> str:
    return str(journal_bib(record).get("publisher", {}).get("country") or "").strip()


def journal_languages(record: dict[str, Any]) -> list[str]:
    return unique_preserve_order(journal_bib(record).get("language", []) or [])


def journal_license_types(record: dict[str, Any]) -> list[str]:
    licenses = journal_bib(record).get("license", []) or []
    return unique_preserve_order(str(item.get("type") or "").strip() for item in licenses if item.get("type"))


def journal_subject_terms(record: dict[str, Any]) -> list[str]:
    subjects = journal_bib(record).get("subject", []) or []
    return unique_preserve_order(str(item.get("term") or "").strip() for item in subjects if item.get("term"))


def journal_pid_schemes(record: dict[str, Any]) -> list[str]:
    schemes = journal_bib(record).get("pid_scheme", {}).get("scheme", []) or []
    return unique_preserve_order(str(item).strip() for item in schemes if item)


def journal_preservation_services(record: dict[str, Any]) -> list[str]:
    services = journal_bib(record).get("preservation", {}).get("service", []) or []
    return unique_preserve_order(str(item).strip() for item in services if item)


def journal_review_processes(record: dict[str, Any]) -> list[str]:
    processes = journal_bib(record).get("editorial", {}).get("review_process", []) or []
    return unique_preserve_order(str(item).strip() for item in processes if item)


def journal_keywords(record: dict[str, Any]) -> list[str]:
    return unique_preserve_order(journal_bib(record).get("keywords", []) or [])


def journal_issns(record: dict[str, Any]) -> list[str]:
    bib = journal_bib(record)
    return unique_preserve_order([bib.get("pissn", ""), bib.get("eissn", "")])


def journal_last_updated(record: dict[str, Any]) -> str | None:
    return record.get("last_updated")


def article_title(record: dict[str, Any]) -> str:
    return str(article_bib(record).get("title") or "").strip()


def article_year(record: dict[str, Any]) -> str | None:
    return year_from_date(str(article_bib(record).get("year") or "").strip())


def article_subject_terms(record: dict[str, Any]) -> list[str]:
    subjects = article_bib(record).get("subject", []) or []
    return unique_preserve_order(str(item.get("term") or "").strip() for item in subjects if item.get("term"))


def article_keywords(record: dict[str, Any]) -> list[str]:
    return unique_preserve_order(article_bib(record).get("keywords", []) or [])


def article_journal_title(record: dict[str, Any]) -> str:
    return str(article_bib(record).get("journal", {}).get("title") or "").strip()


def article_journal_publisher(record: dict[str, Any]) -> str:
    return str(article_bib(record).get("journal", {}).get("publisher") or "").strip()


def article_journal_languages(record: dict[str, Any]) -> list[str]:
    return unique_preserve_order(article_bib(record).get("journal", {}).get("language", []) or [])


def article_journal_issns(record: dict[str, Any]) -> list[str]:
    return unique_preserve_order(article_bib(record).get("journal", {}).get("issns", []) or [])


def article_authors(record: dict[str, Any]) -> list[dict[str, str]]:
    authors = article_bib(record).get("author", []) or []
    cleaned: list[dict[str, str]] = []
    for item in authors:
        cleaned.append(
            {
                "name": str(item.get("name") or "").strip(),
                "affiliation": str(item.get("affiliation") or "").strip(),
            }
        )
    return cleaned


def article_affiliations(record: dict[str, Any]) -> list[str]:
    return unique_preserve_order(
        author.get("affiliation", "").strip() for author in article_authors(record) if author.get("affiliation")
    )


def article_abstract(record: dict[str, Any]) -> str:
    return str(article_bib(record).get("abstract") or "").strip()


def article_identifiers(record: dict[str, Any]) -> dict[str, str]:
    identifiers = article_bib(record).get("identifier", []) or []
    mapped: dict[str, str] = {}
    for item in identifiers:
        identifier_type = str(item.get("type") or "").strip().lower()
        identifier_value = str(item.get("id") or "").strip()
        if identifier_type and identifier_value:
            mapped[identifier_type] = identifier_value
    return mapped


def dominant_name(values: list[str]) -> str:
    if not values:
        return "-"
    counter = Counter(values)
    return counter.most_common(1)[0][0]


def bool_status(value: bool | None) -> str:
    if value is None:
        return "Unknown"
    return "Yes" if value else "No"


def record_kpi(label: str, value: Any, *, tone: str = "neutral", detail: str | None = None) -> dict[str, Any]:
    return {"label": label, "value": value, "tone": tone, "detail": detail}


def pie_chart(title: str, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {"title": title, "kind": "pie", "items": items}


def bar_chart(title: str, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {"title": title, "kind": "bar", "items": items}


def timeline_chart(title: str, labels: list[str], series: list[dict[str, Any]]) -> dict[str, Any]:
    return {"title": title, "kind": "timeline", "categories": labels, "series": series}


def tag_chart(title: str, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {"title": title, "kind": "tags", "items": items}


def status_panel(title: str, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {"title": title, "kind": "status-panel", "items": items}


def aggregate_years(values: list[str | None]) -> list[dict[str, int]]:
    counter = Counter(value for value in values if value)
    return [{"name": key, "value": counter[key]} for key in sorted(counter.keys())]


def build_publisher_snapshot(name: str, journals: list[dict[str, Any]], articles: list[dict[str, Any]]) -> dict[str, Any]:
    countries = [journal_country(record) for record in journals if journal_country(record)]
    journal_subjects = flatten(journal_subject_terms(record) for record in journals)
    languages = flatten(journal_languages(record) for record in journals) + flatten(
        article_journal_languages(record) for record in articles
    )
    licenses = flatten(journal_license_types(record) for record in journals)
    preservation = flatten(journal_preservation_services(record) for record in journals)
    pid_schemes = flatten(journal_pid_schemes(record) for record in journals)
    article_journal_counts = Counter(article_journal_title(record) for record in articles if article_journal_title(record))
    top_journal_counter = Counter()
    for record in journals:
        top_journal_counter[journal_title(record)] += int(journal_bib(record).get("article", {}).get("number", 0) or 0)

    apc_yes = sum(1 for record in journals if bool(journal_bib(record).get("apc", {}).get("has_apc")))
    preservation_yes = sum(
        1 for record in journals if bool(journal_bib(record).get("preservation", {}).get("has_preservation"))
    )
    pid_yes = sum(1 for record in journals if bool(journal_bib(record).get("pid_scheme", {}).get("has_pid_scheme")))

    term_inputs = []
    for record in journals:
        term_inputs.extend([journal_title(record), *journal_keywords(record), *journal_subject_terms(record)])
    for record in articles:
        term_inputs.extend([article_title(record), article_abstract(record), *article_keywords(record), *article_subject_terms(record)])
    terms = top_terms(term_inputs, limit=14)

    recent_months = Counter()
    for record in journals:
        bucket = month_bucket(journal_last_updated(record))
        if bucket:
            recent_months[bucket] += 1
    article_years = Counter(article_year(record) for record in articles if article_year(record))
    timeline_labels = sorted(unique_preserve_order([*recent_months.keys(), *article_years.keys()]))

    missing_signals: list[str] = []
    if not preservation:
        missing_signals.append("preservation services")
    if not pid_schemes:
        missing_signals.append("persistent identifiers")
    if not licenses:
        missing_signals.append("license metadata")

    snapshot = {
        "entity_type": "publisher",
        "entity_key": slugify(name),
        "title": name,
        "source_scope": {
            "live_api": True,
            "fulltext_enriched": False,
            "journal_count": len(journals),
            "article_count": len(articles),
        },
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "publisher_name": name,
            "countries": unique_preserve_order(countries),
            "languages": unique_preserve_order(languages),
            "dominant_license": dominant_name(licenses),
            "top_subjects": top_counter_items(Counter(journal_subjects), 8),
        },
        "kpis": [
            record_kpi("Total journals", compact_number(len(journals)), tone="accent"),
            record_kpi("Total related articles", compact_number(len(articles)), tone="accent"),
            record_kpi("Publisher countries", compact_number(len(unique_preserve_order(countries)))),
            record_kpi("Languages", compact_number(len(unique_preserve_order(languages)))),
            record_kpi("Dominant license", dominant_name(licenses)),
            record_kpi("APC share", f"{percent(apc_yes, len(journals))}%"),
            record_kpi("Preservation coverage", f"{percent(preservation_yes, len(journals))}%"),
            record_kpi("PID coverage", f"{percent(pid_yes, len(journals))}%"),
            record_kpi("Most recent update", max((journal_last_updated(record) or "" for record in journals), default="-")),
        ],
        "charts": {
            "journals_by_country": bar_chart("Journals by country", top_counter_items(Counter(countries), 12)),
            "journals_by_subject": bar_chart("Journals by subject", top_counter_items(Counter(journal_subjects), 12)),
            "related_articles_by_journal": bar_chart(
                "Related articles by journal", top_counter_items(article_journal_counts, 12)
            ),
            "language_distribution": pie_chart("Language distribution", top_counter_items(Counter(languages), 12)),
            "license_distribution": pie_chart("License distribution", top_counter_items(Counter(licenses), 8)),
            "apc_mix": pie_chart(
                "APC vs no APC",
                [
                    {"name": "APC", "value": apc_yes},
                    {"name": "No APC", "value": max(len(journals) - apc_yes, 0)},
                ],
            ),
            "preservation_services": bar_chart(
                "Preservation service distribution", top_counter_items(Counter(preservation), 10)
            ),
            "pid_schemes": bar_chart("PID scheme distribution", top_counter_items(Counter(pid_schemes), 10)),
            "recency_timeline": timeline_chart(
                "Journal and article recency timeline",
                timeline_labels,
                [
                    {
                        "name": "Journals updated",
                        "data": [recent_months.get(label, 0) for label in timeline_labels],
                    },
                    {
                        "name": "Articles by year",
                        "data": [article_years.get(label, 0) for label in timeline_labels],
                    },
                ],
            ),
        },
        "narratives": {
            "profile_summary": f"{name} currently surfaces {len(journals)} journals and {len(articles)} related articles in the DOAJ portfolio view.",
            "top_journals": [name for name, _value in top_journal_counter.most_common(5)],
            "topic_summary": build_theme_summary(name, terms, len(journals) + len(articles)),
            "metadata_gaps": build_completeness_note(
                missing_signals,
                ["licenses", "languages", "subjects", "article relationships"],
            ),
        },
        "related_entities": {
            "journals": [
                {
                    "id": record.get("id"),
                    "title": journal_title(record),
                    "publisher": journal_publisher_name(record),
                    "country": journal_country(record),
                }
                for record in journals[:20]
            ],
            "articles": [
                {
                    "id": record.get("id"),
                    "title": article_title(record),
                    "journal_title": article_journal_title(record),
                    "year": article_year(record),
                }
                for record in articles[:20]
            ],
        },
        "diagnostics": {
            "warnings": [],
            "top_terms": terms,
        },
    }
    return snapshot


def build_journal_snapshot(record: dict[str, Any], articles: list[dict[str, Any]]) -> dict[str, Any]:
    bib = journal_bib(record)
    licenses = journal_license_types(record)
    subjects = journal_subject_terms(record)
    review = journal_review_processes(record)
    languages = journal_languages(record)
    affiliations = flatten(article_affiliations(article) for article in articles)
    article_subjects = flatten(article_subject_terms(article) for article in articles)
    article_terms = top_terms(
        [article_title(article) for article in articles]
        + [article_abstract(article) for article in articles]
        + flatten(article_keywords(article) for article in articles),
        limit=14,
    )
    years = Counter(article_year(article) for article in articles if article_year(article))
    created_years = Counter(
        year_from_date(article.get("created_date")) for article in articles if year_from_date(article.get("created_date"))
    )
    timeline_labels = sorted(unique_preserve_order([*years.keys(), *created_years.keys(), year_from_date(record.get("last_updated")) or ""]))
    missing_signals: list[str] = []
    if not affiliations:
        missing_signals.append("author affiliations")
    if not article_subjects:
        missing_signals.append("article subject classifications")
    if not review:
        missing_signals.append("review process detail")

    snapshot = {
        "entity_type": "journal",
        "entity_key": str(record.get("id") or slugify(journal_title(record))),
        "title": journal_title(record),
        "source_scope": {
            "live_api": True,
            "fulltext_enriched": False,
            "article_count": len(articles),
        },
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "journal_title": journal_title(record),
            "publisher_name": journal_publisher_name(record),
            "country": journal_country(record),
            "issns": journal_issns(record),
            "languages": languages,
            "licenses": licenses,
            "subjects": subjects,
            "review_process": review,
        },
        "kpis": [
            record_kpi("Journal title", journal_title(record), tone="accent"),
            record_kpi("Publisher", journal_publisher_name(record)),
            record_kpi("ISSN / EISSN presence", bool_status(bool([issn for issn in journal_issns(record) if issn]))),
            record_kpi("Total related articles", compact_number(len(articles)), tone="accent"),
            record_kpi("Subject count", compact_number(len(subjects))),
            record_kpi("Language set", ", ".join(languages) or "-"),
            record_kpi("License type", ", ".join(licenses) or "-"),
            record_kpi("APC status", bool_status(bool(bib.get("apc", {}).get("has_apc")))),
            record_kpi("Preservation status", bool_status(bool(bib.get("preservation", {}).get("has_preservation")))),
            record_kpi("PID status", bool_status(bool(bib.get("pid_scheme", {}).get("has_pid_scheme")))),
            record_kpi("Review process", ", ".join(review) or "-"),
            record_kpi("Last updated", record.get("last_updated") or "-"),
        ],
        "charts": {
            "articles_by_year": bar_chart("Articles by publication year", aggregate_years([article_year(article) for article in articles])),
            "article_subjects": bar_chart("Article subjects distribution", top_counter_items(Counter(article_subjects), 12)),
            "article_keywords": tag_chart("Article keywords and top terms", article_terms),
            "article_languages": pie_chart(
                "Article language distribution", top_counter_items(Counter(flatten(article_journal_languages(article) for article in articles)), 8)
            ),
            "author_count_distribution": bar_chart(
                "Author count distribution",
                top_counter_items(Counter(str(len(article_authors(article))) for article in articles), 8),
            ),
            "top_affiliations": bar_chart("Top affiliations", top_counter_items(Counter(affiliations), 10)),
            "status_panel": status_panel(
                "License / APC / preservation / PID status panel",
                [
                    {"label": "License", "value": ", ".join(licenses) or "Unknown"},
                    {"label": "APC", "value": bool_status(bool(bib.get("apc", {}).get("has_apc")))},
                    {"label": "Preservation", "value": bool_status(bool(bib.get("preservation", {}).get("has_preservation")))},
                    {"label": "PID", "value": bool_status(bool(bib.get("pid_scheme", {}).get("has_pid_scheme")))},
                ],
            ),
            "update_timeline": timeline_chart(
                "Update recency timeline",
                timeline_labels,
                [
                    {"name": "Articles by year", "data": [years.get(label, 0) for label in timeline_labels]},
                    {"name": "Articles created", "data": [created_years.get(label, 0) for label in timeline_labels]},
                    {
                        "name": "Journal updates",
                        "data": [1 if label == year_from_date(record.get("last_updated")) else 0 for label in timeline_labels],
                    },
                ],
            ),
        },
        "narratives": {
            "profile_summary": f"{journal_title(record)} is published by {journal_publisher_name(record)} and currently resolves to {len(articles)} related article records in this dashboard view.",
            "topic_summary": build_theme_summary(journal_title(record), article_terms, len(articles)),
            "metadata_gaps": build_completeness_note(
                missing_signals,
                ["licenses", "subjects", "article counts", "languages"],
            ),
            "recent_activity": f"The latest journal update visible in the current metadata is {record.get('last_updated') or 'unknown'}.",
        },
        "related_entities": {
            "articles": [
                {
                    "id": article.get("id"),
                    "title": article_title(article),
                    "year": article_year(article),
                    "authors": len(article_authors(article)),
                }
                for article in articles[:25]
            ]
        },
        "diagnostics": {
            "warnings": [],
            "top_terms": article_terms,
        },
    }
    return snapshot


def build_article_snapshot(record: dict[str, Any]) -> dict[str, Any]:
    identifiers = article_identifiers(record)
    authors = article_authors(record)
    affiliations = article_affiliations(record)
    subjects = article_subject_terms(record)
    keywords = article_keywords(record)
    terms = top_terms([article_title(record), article_abstract(record), *keywords], limit=12)
    snapshot = {
        "entity_type": "article",
        "entity_key": str(record.get("id") or slugify(article_title(record))),
        "title": article_title(record),
        "source_scope": {
            "live_api": True,
            "fulltext_enriched": False,
        },
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "article_title": article_title(record),
            "journal_title": article_journal_title(record),
            "publisher_name": article_journal_publisher(record),
            "year": article_year(record),
            "doi": identifiers.get("doi"),
            "issns": article_journal_issns(record),
            "abstract": article_abstract(record),
            "authors": authors,
            "affiliations": affiliations,
        },
        "kpis": [
            record_kpi("Article year", article_year(record) or "-"),
            record_kpi("Journal", article_journal_title(record), tone="accent"),
            record_kpi("Publisher", article_journal_publisher(record)),
            record_kpi("Author count", compact_number(len(authors))),
            record_kpi("Subject count", compact_number(len(subjects))),
            record_kpi("DOI", identifiers.get("doi") or "-"),
        ],
        "charts": {
            "keyword_emphasis": tag_chart("Keyword emphasis", top_counter_items(Counter(keywords), 10) or terms),
            "subject_tags": pie_chart("Subject tag distribution", top_counter_items(Counter(subjects), 8)),
            "author_affiliations": bar_chart("Author affiliations", top_counter_items(Counter(affiliations), 8)),
        },
        "narratives": {
            "profile_summary": f"{article_title(record)} is presented as a lightweight article view connected to {article_journal_title(record)}.",
            "topic_summary": build_theme_summary(article_title(record), terms, 1),
            "metadata_gaps": build_completeness_note(
                [signal for signal, present in [("abstract", bool(article_abstract(record))), ("affiliations", bool(affiliations))] if not present],
                ["title", "journal context", "identifier metadata"],
            ),
        },
        "related_entities": {
            "journal": {
                "title": article_journal_title(record),
                "publisher": article_journal_publisher(record),
                "issns": article_journal_issns(record),
            }
        },
        "diagnostics": {
            "warnings": [],
            "top_terms": terms,
        },
    }
    return snapshot


def match_publisher_records(records: list[dict[str, Any]], publisher_name: str, *, article_mode: bool = False) -> list[dict[str, Any]]:
    target = normalize_text(publisher_name)
    matched: list[dict[str, Any]] = []
    for record in records:
        candidate = article_journal_publisher(record) if article_mode else journal_publisher_name(record)
        if normalize_text(candidate) == target:
            matched.append(record)
    return matched


def resolve_journal_record(records: list[dict[str, Any]], target: SnapshotTarget) -> dict[str, Any] | None:
    match_title = normalize_text(target.match_title or target.title or target.query)
    match_issn = normalize_text(target.match_issn)
    for record in records:
        if match_title and normalize_text(journal_title(record)) == match_title:
            return record
        if match_issn and match_issn in [normalize_text(value) for value in journal_issns(record)]:
            return record
    return records[0] if records else None


def resolve_article_record(records: list[dict[str, Any]], target: SnapshotTarget) -> dict[str, Any] | None:
    match_title = normalize_text(target.match_title or target.title or target.query)
    match_doi = normalize_text(target.match_doi)
    for record in records:
        identifiers = article_identifiers(record)
        if match_doi and normalize_text(identifiers.get("doi")) == match_doi:
            return record
        if match_title and normalize_text(article_title(record)) == match_title:
            return record
    return records[0] if records else None


def filter_articles_for_journal(articles: list[dict[str, Any]], record: dict[str, Any]) -> list[dict[str, Any]]:
    target_title = normalize_text(journal_title(record))
    target_issns = {normalize_text(value) for value in journal_issns(record) if value}
    matched: list[dict[str, Any]] = []
    for article in articles:
        article_title_match = normalize_text(article_journal_title(article)) == target_title
        article_issn_match = bool(target_issns.intersection({normalize_text(value) for value in article_journal_issns(article)}))
        if article_title_match or article_issn_match:
            matched.append(article)
    return matched


def build_snapshots(
    *,
    config_path: Path,
    output_dir: Path,
    api_client: DoajApiClient | None = None,
    dump_client: DoajDumpClient | None = None,
) -> dict[str, Any]:
    defaults, targets = load_snapshot_targets(config_path)
    api = api_client or DoajApiClient()
    dump = dump_client or DoajDumpClient()
    generated_at = datetime.now(timezone.utc).isoformat()
    output_dir.mkdir(parents=True, exist_ok=True)

    summaries: list[dict[str, Any]] = []
    warnings: list[str] = []

    for target in targets:
        entity_type = target.entity_type
        if entity_type not in {"publisher", "journal", "article"}:
            warnings.append(f"Unsupported entity type in target: {entity_type}")
            continue

        try:
            if entity_type == "publisher":
                journal_search = api.search(
                    "journals",
                    target.query,
                    page_size=int(defaults.get("publisher_page_size", 50)),
                    max_pages=int(defaults.get("publisher_max_pages", 3)),
                    max_records=int(defaults.get("publisher_max_journals", 150)),
                )
                article_search = api.search(
                    "articles",
                    target.query,
                    page_size=int(defaults.get("publisher_page_size", 50)),
                    max_pages=int(defaults.get("publisher_max_pages", 3)),
                    max_records=int(defaults.get("publisher_max_articles", 300)),
                )
                journals = match_publisher_records(journal_search.results, target.title)
                articles = match_publisher_records(article_search.results, target.title, article_mode=True)
                snapshot = build_publisher_snapshot(target.title, journals, articles)
            elif entity_type == "journal":
                journal_search = api.search(
                    "journals",
                    target.query,
                    page_size=int(defaults.get("journal_page_size", 50)),
                    max_pages=int(defaults.get("journal_max_pages", 3)),
                    max_records=50,
                )
                journal_record = resolve_journal_record(journal_search.results, target)
                if not journal_record:
                    warnings.append(f"No journal record resolved for target: {target.title}")
                    continue
                article_search = api.search(
                    "articles",
                    journal_title(journal_record),
                    page_size=int(defaults.get("journal_page_size", 50)),
                    max_pages=int(defaults.get("journal_max_pages", 3)),
                    max_records=int(defaults.get("journal_max_articles", 250)),
                )
                related_articles = filter_articles_for_journal(article_search.results, journal_record)
                snapshot = build_journal_snapshot(journal_record, related_articles)
            else:
                article_search = api.search(
                    "articles",
                    target.query,
                    page_size=int(defaults.get("article_page_size", 25)),
                    max_pages=int(defaults.get("article_max_pages", 2)),
                    max_records=50,
                )
                article_record = resolve_article_record(article_search.results, target)
                if not article_record:
                    warnings.append(f"No article record resolved for target: {target.title}")
                    continue
                snapshot = build_article_snapshot(article_record)
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"Failed to build {entity_type}:{target.title}: {exc}")
            continue

        entity_key = str(snapshot["entity_key"])
        snapshot_path = output_dir / entity_type / f"{entity_key}.json"
        write_json(snapshot_path, snapshot)
        summaries.append(
            {
                "entity_type": entity_type,
                "entity_key": entity_key,
                "title": snapshot["title"],
                "snapshot_path": f"data/snapshots/{entity_type}/{entity_key}.json",
                "fetched_at": snapshot["fetched_at"],
                "source_scope": snapshot["source_scope"],
                "subtitle": snapshot["narratives"].get("profile_summary"),
            }
        )

    index_payload = {
        "generated_at": generated_at,
        "items": sorted(summaries, key=lambda item: (item["entity_type"], item["title"].lower())),
    }
    write_json(output_dir / "index.json", index_payload)

    meta_payload = {
        "generated_at": generated_at,
        "snapshot_count": len(summaries),
        "targets_path": str(config_path),
        "source_summary": {
            "live_api": True,
            "dump_probe": dump.probe(),
        },
        "warnings": warnings,
    }
    return {"index": index_payload, "meta": meta_payload}
