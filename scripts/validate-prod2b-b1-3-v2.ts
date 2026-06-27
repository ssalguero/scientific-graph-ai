import { runValidateB13CaseSuite } from "../src/lib/project/domain/__tests__/validate-b1-3.cases";

const results = runValidateB13CaseSuite();

const summary = {
  phase: "prod-2b-b1-3-v2",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
