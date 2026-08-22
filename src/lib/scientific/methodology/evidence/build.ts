import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "@/lib/scientific/methodology/reproducibility";
import { deduplicateTextLines } from "@/lib/scientific/shared";

import type {
  EvidenceBootstrapExplorerInput,
  EvidenceEffectMagnitude,
  EvidenceEffectSizePowerInput,
  EvidenceStrengthEngineBuildInput,
  EvidenceStrengthEngineInterpretationInput,
} from "./input-types";
import { getEvidenceStrengthEngineClassificationText } from "./labels";
import type { EvidenceStrengthEngineAnalysis } from "./types";
import { buildCompositeMethodologyDisclosure } from "../disclosure";

export const hasEvidenceStrengthEngineInput = (input: {
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  reproducibilityExplorerAnalysis: ReproducibilityExplorerAnalysis | null;
  bootstrapExplorerAnalysis: EvidenceBootstrapExplorerInput | null;
}) =>
  input.consistencyEngineAnalysis !== null ||
  input.reportQualityEngineAnalysis !== null ||
  input.reproducibilityExplorerAnalysis !== null ||
  input.bootstrapExplorerAnalysis !== null;

const EVIDENCE_INFERENCE_SCORE_FALLBACK = 50;
const EVIDENCE_INFERENCE_SCORE_TRIVIAL = 55;
const EVIDENCE_INFERENCE_SCORE_SMALL = 70;
const EVIDENCE_INFERENCE_SCORE_MEDIUM = 80;
const EVIDENCE_INFERENCE_SCORE_LARGE = 95;
const EVIDENCE_INSUFFICIENT_SAMPLE_PENALTY = 10;

const getEvidenceStrengthEffectMagnitudeInferenceScoreBase = (
  magnitude: EvidenceEffectMagnitude
): number => {
  if (magnitude === "large") return EVIDENCE_INFERENCE_SCORE_LARGE;
  if (magnitude === "medium") return EVIDENCE_INFERENCE_SCORE_MEDIUM;
  if (magnitude === "small") return EVIDENCE_INFERENCE_SCORE_SMALL;
  return EVIDENCE_INFERENCE_SCORE_TRIVIAL;
};

const getEvidenceStrengthEffectAwareInferenceScore = (
  effectSizePowerAnalysis: EvidenceEffectSizePowerInput | null
): number => {
  if (!effectSizePowerAnalysis) {
    return EVIDENCE_INFERENCE_SCORE_FALLBACK;
  }

  let score = getEvidenceStrengthEffectMagnitudeInferenceScoreBase(
    effectSizePowerAnalysis.dominantMagnitude
  );

  if (effectSizePowerAnalysis.insufficientSampleWarning !== null) {
    score = Math.max(
      EVIDENCE_INFERENCE_SCORE_FALLBACK,
      score - EVIDENCE_INSUFFICIENT_SAMPLE_PENALTY
    );
  }

  return score;
};

// Legacy binario pre-SCI-57B — conservado para comparación temporal.
const getEvidenceStrengthInferenceScore = (input: {
  anovaAnalysis: EvidenceStrengthEngineBuildInput["anovaAnalysis"];
  mannWhitneyResult: EvidenceStrengthEngineBuildInput["mannWhitneyResult"];
  kruskalWallisResult: EvidenceStrengthEngineBuildInput["kruskalWallisResult"];
}) => {
  if (
    input.anovaAnalysis ||
    input.mannWhitneyResult ||
    input.kruskalWallisResult
  ) {
    return 100;
  }
  return 50;
};

const classifyEvidenceStrengthEngine = (
  evidenceScore: number
): EvidenceStrengthEngineAnalysis["classification"] => {
  if (evidenceScore >= 85) return "very-strong";
  if (evidenceScore >= 70) return "strong";
  if (evidenceScore >= 50) return "moderate";
  return "limited";
};

export const hasEvidenceStrengthEngineVeryStrong = (
  analysis: EvidenceStrengthEngineAnalysis | null
) => analysis !== null && analysis.evidenceScore >= 85;

export const hasEvidenceStrengthEngineLimited = (
  analysis: EvidenceStrengthEngineAnalysis | null
) => analysis !== null && analysis.classification === "limited";

