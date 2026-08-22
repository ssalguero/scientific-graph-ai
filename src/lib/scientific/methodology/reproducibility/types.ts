import type { CompositeMethodologyDisclosure } from "../disclosure";

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
  disclosure: CompositeMethodologyDisclosure;
};
