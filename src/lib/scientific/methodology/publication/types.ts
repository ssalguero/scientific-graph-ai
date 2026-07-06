import type { EffectMagnitude } from "@/lib/scientific/inference";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { PublicationReadinessAnalyzerAnalysis } from "@/lib/scientific/methodology/readiness";

import type { PublicationDashboardAdvisorConfidence } from "./input-types";

export type PublicationDashboardNormalitySummary = {
  seriesEvaluated: number;
  normalCount: number;
  nonNormalCount: number;
  questionableCount: number;
  contradictoryCount: number;
  globalHeadline: string;
  hasWarnings: boolean;
};

export type PublicationDashboardMultivariateHighlights = {
  pcaVariance?: number;
  clusterCount?: number;
  topVariable?: string;
  topVariableTied?: string[];
  averageSimilarity?: number;
  headline?: string;
};

export type PublicationDashboardInferentialHighlight = {
  dominantMagnitude?: EffectMagnitude;
  metric?: string;
  valueDisplay?: string;
  source?: string;
  prospectiveSampleSize?: number;
  currentSampleSize?: number;
  insufficientSampleWarning?: string | null;
};

export type PublicationDashboardAnalysis = {
  publicationStatus: PublicationReadinessAnalyzerAnalysis["classification"];
  publicationScore: number;
  methodologicalHealthScore?: number;
  evidenceScore?: number;
  evidenceClassification?: EvidenceStrengthEngineAnalysis["classification"];
  normalitySummary?: PublicationDashboardNormalitySummary;
  multivariateHighlights?: PublicationDashboardMultivariateHighlights;
  inferentialHighlight?: PublicationDashboardInferentialHighlight;
  recommendedTest?: string;
  advisorConfidence?: PublicationDashboardAdvisorConfidence;
  crossDomainDiagnosis: string[];
  publicationRisks: string[];
  publicationRecommendations: string[];
  evaluatedDomains: number;
};
