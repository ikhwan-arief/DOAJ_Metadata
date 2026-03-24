const API_BASE = "https://doaj.org/api/search";
const MAX_LIVE_JOURNALS = 60;
const MAX_LIVE_ARTICLES = 80;

const STOPWORDS = new Set([
  "about",
  "after",
  "akan",
  "antara",
  "article",
  "articles",
  "atau",
  "author",
  "authors",
  "based",
  "bagi",
  "bahwa",
  "before",
  "between",
  "bisa",
  "can",
  "conclusion",
  "conclusions",
  "dan",
  "dari",
  "dengan",
  "during",
  "dalam",
  "data",
  "dengan",
  "diperoleh",
  "doi",
  "each",
  "for",
  "from",
  "hasil",
  "have",
  "into",
  "journal",
  "journals",
  "juga",
  "kami",
  "karena",
  "keywords",
  "method",
  "methods",
  "model",
  "more",
  "most",
  "mereka",
  "oleh",
  "pada",
  "para",
  "penelitian",
  "pengaruh",
  "publisher",
  "publishers",
  "results",
  "research",
  "review",
  "scope",
  "sebagai",
  "serta",
  "study",
  "studies",
  "subject",
  "subjects",
  "system",
  "systems",
  "tentang",
  "terhadap",
  "tersebut",
  "the",
  "their",
  "these",
  "this",
  "through",
  "title",
  "untuk",
  "using",
  "yang",
  "yaitu",
  "year",
  "years",
  "with",
]);

const state = {
  search: {
    query: "",
    fetchedAt: null,
    groups: null,
  },
  entities: {
    publisher: new Map(),
    journal: new Map(),
    article: new Map(),
  },
};

