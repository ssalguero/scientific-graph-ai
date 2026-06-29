import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type {
  GuidedWorkflowSession,
  GuidedWorkflowTemplateId,
} from "@/lib/scientific/workflow/types";
import type {
  ComparisonDatasetInfo,
} from "@/lib/scientific/comparison/input-types";
import type {
  ComparisonSlotId,
  DatasetAnalysisProfileInferentialSnapshot,
  DatasetAnalysisProfileNormalitySnapshot,
} from "@/lib/scientific/comparison/types";
import type { SCHEMA_VERSION_V1, SCHEMA_VERSION_V2 } from "./constants";
import type { ScientificProjectV2 } from "./domain/types-v2";
import type { HydrateProjectV2Patch } from "./editor-hydrate-context-v2";

export type ProjectSchemaVersion =
  | typeof SCHEMA_VERSION_V1
  | typeof SCHEMA_VERSION_V2;

export type { ScientificProjectV2 } from "./domain/types-v2";

export type ProjectImportedDatasetInfo = ComparisonDatasetInfo;

export type ProjectDataset = {
  series: ExperimentalSeries[];
  info: ProjectImportedDatasetInfo | null;
  checksum?: string | null;
};

export type ProjectImportProvenance = {
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

// Comparison V1 reuses runtime contracts only where the persisted JSON shape is
// identical. The V1 profile remains the disk boundary for legacy tolerance.
export type ComparisonSlotIdV1 = ComparisonSlotId;

export type DatasetAnalysisProfileNormalitySnapshotV1 =
  DatasetAnalysisProfileNormalitySnapshot;

export type DatasetAnalysisProfileInferentialSnapshotV1 = Omit<
  DatasetAnalysisProfileInferentialSnapshot,
  "dominantMagnitude"
> & {
  dominantMagnitude?: string;
};

/** SCI-58 KPI snapshot — not full comparison analysis or series. */
export type DatasetAnalysisProfileV1 = {
  slotLabel: ComparisonSlotIdV1;
  datasetInfo: ProjectImportedDatasetInfo;
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

export type ScientificProjectV1 = {
  metadata: ProjectMetadataV1;
  dataset: ProjectDataset;
  importProvenance: ProjectImportProvenance;
  analysisConfig: ProjectAnalysisConfigV1;
  workflow: ProjectWorkflowV1;
  comparison: ProjectComparisonV1;
  workspace: ProjectWorkspaceV1;
  graphContext: ProjectGraphContextV1 | null;
};

export type ScientificProjectFileV1 = {
  kind: "scientific-graph-ai.project";
  schemaVersion: typeof SCHEMA_VERSION_V1;
  appVersion: string;
  exportedAt: string;
  project: ScientificProjectV1;
};

export type ScientificProjectFileV2 = {
  kind: "scientific-graph-ai.project";
  schemaVersion: typeof SCHEMA_VERSION_V2;
  appVersion: string;
  exportedAt: string;
  project: ScientificProjectV2;
};

export type ScientificProjectFile =
  | ScientificProjectFileV1
  | ScientificProjectFileV2;

/** Runtime snapshot collected from GraphEditor — F4 boundary input. */
export type GraphEditorProjectSnapshot = ScientificProjectV1;

export type {
  EditorProjectCollectContextV2,
  GraphEditorProjectSnapshotV2,
} from "./editor-collect-context-v2";

export {
  applyHydrateProjectV2Patch,
  buildHydrateProjectV2Patch,
  cloneScientificProjectV2,
} from "./apply-hydrate-project-v2-patch";

export {
  collectProjectSnapshotV2,
  prepareSessionDatasetsForCollect,
} from "./collect-project-snapshot-v2";

export type ProjectValidationIssue = {
  code: string;
  path: string;
  message: string;
  severity: "error" | "warning";
};

export type ProjectValidationResult = {
  ok: boolean;
  errors: ProjectValidationIssue[];
  warnings: ProjectValidationIssue[];
};

export type ParseProjectFileResult =
  | { ok: true; file: ScientificProjectFile; warnings: ProjectValidationIssue[] }
  | { ok: false; errors: ProjectValidationIssue[] };

export type MigrateProjectFileResult =
  | { ok: true; file: ScientificProjectFile; warnings: ProjectValidationIssue[] }
  | { ok: false; errors: ProjectValidationIssue[] };

export type SerializeProjectOptions = {
  pretty?: boolean;
  includeChecksum?: boolean;
};

export type SerializeProjectInput = {
  snapshot: GraphEditorProjectSnapshot;
  appVersion: string;
  exportedAt?: string;
  options?: SerializeProjectOptions;
};

export type SerializeProjectV2Input = {
  project: ScientificProjectV2;
  appVersion: string;
  exportedAt?: string;
  options?: SerializeProjectOptions;
};

export type SerializeProjectResult =
  | {
      ok: true;
      file: ScientificProjectFile;
      json: string;
      warnings: ProjectValidationIssue[];
    }
  | {
      ok: false;
      errors: ProjectValidationIssue[];
      warnings: ProjectValidationIssue[];
    };

export type PostHydrateAction = "generateGraph";

export type HydrateProjectPatch = {
  project: ScientificProjectV1;
  postHydrateActions: PostHydrateAction[];
  warnings: ProjectValidationIssue[];
};

export type {
  EditorComparisonSlotApplyV2,
  EditorProjectApplyContextV2,
  HydrateProjectV2Patch,
} from "./editor-hydrate-context-v2";

export type HydrateProjectResult =
  | { ok: true; patch: HydrateProjectV2Patch }
  | { ok: false; errors: ProjectValidationIssue[]; warnings: ProjectValidationIssue[] };

export const GUIDED_WORKFLOW_TEMPLATE_IDS: GuidedWorkflowTemplateId[] = [
  "compare-groups",
  "explore-structure",
  "evaluate-publication",
];

export const GUIDED_WORKFLOW_STATUS_VALUES = [
  "idle",
  "active",
  "completed",
  "cancelled",
] as const;
