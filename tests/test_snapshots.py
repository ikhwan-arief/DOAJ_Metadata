from __future__ import annotations

import unittest

from doaj_metadata_dashboard.snapshots import (
    build_article_snapshot,
    build_journal_snapshot,
    build_publisher_snapshot,
    filter_articles_for_journal,
)


JOURNAL_RECORD = {
    "id": "journal-1",
    "last_updated": "2026-03-03T11:42:49Z",
    "bibjson": {
        "title": "Jurnal Kepariwisataan",
        "pissn": "2477-3808",
        "eissn": "2721-4753",
        "language": ["EN", "ID"],
        "keywords": ["tourism", "travel", "culture"],
        "publisher": {"name": "Politeknik Pariwisata NHI Bandung", "country": "ID"},
        "subject": [{"term": "Recreation. Leisure"}],
        "license": [{"type": "CC BY-SA"}],
        "apc": {"has_apc": False},
        "preservation": {"has_preservation": False},
        "pid_scheme": {"has_pid_scheme": True, "scheme": ["DOI"]},
        "editorial": {"review_process": ["Double anonymous peer review"]},
    },
}

ARTICLE_RECORDS = [
    {
        "id": "article-1",
        "created_date": "2024-01-10T12:00:00Z",
        "bibjson": {
            "title": "Cultural Route Design for Heritage Tourism",
            "year": "2024",
            "abstract": "Heritage tourism and route design are analysed through visitor experience.",
            "keywords": ["heritage", "tourism", "route"],
            "subject": [{"term": "Hospitality"}],
            "journal": {
                "title": "Jurnal Kepariwisataan",
                "publisher": "Politeknik Pariwisata NHI Bandung",
                "language": ["EN", "ID"],
                "issns": ["2477-3808", "2721-4753"],
            },
            "author": [
                {"name": "Author A", "affiliation": "Universitas A"},
                {"name": "Author B", "affiliation": "Universitas B"},
            ],
            "identifier": [{"type": "doi", "id": "10.0000/example-1"}],
        },
    },
    {
        "id": "article-2",
        "created_date": "2025-06-03T12:00:00Z",
        "bibjson": {
            "title": "Travel Behavior in Culinary Destinations",
            "year": "2025",
            "abstract": "Destination choice and culinary travel behavior are explored.",
            "keywords": ["culinary", "travel"],
            "subject": [{"term": "Tourism"}],
            "journal": {
                "title": "Jurnal Kepariwisataan",
                "publisher": "Politeknik Pariwisata NHI Bandung",
                "language": ["EN"],
                "issns": ["2477-3808"],
            },
            "author": [{"name": "Author C", "affiliation": "Universitas A"}],
            "identifier": [{"type": "doi", "id": "10.0000/example-2"}],
        },
    },
]


class SnapshotTests(unittest.TestCase):
    def test_filter_articles_for_journal_matches_title_and_issn(self) -> None:
        matched = filter_articles_for_journal(ARTICLE_RECORDS, JOURNAL_RECORD)
        self.assertEqual(len(matched), 2)

    def test_build_publisher_snapshot_has_required_sections(self) -> None:
        snapshot = build_publisher_snapshot(
            "Politeknik Pariwisata NHI Bandung",
            [JOURNAL_RECORD],
            ARTICLE_RECORDS,
        )
        self.assertEqual(snapshot["entity_type"], "publisher")
        self.assertEqual(snapshot["entity_key"], "politeknik-pariwisata-nhi-bandung")
        self.assertTrue(snapshot["kpis"])
        self.assertIn("journals_by_country", snapshot["charts"])
        self.assertIn("topic_summary", snapshot["narratives"])

    def test_build_journal_snapshot_has_status_panel(self) -> None:
        snapshot = build_journal_snapshot(JOURNAL_RECORD, ARTICLE_RECORDS)
        self.assertEqual(snapshot["entity_type"], "journal")
        self.assertIn("status_panel", snapshot["charts"])
        self.assertEqual(snapshot["metadata"]["publisher_name"], "Politeknik Pariwisata NHI Bandung")

    def test_build_article_snapshot_is_lightweight(self) -> None:
        snapshot = build_article_snapshot(ARTICLE_RECORDS[0])
        self.assertEqual(snapshot["entity_type"], "article")
        self.assertIn("keyword_emphasis", snapshot["charts"])
        self.assertEqual(snapshot["metadata"]["journal_title"], "Jurnal Kepariwisataan")


if __name__ == "__main__":
    unittest.main()

