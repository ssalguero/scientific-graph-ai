import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportAuxiliaryColumn, ImportReport } from "@/lib/import/types";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

import type { VisibilityKeyV1 } from "./keys";
import type {
  DatasetAnalysisProfileV1,
  ProjectAnalysisModesV1,
  ProjectAnalysisSelectionsV1,
  ProjectImportedDatasetInfo,
  ProjectMetadataV1,
  ProjectWorkspaceV1,
} from "./types";
import type { ScientificProjectV2 } from "./domain/types-v2";

export type EditorComparisonProfileV2Collect = DatasetAnalysisProfileV1;

export type EditorComparisonSlotCollect = {
  label: string;
  profile: EditorComparisonProfileV2Collect | null;
  sourceDatasetId?: string | null;
};

export type EditorVisibilityCollectState = Partial<
  Record<VisibilityKeyV1, boolean>
>;

/** Runtime read model for native V2 snapshot collection (B2.3). */
export type EditorProjectCollectContextV2 = {
  metadata: ProjectMetadataV1;
  experimentalSeries: ExperimentalSeries[];
  currentDatasetInfo: ProjectImportedDatasetInfo | null;
  lastImportReport: ImportReport | null;
  preserveAnalysisConfiguration: boolean;
  visibility: EditorVisibilityCollectState;
  modes: ProjectAnalysisModesV1;
  selections: ProjectAnalysisSelectionsV1;
  hiddenLegendKeys: string[];
  guidedWorkflowSession: GuidedWorkflowSession;
  comparisonSlots: {
    A: EditorComparisonSlotCollect;
    B: EditorComparisonSlotCollect;
  };
  workspace: ProjectWorkspaceV1;
  title: string;
  minX: number;
  maxX: number;
  visibleMinX: number;
  visibleMaxX: number;
  autoScaleY: boolean;
  useSecondaryYAxis: boolean;
  curves: { expression: string; color: string }[];
  sessionDatasets: readonly SessionDataset[];
  activeDatasetId: string | null;
  worksheetModified?: boolean;
  activeColumnRegistry?: WorksheetColumnRegistry;
  activeAuxiliaryColumns?: ImportAuxiliaryColumn[];
  projectVisualGraphEntries?: readonly ProjectVisualGraphEntry[];
};

export type GraphEditorProjectSnapshotV2 = ScientificProjectV2;
