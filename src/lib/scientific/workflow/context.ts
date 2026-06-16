import type { CanonicalNormalityAssessment } from "@/lib/scientific/normality";

export type GuidedWorkflowContext = {
  seriesCount: number;
  totalObservations: number;
  canonicalNormalityAssessment: CanonicalNormalityAssessment;
  statisticalRecommendation?: unknown | null;
};
