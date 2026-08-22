import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import { getCanonicalNormalityScore } from "@/lib/scientific/normality";
import { deduplicateTextLines } from "@/lib/scientific/shared";

import type {
  ReproducibilityBootstrapExplorerInput,
  ReproducibilityExplorerBuildInput,
  ReproducibilityExplorerInterpretationInput,
  ReproducibilityExperimentalStatisticsInput,
  ReproducibilityNormalityConsensusInput,
  ReproducibilitySensitivityExplorerInput,
} from "./input-types";
import { getReproducibilityExplorerClassificationText } from "./labels";
import type { ReproducibilityExplorerAnalysis } from "./types";
import { buildCompositeMethodologyDisclosure } from "../disclosure";

export const hasReproducibilityExplorerInput = (input: {
  experimentalStatistics: ReproducibilityExplorerBuildInput["experimentalStatistics"];
  bootstrapExplorerAnalysis: ReproducibilityBootstrapExplorerInput | null;
  sensitivityExplorerAnalysis: ReproducibilitySensitivityExplorerInput | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
}) =>
  input.experimentalStatistics.length > 0 ||
  input.bootstrapExplorerAnalysis !== null ||
  input.sensitivityExplorerAnalysis !== null ||
  input.reportQualityEngineAnalysis !== null ||
  input.consistencyEngineAnalysis !== null;

const getReproducibilitySampleFactor = (
  experimentalStatistics: ReproducibilityExperimentalStatisticsInput[]
) => {
  if (experimentalStatistics.length === 0) return 50;

  const averageSampleSize =
    experimentalStatistics.reduce((sum, stats) => sum + stats.count, 0) /
    experimentalStatistics.length;

  if (averageSampleSize >= 30) return 100;
  if (averageSampleSize >= 15) return 80;
  if (averageSampleSize >= 10) return 60;
  return 40;
};

const getReproducibilityNormalityFactor = (
  normalityConsensus: ReproducibilityNormalityConsensusInput[]
) => {
  if (normalityConsensus.length === 0) return 50;

  return (
    normalityConsensus.reduce(
      (sum, consensus) =>
        sum + getCanonicalNormalityScore(consensus.conclusion),
      0
    ) / normalityConsensus.length
  );
};

const classifyReproducibilityExplorer = (
  reproducibilityScore: number
): ReproducibilityExplorerAnalysis["classification"] => {
  if (reproducibilityScore >= 85) return "very-high";
  if (reproducibilityScore >= 70) return "high";
  if (reproducibilityScore >= 50) return "moderate";
  return "low";
};

export const hasReproducibilityExplorerVeryHigh = (
  analysis: ReproducibilityExplorerAnalysis | null
) => analysis !== null && analysis.reproducibilityScore >= 85;

export const hasReproducibilityExplorerLow = (
  analysis: ReproducibilityExplorerAnalysis | null
) => analysis !== null && analysis.classification === "low";

const buildReproducibilityExplorerInterpretation = (
  input: ReproducibilityExplorerInterpretationInput
): string[] => {
  const interpretation: string[] = [
    getReproducibilityExplorerClassificationText(input.classification),
  ];

  if (
    input.bootstrapExplorerAnalysis &&
    input.bootstrapExplorerAnalysis.stabilityScore >= 85
  ) {
    interpretation.push(
      "La estabilidad observada favorece el potencial de reproducibilidad; no lo demuestra."
    );
  }

  if (
    input.sensitivityExplorerAnalysis &&
    input.sensitivityExplorerAnalysis.sensitivityScore >= 85
  ) {
    interpretation.push(
      "Las conclusiones muestran robustez frente a variaciones potenciales."
    );
  }

  if (
    input.reportQualityEngineAnalysis &&
    input.reportQualityEngineAnalysis.qualityScore >= 85
  ) {
    interpretation.push(
      "El indicador compuesto de calidad metodológica es alto."
    );
  }

  if (
    input.consistencyEngineAnalysis &&
    input.consistencyEngineAnalysis.consistencyScore >= 85
  ) {
    interpretation.push(
      "La convergencia entre indicadores aumenta el potencial de reproducibilidad."
    );
  }

  return deduplicateTextLines(interpretation);
};

