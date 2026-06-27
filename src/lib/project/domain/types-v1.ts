import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type { ComparisonDatasetInfo } from "@/lib/scientific/comparison/input-types";
import type {
  ComparisonSlotId,
  DatasetAnalysisProfileInferentialSnapshot,
  DatasetAnalysisProfileNormalitySnapshot,
} from "@/lib/scientific/comparison/types";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";

/** PROD-2A / schema v1 — canonical domain shapes (mirror of legacy project contract). */
export const DOMAIN_SCHEMA_VERSION_V1 = 1 as const;

export type DomainSchemaVersionV1 = typeof DOMAIN_SCHEMA_VERSION_V1;

export type ProjectImportedDatasetInfoV1 = ComparisonDatasetInfo;

export type ProjectDatasetV1 = {
  series: ExperimentalSeries[];
  info: ProjectImportedDatasetInfoV1 | null;
  checksum?: string | null;
};

export type ProjectImportProvenanceV1 = {
  report: ImportReport | null;
  preserveAnalysisOnReimport: boolean;
};

export type ProjectAnalysisModesV1 = {
  regressionModel: string;
  errorBarMode: string;
  correlationMethod: string;
  outlierMethod: string;
  heatmapMode: string;
  nonParametricMode: string;
  histogramBins: number;
  axisScaleMode: string;
  naturalLanguageEnabled: boolean;
};

export type ProjectAnalysisSelectionsV1 = {
  tTestSeriesA: string | null;
  tTestSeriesB: string | null;
  mannWhitneySeriesA: string | null;
  mannWhitneySeriesB: string | null;
};

export type ProjectAnalysisConfigV1 = {
  visibility: Partial<Record<string, boolean>>;
  modes: ProjectAnalysisModesV1;
  selections: ProjectAnalysisSelectionsV1;
  legend: {
    hiddenKeys: string[];
  };
};

export type ProjectWorkflowV1 = {
  session: GuidedWorkflowSession;
};

export type ComparisonSlotIdV1 = ComparisonSlotId;

export type DatasetAnalysisProfileNormalitySnapshotV1 =
  DatasetAnalysisProfileNormalitySnapshot;

/** Persisted inferential snapshot uses string magnitude for JSON tolerance. */
export type DatasetAnalysisProfileInferentialSnapshotV1 = Omit<
  DatasetAnalysisProfileInferentialSnapshot,
  "dominantMagnitude"
> & {
  dominantMagnitude?: string;
};

export type DatasetAnalysisProfileV1 = {
  slotLabel: ComparisonSlotIdV1;
  datasetInfo: ProjectImportedDatasetInfoV1;
  capturedAt: string;
  seriesCount: number;
  totalObservations: number;
  readinessScore?: number;
  readinessClassification?: string;
  overallHealthScore?: number;
  evidenceScore?: number;
  evidenceClassification?: string;
  publicationStatus?: string;
  publicationScore?: number;
  normality?: DatasetAnalysisProfileNormalitySnapshotV1;
  inferential?: DatasetAnalysisProfileInferentialSnapshotV1;
  multivariateHeadline?: string;
  isComplete: boolean;
};

export type ComparisonSlotV1 = {
  label: string;
  profile: DatasetAnalysisProfileV1 | null;
};

export type ProjectComparisonV1 = {
  slots: Record<ComparisonSlotIdV1, ComparisonSlotV1>;
};

export type ProjectWorkspaceV1 = {
  activeSection: "data" | "analysis" | "results" | "reports";
  inspectorSection:
    | "visualization"
    | "mathematics"
    | "statistics"
    | "inference"
    | "advisor";
  enabledModules: Record<string, boolean>;
  controlPanelTab?: "graph" | "library" | "data";
};

export type ProjectGraphContextV1 = {
  title: string;
  curves: { expression: string; color: string }[];
  minX: number;
  maxX: number;
  visibleMinX: number;
  visibleMaxX: number;
  autoScaleY: boolean;
  useSecondaryYAxis: boolean;
};

export type ProjectMetadataV1 = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
};

/** Scientific project domain model — schema v1 (mono-dataset). */
export type ScientificProjectV1 = {
  metadata: ProjectMetadataV1;
  dataset: ProjectDatasetV1;
  importProvenance: ProjectImportProvenanceV1;
  analysisConfig: ProjectAnalysisConfigV1;
  workflow: ProjectWorkflowV1;
  comparison: ProjectComparisonV1;
  workspace: ProjectWorkspaceV1;
  graphContext: ProjectGraphContextV1 | null;
};
