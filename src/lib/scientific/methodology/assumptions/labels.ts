import type {
  AssumptionTrackerClassification,
  AssumptionTrackerItemStatus,
} from "./types";

export const getAssumptionTrackerClassificationLabel = (
  classification: AssumptionTrackerClassification
) => {
  if (classification === "excellent") return "Excellent";
  if (classification === "good") return "Good";
  if (classification === "moderate") return "Moderate";
  return "Limited";
};

export const getAssumptionTrackerClassificationText = (
  classification: AssumptionTrackerClassification
) => {
  if (classification === "excellent") {
    return "Los supuestos estadísticos presentan una evaluación muy favorable.";
  }
  if (classification === "good") {
    return "Los supuestos estadísticos presentan una evaluación adecuada.";
  }
  if (classification === "moderate") {
    return "Existen supuestos que requieren revisión adicional.";
  }
  return "Los supuestos estadísticos presentan limitaciones importantes.";
};

export const getAssumptionTrackerStatusLabel = (
  status: AssumptionTrackerItemStatus
) => {
  if (status === "satisfied") return "Satisfied";
  if (status === "partially-satisfied") return "Partial";
  if (status === "questionable") return "Questionable";
  return "Not Evaluated";
};

export const getAssumptionTrackerStatusIcon = (
  status: AssumptionTrackerItemStatus
) => {
  if (status === "satisfied") return "✔";
  if (status === "partially-satisfied") return "◐";
  if (status === "questionable") return "⚠";
  return "?";
};
