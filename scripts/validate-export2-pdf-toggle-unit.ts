import { runPdfSectionFilterCases } from "../src/lib/scientific/report/__tests__/pdf-section-filter.cases";
import {
  createAssertCase,
  type CaseResult,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);

runPdfSectionFilterCases(assertCase);

const summary = {
  phase: "export2-pdf-toggle-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
