import type {
  KernelDistributionShape,
  QQPlotInterpretation,
  ViolinShapeInterpretation,
} from "./input-types";

export const getQQPlotSourceSummaryLabel = (
  interpretation: QQPlotInterpretation
) => {
  if (interpretation === "excellent") return "Excelente ajuste normal";
  if (interpretation === "good") return "Buen ajuste normal";
  if (interpretation === "moderate") return "Ajuste moderado";
  return "Ajuste deficiente";
};

export const getViolinSourceSummaryMessage = (
  interpretation: ViolinShapeInterpretation
) => {
  if (interpretation === "symmetric") {
    return "Distribución aproximadamente simétrica.";
  }
  if (interpretation === "right-skewed") {
    return "Distribución sesgada hacia valores altos.";
  }
  return "Distribución sesgada hacia valores bajos.";
};

export const getKernelSourceSummaryMessage = (shape: KernelDistributionShape) => {
  if (shape === "symmetric") {
    return "Distribución aproximadamente simétrica.";
  }
  if (shape === "right-skewed") {
    return "Distribución sesgada hacia valores altos.";
  }
  if (shape === "left-skewed") {
    return "Distribución sesgada hacia valores bajos.";
  }
  return "Se detectan múltiples agrupaciones de datos.";
};
