# DOAJ Metadata Intelligence Dashboard

Public GitHub repository and GitHub Pages application for exploring DOAJ metadata for publishers, journals, and articles.

Live application URL:
`https://ikhwan-arief.github.io/DOAJ_Metadata/`

Repository URL:
`https://github.com/ikhwan-arief/DOAJ_Metadata`

Developed by Ikhwan Arief, `ikhwan[at]unand.ac.id`.

License:
CC BY-SA 4.0

Disclaimer: This tool is not officially developed or maintained by DOAJ. Any results from this tool do not constitute an official DOAJ evaluation and must not be cited or represented as a DOAJ decision.

## Overview

This project is a static web application that helps users explore metadata from the Directory of Open Access Journals (DOAJ).

It is an independent application and is not managed by DOAJ. DOAJ remains the sole authority for any inclusion or evaluation decision.

The application is designed for:

- searching journal titles,
- searching publisher names,
- searching article titles,
- opening KPI-first dashboards for publishers,
- opening KPI-first dashboards for journals,
- opening lighter interpretation-focused dashboards for articles.
- running a manual Inclusion Pre-check against DOAJ-facing website requirements and best practice guidance.

The project does **not** require a live backend server.
It is designed to run entirely with:

- static files in `docs/`,
- browser calls to public DOAJ search endpoints,
- Python scripts for optional snapshot enrichment,
- GitHub Actions for automation,
- GitHub Pages for public hosting.

## Public App

The public application is intended to be available at:

`https://ikhwan-arief.github.io/DOAJ_Metadata/`

If the page does not open yet, wait a few minutes after a push to `main` and check the latest `Deploy GitHub Pages` workflow run in the Actions tab.

## Main Features

- Live browser search against DOAJ public journal and article search endpoints.
- Grouped results for `Publishers`, `Journals`, and `Articles`.
- KPI-rich publisher dashboard with portfolio-level charts.
- KPI-rich journal dashboard with metadata and article-profile charts.
- Lightweight article dashboard with metadata, abstract summary, keywords, subjects, and author context.
- Manual Inclusion Pre-check with live Yes/No checklist scoring based on DOAJ guidance pages.
- Published static snapshots for selected entities.
- Optional DOAJ dump probing in GitHub Actions through repository secrets.
- Fully public repository and public static application deployment.

## Data Sources

Primary live search endpoints:

- `https://doaj.org/api/search/journals/{query}`
- `https://doaj.org/api/search/articles/{query}`

Optional authenticated sources for workflow-side enrichment only:

- `https://doaj.org/public-data-dump/journal`
- `https://doaj.org/public-data-dump/article`

Important:

- the frontend never exposes private tokens,
- dump credentials are only intended for GitHub Actions secrets,
- the application still works without dump access.

## What the Application Shows

### Publisher dashboard

The publisher dashboard is designed as a portfolio view.

It includes KPI cards such as:

- total journals,
- total related articles found,
- publisher countries represented,
- languages count,
- dominant license,
- APC share,
- preservation coverage,
- PID coverage,
- most recent update.

It includes chart groups such as:

- journals by country,
- journals by subject,
- related articles by journal,
- language distribution,
- license distribution,
- APC versus no APC,
- preservation service distribution,
- PID scheme distribution,
- journal/article recency timeline.

### Journal dashboard

The journal dashboard is designed as a metadata profile plus article-pattern view.

It includes KPI cards such as:

- journal title and publisher,
- ISSN/EISSN presence,
- total related articles found,
- subject count,
- language set,
- license type,
- APC status,
- preservation status,
- PID status,
- review process,
- last updated.

It includes chart groups such as:

- articles by publication year,
- article subject distribution,
- article keyword and top-term view,
- article language distribution,
- author count distribution,
- top affiliations,
- status panel for license, APC, preservation, and PID,
- update recency timeline.

### Article dashboard

The article dashboard is intentionally lighter in version 1.

It shows:

- article title,
- journal context,
- publisher context,
- year,
- DOI when available,
- abstract,
- authors,
- affiliations,
- keyword emphasis,
- subject tags,
- affiliation summary.

## Repository Structure

- `docs/`
  Static application files published to GitHub Pages.
- `docs/index.html`
  Main public application page.
- `docs/app.js`
  Client-side application logic for live search, entity routing, and dashboard rendering.
- `docs/styles.css`
  Styles for the public application.
- `docs/data/`
  Published static metadata and snapshot JSON.
- `docs/data/meta.json`
  Summary metadata about generated snapshot content.
- `docs/data/snapshots/index.json`
  Published index of tracked snapshots.
- `config/snapshot_targets.json`
  Tracked publishers, journals, or articles for snapshot generation.
- `scripts/refresh_snapshots.py`
  Python script that builds static snapshot JSON files.
- `scripts/validate_static_data.py`
  Python validator for published static JSON contracts.
- `src/doaj_metadata_dashboard/`
  Shared Python logic for DOAJ requests, normalization, summary generation, and snapshot assembly.
