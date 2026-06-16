import { pushUniqueTextLine } from "@/lib/scientific/shared/text";
import {
  getNormalityConfidenceLabel,
  getNormalityConsensusConclusionLabel,
} from "./labels";
import type { CanonicalNormalityAssessment, NormalityConsensus } from "./types";

export const getCanonicalNormalityReportLines = (
  assessment: CanonicalNormalityAssessment
): string[] => {
  if (assessment.seriesAssessments.length === 0) {
    return [
      "No hay series disponibles para evaluación integrada de normalidad.",
    ];
  }

  const lines = [...assessment.globalConclusion];
  assessment.warnings.forEach((warning) => lines.push(warning));

  assessment.seriesAssessments.forEach((series) => {
    lines.push(series.seriesName);
    lines.push(
      `Conclusión: ${getNormalityConsensusConclusionLabel(series.conclusion)}`
    );
    lines.push(`Confianza: ${getNormalityConfidenceLabel(series.confidence)}`);
    series.reasons.forEach((reason) => lines.push(`- ${reason}`));
  });

  return lines;
};

export const getCanonicalNormalityFindingLine = (series: NormalityConsensus) => {
  if (series.conclusion === "normal") {
    return `La serie ${series.seriesName} presenta evidencia consistente de normalidad.`;
  }
  if (series.conclusion === "probably-normal") {
    return `La serie ${series.seriesName} es probablemente normal según la evaluación integrada.`;
  }
  if (series.conclusion === "questionable") {
    return `La serie ${series.seriesName} presenta resultados ambiguos respecto a normalidad.`;
  }
  if (series.conclusion === "contradictory") {
    return `La serie ${series.seriesName} presenta señales contradictorias entre normalidad estadística y diagnósticos visuales.`;
  }
  return `La serie ${series.seriesName} no cumple supuestos de normalidad.`;
};

export const appendCanonicalNormalityFindings = (
  findings: string[],
  warnings: string[],
  assessment: CanonicalNormalityAssessment
) => {
  assessment.globalConclusion.forEach((line) => {
    pushUniqueTextLine(findings, line);
  });

  assessment.warnings.forEach((line) => {
    pushUniqueTextLine(warnings, line);
  });

  assessment.seriesAssessments.forEach((series) => {
    const finding = getCanonicalNormalityFindingLine(series);
    pushUniqueTextLine(findings, finding);

    if (series.conclusion === "non-normal") {
      const warning = `La serie ${series.seriesName} no cumple supuestos de normalidad; se recomienda priorizar pruebas no paramétricas.`;
      if (!warnings.includes(warning)) warnings.push(warning);
    }

    if (series.conclusion === "contradictory") {
      const warning = `La serie ${series.seriesName} presenta señales contradictorias entre normalidad estadística y diagnósticos visuales.`;
      if (!warnings.includes(warning)) warnings.push(warning);
    }

    if (series.conclusion === "questionable") {
      const warning = `La serie ${series.seriesName} presenta resultados ambiguos respecto a normalidad.`;
      if (!warnings.includes(warning)) warnings.push(warning);
    }
  });
};

export const getCanonicalNormalitySeriesFooterText = (
  assessment: NormalityConsensus | undefined
) => {
  if (!assessment) return null;
  return `Evaluación integrada — ${getNormalityConsensusConclusionLabel(assessment.conclusion)}: ${assessment.reasons[0]}`;
};
