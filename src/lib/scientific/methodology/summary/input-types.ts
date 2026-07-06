import type { AssumptionTrackerAnalysis } from "@/lib/scientific/methodology/assumptions";
import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { EvidenceStrengthEngineAnalysis } from "@/lib/scientific/methodology/evidence";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "@/lib/scientific/methodology/reproducibility";
import type { PublicationReadinessAnalyzerAnalysis } from "@/lib/scientific/methodology/readiness";

export type MethodologicalDashboardBuildInput = {
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  reproducibilityExplorerAnalysis: ReproducibilityExplorerAnalysis | null;
  evidenceStrengthEngineAnalysis: EvidenceStrengthEngineAnalysis | null;
  assumptionTrackerAnalysis: AssumptionTrackerAnalysis | null;
  publicationReadinessAnalyzerAnalysis: PublicationReadinessAnalyzerAnalysis | null;
};
