// Sync with page.tsx SCI-11/21/22/26 analysis types (structural typing only).

export type NormalityClassification =
  | "normal"
  | "approximately-normal"
  | "non-normal";

export type QQPlotInterpretation = "excellent" | "good" | "moderate" | "poor";

export type ViolinShapeInterpretation =
  | "symmetric"
  | "right-skewed"
  | "left-skewed";

export type KernelDistributionShape =
  | "symmetric"
  | "right-skewed"
  | "left-skewed"
  | "multimodal";

export type CanonicalNormalityNormalityInput = {
  seriesName: string;
  classification: NormalityClassification | null;
};

export type CanonicalNormalityQQInput = {
  seriesName: string;
  interpretation: QQPlotInterpretation;
};

export type CanonicalNormalityViolinInput = {
  seriesName: string;
  shapeInterpretation: ViolinShapeInterpretation;
};

export type CanonicalNormalityKernelInput = {
  seriesName: string;
  distributionShape: KernelDistributionShape;
};
