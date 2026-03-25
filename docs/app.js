const API_BASE = "https://doaj.org/api/search";
const MAX_LIVE_JOURNALS = 60;
const MAX_LIVE_ARTICLES = 80;
const JOURNAL_CORPUS_PAGE_SIZE = 50;
const JOURNAL_CORPUS_MAX_PAGES = 30;
const JOURNAL_CORPUS_MAX_RECORDS = 1500;
const MATCHING_RESULT_LIMIT = 20;
const MATCHING_JOURNAL_QUERY_PAGE_SIZE = 20;
const MATCHING_ARTICLE_QUERY_PAGE_SIZE = 20;
const MATCHING_QUERY_COUNT = 6;
const MATCHING_RESOLUTION_LIMIT = 12;
const MATCHING_ENRICH_LIMIT = 8;
const MATCHING_FETCH_CONCURRENCY = 2;
const MATCHING_ENRICH_PAGE_SIZE = 25;
const MATCHING_ENRICH_MAX_PAGES = 6;
const MATCHING_ENRICH_MAX_RECORDS = 150;
const MATCHING_MIN_ABSTRACT_LENGTH = 240;
const FETCH_TIMEOUT_MS = 18000;
const MATCHING_MODEL_URL = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";
const MATCHING_MODEL_ID = "Xenova/all-MiniLM-L6-v2";

const STOPWORDS = new Set([
  "abstract",
  "above",
  "across",
  "about",
  "adalah",
  "afterwards",
  "again",
  "against",
  "after",
  "akan",
  "also",
  "almost",
  "along",
  "already",
  "although",
  "among",
  "amongst",
  "another",
  "anyone",
  "anything",
  "anywhere",
  "antara",
  "article",
  "articles",
  "atau",
  "author",
  "authors",
  "based",
  "bagi",
  "bahwa",
  "below",
  "beside",
  "besides",
  "between",
  "before",
  "been",
  "being",
  "bisa",
  "both",
  "bukan",
  "cause",
  "can",
  "compared",
  "concerning",
  "conclusion",
  "conclusions",
  "consists",
  "containing",
  "dan",
  "dapat",
  "dari",
  "defined",
  "demikian",
  "dengan",
  "described",
  "describes",
  "description",
  "descriptive",
  "detail",
  "different",
  "dilakukan",
  "during",
  "dalam",
  "data",
  "dengan",
  "didapatkan",
  "diperoleh",
  "discussed",
  "discussion",
  "does",
  "doi",
  "done",
  "each",
  "either",
  "elsewhere",
  "especially",
  "every",
  "example",
  "for",
  "from",
  "further",
  "furthermore",
  "given",
  "greater",
  "guna",
  "hanya",
  "here",
  "however",
  "hasil",
  "identifies",
  "including",
  "indicated",
  "intended",
  "involving",
  "itself",
  "have",
  "having",
  "higher",
  "indicate",
  "indicates",
  "investigate",
  "investigated",
  "investigation",
  "into",
  "keadaan",
  "kegiatan",
  "kemudian",
  "kepada",
  "kerja",
  "journal",
  "journals",
  "juga",
  "kami",
  "karena",
  "kata",
  "keywords",
  "lebih",
  "less",
  "maka",
  "make",
  "many",
  "means",
  "melalui",
  "menjadi",
  "menggunakan",
  "menunjukkan",
  "merupakan",
  "method",
  "methods",
  "model",
  "models",
  "more",
  "moreover",
  "most",
  "much",
  "mereka",
  "mostly",
  "must",
  "needed",
  "needs",
  "neither",
  "none",
  "normally",
  "noted",
  "obtained",
  "often",
  "other",
  "others",
  "overall",
  "oleh",
  "pada",
  "para",
  "particular",
  "particularly",
  "penelitian",
  "pengaruh",
  "performed",
  "perhaps",
  "possible",
  "present",
  "presented",
  "primarily",
  "provides",
  "provide",
  "publisher",
  "publishers",
  "regarding",
  "related",
  "reported",
  "respectively",
  "results",
  "research",
  "review",
  "same",
  "scope",
  "section",
  "sections",
  "sebagai",
  "sebuah",
  "secara",
  "sehingga",
  "selain",
  "selama",
  "selected",
  "selection",
  "several",
  "shows",
  "showed",
  "similar",
  "since",
  "sistem",
  "some",
  "still",
  "such",
  "serta",
  "study",
  "studies",
  "subject",
  "subjects",
  "system",
  "systems",
  "table",
  "tables",
  "than",
  "that",
  "them",
  "then",
  "they",
  "their",
  "theirs",
  "tentang",
  "terjadi",
  "terhadap",
  "tersebut",
  "terutama",
  "the",
  "these",
  "this",
  "those",
  "throughout",
  "through",
  "thus",
  "title",
  "toward",
  "towards",
  "under",
  "untuk",
  "upper",
  "used",
  "useful",
  "uses",
  "using",
  "various",
  "very",
  "well",
  "were",
  "what",
  "when",
  "where",
  "whereas",
  "which",
  "while",
  "whose",
  "within",
  "without",
  "yang",
  "yakni",
  "yaitu",
  "yearsold",
  "year",
  "years",
  "yet",
  "with",
  "would",
]);

const state = {
  ui: {
    mode: "main-search",
  },
  search: {
    query: "",
    fetchedAt: null,
    groups: null,
  },
  matching: {
    abstract: "",
    submitted: false,
    fetchedAt: null,
    terms: [],
    phrases: [],
    queries: [],
    results: [],
    status: "idle",
    rankingLabel: "",
    modelStatus: "idle",
    modelError: "",
    rerankToken: 0,
    selectedJournalKey: "",
  },
  entities: {
    publisher: new Map(),
    journal: new Map(),
    article: new Map(),
  },
  standaloneJournal: null,
};

