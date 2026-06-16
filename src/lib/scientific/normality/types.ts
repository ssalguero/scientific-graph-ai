import type { NormalityClassification } from "./input-types";

export type NormalityConfidence = "high" | "medium" | "low";

export type CanonicalNormalityConclusion =
  | "normal"
  | "probably-normal"
  | "questionable"
  | "contradictory"
  | "non-normal";

export type NormalityConsensus = {
  seriesName: string;
  conclusion: CanonicalNormalityConclusion;
  confidence: NormalityConfidence;
  reasons: string[];
  sourceSummary: string[];
};

export type CanonicalNormalityAssessment = {
  seriesAssessments: NormalityConsensus[];
  globalConclusion: string[];
  warnings: string[];
};

export type { NormalityClassification };
