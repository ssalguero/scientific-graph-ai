import { runHydrateV2PipelineCaseSuite } from "../src/lib/project/__tests__/hydrate-v2-pipeline.cases";

const results = runHydrateV2PipelineCaseSuite();

const summary = {
  phase: "prod-2b-b2-hydrate-wire",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
