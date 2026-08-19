import type {
  CanonicalNormalityAssessment,
  CanonicalNormalityConclusion,
  NormalityConsensus,
} from "./types";

export const isCanonicalConclusionSupportiveOfNormality = (
  conclusion: CanonicalNormalityConclusion
) => conclusion === "normal" || conclusion === "probably-normal";

export const doesCanonicalAssessmentSupportNormality = (
  assessment: CanonicalNormalityAssessment
) =>
  assessment.seriesAssessments.length > 0 &&
  assessment.seriesAssessments.every((series) =>
    isCanonicalConclusionSupportiveOfNormality(series.conclusion)
  );

export const buildReportFacingNormalityGlobalConclusion = (
  seriesAssessments: NormalityConsensus[]
): string[] => {
  if (seriesAssessments.length === 0) {
    return [
      "No hay series disponibles para evaluación integrada de normalidad.",
    ];
  }

  const supportiveCount = seriesAssessments.filter((series) =>
    isCanonicalConclusionSupportiveOfNormality(series.conclusion)
  ).length;
  const normalCount = seriesAssessments.filter(
    (series) => series.conclusion === "normal"
  ).length;
  const contradictoryCount = seriesAssessments.filter(
    (series) => series.conclusion === "contradictory"
  ).length;
  const nonNormalCount = seriesAssessments.filter(
    (series) => series.conclusion === "non-normal"
  ).length;

  if (supportiveCount === seriesAssessments.length) {
    if (normalCount === seriesAssessments.length) {
      return [
        "La evaluación integrada (SCI-11, SCI-21, SCI-22 y SCI-26) es coherente con normalidad en todas las series.",
      ];
    }
    return [
      "La evaluación integrada es compatible con normalidad, con reservas, en todas las series.",
    ];
  }

  if (contradictoryCount > 0) {
    return [
      `Se detectaron ${contradictoryCount} serie(s) con señales contradictorias entre normalidad estadística y diagnósticos visuales.`,
    ];
  }

  if (nonNormalCount === seriesAssessments.length) {
    return [
      "La evaluación integrada indica que ninguna serie cumple de forma consistente el supuesto de normalidad.",
    ];
  }

  return [
    "La evaluación integrada muestra señales mixtas de normalidad entre series y métodos.",
  ];
};
