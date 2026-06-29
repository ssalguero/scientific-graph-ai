import { runWorksheetPersistCaseSuite } from "../src/lib/project/__tests__/worksheet-persist.cases";

const results = runWorksheetPersistCaseSuite();

const summary = {
  phase: "prod-2c-c3-worksheet-ui",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
