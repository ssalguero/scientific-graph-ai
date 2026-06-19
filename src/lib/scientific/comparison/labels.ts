import type {
  EvidenceStrengthClassification,
  PublicationReadinessClassification,
} from "./input-types";

export const getPublicationReadinessClassificationLabel = (
  classification: PublicationReadinessClassification
): string => {
  if (classification === "publication-ready") return "Publication Ready";
  if (classification === "near-ready") return "Near Ready";
  if (classification === "requires-review") return "Requires Review";
  return "Not Ready";
};

export const getEvidenceStrengthClassificationLabel = (
  classification: EvidenceStrengthClassification
): string => {
  if (classification === "very-strong") return "Very Strong";
  if (classification === "strong") return "Strong";
  if (classification === "moderate") return "Moderate";
  return "Limited";
};
