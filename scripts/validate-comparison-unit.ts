import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runAnalysisCases } from "../src/lib/scientific/comparison/__tests__/analysis.cases";
import { runFormatCases } from "../src/lib/scientific/comparison/__tests__/format.cases";
import { runInterpretationCases } from "../src/lib/scientific/comparison/__tests__/interpretation.cases";
import { runProfileCases } from "../src/lib/scientific/comparison/__tests__/profile.cases";
import { runReportCases } from "../src/lib/scientific/comparison/__tests__/report.cases";
import {
  type CaseResult,
  createAssertCase,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);

runFormatCases(assertCase);
runProfileCases(assertCase);
runAnalysisCases(assertCase);
runInterpretationCases(assertCase);
runReportCases(assertCase);

const pageSource = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
const comparisonCtaIndex = pageSource.indexOf("Ver comparación en Resultados");
const comparisonCtaWindow = pageSource.slice(
  Math.max(0, comparisonCtaIndex - 700),
  comparisonCtaIndex
);
const chartCtaIndex = pageSource.indexOf("Ver gráfico principal en Resultados");
const chartCtaWindow = pageSource.slice(
  Math.max(0, chartCtaIndex - 500),
  chartCtaIndex
);

assertCase("cc03.cta.present", comparisonCtaIndex >= 0);
assertCase(
  "cc03.cta.gated-on-calculated-analysis",
  comparisonCtaWindow.includes("hasEnoughDataForMultiDatasetComparison")
);
assertCase(
  "cc03.cta.enables-existing-dashboard-flag",
  comparisonCtaWindow.includes("setShowMultiDatasetComparison(true)")
);
assertCase(
  "cc03.cta.activates-results-workspace",
  comparisonCtaWindow.includes('selectWorkspaceSection("results")')
);
assertCase(
  "cc03.cta.requests-focus-on-existing-surface",
  comparisonCtaWindow.includes("pendingComparisonResultsFocusRef.current = true")
);
assertCase(
  "cc03.dashboard.focus-target-id",
  pageSource.includes('id="scientific-multi-dataset-comparison-dashboard"') &&
    pageSource.includes("node.scrollIntoView")
);
assertCase(
  "cc03.chart-cta.does-not-enable-comparison",
  chartCtaIndex >= 0 &&
    !chartCtaWindow.includes("setShowMultiDatasetComparison(true)")
);
assertCase(
  "cc03.dashboard.still-gated-on-existing-flag",
  pageSource.includes("{showMultiDatasetComparison && (") &&
    pageSource.includes("<ScientificMultiDatasetComparisonDashboard")
);

const summary = {
  phase: "comparison-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
