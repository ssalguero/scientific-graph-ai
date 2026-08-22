import type { AssertCase } from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  APPROXIMATE_P_VALUE_DISCLOSURE,
  formatApproximatePValue,
  formatPValueNumber,
} from "../p-value-disclosure";

export const runPValueDisclosureCases = (assertCase: AssertCase) => {
  assertCase(
    "pvalue.numeric.regression.standard",
    formatPValueNumber(0.012345) === "0.0123"
  );
  assertCase(
    "pvalue.numeric.regression.floor",
    formatPValueNumber(0.00001) === "< 0.0001"
  );
  assertCase(
    "pvalue.disclosure.standard",
    formatApproximatePValue(0.012345) === "0.0123 (aprox.)"
  );
  assertCase(
    "pvalue.disclosure.floor",
    formatApproximatePValue(0.00001) === "< 0.0001 (aprox.)"
  );
  assertCase(
    "pvalue.disclosure.explainsApproximation",
    APPROXIMATE_P_VALUE_DISCLOSURE.toLocaleLowerCase().includes("aproximado")
  );
};
