#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
META_PATH = ROOT / "docs" / "data" / "meta.json"
INDEX_PATH = ROOT / "docs" / "data" / "snapshots" / "index.json"
STATISTICS_SUMMARY_PATH = ROOT / "docs" / "data" / "statistics" / "summary.json"
STATISTICS_JOURNALS_PATH = ROOT / "docs" / "data" / "statistics" / "journals.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def validate() -> None:
    if not META_PATH.exists():
        raise SystemExit(f"Missing meta JSON: {META_PATH}")
    if not INDEX_PATH.exists():
        raise SystemExit(f"Missing snapshot index JSON: {INDEX_PATH}")
    if not STATISTICS_SUMMARY_PATH.exists():
        raise SystemExit(f"Missing statistics summary JSON: {STATISTICS_SUMMARY_PATH}")
    if not STATISTICS_JOURNALS_PATH.exists():
        raise SystemExit(f"Missing statistics journals JSON: {STATISTICS_JOURNALS_PATH}")

    meta = load_json(META_PATH)
    index = load_json(INDEX_PATH)
    statistics_summary = load_json(STATISTICS_SUMMARY_PATH)
    statistics_journals = load_json(STATISTICS_JOURNALS_PATH)

    for key in ("generated_at", "snapshot_count", "source_summary", "warnings"):
        if key not in meta:
            raise SystemExit(f"meta.json missing required key: {key}")

    if "items" not in index or not isinstance(index["items"], list):
        raise SystemExit("snapshot index must contain an items list")

    for item in index["items"]:
        for key in ("entity_type", "entity_key", "title", "snapshot_path", "fetched_at", "source_scope"):
            if key not in item:
                raise SystemExit(f"snapshot index item missing key: {key}")
        snapshot_path = ROOT / "docs" / item["snapshot_path"].replace("data/", "data/", 1)
        if not snapshot_path.exists():
            raise SystemExit(f"snapshot file referenced in index does not exist: {snapshot_path}")
        snapshot = load_json(snapshot_path)
        for key in ("entity_type", "entity_key", "title", "fetched_at", "metadata", "kpis", "charts", "narratives"):
            if key not in snapshot:
                raise SystemExit(f"snapshot file missing key {key}: {snapshot_path}")

    for key in ("generated_at", "source_scope", "query", "refresh_interval_hours", "journal_total", "article_total", "filters", "kpis", "charts", "fx", "table_defaults", "warnings"):
        if key not in statistics_summary:
            raise SystemExit(f"statistics summary missing required key: {key}")

    for key in ("generated_at", "query", "item_count", "items"):
        if key not in statistics_journals:
            raise SystemExit(f"statistics journals JSON missing required key: {key}")

    if not isinstance(statistics_journals["items"], list):
        raise SystemExit("statistics journals JSON items must be a list")

    if int(statistics_summary["journal_total"]) != int(statistics_journals["item_count"]):
        raise SystemExit("statistics summary journal_total must match statistics journals item_count")

    expected_charts = {
        "top_subjects_by_country",
        "apc_distribution",
        "author_retains_copyright",
        "top_countries",
        "journals_by_continent",
        "top_languages",
        "top_subjects",
        "license_usage",
        "top_peer_review",
        "top_pid_schemes",
        "top_preservation_services",
        "top_publishers",
        "journals_added_timeline",
        "top_country_apc_eur",
        "country_map",
    }
    if not expected_charts.issubset(set(statistics_summary["charts"].keys())):
        raise SystemExit("statistics summary charts are missing one or more required chart keys")

    required_row_keys = {
        "id",
        "title",
        "publisher_name",
        "country",
        "continent",
        "subjects",
        "languages",
        "license_types",
        "apc_has",
        "apc_max_eur",
        "apc_max_usd",
        "author_retains",
        "peer_review_types",
        "pid_schemes",
        "preservation_services",
        "created_date",
        "created_year",
        "last_updated",
        "website",
        "author_guidelines_url",
        "article_records_exposed",
        "search_text",
    }
    for row in statistics_journals["items"][:50]:
        missing = required_row_keys.difference(row.keys())
        if missing:
            raise SystemExit(f"statistics journal row missing required keys: {sorted(missing)}")


if __name__ == "__main__":
    validate()
