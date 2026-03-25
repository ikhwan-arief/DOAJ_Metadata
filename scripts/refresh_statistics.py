#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from doaj_metadata_dashboard.statistics import build_statistics_dataset
from doaj_metadata_dashboard.utils import write_json


def main() -> int:
    parser = argparse.ArgumentParser(description="Build global DOAJ statistics JSON files from the DOAJ API.")
    parser.add_argument(
        "--summary-path",
        default="docs/data/statistics/summary.json",
        help="Path for the generated statistics summary JSON file.",
    )
    parser.add_argument(
        "--journals-path",
        default="docs/data/statistics/journals.json",
        help="Path for the generated statistics journal table JSON file.",
    )
    args = parser.parse_args()

    payload = build_statistics_dataset()
    write_json(Path(args.summary_path), payload["summary"])
    write_json(Path(args.journals_path), payload["journals"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
