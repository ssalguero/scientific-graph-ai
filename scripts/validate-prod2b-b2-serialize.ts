import { runSerializeProjectV2CaseSuite } from "../src/lib/project/__tests__/serialize-project-v2.cases";

const results = runSerializeProjectV2CaseSuite();

const summary = {
  phase: "prod-2b-b2-serialize",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