- `tests/`
  Unit tests for snapshot generation logic.
- `.github/workflows/`
  GitHub Actions workflows for validation, snapshot refresh, and Pages deployment.

## About This GitHub Repository

This section is written for users who are new to GitHub.

### What this GitHub repository is for

This repository is the main home for the project.
It stores:

- the application source code,
- the public website files,
- the automation workflows,
- the documentation,
- the generated static snapshot data.

### What you can do on the GitHub page

From the repository page on GitHub, you can:

- read the documentation in the `README`,
- open the public application from the website link,
- browse the source code,
- inspect the workflow runs in the `Actions` tab,
- download the repository as a ZIP file,
- clone the repository with Git,
- open issues or discussions later if you add them,
- fork the repository to build your own version.

### About section on GitHub

The repository `About` section should contain:

- a short description of the project,
- the public application URL,
- relevant topics such as `doaj`, `metadata`, `dashboard`, `python`, and `github-pages`.

For this repository, the public application URL should be:

`https://ikhwan-arief.github.io/DOAJ_Metadata/`

### Main branch

The default branch is `main`.
When changes are pushed to `main`, GitHub Actions can validate the project and deploy the static site.

### Actions tab

The `Actions` tab is important because it shows:

- validation workflow runs,
- snapshot refresh workflow runs,
- deployment workflow runs.

If the public app does not update, the first place to check is the `Actions` tab.

### Code tab

The `Code` tab shows the actual files in the repository.
If you are new to GitHub, this is the tab where you can:

- browse files,
- read the README,
- copy file URLs,
- download the project.

## Requirements for Local Use

If you only want to use the public application, you do **not** need Python.
Just open:

`https://ikhwan-arief.github.io/DOAJ_Metadata/`

If you want to run the project locally, you need:

- Git, or the ability to download a ZIP from GitHub,
- Python 3.11 or newer,
- a terminal,
- a modern web browser,
- internet access, because live DOAJ search happens in the browser.

## Running the Application Locally

This section assumes the user is completely new to GitHub and Python projects.

### 1) Get the project files

Option A, clone with Git:

```bash
git clone https://github.com/ikhwan-arief/DOAJ_Metadata.git
cd DOAJ_Metadata
```

Option B, download ZIP from GitHub:

1. Open `https://github.com/ikhwan-arief/DOAJ_Metadata`
2. Click the green `Code` button
3. Choose `Download ZIP`
4. Extract the ZIP file
5. Open a terminal inside the extracted `DOAJ_Metadata` folder

### 2) Check Python

Run:

```bash
python3 --version
```

You should see Python `3.11` or newer.

If `python3` is not found, install Python first from:

`https://www.python.org/downloads/`

### 3) Create a virtual environment

This step is strongly recommended even for beginners.

On macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

After activation, your terminal usually shows `(.venv)` at the beginning.

### 4) Install the project

Run:

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -e .
```

If you want the editable local development installation, the command above is enough for this project.

### 5) Optional validation checks

Run tests:

```bash
PYTHONPATH=src python3 -m unittest discover -s tests -p "test_*.py" -v
```

Validate generated static contracts:

```bash
PYTHONPATH=src python3 scripts/validate_static_data.py
```

Refresh snapshots from tracked targets:

```bash
PYTHONPATH=src python3 scripts/refresh_snapshots.py
```

### 6) Start a local web server

From the repository root, run:

```bash
python3 -m http.server 8000
```

### 7) Open the local app in the browser

Open:

`http://127.0.0.1:8000/docs/`

Important:

- do not open `docs/index.html` by double-clicking it from the file manager,
- always use a local web server,
- the browser app expects relative JSON and JavaScript files to be served correctly.

### 8) Stop the local server

Return to the terminal and press:

```bash
Ctrl+C
```

## Using the Public Remote Application

This is the easiest option for non-technical users.

### Steps

1. Open the public URL:
   `https://ikhwan-arief.github.io/DOAJ_Metadata/`
2. Type a journal title, publisher name, or article title into the search box.
3. Click `Search live DOAJ`.
4. Review grouped results for publishers, journals, and articles.
5. Open the dashboard for the result you need.
6. If available, open published tracked snapshots from the `Tracked Entities` section.

### Notes for remote use

- Search is live, so it depends on public DOAJ availability.
- Some dashboards may rely entirely on live API data.
- Some entities may also have precomputed snapshot enrichment.
- The application is static, so there is no user account, no login, and no server-side session.

## Running the Project Remotely on GitHub

This section is for maintainers or advanced users.

### Validation workflow

Workflow file:

`/.github/workflows/validate-and-build.yml`

Purpose:

- install Python,
- install the package,
- run unit tests,
- validate static JSON files.

It runs on:

- pushes to `main`,
- pull requests,
- manual dispatch.

### Snapshot refresh workflow

Workflow file:

`/.github/workflows/refresh-snapshots.yml`

Purpose:

