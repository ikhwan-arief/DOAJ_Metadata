import {
  evaluateRanking,
  markdownList,
  metricSummary,
  readJson,
  runLiveSearch,
  searchCaseMatcher,
  topResultPreview,
  writeQualityOutputs,
} from "./quality_helpers.mjs";

const CASES_PATH = "benchmarks/search_live_cases.json";

async function main() {
  const cases = await readJson(CASES_PATH);
  const caseResults = [];

  for (const caseItem of cases) {
    const groups = await runLiveSearch(caseItem.query);
    const results = groups[`${caseItem.entity_type}s`] || [];
    const evaluation = evaluateRanking(caseItem, results, (result, expected) =>
      searchCaseMatcher(result, expected, caseItem.match_mode)
    );
    caseResults.push({
      ...caseItem,
      ...evaluation,
      top_results: topResultPreview(results),
    });
  }

  const exactJournalCases = caseResults.filter((item) => item.entity_type === "journal" && item.match_mode === "exact");
  const exactPublisherCases = caseResults.filter((item) => item.entity_type === "publisher" && item.match_mode === "exact");
  const topicalCases = caseResults.filter((item) => !(item.entity_type === "journal" && item.match_mode === "exact") && !(item.entity_type === "publisher" && item.match_mode === "exact"));

  const metrics = {
    generated_at: new Date().toISOString(),
    source: "live_doaj",
    thresholds: {
      exact_journal_top1: 1.0,
      exact_publisher_top1: 1.0,
      topical_hit_at_3: 0.8,
      topical_hit_at_5: 0.9,
    },
    overall: metricSummary(caseResults),
    exact_journal: metricSummary(exactJournalCases),
    exact_publisher: metricSummary(exactPublisherCases),
    topical: metricSummary(topicalCases),
    failures: caseResults.filter((item) => !item.hit_at_5).map((item) => ({
      id: item.id,
      query: item.query,
      entity_type: item.entity_type,
      rank: item.rank,
      top_results: item.top_results,
    })),
  };

  const markdown = [
    "# Live Search Quality Report",
    "",
    `Generated at: ${metrics.generated_at}`,
    "",
    "## Metrics",
    "",
    `- Overall: Hit@1=${metrics.overall.hit_at_1}, Hit@3=${metrics.overall.hit_at_3}, Hit@5=${metrics.overall.hit_at_5}, MRR=${metrics.overall.mrr}`,
    `- Exact journal title: Hit@1=${metrics.exact_journal.hit_at_1}`,
    `- Exact publisher: Hit@1=${metrics.exact_publisher.hit_at_1}`,
    `- Topic/article title: Hit@3=${metrics.topical.hit_at_3}, Hit@5=${metrics.topical.hit_at_5}, MRR=${metrics.topical.mrr}`,
    "",
    "## Failing Cases",
    "",
    markdownList(
      metrics.failures.map((failure) =>
        `${failure.id} | query="${failure.query}" | rank=${failure.rank ?? "not found"} | top5=${failure.top_results.map((item) => item.title).join(" ; ")}`
      )
    ),
    "",
    "## Case Breakdown",
    "",
    ...caseResults.flatMap((item) => [
      `### ${item.id}`,
      `- Query: ${item.query}`,
      `- Entity type: ${item.entity_type}`,
      `- Rank: ${item.rank ?? "not found"}`,
      `- Hit@1/3/5: ${item.hit_at_1}/${item.hit_at_3}/${item.hit_at_5}`,
      `- Top candidates: ${item.top_results.map((candidate) => candidate.title).join(" ; ")}`,
      "",
    ]),
  ].join("\n");

  await writeQualityOutputs("search-live", metrics, markdown);

  const failed =
    metrics.exact_journal.hit_at_1 < metrics.thresholds.exact_journal_top1
    || metrics.exact_publisher.hit_at_1 < metrics.thresholds.exact_publisher_top1
    || metrics.topical.hit_at_3 < metrics.thresholds.topical_hit_at_3
    || metrics.topical.hit_at_5 < metrics.thresholds.topical_hit_at_5;

  if (failed) {
    process.exitCode = 1;
  }
}

await main();
