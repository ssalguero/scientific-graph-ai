import { deduplicateTextLines, pushUniqueTextLine } from "@/lib/scientific/shared/text";
import type { ComparisonKpiRow, DatasetAnalysisProfile } from "./types";

export const buildComparabilityWarnings = (
  slotA: DatasetAnalysisProfile,
  slotB: DatasetAnalysisProfile
): string[] => {
  const warnings: string[] = [];
  if (slotA.seriesCount !== slotB.seriesCount) {
    warnings.push(
      "Los datasets tienen distinto número de series; la comparación es parcial."
    );
  }
  if (
    slotA.totalObservations > 0 &&
    slotB.totalObservations > 0 &&
    (slotA.totalObservations / slotB.totalObservations > 3 ||
      slotB.totalObservations / slotA.totalObservations > 3)
  ) {
    warnings.push("Los tamaños muestrales son muy dispares entre slots.");
  }
  if (!slotA.isComplete || !slotB.isComplete) {
    warnings.push(
      "Capture ambos slots con motores SCI-50→57 activos para una comparación completa."
    );
  }
  if (slotA.inferential && !slotB.inferential) {
    warnings.push("Effect size disponible solo en Slot A.");
  } else if (!slotA.inferential && slotB.inferential) {
    warnings.push("Effect size disponible solo en Slot B.");
  } else   if (
    slotA.inferential?.metric &&
    slotB.inferential?.metric &&
    slotA.inferential.metric !== slotB.inferential.metric
  ) {
    warnings.push(
      "Las métricas de effect size no son directamente comparables entre slots."
    );
  }

  const enginesA = slotA.methodological?.evaluatedEngines;
  const enginesB = slotB.methodological?.evaluatedEngines;
  if (
    enginesA !== undefined &&
    enginesB !== undefined &&
    Math.abs(enginesA - enginesB) > 1
  ) {
    warnings.push(
      "Los perfiles metodológicos capturados evalúan distinto número de motores SCI-50→55."
    );
  }

  const hasMultivariateA = slotA.multivariate !== undefined;
  const hasMultivariateB = slotB.multivariate !== undefined;
  if (hasMultivariateA !== hasMultivariateB) {
    warnings.push(
      "Highlights multivariantes (SCI-40) disponibles solo en uno de los slots."
    );
  }

  return deduplicateTextLines(warnings);
};

