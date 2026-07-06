import type { ConsistencyEngineClassification } from "./types";

// Sync with page.tsx multivariate analysis types (structural typing only).

export type ConsistencyEnginePcaInput = {
  cumulativeVariance: number;
};

export type ConsistencyEngineMdsInput = {
  stress: number;
};

export type ConsistencyEngineSimilarityNetworkInput = {
  averageSimilarity: number;
};

export type ConsistencyEngineManovaExplorerInput = {
  separationScore: number;
};

export type ConsistencyEngineLdaExplorerInput = {
  discriminantScore: number;
};

export type ConsistencyEnginePcrExplorerInput = {
  predictiveScore: number;
};

export type ConsistencyEnginePlsExplorerInput = {
  explanatoryScore: number;
};

export type ConsistencyEngineBootstrapExplorerInput = {
  stabilityScore: number;
};

export type ConsistencyEngineSensitivityExplorerInput = {
  sensitivityScore: number;
};

export type ConsistencyEngineTsneExplorerInput = {
  clusterTendency: "strong" | "moderate" | "weak";
};

export type ConsistencyEngineUmapExplorerInput = {
  manifoldQuality: "excellent" | "good" | "moderate" | "poor";
};

export type ConsistencyEngineHierarchicalClusteringInput = {
  root: unknown;
};

export type ConsistencyEngineBuildInput = {
  pcaAnalysis: ConsistencyEnginePcaInput | null;
  hierarchicalClusteringAnalysis: ConsistencyEngineHierarchicalClusteringInput | null;
  mdsAnalysis: ConsistencyEngineMdsInput | null;
  similarityNetworkAnalysis: ConsistencyEngineSimilarityNetworkInput | null;
  manovaExplorerAnalysis: ConsistencyEngineManovaExplorerInput | null;
  ldaExplorerAnalysis: ConsistencyEngineLdaExplorerInput | null;
  pcrExplorerAnalysis: ConsistencyEnginePcrExplorerInput | null;
  plsExplorerAnalysis: ConsistencyEnginePlsExplorerInput | null;
  bootstrapExplorerAnalysis: ConsistencyEngineBootstrapExplorerInput | null;
  sensitivityExplorerAnalysis: ConsistencyEngineSensitivityExplorerInput | null;
  tsneExplorerAnalysis: ConsistencyEngineTsneExplorerInput | null;
  umapExplorerAnalysis: ConsistencyEngineUmapExplorerInput | null;
};

export type ConsistencyEngineInterpretationInput = {
  classification: ConsistencyEngineClassification;
  bootstrapExplorerAnalysis: ConsistencyEngineBootstrapExplorerInput | null;
  sensitivityExplorerAnalysis: ConsistencyEngineSensitivityExplorerInput | null;
  tsneExplorerAnalysis: ConsistencyEngineTsneExplorerInput | null;
  umapExplorerAnalysis: ConsistencyEngineUmapExplorerInput | null;
};