export const buildReproducibilityExplorerAnalysis = (
  input: ReproducibilityExplorerBuildInput
): ReproducibilityExplorerAnalysis | null => {
  if (!hasReproducibilityExplorerInput(input)) {
    return null;
  }

  const sampleFactor = getReproducibilitySampleFactor(input.experimentalStatistics);
  const normalityFactor = getReproducibilityNormalityFactor(
    input.normalityConsensus
  );
  const bootstrapFactor =
    input.bootstrapExplorerAnalysis?.stabilityScore ?? 50;
  const sensitivityFactor =
    input.sensitivityExplorerAnalysis?.sensitivityScore ?? 50;
  const qualityFactor = input.reportQualityEngineAnalysis?.qualityScore ?? 50;
  const reproducibilityScore =
    (sampleFactor +
      normalityFactor +
      bootstrapFactor +
      sensitivityFactor +
      qualityFactor) /
    5;
  const classification = classifyReproducibilityExplorer(reproducibilityScore);

  return {
    reproducibilityScore,
    classification,
    evaluatedFactors: 5,
    interpretation: buildReproducibilityExplorerInterpretation({
      classification,
      bootstrapExplorerAnalysis: input.bootstrapExplorerAnalysis,
      sensitivityExplorerAnalysis: input.sensitivityExplorerAnalysis,
      reportQualityEngineAnalysis: input.reportQualityEngineAnalysis,
      consistencyEngineAnalysis: input.consistencyEngineAnalysis,
    }),
    disclosure: buildCompositeMethodologyDisclosure([
      {
        id: "sample-size",
        label: "Sample-size adequacy",
        role: "score",
        status:
          input.experimentalStatistics.length > 0 ? "evaluated" : "defaulted",
        provenance:
          input.experimentalStatistics.length > 0
            ? "direct-input-summary"
            : "neutral-fallback",
        fallback:
          input.experimentalStatistics.length > 0
            ? undefined
            : "neutral score of 50",
      },
      {
        id: "normality",
        label: "Normality consensus",
        role: "score",
        status:
          input.normalityConsensus.length > 0 ? "evaluated" : "defaulted",
        provenance:
          input.normalityConsensus.length > 0
            ? "direct-input-summary"
            : "neutral-fallback",
        fallback:
          input.normalityConsensus.length > 0
            ? undefined
            : "neutral score of 50",
      },
      {
        id: "resampling-stability",
        label: "Resampling stability",
        role: "score",
        status: input.bootstrapExplorerAnalysis ? "evaluated" : "defaulted",
        provenance: input.bootstrapExplorerAnalysis
          ? "direct-input-summary"
          : "neutral-fallback",
        fallback: input.bootstrapExplorerAnalysis
          ? undefined
          : "neutral score of 50",
      },
      {
        id: "perturbation-robustness",
        label: "Perturbation robustness",
        role: "score",
        status: input.sensitivityExplorerAnalysis ? "evaluated" : "defaulted",
        provenance: input.sensitivityExplorerAnalysis
          ? "direct-input-summary"
          : "neutral-fallback",
        fallback: input.sensitivityExplorerAnalysis
          ? undefined
          : "neutral score of 50",
      },
      {
        id: "composite-report-quality",
        label: "Composite report-quality score",
        role: "score",
        status: input.reportQualityEngineAnalysis ? "evaluated" : "defaulted",
        provenance: input.reportQualityEngineAnalysis
          ? "upstream-composite-output"
          : "neutral-fallback",
        fallback: input.reportQualityEngineAnalysis
          ? undefined
          : "neutral score of 50",
      },
      {
        id: "composite-consistency",
        label: "Composite consistency score",
        role: "interpretation",
        status: input.consistencyEngineAnalysis
          ? "evaluated"
          : "not-evaluated",
        provenance: "upstream-composite-output",
      },
    ]),
  };
};
