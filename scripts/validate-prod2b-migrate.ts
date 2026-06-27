import { runAdaptersB14CaseSuite } from "../src/lib/project/domain/__tests__/adapters-b1-4.cases";

const adapterResults = runAdaptersB14CaseSuite();

const summary = {
  phase: "prod-2b-migrate",
  pass: adapterResults.every((item) => item.pass),
  caseCount: adapterResults.length,
  cases: adapterResults,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
