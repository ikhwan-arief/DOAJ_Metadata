from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, quote, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen


API_BASE = os.environ.get("DOAJ_API_BASE", "https://doaj.org/api/search")

DEFAULT_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "doaj-metadata-dashboard/0.1",
}


def inject_doaj_api_key(url: str, api_key: str | None = None) -> str:
    token = (api_key or "").strip()
    if not token:
        return url

    parsed = urlsplit(url)
    host = parsed.netloc.lower()
    if "doaj.org" not in host:
        return url

    if not (parsed.path.startswith("/api/") or parsed.path == "/csv"):
        return url

    query_items = parse_qsl(parsed.query, keep_blank_values=True)
    if any(key == "api_key" for key, _ in query_items):
        return url

    query_items.append(("api_key", token))
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query_items), parsed.fragment))


def sanitize_url(url: str) -> str:
    parsed = urlsplit(url)
    query_items = [(key, "***" if key == "api_key" else value) for key, value in parse_qsl(parsed.query, keep_blank_values=True)]
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query_items), parsed.fragment))


def read_json(
    url: str,
    *,
    headers: dict[str, str] | None = None,
    retries: int = 3,
    timeout: int = 45,
    api_key: str | None = None,
) -> dict[str, Any]:
    resolved_url = inject_doaj_api_key(url, api_key=api_key)
    safe_url = sanitize_url(resolved_url)
    merged_headers = {**DEFAULT_HEADERS, **(headers or {})}
    last_error: Exception | None = None
    for attempt in range(retries):
        request = Request(resolved_url, headers=merged_headers, method="GET")
        try:
            with urlopen(request, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            last_error = exc
            if exc.code not in {429, 500, 502, 503, 504} or attempt == retries - 1:
                raise RuntimeError(f"Unable to load JSON from {safe_url}: HTTP {exc.code}") from exc
            time.sleep(0.8 * (attempt + 1))
        except URLError as exc:
            last_error = exc
            if attempt == retries - 1:
                raise RuntimeError(f"Unable to load JSON from {safe_url}: {exc.reason}") from exc
            time.sleep(0.8 * (attempt + 1))
    raise RuntimeError(f"Unable to load JSON from {safe_url}: {last_error}")


def fetch_status(url: str, *, headers: dict[str, str] | None = None, timeout: int = 45) -> int:
    request = Request(url, headers={**DEFAULT_HEADERS, **(headers or {})}, method="GET")
    with urlopen(request, timeout=timeout) as response:
        return response.status


@dataclass
class SearchResult:
    query: str
    entity: str
    total: int
    results: list[dict[str, Any]]
    capped: bool
    pages_fetched: int


class DoajApiClient:
    def __init__(self, *, api_key: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("DOAJ_API_KEY")

    def search(
        self,
        entity: str,
        query: str,
        *,
        page_size: int = 25,
        max_pages: int = 2,
        max_records: int = 100,
    ) -> SearchResult:
        page = 1
        results: list[dict[str, Any]] = []
        total = 0
        encoded_query = quote(query, safe="")

        while page <= max_pages and len(results) < max_records:
            url = f"{API_BASE}/{entity}/{encoded_query}?page={page}&pageSize={page_size}"
            payload = read_json(url, api_key=self.api_key)
            total = int(payload.get("total", 0) or 0)
            page_results = payload.get("results", [])
            if not isinstance(page_results, list):
                break
            results.extend(page_results)
            if not payload.get("next"):
                break
            page += 1

        capped = total > len(results)
        return SearchResult(
            query=query,
            entity=entity,
            total=total,
            results=results[:max_records],
            capped=capped,
            pages_fetched=page,
        )


class DoajDumpClient:
    def __init__(
        self,
        *,
        token: str | None = None,
        auth_header: str | None = None,
        auth_scheme: str | None = None,
        journal_url: str | None = None,
        article_url: str | None = None,
    ) -> None:
        self.token = token or os.environ.get("DOAJ_DUMP_TOKEN")
        self.auth_header = auth_header or os.environ.get("DOAJ_DUMP_AUTH_HEADER", "Authorization")
        self.auth_scheme = auth_scheme or os.environ.get("DOAJ_DUMP_AUTH_SCHEME", "Bearer")
        self.journal_url = journal_url or os.environ.get(
            "DOAJ_DUMP_JOURNAL_URL", "https://doaj.org/public-data-dump/journal"
        )
        self.article_url = article_url or os.environ.get(
            "DOAJ_DUMP_ARTICLE_URL", "https://doaj.org/public-data-dump/article"
        )

    @property
    def configured(self) -> bool:
        return bool(self.token)

    def _headers(self) -> dict[str, str]:
        if not self.token:
            return {}
        return {self.auth_header: f"{self.auth_scheme} {self.token}"}

    def probe(self) -> dict[str, Any]:
        result = {
            "configured": self.configured,
            "journal_status": None,
            "article_status": None,
            "journal_url": self.journal_url,
            "article_url": self.article_url,
            "used": False,
        }
        if not self.configured:
            return result
        headers = self._headers()
        for label, url in (("journal_status", self.journal_url), ("article_status", self.article_url)):
            try:
                result[label] = fetch_status(url, headers=headers)
                result["used"] = True
            except (HTTPError, URLError) as exc:
                result[label] = f"error:{exc.__class__.__name__}"
        return result
