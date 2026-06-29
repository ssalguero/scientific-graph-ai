import { runB29InvariantCaseSuite } from "../src/lib/project/__tests__/b2-9-invariants.cases";

const results = runB29InvariantCaseSuite();

const summary = {
  phase: "prod-2b-b2-invariants",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
