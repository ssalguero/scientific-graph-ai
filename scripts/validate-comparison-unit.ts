import { runAnalysisCases } from "../src/lib/scientific/comparison/__tests__/analysis.cases";
import { runFormatCases } from "../src/lib/scientific/comparison/__tests__/format.cases";
import { runInterpretationCases } from "../src/lib/scientific/comparison/__tests__/interpretation.cases";
import {
  type CaseResult,
  createAssertCase,
} from "../src/lib/scientific/comparison/__tests__/run-assertions";

const results: CaseResult[] = [];
const assertCase = createAssertCase(results);

runFormatCases(assertCase);
runAnalysisCases(assertCase);
runInterpretationCases(assertCase);

const summary = {
  phase: "comparison-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
