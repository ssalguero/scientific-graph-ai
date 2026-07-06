import { deduplicateTextLines } from "@/lib/scientific/shared";

import type {
  AssumptionTrackerBuildInput,
  AssumptionsIndependenceAnalysisInput,
  AssumptionsKernelDensityAnalysisInput,
  AssumptionsNormalityConsensusInput,
  AssumptionsQQPlotAnalysisInput,
  AssumptionsVarianceHomogeneityAnalysisInput,
  AssumptionsViolinPlotAnalysisInput,
} from "./input-types";
import { getAssumptionTrackerClassificationText } from "./labels";
import type {
  AssumptionTrackerAnalysis,
  AssumptionTrackerItem,
  AssumptionTrackerItemStatus,
} from "./types";

export const hasAssumptionTrackerInput = (input: {
  normalityAnalyses: AssumptionTrackerBuildInput["normalityAnalyses"];
  qqPlotAnalyses: AssumptionTrackerBuildInput["qqPlotAnalyses"];
  violinPlotAnalyses: AssumptionTrackerBuildInput["violinPlotAnalyses"];
  kernelDensityAnalyses: AssumptionTrackerBuildInput["kernelDensityAnalyses"];
}) =>
  input.normalityAnalyses.length > 0 ||
  input.qqPlotAnalyses.length > 0 ||
  input.violinPlotAnalyses.length > 0 ||
  input.kernelDensityAnalyses.length > 0;

const ASSUMPTION_TRACKER_STATUS_SCORES: Record<
  AssumptionTrackerItemStatus,
  number
> = {
  satisfied: 100,
  "partially-satisfied": 75,
  questionable: 40,
  "not-evaluated": 50,
};

const getAssumptionTrackerStatusScore = (
  status: AssumptionTrackerItemStatus
) => ASSUMPTION_TRACKER_STATUS_SCORES[status];

const getAssumptionTrackerStatusFromAverageScore = (
  score: number
): AssumptionTrackerItemStatus => {
  if (score >= 87.5) return "satisfied";
  if (score >= 57.5) return "partially-satisfied";
  if (score >= 45) return "questionable";
  return "not-evaluated";
};

const classifyAssumptionTracker = (
  overallScore: number
): AssumptionTrackerAnalysis["classification"] => {
  if (overallScore >= 85) return "excellent";
  if (overallScore >= 70) return "good";
  if (overallScore >= 50) return "moderate";
  return "limited";
};

export const hasAssumptionTrackerExcellent = (
  analysis: AssumptionTrackerAnalysis | null
) => analysis !== null && analysis.overallScore >= 85;

export const hasAssumptionTrackerLimited = (
  analysis: AssumptionTrackerAnalysis | null
) => analysis !== null && analysis.classification === "limited";

const getNormalityAssumptionStatus = (
  consensusList: AssumptionsNormalityConsensusInput[]
): AssumptionTrackerItemStatus => {
  if (consensusList.length === 0) return "not-evaluated";

  const averageScore =
    consensusList.reduce((sum, consensus) => {
      if (consensus.conclusion === "normal") {
        return sum + ASSUMPTION_TRACKER_STATUS_SCORES.satisfied;
      }
      if (consensus.conclusion === "probably-normal") {
        return sum + ASSUMPTION_TRACKER_STATUS_SCORES["partially-satisfied"];
      }
      return sum + ASSUMPTION_TRACKER_STATUS_SCORES.questionable;
    }, 0) / consensusList.length;

  return getAssumptionTrackerStatusFromAverageScore(averageScore);
};

const getQQPlotAssumptionStatus = (
  qqPlotAnalyses: AssumptionsQQPlotAnalysisInput[]
): AssumptionTrackerItemStatus => {
  if (qqPlotAnalyses.length === 0) return "not-evaluated";

  const averageScore =
    qqPlotAnalyses.reduce((sum, analysis) => {
      if (
        analysis.interpretation === "excellent" ||
        analysis.interpretation === "good"
      ) {
        return sum + ASSUMPTION_TRACKER_STATUS_SCORES.satisfied;
      }
      if (analysis.interpretation === "moderate") {
        return sum + ASSUMPTION_TRACKER_STATUS_SCORES["partially-satisfied"];
      }
      return sum + ASSUMPTION_TRACKER_STATUS_SCORES.questionable;
    }, 0) / qqPlotAnalyses.length;

  return getAssumptionTrackerStatusFromAverageScore(averageScore);
};

