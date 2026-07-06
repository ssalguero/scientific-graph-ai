import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";

import type { ReproducibilityExplorerClassification } from "./types";

// Sync with page.tsx upstream analysis types (structural typing only).

export type ReproducibilityExperimentalStatisticsInput = {
  count: number;
};

export type ReproducibilityNormalityConsensusInput = {
  conclusion:
    | "normal"
    | "probably-normal"
    | "questionable"
    | "contradictory"
    | "non-normal";
};

export type ReproducibilityBootstrapExplorerInput = {
  stabilityScore: number;
};

export type ReproducibilitySensitivityExplorerInput = {
  sensitivityScore: number;
};

export type ReproducibilityExplorerBuildInput = {
  experimentalStatistics: ReproducibilityExperimentalStatisticsInput[];
  normalityConsensus: ReproducibilityNormalityConsensusInput[];
  bootstrapExplorerAnalysis: ReproducibilityBootstrapExplorerInput | null;
  sensitivityExplorerAnalysis: ReproducibilitySensitivityExplorerInput | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
};

export type ReproducibilityExplorerInterpretationInput = {
  classification: ReproducibilityExplorerClassification;
  bootstrapExplorerAnalysis: ReproducibilityBootstrapExplorerInput | null;
  sensitivityExplorerAnalysis: ReproducibilitySensitivityExplorerInput | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
};
