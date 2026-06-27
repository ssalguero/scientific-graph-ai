import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import type { ImportAuxiliaryColumn, ImportReport } from "@/lib/import/types";
import type {
  DatasetAnalysisProfileCaptureEngineFlags,
  DatasetAnalysisProfileCaptureMetadata,
  DatasetAnalysisProfileMethodologicalSnapshot,
  DatasetAnalysisProfileMultivariateSnapshot,
  DatasetAnalysisProfilePublicationSnapshot,
} from "@/lib/scientific/comparison/types";
import type { GraphSpecification } from "@/lib/visualGraphBuilder";

import type {
  ComparisonSlotIdV1,
  DatasetAnalysisProfileInferentialSnapshotV1,
  DatasetAnalysisProfileNormalitySnapshotV1,
  ProjectAnalysisConfigV1,
  ProjectGraphContextV1,
  ProjectImportedDatasetInfoV1,
  ProjectMetadataV1,
  ProjectWorkflowV1,
  ProjectWorkspaceV1,
} from "./types-v1";

/** PROD-2B / schema v2 — additive evolution of the v1 domain contract. */
export const DOMAIN_SCHEMA_VERSION_V2 = 2 as const;

export type DomainSchemaVersionV2 = typeof DOMAIN_SCHEMA_VERSION_V2;

export type ProjectMetadataV2 = ProjectMetadataV1 & {
  revisionHistory?: Array<{
    exportedAt: string;
    schemaVersion: number;
    checksum?: string | null;
  }>;
  cloudRef?: {
    remoteId: string;
    lastSyncedAt: string;
  };
};

export type ProjectWorksheetV2 = {
  columnRegistry?: WorksheetColumnRegistry;
  auxiliaryColumns?: ImportAuxiliaryColumn[];
  modified: boolean;
};

export type ProjectDatasetV2 = {
  id: string;
  label: string;
  series: ExperimentalSeries[];
  info: ProjectImportedDatasetInfoV1 | null;
  importReport: ImportReport | null;
  preserveAnalysisOnReimport?: boolean;
  worksheet?: ProjectWorksheetV2;
  checksum?: string | null;
};

export type DatasetAnalysisProfileMethodologicalSnapshotV2 =
  DatasetAnalysisProfileMethodologicalSnapshot;

export type DatasetAnalysisProfileMultivariateSnapshotV2 =
  DatasetAnalysisProfileMultivariateSnapshot;

export type DatasetAnalysisProfilePublicationSnapshotV2 =
  DatasetAnalysisProfilePublicationSnapshot;

export type DatasetAnalysisProfileCaptureEngineFlagsV2 =
  DatasetAnalysisProfileCaptureEngineFlags;

export type DatasetAnalysisProfileCaptureMetadataV2 =
  DatasetAnalysisProfileCaptureMetadata;

export type DatasetAnalysisProfileV2 = {
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
  methodological?: DatasetAnalysisProfileMethodologicalSnapshotV2;
  multivariate?: DatasetAnalysisProfileMultivariateSnapshotV2;
  publication?: DatasetAnalysisProfilePublicationSnapshotV2;
  captureMetadata?: DatasetAnalysisProfileCaptureMetadataV2;
  isComplete: boolean;
};

export type ComparisonSlotV2 = {
  label: string;
  profile: DatasetAnalysisProfileV2 | null;
  sourceDatasetId: string | null;
};

export type ProjectComparisonV2 = {
  slots: Record<ComparisonSlotIdV1, ComparisonSlotV2>;
};

/** Persisted VGB entry — spec + binding only (no preview cache). */
export type ProjectVisualGraphPersistedV2 = {
  id: string;
  graphSpec: GraphSpecification;
  sourceDatasetId: string;
  createdAt: string;
};

export type ProjectAnalysisConfigV2 = ProjectAnalysisConfigV1;

/** Scientific project domain model — schema v2 (multi-dataset). */
export type ScientificProjectV2 = {
  metadata: ProjectMetadataV2;
  datasets: ProjectDatasetV2[];
  activeDatasetId: string;
  analysisConfig: ProjectAnalysisConfigV2;
  workflow: ProjectWorkflowV1;
  comparison: ProjectComparisonV2;
  workspace: ProjectWorkspaceV1;
  graphContext: ProjectGraphContextV1 | null;
  visualGraphs?: ProjectVisualGraphPersistedV2[];
  extensions?: Record<string, unknown>;
};
