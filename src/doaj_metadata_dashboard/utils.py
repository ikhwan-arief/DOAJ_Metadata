from __future__ import annotations

import math
import re
import unicodedata
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Iterable, Sequence


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    folded = "".join(
        ch for ch in unicodedata.normalize("NFKD", value) if not unicodedata.combining(ch)
    )
    lowered = re.sub(r"[^a-z0-9]+", " ", folded.lower())
    return re.sub(r"\s+", " ", lowered).strip()


def slugify(value: str | None) -> str:
    text = normalize_text(value)
    return text.replace(" ", "-") or "unknown"


def unique_preserve_order(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        cleaned = str(value).strip()
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        ordered.append(cleaned)
    return ordered


def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    candidate = value.strip()
    if not candidate:
        return None
    if candidate.endswith("Z"):
        candidate = candidate[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(candidate)
    except ValueError:
        return None


def year_from_date(value: str | None) -> str | None:
    parsed = parse_datetime(value)
    if parsed:
        return str(parsed.year)
    if value and re.fullmatch(r"\d{4}", value.strip()):
        return value.strip()
    return None


def month_bucket(value: str | None) -> str | None:
    parsed = parse_datetime(value)
    if not parsed:
        return None
    return f"{parsed.year:04d}-{parsed.month:02d}"


def percent(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100.0, 1)


def top_counter_items(counter: Counter[str], limit: int = 10) -> list[dict[str, int]]:
    return [{"name": key, "value": value} for key, value in counter.most_common(limit)]


def compact_number(value: int | float | None) -> str:
    if value is None:
        return "-"
    if isinstance(value, float) and math.isnan(value):
        return "-"
    absolute = abs(float(value))
    if absolute >= 1_000_000:
        return f"{value / 1_000_000:.1f}M"
    if absolute >= 1_000:
        return f"{value / 1_000:.1f}K"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        __import__("json").dumps(payload, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8",
    )


def flatten(values: Iterable[Sequence[str]]) -> list[str]:
    flattened: list[str] = []
    for group in values:
        flattened.extend(group)
    return flattened

