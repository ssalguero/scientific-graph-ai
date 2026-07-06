import type { EvidenceStrengthEngineClassification } from "./types";

export const getEvidenceStrengthEngineClassificationLabel = (
  classification: EvidenceStrengthEngineClassification
) => {
  if (classification === "very-strong") return "Very Strong";
  if (classification === "strong") return "Strong";
  if (classification === "moderate") return "Moderate";
  return "Limited";
};

export const getEvidenceStrengthEngineClassificationText = (
  classification: EvidenceStrengthEngineClassification
) => {
  if (classification === "very-strong") {
    return "La evidencia científica global es muy fuerte.";
  }
  if (classification === "strong") {
    return "La evidencia científica global es fuerte.";
  }
  if (classification === "moderate") {
    return "La evidencia científica global es moderada.";
  }
  return "La evidencia científica global es limitada.";
};
