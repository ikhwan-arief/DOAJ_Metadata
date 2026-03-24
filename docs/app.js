const API_BASE = "https://doaj.org/api/search";
const MAX_LIVE_JOURNALS = 150;
const MAX_LIVE_ARTICLES = 300;

const state = {
  meta: null,
  snapshotIndex: [],
  snapshotMap: new Map(),
  snapshotCache: new Map(),
  entities: {
    publisher: new Map(),
    journal: new Map(),
    article: new Map(),
  },
  lastSearch: null,
};

const dom = {
  metaStatus: document.querySelector("#meta-status"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  searchNote: document.querySelector("#search-note"),
  resultsState: document.querySelector("#results-state"),
  resultsGroups: document.querySelector("#results-groups"),
  resultsMeta: document.querySelector("#results-meta"),
  dashboardHeading: document.querySelector("#dashboard-heading"),
  dashboardMeta: document.querySelector("#dashboard-meta"),
  dashboardState: document.querySelector("#dashboard-state"),
  dashboardContent: document.querySelector("#dashboard-content"),
  snapshotMeta: document.querySelector("#snapshot-meta"),
  snapshotList: document.querySelector("#snapshot-list"),
};

function normalizeText(value) {
  return (value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.replace(/\s+/g, "-") : "unknown";
}

function unique(values) {
  const seen = new Set();
  const ordered = [];
  for (const value of values || []) {
    const cleaned = `${value || ""}`.trim();
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }
    seen.add(cleaned);
    ordered.push(cleaned);
  }
  return ordered;
}

function countBy(values, limit = 10) {
  const counter = new Map();
  for (const value of values) {
    const cleaned = `${value || ""}`.trim();
    if (!cleaned) {
      continue;
    }
    counter.set(cleaned, (counter.get(cleaned) || 0) + 1);
  }
  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

function percent(part, total) {
  if (!total) {
    return "0%";
  }
  return `${((part / total) * 100).toFixed(1)}%`;
}

function parseIsoYear(value) {
  if (!value) {
    return null;
  }
  if (/^\d{4}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return String(date.getUTCFullYear());
}

function parseMonthBucket(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function topTerms(texts, limit = 12) {
  const stopwords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "into",
    "their",
    "journal",
    "using",
    "article",
    "study",
    "research",
    "analysis",
  ]);
  const counter = new Map();
  for (const text of texts) {
    const tokens = normalizeText(text)
      .split(/\s+/)
      .filter((token) => token && token.length > 2 && !stopwords.has(token) && !/^\d+$/.test(token));
    for (const token of tokens) {
      counter.set(token, (counter.get(token) || 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function journalBib(record) {
  return record?.bibjson || {};
}

function articleBib(record) {
  return record?.bibjson || {};
}

function journalTitle(record) {
  return `${journalBib(record).title || ""}`.trim();
}

function journalPublisher(record) {
  return `${journalBib(record).publisher?.name || ""}`.trim();
}

function journalCountry(record) {
  return `${journalBib(record).publisher?.country || ""}`.trim();
}

function journalLanguages(record) {
  return unique(journalBib(record).language || []);
}

function journalSubjects(record) {
  return unique((journalBib(record).subject || []).map((item) => item.term).filter(Boolean));
}

function journalLicenses(record) {
  return unique((journalBib(record).license || []).map((item) => item.type).filter(Boolean));
}

function journalPreservation(record) {
  return unique((journalBib(record).preservation?.service || []).filter(Boolean));
}

function journalPidSchemes(record) {
  return unique((journalBib(record).pid_scheme?.scheme || []).filter(Boolean));
}

function journalIssns(record) {
  return unique([journalBib(record).pissn, journalBib(record).eissn].filter(Boolean));
}

function journalReview(record) {
  return unique((journalBib(record).editorial?.review_process || []).filter(Boolean));
}

function journalKeywords(record) {
  return unique((journalBib(record).keywords || []).filter(Boolean));
}

function articleTitle(record) {
  return `${articleBib(record).title || ""}`.trim();
}

function articleAbstract(record) {
  return `${articleBib(record).abstract || ""}`.trim();
}

function articleYear(record) {
  return parseIsoYear(`${articleBib(record).year || ""}`.trim());
}

function articleSubjects(record) {
  return unique((articleBib(record).subject || []).map((item) => item.term).filter(Boolean));
}

function articleKeywords(record) {
  return unique((articleBib(record).keywords || []).filter(Boolean));
}

function articleJournalTitle(record) {
  return `${articleBib(record).journal?.title || ""}`.trim();
}

function articleJournalPublisher(record) {
  return `${articleBib(record).journal?.publisher || ""}`.trim();
}

function articleJournalLanguages(record) {
  return unique(articleBib(record).journal?.language || []);
}

function articleJournalIssns(record) {
  return unique(articleBib(record).journal?.issns || []);
}

function articleAuthors(record) {
  return (articleBib(record).author || []).map((item) => ({
    name: `${item.name || ""}`.trim(),
    affiliation: `${item.affiliation || ""}`.trim(),
  }));
}

function articleAffiliations(record) {
  return unique(articleAuthors(record).map((author) => author.affiliation).filter(Boolean));
}

function articleDoi(record) {
  const identifier = (articleBib(record).identifier || []).find((item) => `${item.type || ""}`.toLowerCase() === "doi");
  return identifier?.id || null;
}

function makeKpi(label, value, tone = "neutral", detail = "") {
  return { label, value, tone, detail };
}

function makePieChart(title, items) {
  return { title, kind: "pie", items };
}

function makeBarChart(title, items) {
  return { title, kind: "bar", items };
}

function makeTimelineChart(title, categories, series) {
  return { title, kind: "timeline", categories, series };
}

function makeTagChart(title, items) {
  return { title, kind: "tags", items };
}

function makeStatusPanel(title, items) {
  return { title, kind: "status-panel", items };
}

function boolStatus(value) {
  if (value === null || value === undefined) {
    return "Unknown";
  }
  return value ? "Yes" : "No";
}

function derivePublishers(journals, articles) {
  const map = new Map();
  const take = (name) => {
    const key = slugify(name);
    if (!map.has(key)) {
      map.set(key, {
        entity_type: "publisher",
        entity_key: key,
        title: name,
        journals: [],
        articles: [],
        countries: new Set(),
        languages: new Set(),
      });
    }
    return map.get(key);
  };

  for (const record of journals) {
    const name = journalPublisher(record);
    if (!name) {
      continue;
    }
    const entry = take(name);
    entry.journals.push(record);
    const country = journalCountry(record);
    if (country) {
      entry.countries.add(country);
    }
    for (const language of journalLanguages(record)) {
      entry.languages.add(language);
    }
  }

  for (const record of articles) {
    const name = articleJournalPublisher(record);
    if (!name) {
      continue;
    }
    const entry = take(name);
    entry.articles.push(record);
    for (const language of articleJournalLanguages(record)) {
      entry.languages.add(language);
    }
  }

  return [...map.values()]
    .map((item) => ({
      entity_type: item.entity_type,
      entity_key: item.entity_key,
      title: item.title,
      journal_count: item.journals.length,
      article_count: item.articles.length,
      countries: [...item.countries],
      languages: [...item.languages],
    }))
    .sort((left, right) => right.journal_count - left.journal_count || right.article_count - left.article_count || left.title.localeCompare(right.title));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Request failed (${response.status}): ${message.slice(0, 180)}`);
  }
  return response.json();
}

async function fetchPaginated(entity, query, { pageSize = 25, maxPages = 2, maxRecords = 100 } = {}) {
  const encoded = encodeURIComponent(query);
  let page = 1;
  let next = true;
  const results = [];
  let total = 0;

  while (next && page <= maxPages && results.length < maxRecords) {
    const payload = await fetchJson(`${API_BASE}/${entity}/${encoded}?page=${page}&pageSize=${pageSize}`);
    total = payload.total || total;
    results.push(...(payload.results || []));
    next = Boolean(payload.next);
    page += 1;
  }

  return {
    query,
    entity,
    total,
    capped: total > results.length,
    results: results.slice(0, maxRecords),
  };
}

function filterPublisherRecords(records, publisherName, articleMode = false) {
  const target = normalizeText(publisherName);
  return records.filter((record) => {
    const candidate = articleMode ? articleJournalPublisher(record) : journalPublisher(record);
    return normalizeText(candidate) === target;
  });
}

function filterArticlesForJournal(articles, journalRecord) {
  const titleKey = normalizeText(journalTitle(journalRecord));
  const issns = new Set(journalIssns(journalRecord).map((value) => normalizeText(value)));
  return articles.filter((article) => {
    const sameTitle = normalizeText(articleJournalTitle(article)) === titleKey;
    const sameIssn = articleJournalIssns(article).some((issn) => issns.has(normalizeText(issn)));
    return sameTitle || sameIssn;
  });
}

function timelineFromPairs(rawValues) {
  const counter = new Map();
  for (const value of rawValues.filter(Boolean)) {
    counter.set(value, (counter.get(value) || 0) + 1);
  }
  return [...counter.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([name, value]) => ({ name, value }));
}

function createPublisherDashboard(name, journals, articles) {
  const countries = journals.map(journalCountry).filter(Boolean);
  const languages = unique(
    journals.flatMap(journalLanguages).concat(articles.flatMap(articleJournalLanguages))
  );
  const licenses = journals.flatMap(journalLicenses);
  const subjects = journals.flatMap(journalSubjects);
  const preservation = journals.flatMap(journalPreservation);
  const pidSchemes = journals.flatMap(journalPidSchemes);
  const articlesByJournal = countBy(articles.map(articleJournalTitle).filter(Boolean), 12);
  const topJournals = journals
    .map((record) => ({
      title: journalTitle(record),
      count: Number(journalBib(record).article?.number || 0),
    }))
    .sort((left, right) => right.count - left.count || left.title.localeCompare(right.title))
    .slice(0, 5)
    .map((item) => item.title);
  const apcYes = journals.filter((record) => Boolean(journalBib(record).apc?.has_apc)).length;
  const preservationYes = journals.filter((record) => Boolean(journalBib(record).preservation?.has_preservation)).length;
  const pidYes = journals.filter((record) => Boolean(journalBib(record).pid_scheme?.has_pid_scheme)).length;
  const topTextTerms = topTerms(
    journals.flatMap((record) => [journalTitle(record), ...journalKeywords(record), ...journalSubjects(record)])
      .concat(
        articles.flatMap((record) => [
          articleTitle(record),
          articleAbstract(record),
          ...articleKeywords(record),
          ...articleSubjects(record),
        ])
      ),
    14
  );
  const journalMonths = journals.map((record) => parseMonthBucket(record.last_updated)).filter(Boolean);
  const articleYears = articles.map(articleYear).filter(Boolean);
  const labels = unique([...journalMonths, ...articleYears]).sort((left, right) => left.localeCompare(right));
  const journalMonthCounts = new Map(timelineFromPairs(journalMonths).map((item) => [item.name, item.value]));
  const articleYearCounts = new Map(timelineFromPairs(articleYears).map((item) => [item.name, item.value]));

  return {
    entity_type: "publisher",
    entity_key: slugify(name),
    title: name,
    fetched_at: new Date().toISOString(),
    source_scope: {
      live_api: true,
      fulltext_enriched: false,
      journal_count: journals.length,
      article_count: articles.length,
    },
    metadata: {
      publisher_name: name,
      countries: unique(countries),
      languages,
      dominant_license: licenses.length ? countBy(licenses, 1)[0].name : "-",
    },
    kpis: [
      makeKpi("Total journals", formatNumber(journals.length), "accent"),
      makeKpi("Total related articles", formatNumber(articles.length), "accent"),
      makeKpi("Publisher countries", formatNumber(unique(countries).length)),
      makeKpi("Languages", formatNumber(languages.length)),
      makeKpi("Dominant license", licenses.length ? countBy(licenses, 1)[0].name : "-"),
      makeKpi("APC share", percent(apcYes, journals.length)),
      makeKpi("Preservation coverage", percent(preservationYes, journals.length)),
      makeKpi("PID coverage", percent(pidYes, journals.length)),
      makeKpi(
        "Most recent update",
        journals
          .map((record) => record.last_updated || "")
          .sort((left, right) => right.localeCompare(left))[0] || "-"
      ),
    ],
    charts: {
      journals_by_country: makeBarChart("Journals by country", countBy(countries, 12)),
      journals_by_subject: makeBarChart("Journals by subject", countBy(subjects, 12)),
      related_articles_by_journal: makeBarChart("Related articles by journal", articlesByJournal),
      language_distribution: makePieChart("Language distribution", countBy(languages, 12)),
      license_distribution: makePieChart("License distribution", countBy(licenses, 8)),
      apc_mix: makePieChart("APC vs no APC", [
        { name: "APC", value: apcYes },
        { name: "No APC", value: Math.max(journals.length - apcYes, 0) },
      ]),
      preservation_services: makeBarChart("Preservation service distribution", countBy(preservation, 10)),
      pid_schemes: makeBarChart("PID scheme distribution", countBy(pidSchemes, 10)),
      recency_timeline: makeTimelineChart("Journal and article recency timeline", labels, [
        { name: "Journals updated", data: labels.map((label) => journalMonthCounts.get(label) || 0) },
        { name: "Articles by year", data: labels.map((label) => articleYearCounts.get(label) || 0) },
      ]),
    },
    narratives: {
      profile_summary: `${name} currently resolves to ${journals.length} journals and ${articles.length} related articles in the live DOAJ dashboard view.`,
      top_journals: topJournals,
      topic_summary: topTextTerms.length
        ? `${name} is currently anchored by dominant metadata terms around ${topTextTerms.slice(0, 5).map((item) => item.name).join(", ")}.`
        : `${name} does not expose enough metadata to build a stable topic summary yet.`,
      metadata_gaps: preservation.length || pidSchemes.length || licenses.length
        ? "Metadata coverage is strong across licenses, languages, and subject distributions."
        : "Metadata gaps remain around licenses, preservation, or PID signals, so parts of the dashboard may be sparse.",
    },
    related_entities: {
      journals: journals.slice(0, 20).map((record) => ({
        id: record.id,
        title: journalTitle(record),
        publisher: journalPublisher(record),
        country: journalCountry(record),
      })),
      articles: articles.slice(0, 20).map((record) => ({
        id: record.id,
        title: articleTitle(record),
        journal_title: articleJournalTitle(record),
        year: articleYear(record),
      })),
    },
    diagnostics: {
      warnings: [],
      top_terms: topTextTerms,
    },
  };
}

function createJournalDashboard(record, articles) {
  const languages = journalLanguages(record);
  const licenses = journalLicenses(record);
  const review = journalReview(record);
  const subjects = journalSubjects(record);
  const articleSubjectsFlat = articles.flatMap(articleSubjects);
  const affiliations = articles.flatMap(articleAffiliations);
  const articleTerms = topTerms(
    articles.flatMap((article) => [articleTitle(article), articleAbstract(article), ...articleKeywords(article)]),
    14
  );
  const yearCounts = new Map(timelineFromPairs(articles.map(articleYear).filter(Boolean)).map((item) => [item.name, item.value]));
  const createdCounts = new Map(
    timelineFromPairs(articles.map((article) => parseIsoYear(article.created_date)).filter(Boolean)).map((item) => [
      item.name,
      item.value,
    ])
  );
  const updateYear = parseIsoYear(record.last_updated);
  const labels = unique([...yearCounts.keys(), ...createdCounts.keys(), ...(updateYear ? [updateYear] : [])]).sort((left, right) =>
    left.localeCompare(right)
  );

  return {
    entity_type: "journal",
    entity_key: `${record.id || slugify(journalTitle(record))}`,
    title: journalTitle(record),
    fetched_at: new Date().toISOString(),
    source_scope: {
      live_api: true,
      fulltext_enriched: false,
      article_count: articles.length,
    },
    metadata: {
      journal_title: journalTitle(record),
      publisher_name: journalPublisher(record),
      country: journalCountry(record),
      issns: journalIssns(record),
      languages,
      licenses,
      subjects,
      review_process: review,
    },
    kpis: [
      makeKpi("Journal title", journalTitle(record), "accent"),
      makeKpi("Publisher", journalPublisher(record)),
      makeKpi("ISSN / EISSN presence", boolStatus(journalIssns(record).length > 0)),
      makeKpi("Total related articles", formatNumber(articles.length), "accent"),
      makeKpi("Subject count", formatNumber(subjects.length)),
      makeKpi("Language set", languages.join(", ") || "-"),
      makeKpi("License type", licenses.join(", ") || "-"),
      makeKpi("APC status", boolStatus(Boolean(journalBib(record).apc?.has_apc))),
      makeKpi("Preservation status", boolStatus(Boolean(journalBib(record).preservation?.has_preservation))),
      makeKpi("PID status", boolStatus(Boolean(journalBib(record).pid_scheme?.has_pid_scheme))),
      makeKpi("Review process", review.join(", ") || "-"),
      makeKpi("Last updated", record.last_updated || "-"),
    ],
    charts: {
      articles_by_year: makeBarChart("Articles by publication year", timelineFromPairs(articles.map(articleYear).filter(Boolean))),
      article_subjects: makeBarChart("Article subjects distribution", countBy(articleSubjectsFlat, 12)),
      article_keywords: makeTagChart("Article keywords and top terms", articleTerms),
      article_languages: makePieChart("Article language distribution", countBy(articles.flatMap(articleJournalLanguages), 8)),
      author_count_distribution: makeBarChart(
        "Author count distribution",
        countBy(articles.map((article) => `${articleAuthors(article).length}`), 8)
      ),
      top_affiliations: makeBarChart("Top affiliations", countBy(affiliations, 10)),
      status_panel: makeStatusPanel("License / APC / preservation / PID status panel", [
        { label: "License", value: licenses.join(", ") || "Unknown" },
        { label: "APC", value: boolStatus(Boolean(journalBib(record).apc?.has_apc)) },
        { label: "Preservation", value: boolStatus(Boolean(journalBib(record).preservation?.has_preservation)) },
        { label: "PID", value: boolStatus(Boolean(journalBib(record).pid_scheme?.has_pid_scheme)) },
      ]),
      update_timeline: makeTimelineChart("Update recency timeline", labels, [
        { name: "Articles by year", data: labels.map((label) => yearCounts.get(label) || 0) },
        { name: "Articles created", data: labels.map((label) => createdCounts.get(label) || 0) },
        { name: "Journal updates", data: labels.map((label) => (updateYear === label ? 1 : 0)) },
      ]),
    },
    narratives: {
      profile_summary: `${journalTitle(record)} is published by ${journalPublisher(record)} and currently resolves to ${articles.length} related articles in the live dashboard view.`,
      topic_summary: articleTerms.length
        ? `${journalTitle(record)} is currently anchored by article themes around ${articleTerms.slice(0, 5).map((item) => item.name).join(", ")}.`
        : `${journalTitle(record)} does not yet expose enough article text to form a stable theme summary.`,
      metadata_gaps: affiliations.length || articleSubjectsFlat.length || review.length
        ? "Metadata coverage is strong enough for KPI and article-profile charts."
        : "Metadata gaps remain around affiliations, subject labels, or review process details.",
      recent_activity: `The latest visible journal update is ${record.last_updated || "unknown"}.`,
    },
    related_entities: {
      articles: articles.slice(0, 25).map((article) => ({
        id: article.id,
        title: articleTitle(article),
        year: articleYear(article),
        authors: articleAuthors(article).length,
      })),
    },
    diagnostics: {
      warnings: [],
      top_terms: articleTerms,
    },
  };
}

function createArticleDashboard(record) {
  const authors = articleAuthors(record);
  const affiliations = articleAffiliations(record);
  const subjects = articleSubjects(record);
  const keywords = articleKeywords(record);
  const terms = topTerms([articleTitle(record), articleAbstract(record), ...keywords], 12);

  return {
    entity_type: "article",
    entity_key: `${record.id || slugify(articleTitle(record))}`,
    title: articleTitle(record),
    fetched_at: new Date().toISOString(),
    source_scope: {
      live_api: true,
      fulltext_enriched: false,
    },
    metadata: {
      article_title: articleTitle(record),
      journal_title: articleJournalTitle(record),
      publisher_name: articleJournalPublisher(record),
      year: articleYear(record),
      doi: articleDoi(record),
      issns: articleJournalIssns(record),
      abstract: articleAbstract(record),
      authors,
      affiliations,
    },
    kpis: [
      makeKpi("Article year", articleYear(record) || "-"),
      makeKpi("Journal", articleJournalTitle(record), "accent"),
      makeKpi("Publisher", articleJournalPublisher(record)),
      makeKpi("Author count", formatNumber(authors.length)),
      makeKpi("Subject count", formatNumber(subjects.length)),
      makeKpi("DOI", articleDoi(record) || "-"),
    ],
    charts: {
      keyword_emphasis: makeTagChart("Keyword emphasis", countBy(keywords, 10).length ? countBy(keywords, 10) : terms),
      subject_tags: makePieChart("Subject tag distribution", countBy(subjects, 8)),
      author_affiliations: makeBarChart("Author affiliations", countBy(affiliations, 8)),
    },
    narratives: {
      profile_summary: `${articleTitle(record)} is shown as a lightweight article dashboard connected to ${articleJournalTitle(record)}.`,
      topic_summary: terms.length
        ? `The article is primarily described through ${terms.slice(0, 5).map((item) => item.name).join(", ")}.`
        : "The article currently exposes too little text for a stable keyword summary.",
      metadata_gaps: articleAbstract(record) && affiliations.length
        ? "Metadata coverage is strong across abstract, identifier, and author fields."
        : "Metadata gaps remain around abstract or affiliation coverage.",
    },
    related_entities: {
      journal: {
        title: articleJournalTitle(record),
        publisher: articleJournalPublisher(record),
        issns: articleJournalIssns(record),
      },
    },
    diagnostics: {
      warnings: [],
      top_terms: terms,
    },
  };
}

function mergeSnapshot(livePayload, snapshotPayload) {
  if (!snapshotPayload) {
    return livePayload;
  }
  if (!livePayload) {
    return snapshotPayload;
  }
  return {
    ...livePayload,
    ...snapshotPayload,
    metadata: {
      ...livePayload.metadata,
      ...snapshotPayload.metadata,
    },
    source_scope: {
      ...livePayload.source_scope,
      ...snapshotPayload.source_scope,
      snapshot_available: true,
    },
    diagnostics: {
      ...livePayload.diagnostics,
      ...snapshotPayload.diagnostics,
    },
  };
}

function setResultsState(message, hidden = false) {
  dom.resultsState.textContent = message;
  dom.resultsState.classList.toggle("hidden", hidden);
}

function setDashboardState(message, hidden = false) {
  dom.dashboardState.textContent = message;
  dom.dashboardState.classList.toggle("hidden", hidden);
}

function renderSearchGroups(groups) {
  const sections = [
    {
      title: "Publishers",
      key: "publishers",
      items: groups.publishers,
      renderer: (item) => `
        <article class="result-card">
          <div class="result-header">
            <div>
              <div class="result-title">${escapeHtml(item.title)}</div>
              <div class="result-meta">${item.journal_count} journals • ${item.article_count} articles • ${item.countries.join(", ") || "country unknown"}</div>
            </div>
            <span class="result-badge">Publisher</span>
          </div>
          <div class="result-actions">
            <div class="muted-line">Languages: ${item.languages.join(", ") || "not exposed"}</div>
            <button class="result-action" data-entity-type="publisher" data-entity-key="${item.entity_key}">Open dashboard</button>
          </div>
        </article>
      `,
    },
    {
      title: "Journals",
      key: "journals",
      items: groups.journals,
      renderer: (record) => `
        <article class="result-card">
          <div class="result-header">
            <div>
              <div class="result-title">${escapeHtml(journalTitle(record))}</div>
              <div class="result-meta">${escapeHtml(journalPublisher(record) || "Publisher unavailable")} • ${escapeHtml(journalCountry(record) || "Country unavailable")}</div>
            </div>
            <span class="result-badge">Journal</span>
          </div>
          <div class="result-actions">
            <div class="muted-line">Languages: ${escapeHtml(journalLanguages(record).join(", ") || "not exposed")}</div>
            <button class="result-action" data-entity-type="journal" data-entity-key="${record.id}">Open dashboard</button>
          </div>
        </article>
      `,
    },
    {
      title: "Articles",
      key: "articles",
      items: groups.articles,
      renderer: (record) => `
        <article class="result-card">
          <div class="result-header">
            <div>
              <div class="result-title">${escapeHtml(articleTitle(record))}</div>
              <div class="result-meta">${escapeHtml(articleJournalTitle(record) || "Journal unavailable")} • ${escapeHtml(articleYear(record) || "Year unavailable")}</div>
            </div>
            <span class="result-badge">Article</span>
          </div>
          <div class="result-actions">
            <div class="muted-line">Publisher: ${escapeHtml(articleJournalPublisher(record) || "not exposed")}</div>
            <button class="result-action" data-entity-type="article" data-entity-key="${record.id}">Open dashboard</button>
          </div>
        </article>
      `,
    },
  ];

  dom.resultsGroups.innerHTML = sections
    .map((section) => {
      const items = section.items || [];
      const body = items.length
        ? items.map(section.renderer).join("")
        : `<div class="empty-state">No ${section.title.toLowerCase()} matched this query.</div>`;
      return `
        <section class="result-group">
          <div class="group-head">
            <h3>${section.title}</h3>
            <span class="section-meta">${items.length} shown</span>
          </div>
          <div class="group-list">${body}</div>
        </section>
      `;
    })
    .join("");

  dom.resultsGroups.querySelectorAll(".result-action").forEach((button) => {
    button.addEventListener("click", () => {
      const entityType = button.dataset.entityType;
      const entityKey = button.dataset.entityKey;
      window.location.hash = `${entityType}/${encodeURIComponent(entityKey)}`;
    });
  });
}

function renderSnapshotList() {
  if (!state.snapshotIndex.length) {
    dom.snapshotMeta.textContent = "No tracked snapshots published yet";
    dom.snapshotList.innerHTML = `
      <div class="empty-state">
        Snapshot targets are still empty. Add tracked entities in <code>config/snapshot_targets.json</code> and
        run the snapshot workflow to publish chart-ready enrichments here.
      </div>
    `;
    return;
  }

  dom.snapshotMeta.textContent = `${state.snapshotIndex.length} published snapshot${state.snapshotIndex.length === 1 ? "" : "s"}`;
  dom.snapshotList.innerHTML = state.snapshotIndex
    .map(
      (item) => `
        <article class="snapshot-card">
          <div class="snapshot-header">
            <div>
              <div class="snapshot-title">${escapeHtml(item.title)}</div>
              <div class="snapshot-subtitle">${escapeHtml(item.subtitle || "Published dashboard snapshot")}</div>
            </div>
            <span class="result-badge">${escapeHtml(item.entity_type)}</span>
          </div>
          <div class="muted-line">Updated: ${escapeHtml(item.fetched_at || "-")}</div>
          <button class="ghost-button" data-snapshot-type="${item.entity_type}" data-snapshot-key="${item.entity_key}">
            Open snapshot
          </button>
        </article>
      `
    )
    .join("");

  dom.snapshotList.querySelectorAll(".ghost-button").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.hash = `${button.dataset.snapshotType}/${encodeURIComponent(button.dataset.snapshotKey)}`;
    });
  });
}

function renderDashboard(payload) {
  dom.dashboardHeading.textContent = payload.title;
  dom.dashboardMeta.textContent = `${payload.entity_type} dashboard`;
  setDashboardState("", true);

  const warnings = payload.diagnostics?.warnings || [];
  const sourceLabels = [];
  if (payload.source_scope?.live_api) {
    sourceLabels.push("Live DOAJ API");
  }
  if (payload.source_scope?.snapshot_available) {
    sourceLabels.push("Published snapshot enrichment");
  }
  if (payload.source_scope?.fulltext_enriched) {
    sourceLabels.push("Full-text enriched");
  }

  dom.dashboardContent.innerHTML = `
    <div class="dashboard-stack">
      <section class="dashboard-banner">
        <div>
          <span class="section-kicker">${escapeHtml(payload.entity_type)} intelligence view</span>
          <h3>${escapeHtml(payload.title)}</h3>
          <p>${escapeHtml(payload.narratives?.profile_summary || "No profile summary is available for this entity.")}</p>
        </div>
        <div class="mini-grid">
          <div class="mini-stat">
            <div class="mini-label">Fetched</div>
            <div class="mini-value">${escapeHtml(payload.fetched_at || "-")}</div>
          </div>
          <div class="mini-stat">
            <div class="mini-label">Source scope</div>
            <div class="mini-value">${escapeHtml(sourceLabels.join(" + ") || "Snapshot only")}</div>
          </div>
        </div>
      </section>
      ${warnings.length ? `<div class="warning-strip">${escapeHtml(warnings.join(" | "))}</div>` : ""}
      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">KPI</span>
            <h2>Key indicators</h2>
          </div>
        </div>
        <div class="kpi-grid">
          ${payload.kpis
            .map(
              (item) => `
                <article class="kpi-card" data-tone="${escapeHtml(item.tone || "neutral")}">
                  <span class="kpi-label">${escapeHtml(item.label)}</span>
                  <strong class="kpi-value">${escapeHtml(item.value)}</strong>
                  <span class="kpi-detail">${escapeHtml(item.detail || "")}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Charts</span>
            <h2>Dashboard visuals</h2>
          </div>
        </div>
        <div class="chart-grid">
          ${Object.entries(payload.charts)
            .map(([chartKey, chart]) => renderChartCard(chartKey, chart))
            .join("")}
        </div>
      </section>
      <section class="narrative-grid">
        ${renderNarratives(payload)}
      </section>
      <section class="related-grid">
        ${renderRelated(payload)}
      </section>
    </div>
  `;

  mountCharts(payload.charts);
}

function renderChartCard(chartKey, chart) {
  const title = escapeHtml(chart.title || chartKey);
  if (chart.kind === "tags") {
    return `
      <article class="chart-card">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="tags-wrap">
          ${(chart.items || [])
            .map((item) => `<span class="tag-item">${escapeHtml(item.name)} <strong>${escapeHtml(String(item.value))}</strong></span>`)
            .join("") || `<span class="muted-line">No tag data available.</span>`}
        </div>
      </article>
    `;
  }
  if (chart.kind === "status-panel") {
    return `
      <article class="chart-card">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="status-wrap">
          ${(chart.items || [])
            .map(
              (item) => `
                <div class="status-item">
                  <span class="mini-label">${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.value)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
    `;
  }
  return `
    <article class="chart-card">
      <div class="card-header">
        <h3>${title}</h3>
      </div>
      <div class="chart-surface" id="chart-${chartKey}"></div>
    </article>
  `;
}

function renderNarratives(payload) {
  const blocks = [
    ["Topic summary", payload.narratives?.topic_summary],
    ["Metadata coverage", payload.narratives?.metadata_gaps],
    ["Recent activity", payload.narratives?.recent_activity],
    [
      "Top journals / context",
      Array.isArray(payload.narratives?.top_journals)
        ? payload.narratives.top_journals.join(", ")
        : payload.metadata?.journal_title || payload.metadata?.publisher_name || payload.metadata?.article_title,
    ],
  ].filter(([, text]) => text);

  return blocks
    .map(
      ([title, text]) => `
        <article class="narrative-card">
          <div class="card-header">
            <h3>${escapeHtml(title)}</h3>
          </div>
          <p>${escapeHtml(text)}</p>
        </article>
      `
    )
    .join("");
}

function renderRelated(payload) {
  const sections = [];
  if (payload.related_entities?.journals?.length) {
    sections.push([
      "Related journals",
      payload.related_entities.journals.map(
        (item) => `
          <div class="related-row">
            <strong>${escapeHtml(item.title || "-")}</strong>
            <div class="muted-line">${escapeHtml(item.publisher || item.country || "")}</div>
          </div>
        `
      ),
    ]);
  }
  if (payload.related_entities?.articles?.length) {
    sections.push([
      "Related articles",
      payload.related_entities.articles.map(
        (item) => `
          <div class="related-row">
            <strong>${escapeHtml(item.title || "-")}</strong>
            <div class="muted-line">${escapeHtml(item.year || item.journal_title || `${item.authors || 0} authors`)}</div>
          </div>
        `
      ),
    ]);
  }
  if (payload.related_entities?.journal) {
    sections.push([
      "Journal context",
      [
        `
          <div class="related-row">
            <strong>${escapeHtml(payload.related_entities.journal.title || "-")}</strong>
            <div class="muted-line">${escapeHtml(payload.related_entities.journal.publisher || "")}</div>
          </div>
        `,
      ],
    ]);
  }
  if (!sections.length) {
    return `
      <article class="related-card">
        <div class="card-header">
          <h3>Related entities</h3>
        </div>
        <p>No related entities were available for this view.</p>
      </article>
    `;
  }
  return sections
    .map(
      ([title, items]) => `
        <article class="related-card">
          <div class="card-header">
            <h3>${escapeHtml(title)}</h3>
          </div>
          <div class="related-list">${items.join("")}</div>
        </article>
      `
    )
    .join("");
}

function mountCharts(charts) {
  if (!window.echarts) {
    return;
  }
  for (const [chartKey, chart] of Object.entries(charts)) {
    if (!["bar", "pie", "timeline"].includes(chart.kind)) {
      continue;
    }
    const node = document.getElementById(`chart-${chartKey}`);
    if (!node) {
      continue;
    }
    const instance = window.echarts.init(node);
    if (chart.kind === "pie") {
      instance.setOption({
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            radius: ["42%", "72%"],
            center: ["50%", "52%"],
            itemStyle: {
              borderColor: "#fffdf7",
              borderWidth: 3,
            },
            label: { color: "#516460" },
            data: chart.items || [],
          },
        ],
      });
      continue;
    }
    if (chart.kind === "bar") {
      const items = chart.items || [];
      instance.setOption({
        grid: { left: 44, right: 18, top: 22, bottom: 54 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: items.map((item) => item.name),
          axisLabel: { color: "#516460", rotate: items.length > 6 ? 28 : 0 },
          axisLine: { lineStyle: { color: "rgba(19,33,31,0.16)" } },
        },
        yAxis: {
          type: "value",
          axisLabel: { color: "#516460" },
          splitLine: { lineStyle: { color: "rgba(19,33,31,0.08)" } },
        },
        series: [
          {
            type: "bar",
            data: items.map((item) => item.value),
            itemStyle: {
              color: "#0d7a75",
              borderRadius: [10, 10, 2, 2],
            },
          },
        ],
      });
      continue;
    }
    instance.setOption({
      grid: { left: 44, right: 18, top: 22, bottom: 54 },
      tooltip: { trigger: "axis" },
      legend: { textStyle: { color: "#516460" } },
      xAxis: {
        type: "category",
        data: chart.categories || [],
        axisLabel: { color: "#516460", rotate: (chart.categories || []).length > 8 ? 28 : 0 },
        axisLine: { lineStyle: { color: "rgba(19,33,31,0.16)" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#516460" },
        splitLine: { lineStyle: { color: "rgba(19,33,31,0.08)" } },
      },
      series: (chart.series || []).map((serie, index) => ({
        name: serie.name,
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 },
        itemStyle: { color: index === 0 ? "#0d7a75" : "#c86f3d" },
        areaStyle: { opacity: 0.08 },
        data: serie.data,
      })),
    });
  }
}

function escapeHtml(value) {
  return `${value || ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadSnapshotIndex() {
  try {
    const [meta, index] = await Promise.all([
      fetchJson("./data/meta.json"),
      fetchJson("./data/snapshots/index.json"),
    ]);
    state.meta = meta;
    state.snapshotIndex = index.items || [];
    state.snapshotMap = new Map(
      state.snapshotIndex.map((item) => [`${item.entity_type}:${item.entity_key}`, item])
    );
    const generated = meta.generated_at ? `Published snapshot data updated ${meta.generated_at}` : "No published snapshots yet";
    dom.metaStatus.textContent = generated;
    renderSnapshotList();
  } catch (error) {
    dom.metaStatus.textContent = "Published metadata unavailable";
    dom.snapshotMeta.textContent = "Snapshot index failed to load";
    dom.snapshotList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

async function loadSnapshot(entityType, entityKey) {
  const cacheKey = `${entityType}:${entityKey}`;
  if (state.snapshotCache.has(cacheKey)) {
    return state.snapshotCache.get(cacheKey);
  }
  const entry = state.snapshotMap.get(cacheKey);
  if (!entry?.snapshot_path) {
    return null;
  }
  try {
    const snapshot = await fetchJson(`./${entry.snapshot_path}`);
    state.snapshotCache.set(cacheKey, snapshot);
    return snapshot;
  } catch (_error) {
    return null;
  }
}

async function runSearch(query) {
  dom.resultsMeta.textContent = "Searching live DOAJ...";
  setResultsState("Searching live DOAJ...", false);
  dom.resultsGroups.innerHTML = "";
  try {
    const [journalsPayload, articlesPayload] = await Promise.all([
      fetchPaginated("journals", query, { pageSize: 20, maxPages: 1, maxRecords: 20 }),
      fetchPaginated("articles", query, { pageSize: 20, maxPages: 1, maxRecords: 20 }),
    ]);
    const groups = {
      journals: journalsPayload.results,
      articles: articlesPayload.results,
      publishers: derivePublishers(journalsPayload.results, articlesPayload.results),
    };

    for (const publisher of groups.publishers) {
      state.entities.publisher.set(publisher.entity_key, publisher);
    }
    for (const journal of groups.journals) {
      state.entities.journal.set(`${journal.id}`, journal);
    }
    for (const article of groups.articles) {
      state.entities.article.set(`${article.id}`, article);
    }

    state.lastSearch = { query, groups };
    dom.resultsMeta.textContent = `"${query}" • ${groups.publishers.length} publishers, ${groups.journals.length} journals, ${groups.articles.length} articles shown`;
    setResultsState("", true);
    renderSearchGroups(groups);
  } catch (error) {
    dom.resultsMeta.textContent = "Search failed";
    setResultsState(error.message, false);
  }
}

async function loadDashboardFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return;
  }
  const [entityType, rawKey] = hash.split("/");
  const entityKey = decodeURIComponent(rawKey || "");
  if (!entityType || !entityKey) {
    return;
  }

  setDashboardState("Loading dashboard...", false);
  dom.dashboardContent.innerHTML = "";

  try {
    const snapshot = await loadSnapshot(entityType, entityKey);
    const livePayload = await buildLiveDashboard(entityType, entityKey);
    const payload = mergeSnapshot(livePayload, snapshot);
    if (!payload) {
      throw new Error("No live record or published snapshot was available for this entity.");
    }
    renderDashboard(payload);
  } catch (error) {
    dom.dashboardHeading.textContent = "Dashboard unavailable";
    dom.dashboardMeta.textContent = "Load failed";
    setDashboardState(error.message, false);
  }
}

async function buildLiveDashboard(entityType, entityKey) {
  if (entityType === "publisher") {
    const publisher = state.entities.publisher.get(entityKey);
    if (!publisher) {
      return null;
    }
    const [journalsPayload, articlesPayload] = await Promise.all([
      fetchPaginated("journals", publisher.title, {
        pageSize: 50,
        maxPages: 3,
        maxRecords: MAX_LIVE_JOURNALS,
      }),
      fetchPaginated("articles", publisher.title, {
        pageSize: 50,
        maxPages: 3,
        maxRecords: MAX_LIVE_ARTICLES,
      }),
    ]);
    const journals = filterPublisherRecords(journalsPayload.results, publisher.title, false);
    const articles = filterPublisherRecords(articlesPayload.results, publisher.title, true);
    return createPublisherDashboard(publisher.title, journals, articles);
  }

  if (entityType === "journal") {
    const journal = state.entities.journal.get(entityKey);
    if (!journal) {
      return null;
    }
    const articlesPayload = await fetchPaginated("articles", journalTitle(journal), {
      pageSize: 50,
      maxPages: 3,
      maxRecords: MAX_LIVE_ARTICLES,
    });
    const relatedArticles = filterArticlesForJournal(articlesPayload.results, journal);
    return createJournalDashboard(journal, relatedArticles);
  }

  if (entityType === "article") {
    const article = state.entities.article.get(entityKey);
    if (!article) {
      return null;
    }
    return createArticleDashboard(article);
  }

  return null;
}

dom.searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = dom.searchInput.value.trim();
  if (!query) {
    dom.searchNote.textContent = "Enter a query before searching.";
    return;
  }
  dom.searchNote.textContent = "Searching live DOAJ journal and article endpoints...";
  await runSearch(query);
  dom.searchNote.textContent = "Search complete. Open a result to render its dashboard.";
});

window.addEventListener("hashchange", () => {
  void loadDashboardFromHash();
});

await loadSnapshotIndex();
await loadDashboardFromHash();