const dom = {
  modeMainSearch: document.querySelector("#mode-main-search"),
  modeJournalMatching: document.querySelector("#mode-journal-matching"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  searchNote: document.querySelector("#search-note"),
  matchingForm: document.querySelector("#matching-form"),
  matchingAbstract: document.querySelector("#matching-abstract"),
  matchingNote: document.querySelector("#matching-note"),
  matchingMeta: document.querySelector("#matching-meta"),
  matchingPanel: document.querySelector("#matching-panel"),
  matchingState: document.querySelector("#matching-state"),
  matchingResults: document.querySelector("#matching-results"),
  hero: document.querySelector(".hero"),
  heroMainSearch: document.querySelector("#hero-main-search"),
  heroJournalMatching: document.querySelector("#hero-journal-matching"),
  detailBreadcrumb: document.querySelector("#detail-breadcrumb"),
  homeView: document.querySelector("#home-view"),
  resultsPanel: document.querySelector("#results-panel"),
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

let matchingModelPromise = null;

function getChartTheme() {
  const styles = getComputedStyle(document.documentElement);
  return {
    panel: styles.getPropertyValue("--panel-strong").trim() || "#ffffff",
    muted: styles.getPropertyValue("--muted").trim() || "#5c5956",
    line: styles.getPropertyValue("--line").trim() || "#d7d2ce",
    accent: styles.getPropertyValue("--accent").trim() || "#fd5a3b",
    accentSoft: styles.getPropertyValue("--accent-soft").trim() || "rgba(253, 90, 59, 0.14)",
    warm: styles.getPropertyValue("--warm").trim() || "#fa9a87",
    warmSoft: styles.getPropertyValue("--warm-soft").trim() || "rgba(250, 154, 135, 0.2)",
    warmStrong: styles.getPropertyValue("--warm-strong").trim() || "#8f311c",
    article: styles.getPropertyValue("--article").trim() || "#47a178",
    articleSoft: styles.getPropertyValue("--article-soft").trim() || "rgba(71, 161, 120, 0.16)",
    articleStrong: styles.getPropertyValue("--article-strong").trim() || "#2f6e52",
    accentStrong: styles.getPropertyValue("--accent-strong").trim() || "#982e0a",
  };
}

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

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

function formatCountryName(value) {
  const raw = `${value || ""}`.trim();
  if (!raw) {
    return "";
  }
  if (/^[A-Za-z]{2}$/.test(raw) && regionNames) {
    return regionNames.of(raw.toUpperCase()) || raw.toUpperCase();
  }
  return raw;
}

function normalizeIssn(value) {
  return `${value || ""}`.trim().toUpperCase();
}

function issnPortalUrl(value) {
  const issn = normalizeIssn(value);
  return issn ? `https://portal.issn.org/resource/ISSN/${encodeURIComponent(issn)}` : "";
}

function renderIssnLinks(issns, { emptyText = "Not exposed", className = "inline-link" } = {}) {
  const values = unique((issns || []).map(normalizeIssn).filter(Boolean));
  if (!values.length) {
    return emptyText;
  }
  return values
    .map(
      (issn) =>
        `<a class="${className}" href="${escapeHtml(issnPortalUrl(issn))}" target="_blank" rel="noopener noreferrer">${escapeHtml(issn)}</a>`
    )
    .join(", ");
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

function tokenList(text, { minLength = 3 } = {}) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token && token.length >= minLength && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

function phraseCounts(text, { minWords = 2, maxWords = 3, limit = 12 } = {}) {
  const tokens = tokenList(text, { minLength: 4 });
  const counter = new Map();
  for (let size = minWords; size <= maxWords; size += 1) {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      const phraseTokens = tokens.slice(index, index + size);
      if (new Set(phraseTokens).size < size) {
        continue;
      }
      const phrase = phraseTokens.join(" ");
      counter.set(phrase, (counter.get(phrase) || 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function clampText(value, limit = 1400) {
  const text = `${value || ""}`.trim();
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(limit - 1, 0)).trimEnd()}…`;
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
  return formatCountryName(journalBib(record).publisher?.country || "");
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

function journalAimsScope(record) {
  const refs = journalBib(record).ref || {};
  return refs.aims_scope || refs.oa_statement || "";
}

function journalAuthorGuidelines(record) {
  const refs = journalBib(record).ref || {};
  return refs.author_instructions || null;
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

function articleJournalCountry(record) {
  return formatCountryName(articleBib(record).journal?.country || "");
}

function articleJournalVolume(record) {
  return `${articleBib(record).journal?.volume || ""}`.trim();
}

function articleJournalIssue(record) {
  return `${articleBib(record).journal?.number || articleBib(record).journal?.issue || ""}`.trim();
}

function articlePageRange(record) {
  const pages = `${articleBib(record).pages || ""}`.trim();
  if (pages) {
    return pages;
  }
  const start = `${articleBib(record).start_page || ""}`.trim();
  const end = `${articleBib(record).end_page || ""}`.trim();
  if (start && end) {
    return `${start}-${end}`;
  }
  return start || end || "";
}

function articleVolumeIssue(record) {
  const volume = articleJournalVolume(record);
  const issue = articleJournalIssue(record);
  const parts = [];
  if (volume) {
    parts.push(`Vol. ${volume}`);
  }
  if (issue) {
    parts.push(`no. ${issue}`);
  }
  return parts.join(", ");
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

function journalSignature(record) {
  const issns = journalIssns(record).map(normalizeText).filter(Boolean).sort();
  return {
    id: `${record?.id || ""}`.trim(),
    titleKey: normalizeText(journalTitle(record)),
    publisherKey: normalizeText(journalPublisher(record)),
    issns,
    primaryKey: `${record?.id || ""}`.trim() || `${normalizeText(journalTitle(record))}::${issns.join("|")}`,
  };
}

function articleJournalSignature(record) {
  const issns = articleJournalIssns(record).map(normalizeText).filter(Boolean).sort();
  return {
    titleKey: normalizeText(articleJournalTitle(record)),
    publisherKey: normalizeText(articleJournalPublisher(record)),
    issns,
  };
}

function sameJournalSignature(left, right) {
  if (!left || !right) {
    return false;
  }
  if (left.id && right.id && left.id === right.id) {
    return true;
  }
  if (left.issns.length && right.issns.length) {
    return left.issns.some((issn) => right.issns.includes(issn));
  }
  return Boolean(left.titleKey) && left.titleKey === right.titleKey && (!left.publisherKey || !right.publisherKey || left.publisherKey === right.publisherKey);
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
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Request failed (${response.status}): ${message.slice(0, 180)}`);
    }
    return response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Live DOAJ request timed out.");
    }
    if (error instanceof TypeError) {
      throw new Error("Live DOAJ request failed in this browser.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
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

async function fetchPaginatedSafe(entity, query, options = {}) {
  try {
    const payload = await fetchPaginated(entity, query, options);
    return { ...payload, ok: true, error: "" };
  } catch (error) {
    return {
      query,
      entity,
      total: 0,
      capped: false,
      results: [],
      ok: false,
      error: error.message || "Live DOAJ request failed.",
    };
  }
}

async function mapWithConcurrency(items, limit, iteratee) {
  const values = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      values[currentIndex] = await iteratee(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length || 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return values;
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

function quotedPhrase(value) {
  return `"${`${value || ""}`.replaceAll('"', '\\"').trim()}"`;
}

function normalizeSearchQuery(query) {
  const compact = `${query || ""}`
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) {
    return "";
  }

  const parts = compact.match(/"[^"]*"|\S+/g) || [];
  return parts
    .map((part) => (/^(and|or|not)$/i.test(part) ? part.toUpperCase() : part))
    .join(" ");
}

function buildJournalCorpusQueries(journalRecord) {
  return unique([
    journalTitle(journalRecord) ? quotedPhrase(journalTitle(journalRecord)) : "",
    ...journalIssns(journalRecord).map((issn) => quotedPhrase(issn)),
  ]).filter(Boolean);
}

async function fetchJournalCorpusArticles(
  journalRecord,
  {
    pageSize = JOURNAL_CORPUS_PAGE_SIZE,
    maxPages = JOURNAL_CORPUS_MAX_PAGES,
    maxRecords = JOURNAL_CORPUS_MAX_RECORDS,
  } = {}
) {
  const queries = buildJournalCorpusQueries(journalRecord);
  const byId = new Map();

  for (const query of queries) {
    const payload = await fetchPaginated("articles", query, {
      pageSize,
      maxPages,
      maxRecords,
    });
    for (const article of filterArticlesForJournal(payload.results || [], journalRecord)) {
      byId.set(`${article.id}`, article);
    }
  }

  return sortArticles([...byId.values()]);
}

function looksLikeEnglishAbstract(text) {
  const tokens = normalizeText(text).split(/\s+/).filter(Boolean);
  if (tokens.length < 40) {
    return false;
  }
  const englishSignals = new Set([
    "the",
    "and",
    "with",
    "from",
    "this",
    "that",
    "study",
    "results",
    "method",
    "analysis",
    "journal",
    "article",
    "using",
    "were",
    "between",
    "among",
  ]);
  const indonesianSignals = new Set([
    "dan",
    "yang",
    "dengan",
    "untuk",
    "pada",
    "dalam",
    "adalah",
    "hasil",
    "penelitian",
    "terhadap",
    "dari",
    "akan",
  ]);
  const englishCount = tokens.filter((token) => englishSignals.has(token)).length;
  const indonesianCount = tokens.filter((token) => indonesianSignals.has(token)).length;
  return englishCount >= indonesianCount;
}

function buildAbstractProfile(abstract) {
  const cleanAbstract = `${abstract || ""}`.trim();
  const termItems = topTerms([cleanAbstract], 12);
  const phraseItems = phraseCounts(cleanAbstract, { minWords: 2, maxWords: 3, limit: 8 });
  const terms = termItems.map((item) => item.name);
  const phrases = phraseItems.map((item) => item.name);
  const fallbackTerms = tokenList(cleanAbstract, { minLength: 5 }).slice(0, 6);
  const queries = unique([
    ...phrases.slice(0, 3).map(quotedPhrase),
    ...terms.slice(0, MATCHING_QUERY_COUNT - 3),
    ...fallbackTerms,
  ]).slice(0, MATCHING_QUERY_COUNT);

  return {
    abstract: cleanAbstract,
    terms,
    phrases,
    queries,
    lexicalText: unique([...phrases, ...terms]).join(" "),
  };
}

function matchingSummaryText(result) {
  return matchingJournalSummary(result.journal, result.matchedTerms, { articleSignals: result.articleCount });
}

function buildMatchingCandidateText(result) {
  const journal = result.journal;
  const seedArticles = result.seedArticles || [];
  const parts = [
    journalTitle(journal),
    journalPublisher(journal),
    journalCountry(journal),
    journalLanguages(journal).join(" "),
    journalSubjects(journal).join(" "),
    journalKeywords(journal).join(" "),
    journalReview(journal).join(" "),
    journalAimsScope(journal),
    seedArticles.map(articleTitle).join(" "),
    seedArticles.map(articleAbstract).join(" "),
    seedArticles.flatMap(articleKeywords).join(" "),
    seedArticles.flatMap(articleSubjects).join(" "),
  ];
  return clampText(parts.filter(Boolean).join(". "), 3200);
}

function overlapTerms(profile, text, limit = 4) {
  const haystack = ` ${normalizeText(text)} `;
  const matched = [];
  for (const phrase of profile.phrases) {
    const value = normalizeText(phrase);
    if (value && haystack.includes(` ${value} `)) {
      matched.push(phrase);
    }
  }
  for (const term of profile.terms) {
    const value = normalizeText(term);
    if (value && haystack.includes(` ${value} `)) {
      matched.push(term);
    }
  }
  return unique(matched).slice(0, limit);
}

function lexicalMatchScore(profile, text, { articleBoost = 0 } = {}) {
  const haystack = ` ${normalizeText(text)} `;
  let score = 0;
  const matched = [];
  profile.phrases.forEach((phrase, index) => {
    const weight = 6 - Math.min(index, 4);
    const value = normalizeText(phrase);
    if (value && haystack.includes(` ${value} `)) {
      score += weight;
      matched.push(phrase);
    }
  });
  profile.terms.forEach((term, index) => {
    const weight = 3 - Math.min(index * 0.15, 1.6);
    const value = normalizeText(term);
    if (value && haystack.includes(` ${value} `)) {
      score += weight;
      matched.push(term);
    }
  });
  return {
    score: score + Math.min(articleBoost, 5),
    matchedTerms: unique(matched).slice(0, 4),
  };
}

function cosineSimilarity(left, right) {
  if (!left?.length || !right?.length || left.length !== right.length) {
    return 0;
  }
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (!leftNorm || !rightNorm) {
    return 0;
  }
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function tensorRows(tensor) {
  if (!tensor) {
    return [];
  }
  if (typeof tensor.tolist === "function") {
    const rows = tensor.tolist();
    return Array.isArray(rows[0]) ? rows : [rows];
  }
  if (Array.isArray(tensor)) {
    return Array.isArray(tensor[0]) ? tensor : [tensor];
  }
  return [];
}

async function loadMatchingModel() {
  if (state.matching.modelStatus === "ready" && matchingModelPromise) {
    return matchingModelPromise;
  }
  if (matchingModelPromise) {
    return matchingModelPromise;
  }
  state.matching.modelStatus = "loading";
  state.matching.modelError = "";
  matchingModelPromise = import(MATCHING_MODEL_URL)
    .then(async ({ env, pipeline }) => {
      env.allowLocalModels = false;
      const extractor = await pipeline("feature-extraction", MATCHING_MODEL_ID);
      state.matching.modelStatus = "ready";
      return extractor;
    })
    .catch((error) => {
      state.matching.modelStatus = "failed";
      state.matching.modelError = error.message || "Semantic reranking is unavailable.";
      matchingModelPromise = null;
      throw error;
    });
  return matchingModelPromise;
}

async function embedTexts(texts) {
  const extractor = await loadMatchingModel();
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return tensorRows(output);
}

function mergeMatchingCandidate(map, journal, { source = "journal", seedArticles = [] } = {}) {
  if (!journal?.id) {
    return null;
  }
  const signature = journalSignature(journal);
  const existing = [...map.values()].find((candidate) => sameJournalSignature(candidate.signature, signature));
  if (existing) {
    const currentUpdated = journalSortTimestamp(existing.journal);
    const nextUpdated = journalSortTimestamp(journal);
    if (nextUpdated > currentUpdated) {
      existing.journal = journal;
      existing.signature = signature;
    }
    existing.sources.add(source);
    seedArticles.forEach((article) => existing.seedArticles.set(`${article.id}`, article));
    return existing;
  }
  const candidate = {
    entityKey: `${journal.id}`,
    journal,
    signature,
    seedArticles: new Map(seedArticles.map((article) => [`${article.id}`, article])),
    sources: new Set([source]),
    articleCount: seedArticles.length,
    lexicalScore: 0,
    semanticScore: null,
    finalScore: 0,
    matchedTerms: [],
    summary: "",
    rationale: "",
    rankingMode: "lexical",
    enriched: false,
    authorGuidelinesUrl: journalAuthorGuidelines(journal),
  };
  map.set(candidate.entityKey, candidate);
  return candidate;
}

function matchingArticleJournalGroup(articles) {
  const grouped = new Map();
  for (const article of articles) {
    const signature = articleJournalSignature(article);
    const key = signature.issns.join("|") || `${signature.titleKey}::${signature.publisherKey}`;
    if (!key.trim()) {
      continue;
    }
    if (!grouped.has(key)) {
      grouped.set(key, {
        signature,
        title: articleJournalTitle(article),
        publisher: articleJournalPublisher(article),
        articles: [],
      });
    }
    grouped.get(key).articles.push(article);
  }
  return [...grouped.values()]
    .sort((left, right) => right.articles.length - left.articles.length || left.signature.titleKey.localeCompare(right.signature.titleKey))
    .slice(0, MATCHING_RESOLUTION_LIMIT);
}

function resolveJournalFromResults(group, results) {
  return results.find((record) => sameJournalSignature(journalSignature(record), group.signature)) || null;
}

async function resolveArticleDerivedJournal(group) {
  const queries = unique([
    ...group.signature.issns.map(quotedPhrase),
    group.title ? quotedPhrase(group.title) : "",
  ]).filter(Boolean);
  for (const query of queries) {
    const payload = await fetchPaginatedSafe("journals", query, {
      pageSize: 10,
      maxPages: 1,
      maxRecords: 10,
    });
    if (!payload.ok) {
      continue;
    }
    const resolved = resolveJournalFromResults(group, payload.results || []);
    if (resolved) {
      return resolved;
    }
  }
  return null;
}

async function fetchMatchingCandidates(profile) {
  const queryList = profile.queries.slice(0, MATCHING_QUERY_COUNT);
  const journalPayloads = await mapWithConcurrency(
    queryList,
    MATCHING_FETCH_CONCURRENCY,
    (query) =>
      fetchPaginatedSafe("journals", query, {
        pageSize: MATCHING_JOURNAL_QUERY_PAGE_SIZE,
        maxPages: 1,
        maxRecords: MATCHING_JOURNAL_QUERY_PAGE_SIZE,
      })
  );
  const articlePayloads = await mapWithConcurrency(
    queryList,
    MATCHING_FETCH_CONCURRENCY,
    (query) =>
      fetchPaginatedSafe("articles", query, {
        pageSize: MATCHING_ARTICLE_QUERY_PAGE_SIZE,
        maxPages: 1,
        maxRecords: MATCHING_ARTICLE_QUERY_PAGE_SIZE,
      })
  );
  const errors = [
    ...journalPayloads.filter((payload) => !payload.ok).map((payload) => `journals:${payload.query}`),
    ...articlePayloads.filter((payload) => !payload.ok).map((payload) => `articles:${payload.query}`),
  ];

  const journalCandidates = new Map();
  const journalResults = sortJournals(journalPayloads.flatMap((payload) => payload.results || []));
  const articleResults = sortArticles(articlePayloads.flatMap((payload) => payload.results || []));

  for (const journal of journalResults) {
    mergeMatchingCandidate(journalCandidates, journal, { source: "journal" });
  }

  const groups = matchingArticleJournalGroup(articleResults);
  const resolutionResults = await mapWithConcurrency(
    groups,
    MATCHING_FETCH_CONCURRENCY,
    (group) => resolveArticleDerivedJournal(group)
  );

  resolutionResults.forEach((resolvedJournal, index) => {
    if (!resolvedJournal) {
      return;
    }
    mergeMatchingCandidate(journalCandidates, resolvedJournal, {
      source: "article",
      seedArticles: groups[index].articles,
    });
  });

  for (const candidate of journalCandidates.values()) {
    candidate.articleCount = candidate.seedArticles.size;
  }

  return {
    journals: [...journalCandidates.values()],
    articleResults,
    errors,
  };
}

function rankMatchingCandidates(profile, candidates, { rankingMode = "lexical" } = {}) {
  const ranked = candidates.map((candidate) => {
    const seedArticles = [...candidate.seedArticles.values()];
    const candidateText = buildMatchingCandidateText({ ...candidate, seedArticles });
    const lexical = lexicalMatchScore(profile, candidateText, { articleBoost: seedArticles.length * 0.45 });
    const semantic = candidate.semanticScore ?? null;
    const finalScore = semantic === null ? lexical.score : semantic * 100 + lexical.score * 0.28;
    const matchedTerms = lexical.matchedTerms.length ? lexical.matchedTerms : overlapTerms(profile, candidateText, 4);
    return {
      ...candidate,
      seedArticles,
      lexicalScore: lexical.score,
      finalScore,
      semanticScore: semantic,
      matchedTerms,
      summary: matchingJournalSummary(candidate.journal, matchedTerms, { articleSignals: seedArticles.length }),
      rationale: matchedTerms.length
        ? `This journal aligns with the abstract through ${matchedTerms.slice(0, 3).join(", ")}.`
        : "This journal overlaps with the abstract through live metadata and article evidence.",
      rankingMode,
      authorGuidelinesUrl: journalAuthorGuidelines(candidate.journal),
    };
  });

  return ranked
    .sort((left, right) => right.finalScore - left.finalScore || journalSortTimestamp(right.journal) - journalSortTimestamp(left.journal))
    .slice(0, MATCHING_RESULT_LIMIT);
}

async function applySemanticRerank(profile, results, rerankToken) {
  const candidateTexts = results.map(buildMatchingCandidateText);
  if (!candidateTexts.length) {
    return results;
  }
  const embeddings = await embedTexts([profile.abstract, ...candidateTexts]);
  if (state.matching.rerankToken !== rerankToken) {
    return results;
  }
  const [abstractEmbedding, ...candidateEmbeddings] = embeddings;
  return rankMatchingCandidates(
    profile,
    results.map((result, index) => ({
      ...result,
      semanticScore: cosineSimilarity(abstractEmbedding, candidateEmbeddings[index] || []),
    })),
    { rankingMode: "semantic" }
  );
}

async function enrichMatchingResults(profile, results, rerankToken) {
  const enrichedCandidates = await mapWithConcurrency(
    results.slice(0, MATCHING_ENRICH_LIMIT),
    MATCHING_FETCH_CONCURRENCY,
    async (result) => {
      try {
        const articles = await fetchJournalCorpusArticles(result.journal, {
          pageSize: MATCHING_ENRICH_PAGE_SIZE,
          maxPages: MATCHING_ENRICH_MAX_PAGES,
          maxRecords: MATCHING_ENRICH_MAX_RECORDS,
        });
        const seedMap = new Map(result.seedArticles.map((article) => [`${article.id}`, article]));
        articles.forEach((article) => seedMap.set(`${article.id}`, article));
        return {
          ...result,
          seedArticles: [...seedMap.values()],
          articleCount: seedMap.size,
          enriched: true,
        };
      } catch {
        return result;
      }
    }
  );

  const passthrough = results.slice(MATCHING_ENRICH_LIMIT);
  const combined = [...enrichedCandidates, ...passthrough];
  let reranked = rankMatchingCandidates(profile, combined, { rankingMode: "lexical+articles" });
  if (state.matching.rerankToken !== rerankToken) {
    return reranked;
  }
  try {
    reranked = await applySemanticRerank(profile, reranked, rerankToken);
  } catch {
    return reranked;
  }
  return reranked;
}

function publisherCardSummary(item) {
  const parts = [
    `${formatNumber(item.journal_count)} journals`,
    `${formatNumber(item.article_count)} query-matched articles`,
  ];
  if (item.countries.length) {
    parts.push(`${formatNumber(item.countries.length)} country${item.countries.length === 1 ? "" : "ies"}`);
  }
  if (item.languages.length) {
    parts.push(`${formatNumber(item.languages.length)} language${item.languages.length === 1 ? "" : "s"}`);
  }
  return `${parts.join(" • ")}.`;
}

function journalCardSummary(record) {
  const publisher = journalPublisher(record);
  const languages = journalLanguages(record);
  const subjects = journalSubjects(record);
  const segments = [];
  if (publisher) {
    segments.push(`Published by ${publisher}.`);
  }
  if (languages.length) {
    segments.push(`Languages: ${languages.join(", ")}.`);
  }
  if (subjects.length) {
    segments.push(`Main subjects: ${subjects.slice(0, 2).join(", ")}.`);
  }
  return segments.join(" ") || "Journal metadata is available in DOAJ.";
}

function matchingJournalSummary(record, matchedTerms = [], { articleSignals = 0 } = {}) {
  const subjects = journalSubjects(record);
  const review = journalReview(record);
  const segments = [];
  if (subjects.length) {
    segments.push(`Focus areas include ${subjects.slice(0, 3).join(", ")}.`);
  }
  if (matchedTerms.length) {
    segments.push(`Matched themes: ${matchedTerms.slice(0, 4).join(", ")}.`);
  }
  if (articleSignals) {
    segments.push(`${articleSignals} live article signal${articleSignals === 1 ? "" : "s"} support this recommendation.`);
  }
  if (review.length) {
    segments.push(`Review model: ${review.slice(0, 2).join(", ")}.`);
  }
  if (!segments.length) {
    return journalCardSummary(record);
  }
  return segments.join(" ");
}

function findJournalForArticle(articleRecord, journals) {
  const articleTitleKey = normalizeText(articleJournalTitle(articleRecord));
  const articleIssns = new Set(articleJournalIssns(articleRecord).map((value) => normalizeText(value)));
  return (journals || []).find((journalRecord) => {
    const sameTitle = articleTitleKey && normalizeText(journalTitle(journalRecord)) === articleTitleKey;
    const sameIssn = journalIssns(journalRecord).some((issn) => articleIssns.has(normalizeText(issn)));
    return sameTitle || sameIssn;
  }) || null;
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
    meta_label: searchContext.query
      ? `Search phrase: "${searchContext.query}" • Fetched ${formatDisplayDate(searchContext.fetchedAt)}`
      : `Fetched ${formatDisplayDate(searchContext.fetchedAt)}`,
    scope_note: searchContext.query
      ? `All charts and related lists on this page are restricted to the original search phrase: "${searchContext.query}".`
      : "This publisher view reflects the currently loaded DOAJ records.",
    summary: `${publisher.title} currently appears with ${journals.length} journals and ${articles.length} query-matched articles across ${unique(countries).length || 0} publisher countr${unique(countries).length === 1 ? "y" : "ies"} and ${languages.length} language${languages.length === 1 ? "" : "s"}.`,
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
        text: searchContext.query
          ? `All charts and related lists on this page are restricted to the original search phrase: "${searchContext.query}".`
          : "This publisher view reflects the currently loaded DOAJ records.",
      },
    ],
  };
}

function buildJournalPayload(
  journal,
  allArticles,
  searchContext,
  { matchedArticles = [], contextType = "search", matchingContext = null } = {}
) {
  const languages = journalLanguages(journal);
  const licenses = journalLicenses(journal);
  const review = journalReview(journal);
  const subjects = journalSubjects(journal);
  const affiliations = allArticles.flatMap(articleAffiliations);
  const articleSubjectTerms = allArticles.flatMap(articleSubjects);
  const articleWords = topTerms(
    allArticles.flatMap((article) => [
      articleTitle(article),
      articleAbstract(article),
      ...articleKeywords(article),
    ]),
    24
  );
  const publicationYears = timelinePairs(allArticles.map(articleYear).filter(Boolean));
  const createdYears = timelinePairs(allArticles.map((article) => parseIsoYear(article.created_date)).filter(Boolean));
  const updateYear = parseIsoYear(journal.last_updated);
  const labels = unique([
    ...publicationYears.map((item) => item.name),
    ...createdYears.map((item) => item.name),
    ...(updateYear ? [updateYear] : []),
  ]).sort((left, right) => left.localeCompare(right));
  const publicationMap = new Map(publicationYears.map((item) => [item.name, item.value]));
  const createdMap = new Map(createdYears.map((item) => [item.name, item.value]));
  const authorGuidelinesUrl = journalAuthorGuidelines(journal);
  const summary = contextType === "matching"
    ? `${journalTitle(journal)} aligns with the submitted abstract through ${matchingContext?.matchedTerms?.slice(0, 3).join(", ") || "live metadata and article themes"}. This journal currently exposes ${allArticles.length} retrievable DOAJ article record${allArticles.length === 1 ? "" : "s"}.`
    : searchContext.query
      ? `${journalTitle(journal)} currently exposes ${allArticles.length} currently retrievable DOAJ article record${allArticles.length === 1 ? "" : "s"}. The matched list remains restricted to the original search phrase and currently shows ${matchedArticles.length} item${matchedArticles.length === 1 ? "" : "s"}.`
      : `${journalTitle(journal)} currently exposes ${allArticles.length} currently retrievable DOAJ article record${allArticles.length === 1 ? "" : "s"} from live DOAJ journal retrieval.`;
  const metaLabel = contextType === "matching"
    ? `Journal Matching • Fetched ${formatDisplayDate(searchContext.fetchedAt)}`
    : searchContext.query
      ? `Search phrase: "${searchContext.query}" • Fetched ${formatDisplayDate(searchContext.fetchedAt)}`
      : `Fetched ${formatDisplayDate(searchContext.fetchedAt)}`;
  const scopeNote = contextType === "matching"
    ? "This journal dashboard was opened from Journal Matching. KPI charts still use live DOAJ article records for this journal only."
    : searchContext.query
      ? `The left-side matched list is restricted to "${searchContext.query}", but the charts use all currently retrievable DOAJ articles for this journal.`
      : "The charts on this page use all currently retrievable DOAJ articles for this journal.";

  return {
    entity_type: "journal",
    title: journalTitle(journal),
    fetched_at: searchContext.fetchedAt,
    query: searchContext.query,
    context_type: contextType,
    meta_label: metaLabel,
    scope_note: scopeNote,
    journalWebsite: journalWebsite(journal),
    authorGuidelinesUrl,
    issns: journalIssns(journal),
    summary,
    matchingContext,
    kpis: [
      { label: "Journal title", value: journalTitle(journal), tone: "accent" },
      { label: "Publisher", value: journalPublisher(journal) || "-" },
      { label: "ISSN / EISSN presence", value: boolStatus(journalIssns(journal).length > 0) },
      { label: "Total DOAJ articles", value: formatNumber(allArticles.length), tone: "accent", detail: "Used for charts on this page." },
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
      article_keywords: makeTagChart("Article keywords", countBy(allArticles.flatMap(articleKeywords), 18)),
      article_languages: makePieChart("Article language distribution", countBy(allArticles.flatMap(articleJournalLanguages), 8)),
      author_count_distribution: makeBarChart(
        "Author count distribution",
        countBy(allArticles.map((article) => `${articleAuthors(article).length}`), 8)
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
          : "Not enough journal article text is available to build a stable word cloud.",
      },
      {
        title: "Metadata coverage",
        text: affiliations.length || articleSubjectTerms.length || review.length
          ? "The journal exposes enough article-linked metadata for author, affiliation, and subject-level charts."
          : "The journal has limited query-matched metadata for article-level charting.",
      },
      {
        title: "Query scope",
        text: scopeNote,
      },
    ],
  };
}

function buildArticlePayload(article, searchContext) {
  const linkedJournal = findJournalForArticle(article, searchContext.groups?.journals || []);
  const authors = articleAuthorNames(article);
  const authorEntries = articleAuthors(article);
  const affiliations = articleAffiliations(article);
  const subjects = articleSubjects(article);
  const keywords = articleKeywords(article);
  const abstractTerms = topTerms([articleAbstract(article)], 24);
  const linkedJournalTitle = linkedJournal ? journalTitle(linkedJournal) : articleJournalTitle(article);
  const linkedJournalPublisher = linkedJournal ? journalPublisher(linkedJournal) : articleJournalPublisher(article);
  const linkedJournalIssns = linkedJournal ? journalIssns(linkedJournal) : articleJournalIssns(article);
  const linkedJournalLanguages = linkedJournal ? journalLanguages(linkedJournal) : articleJournalLanguages(article);
  const linkedJournalCountry = linkedJournal ? journalCountry(linkedJournal) : articleJournalCountry(article);
  const linkedJournalSubjects = linkedJournal ? journalSubjects(linkedJournal) : [];
  const linkedJournalWebsite = linkedJournal ? journalWebsite(linkedJournal) : null;
  const volumeIssue = articleVolumeIssue(article);
  const pages = articlePageRange(article);

  return {
    entity_type: "article",
    title: articleTitle(article),
    fetched_at: searchContext.fetchedAt,
    query: searchContext.query,
    meta_label: searchContext.query
      ? `Search phrase: "${searchContext.query}" • Fetched ${formatDisplayDate(searchContext.fetchedAt)}`
      : `Fetched ${formatDisplayDate(searchContext.fetchedAt)}`,
    scope_note: searchContext.query
      ? `This article detail page is tied to the original search phrase "${searchContext.query}".`
      : "This article detail page reflects the selected DOAJ article record.",
    doi: articleDoi(article),
    doiUrl: articleDoiUrl(article),
    fulltextUrl: articleFulltextUrl(article),
    year: articleYear(article),
    volumeIssue,
    pages,
    authors: authorEntries,
    abstract: articleAbstract(article),
    keywords,
    subjects,
    journalTitle: linkedJournalTitle,
    journalPublisher: linkedJournalPublisher,
    journalIssns: linkedJournalIssns,
    journalLanguages: linkedJournalLanguages,
    journalCountry: linkedJournalCountry,
    journalSubjects: linkedJournalSubjects,
    journalWebsite: linkedJournalWebsite,
    journalEntityKey: linkedJournal ? `${linkedJournal.id}` : null,
    article,
    summary: `${articleTitle(article)} is shown as an article detail view restricted to the original search phrase.`,
    kpis: [
      { label: "Article year", value: articleYear(article) || "-" },
      { label: "Journal", value: linkedJournalTitle || "-", tone: "accent" },
      { label: "Publisher", value: linkedJournalPublisher || "-" },
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
        text: searchContext.query
          ? `This article detail page is tied to the original search phrase "${searchContext.query}".`
          : "This article detail page reflects the selected DOAJ article record.",
      },
    ],
  };
}

function setResultsState(message, hidden = false) {
  dom.resultsState.textContent = message;
  dom.resultsState.classList.toggle("hidden", hidden);
}

function setMatchingState(message, hidden = false) {
  dom.matchingState.textContent = message;
  dom.matchingState.classList.toggle("hidden", hidden);
}

function setDetailResultsState(message, hidden = false) {
  dom.detailResultsState.textContent = message;
  dom.detailResultsState.classList.toggle("hidden", hidden);
}

function setDashboardState(message, hidden = false) {
  dom.dashboardState.textContent = message;
  dom.dashboardState.classList.toggle("hidden", hidden);
}

function currentModeFromUrl() {
  return new URL(window.location.href).searchParams.get("mode") === "matching" ? "matching" : "main-search";
}

function syncUrl(query, hash = "", replace = false, { mode = currentModeFromUrl() } = {}) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }
  if (mode === "matching") {
    url.searchParams.set("mode", "matching");
  } else {
    url.searchParams.delete("mode");
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
  return normalizeSearchQuery(new URL(window.location.href).searchParams.get("q") || "");
}

function clearEntityMaps() {
  state.entities.publisher.clear();
  state.entities.journal.clear();
  state.entities.article.clear();
}

function indexGroups(groups) {
  state.standaloneJournal = null;
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

function updateModeButtons(mode) {
  dom.modeMainSearch.classList.toggle("is-active", mode === "main-search");
  dom.modeJournalMatching.classList.toggle("is-active", mode === "matching");
}

function showHomeView({ mode = currentModeFromUrl(), showResults = true, showMatchingResults = false } = {}) {
  state.ui.mode = mode;
  dom.hero.classList.remove("hidden");
  dom.detailBreadcrumb.classList.add("hidden");
  dom.homeView.classList.remove("hidden");
  dom.heroMainSearch.classList.toggle("hidden", mode !== "main-search");
  dom.heroJournalMatching.classList.toggle("hidden", mode !== "matching");
  dom.resultsPanel.classList.toggle("hidden", mode !== "main-search" || !showResults);
  dom.matchingPanel.classList.toggle("hidden", mode !== "matching" || !showMatchingResults);
  dom.detailView.classList.add("hidden");
  dom.detailView.classList.remove("single-column");
  dom.relatedPanel.classList.remove("hidden");
  updateModeButtons(mode);
}

function showDetailView({ singleColumn = false } = {}) {
  dom.hero.classList.add("hidden");
  dom.detailBreadcrumb.classList.remove("hidden");
  dom.homeView.classList.add("hidden");
  dom.detailView.classList.remove("hidden");
  dom.detailView.classList.toggle("single-column", singleColumn);
  dom.relatedPanel.classList.toggle("hidden", singleColumn);
}

function navigateToEntity(entityType, entityKey) {
  const mode = currentModeFromUrl();
  if (mode === "matching") {
    syncUrl("", `${entityType}/${encodeURIComponent(entityKey)}`, false, { mode: "matching" });
    void renderRoute();
    return;
  }
  if (!state.search.query) {
    return;
  }
  syncUrl(state.search.query, `${entityType}/${encodeURIComponent(entityKey)}`, false, { mode: "main-search" });
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
        <p class="result-summary-text">${escapeHtml(publisherCardSummary(item))}</p>
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
        <p class="result-summary-text">${escapeHtml(journalCardSummary(record))}</p>
        <div class="result-summary">
          <p><strong>ISSN:</strong> ${renderIssnLinks(journalIssns(record), { className: "result-link" })}</p>
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

function renderMatchingJournalCard(result, { compact = false } = {}) {
  const journal = result.journal;
  const score = Number.isFinite(result.finalScore) ? result.finalScore : 0;
  const scoreLabel = result.semanticScore === null
    ? `${score.toFixed(1)} lexical`
    : `${(Math.max(result.semanticScore, 0) * 100).toFixed(1)} semantic`;
  const themes = result.matchedTerms.length
    ? `<div class="tags-wrap">${result.matchedTerms.map((item) => `<span class="tag-item">${escapeHtml(item)}</span>`).join("")}</div>`
    : `<span class="muted-line">No explicit theme overlap was extracted.</span>`;
  return `
    <article class="result-card ${compact ? "result-card--compact" : "result-card--matching"}">
      <div class="result-header">
        <div>
          <div class="result-title">${escapeHtml(journalTitle(journal))}</div>
          <div class="result-meta">${escapeHtml(journalPublisher(journal) || "Publisher unavailable")} • ${escapeHtml(journalCountry(journal) || "Country unavailable")} • ${escapeHtml(journalDisplayDate(journal))}</div>
        </div>
        <span class="result-badge" data-kind="journal">Journal</span>
      </div>
      <div class="result-body">
        <p class="result-summary-text">${escapeHtml(result.summary || matchingSummaryText(result))}</p>
        <div class="mini-grid matching-mini-grid">
          <div class="mini-stat">
            <span class="mini-label">Match score</span>
            <strong class="mini-value">${escapeHtml(scoreLabel)}</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Evidence</span>
            <strong class="mini-value">${escapeHtml(`${result.articleCount || 0} article signal${result.articleCount === 1 ? "" : "s"}`)}</strong>
          </div>
        </div>
        <div class="matching-theme-block">
          <span class="mini-label">Matched themes</span>
          ${themes}
        </div>
      </div>
      <div class="result-actions">
        <div class="muted-line">${escapeHtml(result.rankingMode === "semantic" ? "Semantic reranking applied" : "Live lexical ranking")}</div>
        <button class="result-action" data-entity-type="journal" data-entity-key="${escapeHtml(result.entityKey)}">Open</button>
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

function renderMatchedArticleTitleCard(record) {
  return `
    <article class="result-card result-card--compact">
      <div class="result-header">
        <div>
          <div class="result-title">${escapeHtml(articleTitle(record))}</div>
        </div>
        <span class="result-badge" data-kind="article">Article</span>
      </div>
      <div class="result-actions">
        <div class="result-links">${articleYearRouteLink(record)}</div>
        <button class="result-action" data-entity-type="article" data-entity-key="${escapeHtml(`${record.id}`)}">Open</button>
      </div>
    </article>
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

function renderMatchingResults(results) {
  dom.matchingResults.innerHTML = results.length
    ? results.map((result) => renderMatchingJournalCard(result)).join("")
    : "";
  attachOpenHandlers(dom.matchingResults);
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
  const theme = getChartTheme();
  const palette = [
    { color: theme.accentStrong, background: theme.accentSoft, border: theme.accent },
    { color: theme.warmStrong, background: theme.warmSoft, border: theme.warm },
    { color: theme.articleStrong, background: theme.articleSoft, border: theme.article },
    { color: theme.accent, background: "rgba(255, 255, 255, 0.86)", border: theme.line },
  ];
  const max = Math.max(...items.map((item) => item.value));
  const min = Math.min(...items.map((item) => item.value));
  return items
    .map((item, index) => {
      const ratio = max === min ? 0.6 : (item.value - min) / (max - min);
      const size = 1.1 + ratio * 1.8;
      const opacity = 0.6 + ratio * 0.4;
      const rotation = index % 5 === 0 ? "-2deg" : index % 3 === 0 ? "2deg" : "0deg";
      const tokenTheme = palette[index % palette.length];
      return `
        <span
          class="wordcloud-item"
          style="font-size:${size}rem;opacity:${opacity};transform:rotate(${rotation});color:${tokenTheme.color};background:${tokenTheme.background};border-color:${tokenTheme.border};"
        >${escapeHtml(item.name)}</span>
      `;
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
  if (payload.entity_type === "journal") {
    const matchBlock = payload.matchingContext
      ? `
        <p><strong>Match score:</strong> ${escapeHtml(
          payload.matchingContext.semanticScore === null
            ? `${payload.matchingContext.finalScore.toFixed(1)} lexical`
            : `${(Math.max(payload.matchingContext.semanticScore, 0) * 100).toFixed(1)} semantic`
        )}</p>
        <p><strong>Matched themes:</strong> ${escapeHtml(payload.matchingContext.matchedTerms.join(", ") || "No explicit terms were extracted")}</p>
      `
      : "";
    return `
      <div class="detail-meta-block">
        <p><strong>ISSN:</strong> ${renderIssnLinks(payload.issns, { className: "inline-link" })}</p>
        ${matchBlock}
      </div>
    `;
  }
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
  if (payload.entity_type === "journal") {
    const links = [];
    if (payload.journalWebsite) {
      links.push(`<a class="detail-title-link" href="${escapeHtml(payload.journalWebsite)}" target="_blank" rel="noopener noreferrer">Journal website</a>`);
    }
    if (payload.authorGuidelinesUrl) {
      links.push(`<a class="detail-title-link" href="${escapeHtml(payload.authorGuidelinesUrl)}" target="_blank" rel="noopener noreferrer">Author guidelines</a>`);
    }
    return links.join("");
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

function renderMatchingContext(payload) {
  if (payload.entity_type !== "journal" || !payload.matchingContext) {
    return "";
  }
  return `
    <section class="matching-context-card">
      <div class="card-header">
        <h3>Journal matching rationale</h3>
      </div>
      <p>${escapeHtml(payload.matchingContext.rationale || "This journal was recommended from the submitted abstract.")}</p>
      <div class="tags-wrap">
        ${(payload.matchingContext.matchedTerms || []).map((term) => `<span class="tag-item">${escapeHtml(term)}</span>`).join("")}
      </div>
      ${payload.authorGuidelinesUrl ? `<p><strong>Author Guidelines:</strong> <a class="inline-link" href="${escapeHtml(payload.authorGuidelinesUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(payload.authorGuidelinesUrl)}</a></p>` : ""}
    </section>
  `;
}

function entityHref(entityType, entityKey) {
  const url = new URL(window.location.pathname, window.location.origin);
  const mode = currentModeFromUrl();
  if (mode === "matching") {
    url.searchParams.set("mode", "matching");
  } else {
    const query = state.search.query || currentQueryFromUrl() || "";
    if (query) {
      url.searchParams.set("q", query);
    }
  }
  url.hash = `${entityType}/${encodeURIComponent(entityKey)}`;
  return `${url.pathname}${url.search}${url.hash}`;
}

function searchResultsHref() {
  const mode = currentModeFromUrl();
  if (mode === "matching") {
    return "?mode=matching";
  }
  const query = state.search.query || currentQueryFromUrl() || "";
  return query ? `?q=${encodeURIComponent(query)}` : window.location.pathname;
}

function renderBreadcrumb(items) {
  dom.detailBreadcrumb.innerHTML = items
    .map((item, index) => {
      const node = item.href
        ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
        : `<span class="is-current">${escapeHtml(item.label)}</span>`;
      const separator = index < items.length - 1 ? `<span class="breadcrumb-separator">/</span>` : "";
      return `${node}${separator}`;
    })
    .join("");
}

function renderArticleDetailAuthors(authors) {
  if (!authors?.length) {
    return `<p class="muted-line">Author information is not exposed in this record.</p>`;
  }
  return `
    <div class="article-author-list">
      ${authors
        .map(
          (author) => `
            <div class="article-author-item">
              <strong>${escapeHtml(author.name || "Author not exposed")}</strong>
              <span>${escapeHtml(author.affiliation || "Affiliation not exposed")}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderArticleTags(items, emptyMessage) {
  if (!items?.length) {
    return `<p class="muted-line">${escapeHtml(emptyMessage)}</p>`;
  }
  return `
    <div class="tags-wrap">
      ${items.map((item) => `<span class="tag-item">${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function renderArticleInfoRows(rows) {
  const visible = rows.filter((row) => row.value);
  if (!visible.length) {
    return `<p class="muted-line">No additional publication metadata is available.</p>`;
  }
  return `
    <div class="article-fact-list">
      ${visible
        .map(
          (row) => `
            <div class="article-fact-row">
              <span class="article-fact-label">${escapeHtml(row.label)}</span>
              <span class="article-fact-value">${row.html ? row.value : escapeHtml(row.value)}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderArticleDashboard(payload) {
  const authorNames = payload.authors.map((author) => author.name).filter(Boolean).join(", ");
  const journalLink = payload.journalEntityKey
    ? `<a class="inline-link" href="${escapeHtml(entityHref("journal", payload.journalEntityKey))}">${escapeHtml(payload.journalTitle || "Journal detail")}</a>`
    : escapeHtml(payload.journalTitle || "Journal unavailable");
  const topLine = [payload.year, payload.volumeIssue, payload.pages ? `Pages ${payload.pages}` : ""].filter(Boolean).join(" • ");
  const actionLinks = [
    payload.doiUrl
      ? `<a class="detail-title-link" href="${escapeHtml(payload.doiUrl)}" target="_blank" rel="noopener noreferrer">Open DOI</a>`
      : "",
    payload.fulltextUrl
      ? `<a class="detail-title-link" href="${escapeHtml(payload.fulltextUrl)}" target="_blank" rel="noopener noreferrer">Read online</a>`
      : "",
    payload.journalEntityKey
      ? `<a class="detail-title-link" href="${escapeHtml(entityHref("journal", payload.journalEntityKey))}">Open journal detail</a>`
      : "",
    payload.journalWebsite
      ? `<a class="detail-title-link" href="${escapeHtml(payload.journalWebsite)}" target="_blank" rel="noopener noreferrer">Journal website</a>`
      : "",
  ].filter(Boolean).join("");

  dom.dashboardHeading.textContent = "Article Detail";
  dom.dashboardKicker.textContent = "Article Detail";
  dom.dashboardMeta.textContent = payload.meta_label || `Fetched ${formatDisplayDate(payload.fetched_at)}`;
  setDashboardState("", true);

  dom.dashboardContent.innerHTML = `
    <div class="dashboard-stack article-dashboard">
      <section class="dashboard-banner article-banner">
        <div class="article-hero">
          <span class="section-kicker">Published in</span>
          <div class="article-published-in">${journalLink}${payload.year ? ` <span class="muted-line">(${escapeHtml(payload.year)})</span>` : ""}</div>
          <h3>${escapeHtml(payload.title)}</h3>
          <p class="article-author-line">${escapeHtml(authorNames || "Author not exposed")}</p>
          ${topLine ? `<div class="banner-meta">${escapeHtml(topLine)}</div>` : ""}
          ${actionLinks ? `<div class="result-links">${actionLinks}</div>` : ""}
        </div>
      </section>

      <section class="article-detail-grid">
        <article class="narrative-card article-section-card article-section-card--wide">
          <div class="card-header">
            <h3>Abstract</h3>
          </div>
          <p class="article-full-abstract">${escapeHtml(payload.abstract || "No abstract is available for this article record.")}</p>
        </article>

        <article class="narrative-card article-section-card">
          <div class="card-header">
            <h3>Authors and affiliations</h3>
          </div>
          ${renderArticleDetailAuthors(payload.authors)}
        </article>

        <article class="narrative-card article-section-card">
          <div class="card-header">
            <h3>Article metadata</h3>
          </div>
          ${renderArticleInfoRows([
            { label: "DOI", value: payload.doiUrl ? `<a class="inline-link" href="${escapeHtml(payload.doiUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(payload.doi || payload.doiUrl)}</a>` : payload.doi || "", html: true },
            { label: "Publication year", value: payload.year || "" },
            { label: "Volume and issue", value: payload.volumeIssue || "" },
            { label: "Pages", value: payload.pages || "" },
            { label: "Fetched", value: formatDisplayDate(payload.fetched_at) },
          ])}
        </article>

        <article class="narrative-card article-section-card">
          <div class="card-header">
            <h3>Keywords</h3>
          </div>
          ${renderArticleTags(payload.keywords, "No keywords are available for this article record.")}
        </article>

        <article class="narrative-card article-section-card">
          <div class="card-header">
            <h3>Subjects</h3>
          </div>
          ${renderArticleTags(payload.subjects, "No subject tags are available for this article record.")}
        </article>

        <article class="narrative-card article-section-card article-section-card--wide">
          <div class="card-header">
            <h3>Published in ${escapeHtml(payload.journalTitle || "journal context")}</h3>
          </div>
          ${renderArticleInfoRows([
            { label: "Journal", value: payload.journalEntityKey ? `<a class="inline-link" href="${escapeHtml(entityHref("journal", payload.journalEntityKey))}">${escapeHtml(payload.journalTitle || "-")}</a>` : payload.journalTitle || "", html: Boolean(payload.journalEntityKey) },
            { label: "Publisher", value: payload.journalPublisher || "" },
            { label: "Country", value: payload.journalCountry || "" },
            { label: "ISSN", value: renderIssnLinks(payload.journalIssns, { className: "inline-link", emptyText: "" }), html: true },
            { label: "Languages", value: payload.journalLanguages.join(", ") || "" },
            { label: "Journal website", value: payload.journalWebsite ? `<a class="inline-link" href="${escapeHtml(payload.journalWebsite)}" target="_blank" rel="noopener noreferrer">${escapeHtml(payload.journalWebsite)}</a>` : "", html: Boolean(payload.journalWebsite) },
          ])}
          ${payload.journalSubjects.length ? `
            <div class="article-subsection">
              <span class="mini-label">Journal subjects</span>
              ${renderArticleTags(payload.journalSubjects, "")}
            </div>
          ` : ""}
        </article>
      </section>

      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Visuals</span>
            <h2>Article insights</h2>
          </div>
        </div>
        <div class="chart-grid">
          ${Object.entries(payload.charts)
            .map(([chartKey, chart]) => renderChartCard(chartKey, chart))
            .join("")}
        </div>
      </section>
      <div class="warning-strip">
        ${escapeHtml(payload.scope_note || "This article detail page reflects the selected DOAJ article record.")}
      </div>
    </div>
  `;

  mountCharts(payload.charts);
}

function renderDashboard(payload) {
  if (payload.entity_type === "article") {
    renderArticleDashboard(payload);
    return;
  }
  dom.dashboardHeading.textContent = payload.entity_type === "article" ? "Article Detail" : "Dashboard";
  dom.dashboardKicker.textContent = payload.entity_type === "article"
    ? "Article Detail"
    : `${payload.entity_type.charAt(0).toUpperCase()}${payload.entity_type.slice(1)} Dashboard`;
  dom.dashboardMeta.textContent = payload.meta_label || `Fetched ${formatDisplayDate(payload.fetched_at)}`;
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
      ${renderMatchingContext(payload)}
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
  const theme = getChartTheme();
  const palette = [theme.accent, theme.article, theme.warm, theme.accentStrong];
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
        color: palette,
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            radius: ["42%", "72%"],
            center: ["50%", "52%"],
            itemStyle: {
              borderColor: theme.panel,
              borderWidth: 3,
            },
            label: { color: theme.muted },
            data: chart.items || [],
          },
        ],
      });
      requestAnimationFrame(() => instance.resize());
      continue;
    }
    if (chart.kind === "bar") {
      const items = chart.items || [];
      instance.setOption({
        color: palette,
        grid: { left: 44, right: 18, top: 22, bottom: 54 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: items.map((item) => item.name),
          axisLabel: { color: theme.muted, rotate: items.length > 6 ? 28 : 0 },
          axisLine: { lineStyle: { color: theme.line } },
        },
        yAxis: {
          type: "value",
          axisLabel: { color: theme.muted },
          splitLine: { lineStyle: { color: theme.line } },
        },
        series: [
          {
            type: "bar",
            data: items.map((item) => item.value),
            itemStyle: {
              color: theme.accent,
              borderRadius: [10, 10, 2, 2],
            },
          },
        ],
      });
      requestAnimationFrame(() => instance.resize());
      continue;
    }
    instance.setOption({
      color: palette,
      grid: { left: 44, right: 18, top: 22, bottom: 54 },
      tooltip: { trigger: "axis" },
      legend: { textStyle: { color: theme.muted } },
      xAxis: {
        type: "category",
        data: chart.categories || [],
        axisLabel: { color: theme.muted, rotate: (chart.categories || []).length > 8 ? 28 : 0 },
        axisLine: { lineStyle: { color: theme.line } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: theme.muted },
        splitLine: { lineStyle: { color: theme.line } },
      },
      series: (chart.series || []).map((serie, index) => ({
        name: serie.name,
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3 },
        itemStyle: { color: index === 0 ? theme.accent : theme.article },
        areaStyle: { opacity: 0.08 },
        data: serie.data,
      })),
    });
    requestAnimationFrame(() => instance.resize());
  }
}

async function runSearch(query, { updateUrl = true } = {}) {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    throw new Error("Enter a query before searching.");
  }

  showHomeView({ mode: "main-search", showResults: true });
  dom.searchInput.value = normalizedQuery;
  dom.resultsMeta.textContent = "Searching DOAJ...";
  setResultsState("Searching DOAJ...", false);
  dom.resultsGroups.innerHTML = "";

  const [journalsPayload, articlesPayload] = await Promise.all([
    fetchPaginated("journals", normalizedQuery, {
      pageSize: 25,
      maxPages: 2,
      maxRecords: MAX_LIVE_JOURNALS,
    }),
    fetchPaginated("articles", normalizedQuery, {
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
    query: normalizedQuery,
    fetchedAt: new Date().toISOString(),
    groups,
  };

  dom.resultsMeta.textContent = `"${normalizedQuery}" • ${publishers.length} publishers, ${journals.length} journals, ${articles.length} articles shown`;
  setResultsState("", true);
  renderHomeGroups(groups);

  if (updateUrl) {
    syncUrl(normalizedQuery, "", false, { mode: "main-search" });
  }
}

async function warmMatchingModel() {
  if (state.matching.modelStatus === "idle") {
    try {
      await loadMatchingModel();
    } catch {
      return;
    }
  }
}

async function runMatching(abstract, { updateUrl = true } = {}) {
  const cleanAbstract = `${abstract || ""}`.trim();
  if (cleanAbstract.length < MATCHING_MIN_ABSTRACT_LENGTH) {
    throw new Error(`Provide a fuller English abstract of at least ${MATCHING_MIN_ABSTRACT_LENGTH} characters.`);
  }
  if (!looksLikeEnglishAbstract(cleanAbstract)) {
    throw new Error("Journal Matching v1 currently supports English abstracts only.");
  }

  const profile = buildAbstractProfile(cleanAbstract);
  const rerankToken = state.matching.rerankToken + 1;
  state.matching.abstract = cleanAbstract;
  state.matching.submitted = true;
  state.matching.fetchedAt = new Date().toISOString();
  state.matching.terms = profile.terms;
  state.matching.phrases = profile.phrases;
  state.matching.queries = profile.queries;
  state.matching.results = [];
  state.matching.status = "loading";
  state.matching.rankingLabel = "Searching live DOAJ candidates";
  state.matching.rerankToken = rerankToken;
  state.matching.selectedJournalKey = "";

  dom.matchingAbstract.value = cleanAbstract;
  dom.matchingMeta.textContent = "Searching live DOAJ candidates...";
  setMatchingState("Searching DOAJ journals and article-derived journal signals...", false);
  dom.matchingResults.innerHTML = "";
  dom.matchingNote.textContent = "Journal Matching uses live DOAJ API results only. The submitted abstract stays in the browser.";
  showHomeView({ mode: "matching", showMatchingResults: true });

  if (updateUrl) {
    syncUrl("", "", false, { mode: "matching" });
  }

  void warmMatchingModel();

  const { journals, errors } = await fetchMatchingCandidates(profile);
  if (state.matching.rerankToken !== rerankToken) {
    return;
  }
  if (!journals.length) {
    if (errors.length) {
      throw new Error("Live DOAJ requests could not return enough journal candidates. Please retry.");
    }
    state.matching.status = "loaded";
    state.matching.results = [];
    dom.matchingMeta.textContent = "No journal match found";
    setMatchingState("No journals could be assembled from the live DOAJ API for this abstract.", false);
    return;
  }

  const ranked = rankMatchingCandidates(profile, journals, { rankingMode: "lexical" });
  state.matching.results = ranked;
  state.matching.status = "loaded";
  state.matching.rankingLabel = "Live lexical ranking";
  dom.matchingMeta.textContent = `${ranked.length} journals • live lexical ranking`;
  setMatchingState("", true);
  renderMatchingResults(ranked);
  dom.matchingNote.textContent = errors.length
    ? "Initial recommendations are shown. Some live DOAJ requests failed, so this list may be partial. Article-based and semantic reranking will continue in this session."
    : "Initial recommendations are shown. Article-based and semantic reranking will continue in this session.";

  void (async () => {
    try {
      const enriched = await enrichMatchingResults(profile, ranked, rerankToken);
      if (state.matching.rerankToken !== rerankToken) {
        return;
      }
      state.matching.results = enriched;
      state.matching.status = "loaded";
      state.matching.rankingLabel = enriched.some((item) => item.semanticScore !== null)
        ? "Semantic reranking applied"
        : "Live article enrichment applied";
      dom.matchingMeta.textContent = `${enriched.length} journals • ${state.matching.rankingLabel.toLowerCase()}`;
      renderMatchingResults(enriched);
      dom.matchingNote.textContent = state.matching.modelStatus === "failed"
        ? "Semantic reranking is unavailable in this browser. Recommendations are based on live lexical and article evidence only."
        : "Recommendations were refined with live article evidence and semantic reranking in the browser.";
    } catch {
      if (state.matching.rerankToken !== rerankToken) {
        return;
      }
      dom.matchingNote.textContent = "Showing live lexical recommendations. Additional reranking could not be completed in this session.";
    }
  })();
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
  return state.entities.journal.get(entityKey)
    || state.search.groups?.journals.find((item) => `${item.id}` === entityKey)
    || state.matching.results.find((item) => item.entityKey === entityKey)?.journal
    || (state.standaloneJournal && `${state.standaloneJournal.id}` === entityKey ? state.standaloneJournal : null)
    || null;
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
  renderBreadcrumb([
    { label: "Search", href: window.location.pathname },
    { label: `Results: ${state.search.query}`, href: searchResultsHref() },
    { label: publisher.title },
  ]);
  showDetailView();
  renderDashboard(payload);
}

async function renderJournalDetail(entityKey) {
  const journal = state.search.groups?.journals.find((item) => `${item.id}` === entityKey) || null;
  if (!journal) {
    throw new Error("The selected journal is no longer present in the current search result set.");
  }
  const matchedArticles = sortArticles(filterArticlesForJournal(state.search.groups.articles, journal));
  renderLockedResults(
    "Matched articles",
    `${matchedArticles.length} articles • search phrase "${state.search.query}"`,
    matchedArticles.map((item) => renderMatchedArticleTitleCard(item)).join("")
  );
  renderBreadcrumb([
    { label: "Search", href: window.location.pathname },
    { label: `Results: ${state.search.query}`, href: searchResultsHref() },
    { label: journalTitle(journal) },
  ]);
  showDetailView();
  setDashboardState("Loading full journal article set from DOAJ...", false);
  let allArticles = [];
  try {
    allArticles = await fetchJournalCorpusArticles(journal);
  } catch {
    allArticles = [];
  }
  const payload = buildJournalPayload(
    journal,
    allArticles.length ? allArticles : matchedArticles,
    state.search,
    { matchedArticles }
  );
  renderDashboard(payload);
}

function findMatchingResult(entityKey) {
  return state.matching.results.find((item) => item.entityKey === entityKey) || null;
}

async function fetchJournalByEntityKey(entityKey) {
  const payload = await fetchPaginated("journals", entityKey, {
    pageSize: 10,
    maxPages: 1,
    maxRecords: 10,
  });
  return payload.results.find((item) => `${item.id}` === entityKey) || null;
}

async function renderMatchingJournalDetail(entityKey) {
  const result = findMatchingResult(entityKey);
  if (!result) {
    throw new Error("The selected journal is no longer present in the current matching result set.");
  }
  state.matching.selectedJournalKey = entityKey;
  renderLockedResults(
    "Matched journals",
    `${state.matching.results.length} journals • submitted abstract`,
    state.matching.results.map((item) => renderMatchingJournalCard(item, { compact: true })).join("")
  );
  renderBreadcrumb([
    { label: "Journal Matching", href: "?mode=matching" },
    { label: journalTitle(result.journal) },
  ]);
  showDetailView();
  setDashboardState("Loading live journal articles from DOAJ...", false);
  let allArticles = [];
  try {
    allArticles = await fetchJournalCorpusArticles(result.journal);
  } catch {
    allArticles = result.seedArticles || [];
  }
  const payload = buildJournalPayload(
    result.journal,
    allArticles.length ? allArticles : result.seedArticles,
    { query: "", fetchedAt: state.matching.fetchedAt || new Date().toISOString() },
    { matchedArticles: [], contextType: "matching", matchingContext: result }
  );
  renderDashboard(payload);
}

async function renderStandaloneJournalDetail(entityKey) {
  let journal = findJournal(entityKey);
  if (!journal) {
    journal = await fetchJournalByEntityKey(entityKey);
    if (!journal) {
      throw new Error("The selected journal could not be reloaded from the live DOAJ API.");
    }
    state.standaloneJournal = journal;
    state.entities.journal.set(`${journal.id}`, journal);
  }
  renderLockedResults("", "", "", { hidden: true });
  renderBreadcrumb([
    { label: currentModeFromUrl() === "matching" ? "Journal Matching" : "Search", href: searchResultsHref() },
    { label: journalTitle(journal) },
  ]);
  showDetailView({ singleColumn: true });
  setDashboardState("Loading live journal articles from DOAJ...", false);
  let allArticles = [];
  try {
    allArticles = await fetchJournalCorpusArticles(journal);
  } catch {
    allArticles = [];
  }
  const payload = buildJournalPayload(
    journal,
    allArticles,
    { query: "", fetchedAt: new Date().toISOString() },
    { matchedArticles: [], contextType: "standalone" }
  );
  renderDashboard(payload);
}

function renderArticleDetail(entityKey) {
  const article = findArticle(entityKey);
  if (!article) {
    throw new Error("The selected article is no longer present in the current search result set.");
  }
  const payload = buildArticlePayload(article, state.search);
  renderLockedResults("", "", "", { hidden: true });
  const breadcrumbItems = [
    { label: "Search", href: window.location.pathname },
    { label: `Results: ${state.search.query}`, href: searchResultsHref() },
  ];
  if (payload.journalEntityKey && payload.journalTitle) {
    breadcrumbItems.push({ label: payload.journalTitle, href: entityHref("journal", payload.journalEntityKey) });
  }
  breadcrumbItems.push({ label: payload.title });
  renderBreadcrumb(breadcrumbItems);
  showDetailView({ singleColumn: true });
  renderDashboard(payload);
}

async function renderRoute() {
  const route = routeFromLocation();
  const query = currentQueryFromUrl();
  const mode = currentModeFromUrl();
  state.ui.mode = mode;
  updateModeButtons(mode);
  dom.searchInput.value = query;
  dom.matchingAbstract.value = state.matching.abstract;

  if (route.view === "home" && mode === "matching") {
    showHomeView({ mode: "matching", showMatchingResults: state.matching.submitted });
    if (state.matching.modelStatus === "idle") {
      void warmMatchingModel();
    }
    if (!state.matching.submitted) {
      dom.matchingMeta.textContent = "No abstract submitted";
      setMatchingState("Paste an English abstract and use Find journal to generate live DOAJ recommendations.", false);
      dom.matchingResults.innerHTML = "";
      dom.dashboardContent.innerHTML = "";
      return;
    }
    dom.matchingMeta.textContent = state.matching.results.length
      ? `${state.matching.results.length} journals • ${state.matching.rankingLabel.toLowerCase() || "live ranking"}`
      : "No journal match found";
    if (state.matching.results.length) {
      setMatchingState("", true);
      renderMatchingResults(state.matching.results);
    } else {
      setMatchingState("No journals could be assembled from the live DOAJ API for this abstract.", false);
      dom.matchingResults.innerHTML = "";
    }
    return;
  }

  if (!query && route.view === "home") {
    showHomeView({ mode: "main-search", showResults: false });
    dom.resultsMeta.textContent = "No query yet";
    setResultsState("Start with a live DOAJ query. This panel will separate matched publishers, journals, and articles.", false);
    dom.resultsGroups.innerHTML = "";
    dom.dashboardContent.innerHTML = "";
    return;
  }

  if (mode === "matching" && route.view === "detail") {
    try {
      setDashboardState("Loading detail...", false);
      dom.dashboardContent.innerHTML = "";
      if (route.entityType !== "journal") {
        throw new Error("Journal Matching opens journal dashboards only.");
      }
      if (state.matching.results.length) {
        await renderMatchingJournalDetail(route.entityKey);
      } else {
        await renderStandaloneJournalDetail(route.entityKey);
      }
      return;
    } catch (error) {
      showDetailView({ singleColumn: true });
      renderBreadcrumb([
        { label: "Journal Matching", href: "?mode=matching" },
        { label: "Dashboard" },
      ]);
      dom.dashboardKicker.textContent = "Load failed";
      dom.dashboardHeading.textContent = "Dashboard";
      dom.dashboardMeta.textContent = "Journal Matching";
      setDashboardState(error.message, false);
      renderLockedResults("", "", "", { hidden: true });
      return;
    }
  }

  if (!query && route.view === "detail" && route.entityType === "journal") {
    try {
      await renderStandaloneJournalDetail(route.entityKey);
      return;
    } catch (error) {
      showDetailView({ singleColumn: true });
      renderBreadcrumb([
        { label: "Search", href: window.location.pathname },
        { label: "Dashboard" },
      ]);
      dom.dashboardKicker.textContent = "Load failed";
      dom.dashboardHeading.textContent = "Dashboard";
      dom.dashboardMeta.textContent = "Live DOAJ journal detail";
      setDashboardState(error.message, false);
      renderLockedResults("", "", "", { hidden: true });
      return;
    }
  }

  try {
    await ensureSearchContext();
  } catch (error) {
    showHomeView({ mode: "main-search", showResults: true });
    dom.resultsMeta.textContent = "Search failed";
    setResultsState(error.message, false);
    return;
  }

  if (route.view === "home") {
    showHomeView({ mode: "main-search", showResults: true });
    renderHomeGroups(state.search.groups);
    return;
  }

  try {
    setDashboardState("Loading detail...", false);
    dom.dashboardContent.innerHTML = "";
    if (route.entityType === "publisher") {
      await renderPublisherDetail(route.entityKey);
      return;
    }
    if (route.entityType === "journal") {
      await renderJournalDetail(route.entityKey);
      return;
    }
    if (route.entityType === "article") {
      await renderArticleDetail(route.entityKey);
      return;
    }
    throw new Error("Unsupported route type.");
  } catch (error) {
    showDetailView();
    renderBreadcrumb([
      { label: "Search", href: window.location.pathname },
      { label: `Results: ${query}`, href: query ? `?q=${encodeURIComponent(query)}` : window.location.pathname },
      { label: route.entityType === "article" ? "Article Detail" : "Dashboard" },
    ]);
    dom.dashboardKicker.textContent = "Load failed";
    dom.dashboardHeading.textContent = route.entityType === "article" ? "Article Detail" : "Dashboard";
    dom.dashboardMeta.textContent = query ? `Search phrase: "${query}"` : "Live DOAJ detail";
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
    dom.searchNote.textContent = 'Results are grouped into publishers, journals, and articles. Select any result for detail. Boolean search is supported: AND, OR, NOT, parentheses, and "exact phrase".';
    showHomeView({ mode: "main-search", showResults: true });
  } catch (error) {
    dom.searchNote.textContent = error.message;
    dom.resultsMeta.textContent = "Search failed";
    showHomeView({ mode: "main-search", showResults: true });
    setResultsState(error.message, false);
  }
});

dom.matchingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const abstract = dom.matchingAbstract.value.trim();
  if (!abstract) {
    dom.matchingNote.textContent = "Paste an English abstract before running Journal Matching.";
    return;
  }
  dom.matchingNote.textContent = "Searching live DOAJ candidates...";
  try {
    await runMatching(abstract, { updateUrl: true });
  } catch (error) {
    dom.matchingMeta.textContent = "Matching failed";
    setMatchingState(error.message, false);
    dom.matchingResults.innerHTML = "";
    showHomeView({ mode: "matching", showMatchingResults: true });
    dom.matchingNote.textContent = error.message;
  }
});

dom.modeMainSearch.addEventListener("click", () => {
  syncUrl(state.search.query || currentQueryFromUrl() || "", "", false, { mode: "main-search" });
  void renderRoute();
});

dom.modeJournalMatching.addEventListener("click", () => {
  syncUrl("", "", false, { mode: "matching" });
  void renderRoute();
});

dom.backToSearch.addEventListener("click", () => {
  if (currentModeFromUrl() === "matching") {
    syncUrl("", "", false, { mode: "matching" });
  } else if (!state.search.query) {
    syncUrl("", "", false, { mode: "main-search" });
  } else {
    syncUrl(state.search.query, "", false, { mode: "main-search" });
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
