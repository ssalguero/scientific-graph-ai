import type { AssumptionTrackerAnalysis } from "@/lib/scientific/methodology/assumptions";
import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "@/lib/scientific/methodology/reproducibility";
import { deduplicateTextLines } from "@/lib/scientific/shared";

import type {
  PublicationReadinessAnalyzerBuildInput,
  PublicationReadinessAnalyzerInterpretationInput,
} from "./input-types";
import { getPublicationReadinessAnalyzerClassificationText } from "./labels";
import type { PublicationReadinessAnalyzerAnalysis } from "./types";
import {
  buildCompositeMethodologyDisclosure,
  type CompositeMethodologyFactorInput,
} from "../disclosure";

export const hasPublicationReadinessAnalyzerInput = (input: {
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  reproducibilityExplorerAnalysis: ReproducibilityExplorerAnalysis | null;
  evidenceStrengthEngineAnalysis: EvidenceStrengthEngineAnalysis | null;
  assumptionTrackerAnalysis: AssumptionTrackerAnalysis | null;
}) =>
  input.consistencyEngineAnalysis !== null ||
  input.reportQualityEngineAnalysis !== null ||
  input.reproducibilityExplorerAnalysis !== null ||
  input.evidenceStrengthEngineAnalysis !== null ||
  input.assumptionTrackerAnalysis !== null;

const classifyPublicationReadinessAnalyzer = (
  readinessScore: number
): PublicationReadinessAnalyzerAnalysis["classification"] => {
  if (readinessScore >= 85) return "publication-ready";
  if (readinessScore >= 70) return "near-ready";
  if (readinessScore >= 50) return "requires-review";
  return "not-ready";
};

export const hasPublicationReadinessAnalyzerReady = (
  analysis: PublicationReadinessAnalyzerAnalysis | null
) => analysis !== null && analysis.readinessScore >= 85;

export const hasPublicationReadinessAnalyzerNotReady = (
  analysis: PublicationReadinessAnalyzerAnalysis | null
) => analysis !== null && analysis.classification === "not-ready";

const buildPublicationReadinessAnalyzerInterpretation = (
  input: PublicationReadinessAnalyzerInterpretationInput
): string[] => {
  const interpretation: string[] = [
    getPublicationReadinessAnalyzerClassificationText(input.classification),
  ];

  if (input.consistencyScore >= 85) {
    interpretation.push(
      "La consistencia global de los resultados es elevada."
    );
  }

  if (input.qualityScore >= 85) {
    interpretation.push(
      "El indicador compuesto de calidad metodológica es alto."
    );
  }

  if (input.reproducibilityScore >= 85) {
    interpretation.push("La reproducibilidad potencial es favorable.");
  }

  if (input.evidenceScore >= 85) {
    interpretation.push("El indicador compuesto de soporte es alto.");
  }

  if (input.assumptionScore >= 85) {
    interpretation.push(
      "Los supuestos estadísticos se encuentran adecuadamente respaldados."
    );
  }

  return deduplicateTextLines(interpretation);
};

export const buildPublicationReadinessAnalyzerAnalysis = (
  input: PublicationReadinessAnalyzerBuildInput
): PublicationReadinessAnalyzerAnalysis | null => {
  if (!hasPublicationReadinessAnalyzerInput(input)) {
    return null;
  }

  const consistencyScore =
    input.consistencyEngineAnalysis?.consistencyScore ?? 50;
  const qualityScore = input.reportQualityEngineAnalysis?.qualityScore ?? 50;
  const reproducibilityScore =
    input.reproducibilityExplorerAnalysis?.reproducibilityScore ?? 50;
  const evidenceScore = input.evidenceStrengthEngineAnalysis?.evidenceScore ?? 50;
  const assumptionScore = input.assumptionTrackerAnalysis?.overallScore ?? 50;
  const readinessScore =
    (consistencyScore +
      qualityScore +
      reproducibilityScore +
      evidenceScore +
      assumptionScore) /
    5;
  const classification = classifyPublicationReadinessAnalyzer(readinessScore);

  return {
    readinessScore,
    classification,
    evaluatedAreas: 5,
    interpretation: buildPublicationReadinessAnalyzerInterpretation({
      classification,
      consistencyScore,
      qualityScore,
      reproducibilityScore,
      evidenceScore,
      assumptionScore,
    }),
    disclosure: buildCompositeMethodologyDisclosure(
      [
        ["consistency", "Composite consistency score", input.consistencyEngineAnalysis],
        ["report-quality", "Composite report-quality score", input.reportQualityEngineAnalysis],
        ["reproducibility", "Composite reproducibility-potential score", input.reproducibilityExplorerAnalysis],
        ["evidence", "Composite evidence-strength score", input.evidenceStrengthEngineAnalysis],
        ["assumptions", "Composite assumption-coverage score", input.assumptionTrackerAnalysis],
      ].map(
        ([id, label, value]): CompositeMethodologyFactorInput => ({
          id: id as string,
          label: label as string,
          role: "score",
          status: value ? "evaluated" : "defaulted",
          provenance: value
            ? "upstream-composite-output"
            : "neutral-fallback",
          fallback: value ? undefined : "neutral score of 50",
        })
      )
    ),
  };
};
