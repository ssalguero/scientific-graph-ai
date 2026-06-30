import { runVisualGraphUiCaseSuite } from "../src/lib/project/__tests__/visual-graph-ui.cases";

const results = runVisualGraphUiCaseSuite();

const summary = {
  phase: "prod-2c-c7-visual-graph-ui",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
