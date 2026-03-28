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

const BOOLEAN_TERMS = new Set(["and", "or", "not"]);

const MATCH_KIND_PRIORITY = new Map([
  ["exact_title", 6],
  ["exact_publisher", 5],
  ["phrase", 4],
  ["all_terms", 3],
  ["token", 2],
  ["api_rank", 1],
  ["none", 0],
]);

const ENGLISH_SIGNAL_TOKENS = new Set([
  "analysis",
  "among",
  "between",
  "conclusion",
  "data",
  "findings",
  "from",
  "method",
  "methods",
  "results",
  "study",
  "that",
  "the",
  "these",
  "this",
  "using",
  "were",
  "with",
]);

const INDONESIAN_SIGNAL_TOKENS = new Set([
  "adalah",
  "analisis",
  "bahwa",
  "dalam",
  "dan",
  "dari",
  "dengan",
  "hasil",
  "kajian",
  "merupakan",
  "metode",
  "pada",
  "penelitian",
  "sebagai",
  "terhadap",
  "untuk",
  "yang",
]);

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

export function normalizeText(value) {
  return `${value || ""}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function unique(values) {
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

export function slugify(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.replace(/\s+/g, "-") : "unknown";
}

export function formatCountryName(value) {
  const raw = `${value || ""}`.trim();
  if (!raw) {
    return "";
  }
  if (/^[A-Za-z]{2}$/.test(raw) && regionNames) {
    return regionNames.of(raw.toUpperCase()) || raw.toUpperCase();
  }
  return raw;
}

export function normalizeSearchQuery(query) {
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

export function sanitizeExternalUrl(value) {
  const raw = `${value || ""}`.trim();
  if (!/^https?:\/\//i.test(raw)) {
    return "";
  }
  try {
    const resolved = new URL(raw);
    if (!["http:", "https:"].includes(resolved.protocol)) {
      return "";
    }
    return resolved.toString();
  } catch {
    return "";
  }
}

export function journalBib(record) {
  return record?.bibjson || {};
}

export function articleBib(record) {
  return record?.bibjson || {};
}

export function journalTitle(record) {
  return `${journalBib(record).title || ""}`.trim();
}

export function journalPublisher(record) {
  return `${journalBib(record).publisher?.name || ""}`.trim();
}

export function journalCountry(record) {
  return formatCountryName(journalBib(record).publisher?.country || "");
}

export function journalLanguages(record) {
  return unique(journalBib(record).language || []);
}

export function journalSubjects(record) {
  return unique((journalBib(record).subject || []).map((item) => item.term).filter(Boolean));
}

export function journalKeywords(record) {
  return unique((journalBib(record).keywords || []).filter(Boolean));
}

export function journalIssns(record) {
  return unique([journalBib(record).pissn, journalBib(record).eissn].filter(Boolean));
}

export function journalWebsite(record) {
  const refs = journalBib(record).ref || {};
  return refs.journal || refs.oa_statement || refs.aims_scope || null;
}

export function journalAuthorGuidelines(record) {
  const refs = journalBib(record).ref || {};
  return refs.author_instructions || null;
}

export function journalSortTimestamp(record) {
  return Math.max(toTimestamp(record?.last_updated), toTimestamp(record?.created_date));
}

export function articleTitle(record) {
  return `${articleBib(record).title || ""}`.trim();
}

export function articleAbstract(record) {
  return `${articleBib(record).abstract || ""}`.trim();
}

export function articleSubjects(record) {
  return unique((articleBib(record).subject || []).map((item) => item.term).filter(Boolean));
}

export function articleKeywords(record) {
  return unique((articleBib(record).keywords || []).filter(Boolean));
}

export function articleJournalTitle(record) {
  return `${articleBib(record).journal?.title || ""}`.trim();
}

export function articleJournalPublisher(record) {
  return `${articleBib(record).journal?.publisher || ""}`.trim();
}

export function articleJournalLanguages(record) {
  return unique(articleBib(record).journal?.language || []);
}

export function articleJournalIssns(record) {
  return unique(articleBib(record).journal?.issns || []);
}

export function articleJournalCountry(record) {
  return formatCountryName(articleBib(record).journal?.country || "");
}

export function articleDoi(record) {
  const identifier = (articleBib(record).identifier || []).find((item) => `${item.type || ""}`.toLowerCase() === "doi");
  return identifier?.id || null;
}

export function articleDoiUrl(record) {
  const doi = articleDoi(record);
  return doi ? `https://doi.org/${encodeURIComponent(doi)}` : null;
}

