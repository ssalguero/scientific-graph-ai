import { runVisualGraphHydrateCaseSuite } from "../src/lib/project/__tests__/visual-graph-hydrate.cases";

const results = runVisualGraphHydrateCaseSuite();

const summary = {
  phase: "prod-2c-c6-visual-graph-hydrate",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
