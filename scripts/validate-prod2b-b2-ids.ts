import { runDatasetIdPolicyCaseSuite } from "../src/lib/project/__tests__/dataset-id-policy.cases";

const results = runDatasetIdPolicyCaseSuite();

const summary = {
  phase: "prod-2b-b2-ids",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
