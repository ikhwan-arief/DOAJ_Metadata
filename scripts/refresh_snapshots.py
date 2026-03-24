#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from doaj_metadata_dashboard.snapshots import build_snapshots
from doaj_metadata_dashboard.utils import write_json


def main() -> int:
    parser = argparse.ArgumentParser(description="Build DOAJ snapshot JSON files for the static dashboard.")
    parser.add_argument(
        "--config",
        default="config/snapshot_targets.json",
        help="Path to the tracked snapshot target config file.",
    )
    parser.add_argument(
        "--output-dir",
        default="docs/data/snapshots",
        help="Directory for generated snapshot JSON files.",
    )
    parser.add_argument(
        "--meta-path",
        default="docs/data/meta.json",
        help="Path for generated metadata summary JSON.",
    )
    args = parser.parse_args()

    config_path = Path(args.config).resolve()
    output_dir = Path(args.output_dir).resolve()
    meta_path = Path(args.meta_path).resolve()

    result = build_snapshots(config_path=config_path, output_dir=output_dir)
    write_json(meta_path, result["meta"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
