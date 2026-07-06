import type { ReportQualityEngineClassification } from "./types";

export const getReportQualityEngineClassificationLabel = (
  classification: ReportQualityEngineClassification
) => {
  if (classification === "excellent") return "Excellent";
  if (classification === "good") return "Good";
  if (classification === "acceptable") return "Acceptable";
  return "Limited";
};

export const getReportQualityEngineClassificationText = (
  classification: ReportQualityEngineClassification
) => {
  if (classification === "excellent") {
    return "La calidad metodológica global del análisis es excelente.";
  }
  if (classification === "good") {
    return "La calidad metodológica global del análisis es buena.";
  }
  if (classification === "acceptable") {
    return "La calidad metodológica global del análisis es aceptable.";
  }
  return "La calidad metodológica global del análisis es limitada.";
};
