import { runWorksheetPipelineCaseSuite } from "../src/lib/project/__tests__/worksheet-pipeline.cases";

const results = runWorksheetPipelineCaseSuite();

const summary = {
  phase: "prod-2c-c2-worksheet-pipeline",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
