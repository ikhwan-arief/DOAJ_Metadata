import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import * as core from "../docs/search_matching_core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

export const API_BASE = "https://doaj.org/api/search";
export const MAX_LIVE_JOURNALS = 60;
export const MAX_LIVE_ARTICLES = 80;
export const MATCHING_RESULT_LIMIT = 20;
export const MATCHING_QUERY_COUNT = 4;
export const MATCHING_RESOLUTION_LIMIT = 8;
export const MATCHING_ENRICH_LIMIT = 0;
export const MATCHING_FETCH_CONCURRENCY = 2;
export const MATCHING_JOURNAL_QUERY_PAGE_SIZE = 12;
export const MATCHING_ARTICLE_QUERY_PAGE_SIZE = 12;
export const JOURNAL_CORPUS_PAGE_SIZE = 25;
export const JOURNAL_CORPUS_MAX_PAGES = 3;
export const JOURNAL_CORPUS_MAX_RECORDS = 75;
export const OUTPUT_DIR = path.resolve(__dirname, "../output/quality");

export async function readJson(relativePath) {
  const fullPath = path.resolve(__dirname, "..", relativePath);
  return JSON.parse(await readFile(fullPath, "utf8"));
}

export async function fetchJson(url, { timeoutMs = 30_000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "doaj-metadata-dashboard-quality/0.1",
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status}) for ${url}`);
      }
      return await response.json();
    } catch (error) {
      if (error?.cause?.code !== "ENOTFOUND" && error?.code !== "ENOTFOUND") {
        throw error;
      }
      const { stdout } = await execFileAsync(
        "curl",
        ["-sS", "--max-time", String(Math.max(5, Math.ceil(timeoutMs / 1000))), url],
        {
          maxBuffer: 20 * 1024 * 1024,
        }
      );
      return JSON.parse(stdout);
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPaginated(entity, query, { pageSize = 25, maxPages = 2, maxRecords = 100 } = {}) {
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

export async function mapWithConcurrency(items, limit, iteratee) {
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

export async function runLiveSearch(query) {
  const normalizedQuery = core.normalizeSearchQuery(query);
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

  const ranked = core.rankSearchResults(normalizedQuery, journalsPayload.results, articlesPayload.results);
  const journals = ranked.journals;
  const articles = ranked.articles;
  const publishers = core.derivePublisherSearchGroups(journals, articles);
  const countries = core.deriveCountrySearchGroups(journals, articles);

  return {
    query: normalizedQuery,
    journals,
    articles,
    publishers,
    countries,
  };
}

function matchingResultMatches(result, expected) {
  const titleMatches = core.normalizeText(core.journalTitle(result.journal)) === core.normalizeText(expected.title);
  if (!titleMatches) {
    return false;
  }
  if (!expected.publisher) {
    return true;
  }
  return core.normalizeText(core.journalPublisher(result.journal)) === core.normalizeText(expected.publisher);
}

function matchingResultSummary(result) {
  return {
    title: core.journalTitle(result.journal),
    publisher: core.journalPublisher(result.journal),
    score: Number(result.finalScore || 0),
    matched_terms: result.matchedTerms || [],
  };
}

export async function fetchJournalCorpusArticles(journalRecord) {
  const queries = core.buildJournalCorpusQueries(journalRecord);
  const byId = new Map();

  for (const query of queries) {
    const payload = await fetchPaginated("articles", query, {
      pageSize: JOURNAL_CORPUS_PAGE_SIZE,
      maxPages: JOURNAL_CORPUS_MAX_PAGES,
      maxRecords: JOURNAL_CORPUS_MAX_RECORDS,
    });
    for (const article of core.filterArticlesForJournal(payload.results || [], journalRecord)) {
      byId.set(`${article.id}`, article);
    }
  }

  return [...byId.values()].sort((left, right) => core.articleSortTimestamp(right) - core.articleSortTimestamp(left));
}

function resolveJournalFromResults(group, results) {
  return results.find((record) => core.sameJournalSignature(core.journalSignature(record), group.signature)) || null;
}

async function resolveArticleDerivedJournal(group) {
  const queries = core.unique([
    ...group.signature.issns.map((issn) => `"${`${issn || ""}`.replaceAll('"', '\\"').trim()}"`),
    group.title ? `"${`${group.title || ""}`.replaceAll('"', '\\"').trim()}"` : "",
  ]).filter(Boolean);

  for (const query of queries) {
    const payload = await fetchPaginated("journals", query, {
      pageSize: 10,
      maxPages: 1,
      maxRecords: 10,
    });
    const resolved = resolveJournalFromResults(group, payload.results || []);
    if (resolved) {
      return resolved;
    }
  }
  return null;
}

export async function fetchMatchingCandidates(profile) {
  const queryList = profile.queries.slice(0, MATCHING_QUERY_COUNT);
  const [journalPayloads, articlePayloads] = await Promise.all([
    mapWithConcurrency(queryList, MATCHING_FETCH_CONCURRENCY, (query) =>
      fetchPaginated("journals", query, {
        pageSize: MATCHING_JOURNAL_QUERY_PAGE_SIZE,
        maxPages: 1,
        maxRecords: MATCHING_JOURNAL_QUERY_PAGE_SIZE,
      })
    ),
    mapWithConcurrency(queryList, MATCHING_FETCH_CONCURRENCY, (query) =>
      fetchPaginated("articles", query, {
        pageSize: MATCHING_ARTICLE_QUERY_PAGE_SIZE,
        maxPages: 1,
        maxRecords: MATCHING_ARTICLE_QUERY_PAGE_SIZE,
      })
    ),
  ]);

  const journalCandidates = new Map();
  const journalResults = [...journalPayloads.flatMap((payload) => payload.results || [])].sort(
    (left, right) => core.journalSortTimestamp(right) - core.journalSortTimestamp(left)
  );
  const articleResults = [...articlePayloads.flatMap((payload) => payload.results || [])].sort(
    (left, right) => core.articleSortTimestamp(right) - core.articleSortTimestamp(left)
  );

  for (const journal of journalResults) {
    core.mergeMatchingCandidate(journalCandidates, journal, { source: "journal" });
  }

  const groups = core.matchingArticleJournalGroup(articleResults, MATCHING_RESOLUTION_LIMIT);
  const resolvedJournals = await mapWithConcurrency(groups, MATCHING_FETCH_CONCURRENCY, (group) => resolveArticleDerivedJournal(group));
  resolvedJournals.forEach((journal, index) => {
    if (!journal) {
      return;
    }
    core.mergeMatchingCandidate(journalCandidates, journal, {
      source: "article",
      seedArticles: groups[index].articles,
    });
  });

  for (const candidate of journalCandidates.values()) {
    candidate.articleCount = candidate.seedArticles.size;
  }

  return {
    journals: [...journalCandidates.values()],
  };
}

export async function runLiveMatching(abstract) {
  const language = core.detectAbstractLanguage(abstract);
  const profile = core.buildAbstractProfile(abstract, { queryCount: MATCHING_QUERY_COUNT });
  const { journals } = await fetchMatchingCandidates(profile);
  const ranked = core.rankMatchingCandidates(profile, journals, {
    rankingMode: "lexical",
    resultLimit: MATCHING_RESULT_LIMIT,
  });

  if (MATCHING_ENRICH_LIMIT <= 0) {
    return {
      language,
      profile,
      results: core.rankMatchingCandidates(profile, ranked, {
        rankingMode: "lexical+articles",
        resultLimit: MATCHING_RESULT_LIMIT,
      }),
      semanticAvailable: false,
    };
  }

  const enrichedCandidates = await mapWithConcurrency(
    ranked.slice(0, MATCHING_ENRICH_LIMIT),
    MATCHING_FETCH_CONCURRENCY,
    async (result) => {
      const articles = await fetchJournalCorpusArticles(result.journal);
      const seedMap = new Map(result.seedArticles.map((article) => [`${article.id}`, article]));
      articles.forEach((article) => seedMap.set(`${article.id}`, article));
      return {
        ...result,
        seedArticles: [...seedMap.values()],
        articleCount: seedMap.size,
        enriched: true,
        semanticScore: null,
      };
    }
  );

  const enriched = core.rankMatchingCandidates(
    profile,
    [...enrichedCandidates, ...ranked.slice(MATCHING_ENRICH_LIMIT)],
    {
      rankingMode: "lexical+articles",
      resultLimit: MATCHING_RESULT_LIMIT,
    }
  );

  return {
    language,
    profile,
    results: enriched,
    semanticAvailable: false,
  };
}

export function evaluateRanking(caseItem, results, matcher) {
  let rank = null;
  for (let index = 0; index < results.length; index += 1) {
    if (matcher(results[index], caseItem.expected || caseItem.expected_journal)) {
      rank = index + 1;
      break;
    }
  }
  return {
    rank,
    hit_at_1: rank === 1,
    hit_at_3: rank !== null && rank <= 3,
    hit_at_5: rank !== null && rank <= 5,
    reciprocal_rank: rank ? 1 / rank : 0,
  };
}

export function metricSummary(caseResults) {
  const total = caseResults.length || 1;
  return {
    total_cases: caseResults.length,
    hit_at_1: round(caseResults.filter((item) => item.hit_at_1).length / total),
    hit_at_3: round(caseResults.filter((item) => item.hit_at_3).length / total),
    hit_at_5: round(caseResults.filter((item) => item.hit_at_5).length / total),
    mrr: round(caseResults.reduce((sum, item) => sum + item.reciprocal_rank, 0) / total),
  };
}

export function searchCaseMatcher(result, expected, matchMode) {
  const title = core.normalizeText(searchResultTitle(result));
  const expectedTitle = core.normalizeText(expected.title || "");
  const publisher = core.normalizeText(searchResultPublisher(result));
  const expectedPublisher = core.normalizeText(expected.publisher || "");

  if (matchMode === "contains") {
    const titleMatches = Boolean(title) && Boolean(expectedTitle) && (title.includes(expectedTitle) || expectedTitle.includes(title));
    const publisherMatches = !expectedPublisher || publisher === expectedPublisher;
    return titleMatches && publisherMatches;
  }

  if (title !== expectedTitle) {
    return false;
  }
  if (!expectedPublisher) {
    return true;
  }
  return publisher === expectedPublisher || title === expectedPublisher;
}

export function matchingCaseMatcher(result, expected) {
  return matchingResultMatches(result, expected);
}

export function topResultPreview(results, limit = 5) {
  return results.slice(0, limit).map((result) => ({
    title: searchResultTitle(result) || matchingResultSummary(result).title,
    publisher: searchResultPublisher(result) || matchingResultSummary(result).publisher,
    score: Number(result.__searchScore || result.finalScore || 0),
  }));
}

export async function writeQualityOutputs(baseName, metrics, markdown) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(path.join(OUTPUT_DIR, `${baseName}-metrics.json`), `${JSON.stringify(metrics, null, 2)}\n`, "utf8");
  await writeFile(path.join(OUTPUT_DIR, `${baseName}-report.md`), `${markdown.trim()}\n`, "utf8");
}

export function markdownList(items) {
  if (!items.length) {
    return "- None";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

export function matchingTopPreview(results, limit = 5) {
  return results.slice(0, limit).map((result, index) => {
    const summary = matchingResultSummary(result);
    return `${index + 1}. ${summary.title} | ${summary.publisher} | score=${summary.score.toFixed(2)} | themes=${summary.matched_terms.join(", ") || "-"}`;
  });
}

function round(value) {
  return Number(value.toFixed(4));
}

function searchResultTitle(result) {
  if (result?.entity_type === "publisher" || result?.entity_type === "country") {
    return `${result.title || ""}`.trim();
  }
  if (result?.bibjson?.journal) {
    return core.articleTitle(result);
  }
  if (result?.bibjson) {
    return core.journalTitle(result);
  }
  return `${result?.title || ""}`.trim();
}

function searchResultPublisher(result) {
  if (result?.entity_type === "publisher") {
    return `${result.title || ""}`.trim();
  }
  if (result?.entity_type === "country") {
    return "";
  }
  if (result?.bibjson?.journal) {
    return core.articleJournalPublisher(result);
  }
  if (result?.bibjson) {
    return core.journalPublisher(result);
  }
  return `${result?.publisher_name || result?.publisher || ""}`.trim();
}
