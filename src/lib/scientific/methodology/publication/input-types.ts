import type { EffectSizePowerAnalysis } from "@/lib/scientific/inference";
import type { CanonicalNormalityAssessment } from "@/lib/scientific/normality";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { MethodologicalDashboardAnalysis } from "@/lib/scientific/methodology/summary";
import type { PublicationReadinessAnalyzerAnalysis } from "@/lib/scientific/methodology/readiness";

export type PublicationDashboardAdvisorConfidence = "high" | "medium" | "low";

export type PublicationDashboardMultivariateSource = {
  summaryCards: {
    pcaVariance?: number;
    clusterCount?: number;
    mdsStress?: number;
    topVariable?: string;
    topVariableScore?: number;
    topVariableTied?: string[];
    averageSimilarity?: number;
  };
  diagnosis: string[];
};

export type PublicationDashboardStatisticalRecommendationSource = {
  recommendedTest: string;
  confidence: PublicationDashboardAdvisorConfidence;
  reasoning: string[];
  assumptionsPassed: string[];
  assumptionsFailed: string[];
  warnings: string[];
};

export type PublicationDashboardCanBuildInput = {
  publicationReadinessAnalyzerAnalysis: PublicationReadinessAnalyzerAnalysis | null;
  methodologicalDashboardAnalysis: MethodologicalDashboardAnalysis | null;
  multivariateDashboardAnalysis: PublicationDashboardMultivariateSource | null;
  effectSizePowerAnalysis: EffectSizePowerAnalysis | null;
  canonicalNormalityAssessment: CanonicalNormalityAssessment;
};

export type PublicationDashboardBuildInput = {
  publicationReadinessAnalyzerAnalysis: PublicationReadinessAnalyzerAnalysis | null;
  methodologicalDashboardAnalysis: MethodologicalDashboardAnalysis | null;
  multivariateDashboardAnalysis: PublicationDashboardMultivariateSource | null;
  evidenceStrengthEngineAnalysis: EvidenceStrengthEngineAnalysis | null;
  effectSizePowerAnalysis: EffectSizePowerAnalysis | null;
  canonicalNormalityAssessment: CanonicalNormalityAssessment;
  statisticalRecommendation: PublicationDashboardStatisticalRecommendationSource | null;
};
