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
    return "Las señales compuestas presentan consistencia muy alta.";
  }
  if (classification === "strong") {
    return "Las señales compuestas presentan consistencia alta.";
  }
  if (classification === "moderate") {
    return "Las señales compuestas presentan consistencia moderada.";
  }
  return "Las señales compuestas presentan consistencia limitada.";
};

export const getConsistencyEngineClassificationInterpretation = (
  classification: ConsistencyEngineClassification
) => {
  if (classification === "very-strong") {
    return "Los indicadores contribuyentes convergen en esta puntuación compuesta.";
  }
  if (classification === "strong") {
    return "La mayoría de los indicadores contribuyentes siguen una dirección común.";
  }
  if (classification === "moderate") {
    return "Se observan coincidencias parciales entre los distintos enfoques.";
  }
  return "Los resultados muestran señales mixtas y deben interpretarse con cautela.";
};
