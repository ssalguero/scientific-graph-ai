import { runWorksheetValidateCaseSuite } from "../src/lib/project/domain/__tests__/worksheet-validate.cases";

const results = runWorksheetValidateCaseSuite();

const summary = {
  phase: "prod-2c-c1-worksheet-domain",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
