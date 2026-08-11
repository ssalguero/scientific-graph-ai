import { runPublicationPackLiteCases } from "../src/lib/scientific/report/__tests__/publication-pack-lite.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);

runPublicationPackLiteCases(assertCase);

const summary = {
  phase: "spe-12-pack-lite-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
