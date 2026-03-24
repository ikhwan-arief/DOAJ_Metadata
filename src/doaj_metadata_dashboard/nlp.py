from __future__ import annotations

import re
from collections import Counter
from typing import Iterable

from .utils import normalize_text

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "into",
    "is",
    "it",
    "journal",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "this",
    "to",
    "using",
    "with",
}


def tokenize(text: str) -> list[str]:
    normalized = normalize_text(text)
    if not normalized:
        return []
    return [
        token
        for token in re.split(r"\s+", normalized)
        if len(token) > 2 and token not in STOPWORDS and not token.isdigit()
    ]


def top_terms(texts: Iterable[str], limit: int = 12) -> list[dict[str, int]]:
    counter: Counter[str] = Counter()
    for text in texts:
        counter.update(tokenize(text))
    return [{"name": term, "value": count} for term, count in counter.most_common(limit)]


def sentence_case(value: str) -> str:
    stripped = value.strip()
    if not stripped:
        return ""
    return stripped[0].upper() + stripped[1:]


def build_theme_summary(scope_name: str, terms: list[dict[str, int]], coverage_count: int) -> str:
    if not terms:
        return f"{scope_name} does not yet expose enough textual metadata for a stable topic summary."
    focus_terms = ", ".join(item["name"] for item in terms[:5])
    return sentence_case(
        f"{scope_name} is currently anchored by {coverage_count} metadata-rich records, with dominant terms around {focus_terms}."
    )


def build_completeness_note(missing_signals: list[str], available_signals: list[str]) -> str:
    if not missing_signals:
        available = ", ".join(available_signals[:4]) if available_signals else "core metadata"
        return sentence_case(f"Metadata coverage is strong across {available}.")
    missing = ", ".join(missing_signals[:4])
    return sentence_case(f"Metadata gaps remain in {missing}, so some charts rely on partial evidence.")

