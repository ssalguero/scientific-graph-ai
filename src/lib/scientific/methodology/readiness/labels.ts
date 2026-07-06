import type { PublicationReadinessAnalyzerClassification } from "./types";

export const getPublicationReadinessAnalyzerClassificationLabel = (
  classification: PublicationReadinessAnalyzerClassification
) => {
  if (classification === "publication-ready") return "Publication Ready";
  if (classification === "near-ready") return "Near Ready";
  if (classification === "requires-review") return "Requires Review";
  return "Not Ready";
};

export const getPublicationReadinessAnalyzerClassificationText = (
  classification: PublicationReadinessAnalyzerClassification
) => {
  if (classification === "publication-ready") {
    return "El análisis presenta un nivel de preparación adecuado para comunicación científica.";
  }
  if (classification === "near-ready") {
    return "El análisis se encuentra próximo a un nivel adecuado para publicación.";
  }
  if (classification === "requires-review") {
    return "El análisis requiere revisión metodológica adicional.";
  }
  return "El análisis no presenta evidencia suficiente para publicación.";
};