const buildEvidenceStrengthEngineInterpretation = (
  input: EvidenceStrengthEngineInterpretationInput
): string[] => {
  const interpretation: string[] = [
    getEvidenceStrengthEngineClassificationText(input.classification),
  ];

  if (
    input.consistencyEngineAnalysis &&
    input.consistencyEngineAnalysis.consistencyScore >= 85
  ) {
    interpretation.push(
      "Los distintos enfoques analíticos muestran una elevada convergencia."
    );
  }

  if (
    input.reproducibilityExplorerAnalysis &&
    input.reproducibilityExplorerAnalysis.reproducibilityScore >= 85
  ) {
    interpretation.push(
      "La reproducibilidad potencial del análisis es elevada."
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
    input.bootstrapExplorerAnalysis &&
    input.bootstrapExplorerAnalysis.stabilityScore >= 85
  ) {
    interpretation.push(
      "La estabilidad observada aumenta el soporte compuesto disponible."
    );
  }

  if (input.hasInferentialTests) {
    interpretation.push(
      "Hay resultados inferenciales disponibles; este indicador compuesto no evalúa por sí solo su significación."
    );
  }

  return deduplicateTextLines(interpretation);
};

export const buildEvidenceStrengthEngineAnalysis = (
  input: EvidenceStrengthEngineBuildInput
): EvidenceStrengthEngineAnalysis | null => {
  if (!hasEvidenceStrengthEngineInput(input)) {
    return null;
  }

  const consistencyScore = input.consistencyEngineAnalysis?.consistencyScore ?? 50;
  const qualityScore = input.reportQualityEngineAnalysis?.qualityScore ?? 50;
  const reproducibilityScore =
    input.reproducibilityExplorerAnalysis?.reproducibilityScore ?? 50;
  const bootstrapScore = input.bootstrapExplorerAnalysis?.stabilityScore ?? 50;
  const inferenceScore = getEvidenceStrengthEffectAwareInferenceScore(
    input.effectSizePowerAnalysis
  );
  const hasInferentialTests =
    input.anovaAnalysis !== null ||
    input.mannWhitneyResult !== null ||
    input.kruskalWallisResult !== null;
  const evidenceScore =
    (consistencyScore +
      qualityScore +
      reproducibilityScore +
      bootstrapScore +
      inferenceScore) /
    5;
  const classification = classifyEvidenceStrengthEngine(evidenceScore);

  return {
    evidenceScore,
    classification,
    evidenceSources: 5,
    interpretation: buildEvidenceStrengthEngineInterpretation({
      classification,
      consistencyEngineAnalysis: input.consistencyEngineAnalysis,
      reportQualityEngineAnalysis: input.reportQualityEngineAnalysis,
      reproducibilityExplorerAnalysis: input.reproducibilityExplorerAnalysis,
      bootstrapExplorerAnalysis: input.bootstrapExplorerAnalysis,
      hasInferentialTests,
    }),
    disclosure: buildCompositeMethodologyDisclosure([
      {
        id: "composite-consistency",
        label: "Composite consistency score",
        role: "score",
        status: input.consistencyEngineAnalysis ? "evaluated" : "defaulted",
        provenance: input.consistencyEngineAnalysis
          ? "upstream-composite-output"
          : "neutral-fallback",
        fallback: input.consistencyEngineAnalysis
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
        id: "composite-reproducibility",
        label: "Composite reproducibility-potential score",
        role: "score",
        status: input.reproducibilityExplorerAnalysis
          ? "evaluated"
          : "defaulted",
        provenance: input.reproducibilityExplorerAnalysis
          ? "upstream-composite-output"
          : "neutral-fallback",
        fallback: input.reproducibilityExplorerAnalysis
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
        id: "effect-magnitude",
        label: "Effect-magnitude summary",
        role: "score",
        status: input.effectSizePowerAnalysis ? "evaluated" : "defaulted",
        provenance: input.effectSizePowerAnalysis
          ? "direct-input-summary"
          : "neutral-fallback",
        fallback: input.effectSizePowerAnalysis
          ? undefined
          : "neutral score of 50",
      },
      {
        id: "inferential-result-availability",
        label: "Inferential-result availability",
        role: "interpretation",
        status: hasInferentialTests ? "evaluated" : "not-evaluated",
        provenance: "direct-input-summary",
      },
    ]),
  };
};
