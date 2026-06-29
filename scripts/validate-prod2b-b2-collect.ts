import { runCollectProjectSnapshotV2CaseSuite } from "../src/lib/project/__tests__/collect-project-snapshot-v2.cases";

const results = runCollectProjectSnapshotV2CaseSuite();

const summary = {
  phase: "prod-2b-b2-collect",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
