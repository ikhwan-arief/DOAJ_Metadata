# DOAJ Metadata Intelligence Dashboard

Public GitHub Pages dashboard for exploring DOAJ journal, publisher, and article metadata.

## What this project does

- serves a static dashboard from `docs/`,
- searches DOAJ journal and article endpoints directly from the browser,
- renders KPI-first dashboards for publishers and journals,
- renders a lighter interpretation-focused dashboard for articles,
- uses Python scripts in GitHub Actions to generate optional snapshot enrichments in `docs/data/`.

## Repository layout

- `docs/`
  Static site published to GitHub Pages.
- `docs/data/`
  Generated metadata and precomputed snapshots.
- `config/snapshot_targets.json`
  Tracked publisher, journal, and article targets for scheduled enrichment.
- `scripts/refresh_snapshots.py`
  Fetches DOAJ metadata, builds snapshot JSON, and updates `docs/data/**`.
- `scripts/validate_static_data.py`
  Validates the generated static contracts.
- `src/doaj_metadata_dashboard/`
  Shared Python logic for DOAJ fetches, normalization, and snapshot assembly.
- `tests/`
  Network-free unit tests for snapshot generation.

## Live browser search

The frontend calls:

- `https://doaj.org/api/search/journals/{query}`
- `https://doaj.org/api/search/articles/{query}`

Search results are grouped into:

- `Publishers`
- `Journals`
- `Articles`

## Snapshot workflow

The GitHub Actions snapshot workflow:

1. reads `config/snapshot_targets.json`,
2. queries DOAJ live endpoints,
3. optionally probes authenticated dump access if dump secrets are configured,
4. generates chart-ready JSON snapshots under `docs/data/snapshots/`,
5. updates `docs/data/meta.json` and `docs/data/snapshots/index.json`.

## Local development

Install dependencies:

```bash
python3 -m pip install -e .[dev]
```

Refresh snapshots:

```bash
PYTHONPATH=src python3 scripts/refresh_snapshots.py
```

Validate generated data:

```bash
PYTHONPATH=src python3 scripts/validate_static_data.py
```

Run tests:

```bash
PYTHONPATH=src python3 -m unittest discover -s tests -p "test_*.py" -v
```

Serve the site:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/docs/`.

## Secrets

Secrets are only for GitHub Actions. They are never consumed by client-side JavaScript.

Supported optional secrets:

- `DOAJ_DUMP_TOKEN`
- `DOAJ_DUMP_AUTH_HEADER`
- `DOAJ_DUMP_AUTH_SCHEME`
- `DOAJ_DUMP_JOURNAL_URL`
- `DOAJ_DUMP_ARTICLE_URL`

## Notes

- The site works without dump access.
- Dump support is intentionally non-blocking because DOAJ dump authorization may differ across accounts.
- Browser search remains live even when no snapshot exists for an entity.
