export type EvidenceStrengthEngineClassification =
  | "very-strong"
  | "strong"
  | "moderate"
  | "limited";

export type EvidenceStrengthEngineAnalysis = {
  evidenceScore: number;
  classification: EvidenceStrengthEngineClassification;
  evidenceSources: number;
  interpretation: string[];
};
