from __future__ import annotations

import unittest

from doaj_metadata_dashboard.doaj_api import SearchResult
from doaj_metadata_dashboard.statistics import build_statistics_summary, normalize_journal_row, partition_queries


JOURNAL_RECORD = {
    "id": "journal-1",
    "created_date": "2024-01-10T12:00:00Z",
    "last_updated": "2026-03-03T11:42:49Z",
    "bibjson": {
        "title": "Jurnal Optimasi Sistem Industri",
        "language": ["EN", "ID"],
        "keywords": ["operations", "manufacturing"],
        "publisher": {"name": "Universitas Andalas", "country": "ID"},
        "subject": [{"term": "Industrial engineering"}, {"term": "Management engineering"}],
        "license": [{"type": "CC BY-SA"}],
        "apc": {
            "has_apc": True,
            "max": [
                {"price": 100, "currency": "EUR"},
                {"price": 110, "currency": "USD"},
            ],
        },
        "copyright": {"author_retains": True},
        "editorial": {"review_process": ["Double anonymous peer review"]},
        "pid_scheme": {"scheme": ["DOI"], "has_pid_scheme": True},
        "preservation": {"service": ["LOCKSS"], "has_preservation": True},
        "ref": {"journal": "https://example.org", "author_instructions": "https://example.org/authors"},
    },
}


class StatisticsTests(unittest.TestCase):
    def test_normalize_journal_row_has_expected_fields(self) -> None:
        row = normalize_journal_row(
            JOURNAL_RECORD,
            {
                "EUR": {"EUR": 1.0, "USD": 1.08},
                "USD": {"USD": 1.0, "EUR": 0.92},
            },
        )
        self.assertEqual(row["country"], "ID")
        self.assertEqual(row["continent"], "Asia")
        self.assertTrue(row["apc_has"])
        self.assertEqual(row["apc_max_eur"], 101.2)
        self.assertEqual(row["apc_max_usd"], 110.0)
        self.assertEqual(row["author_guidelines_url"], "https://example.org/authors")

    def test_build_statistics_summary_has_required_sections(self) -> None:
        row = normalize_journal_row(
            JOURNAL_RECORD,
            {
                "EUR": {"EUR": 1.0, "USD": 1.08},
                "USD": {"USD": 1.0, "EUR": 0.92},
            },
        )
        summary = build_statistics_summary(
            [row],
            12479810,
            {"providers": {"Frankfurter API": 2}, "supported_currencies": ["EUR", "USD"], "warnings": []},
            [],
        )
        self.assertEqual(summary["journal_total"], 1)
        self.assertEqual(summary["article_total"], 12479810)
        self.assertIn("top_countries", summary["charts"])
        self.assertIn("country_map", summary["charts"])
        self.assertIn("countries", summary["filters"])

    def test_partition_queries_splits_busy_year_into_months_and_days(self) -> None:
        totals = {
            "created_date:[2026-01-01 TO 2026-12-31]": 1600,
            "created_date:[2026-01-01 TO 2026-01-31]": 900,
            "created_date:[2026-02-01 TO 2026-02-28]": 1400,
            "created_date:[2026-02-01 TO 2026-02-01]": 600,
            "created_date:[2026-02-02 TO 2026-02-02]": 500,
        }

        class FakeClient:
            def search(self, entity, query, *, page_size=1, max_pages=1, max_records=1):
                return SearchResult(
                    query=query,
                    entity=entity,
                    total=totals.get(query, 0),
                    results=[],
                    capped=False,
                    pages_fetched=1,
                )

        queries, warnings = partition_queries(FakeClient(), start_year=2026, end_year=2026)
        self.assertIn("created_date:[2026-01-01 TO 2026-01-31]", queries)
        self.assertIn("created_date:[2026-02-01 TO 2026-02-01]", queries)
        self.assertIn("created_date:[2026-02-02 TO 2026-02-02]", queries)
        self.assertEqual(warnings, [])


if __name__ == "__main__":
    unittest.main()
