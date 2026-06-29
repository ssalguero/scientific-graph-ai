import { runSanitizeProjectV2CaseSuite } from "../src/lib/project/__tests__/sanitize-project-v2.cases";

const results = runSanitizeProjectV2CaseSuite();

const summary = {
  phase: "prod-2b-b2-sanitize",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
