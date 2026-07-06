export type ConsistencyEngineClassification =
  | "very-strong"
  | "strong"
  | "moderate"
  | "weak";

export type ConsistencyEngineAnalysis = {
  consistencyScore: number;
  classification: ConsistencyEngineClassification;
  evidenceCount: number;
  supportingModules: string[];
  interpretation: string[];
};
