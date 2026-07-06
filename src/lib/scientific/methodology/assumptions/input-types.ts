// Sync with page.tsx upstream analysis types (structural typing only).

export type AssumptionsNormalityAnalysisInput = object;

export type AssumptionsNormalityConsensusInput = {
  conclusion:
    | "normal"
    | "probably-normal"
    | "questionable"
    | "contradictory"
    | "non-normal";
};

export type AssumptionsQQPlotAnalysisInput = {
  interpretation: "excellent" | "good" | "moderate" | "poor";
};

export type AssumptionsViolinPlotAnalysisInput = {
  shapeInterpretation: "symmetric" | "right-skewed" | "left-skewed";
};

export type AssumptionsKernelDensityAnalysisInput = {
  distributionShape:
    | "symmetric"
    | "right-skewed"
    | "left-skewed"
    | "multimodal";
};

export type AssumptionsVarianceHomogeneityAnalysisInput = {
  classification:
    | "homogeneous"
    | "approximately-homogeneous"
    | "heterogeneous";
};

export type AssumptionsIndependenceAnalysisInput = {
  status: "satisfied" | "questionable";
};

export type AssumptionTrackerBuildInput = {
  normalityAnalyses: AssumptionsNormalityAnalysisInput[];
  normalityConsensus: AssumptionsNormalityConsensusInput[];
  qqPlotAnalyses: AssumptionsQQPlotAnalysisInput[];
  violinPlotAnalyses: AssumptionsViolinPlotAnalysisInput[];
  kernelDensityAnalyses: AssumptionsKernelDensityAnalysisInput[];
  varianceHomogeneityAnalysis: AssumptionsVarianceHomogeneityAnalysisInput | null;
  independenceAnalysis: AssumptionsIndependenceAnalysisInput | null;
};
