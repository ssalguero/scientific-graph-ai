import {
  buildComparisonKpiRow,
  buildMultiDatasetComparisonAnalysis,
  canBuildMultiDatasetComparisonAnalysis,
  computeComparisonDeltaDirection,
} from "../analysis";
import {
  buildCanonicalDataset5Profile,
  buildCanonicalDataset6Profile,
  buildEnrichedDataset5Profile,
  buildEnrichedDataset6Profile,
  buildIncompleteProfile,
} from "./fixtures/profiles";
import type { AssertCase } from "./run-assertions";

export const runAnalysisCases = (assertCase: AssertCase) => {
  const slotA = buildCanonicalDataset5Profile();
  const slotB = buildCanonicalDataset6Profile();

  const analysis = buildMultiDatasetComparisonAnalysis({ slotA, slotB });
  const readinessRow = analysis.kpiRows.find((row) => row.key === "readiness");

  assertCase(
    "golden.deltaReadiness",
    readinessRow?.delta === -9.5,
    `expected -9.5 got ${readinessRow?.delta}`
  );
  assertCase("golden.kpiRowCount", analysis.kpiRows.length === 5);
  assertCase(
    "golden.readinessDirection",
    readinessRow?.deltaDirection === "regressed"
  );
  assertCase(
    "golden.slotANumeric",
    readinessRow?.slotANumeric === 77.0 && readinessRow?.slotBNumeric === 67.5
  );
  assertCase(
    "golden.comparabilityWarnings",
    Array.isArray(analysis.comparabilityWarnings)
  );
  assertCase(
    "golden.crossDatasetDiagnosis",
    analysis.crossDatasetDiagnosis.length > 0
  );
  assertCase(
    "golden.comparisonRecommendations",
    analysis.comparisonRecommendations.length > 0
  );
  assertCase("golden.evaluatedMetrics", analysis.evaluatedMetrics >= 3);

  assertCase(
    "deltaDirection.null",
    computeComparisonDeltaDirection(null, true) === "n/a"
  );
  assertCase(
    "deltaDirection.nan",
    computeComparisonDeltaDirection(Number.NaN, true) === "n/a"
  );
  assertCase(
    "deltaDirection.stable",
    computeComparisonDeltaDirection(0.3, true) === "stable"
  );
  assertCase(
    "deltaDirection.stableNegative",
    computeComparisonDeltaDirection(-0.49, true) === "stable"
  );
  assertCase(
    "deltaDirection.improvedHigher",
    computeComparisonDeltaDirection(2.0, true) === "improved"
  );
  assertCase(
    "deltaDirection.regressedHigher",
    computeComparisonDeltaDirection(-2.0, true) === "regressed"
  );
  assertCase(
    "deltaDirection.improvedLower",
    computeComparisonDeltaDirection(-2.0, false) === "improved"
  );
  assertCase(
    "deltaDirection.regressedLower",
    computeComparisonDeltaDirection(2.0, false) === "regressed"
  );
  assertCase(
    "deltaDirection.boundaryNotStable",
    computeComparisonDeltaDirection(0.5, true) === "improved"
  );

  const kpiRow = buildComparisonKpiRow({
    key: "test",
    title: "Test",
    slotAValue: "10",
    slotBValue: "20",
    slotANumeric: 10,
    slotBNumeric: 20,
    higherIsBetter: true,
  });
  assertCase("kpiRow.delta", kpiRow.delta === 10);
  assertCase("kpiRow.direction", kpiRow.deltaDirection === "improved");

  const kpiRowMissing = buildComparisonKpiRow({
    key: "missing",
    title: "Missing",
    slotAValue: "—",
    slotBValue: "—",
  });
  assertCase("kpiRow.noNumeric", kpiRowMissing.delta === null);
  assertCase("kpiRow.noNumericDirection", kpiRowMissing.deltaDirection === "n/a");

  assertCase(
    "canBuild.bothComplete",
    canBuildMultiDatasetComparisonAnalysis(slotA, slotB) === true
  );
  assertCase(
    "canBuild.nullA",
    canBuildMultiDatasetComparisonAnalysis(null, slotB) === false
  );
  assertCase(
    "canBuild.nullB",
    canBuildMultiDatasetComparisonAnalysis(slotA, null) === false
  );
  assertCase(
    "canBuild.incompleteA",
    canBuildMultiDatasetComparisonAnalysis(
      buildIncompleteProfile("A"),
      slotB
    ) === false
  );
  assertCase(
    "canBuild.incompleteB",
    canBuildMultiDatasetComparisonAnalysis(
      slotA,
      buildIncompleteProfile("B")
    ) === false
  );

  const enrichedA = buildEnrichedDataset5Profile();
  const enrichedB = buildEnrichedDataset6Profile();
  const enrichedAnalysis = buildMultiDatasetComparisonAnalysis({
    slotA: enrichedA,
    slotB: enrichedB,
  });

  assertCase(
    "enriched.golden.deltaReadiness",
    enrichedAnalysis.kpiRows.find((row) => row.key === "readiness")?.delta ===
      -9.5
  );
  assertCase(
    "enriched.kpiRowCount",
    enrichedAnalysis.kpiRows.length === 11
  );
  assertCase(
    "enriched.methodologicalBreakdown",
    enrichedAnalysis.methodologicalBreakdownAvailable === true
  );
  assertCase(
    "enriched.multivariateSection",
    enrichedAnalysis.multivariateSectionAvailable === true
  );
  assertCase(
    "enriched.publicationHighlights",
    enrichedAnalysis.publicationHighlightsAvailable === true
  );

  const normalityRow = enrichedAnalysis.kpiRows.find(
    (row) => row.key === "normalityNonNormal"
  );
  assertCase(
    "enriched.normalityNonNormalDelta",
    normalityRow?.delta === 1
  );

  const assumptionRow = enrichedAnalysis.kpiRows.find(
    (row) => row.key === "assumption"
  );
  assertCase(
    "enriched.assumptionDelta",
    assumptionRow?.delta === -17
  );

  const legacyAnalysis = buildMultiDatasetComparisonAnalysis({
    slotA: buildCanonicalDataset5Profile(),
    slotB: buildCanonicalDataset6Profile(),
  });
  assertCase(
    "legacy.flagsAbsent",
    legacyAnalysis.methodologicalBreakdownAvailable === false
  );
};
