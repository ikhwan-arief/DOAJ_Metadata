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
const STATISTICS_SUMMARY_URL = "./data/statistics/summary.json";
const STATISTICS_JOURNALS_URL = "./data/statistics/journals.json";
const STATISTICS_PAGE_SIZE = 25;

const CONTINENT_COLORS = {
  Africa: "#47A178",
  Asia: "#FD5A3B",
  Europe: "#3A5959",
  "North America": "#A3C386",
  "South America": "#F9D950",
  Oceania: "#982E0A",
  Antarctica: "#5C5956",
  Unknown: "#5C5956",
};

const OFFICIAL_SERIES_COLORS = [
  "#3A5959",
  "#FD5A3B",
  "#47A178",
  "#A3C386",
  "#FA9A87",
  "#F9D950",
  "#982E0A",
  "#5C5956",
];

const CONTINENT_ORDER = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Antarctica",
  "Unknown",
];

const LANGUAGE_NAME_ALIASES = {
  AE: "Avestan",
  CV: "Chuvash",
  SE: "Northern Sami",
  SH: "Serbo-Croatian",
  VE: "Venda",
};

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

const MATCHING_NOISE_TERMS = new Set([
  "academy",
  "annal",
  "annals",
  "archive",
  "archives",
  "biannual",
  "bimonthly",
  "bulletin",
  "edition",
  "editions",
  "issue",
  "issues",
  "letter",
  "letters",
  "magazine",
  "magazines",
  "monthly",
  "note",
  "notes",
  "paper",
  "papers",
  "periodical",
  "periodicals",
  "proceeding",
  "proceedings",
  "publication",
  "publications",
  "published",
  "publishing",
  "quarterly",
  "record",
  "records",
  "report",
  "reports",
  "serial",
  "serials",
  "supplement",
  "supplements",
  "transaction",
  "transactions",
  "volume",
  "volumes",
  "weekly",
]);

const PRECHECK_SOURCES = [
  {
    id: "apply",
    label: "DOAJ apply",
    url: "https://doaj.org/apply/",
  },
  {
    id: "guide",
    label: "Guide to applying",
    url: "https://doaj.org/apply/guide/",
  },
  {
    id: "transparency",
    label: "Transparency & best practice",
    url: "https://doaj.org/apply/transparency/",
  },
  {
    id: "licensing",
    label: "Licensing & copyright",
    url: "https://doaj.org/apply/copyright-and-licensing/",
  },
];

const PRECHECK_SECTIONS = [
  {
    id: "open-access-compliance",
    title: "Open access compliance",
    description: "Check whether the website reflects DOAJ's definition of open access and makes the journal's open access status clear.",
    items: [
      {
        id: "oa_definition",
        level: "must",
        source: "apply",
        text: "Does the website make clear that all scholarly articles are immediately open access under terms compatible with DOAJ's definition of open access?",
      },
      {
        id: "oa_statement",
        level: "must",
        source: "apply",
        text: "Is there a clear open access statement on the journal website that readers and authors can easily find?",
      },
      {
        id: "oa_start_year",
        level: "best",
        source: "apply",
        text: "Can the journal clearly identify the year it started publishing all content as full open access under an open licence?",
      },
    ],
  },
  {
    id: "about-the-journal",
    title: "About the journal",
    description: "Check whether the core journal and publisher information needed in the DOAJ application is visible and consistent.",
    items: [
      {
        id: "journal_title_consistency",
        level: "must",
        source: "apply",
        text: "Does the journal title shown on the website appear consistently and match the title used in formal registrations where applicable?",
      },
      {
        id: "homepage_availability",
        level: "must",
        source: "apply",
        text: "Does the journal have a clear homepage that acts as the main public entry point for readers and authors?",
      },
      {
        id: "issn_consistency",
        level: "must",
        source: "apply",
        text: "If the journal uses print and/or online ISSNs, are they clearly displayed and consistent with the ISSN Portal and the journal website?",
      },
      {
        id: "subject_keywords_english",
        level: "best",
        source: "apply",
        text: "Can the journal's subject coverage be clearly expressed in short English keywords or phrases suitable for DOAJ application metadata?",
      },
      {
        id: "manuscript_languages",
        level: "must",
        source: "apply",
        text: "Does the website clearly state which languages are accepted for manuscript submission?",
      },
      {
        id: "publisher_identity",
        level: "must",
        source: "apply",
        text: "Does the website clearly state the publisher's name?",
      },
      {
        id: "publisher_country",
        level: "must",
        source: "apply",
        text: "Does the website clearly state the publisher's country or the country where the publisher operates?",
      },
      {
        id: "owner_publisher_identity",
        level: "must",
        source: "transparency",
        text: "Does the website clearly explain the publisher, owner, or organization responsible for the journal?",
      },
      {
        id: "other_organisation_identity",
        level: "best",
        source: "apply",
        text: "If another organisation owns, sponsors, funds, or supports the journal, is that relationship clearly identified on the website?",
      },
    ],
  },
  {
    id: "copyright-licensing",
    title: "Copyright and licensing",
    description: "Check whether the website and article pages clearly present licensing and copyright terms expected by DOAJ.",
    items: [
      {
        id: "article_license",
        level: "must",
        source: "apply",
        text: "Does the website clearly identify the licence or licences permitted by the journal for published articles?",
      },
      {
        id: "license_page",
        level: "must",
        source: "apply",
        text: "Is there a clear page or section where the journal's licensing terms are stated?",
      },
      {
        id: "embedded_license",
        level: "best",
        source: "apply",
        text: "Is licensing information displayed or embedded on article pages and/or in full-text files such as PDF or HTML?",
      },
      {
        id: "no_all_rights_reserved",
        level: "must",
        source: "licensing",
        text: "Does the journal avoid using 'all rights reserved' or fair-use-only wording for its open access scholarly articles?",
      },
      {
        id: "license_consistency",
        level: "must",
        source: "licensing",
        text: "Are the licensing terms consistent across the journal website, article pages, and author-facing guidance?",
      },
    ],
  },
  {
    id: "copyright-author-rights",
    title: "Copyright and author rights",
    description: "Check whether the site explains who owns copyright and what rights authors keep or grant.",
    items: [
      {
        id: "copyright_holder",
        level: "must",
        source: "apply",
        text: "Does the website clearly identify who holds copyright for published articles?",
      },
      {
        id: "author_rights",
        level: "must",
        source: "apply",
        text: "Does the website clearly explain whether authors retain copyright or grant rights to the publisher?",
      },
      {
        id: "nonexclusive_rights",
        level: "must",
        source: "licensing",
        text: "If authors grant publishing rights, are those terms presented in a way that preserves open access reuse expectations?",
      },
    ],
  },
  {
    id: "editorial",
    title: "Editorial",
    description: "Check whether the website exposes the editorial, peer review, and author-facing information requested by DOAJ.",
    items: [
      {
        id: "peer_review_declared",
        level: "must",
        source: "apply",
        text: "Does the website clearly state that the journal uses peer review for scholarly articles?",
      },
      {
        id: "peer_review_process",
        level: "must",
        source: "apply",
        text: "Does the website describe the peer review process or type used by the journal?",
      },
      {
        id: "plagiarism_screening",
        level: "best",
        source: "apply",
        text: "If the journal screens submissions for plagiarism, is that practice and any service used stated on the website?",
      },
      {
        id: "aims_scope",
        level: "must",
        source: "apply",
        text: "Does the website clearly describe the journal's aims and scope?",
      },
      {
        id: "editorial_board",
        level: "must",
        source: "apply",
        text: "Are the editor-in-chief, editors, or editorial board members clearly listed on the website?",
      },
      {
        id: "editorial_board_affiliations",
        level: "best",
        source: "transparency",
        text: "Are editorial board members presented with affiliations or other details that support editorial transparency?",
      },
      {
        id: "author_guidelines",
        level: "must",
        source: "apply",
        text: "Are instructions for authors or submission guidelines clearly available on the website?",
      },
      {
        id: "submission_publication_timing",
        level: "best",
        source: "apply",
        text: "Can the journal identify the average number of weeks between article submission and publication?",
      },
      {
        id: "contact_information",
        level: "must",
        source: "transparency",
        text: "Does the website provide clear editorial office or publisher contact information, preferably including a full mailing address?",
      },
    ],
  },
  {
    id: "business-model",
    title: "Business model",
    description: "Check whether author-facing fees and waivers are disclosed in a way that aligns with the DOAJ application.",
    items: [
      {
        id: "fee_transparency",
        level: "must",
        source: "apply",
        text: "Does the website clearly state whether the journal charges APCs or no publication fee at all?",
      },
      {
        id: "waiver_policy",
        level: "must",
        source: "apply",
        text: "If publication fees are charged, does the website clearly explain waiver or discount arrangements? If no publication fee is charged, answer Yes.",
      },
      {
        id: "other_fees",
        level: "must",
        source: "apply",
        text: "Does the website clearly state whether the journal charges any other author-facing fees, such as submission, editing, page, colour, membership, or supplementary charges?",
      },
      {
        id: "fee_currency_scope",
        level: "best",
        source: "apply",
        text: "If fees are charged, are the amount, currency, and conditions explained clearly enough before submission?",
      },
    ],
  },
  {
    id: "best-practice",
    title: "Best practice",
    description: "Check whether the journal exposes additional preservation, repository, identifier, and ethics practices encouraged by DOAJ.",
    items: [
      {
        id: "preservation_policy",
        level: "best",
        source: "apply",
        text: "Does the website clearly state any active long-term preservation or archiving arrangement for journal content?",
      },
      {
        id: "repository_policy",
        level: "best",
        source: "apply",
        text: "Does the journal have a clear policy allowing authors to deposit submitted, accepted, or published versions in repositories, and is that policy recorded on the website?",
      },
      {
        id: "pid_usage",
        level: "best",
        source: "apply",
        text: "Does the journal use persistent article identifiers such as DOI, ARK, Handle, or PURL, and is that practice clear on the website or article pages?",
      },
      {
        id: "ethics_policy",
        level: "best",
        source: "transparency",
        text: "Does the website publish ethics, misconduct, or plagiarism-handling policies for authors and editors?",
      },
      {
        id: "publication_dates",
        level: "best",
        source: "transparency",
        text: "Does the journal publish article dates such as publication date, and preferably submission and acceptance dates?",
      },
      {
        id: "special_content_policy",
        level: "best",
        source: "licensing",
        text: "If the journal includes non-article or non-open-access material, does the website explain that policy clearly?",
      },
    ],
  },
];