- read `config/snapshot_targets.json`,
- query DOAJ live endpoints,
- optionally probe authenticated DOAJ dump endpoints,
- build updated snapshot JSON,
- validate the generated outputs,
- commit and push `docs/data/**` changes back to `main`.

It runs on:

- a daily schedule,
- manual dispatch.

### GitHub Pages deployment workflow

Workflow file:

`/.github/workflows/deploy-pages.yml`

Purpose:

- upload the `docs/` folder as a Pages artifact,
- deploy the public static site.

It runs on:

- pushes that affect `docs/**` or workflow files,
- manual dispatch,
- successful completion of the snapshot refresh workflow.

## How to Update Snapshot Targets

If you want the repository to publish precomputed dashboards for selected entities:

1. Open `config/snapshot_targets.json`
2. Add one or more targets to the `targets` array
3. Commit and push the change
4. Run `Refresh DOAJ snapshots` from the GitHub `Actions` tab, or wait for the daily schedule

Example structure:

```json
{
  "version": 1,
  "defaults": {
    "journal_page_size": 50,
    "journal_max_pages": 3,
    "journal_max_articles": 250,
    "publisher_page_size": 50,
    "publisher_max_pages": 3,
    "publisher_max_journals": 150,
    "publisher_max_articles": 300,
    "article_page_size": 25,
    "article_max_pages": 2
  },
  "targets": [
    {
      "entity_type": "publisher",
      "title": "Politeknik Pariwisata NHI Bandung",
      "query": "Politeknik Pariwisata NHI Bandung"
    },
    {
      "entity_type": "journal",
      "title": "Jurnal Kepariwisataan",
      "query": "Jurnal Kepariwisataan",
      "match_title": "Jurnal Kepariwisataan"
    },
    {
      "entity_type": "article",
      "title": "Cultural Route Design for Heritage Tourism",
      "query": "heritage tourism",
      "match_title": "Cultural Route Design for Heritage Tourism"
    }
  ]
}
```

## GitHub Secret for DOAJ API Premium Access

If you have a DOAJ premium API key, store it as:

- `DOAJ_API_KEY`

How it is used in this project:

- only in GitHub Actions refresh jobs,
- only by Python server-side refresh scripts,
- only for DOAJ machine-to-machine requests,
- never in `docs/`, browser JavaScript, or published GitHub Pages assets.

This means:

- `Main Search` and `Journal Matching` stay public-browser features,
- scheduled refresh workflows can use premium metadata access without exposing the key.

## GitHub Secrets for Optional DOAJ Dump Access

These secrets are optional.
Do not configure them unless you actually have valid DOAJ dump access.

Supported secrets:

- `DOAJ_DUMP_TOKEN`
- `DOAJ_DUMP_AUTH_HEADER`
- `DOAJ_DUMP_AUTH_SCHEME`
- `DOAJ_DUMP_JOURNAL_URL`
- `DOAJ_DUMP_ARTICLE_URL`

Important:

- these secrets are only used inside GitHub Actions,
- they must never be added to `docs/`, `config/`, or client-side JavaScript,
- the public site must remain safe even if dump access is not configured.

## Troubleshooting

### The public site does not open

- Check whether GitHub Pages has finished deploying.
- Check the latest `Deploy GitHub Pages` workflow run in the `Actions` tab.
- Confirm the repository homepage URL is correct.

### The page opens but search fails

- The app depends on live public DOAJ search endpoints.
- Temporary rate limits, network issues, or DOAJ-side issues may affect search.
- Reload the page and try again later.

### Python is not found

Try:

```bash
python3 --version
```

If it still fails, install Python from:

`https://www.python.org/downloads/`

### Local page opens but looks broken

Make sure you started a local web server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

`http://127.0.0.1:8000/docs/`

Do not open the HTML file directly from the file system.

### Snapshot refresh does not produce new data

- Make sure `config/snapshot_targets.json` contains targets.
- Check the `Refresh DOAJ snapshots` workflow logs in GitHub Actions.
- Confirm that DOAJ endpoints are reachable during the workflow run.

## Development Notes

- This project is intentionally static-first.
- The browser performs live DOAJ search directly.
- Python is used for normalization, snapshot generation, and workflow-side enrichment.
- GitHub Actions is the execution environment for scheduled automation.
- GitHub Pages is the public hosting layer.

## Verification Commands

Useful local commands:

```bash
PYTHONPATH=src python3 -m unittest discover -s tests -p "test_*.py" -v
PYTHONPATH=src python3 scripts/validate_static_data.py
PYTHONPATH=src python3 scripts/refresh_snapshots.py
python3 -m http.server 8000
```

## Attribution

Developed by Ikhwan Arief, `ikhwan[at]unand.ac.id`.

If you reuse or adapt this project, please provide proper attribution and share derivative work under the same license terms.

## License

This repository is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License.

Human-readable summary:

`https://creativecommons.org/licenses/by-sa/4.0/`

Legal code:

`https://creativecommons.org/licenses/by-sa/4.0/legalcode`

See [LICENSE](LICENSE) for the repository license notice.
