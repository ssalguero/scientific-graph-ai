export type PublicationReadinessAnalyzerClassification =
  | "publication-ready"
  | "near-ready"
  | "requires-review"
  | "not-ready";

export type PublicationReadinessAnalyzerAnalysis = {
  readinessScore: number;
  classification: PublicationReadinessAnalyzerClassification;
  evaluatedAreas: number;
  interpretation: string[];
};
