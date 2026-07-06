export type ReportQualityEngineClassification =
  | "excellent"
  | "good"
  | "acceptable"
  | "limited";

export type ReportQualityEngineAnalysis = {
  qualityScore: number;
  classification: ReportQualityEngineClassification;
  evaluatedCriteria: number;
  interpretation: string[];
};
