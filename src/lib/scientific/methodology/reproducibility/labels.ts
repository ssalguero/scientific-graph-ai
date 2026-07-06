import type { ReproducibilityExplorerClassification } from "./types";

export const getReproducibilityExplorerClassificationLabel = (
  classification: ReproducibilityExplorerClassification
) => {
  if (classification === "very-high") return "Very High";
  if (classification === "high") return "High";
  if (classification === "moderate") return "Moderate";
  return "Low";
};

export const getReproducibilityExplorerClassificationText = (
  classification: ReproducibilityExplorerClassification
) => {
  if (classification === "very-high") {
    return "La reproducibilidad potencial del análisis es muy alta.";
  }
  if (classification === "high") {
    return "La reproducibilidad potencial del análisis es alta.";
  }
  if (classification === "moderate") {
    return "La reproducibilidad potencial del análisis es moderada.";
  }
  return "La reproducibilidad potencial del análisis es limitada.";
};
