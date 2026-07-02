import { runVisibilityPdfPolicyCaseSuite } from "../src/lib/scientific/visibility/__tests__/visibility-pdf-policy.cases";
import { runVisibilityRegistryCaseSuite } from "../src/lib/scientific/visibility/__tests__/visibility-registry.cases";
import { runVisibilityStateCaseSuite } from "../src/lib/scientific/visibility/__tests__/visibility-state.cases";

const MIN_CASE_COUNT = 20;

const results = [
  ...runVisibilityRegistryCaseSuite(),
  ...runVisibilityStateCaseSuite(),
  ...runVisibilityPdfPolicyCaseSuite(),
];

const summary = {
  phase: "visibility-unit",
  pass:
    results.every((item) => item.pass) && results.length >= MIN_CASE_COUNT,
  caseCount: results.length,
  minCaseCount: MIN_CASE_COUNT,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
