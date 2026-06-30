import { runVisualGraphFixturesCaseSuite } from "../src/lib/project/__tests__/visual-graph-fixtures.cases";

const results = runVisualGraphFixturesCaseSuite();

const summary = {
  phase: "prod-2c-c8-visual-graph-fixtures",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