export function articleFulltextUrl(record) {
  const links = articleBib(record).link || [];
  const fulltext = links.find((item) => `${item.type || ""}`.toLowerCase() === "fulltext");
  return fulltext?.url || null;
}

export function articleSortTimestamp(record) {
  return Math.max(
    toTimestamp(record?.last_updated),
    toTimestamp(record?.created_date),
    toTimestamp(`${articleBib(record).year || ""}`.trim())
  );
}

export function toTimestamp(value) {
  if (!value) {
    return 0;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function boundedIncludes(haystack, needle) {
  if (!needle) {
    return false;
  }
  const paddedHaystack = ` ${haystack} `;
  return paddedHaystack.includes(` ${needle} `) || haystack.includes(needle);
}

function queryProfile(query) {
  const normalizedQuery = normalizeSearchQuery(query);
  const exactText = normalizeText(normalizedQuery.replace(/"/g, " "));
  const phrases = unique(
    (normalizedQuery.match(/"([^"]+)"/g) || [])
      .map((value) => normalizeText(value.replaceAll('"', "")))
      .filter(Boolean)
  );
  const terms = unique(
    normalizeText(normalizedQuery.replace(/"/g, " ").replace(/\b(AND|OR|NOT)\b/gi, " "))
      .split(/\s+/)
      .filter((token) => token && !BOOLEAN_TERMS.has(token) && token.length >= 3)
  );
  return {
    normalizedQuery,
    exactText,
    phrases,
    terms,
  };
}

function tokenMatchCount(tokens, text) {
  if (!tokens.length || !text) {
    return 0;
  }
  let count = 0;
  for (const token of tokens) {
    if (boundedIncludes(text, token)) {
      count += 1;
    }
  }
  return count;
}

function scoreQueryAgainstField(profile, fieldText, weights) {
  const normalizedField = normalizeText(fieldText);
  if (!normalizedField) {
    return { score: 0, phraseHits: 0, tokenHits: 0, exact: false, containsExact: false };
  }

  let score = 0;
  let phraseHits = 0;
  let tokenHits = 0;
  let exact = false;
  let containsExact = false;

  if (profile.exactText && normalizedField === profile.exactText) {
    score += weights.exact;
    exact = true;
  } else if (profile.exactText && boundedIncludes(normalizedField, profile.exactText)) {
    score += weights.containsExact;
    containsExact = true;
  }

  for (const phrase of profile.phrases) {
    if (boundedIncludes(normalizedField, phrase)) {
      score += weights.phrase;
      phraseHits += 1;
    }
  }

  tokenHits = tokenMatchCount(profile.terms, normalizedField);
  score += tokenHits * weights.token;

  if (profile.terms.length && tokenHits === profile.terms.length) {
    score += weights.allTerms;
  }

  return {
    score,
    phraseHits,
    tokenHits,
    exact,
    containsExact,
  };
}

function summarizeMatchKind(matchFlags) {
  if (matchFlags.exactTitle) {
    return "exact_title";
  }
  if (matchFlags.exactPublisher) {
    return "exact_publisher";
  }
  if (matchFlags.phraseHit) {
    return "phrase";
  }
  if (matchFlags.allTerms) {
    return "all_terms";
  }
  if (matchFlags.tokenHit) {
    return "token";
  }
  return "api_rank";
}

function decorateSearchRecord(record, fields, apiRank) {
  return {
    ...record,
    __searchScore: fields.score + Math.max(0, 10 - apiRank) * 0.5,
    __searchApiRank: apiRank,
    __searchMatchKind: summarizeMatchKind(fields.flags),
    __searchMatchedFields: fields.matchedFields,
  };
}

function journalSearchDecoration(record, query, apiRank) {
  const profile = queryProfile(query);
  const titleMatch = scoreQueryAgainstField(profile, journalTitle(record), {
    exact: 180,
    containsExact: 72,
    phrase: 36,
    token: 16,
    allTerms: 42,
  });
  const publisherMatch = scoreQueryAgainstField(profile, journalPublisher(record), {
    exact: 170,
    containsExact: 66,
    phrase: 32,
    token: 12,
    allTerms: 36,
  });
  const subjectMatch = scoreQueryAgainstField(profile, journalSubjects(record).join(" "), {
    exact: 76,
    containsExact: 52,
    phrase: 20,
    token: 8,
    allTerms: 18,
  });
  const keywordMatch = scoreQueryAgainstField(profile, journalKeywords(record).join(" "), {
    exact: 70,
    containsExact: 48,
    phrase: 18,
    token: 7,
    allTerms: 16,
  });
  const score = titleMatch.score + publisherMatch.score + subjectMatch.score + keywordMatch.score;
  return decorateSearchRecord(
    record,
    {
      score,
      flags: {
        exactTitle: titleMatch.exact,
        exactPublisher: publisherMatch.exact,
        phraseHit: titleMatch.phraseHits + publisherMatch.phraseHits + subjectMatch.phraseHits + keywordMatch.phraseHits > 0,
        allTerms:
          titleMatch.tokenHits === profile.terms.length
          || publisherMatch.tokenHits === profile.terms.length
          || subjectMatch.tokenHits === profile.terms.length
          || keywordMatch.tokenHits === profile.terms.length,
        tokenHit: titleMatch.tokenHits + publisherMatch.tokenHits + subjectMatch.tokenHits + keywordMatch.tokenHits > 0,
      },
      matchedFields: unique(
        [
          titleMatch.score ? "title" : "",
          publisherMatch.score ? "publisher" : "",
          subjectMatch.score ? "subject" : "",
          keywordMatch.score ? "keyword" : "",
        ].filter(Boolean)
      ),
    },
    apiRank
  );
}

function articleSearchDecoration(record, query, apiRank) {
  const profile = queryProfile(query);
  const titleMatch = scoreQueryAgainstField(profile, articleTitle(record), {
    exact: 190,
    containsExact: 78,
    phrase: 36,
    token: 16,
    allTerms: 42,
  });
  const journalTitleMatch = scoreQueryAgainstField(profile, articleJournalTitle(record), {
    exact: 112,
    containsExact: 56,
    phrase: 24,
    token: 10,
    allTerms: 20,
  });
  const publisherMatch = scoreQueryAgainstField(profile, articleJournalPublisher(record), {
    exact: 110,
    containsExact: 52,
    phrase: 22,
    token: 10,
    allTerms: 18,
  });
  const keywordMatch = scoreQueryAgainstField(profile, articleKeywords(record).join(" "), {
    exact: 90,
    containsExact: 42,
    phrase: 20,
    token: 9,
    allTerms: 18,
  });
  const subjectMatch = scoreQueryAgainstField(profile, articleSubjects(record).join(" "), {
    exact: 84,
    containsExact: 40,
    phrase: 18,
    token: 8,
    allTerms: 16,
  });
  const abstractMatch = scoreQueryAgainstField(profile, articleAbstract(record), {
    exact: 58,
    containsExact: 28,
    phrase: 8,
    token: 4,
    allTerms: 10,
  });
  const score =
    titleMatch.score
    + journalTitleMatch.score
    + publisherMatch.score
    + keywordMatch.score
    + subjectMatch.score
    + abstractMatch.score;
  return decorateSearchRecord(
    record,
    {
      score,
      flags: {
        exactTitle: titleMatch.exact,
        exactPublisher: publisherMatch.exact,
        phraseHit:
          titleMatch.phraseHits
          + journalTitleMatch.phraseHits
          + publisherMatch.phraseHits
          + keywordMatch.phraseHits
          + subjectMatch.phraseHits
          + abstractMatch.phraseHits
          > 0,
        allTerms:
          titleMatch.tokenHits === profile.terms.length
          || journalTitleMatch.tokenHits === profile.terms.length
          || publisherMatch.tokenHits === profile.terms.length
          || keywordMatch.tokenHits === profile.terms.length
          || subjectMatch.tokenHits === profile.terms.length,
        tokenHit:
          titleMatch.tokenHits
          + journalTitleMatch.tokenHits
          + publisherMatch.tokenHits
          + keywordMatch.tokenHits
          + subjectMatch.tokenHits
          + abstractMatch.tokenHits
          > 0,
      },
      matchedFields: unique(
        [
          titleMatch.score ? "title" : "",
          journalTitleMatch.score ? "journal_title" : "",
          publisherMatch.score ? "publisher" : "",
          keywordMatch.score ? "keyword" : "",
          subjectMatch.score ? "subject" : "",
          abstractMatch.score ? "abstract" : "",
        ].filter(Boolean)
      ),
    },
    apiRank
  );
}

function compareMatchKind(left, right) {
  return (MATCH_KIND_PRIORITY.get(right) || 0) - (MATCH_KIND_PRIORITY.get(left) || 0);
}

export function searchScore(record) {
  return Number(record?.__searchScore || 0);
}

export function searchApiRank(record) {
  if (Number.isFinite(record?.__searchApiRank)) {
    return record.__searchApiRank;
  }
  return Number.MAX_SAFE_INTEGER;
}

export function compareRankedSearchRecords(left, right, { timestamp = () => 0, label = () => "" } = {}) {
  const scoreDelta = searchScore(right) - searchScore(left);
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  const matchDelta = compareMatchKind(left?.__searchMatchKind, right?.__searchMatchKind);
  if (matchDelta !== 0) {
    return matchDelta;
  }

  const apiDelta = searchApiRank(left) - searchApiRank(right);
  if (apiDelta !== 0) {
    return apiDelta;
  }

  const recencyDelta = timestamp(right) - timestamp(left);
  if (recencyDelta !== 0) {
    return recencyDelta;
  }

  return label(left).localeCompare(label(right));
}

export function rankSearchResults(query, journals, articles) {
  const rankedJournals = (journals || [])
    .map((record, index) => journalSearchDecoration(record, query, index))
    .sort((left, right) =>
      compareRankedSearchRecords(left, right, {
        timestamp: journalSortTimestamp,
        label: journalTitle,
      })
    );
  const rankedArticles = (articles || [])
    .map((record, index) => articleSearchDecoration(record, query, index))
    .sort((left, right) =>
      compareRankedSearchRecords(left, right, {
        timestamp: articleSortTimestamp,
        label: articleTitle,
      })
    );
  return {
    journals: rankedJournals,
    articles: rankedArticles,
  };
}

function publisherGroupSort(left, right) {
  const scoreDelta = (right.search_score || 0) - (left.search_score || 0);
  if (scoreDelta !== 0) {
    return scoreDelta;
  }
  const coverageDelta = (right.journal_count + right.article_count) - (left.journal_count + left.article_count);
  if (coverageDelta !== 0) {
    return coverageDelta;
  }
  const apiDelta = (left.best_api_rank ?? Number.MAX_SAFE_INTEGER) - (right.best_api_rank ?? Number.MAX_SAFE_INTEGER);
  if (apiDelta !== 0) {
    return apiDelta;
  }
  const recencyDelta = (right.latestTs || 0) - (left.latestTs || 0);
  if (recencyDelta !== 0) {
    return recencyDelta;
  }
  return left.title.localeCompare(right.title);
}

export function derivePublisherSearchGroups(journals, articles) {
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
        search_score: 0,
        best_api_rank: Number.MAX_SAFE_INTEGER,
      });
    }
    return map.get(key);
  };

  for (const record of journals || []) {
    const name = journalPublisher(record);
    if (!name) {
      continue;
    }
    const entry = take(name);
    entry.journals.push(record);
    entry.latestTs = Math.max(entry.latestTs, journalSortTimestamp(record));
    entry.search_score = Math.max(entry.search_score, searchScore(record));
    entry.best_api_rank = Math.min(entry.best_api_rank, searchApiRank(record));
    const country = journalCountry(record);
    if (country) {
      entry.countries.add(country);
    }
    for (const language of journalLanguages(record)) {
      entry.languages.add(language);
    }
  }

  for (const record of articles || []) {
    const name = articleJournalPublisher(record);
    if (!name) {
      continue;
    }
    const entry = take(name);
    entry.articles.push(record);
    entry.latestTs = Math.max(entry.latestTs, articleSortTimestamp(record));
    entry.search_score = Math.max(entry.search_score, searchScore(record));
    entry.best_api_rank = Math.min(entry.best_api_rank, searchApiRank(record));
    const country = articleJournalCountry(record);
    if (country) {
      entry.countries.add(country);
    }
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
      search_score: item.search_score,
      best_api_rank: item.best_api_rank,
    }))
    .sort(publisherGroupSort);
}

