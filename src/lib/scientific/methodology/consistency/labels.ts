import type { ConsistencyEngineClassification } from "./types";

export const getConsistencyEngineClassificationLabel = (
  classification: ConsistencyEngineClassification
) => {
  if (classification === "very-strong") return "Very Strong";
  if (classification === "strong") return "Strong";
  if (classification === "moderate") return "Moderate";
  return "Weak";
};

export const getConsistencyEngineClassificationText = (
  classification: ConsistencyEngineClassification
) => {
  if (classification === "very-strong") {
    return "La evidencia científica presenta una consistencia muy fuerte.";
  }
  if (classification === "strong") {
    return "La evidencia científica presenta una consistencia fuerte.";
  }
  if (classification === "moderate") {
    return "La evidencia científica presenta consistencia moderada.";
  }
  return "La evidencia científica presenta consistencia limitada.";
};

export const getConsistencyEngineClassificationInterpretation = (
  classification: ConsistencyEngineClassification
) => {
  if (classification === "very-strong") {
    return "Los distintos enfoques analíticos convergen hacia conclusiones compatibles.";
  }
  if (classification === "strong") {
    return "La mayoría de los análisis respaldan una interpretación común.";
  }
  if (classification === "moderate") {
    return "Se observan coincidencias parciales entre los distintos enfoques.";
  }
  return "Los resultados muestran señales mixtas y deben interpretarse con cautela.";
};
