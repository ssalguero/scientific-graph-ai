import { deduplicateTextLines } from "@/lib/scientific/shared";

import type {
  ConsistencyEngineBuildInput,
  ConsistencyEngineInterpretationInput,
} from "./input-types";
import type { ConsistencyEngineAnalysis } from "./types";
import {
  getConsistencyEngineClassificationInterpretation,
  getConsistencyEngineClassificationText,
} from "./labels";

export const hasConsistencyEngineInput = (input: {
  pcaAnalysis: ConsistencyEngineBuildInput["pcaAnalysis"];
  hierarchicalClusteringAnalysis: ConsistencyEngineBuildInput["hierarchicalClusteringAnalysis"];
  mdsAnalysis: ConsistencyEngineBuildInput["mdsAnalysis"];
  manovaExplorerAnalysis: ConsistencyEngineBuildInput["manovaExplorerAnalysis"];
  ldaExplorerAnalysis: ConsistencyEngineBuildInput["ldaExplorerAnalysis"];
  pcrExplorerAnalysis: ConsistencyEngineBuildInput["pcrExplorerAnalysis"];
  plsExplorerAnalysis: ConsistencyEngineBuildInput["plsExplorerAnalysis"];
  bootstrapExplorerAnalysis: ConsistencyEngineBuildInput["bootstrapExplorerAnalysis"];
  sensitivityExplorerAnalysis: ConsistencyEngineBuildInput["sensitivityExplorerAnalysis"];
  tsneExplorerAnalysis: ConsistencyEngineBuildInput["tsneExplorerAnalysis"];
  umapExplorerAnalysis: ConsistencyEngineBuildInput["umapExplorerAnalysis"];
}) =>
  input.pcaAnalysis !== null ||
  input.hierarchicalClusteringAnalysis !== null ||
  input.mdsAnalysis !== null ||
  input.manovaExplorerAnalysis !== null ||
  input.ldaExplorerAnalysis !== null ||
  input.pcrExplorerAnalysis !== null ||
  input.plsExplorerAnalysis !== null ||
  input.bootstrapExplorerAnalysis !== null ||
  input.sensitivityExplorerAnalysis !== null ||
  input.tsneExplorerAnalysis !== null ||
  input.umapExplorerAnalysis !== null;

const classifyConsistencyEngine = (
  consistencyScore: number
): ConsistencyEngineAnalysis["classification"] => {
  if (consistencyScore >= 85) return "very-strong";
  if (consistencyScore >= 70) return "strong";
  if (consistencyScore >= 50) return "moderate";
  return "weak";
};

export const hasConsistencyEngineVeryStrong = (
  analysis: ConsistencyEngineAnalysis | null
) => analysis !== null && analysis.consistencyScore >= 85;

export const hasConsistencyEngineWeak = (analysis: ConsistencyEngineAnalysis | null) =>
  analysis !== null && analysis.classification === "weak";

const buildConsistencyEngineInterpretation = (
  input: ConsistencyEngineInterpretationInput
): string[] => {
  const interpretation: string[] = [
    getConsistencyEngineClassificationText(input.classification),
    getConsistencyEngineClassificationInterpretation(input.classification),
  ];

  if (
    input.bootstrapExplorerAnalysis &&
    input.bootstrapExplorerAnalysis.stabilityScore >= 85
  ) {
    interpretation.push(
      "La estabilidad observada respalda la consistencia global."
    );
  }

  if (
    input.sensitivityExplorerAnalysis &&
    input.sensitivityExplorerAnalysis.sensitivityScore >= 85
  ) {
    interpretation.push(
      "La robustez observada favorece la confiabilidad de las conclusiones."
    );
  }

  if (
    input.tsneExplorerAnalysis &&
    input.tsneExplorerAnalysis.clusterTendency === "strong" &&
    input.umapExplorerAnalysis &&
    input.umapExplorerAnalysis.manifoldQuality === "excellent"
  ) {
    interpretation.push(
      "Las representaciones espaciales muestran patrones coherentes."
    );
  }

  return deduplicateTextLines(interpretation);
};

export const buildConsistencyEngineAnalysis = (
  input: ConsistencyEngineBuildInput
): ConsistencyEngineAnalysis | null => {
  if (!hasConsistencyEngineInput(input)) {
    return null;
  }

  const supportingModules: string[] = [];
  let score = 0;
  let totalEvaluatedModules = 0;

  if (input.pcaAnalysis) {
    totalEvaluatedModules += 1;
    if (input.pcaAnalysis.cumulativeVariance >= 80) {
      score += 1;
      supportingModules.push("PCA");
    }
  }

  if (input.hierarchicalClusteringAnalysis) {
    totalEvaluatedModules += 1;
    score += 1;
    supportingModules.push("Clustering");
  }

  if (input.mdsAnalysis) {
    totalEvaluatedModules += 1;
    if (input.mdsAnalysis.stress < 0.1) {
      score += 1;
      supportingModules.push("MDS");
    }
  }

  if (input.similarityNetworkAnalysis) {
    totalEvaluatedModules += 1;
    if (input.similarityNetworkAnalysis.averageSimilarity >= 0.75) {
      score += 1;
      supportingModules.push("Similarity");
    }
  }

  if (input.manovaExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.manovaExplorerAnalysis.separationScore >= 0.75) {
      score += 1;
      supportingModules.push("MANOVA");
    }
  }

  if (input.ldaExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.ldaExplorerAnalysis.discriminantScore >= 85) {
      score += 1;
      supportingModules.push("LDA");
    }
  }

  if (input.pcrExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.pcrExplorerAnalysis.predictiveScore >= 85) {
      score += 1;
      supportingModules.push("PCR");
    }
  }

  if (input.plsExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.plsExplorerAnalysis.explanatoryScore >= 85) {
      score += 1;
      supportingModules.push("PLS");
    }
  }

  if (input.bootstrapExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.bootstrapExplorerAnalysis.stabilityScore >= 85) {
      score += 1;
      supportingModules.push("Bootstrap");
    }
  }

  if (input.sensitivityExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.sensitivityExplorerAnalysis.sensitivityScore >= 85) {
      score += 1;
      supportingModules.push("Sensitivity");
    }
  }

  if (input.tsneExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.tsneExplorerAnalysis.clusterTendency === "strong") {
      score += 1;
      supportingModules.push("t-SNE");
    }
  }

  if (input.umapExplorerAnalysis) {
    totalEvaluatedModules += 1;
    if (input.umapExplorerAnalysis.manifoldQuality === "excellent") {
      score += 1;
      supportingModules.push("UMAP");
    }
  }

  const consistencyScore =
    totalEvaluatedModules > 0 ? (score / totalEvaluatedModules) * 100 : 0;
  const classification = classifyConsistencyEngine(consistencyScore);

  return {
    consistencyScore,
    classification,
    evidenceCount: score,
    supportingModules,
    interpretation: buildConsistencyEngineInterpretation({
      classification,
      bootstrapExplorerAnalysis: input.bootstrapExplorerAnalysis,
      sensitivityExplorerAnalysis: input.sensitivityExplorerAnalysis,
      tsneExplorerAnalysis: input.tsneExplorerAnalysis,
      umapExplorerAnalysis: input.umapExplorerAnalysis,
    }),
  };
};