export function deriveCountrySearchGroups(journals, articles) {
  const map = new Map();

  const take = (name) => {
    const key = formatCountryName(name);
    if (!key) {
      return null;
    }
    if (!map.has(key)) {
      map.set(key, {
        entity_type: "country",
        entity_key: key,
        title: key,
        publishers: new Set(),
        journals: [],
        articles: [],
        languages: new Set(),
        latestTs: 0,
        search_score: 0,
        best_api_rank: Number.MAX_SAFE_INTEGER,
      });
    }
    return map.get(key);
  };

  for (const record of journals || []) {
    const entry = take(journalCountry(record));
    if (!entry) {
      continue;
    }
    entry.journals.push(record);
    entry.latestTs = Math.max(entry.latestTs, journalSortTimestamp(record));
    entry.search_score = Math.max(entry.search_score, searchScore(record));
    entry.best_api_rank = Math.min(entry.best_api_rank, searchApiRank(record));
    const publisher = journalPublisher(record);
    if (publisher) {
      entry.publishers.add(publisher);
    }
    for (const language of journalLanguages(record)) {
      entry.languages.add(language);
    }
  }

  for (const record of articles || []) {
    const entry = take(articleJournalCountry(record));
    if (!entry) {
      continue;
    }
    entry.articles.push(record);
    entry.latestTs = Math.max(entry.latestTs, articleSortTimestamp(record));
    entry.search_score = Math.max(entry.search_score, searchScore(record));
    entry.best_api_rank = Math.min(entry.best_api_rank, searchApiRank(record));
    const publisher = articleJournalPublisher(record);
    if (publisher) {
      entry.publishers.add(publisher);
    }
    for (const language of articleJournalLanguages(record)) {
      entry.languages.add(language);
    }
  }

  return [...map.values()]
    .map((item) => ({
      entity_type: item.entity_type,
      entity_key: item.entity_key,
      title: item.title,
      publisher_count: item.publishers.size,
      journal_count: item.journals.length,
      article_count: item.articles.length,
      publishers: [...item.publishers].sort((left, right) => left.localeCompare(right)),
      languages: [...item.languages],
      latestTs: item.latestTs,
      search_score: item.search_score,
      best_api_rank: item.best_api_rank,
    }))
    .sort(publisherGroupSort);
}

