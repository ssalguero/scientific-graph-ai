import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import { deduplicateTextLines } from "@/lib/scientific/shared";

import type {
  ReportQualityBootstrapExplorerInput,
  ReportQualityEngineBuildInput,
  ReportQualityEngineInterpretationInput,
  ReportQualityExperimentalStatisticsInput,
  ReportQualityNormalityAnalysisInput,
  ReportQualityNormalityConsensusInput,
} from "./input-types";
import { getReportQualityEngineClassificationText } from "./labels";
import type { ReportQualityEngineAnalysis } from "./types";

export const hasReportQualityEngineInput = (input: {
  experimentalStatistics: ReportQualityEngineBuildInput["experimentalStatistics"];
  normalityAnalyses: ReportQualityEngineBuildInput["normalityAnalyses"];
  normalityConsensus: ReportQualityEngineBuildInput["normalityConsensus"];
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  bootstrapExplorerAnalysis: ReportQualityBootstrapExplorerInput | null;
}) =>
  input.experimentalStatistics.length > 0 ||
  input.normalityAnalyses.length > 0 ||
  input.normalityConsensus.length > 0 ||
  input.consistencyEngineAnalysis !== null ||
  input.bootstrapExplorerAnalysis !== null;

const getReportQualitySampleSizeScore = (
  experimentalStatistics: ReportQualityExperimentalStatisticsInput[]
) => {
  if (experimentalStatistics.length === 0) return null;

  const averageSampleSize =
    experimentalStatistics.reduce((sum, stats) => sum + stats.count, 0) /
    experimentalStatistics.length;

  if (averageSampleSize >= 30) return 1;
  if (averageSampleSize >= 15) return 0.75;
  if (averageSampleSize >= 10) return 0.5;
  return 0;
};

const getReportQualityNormalityScoreFromAnalyses = (
  normalityAnalyses: ReportQualityNormalityAnalysisInput[]
) => {
  if (normalityAnalyses.length === 0) return null;

  const allNormalOrProbablyNormal = normalityAnalyses.every(
    (analysis) =>
      analysis.classification === "normal" ||
      analysis.classification === "approximately-normal"
  );
  const hasQuestionable = normalityAnalyses.some(
    (analysis) => analysis.classification === null
  );

  if (allNormalOrProbablyNormal) return 1;
  if (hasQuestionable) return 0.5;
  return 0;
};

const getReportQualityNormalityScore = (
  normalityConsensus: ReportQualityNormalityConsensusInput[],
  normalityAnalyses: ReportQualityNormalityAnalysisInput[]
) => {
  if (normalityConsensus.length > 0) {
    const allNormalOrProbablyNormal = normalityConsensus.every(
      (consensus) =>
        consensus.conclusion === "normal" ||
        consensus.conclusion === "probably-normal"
    );
    const hasQuestionableOrContradictory = normalityConsensus.some(
      (consensus) =>
        consensus.conclusion === "questionable" ||
        consensus.conclusion === "contradictory"
    );

    if (allNormalOrProbablyNormal) return 1;
    if (hasQuestionableOrContradictory) return 0.5;
    return 0;
  }

  return getReportQualityNormalityScoreFromAnalyses(normalityAnalyses);
};

const getReportQualityInferenceScore = (input: {
  anovaAnalysis: ReportQualityEngineBuildInput["anovaAnalysis"];
  mannWhitneyResult: ReportQualityEngineBuildInput["mannWhitneyResult"];
  kruskalWallisResult: ReportQualityEngineBuildInput["kruskalWallisResult"];
}) => {
  if (
    input.anovaAnalysis ||
    input.mannWhitneyResult ||
    input.kruskalWallisResult
  ) {
    return 1;
  }
  return null;
};

const getReportQualityBootstrapScore = (
  bootstrapExplorerAnalysis: ReportQualityBootstrapExplorerInput | null
) => {
  if (!bootstrapExplorerAnalysis) return null;
  return bootstrapExplorerAnalysis.stabilityScore >= 70 ? 1 : 0;
};

