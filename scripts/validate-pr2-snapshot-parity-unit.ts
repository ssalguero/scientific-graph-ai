import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runPr2LifecycleCases } from "../src/lib/scientific/contracts/__tests__/pr2-lifecycle.cases";
import {
  createContractFoundationAssertCase,
  type ContractFoundationCaseResult,
} from "../src/lib/scientific/contracts/__tests__/run-assertions";
import { runPr2ComparisonSnapshotFreshnessCases } from "../src/lib/scientific/comparison/__tests__/pr2-snapshot-freshness.cases";
import { runVisualGraphSemanticCases } from "../src/lib/scientific/projection/__tests__/visual-graph-semantic.cases";

const MIN_CASE_COUNT = 30;
const results: ContractFoundationCaseResult[] = [];
const assertCase = createContractFoundationAssertCase(results);

runPr2LifecycleCases(assertCase);
runPr2ComparisonSnapshotFreshnessCases(assertCase);
runVisualGraphSemanticCases(assertCase);

const root = process.cwd();
const read = (path: string): string =>
  readFileSync(join(root, path), "utf8");
const pageSource = read("src/app/page.tsx");
const reportSource = read("src/lib/scientific/comparison/report.ts");
const hydrateSource = read("src/lib/project/apply-hydrate-project-v2-patch.ts");
const snapshotSource = read(
  "src/lib/scientific/contracts/citable-snapshot.ts"
);
const projectionSource = read(
  "src/lib/scientific/contracts/semantic-parity.ts"
);

assertCase(
  "pr2.integration.results-authoritative-snapshot",
  read("src/lib/scientific/comparison/analysis.ts").includes(
    "getAuthoritativeDatasetAnalysisProfile"
  )
);
assertCase(
  "pr2.integration.report-pdf-shared-projection",
  reportSource.includes("projectDatasetAnalysisProfile") &&
    reportSource.includes('"report"') &&
    reportSource.includes('"pdf"')
);
assertCase(
  "pr2.integration.project-revives-immutability",
  hydrateSource.includes("reviveDatasetAnalysisProfile")
);
assertCase(
  "pr2.integration.page-domain-freshness",
  pageSource.includes("buildCurrentComparisonProfileProvenance") &&
    pageSource.includes("currentProvenance={currentProvenance}")
);
assertCase(
  "pr2.boundary.no-ai-runtime",
  !snapshotSource.includes("@/ai") &&
    !projectionSource.includes("@/ai") &&
    !snapshotSource.includes("assistant")
);
assertCase(
  "pr2.boundary.no-numeric-export-feature",
  !projectionSource.includes("download") &&
    !projectionSource.includes("serializeNumeric")
);

const failed = results.filter((result) => !result.pass);
const summary = {
  phase: "pr2-snapshot-parity-unit",
  pass: failed.length === 0 && results.length >= MIN_CASE_COUNT,
  caseCount: results.length,
  minCaseCount: MIN_CASE_COUNT,
  failed: failed.map(({ id }) => id),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — pr2-snapshot-parity-unit"
    : `\nFAIL — pr2-snapshot-parity-unit (${failed
        .map(({ id }) => id)
        .join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
