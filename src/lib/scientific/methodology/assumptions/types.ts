export type AssumptionTrackerItemStatus =
  | "satisfied"
  | "partially-satisfied"
  | "questionable"
  | "not-evaluated";

export type AssumptionTrackerItem = {
  name: string;
  status: AssumptionTrackerItemStatus;
  source: string;
};

export type AssumptionTrackerClassification =
  | "excellent"
  | "good"
  | "moderate"
  | "limited";

export type AssumptionTrackerAnalysis = {
  overallScore: number;
  classification: AssumptionTrackerClassification;
  assumptions: AssumptionTrackerItem[];
  interpretation: string[];
};
