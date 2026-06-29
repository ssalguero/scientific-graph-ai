import { runApplyHydrateProjectV2PatchCaseSuite } from "../src/lib/project/__tests__/apply-hydrate-project-v2-patch.cases";

const results = runApplyHydrateProjectV2PatchCaseSuite();

const summary = {
  phase: "prod-2b-b2-hydrate",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
