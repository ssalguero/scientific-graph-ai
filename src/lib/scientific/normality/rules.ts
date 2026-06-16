import type {
  KernelDistributionShape,
  NormalityClassification,
  QQPlotInterpretation,
  ViolinShapeInterpretation,
} from "./input-types";

export const isViolinShapeSkewed = (
  shape: ViolinShapeInterpretation | undefined
) => shape === "right-skewed" || shape === "left-skewed";

export const isKernelShapeSkewed = (shape: KernelDistributionShape | undefined) =>
  shape === "right-skewed" || shape === "left-skewed";

export const isNormalityClassificationFavorable = (
  classification: NormalityClassification | null | undefined
) =>
  classification === "normal" || classification === "approximately-normal";

export const isQQInterpretationFavorable = (
  interpretation: QQPlotInterpretation | undefined
) => interpretation === "excellent" || interpretation === "good";

export const isQQInterpretationUnfavorable = (
  interpretation: QQPlotInterpretation | undefined
) => interpretation === "poor";

export const isDistributionShapeFavorable = (
  shape: ViolinShapeInterpretation | KernelDistributionShape | undefined
) => shape === "symmetric";

export const isDistributionShapeUnfavorable = (
  shape: ViolinShapeInterpretation | KernelDistributionShape | undefined
) =>
  shape === "right-skewed" ||
  shape === "left-skewed" ||
  shape === "multimodal";
