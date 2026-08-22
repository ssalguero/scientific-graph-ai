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
    return "El soporte compuesto disponible es muy alto.";
  }
  if (classification === "strong") {
    return "El soporte compuesto disponible es alto.";
  }
  if (classification === "moderate") {
    return "El soporte compuesto disponible es moderado.";
  }
  return "El soporte compuesto disponible es limitado.";
};
