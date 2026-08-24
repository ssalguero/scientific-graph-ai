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
import { sanitizeForPdfText } from "./pdf-text";
import {
  buildScientificProjectionDisclosureLines,
  projectDatasetAnalysisProfile,
  readProjectedNumber,
  readProjectedString,
} from "./projection";
import type {
  ScientificFreshnessAssessment,
  ScientificProjectionSurface,
} from "@/lib/scientific/contracts";

export const MULTI_DATASET_COMPARISON_REPORT_TITLE =
  "Comparación Multi-Dataset (SCI-58)";

export type MultiDatasetComparisonReportSection = {
  title: string;
  content: string[];
};

export type MultiDatasetComparisonProjectionContext = {
  slotAFreshness?: ScientificFreshnessAssessment;
  slotBFreshness?: ScientificFreshnessAssessment;
};

export const canIncludeMultiDatasetComparisonInReport = (
  analysis: MultiDatasetComparisonAnalysis | null
): boolean =>
  analysis !== null &&
  canBuildMultiDatasetComparisonAnalysis(analysis.slotA, analysis.slotB);

const appendSlotSummaryLines = (
  lines: string[],
  label: string,
  profile: DatasetAnalysisProfile,
  surface: Extract<ScientificProjectionSurface, "report" | "pdf"> = "report",
  freshness?: ScientificFreshnessAssessment
): void => {
  const projection = projectDatasetAnalysisProfile(profile, surface, freshness);
  const fileName = projection
    ? (readProjectedString(projection, "dataset.fileName") ?? "No disponible")
    : profile.datasetInfo.fileName;
  const seriesCount = projection
    ? (readProjectedNumber(projection, "seriesCount") ?? 0)
    : profile.seriesCount;
  const totalObservations = projection
    ? (readProjectedNumber(projection, "totalObservations") ?? 0)
    : profile.totalObservations;
  const capturedAt =
    projection?.artifactIdentity.kind === "citable-scientific-snapshot"
      ? projection.artifactIdentity.capturedAt
      : profile.capturedAt;
  lines.push(`${label}: ${fileName}`);
  lines.push(
    `${label}: ${seriesCount} series · ${totalObservations} observaciones.`
  );
  lines.push(
    `${label}: capturado ${new Date(capturedAt).toLocaleString()}.`
  );
  lines.push(
    `${label}: ${formatDatasetAnalysisProfileMiniSummary(profile)}.`
  );
  buildScientificProjectionDisclosureLines(projection).forEach((line) =>
    lines.push(`${label}: ${line}`)
  );
};

export const getMultiDatasetComparisonReportLines = (
  analysis: MultiDatasetComparisonAnalysis,
  context: MultiDatasetComparisonProjectionContext = {}
): string[] => {
  const lines: string[] = [];

  appendSlotSummaryLines(
    lines,
    "Slot A",
    analysis.slotA,
    "report",
    context.slotAFreshness
  );
  appendSlotSummaryLines(
    lines,
    "Slot B",
    analysis.slotB,
    "report",
    context.slotBFreshness
  );
  lines.push(`Compatibilidad semántica: ${analysis.compatibility.state}.`);

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
  analysis: MultiDatasetComparisonAnalysis,
  context: MultiDatasetComparisonProjectionContext = {}
): MultiDatasetComparisonReportSection => ({
  title: MULTI_DATASET_COMPARISON_REPORT_TITLE,
  content: getMultiDatasetComparisonReportLines(analysis, context),
});

const appendPdfSlotSummaryLines = (
  lines: string[],
  label: string,
  profile: DatasetAnalysisProfile,
  freshness?: ScientificFreshnessAssessment
): void => {
  const projected: string[] = [];
  appendSlotSummaryLines(projected, label, profile, "pdf", freshness);
  projected.forEach((line) => lines.push(line.replace(" · ", ", ")));
};

