import {
  createGeneratedTextContentIdentity,
  createGeneratedTextEvidenceIdentity,
  extractVgbFigureCosmeticBinding,
  extractVgbFigureScientificBinding,
  fingerprintVgbFigureCosmeticBinding,
  fingerprintVgbFigureEvidence,
  fingerprintVgbFigureScientificBinding,
} from "@/lib/scientific/contracts";
import type { ScientificSemanticProjection } from "@/lib/scientific/contracts";
import type {
  GraphSpecification,
  ProjectVisualGraphEntry,
} from "@/lib/visualGraphBuilder";

export const buildVgbFigureReviewEvidence = (input: {
  graphSpec: GraphSpecification;
  projection: ScientificSemanticProjection;
}): unknown => ({
  scientificConfiguration: extractVgbFigureScientificBinding(input.graphSpec),
  semanticValues: input.projection.semanticValues.filter(
    (value) =>
      value.field === "figure.scientificConfiguration" ||
      value.field.startsWith("values.") ||
      value.field.startsWith("units.")
  ),
  provenance: input.projection.provenance,
});

export const buildVgbFigureReviewContent = (input: {
  graphSpec: GraphSpecification;
}): string =>
  JSON.stringify(extractVgbFigureScientificBinding(input.graphSpec));

export const createVgbFigureReviewIdentities = (input: {
  graphSpec: GraphSpecification;
  projection: ScientificSemanticProjection;
}) => ({
  contentIdentity: createGeneratedTextContentIdentity(
    buildVgbFigureReviewContent(input)
  ),
  evidenceIdentity: createGeneratedTextEvidenceIdentity(
    buildVgbFigureReviewEvidence(input),
    "live-semantic-evidence"
  ),
  scientificFingerprint: fingerprintVgbFigureScientificBinding(
    extractVgbFigureScientificBinding(input.graphSpec)
  ),
  cosmeticFingerprint: fingerprintVgbFigureCosmeticBinding(
    extractVgbFigureCosmeticBinding(input.graphSpec)
  ),
  evidenceFingerprint: fingerprintVgbFigureEvidence(
    buildVgbFigureReviewEvidence(input)
  ),
});

export const workingFigureScientificFingerprintFromEntry = (
  entry: ProjectVisualGraphEntry
): string =>
  fingerprintVgbFigureScientificBinding(
    extractVgbFigureScientificBinding(entry.graphSpec)
  );
