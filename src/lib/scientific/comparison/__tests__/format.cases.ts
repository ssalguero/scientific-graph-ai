import {
  formatComparisonNumericDelta,
  formatDatasetAnalysisProfileMiniSummary,
  formatProfileMethodologicalScore,
  formatProfileMultivariateValue,
  formatProfileProspectiveSampleSize,
} from "../format";
import { buildEnrichedDataset5Profile } from "./fixtures/profiles";
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

  assertCase(
    "format.methodological.missing",
    formatProfileMethodologicalScore(undefined) === "—"
  );
  assertCase(
    "format.methodological.score",
    formatProfileMethodologicalScore(77.25) === "77.3"
  );

  const enriched = buildEnrichedDataset5Profile();
  assertCase(
    "format.multivariate.headline",
    formatProfileMultivariateValue(enriched.multivariate) ===
      "Estructura multivariante estable"
  );
  assertCase(
    "format.prospectiveSampleSize",
    formatProfileProspectiveSampleSize(enriched) === "24"
  );
  assertCase(
    "format.miniSummary.methodological",
    formatDatasetAnalysisProfileMiniSummary(enriched).includes("M 6/6")
  );
};
