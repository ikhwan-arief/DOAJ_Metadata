#!/usr/bin/env python3
"""Local static server for DOAJ Metadata without directory browsing."""

from __future__ import annotations

import argparse
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = REPO_ROOT / "docs"


class NoListingHandler(SimpleHTTPRequestHandler):
    """Serve static files from docs/ and return 404 for directory listings."""

    def list_directory(self, path: str):  # noqa: D401
        self.send_error(HTTPStatus.NOT_FOUND, "Sorry, we don't have that.")
        return None

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the docs/ static app locally without directory browsing."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind. Default: 127.0.0.1")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind. Default: 8000")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    handler = partial(NoListingHandler, directory=str(DOCS_ROOT))
    with ThreadingHTTPServer((args.host, args.port), handler) as server:
        print(f"Serving {DOCS_ROOT} at http://{args.host}:{args.port}/")
        server.serve_forever()


if __name__ == "__main__":
    main()