const getSymmetryAssumptionStatus = (input: {
  violinPlotAnalyses: AssumptionsViolinPlotAnalysisInput[];
  kernelDensityAnalyses: AssumptionsKernelDensityAnalysisInput[];
}): AssumptionTrackerItemStatus => {
  const shapeScores: number[] = [];

  input.violinPlotAnalyses.forEach((analysis) => {
    shapeScores.push(
      analysis.shapeInterpretation === "symmetric"
        ? ASSUMPTION_TRACKER_STATUS_SCORES.satisfied
        : ASSUMPTION_TRACKER_STATUS_SCORES.questionable
    );
  });

  input.kernelDensityAnalyses.forEach((analysis) => {
    shapeScores.push(
      analysis.distributionShape === "symmetric"
        ? ASSUMPTION_TRACKER_STATUS_SCORES.satisfied
        : ASSUMPTION_TRACKER_STATUS_SCORES.questionable
    );
  });

  if (shapeScores.length === 0) return "not-evaluated";

  const averageScore =
    shapeScores.reduce((sum, score) => sum + score, 0) / shapeScores.length;
  return getAssumptionTrackerStatusFromAverageScore(averageScore);
};

const getHomogeneityAssumptionStatus = (
  varianceHomogeneityAnalysis: AssumptionsVarianceHomogeneityAnalysisInput | null
): AssumptionTrackerItemStatus => {
  if (!varianceHomogeneityAnalysis) return "not-evaluated";
  if (varianceHomogeneityAnalysis.classification === "homogeneous") {
    return "satisfied";
  }
  if (
    varianceHomogeneityAnalysis.classification === "approximately-homogeneous"
  ) {
    return "partially-satisfied";
  }
  return "questionable";
};

const getIndependenceAssumptionStatus = (
  independenceAnalysis: AssumptionsIndependenceAnalysisInput | null
): AssumptionTrackerItemStatus => {
  if (!independenceAnalysis) return "not-evaluated";
  return independenceAnalysis.status;
};

const buildAssumptionTrackerInterpretation = (input: {
  classification: AssumptionTrackerAnalysis["classification"];
  assumptions: AssumptionTrackerItem[];
}): string[] => {
  const interpretation: string[] = [
    getAssumptionTrackerClassificationText(input.classification),
  ];

  const normalityStatus = input.assumptions.find(
    (item) => item.name === "Normalidad"
  )?.status;
  const qqStatus = input.assumptions.find(
    (item) => item.name === "Q-Q Plot"
  )?.status;
  const homogeneityStatus = input.assumptions.find(
    (item) => item.name === "Homogeneidad"
  )?.status;
  const independenceStatus = input.assumptions.find(
    (item) => item.name === "Independencia"
  )?.status;

  if (normalityStatus === "satisfied") {
    interpretation.push(
      "La normalidad de los datos se encuentra razonablemente respaldada."
    );
  }

  if (qqStatus === "satisfied") {
    interpretation.push(
      "La evaluación gráfica respalda la distribución observada."
    );
  }

  if (homogeneityStatus === "questionable") {
    interpretation.push("La homogeneidad de varianza requiere atención.");
  }

  if (independenceStatus === "not-evaluated") {
    interpretation.push(
      "La independencia de las observaciones no fue evaluada explícitamente."
    );
  }

  return deduplicateTextLines(interpretation);
};

export const buildAssumptionTrackerAnalysis = (
  input: AssumptionTrackerBuildInput
): AssumptionTrackerAnalysis | null => {
  if (!hasAssumptionTrackerInput(input)) {
    return null;
  }

  const assumptions: AssumptionTrackerItem[] = [
    {
      name: "Normalidad",
      status: getNormalityAssumptionStatus(input.normalityConsensus),
      source: "SCI-11",
    },
    {
      name: "Q-Q Plot",
      status: getQQPlotAssumptionStatus(input.qqPlotAnalyses),
      source: "SCI-21",
    },
    {
      name: "Simetría",
      status: getSymmetryAssumptionStatus({
        violinPlotAnalyses: input.violinPlotAnalyses,
        kernelDensityAnalyses: input.kernelDensityAnalyses,
      }),
      source: "SCI-22/26",
    },
    {
      name: "Homogeneidad",
      status: getHomogeneityAssumptionStatus(input.varianceHomogeneityAnalysis),
      source: "SCI-13",
    },
    {
      name: "Independencia",
      status: getIndependenceAssumptionStatus(input.independenceAnalysis),
      source: "SCI-14",
    },
  ];

  const overallScore =
    assumptions.reduce(
      (sum, assumption) => sum + getAssumptionTrackerStatusScore(assumption.status),
      0
    ) / assumptions.length;
  const classification = classifyAssumptionTracker(overallScore);

  return {
    overallScore,
    classification,
    assumptions,
    interpretation: buildAssumptionTrackerInterpretation({
      classification,
      assumptions,
    }),
  };
};
