import { runMapSessionDatasetCaseSuite } from "../src/lib/project/__tests__/map-session-dataset.cases";

const results = runMapSessionDatasetCaseSuite();

const summary = {
  phase: "prod-2b-b2-map",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
