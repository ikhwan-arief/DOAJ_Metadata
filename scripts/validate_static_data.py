#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
META_PATH = ROOT / "docs" / "data" / "meta.json"
INDEX_PATH = ROOT / "docs" / "data" / "snapshots" / "index.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def validate() -> None:
    if not META_PATH.exists():
        raise SystemExit(f"Missing meta JSON: {META_PATH}")
    if not INDEX_PATH.exists():
        raise SystemExit(f"Missing snapshot index JSON: {INDEX_PATH}")

    meta = load_json(META_PATH)
    index = load_json(INDEX_PATH)

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


if __name__ == "__main__":
    validate()