const PRECHECK_SOURCE_MAP = new Map(PRECHECK_SOURCES.map((item) => [item.id, item]));
const PRECHECK_ITEMS = PRECHECK_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    sectionId: section.id,
    sectionTitle: section.title,
  }))
);
const PRECHECK_ITEM_MAP = new Map(PRECHECK_ITEMS.map((item) => [item.id, item]));

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
  statistics: {
    summary: null,
    journals: [],
    status: "idle",
    error: "",
    filters: null,
    tablePage: 1,
  },
  precheck: {
    answers: {},
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
  modeStatistics: document.querySelector("#mode-statistics"),
  modePrecheck: document.querySelector("#mode-precheck"),
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
  heroStatistics: document.querySelector("#hero-statistics"),
  heroPrecheck: document.querySelector("#hero-precheck"),
  detailBreadcrumb: document.querySelector("#detail-breadcrumb"),
  homeView: document.querySelector("#home-view"),
  resultsPanel: document.querySelector("#results-panel"),
  statisticsPanel: document.querySelector("#statistics-panel"),
  precheckPanel: document.querySelector("#precheck-panel"),
  statisticsMeta: document.querySelector("#statistics-meta"),
  statisticsState: document.querySelector("#statistics-state"),
  statisticsContent: document.querySelector("#statistics-content"),
  precheckMeta: document.querySelector("#precheck-meta"),
  precheckState: document.querySelector("#precheck-state"),
  precheckContent: document.querySelector("#precheck-content"),
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
let statisticsDataPromise = null;
let mountedChartInstances = [];
let mountedPlotlyNodes = [];
let statisticsMapFullscreenEventsBound = false;

function getChartTheme() {
  const styles = getComputedStyle(document.documentElement);
  return {
    panel: styles.getPropertyValue("--panel-strong").trim() || "#ffffff",
    ink: styles.getPropertyValue("--ink").trim() || "#1f1c1b",
    muted: styles.getPropertyValue("--muted").trim() || "#5c5956",
    line: styles.getPropertyValue("--line").trim() || "#d7d2ce",
    teal: styles.getPropertyValue("--teal").trim() || "#3A5959",
    tealSoft: styles.getPropertyValue("--teal-soft").trim() || "rgba(58, 89, 89, 0.14)",
    accent: styles.getPropertyValue("--accent").trim() || "#fd5a3b",
    accentSoft: styles.getPropertyValue("--accent-soft").trim() || "rgba(253, 90, 59, 0.14)",
    warm: styles.getPropertyValue("--warm").trim() || "#fa9a87",
    warmSoft: styles.getPropertyValue("--warm-soft").trim() || "rgba(250, 154, 135, 0.2)",
    warmStrong: styles.getPropertyValue("--warm-strong").trim() || "#8f311c",
    leaf: styles.getPropertyValue("--leaf").trim() || "#A3C386",
    leafSoft: styles.getPropertyValue("--leaf-soft").trim() || "rgba(163, 195, 134, 0.2)",
    leafStrong: styles.getPropertyValue("--leaf-strong").trim() || "#5F7D42",
    yellow: styles.getPropertyValue("--yellow").trim() || "#F9D950",
    yellowStrong: styles.getPropertyValue("--yellow-strong").trim() || "#8C7420",
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

const languageNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" });
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

function formatLanguageName(value) {
  const raw = `${value || ""}`.trim();
  if (!raw) {
    return "";
  }
  const normalized = raw.replaceAll("_", "-");
  const upper = normalized.toUpperCase();
  if (LANGUAGE_NAME_ALIASES[upper]) {
    return LANGUAGE_NAME_ALIASES[upper];
  }
  if (!languageNames) {
    return upper;
  }
  try {
    const resolved = languageNames.of(normalized.toLowerCase());
    if (!resolved || resolved.toLowerCase() === normalized.toLowerCase()) {
      return upper;
    }
    return resolved;
  } catch {
    return upper;
  }
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

function formatCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatDecimal(value, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value));
}

function formatCurrencyAmount(value, currency) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return `${formatDecimal(value, 2)} ${currency}`;
}

function geoCountryName(value) {
  const raw = `${value || ""}`.trim();
  if (!raw) {
    return "";
  }
  const cleaned = raw.replaceAll("_", " ");
  const upper = cleaned.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper) && regionNames) {
    const resolved = regionNames.of(upper);
    if (resolved && resolved !== upper) {
      return resolved;
    }
  }
  if (/^[A-Z][A-Z\s-]{3,}$/.test(cleaned)) {
    return cleaned.toLowerCase().replace(/\b([a-z])/g, (match) => match.toUpperCase());
  }
  return cleaned;
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

function matchingTokenList(text, { minLength = 4 } = {}) {
  return normalizeText(text)
    .split(/\s+/)
    .filter(
      (token) =>
        token
        && token.length >= minLength
        && !STOPWORDS.has(token)
        && !MATCHING_NOISE_TERMS.has(token)
        && !/^\d+$/.test(token)
    );
}

