import { canBuildMultiDatasetComparisonAnalysis } from "./analysis";
import {
  formatComparisonNumericDelta,
  formatDatasetAnalysisProfileMiniSummary,
  formatProfileMultivariateValue,
  getComparisonDeltaDirectionLabel,
} from "./format";
import type {
  DatasetAnalysisProfile,
  MultiDatasetComparisonAnalysis,
} from "./types";

export const MULTI_DATASET_COMPARISON_REPORT_TITLE =
  "Comparación Multi-Dataset (SCI-58)";

export type MultiDatasetComparisonReportSection = {
  title: string;
  content: string[];
};

export const canIncludeMultiDatasetComparisonInReport = (
  analysis: MultiDatasetComparisonAnalysis | null
): boolean =>
  analysis !== null &&
  canBuildMultiDatasetComparisonAnalysis(analysis.slotA, analysis.slotB);

const appendSlotSummaryLines = (
  lines: string[],
  label: string,
  profile: DatasetAnalysisProfile
): void => {
  lines.push(`${label}: ${profile.datasetInfo.fileName}`);
  lines.push(
    `${label}: ${profile.seriesCount} series · ${profile.totalObservations} observaciones.`
  );
  lines.push(
    `${label}: capturado ${new Date(profile.capturedAt).toLocaleString()}.`
  );
  lines.push(
    `${label}: ${formatDatasetAnalysisProfileMiniSummary(profile)}.`
  );
};

export const getMultiDatasetComparisonReportLines = (
  analysis: MultiDatasetComparisonAnalysis
): string[] => {
  const lines: string[] = [];

  appendSlotSummaryLines(lines, "Slot A", analysis.slotA);
  appendSlotSummaryLines(lines, "Slot B", analysis.slotB);

  const readinessRow = analysis.kpiRows.find((row) => row.key === "readiness");
  if (readinessRow?.delta !== null && readinessRow?.delta !== undefined) {
    lines.push(
      `Delta Readiness (B − A): ${formatComparisonNumericDelta(readinessRow.delta)}.`
    );
  }

  lines.push("KPIs comparativos:");
  analysis.kpiRows.forEach((row) => {
    const deltaText =
      row.delta !== null
        ? `${formatComparisonNumericDelta(row.delta)} (${getComparisonDeltaDirectionLabel(row.deltaDirection)})`
        : "—";
    lines.push(
      `${row.title} | Slot A: ${row.slotAValue} | Slot B: ${row.slotBValue} | Δ (B−A): ${deltaText}`
    );
  });

  if (analysis.slotA.normality || analysis.slotB.normality) {
    lines.push("Normalidad integrada:");
    if (analysis.slotA.normality) {
      lines.push(
        `Slot A: normales=${analysis.slotA.normality.normalCount}, no normales=${analysis.slotA.normality.nonNormalCount}, cuestionables=${analysis.slotA.normality.questionableCount}.`
      );
    }
    if (analysis.slotB.normality) {
      lines.push(
        `Slot B: normales=${analysis.slotB.normality.normalCount}, no normales=${analysis.slotB.normality.nonNormalCount}, cuestionables=${analysis.slotB.normality.questionableCount}.`
      );
    }
  }

  if (analysis.multivariateSectionAvailable) {
    lines.push("Multivariante (SCI-40):");
    if (analysis.slotA.multivariate) {
      lines.push(
        `Slot A: ${formatProfileMultivariateValue(analysis.slotA.multivariate)}.`
      );
    }
    if (analysis.slotB.multivariate) {
      lines.push(
        `Slot B: ${formatProfileMultivariateValue(analysis.slotB.multivariate)}.`
      );
    }
  }

  if (analysis.comparabilityWarnings.length > 0) {
    lines.push("Advertencias de comparabilidad:");
    analysis.comparabilityWarnings.forEach((warning) => lines.push(warning));
  }

  if (analysis.crossDatasetDiagnosis.length > 0) {
    lines.push("Diagnóstico cruzado:");
    analysis.crossDatasetDiagnosis.forEach((line) => lines.push(line));
  }

  if (analysis.comparisonRecommendations.length > 0) {
    lines.push("Recomendaciones:");
    analysis.comparisonRecommendations.forEach((line) => lines.push(line));
  }

  lines.push(
    "Nota: Comparación de síntesis metodológica entre snapshots capturados; no constituye prueba estadística combinada."
  );

  return lines;
};

export const buildMultiDatasetComparisonReportSection = (
  analysis: MultiDatasetComparisonAnalysis
): MultiDatasetComparisonReportSection => ({
  title: MULTI_DATASET_COMPARISON_REPORT_TITLE,
  content: getMultiDatasetComparisonReportLines(analysis),
});
