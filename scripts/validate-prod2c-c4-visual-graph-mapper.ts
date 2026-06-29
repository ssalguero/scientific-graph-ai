import { runVisualGraphMapperCaseSuite } from "../src/lib/project/__tests__/visual-graph-mapper.cases";

const results = runVisualGraphMapperCaseSuite();

const summary = {
  phase: "prod-2c-c4-visual-graph-mapper",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
