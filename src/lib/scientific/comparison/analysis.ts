import { COMPARISON_DELTA_STABLE_THRESHOLD } from "./constants";
import {
  formatProfileEffectValue,
  formatProfileEvidenceValue,
  formatProfileMethodologicalCard,
  formatProfileProspectiveSampleSize,
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

const buildCoreComparisonKpiRows = (
  slotA: DatasetAnalysisProfile,
  slotB: DatasetAnalysisProfile
): ComparisonKpiRow[] => [
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

const hasMethodologicalBreakdown = (profile: DatasetAnalysisProfile): boolean =>
  profile.methodological !== undefined;

const buildMethodologicalComparisonKpiRows = (
  slotA: DatasetAnalysisProfile,
  slotB: DatasetAnalysisProfile
): ComparisonKpiRow[] => {
  if (!hasMethodologicalBreakdown(slotA) && !hasMethodologicalBreakdown(slotB)) {
    return [];
  }

  return [
    buildComparisonKpiRow({
      key: "consistency",
      title: "Consistency (SCI-50)",
      slotAValue: formatProfileMethodologicalCard(
        slotA.methodological,
        "consistencyScore"
      ),
      slotBValue: formatProfileMethodologicalCard(
        slotB.methodological,
        "consistencyScore"
      ),
      slotANumeric: slotA.methodological?.consistencyScore,
      slotBNumeric: slotB.methodological?.consistencyScore,
      higherIsBetter: true,
    }),
    buildComparisonKpiRow({
      key: "quality",
      title: "Report Quality (SCI-51)",
      slotAValue: formatProfileMethodologicalCard(
        slotA.methodological,
        "qualityScore"
      ),
      slotBValue: formatProfileMethodologicalCard(
        slotB.methodological,
        "qualityScore"
      ),
      slotANumeric: slotA.methodological?.qualityScore,
      slotBNumeric: slotB.methodological?.qualityScore,
      higherIsBetter: true,
    }),
    buildComparisonKpiRow({
      key: "reproducibility",
      title: "Reproducibility (SCI-52)",
      slotAValue: formatProfileMethodologicalCard(
        slotA.methodological,
        "reproducibilityScore"
      ),
      slotBValue: formatProfileMethodologicalCard(
        slotB.methodological,
        "reproducibilityScore"
      ),
      slotANumeric: slotA.methodological?.reproducibilityScore,
      slotBNumeric: slotB.methodological?.reproducibilityScore,
      higherIsBetter: true,
    }),
    buildComparisonKpiRow({
      key: "assumption",
      title: "Assumptions (SCI-54)",
      slotAValue: formatProfileMethodologicalCard(
        slotA.methodological,
        "assumptionScore"
      ),
      slotBValue: formatProfileMethodologicalCard(
        slotB.methodological,
        "assumptionScore"
      ),
      slotANumeric: slotA.methodological?.assumptionScore,
      slotBNumeric: slotB.methodological?.assumptionScore,
      higherIsBetter: true,
    }),
  ];
};

const hasEnrichedProfileContent = (profile: DatasetAnalysisProfile): boolean =>
  profile.methodological !== undefined ||
  profile.multivariate !== undefined ||
  profile.publication !== undefined ||
  profile.inferential?.prospectiveSampleSize != null;

const buildEnrichedComparisonKpiRows = (
  slotA: DatasetAnalysisProfile,
  slotB: DatasetAnalysisProfile
): ComparisonKpiRow[] => {
  if (
    !hasEnrichedProfileContent(slotA) &&
    !hasEnrichedProfileContent(slotB)
  ) {
    return [];
  }

  const rows: ComparisonKpiRow[] = [];

  if (slotA.normality && slotB.normality) {
    rows.push(
      buildComparisonKpiRow({
        key: "normalityNonNormal",
        title: "Series no normales",
        slotAValue: String(slotA.normality.nonNormalCount),
        slotBValue: String(slotB.normality.nonNormalCount),
        slotANumeric: slotA.normality.nonNormalCount,
        slotBNumeric: slotB.normality.nonNormalCount,
        higherIsBetter: false,
      })
    );
  }

  const slotAProspective = formatProfileProspectiveSampleSize(slotA);
  const slotBProspective = formatProfileProspectiveSampleSize(slotB);
  if (slotAProspective !== "—" || slotBProspective !== "—") {
    rows.push(
      buildComparisonKpiRow({
        key: "prospectiveSampleSize",
        title: "Tamaño muestral prospectivo (SCI-57)",
        slotAValue: slotAProspective,
        slotBValue: slotBProspective,
        slotANumeric:
          slotA.inferential?.prospectiveSampleSize ??
          slotA.publication?.prospectiveSampleSize ??
          undefined,
        slotBNumeric:
          slotB.inferential?.prospectiveSampleSize ??
          slotB.publication?.prospectiveSampleSize ??
          undefined,
        higherIsBetter: true,
      })
    );
  }

  return rows;
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
    ...buildCoreComparisonKpiRows(slotA, slotB),
    ...buildMethodologicalComparisonKpiRows(slotA, slotB),
    ...buildEnrichedComparisonKpiRows(slotA, slotB),
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
    slotAComplete: slotA.isComplete,
    slotBComplete: slotB.isComplete,
  });

  const methodologicalBreakdownAvailable =
    hasMethodologicalBreakdown(slotA) || hasMethodologicalBreakdown(slotB);
  const multivariateSectionAvailable =
    slotA.multivariate !== undefined || slotB.multivariate !== undefined;
  const publicationHighlightsAvailable =
    (slotA.publication?.publicationRisksTop?.length ?? 0) > 0 ||
    (slotB.publication?.publicationRisksTop?.length ?? 0) > 0 ||
    (slotA.publication?.crossDomainDiagnosisTop?.length ?? 0) > 0 ||
    (slotB.publication?.crossDomainDiagnosisTop?.length ?? 0) > 0;

  return {
    slotA,
    slotB,
    kpiRows,
    comparabilityWarnings,
    crossDatasetDiagnosis,
    comparisonRecommendations,
    evaluatedMetrics: kpiRows.filter((row) => row.slotANumeric !== null).length,
    methodologicalBreakdownAvailable,
    multivariateSectionAvailable,
    publicationHighlightsAvailable,
  };
};
