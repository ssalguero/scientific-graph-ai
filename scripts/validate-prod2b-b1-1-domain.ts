import { runDomainB11CaseSuite } from "../src/lib/project/domain/__tests__/domain-b1-1.cases";

const results = runDomainB11CaseSuite();

const summary = {
  phase: "prod-2b-b1-1-domain",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
