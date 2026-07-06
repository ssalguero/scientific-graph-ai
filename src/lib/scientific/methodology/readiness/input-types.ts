import type { AssumptionTrackerAnalysis } from "@/lib/scientific/methodology/assumptions";
import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "@/lib/scientific/methodology/reproducibility";

import type { PublicationReadinessAnalyzerClassification } from "./types";

export type PublicationReadinessAnalyzerBuildInput = {
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  reproducibilityExplorerAnalysis: ReproducibilityExplorerAnalysis | null;
  evidenceStrengthEngineAnalysis: EvidenceStrengthEngineAnalysis | null;
  assumptionTrackerAnalysis: AssumptionTrackerAnalysis | null;
};

export type PublicationReadinessAnalyzerInterpretationInput = {
  classification: PublicationReadinessAnalyzerClassification;
  consistencyScore: number;
  qualityScore: number;
  reproducibilityScore: number;
  evidenceScore: number;
  assumptionScore: number;
};
