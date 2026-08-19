import { runReportFacingNormalityDecisionCaseSuite } from "../src/lib/scientific/normality/__tests__/report-facing-decision.cases";

const results = runReportFacingNormalityDecisionCaseSuite();
const failed = results.filter((item) => !item.pass);

const summary = {
  phase: "cc01-normality-decision-unit",
  pass: failed.length === 0 && results.length > 0,
  caseCount: results.length,
  failed: failed.map((item) => ({ id: item.id, detail: item.detail })),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
