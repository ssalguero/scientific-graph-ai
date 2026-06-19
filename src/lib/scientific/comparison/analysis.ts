import { COMPARISON_DELTA_STABLE_THRESHOLD } from "./constants";
import {
  formatProfileEffectValue,
  formatProfileEvidenceValue,
  formatProfilePublicationStatusValue,
  formatProfileReadinessValue,
} from "./format";
import {
  buildComparabilityWarnings,
  buildCrossDatasetComparisonDiagnosis,
  buildCrossDatasetComparisonRecommendations,
} from "./interpretation";
import type {
  ComparisonDeltaDirection,
  ComparisonKpiRow,
  DatasetAnalysisProfile,
  MultiDatasetComparisonAnalysis,
} from "./types";

export const computeComparisonDeltaDirection = (
  delta: number | null,
  higherIsBetter: boolean
): ComparisonDeltaDirection => {
  if (delta === null || !Number.isFinite(delta)) {
    return "n/a";
  }
  if (Math.abs(delta) < COMPARISON_DELTA_STABLE_THRESHOLD) {
    return "stable";
  }
  if (higherIsBetter) {
    return delta > 0 ? "improved" : "regressed";
  }
  return delta < 0 ? "improved" : "regressed";
};

export const buildComparisonKpiRow = (input: {
  key: string;
  title: string;
  slotAValue: string;
  slotBValue: string;
  slotANumeric?: number;
  slotBNumeric?: number;
  higherIsBetter?: boolean;
}): ComparisonKpiRow => {
  const slotANumeric =
    input.slotANumeric !== undefined && Number.isFinite(input.slotANumeric)
      ? input.slotANumeric
      : null;
  const slotBNumeric =
    input.slotBNumeric !== undefined && Number.isFinite(input.slotBNumeric)
      ? input.slotBNumeric
      : null;
  const delta =
    slotANumeric !== null && slotBNumeric !== null
      ? slotBNumeric - slotANumeric
      : null;
  return {
    key: input.key,
    title: input.title,
    slotAValue: input.slotAValue,
    slotBValue: input.slotBValue,
    slotANumeric,
    slotBNumeric,
    delta,
    deltaDirection: computeComparisonDeltaDirection(
      delta,
      input.higherIsBetter ?? true
    ),
  };
};

export const canBuildMultiDatasetComparisonAnalysis = (
  slotA: DatasetAnalysisProfile | null,
  slotB: DatasetAnalysisProfile | null
): boolean =>
  slotA !== null &&
  slotB !== null &&
  slotA.isComplete &&
  slotB.isComplete;

export const buildMultiDatasetComparisonAnalysis = (input: {
  slotA: DatasetAnalysisProfile;
  slotB: DatasetAnalysisProfile;
}): MultiDatasetComparisonAnalysis => {
  const { slotA, slotB } = input;
  const kpiRows: ComparisonKpiRow[] = [
    buildComparisonKpiRow({
      key: "readiness",
      title: "Readiness (SCI-55)",
      slotAValue: formatProfileReadinessValue(slotA),
      slotBValue: formatProfileReadinessValue(slotB),
      slotANumeric: slotA.readinessScore,
      slotBNumeric: slotB.readinessScore,
      higherIsBetter: true,
    }),
    buildComparisonKpiRow({
      key: "overallHealth",
      title: "Overall Health (SCI-56)",
      slotAValue:
        slotA.overallHealthScore !== undefined
          ? slotA.overallHealthScore.toFixed(1)
          : "—",
      slotBValue:
        slotB.overallHealthScore !== undefined
          ? slotB.overallHealthScore.toFixed(1)
          : "—",
      slotANumeric: slotA.overallHealthScore,
      slotBNumeric: slotB.overallHealthScore,
      higherIsBetter: true,
    }),
    buildComparisonKpiRow({
      key: "evidence",
      title: "Evidence (SCI-53)",
      slotAValue: formatProfileEvidenceValue(slotA),
      slotBValue: formatProfileEvidenceValue(slotB),
      slotANumeric: slotA.evidenceScore,
      slotBNumeric: slotB.evidenceScore,
      higherIsBetter: true,
    }),
    buildComparisonKpiRow({
      key: "publicationStatus",
      title: "Publication Status",
      slotAValue: formatProfilePublicationStatusValue(slotA),
      slotBValue: formatProfilePublicationStatusValue(slotB),
      higherIsBetter: false,
    }),
    buildComparisonKpiRow({
      key: "effectDominant",
      title: "Effect dominante (SCI-57)",
      slotAValue: formatProfileEffectValue(slotA),
      slotBValue: formatProfileEffectValue(slotB),
      higherIsBetter: false,
    }),
  ];

  const comparabilityWarnings = buildComparabilityWarnings(slotA, slotB);
  const crossDatasetDiagnosis = buildCrossDatasetComparisonDiagnosis({
    slotA,
    slotB,
    kpiRows,
  });
  const comparisonRecommendations = buildCrossDatasetComparisonRecommendations({
    kpiRows,
    comparabilityWarnings,
  });

  return {
    slotA,
    slotB,
    kpiRows,
    comparabilityWarnings,
    crossDatasetDiagnosis,
    comparisonRecommendations,
    evaluatedMetrics: kpiRows.filter((row) => row.slotANumeric !== null).length,
  };
};
