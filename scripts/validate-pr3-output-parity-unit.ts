import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runPr3OutputParityCases } from "../src/lib/scientific/report/__tests__/output-parity.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);
runPr3OutputParityCases(assertCase);

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");
const page = read("src/app/page.tsx");
const comparisonProjection = read(
  "src/lib/scientific/comparison/projection.ts"
);
const comparisonReport = read(
  "src/lib/scientific/comparison/report.ts"
);
const pdfFilter = read(
  "src/lib/scientific/report/pdf-section-filter.ts"
);

assertCase(
  "pr3.parity.integration.results-report-pdf-shared-projection",
  comparisonProjection.includes("projectCitableScientificSnapshot") &&
    comparisonReport.includes('"report"') &&
    comparisonReport.includes('"pdf"') &&
    comparisonReport.includes(
      "replaceMultiDatasetComparisonWithPdfProjection"
    ) &&
    page.includes("replaceMultiDatasetComparisonWithPdfProjection")
);
assertCase(
  "pr3.parity.integration.comparison-report-wired",
  page.includes("buildMultiDatasetComparisonReportSection") &&
    page.includes("comparisonProjectionContext")
);
assertCase(
  "pr3.parity.integration.numeric-from-projection",
  page.includes('"numeric-export-foundation"') &&
    page.includes("projectDatasetAnalysisProfile")
);
assertCase(
  "pr3.parity.integration.comparison-visibility",
  pdfFilter.includes(
    '"Comparación Multi-Dataset (SCI-58)"'
  ) &&
    pdfFilter.includes('"sci-58-comparison-dashboard"')
);
assertCase(
  "pr3.parity.boundary.no-ctr09-vgb-lifecycle",
  !page.includes("Publication Figure identity") &&
    !comparisonProjection.includes("working-figure") &&
    !comparisonReport.includes("publication-figure")
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr3-output-parity-unit",
  pass: failed.length === 0 && results.length >= 15,
  caseCount: results.length,
  minCaseCount: 15,
  failed: failed.map((result) => result.id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