export function tokenList(text, { minLength = 3 } = {}) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token && token.length >= minLength && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

export function matchingTokenList(text, { minLength = 4 } = {}) {
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

export function matchingTopTerms(texts, limit = 12) {
  const counter = new Map();
  for (const text of texts || []) {
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

export function matchingPhraseCounts(text, { minWords = 2, maxWords = 3, limit = 8 } = {}) {
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

export function clampText(value, limit = 1400) {
  const text = `${value || ""}`.trim();
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(limit - 1, 0)).trimEnd()}…`;
}

export function sanitizeMatchingText(text, { minLength = 4, limit = 3200 } = {}) {
  return clampText(matchingTokenList(text, { minLength }).join(" "), limit);
}

export function detectAbstractLanguage(text) {
  const tokens = normalizeText(text).split(/\s+/).filter(Boolean);
  const englishScore = tokens.reduce((count, token) => count + (ENGLISH_SIGNAL_TOKENS.has(token) ? 1 : 0), 0);
  const indonesianScore = tokens.reduce((count, token) => count + (INDONESIAN_SIGNAL_TOKENS.has(token) ? 1 : 0), 0);
  let language = "other";
  if (tokens.length >= 40) {
    if (englishScore >= indonesianScore + 2) {
      language = "en";
    } else if (indonesianScore >= englishScore + 2) {
      language = "id";
    } else if (englishScore > 0 && englishScore >= indonesianScore) {
      language = "en";
    } else if (indonesianScore > 0) {
      language = "id";
    }
  }
  return {
    language,
    supported: language === "en" || language === "id",
    tokenCount: tokens.length,
    englishScore,
    indonesianScore,
  };
}

export function buildAbstractProfile(abstract, { queryCount = 6 } = {}) {
  const cleanAbstract = `${abstract || ""}`.trim();
  const termItems = matchingTopTerms([cleanAbstract], 12);
  const phraseItems = matchingPhraseCounts(cleanAbstract, { minWords: 2, maxWords: 3, limit: 8 });
  const terms = termItems.map((item) => item.name);
  const phrases = phraseItems.map((item) => item.name);
  const fallbackTerms = matchingTokenList(cleanAbstract, { minLength: 5 }).slice(0, 6);
  const queries = unique([
    ...phrases.slice(0, 3).map((phrase) => `"${phrase.replaceAll('"', '\\"')}"`),
    ...terms.slice(0, Math.max(queryCount - 3, 0)),
    ...fallbackTerms,
  ]).slice(0, queryCount);

  return {
    abstract: cleanAbstract,
    terms,
    phrases,
    queries,
    lexicalText: unique([...phrases, ...terms]).join(" "),
  };
}

export function journalSignature(record) {
  const issns = journalIssns(record).map(normalizeText).filter(Boolean).sort();
  return {
    id: `${record?.id || ""}`.trim(),
    titleKey: normalizeText(journalTitle(record)),
    publisherKey: normalizeText(journalPublisher(record)),
    issns,
    primaryKey: `${record?.id || ""}`.trim() || `${normalizeText(journalTitle(record))}::${issns.join("|")}`,
  };
}

export function articleJournalSignature(record) {
  const issns = articleJournalIssns(record).map(normalizeText).filter(Boolean).sort();
  return {
    titleKey: normalizeText(articleJournalTitle(record)),
    publisherKey: normalizeText(articleJournalPublisher(record)),
    issns,
  };
}

export function sameJournalSignature(left, right) {
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

export function filterArticlesForJournal(records, journalRecord) {
  const issns = new Set(journalIssns(journalRecord).map((value) => normalizeText(value)));
  const titleKey = normalizeText(journalTitle(journalRecord));
  const publisherKey = normalizeText(journalPublisher(journalRecord));
  return (records || []).filter((article) => {
    const sameIssn = articleJournalIssns(article).some((issn) => issns.has(normalizeText(issn)));
    if (sameIssn) {
      return true;
    }
    return normalizeText(articleJournalTitle(article)) === titleKey && (!publisherKey || normalizeText(articleJournalPublisher(article)) === publisherKey);
  });
}

export function buildJournalCorpusQueries(journalRecord) {
  return unique([
    journalTitle(journalRecord) || "",
    journalTitle(journalRecord) ? `"${journalTitle(journalRecord).replaceAll('"', '\\"')}"` : "",
    ...journalIssns(journalRecord).map((issn) => `index.issn.exact:${normalizeText(issn) ? issn.replace(/([+\-!(){}[\]^"~*?:/\\])/g, "\\$1") : ""}`),
    ...journalIssns(journalRecord),
    ...journalIssns(journalRecord).map((issn) => `"${`${issn || ""}`.replaceAll('"', '\\"').trim()}"`),
  ]).filter(Boolean);
}

export function mergeMatchingCandidate(map, journal, { source = "journal", seedArticles = [] } = {}) {
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

export function matchingArticleJournalGroup(articles, limit = 12) {
  const grouped = new Map();
  for (const article of articles || []) {
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
    .slice(0, limit);
}

export function buildMatchingCandidateText(result) {
  const journal = result.journal;
  const seedArticles = result.seedArticles || [];
  const parts = [
    sanitizeMatchingText(journalTitle(journal), { minLength: 4, limit: 260 }),
    sanitizeMatchingText(journalSubjects(journal).join(" "), { minLength: 4, limit: 420 }),
    sanitizeMatchingText(journalKeywords(journal).join(" "), { minLength: 4, limit: 420 }),
    sanitizeMatchingText(seedArticles.map(articleTitle).join(" "), { minLength: 4, limit: 520 }),
    sanitizeMatchingText(seedArticles.map(articleAbstract).join(" "), { minLength: 4, limit: 1600 }),
    sanitizeMatchingText(seedArticles.flatMap(articleKeywords).join(" "), { minLength: 4, limit: 420 }),
    sanitizeMatchingText(seedArticles.flatMap(articleSubjects).join(" "), { minLength: 4, limit: 420 }),
  ];
  return clampText(parts.filter(Boolean).join(". "), 3200);
}

export function overlapTerms(profile, text, limit = 4) {
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

export function lexicalMatchScore(profile, text, { articleBoost = 0 } = {}) {
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

export function matchingJournalSummary(record, matchedTerms = [], { articleSignals = 0 } = {}) {
  const segments = [];
  if (journalSubjects(record).length) {
    segments.push(`Subjects: ${journalSubjects(record).slice(0, 3).join(", ")}.`);
  }
  if (journalKeywords(record).length) {
    segments.push(`Keywords: ${journalKeywords(record).slice(0, 4).join(", ")}.`);
  }
  if (matchedTerms.length) {
    segments.push(`Matched themes: ${matchedTerms.slice(0, 4).join(", ")}.`);
  }
  if (articleSignals > 0) {
    segments.push(`${articleSignals} related DOAJ article record${articleSignals === 1 ? "" : "s"} strengthened this recommendation.`);
  }
  if (!segments.length) {
    return "This journal overlaps with the submitted abstract through live DOAJ metadata.";
  }
  return segments.join(" ");
}

export function rankMatchingCandidates(profile, candidates, { rankingMode = "lexical", resultLimit = 20 } = {}) {
  const ranked = (candidates || []).map((candidate) => {
    const seedArticles = [...(candidate.seedArticles?.values?.() || candidate.seedArticles || [])];
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
    .slice(0, resultLimit);
}