/** PDF-safe layout: ASCII symbols and one KPI field per line (no pipe-separated rows). */
export const getMultiDatasetComparisonPdfLines = (
  analysis: MultiDatasetComparisonAnalysis,
  context: MultiDatasetComparisonProjectionContext = {}
): string[] => {
  const rawLines: string[] = [];

  appendPdfSlotSummaryLines(
    rawLines,
    "Slot A",
    analysis.slotA,
    context.slotAFreshness
  );
  appendPdfSlotSummaryLines(
    rawLines,
    "Slot B",
    analysis.slotB,
    context.slotBFreshness
  );
  rawLines.push(`Compatibilidad semantica: ${analysis.compatibility.state}.`);

  const readinessRow = analysis.kpiRows.find((row) => row.key === "readiness");
  if (readinessRow?.delta !== null && readinessRow?.delta !== undefined) {
    rawLines.push(
      `Delta Readiness (B - A): ${formatComparisonNumericDelta(readinessRow.delta)}.`
    );
  }

  rawLines.push("KPIs comparativos:");
  analysis.kpiRows.forEach((row) => {
    const deltaText =
      row.delta !== null
        ? `${formatComparisonNumericDelta(row.delta)} (${getComparisonDeltaDirectionLabel(row.deltaDirection)})`
        : "-";
    rawLines.push(`${row.title}:`);
    rawLines.push(`  Slot A: ${row.slotAValue}`);
    rawLines.push(`  Slot B: ${row.slotBValue}`);
    rawLines.push(`  Delta (B-A): ${deltaText}`);
  });

  if (analysis.slotA.normality || analysis.slotB.normality) {
    rawLines.push("Normalidad integrada:");
    if (analysis.slotA.normality) {
      rawLines.push(
        `Slot A: normales=${analysis.slotA.normality.normalCount}, no normales=${analysis.slotA.normality.nonNormalCount}, cuestionables=${analysis.slotA.normality.questionableCount}.`
      );
    }
    if (analysis.slotB.normality) {
      rawLines.push(
        `Slot B: normales=${analysis.slotB.normality.normalCount}, no normales=${analysis.slotB.normality.nonNormalCount}, cuestionables=${analysis.slotB.normality.questionableCount}.`
      );
    }
  }

  if (analysis.multivariateSectionAvailable) {
    rawLines.push("Multivariante (SCI-40):");
    if (analysis.slotA.multivariate) {
      rawLines.push(
        `Slot A: ${formatProfileMultivariateValue(analysis.slotA.multivariate)}.`
      );
    }
    if (analysis.slotB.multivariate) {
      rawLines.push(
        `Slot B: ${formatProfileMultivariateValue(analysis.slotB.multivariate)}.`
      );
    }
  }

  if (analysis.comparabilityWarnings.length > 0) {
    rawLines.push("Advertencias de comparabilidad:");
    analysis.comparabilityWarnings.forEach((warning) => rawLines.push(warning));
  }

  if (analysis.crossDatasetDiagnosis.length > 0) {
    rawLines.push("Diagnóstico cruzado:");
    analysis.crossDatasetDiagnosis.forEach((line) => rawLines.push(line));
  }

  if (analysis.comparisonRecommendations.length > 0) {
    rawLines.push("Recomendaciones:");
    analysis.comparisonRecommendations.forEach((line) => rawLines.push(line));
  }

  rawLines.push(
    "Nota: Comparación de síntesis metodológica entre snapshots capturados; no constituye prueba estadística combinada."
  );

  const lines = rawLines.map((line) => sanitizeForPdfText(line));

  return lines;
};

export const buildMultiDatasetComparisonPdfReportSection = (
  analysis: MultiDatasetComparisonAnalysis,
  context: MultiDatasetComparisonProjectionContext = {}
): MultiDatasetComparisonReportSection => ({
  title: MULTI_DATASET_COMPARISON_REPORT_TITLE,
  content: getMultiDatasetComparisonPdfLines(analysis, context),
});

/**
 * Replaces any Report-surface SCI-58 section with the PDF-specific projection.
 * This keeps production PDF orchestration on the same authoritative snapshot
 * while preserving the PDF formatter boundary.
 */
export const replaceMultiDatasetComparisonWithPdfProjection = (input: {
  sections: readonly MultiDatasetComparisonReportSection[];
  analysis: MultiDatasetComparisonAnalysis | null;
  context?: MultiDatasetComparisonProjectionContext;
  included: boolean;
}): MultiDatasetComparisonReportSection[] => {
  const withoutReportProjection = input.sections.filter(
    (section) => section.title !== MULTI_DATASET_COMPARISON_REPORT_TITLE
  );
  if (
    !input.included ||
    !canIncludeMultiDatasetComparisonInReport(input.analysis)
  ) {
    return withoutReportProjection;
  }
  return [
    ...withoutReportProjection,
    buildMultiDatasetComparisonPdfReportSection(
      input.analysis!,
      input.context
    ),
  ];
};
