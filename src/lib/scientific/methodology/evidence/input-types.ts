import type { ConsistencyEngineAnalysis } from "@/lib/scientific/methodology/consistency";
import type { ReportQualityEngineAnalysis } from "@/lib/scientific/methodology/report-quality";
import type { ReproducibilityExplorerAnalysis } from "@/lib/scientific/methodology/reproducibility";

import type { EvidenceStrengthEngineClassification } from "./types";

// Sync with page.tsx upstream analysis types (structural typing only).

export type EvidenceEffectMagnitude = "trivial" | "small" | "medium" | "large";

export type EvidenceBootstrapExplorerInput = {
  stabilityScore: number;
};

export type EvidenceEffectSizePowerInput = {
  dominantMagnitude: EvidenceEffectMagnitude;
  insufficientSampleWarning: string | null;
};

export type EvidenceAnovaInput = object;

export type EvidenceMannWhitneyInput = object;

export type EvidenceKruskalWallisInput = object;

export type EvidenceStrengthEngineBuildInput = {
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  reproducibilityExplorerAnalysis: ReproducibilityExplorerAnalysis | null;
  bootstrapExplorerAnalysis: EvidenceBootstrapExplorerInput | null;
  effectSizePowerAnalysis: EvidenceEffectSizePowerInput | null;
  anovaAnalysis: EvidenceAnovaInput | null;
  mannWhitneyResult: EvidenceMannWhitneyInput | null;
  kruskalWallisResult: EvidenceKruskalWallisInput | null;
};

export type EvidenceStrengthEngineInterpretationInput = {
  classification: EvidenceStrengthEngineClassification;
  consistencyEngineAnalysis: ConsistencyEngineAnalysis | null;
  reportQualityEngineAnalysis: ReportQualityEngineAnalysis | null;
  reproducibilityExplorerAnalysis: ReproducibilityExplorerAnalysis | null;
  bootstrapExplorerAnalysis: EvidenceBootstrapExplorerInput | null;
  hasInferentialTests: boolean;
};
