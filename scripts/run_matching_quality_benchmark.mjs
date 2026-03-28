import {
  evaluateRanking,
  markdownList,
  matchingCaseMatcher,
  matchingTopPreview,
  metricSummary,
  readJson,
  runLiveMatching,
  writeQualityOutputs,
} from "./quality_helpers.mjs";

const CASES_PATH = "benchmarks/matching_live_cases.json";

async function main() {
  const cases = await readJson(CASES_PATH);
  const caseResults = [];

  for (const caseItem of cases) {
    const run = await runLiveMatching(caseItem.abstract);
    const evaluation = evaluateRanking(caseItem, run.results, matchingCaseMatcher);
    caseResults.push({
      ...caseItem,
      detected_language: run.language.language,
      semantic_available: run.semanticAvailable,
      ...evaluation,
      top_results: matchingTopPreview(run.results),
    });
  }

  const englishCases = caseResults.filter((item) => item.language === "en");
  const indonesianCases = caseResults.filter((item) => item.language === "id");
  const metrics = {
    generated_at: new Date().toISOString(),
    source: "live_doaj",
    semantic_available: false,
    semantic_fallback_count: caseResults.length,
    thresholds: {
      hit_at_1: 0.5,
      hit_at_3: 0.65,
      hit_at_5: 0.8,
    },
    overall: metricSummary(caseResults),
    english: metricSummary(englishCases),
    indonesian: metricSummary(indonesianCases),
    failures: caseResults.filter((item) => !item.hit_at_5).map((item) => ({
      id: item.id,
      language: item.language,
      rank: item.rank,
      top_results: item.top_results,
    })),
  };

  const markdown = [
    "# Live Matching Quality Report",
    "",
    `Generated at: ${metrics.generated_at}`,
    "",
    "## Metrics",
    "",
    `- Overall: Hit@1=${metrics.overall.hit_at_1}, Hit@3=${metrics.overall.hit_at_3}, Hit@5=${metrics.overall.hit_at_5}, MRR=${metrics.overall.mrr}`,
    `- English: Hit@1=${metrics.english.hit_at_1}, Hit@3=${metrics.english.hit_at_3}, Hit@5=${metrics.english.hit_at_5}, MRR=${metrics.english.mrr}`,
    `- Indonesian: Hit@1=${metrics.indonesian.hit_at_1}, Hit@3=${metrics.indonesian.hit_at_3}, Hit@5=${metrics.indonesian.hit_at_5}, MRR=${metrics.indonesian.mrr}`,
    `- Semantic rerank available in this Node benchmark: ${metrics.semantic_available}`,
    `- Semantic fallback count: ${metrics.semantic_fallback_count}`,
    "",
    "## Failing Cases",
    "",
    markdownList(
      metrics.failures.map((failure) =>
        `${failure.id} | language=${failure.language} | rank=${failure.rank ?? "not found"} | top5=${failure.top_results.join(" || ")}`
      )
    ),
    "",
    "## Case Breakdown",
    "",
    ...caseResults.flatMap((item) => [
      `### ${item.id}`,
      `- Declared language: ${item.language}`,
      `- Detected language: ${item.detected_language}`,
      `- Rank: ${item.rank ?? "not found"}`,
      `- Hit@1/3/5: ${item.hit_at_1}/${item.hit_at_3}/${item.hit_at_5}`,
      `- Top candidates: ${item.top_results.join(" || ")}`,
      "",
    ]),
  ].join("\n");

  await writeQualityOutputs("matching-live", metrics, markdown);

  const failed =
    metrics.overall.hit_at_1 < metrics.thresholds.hit_at_1
    || metrics.overall.hit_at_3 < metrics.thresholds.hit_at_3
    || metrics.overall.hit_at_5 < metrics.thresholds.hit_at_5;

  if (failed) {
    process.exitCode = 1;
  }
}

await main();
