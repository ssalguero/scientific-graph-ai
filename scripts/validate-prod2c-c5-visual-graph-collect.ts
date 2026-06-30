import { runVisualGraphCollectCaseSuite } from "../src/lib/project/__tests__/visual-graph-collect.cases";

const results = runVisualGraphCollectCaseSuite();

const summary = {
  phase: "prod-2c-c5-visual-graph-collect",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
