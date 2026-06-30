import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

import type { ScientificProjectV2 } from "./domain/types-v2";
import type { VisibilityKeyV1 } from "./keys";
import type {
  DatasetAnalysisProfileV1,
  PostHydrateAction,
  ProjectImportedDatasetInfo,
  ProjectMetadataV1,
  ProjectValidationIssue,
  ProjectWorkspaceV1,
} from "./types";

export type HydrateProjectV2Patch = {
  project: ScientificProjectV2;
  sessionDatasets: SessionDataset[];
  activeDatasetId: string;
  postHydrateActions: PostHydrateAction[];
  warnings: ProjectValidationIssue[];
};

export type EditorComparisonSlotApplyV2 = {
  id: "A" | "B";
  label: string;
  profile: DatasetAnalysisProfileV1 | null;
  sourceDatasetId: string | null;
};

export type EditorProjectApplyContextV2 = {
  setProjectMetadata: (value: ProjectMetadataV1) => void;
  setExperimentalSeries: (value: ExperimentalSeries[]) => void;
  setCurrentDatasetInfo: (value: ProjectImportedDatasetInfo | null) => void;
  setLastImportReport: (value: ImportReport | null) => void;
  setPreserveAnalysisConfiguration: (value: boolean) => void;
  setSessionDatasets: (value: SessionDataset[]) => void;
  setActiveDatasetId: (value: string) => void;
  setProjectVisualGraphs: (value: ProjectVisualGraphEntry[]) => void;
  setTitle: (value: string) => void;
  setCurves: (
    value: { id: number; expression: string; color: string }[]
  ) => void;
  setMinX: (value: number) => void;
  setMaxX: (value: number) => void;
  setVisibleMinX: (value: number) => void;
  setVisibleMaxX: (value: number) => void;
  setAutoScaleY: (value: boolean) => void;
  setUseSecondaryYAxis: (value: boolean) => void;
  setRegressionModel: (value: string) => void;
  setErrorBarMode: (value: string) => void;
  setCorrelationMethod: (value: string) => void;
  setOutlierMethod: (value: string) => void;
  setHeatmapMode: (value: string) => void;
  setNonParametricMode: (value: string) => void;
  setHistogramBins: (value: number) => void;
  setAxisScaleMode: (value: string) => void;
  setNaturalLanguageEnabled: (value: boolean) => void;
  setSelectedTTestSeriesA: (value: string | null) => void;
  setSelectedTTestSeriesB: (value: string | null) => void;
  setSelectedMannWhitneySeriesA: (value: string | null) => void;
  setSelectedMannWhitneySeriesB: (value: string | null) => void;
  setHiddenLegendKeys: (value: string[]) => void;
  setGuidedWorkflowSession: (value: GuidedWorkflowSession) => void;
  setComparisonSlots: (value: {
    A: EditorComparisonSlotApplyV2;
    B: EditorComparisonSlotApplyV2;
  }) => void;
  setActiveWorkspaceSection: (value: ProjectWorkspaceV1["activeSection"]) => void;
  setAnalysisInspectorSection: (
    value: ProjectWorkspaceV1["inspectorSection"]
  ) => void;
  setEnabledModules: (value: Record<string, boolean>) => void;
  setControlPanelTab: (value: "graph" | "library" | "data") => void;
  visibilitySetters: Partial<Record<VisibilityKeyV1, (value: boolean) => void>>;
  clearEphemeralUiState: () => void;
  assignNextCurveIds: (count: number) => void;
  generateGraph: (
    curveSource?: { id: number; expression: string; color: string }[]
  ) => void;
};
