import { runMigrateB12CaseSuite } from "../src/lib/project/domain/__tests__/migrate-b1-2.cases";

const results = runMigrateB12CaseSuite();

const summary = {
  phase: "prod-2b-b1-2-migrate",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