const getReportQualityConsistencyScore = (
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null
) => {
  if (!consistencyEngineAnalysis) return null;
  if (consistencyEngineAnalysis.consistencyScore >= 85) return 1;
  if (consistencyEngineAnalysis.consistencyScore >= 70) return 0.75;
  return 0;
};

const classifyReportQualityEngine = (
  qualityScore: number
): ReportQualityEngineAnalysis["classification"] => {
  if (qualityScore >= 85) return "excellent";
  if (qualityScore >= 70) return "good";
  if (qualityScore >= 50) return "acceptable";
  return "limited";
};

export const hasReportQualityEngineExcellent = (
  analysis: ReportQualityEngineAnalysis | null
) => analysis !== null && analysis.qualityScore >= 85;

export const hasReportQualityEngineLimited = (
  analysis: ReportQualityEngineAnalysis | null
) => analysis !== null && analysis.classification === "limited";

const buildReportQualityEngineInterpretation = (
  input: ReportQualityEngineInterpretationInput
): string[] => {
  const interpretation: string[] = [
    getReportQualityEngineClassificationText(input.classification),
  ];

  if (
    input.bootstrapExplorerAnalysis &&
    input.bootstrapExplorerAnalysis.stabilityScore >= 70
  ) {
    interpretation.push("Los resultados muestran estabilidad adecuada.");
  }

  if (
    input.consistencyEngineAnalysis &&
    input.consistencyEngineAnalysis.consistencyScore >= 85
  ) {
    interpretation.push(
      "La evidencia científica presenta alta coherencia interna."
    );
  }

  if (input.hasInferentialTests) {
    interpretation.push(
      "Las conclusiones se encuentran respaldadas por análisis inferenciales."
    );
  }

  return deduplicateTextLines(interpretation);
};

export const buildReportQualityEngineAnalysis = (
  input: ReportQualityEngineBuildInput
): ReportQualityEngineAnalysis | null => {
  if (!hasReportQualityEngineInput(input)) {
    return null;
  }

  let score = 0;
  let criteriaEvaluated = 0;

  const sampleSizeScore = getReportQualitySampleSizeScore(
    input.experimentalStatistics
  );
  if (sampleSizeScore !== null) {
    criteriaEvaluated += 1;
    score += sampleSizeScore;
  }

  const normalityScore = getReportQualityNormalityScore(
    input.normalityConsensus,
    input.normalityAnalyses
  );
  if (normalityScore !== null) {
    criteriaEvaluated += 1;
    score += normalityScore;
  }

  const inferenceScore = getReportQualityInferenceScore({
    anovaAnalysis: input.anovaAnalysis,
    mannWhitneyResult: input.mannWhitneyResult,
    kruskalWallisResult: input.kruskalWallisResult,
  });
  const hasInferentialTests = inferenceScore !== null;
  if (inferenceScore !== null) {
    criteriaEvaluated += 1;
    score += inferenceScore;
  }

  const bootstrapScore = getReportQualityBootstrapScore(
    input.bootstrapExplorerAnalysis
  );
  if (bootstrapScore !== null) {
    criteriaEvaluated += 1;
    score += bootstrapScore;
  }

  const consistencyScore = getReportQualityConsistencyScore(
    input.consistencyEngineAnalysis
  );
  if (consistencyScore !== null) {
    criteriaEvaluated += 1;
    score += consistencyScore;
  }

  const qualityScore =
    criteriaEvaluated > 0 ? (score / criteriaEvaluated) * 100 : 0;
  const classification = classifyReportQualityEngine(qualityScore);

  return {
    qualityScore,
    classification,
    evaluatedCriteria: criteriaEvaluated,
    interpretation: buildReportQualityEngineInterpretation({
      classification,
      bootstrapExplorerAnalysis: input.bootstrapExplorerAnalysis,
      consistencyEngineAnalysis: input.consistencyEngineAnalysis,
      hasInferentialTests,
    }),
  };
};
