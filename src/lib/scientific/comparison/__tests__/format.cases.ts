import { formatComparisonNumericDelta } from "../format";
import type { AssertCase } from "./run-assertions";

export const runFormatCases = (assertCase: AssertCase) => {
  assertCase("format.delta.null", formatComparisonNumericDelta(null) === "—");
  assertCase(
    "format.delta.nan",
    formatComparisonNumericDelta(Number.NaN) === "—"
  );
  assertCase(
    "format.delta.positive",
    formatComparisonNumericDelta(3.2) === "+3.2"
  );
  assertCase(
    "format.delta.negative",
    formatComparisonNumericDelta(-9.5) === "-9.5"
  );
  assertCase(
    "format.delta.zero",
    formatComparisonNumericDelta(0) === "0.0"
  );
};
