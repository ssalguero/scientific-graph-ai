import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runPr4FigureLifecycleCases } from "../src/lib/scientific/figure/__tests__/figure-lifecycle.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);
runPr4FigureLifecycleCases(assertCase);

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), "utf8");
const contract = read("src/lib/scientific/contracts/vgb-figure-lifecycle.ts");
const page = read("src/app/page.tsx");
const persistence = read("src/lib/scientific/figure/persistence.ts");
const lifecycle = read("src/lib/scientific/figure/lifecycle.ts");
const review = read("src/lib/scientific/figure/review.ts");
const report = read("src/lib/scientific/figure/report.ts");
const displaySeries = read("src/lib/scientific/figure/display-series.ts");
const pdfFilter = read("src/lib/scientific/report/pdf-section-filter.ts");

assertCase(
  "pr4.integration.states-explicit",
  contract.includes('"WORKING"') &&
    contract.includes('"RESEARCHER_REVIEW"') &&
    contract.includes('"PUBLICATION"') &&
    !contract.includes('"RESEARCHER_APPROVED"')
);
assertCase(
  "pr4.integration.publication-not-working-flag",
  lifecycle.includes("createPublicationVgbFigure") &&
    contract.includes("scientific-vgb-publication-figure/v1") &&
    contract.includes("scientific-vgb-working-figure/v1") &&
    lifecycle.includes("Publication requires an explicit researcher-review phase")
);
assertCase(
  "pr4.integration.ctr08-reuse",
  review.includes("createLiveGeneratedTextReview") &&
    review.includes("vgb-figure-lifecycle") &&
    page.includes("createVgbFigureReviewRecord") &&
    page.includes("setReviewAuthorityRecordsOnExtensions")
);
assertCase(
  "pr4.integration.project-extension",
  persistence.includes('"scientific-graph-ai.vgb-figure-lifecycle/v1"') &&
    page.includes("setVgbFigureLifecycleStoreOnExtensions") &&
    page.includes("projectExtensions")
);
assertCase(
  "pr4.integration.report-pdf-publication-only",
  page.includes("replaceVgbPublicationFiguresWithPdfProjection") &&
    page.includes("buildVgbPublicationFigureReportSection") &&
    report.includes("Solo las Figuras de publicación") &&
    pdfFilter.includes("VGB_PUBLICATION_FIGURE_REPORT_TITLE")
);
assertCase(
  "pr4.integration.displaySeries-disposition",
  displaySeries.includes("publicationFigureUsesDisplaySeries") &&
    displaySeries.includes("isVgbDisplaySeriesAnalysisFeed") &&
    contract.includes("analysisFeed: false") &&
    contract.includes("publicationAuthority: false")
);
assertCase(
  "pr4.integration.token-parity",
  page.includes("resolveGraphRenderStyle") &&
    page.includes("publicationPresetId")
);
assertCase(
  "pr4.boundary.no-new-store",
  !persistence.includes("indexedDB") &&
    !persistence.includes("localStorage") &&
    !page.includes("vgb-figure-lifecycle-session")
);
assertCase(
  "pr4.boundary.no-ai-runtime",
  !contract.includes("@/ai") &&
    !lifecycle.includes("@/ai") &&
    !review.includes("@/ai")
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr4-figure-lifecycle-unit",
  pass: failed.length === 0 && results.length >= 24,
  caseCount: results.length,
  minCaseCount: 24,
  failed: failed.map((result) => result.id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