export const buildCrossDatasetComparisonDiagnosis = (input: {
  slotA: DatasetAnalysisProfile;
  slotB: DatasetAnalysisProfile;
  kpiRows: ComparisonKpiRow[];
}): string[] => {
  const diagnosis: string[] = [];
  const readinessRow = input.kpiRows.find((row) => row.key === "readiness");
  const evidenceRow = input.kpiRows.find((row) => row.key === "evidence");
  const publicationRow = input.kpiRows.find(
    (row) => row.key === "publicationStatus"
  );

  if (
    evidenceRow?.slotAValue.includes("Strong") &&
    evidenceRow?.slotBValue.includes("Strong") &&
    readinessRow?.delta !== null &&
    readinessRow?.delta !== undefined &&
    readinessRow.delta < -5
  ) {
    pushUniqueTextLine(
      diagnosis,
      "Ambos estudios mantienen evidencia Strong, pero Slot B presenta menor preparación metodológica."
    );
  }

  if (
    publicationRow &&
    publicationRow.slotAValue !== publicationRow.slotBValue &&
    publicationRow.slotAValue !== "—" &&
    publicationRow.slotBValue !== "—"
  ) {
    pushUniqueTextLine(
      diagnosis,
      `Publication Status diverge: Slot A (${publicationRow.slotAValue}) vs Slot B (${publicationRow.slotBValue}).`
    );
  }

  if (
    input.slotA.inferential?.dominantMagnitude === "large" &&
    input.slotB.inferential?.dominantMagnitude === "large"
  ) {
    pushUniqueTextLine(
      diagnosis,
      "La magnitud del efecto dominante es grande en ambos estudios."
    );
  }

  const nonNormalA = input.slotA.normality?.nonNormalCount ?? 0;
  const nonNormalB = input.slotB.normality?.nonNormalCount ?? 0;
  if (nonNormalB > nonNormalA) {
    pushUniqueTextLine(
      diagnosis,
      "Slot B presenta más series no normales que Slot A."
    );
  }

  const overallRow = input.kpiRows.find((row) => row.key === "overallHealth");
  const assumptionRow = input.kpiRows.find((row) => row.key === "assumption");
  if (
    overallRow?.delta !== null &&
    overallRow?.delta !== undefined &&
    overallRow.delta < -5 &&
    assumptionRow?.delta !== null &&
    assumptionRow?.delta !== undefined &&
    assumptionRow.delta < -10
  ) {
    pushUniqueTextLine(
      diagnosis,
      "Slot B muestra menor salud metodológica global y peor evaluación de supuestos que Slot A."
    );
  }

  const pcaA = input.slotA.multivariate?.pcaVariance;
  const pcaB = input.slotB.multivariate?.pcaVariance;
  if (
    pcaA !== undefined &&
    pcaB !== undefined &&
    Math.abs(pcaB - pcaA) > 15
  ) {
    pushUniqueTextLine(
      diagnosis,
      "La varianza PCA explicada diverge notablemente entre los estudios comparados."
    );
  }

  const warningA = input.slotA.publication?.insufficientSampleWarning;
  const warningB = input.slotB.publication?.insufficientSampleWarning;
  if (warningA && !warningB) {
    pushUniqueTextLine(
      diagnosis,
      "Slot A reporta advertencia de tamaño muestral insuficiente; Slot B no."
    );
  } else if (!warningA && warningB) {
    pushUniqueTextLine(
      diagnosis,
      "Slot B reporta advertencia de tamaño muestral insuficiente; Slot A no."
    );
  }

  if (diagnosis.length === 0) {
    pushUniqueTextLine(
      diagnosis,
      "Los perfiles comparados no muestran divergencias críticas en los KPIs evaluados."
    );
  }

  return diagnosis;
};

const evidenceRowStable = (rows: ComparisonKpiRow[]): boolean => {
  const evidenceRow = rows.find((row) => row.key === "evidence");
  return evidenceRow?.deltaDirection === "stable";
};

export const buildCrossDatasetComparisonRecommendations = (input: {
  kpiRows: ComparisonKpiRow[];
  comparabilityWarnings: string[];
  slotAComplete?: boolean;
  slotBComplete?: boolean;
}): string[] => {
  const recommendations: string[] = [];
  const readinessRow = input.kpiRows.find((row) => row.key === "readiness");
  const overallRow = input.kpiRows.find((row) => row.key === "overallHealth");

  if (readinessRow?.deltaDirection === "regressed") {
    pushUniqueTextLine(
      recommendations,
      "Revise supuestos y calidad metodológica en Slot B antes de generalizar conclusiones."
    );
  }

  if (
    evidenceRowStable(input.kpiRows) &&
    overallRow?.deltaDirection === "regressed"
  ) {
    pushUniqueTextLine(
      recommendations,
      "Priorice Assumptions y Reproducibility en Slot B (SCI-56) pese a evidencia estable."
    );
  }

  if (input.comparabilityWarnings.length > 0) {
    pushUniqueTextLine(
      recommendations,
      "Considere las advertencias de comparabilidad antes de interpretar deltas numéricos."
    );
  }

  if (recommendations.length === 0) {
    if (input.slotAComplete && input.slotBComplete) {
      pushUniqueTextLine(
        recommendations,
        "Incluya la sección Multi-Dataset en el reporte científico exportado para documentar el contraste entre slots."
      );
    } else {
      pushUniqueTextLine(
        recommendations,
        "Documente el contraste entre slots en el reporte científico del dataset activo."
      );
    }
  }

  return recommendations;
};
