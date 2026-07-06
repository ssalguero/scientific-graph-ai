import type { AssumptionTrackerAnalysis } from "@/lib/scientific/methodology/assumptions";
import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "@/lib/scientific/methodology/reproducibility";
import type { PublicationReadinessAnalyzerAnalysis } from "@/lib/scientific/methodology/readiness";

export type MethodologicalDashboardAnalysis = {
  summaryCards: {
    consistencyScore?: number;
    consistencyClassification?: ConsistencyEngineAnalysis["classification"];
    qualityScore?: number;
    qualityClassification?: ReportQualityEngineAnalysis["classification"];
    reproducibilityScore?: number;
    reproducibilityClassification?: ReproducibilityExplorerAnalysis["classification"];
    evidenceScore?: number;
    evidenceClassification?: EvidenceStrengthEngineAnalysis["classification"];
    assumptionScore?: number;
    assumptionClassification?: AssumptionTrackerAnalysis["classification"];
    readinessScore?: number;
    readinessClassification?: PublicationReadinessAnalyzerAnalysis["classification"];
  };
  overallHealthScore: number;
  evaluatedEngines: number;
  diagnosis: string[];
};
