import type { PublicationReadinessAnalyzerClassification } from "./types";

export const getPublicationReadinessAnalyzerClassificationLabel = (
  classification: PublicationReadinessAnalyzerClassification
) => {
  if (classification === "publication-ready") return "Preparación compuesta alta";
  if (classification === "near-ready") return "Preparación compuesta cercana";
  if (classification === "requires-review") return "Requiere revisión";
  return "Preparación compuesta insuficiente";
};

export const getPublicationReadinessAnalyzerClassificationText = (
  classification: PublicationReadinessAnalyzerClassification
) => {
  if (classification === "publication-ready") {
    return "Las señales compuestas presentan preparación alta para revisión humana.";
  }
  if (classification === "near-ready") {
    return "Las señales compuestas se aproximan a un nivel alto de preparación para revisión.";
  }
  if (classification === "requires-review") {
    return "El análisis requiere revisión metodológica adicional.";
  }
  return "Las señales compuestas muestran preparación insuficiente para revisión.";
};