function matchingTopTerms(texts, limit = 12) {
  const counter = new Map();
  for (const text of texts) {
    const tokens = matchingTokenList(text, { minLength: 4 });
    for (const token of tokens) {
      counter.set(token, (counter.get(token) || 0) + 1);
    }
  }
  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function matchingPhraseCounts(text, { minWords = 2, maxWords = 3, limit = 8 } = {}) {
  const tokens = matchingTokenList(text, { minLength: 4 });
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

function sanitizeMatchingText(text, { minLength = 4, limit = 3200 } = {}) {
  return clampText(matchingTokenList(text, { minLength }).join(" "), limit);
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

function normalizePrecheckAnswer(value) {
  return value === "yes" || value === "no" ? value : "";
}

function precheckSource(item) {
  return PRECHECK_SOURCE_MAP.get(item.source) || null;
}

function precheckLevelLabel(level) {
  return level === "must" ? "Must" : "Best practice";
}

function getPrecheckSummary() {
  const answers = state.precheck.answers || {};
  const mustItems = PRECHECK_ITEMS.filter((item) => item.level === "must");
  const bestItems = PRECHECK_ITEMS.filter((item) => item.level === "best");
  const summary = {
    must: { yes: 0, no: 0, unanswered: 0 },
    best: { yes: 0, no: 0, unanswered: 0 },
    failedMust: [],
    pendingMust: [],
    status: "incomplete",
  };

  for (const item of mustItems) {
    const answer = normalizePrecheckAnswer(answers[item.id]);
    if (answer === "yes") {
      summary.must.yes += 1;
    } else if (answer === "no") {
      summary.must.no += 1;
      summary.failedMust.push(item);
    } else {
      summary.must.unanswered += 1;
      summary.pendingMust.push(item);
    }
  }

  for (const item of bestItems) {
    const answer = normalizePrecheckAnswer(answers[item.id]);
    if (answer === "yes") {
      summary.best.yes += 1;
    } else if (answer === "no") {
      summary.best.no += 1;
    } else {
      summary.best.unanswered += 1;
    }
  }

  if (summary.must.no > 0) {
    summary.status = "blocked";
  } else if (summary.must.unanswered > 0) {
    summary.status = "incomplete";
  } else {
    summary.status = "ready";
  }

  return summary;
}

function precheckStatusCopy(summary) {
  if (summary.status === "blocked") {
    return {
      title: "Not yet meeting minimum DOAJ threshold",
      tone: "fail",
      text: "At least one must item is currently marked No. Those blocking items should be resolved before treating the journal as minimally ready for DOAJ application.",
    };
  }
  if (summary.status === "ready") {
    return {
      title: "Minimum threshold likely met so far",
      tone: "pass",
      text: "All must items are currently marked Yes. This suggests the website may meet the minimum baseline expected for a DOAJ application, subject to DOAJ's own review.",
    };
  }
  return {
    title: "Checklist still incomplete",
    tone: "warn",
    text: "Some must items have not been answered yet. Complete all required checks before relying on this indicative summary.",
  };
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

async function fetchStaticJson(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Static data request failed (${response.status}).`);
    }
    return response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Static statistics data request timed out.");
    }
    if (error instanceof TypeError) {
      throw new Error("Static statistics data could not be loaded in this browser.");
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
  const termItems = matchingTopTerms([cleanAbstract], 12);
  const phraseItems = matchingPhraseCounts(cleanAbstract, { minWords: 2, maxWords: 3, limit: 8 });
  const terms = termItems.map((item) => item.name);
  const phrases = phraseItems.map((item) => item.name);
  const fallbackTerms = matchingTokenList(cleanAbstract, { minLength: 5 }).slice(0, 6);
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
    sanitizeMatchingText(journalTitle(journal), { minLength: 4, limit: 260 }),
    sanitizeMatchingText(journalSubjects(journal).join(" "), { minLength: 4, limit: 420 }),
    sanitizeMatchingText(journalKeywords(journal).join(" "), { minLength: 4, limit: 420 }),
    sanitizeMatchingText(journalAimsScope(journal), { minLength: 4, limit: 900 }),
    sanitizeMatchingText(seedArticles.map(articleTitle).join(" "), { minLength: 4, limit: 520 }),
    sanitizeMatchingText(seedArticles.map(articleAbstract).join(" "), { minLength: 4, limit: 1600 }),
    sanitizeMatchingText(seedArticles.flatMap(articleKeywords).join(" "), { minLength: 4, limit: 420 }),
    sanitizeMatchingText(seedArticles.flatMap(articleSubjects).join(" "), { minLength: 4, limit: 420 }),
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

function matchingEvidenceLabel(result) {
  const articleSignals = Number(result.articleCount || 0);
  if (articleSignals > 0) {
    return `${articleSignals} article signal${articleSignals === 1 ? "" : "s"}`;
  }
  return "Metadata profile only";
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

function makePieChart(title, items, options = {}) {
  return { title, kind: "pie", items, ...options };
}

function makeBarChart(title, items, options = {}) {
  return { title, kind: "bar", items, ...options };
}

function makeTimelineChart(title, categories, series, options = {}) {
  return { title, kind: "timeline", categories, series, ...options };
}

function makeShareBarChart(title, items, options = {}) {
  return { title, kind: "share-bar", items, ...options };
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

function disposeMountedCharts() {
  mountedChartInstances.forEach((instance) => {
    try {
      instance.dispose();
    } catch {
      return;
    }
  });
  mountedChartInstances = [];
  if (window.Plotly) {
    mountedPlotlyNodes.forEach((node) => {
      try {
        window.Plotly.purge(node);
      } catch {
        return;
      }
    });
  }
  mountedPlotlyNodes = [];
}

function resizeStatisticsMapPlot() {
  const mapEl = document.getElementById("chart-statistics-country_map");
  if (!mapEl || !window.Plotly?.Plots?.resize) {
    return;
  }
  window.Plotly.Plots.resize(mapEl);
}

function statisticsMapShell() {
  return document.getElementById("chart-statistics-country_map-shell");
}

function updateStatisticsMapFullscreenButtonLabel() {
  const mapShell = statisticsMapShell();
  const button = document.getElementById("statistics-map-fullscreen-btn");
  if (!mapShell || !button) {
    return;
  }
  const isFullscreen =
    document.fullscreenElement === mapShell || document.webkitFullscreenElement === mapShell;
  button.textContent = isFullscreen ? "Back to main page" : "Full page map";
}

function openStatisticsMapFullscreen() {
  const mapShell = statisticsMapShell();
  if (!mapShell) {
    return;
  }
  const isFullscreen =
    document.fullscreenElement === mapShell || document.webkitFullscreenElement === mapShell;
  if (isFullscreen) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) {
      exit.call(document);
    }
    window.setTimeout(updateStatisticsMapFullscreenButtonLabel, 60);
    return;
  }
  const request =
    mapShell.requestFullscreen
    || mapShell.webkitRequestFullscreen
    || mapShell.mozRequestFullScreen
    || mapShell.msRequestFullscreen;
  if (request) {
    request.call(mapShell);
  }
  window.setTimeout(updateStatisticsMapFullscreenButtonLabel, 60);
  window.setTimeout(resizeStatisticsMapPlot, 220);
}

function bindStatisticsMapFullscreenListeners() {
  if (statisticsMapFullscreenEventsBound) {
    return;
  }
  document.addEventListener("fullscreenchange", () => {
    window.setTimeout(resizeStatisticsMapPlot, 60);
    window.setTimeout(updateStatisticsMapFullscreenButtonLabel, 60);
  });
  document.addEventListener("webkitfullscreenchange", () => {
    window.setTimeout(resizeStatisticsMapPlot, 60);
    window.setTimeout(updateStatisticsMapFullscreenButtonLabel, 60);
  });
  window.addEventListener("resize", () => window.setTimeout(resizeStatisticsMapPlot, 60));
  statisticsMapFullscreenEventsBound = true;
}

function statisticsDefaultFilters(summary) {
  const yearRange = summary?.filters?.created_year || {};
  return {
    country: "",
    subject: "",
    licenseType: "",
    apc: "",
    authorRetains: "",
    peerReviewType: "",
    language: "",
    publisherText: "",
    continent: "",
    createdYearMin: yearRange.min ?? "",
    createdYearMax: yearRange.max ?? "",
    apcCurrency: summary?.filters?.apc_currencies?.[0] || "EUR",
    tableSearch: "",
    tableSort: summary?.table_defaults?.sort || "last_updated_desc",
  };
}

function statisticsFiltersAreActive(filters, summary) {
  const defaults = statisticsDefaultFilters(summary);
  return ["country", "subject", "licenseType", "apc", "authorRetains", "peerReviewType", "language", "publisherText", "continent", "createdYearMin", "createdYearMax"]
    .some((key) => `${filters?.[key] ?? ""}` !== `${defaults[key] ?? ""}`);
}

function statisticsRetainValue(row) {
  if (row?.author_retains === true) {
    return "yes";
  }
  if (row?.author_retains === false) {
    return "no";
  }
  return "unknown";
}

function statisticsCountItems(values, { limit = 10, formatter = (value) => `${value || ""}` } = {}) {
  const counter = new Map();
  for (const value of values || []) {
    const label = `${formatter(value) || ""}`.trim();
    if (!label) {
      continue;
    }
    counter.set(label, (counter.get(label) || 0) + 1);
  }
  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function statisticsYesNoCounts(rows, selector, { yesLabel = "Yes", noLabel = "No" } = {}) {
  let yes = 0;
  let no = 0;
  for (const row of rows) {
    const value = selector(row);
    if (value === true || value === "yes") {
      yes += 1;
      continue;
    }
    if (value === false || value === "no") {
      no += 1;
    }
  }
  return [
    { name: yesLabel, value: yes },
    { name: noLabel, value: no },
  ];
}

function statisticsTimeline(rows) {
  const counter = new Map();
  for (const row of rows) {
    const value = `${row.created_month || ""}`.trim();
    if (!value) {
      continue;
    }
    counter.set(value, (counter.get(value) || 0) + 1);
  }
  const categories = [...counter.keys()].sort((left, right) => left.localeCompare(right));
  return {
    categories,
    series: [
      {
        name: "Journals added",
        data: categories.map((item) => counter.get(item) || 0),
      },
    ],
  };
}

function statisticsCountryMapItems(rows) {
  const byCountry = new Map();
  const continentCounter = new Map();
  for (const row of rows) {
    const name = geoCountryName(row.country);
    const continent = row.continent || "Unknown";
    if (!name) {
      continue;
    }
    if (!byCountry.has(name)) {
      byCountry.set(name, {
        name,
        value: 0,
        continent,
      });
    }
    const entry = byCountry.get(name);
    entry.value += 1;
    continentCounter.set(continent, (continentCounter.get(continent) || 0) + 1);
  }

  return {
    items: [...byCountry.values()]
      .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name)),
    continents: [...continentCounter.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([name, value]) => ({
        name,
        value,
        color: CONTINENT_COLORS[name] || CONTINENT_COLORS.Unknown,
      })),
  };
}

function statisticsCharts(rows, currency) {
  const timeline = statisticsTimeline(rows);
  const countryMap = statisticsCountryMapItems(rows);
  return {
    apc_distribution: makeShareBarChart(
      "APC distribution",
      statisticsYesNoCounts(rows, (row) => (row.apc_has ? "yes" : "no"), { yesLabel: "Yes", noLabel: "No" }),
      { yesColor: "#47A178", noColor: "#FD5A3B" }
    ),
    author_retains_copyright: makeShareBarChart(
      "Authors retain copyright",
      statisticsYesNoCounts(rows, (row) => statisticsRetainValue(row), { yesLabel: "Yes", noLabel: "No" }),
      { yesColor: "#3A5959", noColor: "#FA9A87" }
    ),
    top_countries: makeBarChart(
      "Top countries",
      statisticsCountItems(rows.map((row) => row.country), { limit: 10, formatter: (value) => formatCountryName(value) }),
      { color: "#3A5959", orientation: "horizontal", leftMargin: 180 }
    ),
    journals_by_continent: makeBarChart(
      "Journals by continent",
      statisticsCountItems(rows.map((row) => row.continent || "Unknown"), { limit: 10 }),
      {
        orientation: "horizontal",
        leftMargin: 170,
        colors: statisticsCountItems(rows.map((row) => row.continent || "Unknown"), { limit: 10 }).map(
          (item) => CONTINENT_COLORS[item.name] || CONTINENT_COLORS.Unknown
        ),
      }
    ),
    top_languages: makeBarChart(
      "Top languages",
      statisticsCountItems(rows.flatMap((row) => row.languages || []), { limit: 10, formatter: formatLanguageName }),
      { color: "#A3C386", orientation: "horizontal", leftMargin: 180 }
    ),
    top_subjects: makeBarChart(
      "Top subjects",
      statisticsCountItems(rows.flatMap((row) => row.subjects || []), { limit: 10 }),
      { color: "#3A5959", orientation: "horizontal", leftMargin: 220 }
    ),
    license_usage: makeBarChart(
      "License usage",
      statisticsCountItems(rows.flatMap((row) => row.license_types || []), { limit: 10 }),
      { orientation: "horizontal", leftMargin: 220, colors: OFFICIAL_SERIES_COLORS }
    ),
    top_peer_review: makeBarChart(
      "Top peer-review types",
      statisticsCountItems(rows.flatMap((row) => row.peer_review_types || []), { limit: 5 }),
      { orientation: "horizontal", leftMargin: 220, colors: ["#47A178", "#A3C386", "#FD5A3B", "#FA9A87", "#982E0A"] }
    ),
    top_pid_schemes: makeBarChart(
      "Top persistent identifiers",
      statisticsCountItems(rows.flatMap((row) => row.pid_schemes || []), { limit: 5 }),
      { color: "#3A5959", orientation: "horizontal", leftMargin: 220 }
    ),
    top_preservation_services: makeBarChart(
      "Top preservation services",
      statisticsCountItems(rows.flatMap((row) => row.preservation_services || []), { limit: 5 }),
      { color: "#FD5A3B", orientation: "horizontal", leftMargin: 220 }
    ),
    top_publishers: makeBarChart(
      "Top publishers",
      statisticsCountItems(rows.map((row) => row.publisher_name), { limit: 10 }),
      { color: "#3A5959", orientation: "horizontal", leftMargin: 240 }
    ),
    journals_added_timeline: makeTimelineChart(
      "Journals added to DOAJ",
      timeline.categories,
      timeline.series,
      { fullWidth: true, seriesColors: ["#A3C386"] }
    ),
    country_map: {
      title: "Country of Publishers",
      kind: "map",
      fullWidth: true,
      items: countryMap.items,
      continents: countryMap.continents,
    },
  };
}

function statisticsKpis(rows, summary, filters) {
  const countryCount = new Set(rows.map((row) => row.country).filter(Boolean)).size;
  const languageCount = new Set(rows.flatMap((row) => row.languages || []).filter(Boolean)).size;
  const noApcCount = rows.filter((row) => !row.apc_has).length;
  const exposedArticleTotal = rows.reduce((total, row) => total + (Number(row.article_records_exposed) || 0), 0);
  const useGlobalArticleTotal = !statisticsFiltersAreActive(filters, summary);
  const articleDetail = useGlobalArticleTotal
    ? "Global DOAJ article total"
    : exposedArticleTotal
      ? "Summed from exposed journal metadata"
      : "No per-journal article counts are exposed in the filtered rows";

  return [
    { label: "Journals", value: formatNumber(rows.length), tone: "accent" },
    { label: "Countries", value: formatNumber(countryCount) },
    { label: "Article records", value: formatNumber(useGlobalArticleTotal ? summary.article_total : exposedArticleTotal), tone: "accent", detail: articleDetail },
    { label: "Languages", value: formatNumber(languageCount) },
    { label: "No APC share", value: percent(noApcCount, rows.length), detail: rows.length ? "Share of filtered journals" : "No matching journals" },
  ];
}

function statisticsRowsFiltered(rows, filters) {
  const publisherNeedle = normalizeText(filters.publisherText);
  const minYear = Number(filters.createdYearMin) || null;
  const maxYear = Number(filters.createdYearMax) || null;

  return rows.filter((row) => {
    if (filters.country && row.country !== filters.country) {
      return false;
    }
    if (filters.subject && !(row.subjects || []).includes(filters.subject)) {
      return false;
    }
    if (filters.licenseType && !(row.license_types || []).includes(filters.licenseType)) {
      return false;
    }
    if (filters.apc === "yes" && !row.apc_has) {
      return false;
    }
    if (filters.apc === "no" && row.apc_has) {
      return false;
    }
    if (filters.authorRetains && statisticsRetainValue(row) !== filters.authorRetains) {
      return false;
    }
    if (filters.peerReviewType && !(row.peer_review_types || []).includes(filters.peerReviewType)) {
      return false;
    }
    if (filters.language && !(row.languages || []).includes(filters.language)) {
      return false;
    }
    if (filters.continent && row.continent !== filters.continent) {
      return false;
    }
    if (publisherNeedle && !normalizeText(row.publisher_name).includes(publisherNeedle)) {
      return false;
    }
    if (minYear && (!row.created_year || Number(row.created_year) < minYear)) {
      return false;
    }
    if (maxYear && (!row.created_year || Number(row.created_year) > maxYear)) {
      return false;
    }
    return true;
  });
}

function statisticsTableMatches(row, query) {
  if (!query) {
    return true;
  }
  const haystack = normalizeText(
    [
      row.title,
      formatCountryName(row.country),
      ...(row.subjects || []),
    ].join(" ")
  );
  return haystack.includes(normalizeText(query));
}

function statisticsSortRows(rows, sortKey, currency) {
  const key = currency === "USD" ? "apc_max_usd" : "apc_max_eur";
  return [...rows].sort((left, right) => {
    switch (sortKey) {
      case "title_asc":
        return left.title.localeCompare(right.title);
      case "country_asc":
        return formatCountryName(left.country).localeCompare(formatCountryName(right.country));
      case "created_date_desc":
        return toTimestamp(right.created_date) - toTimestamp(left.created_date) || right.title.localeCompare(left.title);
      case "apc_desc":
        return (Number(right[key]) || 0) - (Number(left[key]) || 0) || left.title.localeCompare(right.title);
      case "article_records_desc":
        return (Number(right.article_records_exposed) || 0) - (Number(left.article_records_exposed) || 0) || left.title.localeCompare(right.title);
      case "last_updated_desc":
      default:
        return toTimestamp(right.last_updated) - toTimestamp(left.last_updated)
          || toTimestamp(right.created_date) - toTimestamp(left.created_date)
          || left.title.localeCompare(right.title);
    }
  });
}

function renderStatisticsSelectOptions(items, selected, formatter = (value) => value, { includeAll = true } = {}) {
  const normalizedItems = [...items];
  return [
    ...(includeAll ? [`<option value="">All</option>`] : []),
    ...normalizedItems.map((value) => {
      const selectedAttr = `${value}` === `${selected || ""}` ? " selected" : "";
      return `<option value="${escapeHtml(`${value}`)}"${selectedAttr}>${escapeHtml(formatter(value))}</option>`;
    }),
  ].join("");
}

function statisticsProvidersLabel(fx) {
  const entries = Object.entries(fx?.providers || {});
  if (!entries.length) {
    return "No FX provider metadata";
  }
  return entries
    .map(([name, count]) => `${name}${count > 1 ? ` (${count})` : ""}`)
    .join(" • ");
}

function renderStatisticsFiltersCard(summary, filters, filteredRows) {
  const countryOptions = [...(summary.filters?.countries || [])]
    .sort((left, right) => formatCountryName(left).localeCompare(formatCountryName(right)));
  const languageOptions = [...(summary.filters?.languages || [])]
    .sort((left, right) => formatLanguageName(left).localeCompare(formatLanguageName(right)));
  const continentOptions = CONTINENT_ORDER.filter((item) => (summary.filters?.continents || []).includes(item));

  return `
    <article class="statistics-filter-card">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Filters</span>
          <h2>Refine statistics</h2>
        </div>
        <span class="section-meta">${formatNumber(filteredRows.length)} journals after filters</span>
      </div>
      <div class="statistics-filter-grid">
        <label class="statistics-field">
          <span class="statistics-field-label">Country</span>
          <select data-statistics-field="country">
            ${renderStatisticsSelectOptions(countryOptions, filters.country, formatCountryName)}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Subject</span>
          <select data-statistics-field="subject">
            ${renderStatisticsSelectOptions(summary.filters?.subjects || [], filters.subject)}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">License type</span>
          <select data-statistics-field="licenseType">
            ${renderStatisticsSelectOptions(summary.filters?.license_types || [], filters.licenseType)}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">APC</span>
          <select data-statistics-field="apc">
            ${renderStatisticsSelectOptions(["yes", "no"], filters.apc, (value) => (value === "yes" ? "Yes" : "No"))}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Author retains copyright</span>
          <select data-statistics-field="authorRetains">
            ${renderStatisticsSelectOptions(["yes", "no"], filters.authorRetains, (value) => value.charAt(0).toUpperCase() + value.slice(1))}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Peer-review type</span>
          <select data-statistics-field="peerReviewType">
            ${renderStatisticsSelectOptions(summary.filters?.peer_review_types || [], filters.peerReviewType)}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Language</span>
          <select data-statistics-field="language">
            ${renderStatisticsSelectOptions(languageOptions, filters.language, formatLanguageName)}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Continent</span>
          <select data-statistics-field="continent">
            ${renderStatisticsSelectOptions(continentOptions, filters.continent)}
          </select>
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Publisher text</span>
          <input data-statistics-field="publisherText" type="text" value="${escapeHtml(filters.publisherText || "")}" placeholder="Filter by publisher name">
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">APC currency</span>
          <select data-statistics-field="apcCurrency">
            ${renderStatisticsSelectOptions(summary.filters?.apc_currencies || ["EUR", "USD"], filters.apcCurrency, (value) => value, { includeAll: false })}
          </select>
        </label>
        <div class="statistics-field">
          <span class="statistics-field-label">Created year range</span>
          <div class="statistics-range">
            <input data-statistics-field="createdYearMin" type="number" min="${escapeHtml(String(summary.filters?.created_year?.min ?? ""))}" max="${escapeHtml(String(summary.filters?.created_year?.max ?? ""))}" value="${escapeHtml(String(filters.createdYearMin || ""))}" placeholder="From">
            <input data-statistics-field="createdYearMax" type="number" min="${escapeHtml(String(summary.filters?.created_year?.min ?? ""))}" max="${escapeHtml(String(summary.filters?.created_year?.max ?? ""))}" value="${escapeHtml(String(filters.createdYearMax || ""))}" placeholder="To">
          </div>
        </div>
      </div>
      <div class="statistics-filter-actions">
        <div class="statistics-meta-line">
          Refreshed ${escapeHtml(formatDisplayDate(summary.generated_at))} • FX source: ${escapeHtml(statisticsProvidersLabel(summary.fx))}
        </div>
        <button type="button" class="ghost-button" data-statistics-reset="true">Reset filters</button>
      </div>
    </article>
  `;
}

function renderStatisticsTable(rows, filters, summary) {
  const sortedRows = statisticsSortRows(
    rows.filter((row) => statisticsTableMatches(row, filters.tableSearch)),
    filters.tableSort,
    filters.apcCurrency
  );
  const pageSize = Number(summary.table_defaults?.page_size) || STATISTICS_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  state.statistics.tablePage = Math.max(1, Math.min(state.statistics.tablePage, pageCount));
  const start = (state.statistics.tablePage - 1) * pageSize;
  const pageRows = sortedRows.slice(start, start + pageSize);
  const apcKey = filters.apcCurrency === "USD" ? "apc_max_usd" : "apc_max_eur";

  return `
    <article class="statistics-table-card">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Journals</span>
          <h2>Filter-aware table</h2>
        </div>
        <span class="section-meta">${formatNumber(sortedRows.length)} journals</span>
      </div>
      <div class="statistics-table-tools">
        <label class="statistics-field">
          <span class="statistics-field-label">Search title, country, or subject</span>
          <input data-statistics-field="tableSearch" type="text" value="${escapeHtml(filters.tableSearch || "")}" placeholder="Search within filtered journals">
        </label>
        <label class="statistics-field">
          <span class="statistics-field-label">Sort table</span>
          <select data-statistics-field="tableSort">
            ${renderStatisticsSelectOptions(
              [
                "last_updated_desc",
                "created_date_desc",
                "title_asc",
                "country_asc",
                "apc_desc",
                "article_records_desc",
              ],
              filters.tableSort,
              (value) => ({
                last_updated_desc: "Last updated",
                created_date_desc: "Date of inclusion",
                title_asc: "Title A-Z",
                country_asc: "Country A-Z",
                apc_desc: `Highest APC (${filters.apcCurrency})`,
                article_records_desc: "Most article records",
              }[value] || value),
              { includeAll: false }
            )}
          </select>
        </label>
      </div>
      <div class="statistics-table-wrap">
        <table class="statistics-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Country of publisher</th>
              <th>Subject</th>
              <th>APC</th>
              <th>APC max (${escapeHtml(filters.apcCurrency)})</th>
              <th>Article records</th>
              <th>Date of inclusion</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            ${
              pageRows.length
                ? pageRows
                    .map((row) => `
                      <tr>
                        <td>
                          <div class="statistics-row-title">
                            <strong>${escapeHtml(row.title)}</strong>
                            <span class="statistics-inline-note">${escapeHtml(row.publisher_name || "Publisher unavailable")}</span>
                            <div class="statistics-row-links">
                              ${row.website ? `<a class="inline-link" href="${escapeHtml(row.website)}" target="_blank" rel="noopener noreferrer">Website</a>` : ""}
                              ${row.author_guidelines_url ? `<a class="inline-link" href="${escapeHtml(row.author_guidelines_url)}" target="_blank" rel="noopener noreferrer">Author guidelines</a>` : ""}
                              <button class="ghost-button" type="button" data-entity-type="journal" data-entity-key="${escapeHtml(row.id)}">Open</button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="statistics-row-title">
                            <strong>${escapeHtml(formatCountryName(row.country) || "Unknown")}</strong>
                            <span class="statistics-inline-note">${escapeHtml(row.continent || "Unknown")}</span>
                          </div>
                        </td>
                        <td>
                          <div class="statistics-row-subjects">
                            ${(row.subjects || []).slice(0, 3).map((item) => `<span class="statistics-chip" data-tone="warm">${escapeHtml(item)}</span>`).join("") || `<span class="statistics-inline-note">Not exposed</span>`}
                          </div>
                        </td>
                        <td><span class="statistics-chip" data-tone="${row.apc_has ? "accent" : "article"}">${escapeHtml(row.apc_has ? "Yes" : "No")}</span></td>
                        <td>${escapeHtml(formatCurrencyAmount(row[apcKey], filters.apcCurrency))}</td>
                        <td>${row.article_records_exposed ? escapeHtml(formatNumber(row.article_records_exposed)) : `<span class="statistics-inline-note">Not exposed</span>`}</td>
                        <td>${escapeHtml(formatDisplayDate(row.created_date))}</td>
                        <td>${escapeHtml(formatDisplayDate(row.last_updated))}</td>
                      </tr>
                    `)
                    .join("")
                : `
                  <tr>
                    <td colspan="8"><div class="empty-state">No journals match the current filters.</div></td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>
      <div class="statistics-pagination">
        <div class="statistics-pagination-group">
          <button type="button" class="ghost-button" data-statistics-page="prev" ${state.statistics.tablePage <= 1 ? "disabled" : ""}>Previous</button>
          <button type="button" class="ghost-button" data-statistics-page="next" ${state.statistics.tablePage >= pageCount ? "disabled" : ""}>Next</button>
        </div>
        <div class="statistics-inline-note">
          Page ${formatNumber(state.statistics.tablePage)} of ${formatNumber(pageCount)} • Showing ${formatNumber(pageRows.length)} of ${formatNumber(sortedRows.length)} filtered journals
        </div>
      </div>
    </article>
  `;
}

async function ensureStatisticsData() {
  if (state.statistics.status === "loaded" && state.statistics.summary && state.statistics.journals.length) {
    return state.statistics;
  }
  if (statisticsDataPromise) {
    return statisticsDataPromise;
  }

  state.statistics.status = "loading";
  state.statistics.error = "";
  statisticsDataPromise = Promise.all([
    fetchStaticJson(STATISTICS_SUMMARY_URL),
    fetchStaticJson(STATISTICS_JOURNALS_URL),
  ])
    .then(([summary, journals]) => {
      state.statistics.summary = summary;
      state.statistics.journals = journals.items || [];
      state.statistics.status = "loaded";
      if (!state.statistics.filters) {
        state.statistics.filters = statisticsDefaultFilters(summary);
      }
      return state.statistics;
    })
    .catch((error) => {
      state.statistics.status = "failed";
      state.statistics.error = error.message || "Statistics data could not be loaded.";
      throw error;
    })
    .finally(() => {
      statisticsDataPromise = null;
    });

  return statisticsDataPromise;
}

function attachStatisticsHandlers() {
  dom.statisticsContent.querySelectorAll("[data-statistics-field]").forEach((field) => {
    const handler = () => {
      const key = field.dataset.statisticsField;
      state.statistics.filters[key] = field.value;
      if (key !== "tableSort") {
        state.statistics.tablePage = 1;
      }
      void renderStatisticsHome();
    };
    const eventName = field.tagName === "SELECT" || field.type === "number" ? "change" : "input";
    field.addEventListener(eventName, handler);
  });

  dom.statisticsContent.querySelector("[data-statistics-reset='true']")?.addEventListener("click", () => {
    state.statistics.filters = statisticsDefaultFilters(state.statistics.summary);
    state.statistics.tablePage = 1;
    void renderStatisticsHome();
  });

  dom.statisticsContent.querySelector("[data-statistics-page='prev']")?.addEventListener("click", () => {
    state.statistics.tablePage = Math.max(1, state.statistics.tablePage - 1);
    void renderStatisticsHome();
  });

  dom.statisticsContent.querySelector("[data-statistics-page='next']")?.addEventListener("click", () => {
    state.statistics.tablePage += 1;
    void renderStatisticsHome();
  });

  dom.statisticsContent.querySelector("#statistics-map-fullscreen-btn")?.addEventListener("click", openStatisticsMapFullscreen);
  bindStatisticsMapFullscreenListeners();
  updateStatisticsMapFullscreenButtonLabel();

  attachOpenHandlers(dom.statisticsContent);
}

async function renderStatisticsHome() {
  await ensureStatisticsData();
  const summary = state.statistics.summary;
  const filters = state.statistics.filters || statisticsDefaultFilters(summary);
  state.statistics.filters = filters;

  const filteredRows = statisticsRowsFiltered(state.statistics.journals, filters);
  const charts = statisticsCharts(filteredRows, filters.apcCurrency);
  const mapChart = charts.country_map || null;
  const visualCharts = Object.entries(charts).filter(([chartKey]) => chartKey !== "country_map");
  const kpis = statisticsKpis(filteredRows, summary, filters);
  const warnings = unique([...(summary.warnings || []), ...((summary.fx && summary.fx.warnings) || [])]);

  dom.statisticsMeta.textContent = `${formatNumber(summary.journal_total)} journals • refreshed ${formatDisplayDate(summary.generated_at)}`;
  setStatisticsState("", true);
  disposeMountedCharts();
  dom.statisticsContent.innerHTML = `
    <div class="statistics-stack">
      ${warnings.length ? `<div class="warning-strip">${escapeHtml(warnings.join(" "))}</div>` : ""}
      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Global overview</span>
            <h2>Key indicators</h2>
          </div>
          <span class="section-meta">DOAJ API • refresh every 3 hours</span>
        </div>
        <div class="kpi-grid">
          ${kpis
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
      ${renderStatisticsFiltersCard(summary, filters, filteredRows)}
      ${mapChart ? `
        <section>
          ${renderChartCard("statistics-country_map", mapChart)}
        </section>
      ` : ""}
      <section>
        <div class="section-heading">
          <div>
            <span class="section-kicker">Charts</span>
            <h2>Visuals</h2>
          </div>
          <span class="section-meta">${formatNumber(filteredRows.length)} journals in current view</span>
        </div>
        <div class="statistics-visual-grid">
          ${visualCharts
            .map(([chartKey, chart]) => renderChartCard(`statistics-${chartKey}`, chart))
            .join("")}
        </div>
      </section>
      ${renderStatisticsTable(filteredRows, filters, summary)}
    </div>
  `;
  attachStatisticsHandlers();
  void mountCharts(
    Object.fromEntries(Object.entries(charts).map(([key, value]) => [`statistics-${key}`, value]))
  );
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
  const countries = unique(journals.map(journalCountry).concat(articles.map(articleJournalCountry)).filter(Boolean));
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
  const wordCloud = topTerms((journals.length ? journals.map(journalTitle) : articles.map(articleJournalTitle)), 22);

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
    summary: `${publisher.title} currently appears with ${journals.length} query-matched journals and ${articles.length} query-matched articles across ${countries.length || 0} publisher countr${countries.length === 1 ? "y" : "ies"} and ${languages.length} language${languages.length === 1 ? "" : "s"}.`,
    kpis: [
      { label: "Total journals", value: formatNumber(journals.length), tone: "accent" },
      { label: "Total related articles", value: formatNumber(articles.length), tone: "accent" },
      { label: "Publisher countries", value: formatNumber(countries.length) },
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
          ? `The publisher view is currently shaped by matched journal and article signals around ${wordCloud.slice(0, 6).map((item) => item.name).join(", ")}.`
          : "Not enough matched journal or article titles are available to build a stable word cloud.",
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

function setStatisticsState(message, hidden = false) {
  dom.statisticsState.textContent = message;
  dom.statisticsState.classList.toggle("hidden", hidden);
}

function setPrecheckState(message, hidden = false) {
  dom.precheckState.textContent = message;
  dom.precheckState.classList.toggle("hidden", hidden);
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
  const mode = new URL(window.location.href).searchParams.get("mode");
  if (mode === "matching") {
    return "matching";
  }
  if (mode === "statistics") {
    return "statistics";
  }
  if (mode === "precheck") {
    return "precheck";
  }
  return "main-search";
}

function syncUrl(query, hash = "", replace = false, { mode = currentModeFromUrl() } = {}) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }
  if (mode === "matching" || mode === "statistics" || mode === "precheck") {
    url.searchParams.set("mode", mode);
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
  dom.modeStatistics.classList.toggle("is-active", mode === "statistics");
  dom.modePrecheck.classList.toggle("is-active", mode === "precheck");
}

function showHomeView(
  {
    mode = currentModeFromUrl(),
    showResults = true,
    showMatchingResults = false,
    showStatistics = false,
    showPrecheck = false,
  } = {}
) {
  state.ui.mode = mode;
  dom.hero.classList.remove("hidden");
  dom.detailBreadcrumb.classList.add("hidden");
  dom.homeView.classList.remove("hidden");
  dom.heroMainSearch.classList.toggle("hidden", mode !== "main-search");
  dom.heroJournalMatching.classList.toggle("hidden", mode !== "matching");
  dom.heroStatistics.classList.toggle("hidden", mode !== "statistics");
  dom.heroPrecheck.classList.toggle("hidden", mode !== "precheck");
  dom.resultsPanel.classList.toggle("hidden", mode !== "main-search" || !showResults);
  dom.matchingPanel.classList.toggle("hidden", mode !== "matching" || !showMatchingResults);
  dom.statisticsPanel.classList.toggle("hidden", mode !== "statistics" || !showStatistics);
  dom.precheckPanel.classList.toggle("hidden", mode !== "precheck" || !showPrecheck);
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
  if (mode === "statistics") {
    syncUrl("", `${entityType}/${encodeURIComponent(entityKey)}`, false, { mode: "statistics" });
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
          <p>Languages: ${escapeHtml(item.languages.map(formatLanguageName).join(", ") || "Not exposed")}</p>
        </div>
      </div>
      <div class="result-actions">
        <div class="muted-line">Sorted by latest matched record</div>
        <button class="result-action" data-kind="publisher" data-entity-type="publisher" data-entity-key="${escapeHtml(item.entity_key)}">Open</button>
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
          <p>Languages: ${escapeHtml(journalLanguages(record).map(formatLanguageName).join(", ") || "Not exposed")}</p>
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
        <button class="result-action" data-kind="journal" data-entity-type="journal" data-entity-key="${escapeHtml(`${record.id}`)}">Open</button>
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
            <strong class="mini-value">${escapeHtml(matchingEvidenceLabel(result))}</strong>
          </div>
        </div>
        <div class="matching-theme-block">
          <span class="mini-label">Matched themes</span>
          ${themes}
        </div>
      </div>
      <div class="result-actions">
        <div class="muted-line">${escapeHtml(result.rankingMode === "semantic" ? "Semantic reranking applied" : "Live lexical ranking")}</div>
        <button class="result-action" data-kind="journal" data-entity-type="journal" data-entity-key="${escapeHtml(result.entityKey)}">Open</button>
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
        <button class="result-action" data-kind="article" data-entity-type="article" data-entity-key="${escapeHtml(`${record.id}`)}">Open</button>
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
        <button class="result-action" data-kind="article" data-entity-type="article" data-entity-key="${escapeHtml(`${record.id}`)}">Open</button>
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

function renderPrecheckGuardrailCard() {
  return `
    <article class="guardrail-card">
      <div class="card-header">
        <div>
          <span class="section-kicker">Guardrail</span>
          <h3>Use DOAJ guidance as the reference point</h3>
        </div>
      </div>
      <p>
        Use this tool to review your journal website before applying to the Directory of Open Access Journals (DOAJ).
        The result is indicative only: DOAJ will always make its own independent decision.
      </p>
      <div class="precheck-source-list">
        ${PRECHECK_SOURCES.map(
          (item) => `
            <a class="precheck-source-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(item.label)}
            </a>
          `
        ).join("")}
      </div>
      <p class="muted-line">
        This checklist is aligned to the official DOAJ application questions and guidance, but it keeps each prompt in a Yes/No
        website-review format. Every item tagged <strong>Must</strong> should be present on the journal website to support a
        minimum DOAJ-ready baseline. Items without Must are treated here as best practice signals.
      </p>
    </article>
  `;
}

function renderPrecheckQuestion(item) {
  const source = precheckSource(item);
  const answer = normalizePrecheckAnswer(state.precheck.answers[item.id]);
  return `
    <article class="precheck-question" data-item-id="${escapeHtml(item.id)}" data-level="${escapeHtml(item.level)}">
      <div class="precheck-question-head">
        <span class="precheck-level" data-kind="${escapeHtml(item.level)}">${escapeHtml(precheckLevelLabel(item.level))}</span>
        ${source ? `<a class="precheck-source-link precheck-source-link--inline" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>` : ""}
      </div>
      <p class="precheck-question-text">${escapeHtml(item.text)}</p>
      <div class="precheck-choice-group" role="radiogroup" aria-label="${escapeHtml(item.text)}">
        <label class="precheck-choice ${answer === "yes" ? "is-selected" : ""}">
          <input type="radio" name="precheck-${escapeHtml(item.id)}" value="yes" ${answer === "yes" ? "checked" : ""}>
          <span>Yes</span>
        </label>
        <label class="precheck-choice ${answer === "no" ? "is-selected" : ""}">
          <input type="radio" name="precheck-${escapeHtml(item.id)}" value="no" ${answer === "no" ? "checked" : ""}>
          <span>No</span>
        </label>
      </div>
    </article>
  `;
}

function renderPrecheckSection(section) {
  const mustCount = section.items.filter((item) => item.level === "must").length;
  const bestCount = section.items.filter((item) => item.level === "best").length;
  return `
    <section class="precheck-section">
      <div class="card-header">
        <div>
          <span class="section-kicker">Checklist</span>
          <h3>${escapeHtml(section.title)}</h3>
        </div>
        <span class="section-meta">${mustCount} must${bestCount ? ` • ${bestCount} best practice` : ""}</span>
      </div>
      <p>${escapeHtml(section.description)}</p>
      <div class="precheck-question-list">
        ${section.items.map((item) => renderPrecheckQuestion(item)).join("")}
      </div>
    </section>
  `;
}

function renderPrecheckSummaryPanel(summary) {
  const totalMust = PRECHECK_ITEMS.filter((item) => item.level === "must").length;
  const totalBest = PRECHECK_ITEMS.filter((item) => item.level === "best").length;
  const status = precheckStatusCopy(summary);
  const blockingItems = summary.failedMust.length
    ? `
      <div class="precheck-summary-block">
        <h4>Blocking must items</h4>
        <ul class="precheck-list">
          ${summary.failedMust.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("")}
        </ul>
      </div>
    `
    : "";
  const pendingItems = summary.pendingMust.length
    ? `
      <div class="precheck-summary-block">
        <h4>Must items still unanswered</h4>
        <ul class="precheck-list">
          ${summary.pendingMust.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("")}
        </ul>
      </div>
    `
    : "";
  return `
    <article class="precheck-status-card precheck-status-card--${escapeHtml(status.tone)}">
      <span class="section-kicker">Live result</span>
      <h3>${escapeHtml(status.title)}</h3>
      <p>${escapeHtml(status.text)}</p>
    </article>
    <div class="precheck-summary-grid">
      <article class="kpi-card">
        <span class="mini-label">Must items passed</span>
        <strong class="mini-value">${summary.must.yes} / ${totalMust}</strong>
      </article>
      <article class="kpi-card">
        <span class="mini-label">Must items failed</span>
        <strong class="mini-value">${summary.must.no}</strong>
      </article>
      <article class="kpi-card">
        <span class="mini-label">Must items unanswered</span>
        <strong class="mini-value">${summary.must.unanswered}</strong>
      </article>
      <article class="kpi-card">
        <span class="mini-label">Best practice passed</span>
        <strong class="mini-value">${summary.best.yes} / ${totalBest}</strong>
      </article>
      <article class="kpi-card">
        <span class="mini-label">Best practice failed</span>
        <strong class="mini-value">${summary.best.no}</strong>
      </article>
      <article class="kpi-card">
        <span class="mini-label">Best practice unanswered</span>
        <strong class="mini-value">${summary.best.unanswered}</strong>
      </article>
    </div>
    ${blockingItems}
    ${pendingItems}
  `;
}

function updatePrecheckSummary() {
  const summary = getPrecheckSummary();
  const totalMust = PRECHECK_ITEMS.filter((item) => item.level === "must").length;
  dom.precheckMeta.textContent = `${summary.must.yes}/${totalMust} must Yes • ${summary.must.no} blocked`;
  const summaryNode = dom.precheckContent.querySelector("#precheck-summary-panel");
  if (summaryNode) {
    summaryNode.innerHTML = renderPrecheckSummaryPanel(summary);
  }
}

function attachPrecheckHandlers() {
  dom.precheckContent.querySelectorAll('input[name^="precheck-"]').forEach((input) => {
    input.addEventListener("change", () => {
      const itemId = input.name.replace(/^precheck-/, "");
      if (!PRECHECK_ITEM_MAP.has(itemId)) {
        return;
      }
      state.precheck.answers[itemId] = normalizePrecheckAnswer(input.value);
      const question = input.closest(".precheck-question");
      if (question) {
        question.querySelectorAll(".precheck-choice").forEach((choice) => {
          const radio = choice.querySelector("input");
          choice.classList.toggle("is-selected", Boolean(radio?.checked));
        });
      }
      updatePrecheckSummary();
    });
  });
}

function renderPrecheckHome() {
  setPrecheckState("", true);
  dom.precheckContent.innerHTML = `
    <div class="precheck-layout">
      <section class="precheck-main">
        ${renderPrecheckGuardrailCard()}
        ${PRECHECK_SECTIONS.map((section) => renderPrecheckSection(section)).join("")}
      </section>
      <aside class="precheck-sidebar">
        <div id="precheck-summary-panel" class="dashboard-stack"></div>
      </aside>
    </div>
  `;
  attachPrecheckHandlers();
  updatePrecheckSummary();
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
    { color: theme.teal, background: theme.tealSoft || "rgba(58, 89, 89, 0.14)", border: theme.teal },
    { color: theme.accentStrong, background: theme.accentSoft, border: theme.accent },
    { color: theme.articleStrong, background: theme.articleSoft, border: theme.article },
    { color: theme.leafStrong || "#5f7d42", background: theme.leafSoft || "rgba(163, 195, 134, 0.2)", border: theme.leaf },
    { color: theme.warmStrong, background: theme.warmSoft, border: theme.warm },
    { color: theme.yellowStrong || "#8c7420", background: "rgba(249, 217, 80, 0.18)", border: theme.yellow || "#F9D950" },
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
  const chartClasses = [
    "chart-card",
    chart.fullWidth ? "chart-card--full" : "",
    chart.kind === "map" ? "chart-card--map" : "",
  ].filter(Boolean).join(" ");
  if (chart.kind === "wordcloud") {
    return `
      <article class="${chartClasses}">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="wordcloud-wrap">${renderWordCloudItems(chart.items)}</div>
      </article>
    `;
  }
  if (chart.kind === "tags") {
    return `
      <article class="${chartClasses}">
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
      <article class="${chartClasses}">
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
  if (chart.kind === "map") {
    return `
      <article class="${chartClasses} statistics-map-shell" id="chart-${chartKey}-shell">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="statistics-map-stage">
          <button id="statistics-map-fullscreen-btn" class="statistics-map-fullscreen-btn" type="button">Full page map</button>
          <div class="statistics-map-legend">
            <span class="mini-label">Continents</span>
            <div class="statistics-map-legend-list">
              ${(chart.continents || [])
                .map(
                  (item) => `
                    <div class="statistics-map-legend-item">
                      <span class="statistics-map-dot" style="background:${escapeHtml(item.color)};"></span>
                      <span>${escapeHtml(item.name)} (${escapeHtml(formatNumber(item.value))})</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
          <div class="chart-surface statistics-map-surface" id="chart-${chartKey}"></div>
          <div class="statistics-map-fullscreen-footer">Developed by Ikhwan Arief. Data source: DOAJ.</div>
        </div>
      </article>
    `;
  }
  return `
    <article class="${chartClasses}">
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
  if (mode === "matching" || mode === "statistics") {
    url.searchParams.set("mode", mode);
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
  if (mode === "statistics") {
    return "?mode=statistics";
  }
  if (mode === "precheck") {
    return "?mode=precheck";
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
  disposeMountedCharts();

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

  void mountCharts(payload.charts);
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
  disposeMountedCharts();

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

  void mountCharts(payload.charts);
}

async function mountCharts(charts) {
  if (!window.echarts && !window.Plotly) {
    return;
  }
  const theme = getChartTheme();
  const palette = OFFICIAL_SERIES_COLORS;
  for (const [chartKey, chart] of Object.entries(charts)) {
    if (!["bar", "pie", "timeline", "map", "share-bar"].includes(chart.kind)) {
      continue;
    }
    const node = document.getElementById(`chart-${chartKey}`);
    if (!node) {
      continue;
    }
    const existing = window.echarts.getInstanceByDom(node);
    if (existing) {
      existing.dispose();
    }
    if (chart.kind === "map") {
      if (!window.Plotly) {
        node.innerHTML = `<div class="empty-state">Map rendering is unavailable in this browser session.</div>`;
        continue;
      }
      const maxValue = Math.max(...(chart.items || []).map((item) => Number(item.value) || 0), 1);
      const continentSeries = (chart.continents || [])
        .map((continent) => {
          const entries = (chart.items || []).filter((item) => item.continent === continent.name);
          if (!entries.length) {
            return null;
          }
          return {
            type: "scattergeo",
            mode: "markers",
            name: continent.name,
            locationmode: "country names",
            locations: entries.map((item) => item.name),
            text: entries.map((item) => `${item.name}<br/>${continent.name}: ${formatNumber(item.value)} journals`),
            hovertemplate: "%{text}<extra></extra>",
            marker: {
              color: continent.color,
              size: entries.map((item) => 8 + Math.sqrt((Number(item.value) || 0) / maxValue) * 34),
              opacity: 0.78,
              line: {
                color: "#282624",
                width: 0.5,
              },
            },
          };
        })
        .filter(Boolean);
      await window.Plotly.newPlot(
        node,
        continentSeries,
        {
          dragmode: false,
          margin: { l: 10, r: 44, t: 10, b: 10 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          showlegend: false,
          geo: {
            projection: { type: "natural earth" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: theme.line,
            showcountries: true,
            countrycolor: theme.line,
            showland: true,
            landcolor: "#FFFFFF",
            showocean: true,
            oceancolor: "rgba(0,0,0,0)",
            bgcolor: "rgba(0,0,0,0)",
          },
        },
        {
          displayModeBar: false,
          responsive: true,
          scrollZoom: false,
          doubleClick: false,
          staticPlot: false,
          showTips: false,
        }
      );
      mountedPlotlyNodes.push(node);
      window.setTimeout(resizeStatisticsMapPlot, 50);
      window.setTimeout(updateStatisticsMapFullscreenButtonLabel, 60);
      continue;
    }

    if (!window.echarts) {
      continue;
    }
    const instance = window.echarts.init(node);
    mountedChartInstances.push(instance);
    if (chart.kind === "share-bar") {
      const yesItem = (chart.items || []).find((item) => item.name === "Yes") || { name: "Yes", value: 0 };
      const noItem = (chart.items || []).find((item) => item.name === "No") || { name: "No", value: 0 };
      const total = Number(yesItem.value || 0) + Number(noItem.value || 0);
      if (!total) {
        instance.setOption({
          title: {
            text: "No data yet",
            left: "center",
            top: "center",
            textStyle: { color: theme.muted, fontWeight: "normal", fontSize: 14 },
          },
          xAxis: { show: false },
          yAxis: { show: false },
          series: [],
        });
        requestAnimationFrame(() => instance.resize());
        continue;
      }
      const yesPct = (Number(yesItem.value || 0) / total) * 100;
      const noPct = (Number(noItem.value || 0) / total) * 100;
      instance.setOption({
        animationDuration: 320,
        color: [chart.yesColor || "#47A178", chart.noColor || "#FD5A3B"],
        grid: { left: 20, right: 38, top: 58, bottom: 54 },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: () =>
            `Yes: ${formatNumber(yesItem.value)} journals (${yesPct.toFixed(1)}%)<br/>No: ${formatNumber(noItem.value)} journals (${noPct.toFixed(1)}%)`,
        },
        legend: {
          bottom: 0,
          left: 0,
          itemWidth: 14,
          itemHeight: 14,
          textStyle: { color: theme.muted },
          data: ["Yes", "No"],
        },
        graphic: [
          {
            type: "text",
            right: 20,
            top: 12,
            style: {
              text: `Total journals: ${formatNumber(total)}`,
              fill: theme.muted,
              font: '14px "Source Sans 3"',
            },
          },
        ],
        xAxis: {
          type: "value",
          min: 0,
          max: 100,
          axisLabel: {
            color: theme.muted,
            formatter: (value) => `${value}%`,
          },
          splitLine: { lineStyle: { color: theme.line } },
        },
        yAxis: {
          type: "category",
          data: ["Share"],
          axisLabel: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
        },
        series: [
          {
            name: "Yes",
            type: "bar",
            stack: "share",
            barWidth: 106,
            label: {
              show: true,
              position: "insideRight",
              color: "#ffffff",
              formatter: `${yesPct.toFixed(1)}%`,
            },
            data: [Number(yesPct.toFixed(1))],
          },
          {
            name: "No",
            type: "bar",
            stack: "share",
            barWidth: 106,
            label: {
              show: true,
              position: "insideRight",
              color: "#ffffff",
              formatter: `${noPct.toFixed(1)}%`,
            },
            data: [Number(noPct.toFixed(1))],
          },
        ],
      });
      requestAnimationFrame(() => instance.resize());
      continue;
    }
    if (chart.kind === "pie") {
      instance.setOption({
        color: chart.colors || palette,
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
      const horizontal = chart.orientation === "horizontal";
      const colors = chart.colors || items.map(() => chart.color || theme.teal);
      const plotItems = items.slice();
      instance.setOption({
        color: colors,
        grid: horizontal
          ? { left: chart.leftMargin || 220, right: 44, top: 22, bottom: 24 }
          : { left: 44, right: 18, top: 22, bottom: 54 },
        tooltip: { trigger: "axis" },
        xAxis: horizontal
          ? {
              type: "value",
              axisLabel: { color: theme.muted },
              splitLine: { lineStyle: { color: theme.line } },
            }
          : {
              type: "category",
              data: plotItems.map((item) => item.name),
              axisLabel: { color: theme.muted, rotate: plotItems.length > 6 ? 28 : 0 },
              axisLine: { lineStyle: { color: theme.line } },
            },
        yAxis: horizontal
          ? {
              type: "category",
              data: plotItems.map((item) => item.name).reverse(),
              axisLabel: { color: theme.ink },
              axisLine: { show: false },
              axisTick: { show: false },
            }
          : {
              type: "value",
              axisLabel: { color: theme.muted },
              splitLine: { lineStyle: { color: theme.line } },
            },
        series: [
          {
            type: "bar",
            data: horizontal ? plotItems.map((item) => item.value).reverse() : plotItems.map((item) => item.value),
            itemStyle: {
              color: (params) => colors[horizontal ? plotItems.length - 1 - params.dataIndex : params.dataIndex] || chart.color || theme.teal,
              borderRadius: [10, 10, 2, 2],
            },
            label: horizontal
              ? {
                  show: true,
                  position: "insideRight",
                  color: "#ffffff",
                  formatter: ({ value }) => formatNumber(value),
                }
              : undefined,
          },
        ],
      });
      requestAnimationFrame(() => instance.resize());
      continue;
    }
    instance.setOption({
      color: chart.seriesColors || palette,
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
        itemStyle: { color: (chart.seriesColors || palette)[index % (chart.seriesColors || palette).length] },
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
  if (journals.length) {
    renderLockedResults(
      "Matched journals",
      `${journals.length} journals • search phrase "${state.search.query}"`,
      journals.map((item) => renderJournalCard(item, { showWebsite: true })).join("")
    );
  } else if (articles.length) {
    renderLockedResults(
      "Matched articles",
      `${articles.length} articles • search phrase "${state.search.query}"`,
      articles.map((item) => renderMatchedArticleTitleCard(item)).join("")
    );
  } else {
    renderLockedResults(
      "Matched records",
      `0 records • search phrase "${state.search.query}"`,
      ""
    );
  }
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
  const modeLabel = currentModeFromUrl() === "matching"
    ? "Journal Matching"
    : currentModeFromUrl() === "statistics"
      ? "Statistics"
      : currentModeFromUrl() === "precheck"
        ? "Inclusion Pre-check"
      : "Search";
  renderBreadcrumb([
    { label: modeLabel, href: searchResultsHref() },
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

  if (route.view === "home" && mode === "statistics") {
    showHomeView({ mode: "statistics", showStatistics: true });
    dom.statisticsMeta.textContent = state.statistics.summary
      ? `${formatNumber(state.statistics.summary.journal_total)} journals • refreshed ${formatDisplayDate(state.statistics.summary.generated_at)}`
      : "Loading statistics";
    setStatisticsState("Loading DOAJ statistics...", false);
    dom.statisticsContent.innerHTML = "";
    try {
      await renderStatisticsHome();
    } catch (error) {
      dom.statisticsMeta.textContent = "Statistics unavailable";
      setStatisticsState(error.message || "Statistics data could not be loaded.", false);
      dom.statisticsContent.innerHTML = "";
    }
    return;
  }

  if (route.view === "home" && mode === "precheck") {
    showHomeView({ mode: "precheck", showPrecheck: true });
    dom.precheckMeta.textContent = "Manual checklist";
    setPrecheckState("", true);
    renderPrecheckHome();
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

  if (mode === "statistics" && route.view === "detail") {
    try {
      setDashboardState("Loading detail...", false);
      dom.dashboardContent.innerHTML = "";
      if (route.entityType !== "journal") {
        throw new Error("Statistics currently opens journal detail pages only.");
      }
      await renderStandaloneJournalDetail(route.entityKey);
      return;
    } catch (error) {
      showDetailView({ singleColumn: true });
      renderBreadcrumb([
        { label: "Statistics", href: "?mode=statistics" },
        { label: "Dashboard" },
      ]);
      dom.dashboardKicker.textContent = "Load failed";
      dom.dashboardHeading.textContent = "Dashboard";
      dom.dashboardMeta.textContent = "Statistics";
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
    dom.searchNote.textContent = "Results are grouped into publishers, journals, and articles. Select any result for detail.";
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

dom.modeStatistics.addEventListener("click", () => {
  syncUrl("", "", false, { mode: "statistics" });
  void renderRoute();
});

dom.modePrecheck.addEventListener("click", () => {
  syncUrl("", "", false, { mode: "precheck" });
  void renderRoute();
});

dom.backToSearch.addEventListener("click", () => {
  if (currentModeFromUrl() === "matching") {
    syncUrl("", "", false, { mode: "matching" });
  } else if (currentModeFromUrl() === "statistics") {
    syncUrl("", "", false, { mode: "statistics" });
  } else if (currentModeFromUrl() === "precheck") {
    syncUrl("", "", false, { mode: "precheck" });
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