const dom = {
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  searchNote: document.querySelector("#search-note"),
  homeView: document.querySelector("#home-view"),
  detailView: document.querySelector("#detail-view"),
  resultsState: document.querySelector("#results-state"),
  resultsGroups: document.querySelector("#results-groups"),
  resultsMeta: document.querySelector("#results-meta"),
  relatedPanel: document.querySelector("#related-panel"),
  detailResultsHeading: document.querySelector("#detail-results-heading"),
  detailResultsMeta: document.querySelector("#detail-results-meta"),
  detailResultsState: document.querySelector("#detail-results-state"),
  detailResultsList: document.querySelector("#detail-results-list"),
  dashboardKicker: document.querySelector("#dashboard-kicker"),
  dashboardHeading: document.querySelector("#dashboard-heading"),
  dashboardMeta: document.querySelector("#dashboard-meta"),
  dashboardState: document.querySelector("#dashboard-state"),
  dashboardContent: document.querySelector("#dashboard-content"),
  backToSearch: document.querySelector("#back-to-search"),
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

function escapeHtml(value) {
  return `${value || ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function toTimestamp(value) {
  if (!value) {
    return 0;
  }
  if (/^\d{4}$/.test(`${value}`.trim())) {
    return Date.UTC(Number(value), 0, 1);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDisplayDate(value) {
  if (!value) {
    return "-";
  }
  if (/^\d{4}$/.test(`${value}`.trim())) {
    return `${value}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return `${value}`;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function parseIsoYear(value) {
  if (!value) {
    return null;
  }
  if (/^\d{4}$/.test(`${value}`.trim())) {
    return `${value}`.trim();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return String(date.getUTCFullYear());
}

function parseMonthBucket(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function topTerms(texts, limit = 16) {
  const counter = new Map();
  for (const text of texts) {
    const tokens = normalizeText(text)
      .split(/\s+/)
      .filter((token) => token && token.length > 3 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
    for (const token of tokens) {
      counter.set(token, (counter.get(token) || 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function countBy(values, limit = 12) {
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

function boolStatus(value) {
  if (value === null || value === undefined) {
    return "Unknown";
  }
  return value ? "Yes" : "No";
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

function journalWebsite(record) {
  const refs = journalBib(record).ref || {};
  return refs.journal || refs.oa_statement || refs.aims_scope || null;
}

function journalDisplayDate(record) {
  return formatDisplayDate(record?.last_updated || record?.created_date || null);
}

function journalSortTimestamp(record) {
  return Math.max(toTimestamp(record?.last_updated), toTimestamp(record?.created_date));
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

function articleAuthorNames(record) {
  return unique(articleAuthors(record).map((item) => item.name).filter(Boolean));
}

function articleAffiliations(record) {
  return unique(articleAuthors(record).map((author) => author.affiliation).filter(Boolean));
}

function articleDoi(record) {
  const identifier = (articleBib(record).identifier || []).find((item) => `${item.type || ""}`.toLowerCase() === "doi");
  return identifier?.id || null;
}

function articleDoiUrl(record) {
  const doi = articleDoi(record);
  return doi ? `https://doi.org/${encodeURIComponent(doi)}` : null;
}

function articleFulltextUrl(record) {
  const links = articleBib(record).link || [];
  const fulltext = links.find((item) => `${item.type || ""}`.toLowerCase() === "fulltext");
  return fulltext?.url || null;
}

function articleDisplayDate(record) {
  return formatDisplayDate(record?.last_updated || record?.created_date || articleYear(record));
}

function articleSortTimestamp(record) {
  return Math.max(
    toTimestamp(record?.last_updated),
    toTimestamp(record?.created_date),
    toTimestamp(articleYear(record))
  );
}

function sortJournals(records) {
  return [...records].sort((left, right) => {
    const delta = journalSortTimestamp(right) - journalSortTimestamp(left);
    if (delta !== 0) {
      return delta;
    }
    return journalTitle(left).localeCompare(journalTitle(right));
  });
}

function sortArticles(records) {
  return [...records].sort((left, right) => {
    const delta = articleSortTimestamp(right) - articleSortTimestamp(left);
    if (delta !== 0) {
      return delta;
    }
    return articleTitle(left).localeCompare(articleTitle(right));
  });
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
        latestTs: 0,
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
    entry.latestTs = Math.max(entry.latestTs, journalSortTimestamp(record));
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
    entry.latestTs = Math.max(entry.latestTs, articleSortTimestamp(record));
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
      latestTs: item.latestTs,
      latestDate: formatDisplayDate(item.latestTs ? new Date(item.latestTs).toISOString() : null),
    }))
    .sort((left, right) => {
      const delta = right.latestTs - left.latestTs;
      if (delta !== 0) {
        return delta;
      }
      const countDelta = right.journal_count - left.journal_count || right.article_count - left.article_count;
      if (countDelta !== 0) {
        return countDelta;
      }
      return left.title.localeCompare(right.title);
    });
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

function filterPublisherJournals(records, publisherName) {
  const target = normalizeText(publisherName);
  return records.filter((record) => normalizeText(journalPublisher(record)) === target);
}

function filterPublisherArticles(records, publisherName) {
  const target = normalizeText(publisherName);
  return records.filter((record) => normalizeText(articleJournalPublisher(record)) === target);
}

function filterArticlesForJournal(records, journalRecord) {
  const titleKey = normalizeText(journalTitle(journalRecord));
  const issns = new Set(journalIssns(journalRecord).map((value) => normalizeText(value)));
  return records.filter((article) => {
    const sameTitle = normalizeText(articleJournalTitle(article)) === titleKey;
    const sameIssn = articleJournalIssns(article).some((issn) => issns.has(normalizeText(issn)));
    return sameTitle || sameIssn;
  });
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

function makeWordCloud(title, items) {
  return { title, kind: "wordcloud", items };
}

function makeStatusPanel(title, items) {
  return { title, kind: "status-panel", items };
}

function makeTagChart(title, items) {
  return { title, kind: "tags", items };
}

function timelinePairs(values) {
  const map = new Map();
  for (const value of values.filter(Boolean)) {
    map.set(value, (map.get(value) || 0) + 1);
  }
  return [...map.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([name, value]) => ({ name, value }));
}

function buildPublisherPayload(publisher, journals, articles, searchContext) {
  const countries = journals.map(journalCountry).filter(Boolean);
  const languages = unique(journals.flatMap(journalLanguages).concat(articles.flatMap(articleJournalLanguages)));
  const licenses = journals.flatMap(journalLicenses);
  const subjects = journals.flatMap(journalSubjects);
  const preservation = journals.flatMap(journalPreservation);
  const pidSchemes = journals.flatMap(journalPidSchemes);
  const apcYes = journals.filter((record) => Boolean(journalBib(record).apc?.has_apc)).length;
  const preservationYes = journals.filter((record) => Boolean(journalBib(record).preservation?.has_preservation)).length;
  const pidYes = journals.filter((record) => Boolean(journalBib(record).pid_scheme?.has_pid_scheme)).length;
  const journalMonths = journals.map((record) => parseMonthBucket(record.last_updated)).filter(Boolean);
  const articleYears = articles.map(articleYear).filter(Boolean);
  const labels = unique([...journalMonths, ...articleYears]).sort((left, right) => left.localeCompare(right));
  const journalCounts = new Map(timelinePairs(journalMonths).map((item) => [item.name, item.value]));
  const articleCounts = new Map(timelinePairs(articleYears).map((item) => [item.name, item.value]));
  const wordCloud = topTerms(journals.map(journalTitle), 22);

  return {
    entity_type: "publisher",
    title: publisher.title,
    fetched_at: searchContext.fetchedAt,
    query: searchContext.query,
    summary: `${publisher.title} currently appears with ${journals.length} journals and ${articles.length} query-matched articles.`,
    kpis: [
      { label: "Total journals", value: formatNumber(journals.length), tone: "accent" },
      { label: "Total related articles", value: formatNumber(articles.length), tone: "accent" },
      { label: "Publisher countries", value: formatNumber(unique(countries).length) },
      { label: "Languages", value: formatNumber(languages.length) },
      { label: "Dominant license", value: licenses.length ? countBy(licenses, 1)[0].name : "-" },
      { label: "APC share", value: percent(apcYes, journals.length) },
      { label: "Preservation coverage", value: percent(preservationYes, journals.length) },
      { label: "PID coverage", value: percent(pidYes, journals.length) },
      { label: "Most recent update", value: journals[0] ? journalDisplayDate(journals[0]) : "-" },
    ],
    charts: {
      wordcloud: makeWordCloud("Journal word cloud", wordCloud),
      journals_by_country: makeBarChart("Journals by country", countBy(countries, 12)),
      journals_by_subject: makeBarChart("Journals by subject", countBy(subjects, 12)),
      related_articles_by_journal: makeBarChart(
        "Related articles by journal",
        countBy(articles.map(articleJournalTitle).filter(Boolean), 12)
      ),
      language_distribution: makePieChart("Language distribution", countBy(languages, 12)),
      license_distribution: makePieChart("License distribution", countBy(licenses, 8)),
      apc_mix: makePieChart("APC vs no APC", [
        { name: "APC", value: apcYes },
        { name: "No APC", value: Math.max(journals.length - apcYes, 0) },
      ]),
      preservation_services: makeBarChart("Preservation service distribution", countBy(preservation, 10)),
      pid_schemes: makeBarChart("PID scheme distribution", countBy(pidSchemes, 10)),
      recency_timeline: makeTimelineChart("Journal and article recency timeline", labels, [
        { name: "Journals updated", data: labels.map((label) => journalCounts.get(label) || 0) },
        { name: "Articles by year", data: labels.map((label) => articleCounts.get(label) || 0) },
      ]),
    },
    narratives: [
      {
        title: "Topic summary",
        text: wordCloud.length
          ? `The publisher view is currently shaped by journal naming patterns around ${wordCloud.slice(0, 6).map((item) => item.name).join(", ")}.`
          : "Not enough query-matched journal titles are available to build a stable word cloud.",
      },
      {
        title: "Metadata coverage",
        text: licenses.length || preservation.length || pidSchemes.length
          ? "The query-matched portfolio exposes enough metadata for distribution charts across licensing, preservation, and identifiers."
          : "The query-matched portfolio has limited metadata coverage for licensing, preservation, or identifiers.",
      },
      {
        title: "Query scope",
        text: `All charts and related lists on this page are restricted to the original search phrase: "${searchContext.query}".`,
      },
    ],
  };
}

function buildJournalPayload(journal, articles, searchContext) {
  const languages = journalLanguages(journal);
  const licenses = journalLicenses(journal);
  const review = journalReview(journal);
  const subjects = journalSubjects(journal);
  const affiliations = articles.flatMap(articleAffiliations);
  const articleSubjectTerms = articles.flatMap(articleSubjects);
  const articleWords = topTerms(
    articles.flatMap((article) => [
      articleTitle(article),
      articleAbstract(article),
      ...articleKeywords(article),
    ]),
    24
  );
  const publicationYears = timelinePairs(articles.map(articleYear).filter(Boolean));
  const createdYears = timelinePairs(articles.map((article) => parseIsoYear(article.created_date)).filter(Boolean));
  const updateYear = parseIsoYear(journal.last_updated);
  const labels = unique([
    ...publicationYears.map((item) => item.name),
    ...createdYears.map((item) => item.name),
    ...(updateYear ? [updateYear] : []),
  ]).sort((left, right) => left.localeCompare(right));
  const publicationMap = new Map(publicationYears.map((item) => [item.name, item.value]));
  const createdMap = new Map(createdYears.map((item) => [item.name, item.value]));

  return {
    entity_type: "journal",
    title: journalTitle(journal),
    fetched_at: searchContext.fetchedAt,
    query: searchContext.query,
    journalWebsite: journalWebsite(journal),
    summary: `${journalTitle(journal)} currently has ${articles.length} article records that match the original search phrase.`,
    kpis: [
      { label: "Journal title", value: journalTitle(journal), tone: "accent" },
      { label: "Publisher", value: journalPublisher(journal) || "-" },
      { label: "ISSN / EISSN presence", value: boolStatus(journalIssns(journal).length > 0) },
      { label: "Total related articles", value: formatNumber(articles.length), tone: "accent" },
      { label: "Subject count", value: formatNumber(subjects.length) },
      { label: "Language set", value: languages.join(", ") || "-" },
      { label: "License type", value: licenses.join(", ") || "-" },
      { label: "APC status", value: boolStatus(Boolean(journalBib(journal).apc?.has_apc)) },
      { label: "Preservation status", value: boolStatus(Boolean(journalBib(journal).preservation?.has_preservation)) },
      { label: "PID status", value: boolStatus(Boolean(journalBib(journal).pid_scheme?.has_pid_scheme)) },
      { label: "Review process", value: review.join(", ") || "-" },
      { label: "Last updated", value: journalDisplayDate(journal) },
    ],
    charts: {
      wordcloud: makeWordCloud("Article word cloud", articleWords),
      articles_by_year: makeBarChart("Articles by publication year", publicationYears),
      article_subjects: makeBarChart("Article subjects distribution", countBy(articleSubjectTerms, 12)),
      article_keywords: makeTagChart("Article keywords", countBy(articles.flatMap(articleKeywords), 18)),
      article_languages: makePieChart("Article language distribution", countBy(articles.flatMap(articleJournalLanguages), 8)),
      author_count_distribution: makeBarChart(
        "Author count distribution",
        countBy(articles.map((article) => `${articleAuthors(article).length}`), 8)
      ),
      top_affiliations: makeBarChart("Top affiliations", countBy(affiliations, 10)),
      status_panel: makeStatusPanel("License / APC / preservation / PID status", [
        { label: "License", value: licenses.join(", ") || "Unknown" },
        { label: "APC", value: boolStatus(Boolean(journalBib(journal).apc?.has_apc)) },
        { label: "Preservation", value: boolStatus(Boolean(journalBib(journal).preservation?.has_preservation)) },
        { label: "PID", value: boolStatus(Boolean(journalBib(journal).pid_scheme?.has_pid_scheme)) },
      ]),
      update_timeline: makeTimelineChart("Update recency timeline", labels, [
        { name: "Articles by year", data: labels.map((label) => publicationMap.get(label) || 0) },
        { name: "Articles created", data: labels.map((label) => createdMap.get(label) || 0) },
        { name: "Journal update year", data: labels.map((label) => (updateYear === label ? 1 : 0)) },
      ]),
    },
    narratives: [
      {
        title: "Theme summary",
        text: articleWords.length
          ? `The journal view is currently anchored by terms such as ${articleWords.slice(0, 6).map((item) => item.name).join(", ")}.`
          : "Not enough query-matched article text is available to build a stable word cloud.",
      },
      {
        title: "Metadata coverage",
        text: affiliations.length || articleSubjectTerms.length || review.length
          ? "The journal exposes enough article-linked metadata for author, affiliation, and subject-level charts."
          : "The journal has limited query-matched metadata for article-level charting.",
      },
      {
        title: "Query scope",
        text: `Only articles that matched the search phrase "${searchContext.query}" are included in this journal view.`,
      },
    ],
  };
}

function buildArticlePayload(article, searchContext) {
  const authors = articleAuthorNames(article);
  const affiliations = articleAffiliations(article);
  const subjects = articleSubjects(article);
  const keywords = articleKeywords(article);
  const abstractTerms = topTerms([articleAbstract(article)], 24);

  return {
    entity_type: "article",
    title: articleTitle(article),
    fetched_at: searchContext.fetchedAt,
    query: searchContext.query,
    doi: articleDoi(article),
    doiUrl: articleDoiUrl(article),
    fulltextUrl: articleFulltextUrl(article),
    article,
    summary: `${articleTitle(article)} is shown as an article detail view restricted to the original search phrase.`,
    kpis: [
      { label: "Article year", value: articleYear(article) || "-" },
      { label: "Journal", value: articleJournalTitle(article) || "-", tone: "accent" },
      { label: "Publisher", value: articleJournalPublisher(article) || "-" },
      { label: "Author count", value: formatNumber(authors.length) },
      { label: "Subject count", value: formatNumber(subjects.length) },
      { label: "DOI", value: articleDoi(article) || "-" },
    ],
    charts: {
      wordcloud: makeWordCloud("Abstract word cloud", abstractTerms),
      keyword_emphasis: makeTagChart("Keyword emphasis", countBy(keywords, 14)),
      subject_tags: makePieChart("Subject tag distribution", countBy(subjects, 8)),
      author_affiliations: makeBarChart("Author affiliations", countBy(affiliations, 8)),
    },
    narratives: [
      {
        title: "Abstract summary",
        text: articleAbstract(article) || "No abstract is available for this article record.",
      },
      {
        title: "Keywords",
        text: keywords.join(", ") || "No keywords are available for this article record.",
      },
      {
        title: "Query scope",
        text: `This article detail page is tied to the original search phrase "${searchContext.query}".`,
      },
    ],
  };
}

function setResultsState(message, hidden = false) {
  dom.resultsState.textContent = message;
  dom.resultsState.classList.toggle("hidden", hidden);
}

function setDetailResultsState(message, hidden = false) {
  dom.detailResultsState.textContent = message;
  dom.detailResultsState.classList.toggle("hidden", hidden);
}

function setDashboardState(message, hidden = false) {
  dom.dashboardState.textContent = message;
  dom.dashboardState.classList.toggle("hidden", hidden);
}

function syncUrl(query, hash = "", replace = false) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }
  url.hash = hash;
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (replace) {
    window.history.replaceState({}, "", next);
  } else {
    window.history.pushState({}, "", next);
  }
}

function routeFromLocation() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return { view: "home" };
  }
  const [entityType, rawKey] = hash.split("/");
  return {
    view: "detail",
    entityType: entityType || "",
    entityKey: decodeURIComponent(rawKey || ""),
  };
}

function currentQueryFromUrl() {
  return new URL(window.location.href).searchParams.get("q")?.trim() || "";
}

function clearEntityMaps() {
  state.entities.publisher.clear();
  state.entities.journal.clear();
  state.entities.article.clear();
}

function indexGroups(groups) {
  clearEntityMaps();
  for (const publisher of groups.publishers) {
    state.entities.publisher.set(publisher.entity_key, publisher);
  }
  for (const journal of groups.journals) {
    state.entities.journal.set(`${journal.id}`, journal);
  }
  for (const article of groups.articles) {
    state.entities.article.set(`${article.id}`, article);
  }
}

function showHomeView() {
  dom.homeView.classList.remove("hidden");
  dom.detailView.classList.add("hidden");
  dom.detailView.classList.remove("single-column");
  dom.relatedPanel.classList.remove("hidden");
}

function showDetailView({ singleColumn = false } = {}) {
  dom.homeView.classList.add("hidden");
  dom.detailView.classList.remove("hidden");
  dom.detailView.classList.toggle("single-column", singleColumn);
  dom.relatedPanel.classList.toggle("hidden", singleColumn);
}

function navigateToEntity(entityType, entityKey) {
  if (!state.search.query) {
    return;
  }
  syncUrl(state.search.query, `${entityType}/${encodeURIComponent(entityKey)}`);
  void renderRoute();
}

function renderPublisherCard(item) {
  return `
    <article class="result-card">
      <div class="result-header">
        <div>
          <div class="result-title">${escapeHtml(item.title)}</div>
          <div class="result-meta">Latest match: ${escapeHtml(item.latestDate)} • ${item.journal_count} journals • ${item.article_count} articles</div>
        </div>
        <span class="result-badge" data-kind="publisher">Publisher</span>
      </div>
      <div class="result-body">
        <div class="result-summary">
          <p>Countries: ${escapeHtml(item.countries.join(", ") || "Not exposed")}</p>
          <p>Languages: ${escapeHtml(item.languages.join(", ") || "Not exposed")}</p>
        </div>
      </div>
      <div class="result-actions">
        <div class="muted-line">Sorted by latest matched record</div>
        <button class="result-action" data-entity-type="publisher" data-entity-key="${escapeHtml(item.entity_key)}">Open</button>
      </div>
    </article>
  `;
}

function renderJournalCard(record, { showWebsite = false } = {}) {
  const website = journalWebsite(record);
  return `
    <article class="result-card">
      <div class="result-header">
        <div>
          <div class="result-title">${escapeHtml(journalTitle(record))}</div>
          <div class="result-meta">${escapeHtml(journalPublisher(record) || "Publisher unavailable")} • ${escapeHtml(journalCountry(record) || "Country unavailable")} • ${escapeHtml(journalDisplayDate(record))}</div>
        </div>
        <span class="result-badge" data-kind="journal">Journal</span>
      </div>
      <div class="result-body">
        <div class="result-summary">
          <p>Languages: ${escapeHtml(journalLanguages(record).join(", ") || "Not exposed")}</p>
          <p>Subjects: ${escapeHtml(journalSubjects(record).slice(0, 4).join(", ") || "Not exposed")}</p>
        </div>
        ${
          showWebsite && website
            ? `<div class="result-links"><a class="result-link" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Journal website</a></div>`
            : ""
        }
      </div>
      <div class="result-actions">
        <div class="muted-line">Sorted by latest journal update</div>
        <button class="result-action" data-entity-type="journal" data-entity-key="${escapeHtml(`${record.id}`)}">Open</button>
      </div>
    </article>
  `;
}

function articleYearRouteLink(record) {
  return `
    <a class="result-link" href="?q=${encodeURIComponent(state.search.query)}#article/${encodeURIComponent(`${record.id}`)}">
      ${escapeHtml(articleYear(record) || articleDisplayDate(record))}
    </a>
  `;
}

function renderArticleCard(record, { includeRouteYear = false } = {}) {
  const authors = articleAuthorNames(record).join(", ") || "Author not exposed";
  const keywords = articleKeywords(record).join(", ") || "No keywords";
  return `
    <article class="result-card">
      <div class="result-header">
        <div>
          <div class="result-title">${escapeHtml(articleTitle(record))}</div>
          <div class="result-meta">${escapeHtml(articleJournalTitle(record) || "Journal unavailable")} • ${escapeHtml(articleJournalPublisher(record) || "Publisher unavailable")} • ${escapeHtml(articleDisplayDate(record))}</div>
        </div>
        <span class="result-badge" data-kind="article">Article</span>
      </div>
      <div class="result-body">
        <div class="result-metadata">
          <div class="result-summary">
            <p><strong>Author(s):</strong> ${escapeHtml(authors)}</p>
            <p class="article-abstract"><strong>Abstract:</strong> ${escapeHtml(articleAbstract(record) || "No abstract available.")}</p>
            <p class="keyword-list"><strong>Keywords:</strong> ${escapeHtml(keywords)}</p>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <div class="result-links">
          ${
            includeRouteYear
              ? articleYearRouteLink(record)
              : `<span class="muted-line">${escapeHtml(articleYear(record) || articleDisplayDate(record))}</span>`
          }
        </div>
        <button class="result-action" data-entity-type="article" data-entity-key="${escapeHtml(`${record.id}`)}">Open</button>
      </div>
    </article>
  `;
}

function attachOpenHandlers(root) {
  root.querySelectorAll("[data-entity-type][data-entity-key]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateToEntity(button.dataset.entityType, button.dataset.entityKey);
    });
  });
}

function renderHomeGroups(groups) {
  const sections = [
    { title: "Publishers", items: groups.publishers, renderer: renderPublisherCard },
    { title: "Journals", items: groups.journals, renderer: (item) => renderJournalCard(item) },
    { title: "Articles", items: groups.articles, renderer: (item) => renderArticleCard(item) },
  ];

  dom.resultsGroups.innerHTML = sections
    .map((section) => {
      const body = section.items.length
        ? section.items.map(section.renderer).join("")
        : `<div class="empty-state">No ${section.title.toLowerCase()} matched this query.</div>`;
      return `
        <section class="result-group">
          <div class="group-head">
            <h3>${section.title}</h3>
            <span class="section-meta">${section.items.length} shown</span>
          </div>
          <div class="group-list">${body}</div>
        </section>
      `;
    })
    .join("");

  attachOpenHandlers(dom.resultsGroups);
}

function renderLockedResults(title, meta, itemsHtml, { hidden = false } = {}) {
  dom.detailResultsHeading.textContent = title;
  dom.detailResultsMeta.textContent = meta;
  dom.relatedPanel.classList.toggle("hidden", hidden);
  if (hidden) {
    return;
  }
  if (!itemsHtml) {
    setDetailResultsState("No query-matched related results are available for this selection.", false);
    dom.detailResultsList.innerHTML = "";
    return;
  }
  setDetailResultsState("", true);
  dom.detailResultsList.innerHTML = itemsHtml;
  attachOpenHandlers(dom.detailResultsList);
}

function renderWordCloudItems(items) {
  if (!items?.length) {
    return `<span class="muted-line">No word cloud data available.</span>`;
  }
  const max = Math.max(...items.map((item) => item.value));
  const min = Math.min(...items.map((item) => item.value));
  return items
    .map((item, index) => {
      const ratio = max === min ? 0.6 : (item.value - min) / (max - min);
      const size = 1.1 + ratio * 1.8;
      const opacity = 0.6 + ratio * 0.4;
      const rotation = index % 5 === 0 ? "-2deg" : index % 3 === 0 ? "2deg" : "0deg";
      return `<span class="wordcloud-item" style="font-size:${size}rem;opacity:${opacity};transform:rotate(${rotation});">${escapeHtml(item.name)}</span>`;
    })
    .join("");
}

function renderChartCard(chartKey, chart) {
  const title = escapeHtml(chart.title || chartKey);
  if (chart.kind === "wordcloud") {
    return `
      <article class="chart-card">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="wordcloud-wrap">${renderWordCloudItems(chart.items)}</div>
      </article>
    `;
  }
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

function renderNarratives(narratives) {
  return narratives
    .map(
      (item) => `
        <article class="narrative-card">
          <div class="card-header">
            <h3>${escapeHtml(item.title)}</h3>
          </div>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");
}

function renderDetailMeta(payload) {
  if (payload.entity_type === "article") {
    const article = payload.article;
    const authors = articleAuthorNames(article).join(", ") || "Author not exposed";
    const keywords = articleKeywords(article).join(", ") || "No keywords";
    return `
      <div class="detail-meta-block">
        <p><strong>Author(s):</strong> ${escapeHtml(authors)}</p>
        <p><strong>Journal:</strong> ${escapeHtml(articleJournalTitle(article) || "-")}</p>
        <p><strong>Publisher:</strong> ${escapeHtml(articleJournalPublisher(article) || "-")}</p>
        <p class="article-abstract"><strong>Abstract:</strong> ${escapeHtml(articleAbstract(article) || "No abstract available.")}</p>
        <p class="keyword-list"><strong>Keywords:</strong> ${escapeHtml(keywords)}</p>
      </div>
    `;
  }
  return "";
}

function renderDetailLinks(payload) {
  if (payload.entity_type === "journal" && payload.journalWebsite) {
    return `<a class="detail-title-link" href="${escapeHtml(payload.journalWebsite)}" target="_blank" rel="noopener noreferrer">Journal website</a>`;
  }
  if (payload.entity_type === "article") {
    const links = [];
    if (payload.doiUrl) {
      links.push(`<a class="detail-title-link" href="${escapeHtml(payload.doiUrl)}" target="_blank" rel="noopener noreferrer">Open DOI</a>`);
    }
    if (payload.fulltextUrl) {
      links.push(`<a class="detail-title-link" href="${escapeHtml(payload.fulltextUrl)}" target="_blank" rel="noopener noreferrer">Open full text</a>`);
    }
    return links.join("");
  }
  return "";
}

function renderDashboard(payload) {
  dom.dashboardHeading.textContent = payload.entity_type === "article" ? "Article Detail" : "Dashboard";
  dom.dashboardKicker.textContent = payload.entity_type === "article"
    ? "Article Detail"
    : `${payload.entity_type.charAt(0).toUpperCase()}${payload.entity_type.slice(1)} Dashboard`;
  dom.dashboardMeta.textContent = `Search phrase: "${payload.query}" • Fetched ${formatDisplayDate(payload.fetched_at)}`;
  setDashboardState("", true);

  dom.dashboardContent.innerHTML = `
    <div class="dashboard-stack">
      <section class="dashboard-banner">
        <div>
          <span class="section-kicker">${escapeHtml(payload.entity_type)}</span>
          <h3>${escapeHtml(payload.title)}</h3>
          <p>${escapeHtml(payload.summary)}</p>
          <div class="banner-meta">Fetched ${escapeHtml(formatDisplayDate(payload.fetched_at))}</div>
          ${renderDetailLinks(payload)}
          ${renderDetailMeta(payload)}
        </div>
      </section>
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
            <h2>Visuals</h2>
          </div>
        </div>
        <div class="chart-grid">
          ${Object.entries(payload.charts)
            .map(([chartKey, chart]) => renderChartCard(chartKey, chart))
            .join("")}
        </div>
      </section>
      <section class="narrative-grid">
        ${renderNarratives(payload.narratives)}
      </section>
    </div>
  `;

  mountCharts(payload.charts);
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

async function runSearch(query, { updateUrl = true } = {}) {
  dom.resultsMeta.textContent = "Searching DOAJ...";
  setResultsState("Searching DOAJ...", false);
  dom.resultsGroups.innerHTML = "";

  const [journalsPayload, articlesPayload] = await Promise.all([
    fetchPaginated("journals", query, {
      pageSize: 25,
      maxPages: 2,
      maxRecords: MAX_LIVE_JOURNALS,
    }),
    fetchPaginated("articles", query, {
      pageSize: 25,
      maxPages: 2,
      maxRecords: MAX_LIVE_ARTICLES,
    }),
  ]);

  const journals = sortJournals(journalsPayload.results);
  const articles = sortArticles(articlesPayload.results);
  const publishers = derivePublishers(journals, articles);

  const groups = { publishers, journals, articles };
  indexGroups(groups);
  state.search = {
    query,
    fetchedAt: new Date().toISOString(),
    groups,
  };

  dom.resultsMeta.textContent = `"${query}" • ${publishers.length} publishers, ${journals.length} journals, ${articles.length} articles shown`;
  setResultsState("", true);
  renderHomeGroups(groups);

  if (updateUrl) {
    syncUrl(query, "", false);
  }
}

async function ensureSearchContext() {
  const query = currentQueryFromUrl();
  dom.searchInput.value = query;
  if (!query) {
    return null;
  }
  if (state.search.query === query && state.search.groups) {
    return state.search;
  }
  await runSearch(query, { updateUrl: false });
  return state.search;
}

function findPublisher(entityKey) {
  return state.entities.publisher.get(entityKey) || state.search.groups?.publishers.find((item) => item.entity_key === entityKey) || null;
}

function findJournal(entityKey) {
  return state.entities.journal.get(entityKey) || state.search.groups?.journals.find((item) => `${item.id}` === entityKey) || null;
}

function findArticle(entityKey) {
  return state.entities.article.get(entityKey) || state.search.groups?.articles.find((item) => `${item.id}` === entityKey) || null;
}

function renderPublisherDetail(entityKey) {
  const publisher = findPublisher(entityKey);
  if (!publisher) {
    throw new Error("The selected publisher is no longer present in the current search result set.");
  }
  const journals = sortJournals(filterPublisherJournals(state.search.groups.journals, publisher.title));
  const articles = sortArticles(filterPublisherArticles(state.search.groups.articles, publisher.title));
  const payload = buildPublisherPayload(publisher, journals, articles, state.search);
  renderLockedResults(
    "Matched journals",
    `${journals.length} journals • search phrase "${state.search.query}"`,
    journals.map((item) => renderJournalCard(item, { showWebsite: true })).join("")
  );
  renderDashboard(payload);
  showDetailView();
}

function renderJournalDetail(entityKey) {
  const journal = findJournal(entityKey);
  if (!journal) {
    throw new Error("The selected journal is no longer present in the current search result set.");
  }
  const articles = sortArticles(filterArticlesForJournal(state.search.groups.articles, journal));
  const payload = buildJournalPayload(journal, articles, state.search);
  renderLockedResults(
    "Matched articles",
    `${articles.length} articles • search phrase "${state.search.query}"`,
    articles.map((item) => renderArticleCard(item, { includeRouteYear: true })).join("")
  );
  renderDashboard(payload);
  showDetailView();
}

function renderArticleDetail(entityKey) {
  const article = findArticle(entityKey);
  if (!article) {
    throw new Error("The selected article is no longer present in the current search result set.");
  }
  const payload = buildArticlePayload(article, state.search);
  renderLockedResults("", "", "", { hidden: true });
  renderDashboard(payload);
  showDetailView({ singleColumn: true });
}

async function renderRoute() {
  const route = routeFromLocation();
  const query = currentQueryFromUrl();

  if (!query) {
    showHomeView();
    dom.resultsMeta.textContent = "No query yet";
    setResultsState("Start with a live DOAJ query. This panel will separate matched publishers, journals, and articles.", false);
    dom.resultsGroups.innerHTML = "";
    dom.dashboardContent.innerHTML = "";
    return;
  }

  try {
    await ensureSearchContext();
  } catch (error) {
    showHomeView();
    dom.resultsMeta.textContent = "Search failed";
    setResultsState(error.message, false);
    return;
  }

  if (route.view === "home") {
    showHomeView();
    renderHomeGroups(state.search.groups);
    return;
  }

  try {
    setDashboardState("Loading detail...", false);
    dom.dashboardContent.innerHTML = "";
    if (route.entityType === "publisher") {
      renderPublisherDetail(route.entityKey);
      return;
    }
    if (route.entityType === "journal") {
      renderJournalDetail(route.entityKey);
      return;
    }
    if (route.entityType === "article") {
      renderArticleDetail(route.entityKey);
      return;
    }
    throw new Error("Unsupported route type.");
  } catch (error) {
    showDetailView();
    dom.dashboardKicker.textContent = "Load failed";
    dom.dashboardHeading.textContent = route.entityType === "article" ? "Article Detail" : "Dashboard";
    dom.dashboardMeta.textContent = `Search phrase: "${query}"`;
    setDashboardState(error.message, false);
    renderLockedResults("Grouped Results", "Locked to selected entity", "", { hidden: false });
  }
}

dom.searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = dom.searchInput.value.trim();
  if (!query) {
    dom.searchNote.textContent = "Enter a query before searching.";
    return;
  }
  dom.searchNote.textContent = "Searching DOAJ...";
  try {
    await runSearch(query, { updateUrl: true });
    dom.searchNote.textContent = "Results are grouped into publishers, journals, and articles. Select any result for detail.";
    showHomeView();
  } catch (error) {
    dom.searchNote.textContent = error.message;
    dom.resultsMeta.textContent = "Search failed";
    setResultsState(error.message, false);
  }
});

dom.backToSearch.addEventListener("click", () => {
  if (!state.search.query) {
    syncUrl("", "", false);
  } else {
    syncUrl(state.search.query, "", false);
  }
  void renderRoute();
});

window.addEventListener("popstate", () => {
  void renderRoute();
});

window.addEventListener("hashchange", () => {
  void renderRoute();
});

await renderRoute();
