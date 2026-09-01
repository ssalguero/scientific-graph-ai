import { runR11ProductScreenPersistCaseSuite } from "../src/lib/project/__tests__/r11-product-screen-persist.cases";

const results = runR11ProductScreenPersistCaseSuite();

const summary = {
  phase: "r11-persistence-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  passed: results.filter((item) => item.pass).length,
  failed: results.filter((item) => !item.pass),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
