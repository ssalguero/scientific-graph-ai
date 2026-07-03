import { runWorkflowVisibilitySnapshotCaseSuite } from "../src/lib/scientific/workflow/__tests__/workflow-visibility-snapshot.cases";

const MIN_CASE_COUNT = 9;

const results = runWorkflowVisibilitySnapshotCaseSuite();

const summary = {
  phase: "workflow-unit",
  pass: results.every((item) => item.pass) && results.length >= MIN_CASE_COUNT,
  caseCount: results.length,
  minCaseCount: MIN_CASE_COUNT,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
