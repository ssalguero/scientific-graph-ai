export type ReproducibilityExplorerClassification =
  | "very-high"
  | "high"
  | "moderate"
  | "low";

export type ReproducibilityExplorerAnalysis = {
  reproducibilityScore: number;
  classification: ReproducibilityExplorerClassification;
  evaluatedFactors: number;
  interpretation: string[];
};
