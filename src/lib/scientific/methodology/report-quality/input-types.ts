import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";

import type { ReportQualityEngineClassification } from "./types";

// Sync with page.tsx upstream analysis types (structural typing only).

export type ReportQualityExperimentalStatisticsInput = {
  count: number;
};

export type ReportQualityNormalityAnalysisInput = {
  classification: "normal" | "approximately-normal" | "non-normal" | null;
};

export type ReportQualityNormalityConsensusInput = {
  conclusion:
    | "normal"
    | "probably-normal"
    | "questionable"
    | "contradictory"
    | "non-normal";
};

export type ReportQualityBootstrapExplorerInput = {
  stabilityScore: number;
};

export type ReportQualityAnovaInput = object;

export type ReportQualityMannWhitneyInput = object;

export type ReportQualityKruskalWallisInput = object;

export type ReportQualityEngineBuildInput = {
  experimentalStatistics: ReportQualityExperimentalStatisticsInput[];
  normalityAnalyses: ReportQualityNormalityAnalysisInput[];
  normalityConsensus: ReportQualityNormalityConsensusInput[];
  anovaAnalysis: ReportQualityAnovaInput | null;
  mannWhitneyResult: ReportQualityMannWhitneyInput | null;
  kruskalWallisResult: ReportQualityKruskalWallisInput | null;
  bootstrapExplorerAnalysis: ReportQualityBootstrapExplorerInput | null;
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
};

export type ReportQualityEngineInterpretationInput = {
  classification: ReportQualityEngineClassification;
  bootstrapExplorerAnalysis: ReportQualityBootstrapExplorerInput | null;
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  hasInferentialTests: boolean;
};
