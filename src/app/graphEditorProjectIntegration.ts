import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";
import type { ProjectImportedDatasetInfo, ProjectMetadataV1 } from "@/lib/project";
import type { ComparisonSlotId } from "@/lib/scientific/comparison";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";

import {
  resetEditorVisibility,
  type EditorVisibilityBindings,
} from "./editorVisibilityBindings";
import { createProjectFileActions } from "./projectFileActions";
import {
  applyHydrateProjectPatch,
  collectProjectSnapshot,
  createInitialProjectMetadata,
  pickVisibilitySetters,
  pickVisibilityState,
  type EditorComparisonSlots,
  type EditorProjectApplyContext,
  type EditorProjectReadContext,
} from "./projectPersistence";

type Curve = {
  id: number;
  expression: string;
  color: string;
};

type EditorRuntimeComparisonSlot = {
  id: ComparisonSlotId;
  label: string;
  profile: EditorComparisonSlots["A"]["profile"];
};

type WorkspaceSection = EditorProjectReadContext["workspace"]["activeSection"];
type AnalysisInspectorSection =
  EditorProjectReadContext["workspace"]["inspectorSection"];

export type GraphEditorProjectIntegrationInput = {
  projectMetadata: ProjectMetadataV1;
  setProjectMetadata: (value: ProjectMetadataV1) => void;
  isProjectDirty: boolean;
  setIsProjectDirty: (value: boolean) => void;
  setProjectFileFeedback: (value: import("./projectFileActions").ProjectFileFeedback | null) => void;
  suppressProjectDirtyRef: { current: boolean };
  visibilityBindings: EditorVisibilityBindings;
  experimentalSeries: ExperimentalSeries[];
  setExperimentalSeries: (value: ExperimentalSeries[]) => void;
  currentDatasetInfo: ProjectImportedDatasetInfo | null;
  setCurrentDatasetInfo: (value: ProjectImportedDatasetInfo | null) => void;
  lastImportReport: ImportReport | null;
  setLastImportReport: (value: ImportReport | null) => void;
  preserveAnalysisConfiguration: boolean;
  setPreserveAnalysisConfiguration: (value: boolean) => void;
  title: string;
  setTitle: (value: string) => void;
  curves: Curve[];
  setCurves: (value: Curve[]) => void;
  minX: number;
  setMinX: (value: number) => void;
  maxX: number;
  setMaxX: (value: number) => void;
  visibleMinX: number;
  setVisibleMinX: (value: number) => void;
  visibleMaxX: number;
  setVisibleMaxX: (value: number) => void;
  autoScaleY: boolean;
  setAutoScaleY: (value: boolean) => void;
  useSecondaryYAxis: boolean;
  setUseSecondaryYAxis: (value: boolean) => void;
  regressionModel: string;
  setRegressionModel: (value: string) => void;
  errorBarMode: string;
  setErrorBarMode: (value: string) => void;
  correlationMethod: string;
  setCorrelationMethod: (value: string) => void;
  outlierMethod: string;
  setOutlierMethod: (value: string) => void;
  heatmapMode: string;
  setHeatmapMode: (value: string) => void;
  nonParametricMode: string;
  setNonParametricMode: (value: string) => void;
  histogramBins: number;
  setHistogramBins: (value: number) => void;
  axisScaleMode: string;
  setAxisScaleMode: (value: string) => void;
  naturalLanguageEnabled: boolean;
  setNaturalLanguageEnabled: (value: boolean) => void;
  selectedTTestSeriesA: string | null;
  setSelectedTTestSeriesA: (value: string | null) => void;
  selectedTTestSeriesB: string | null;
  setSelectedTTestSeriesB: (value: string | null) => void;
  selectedMannWhitneySeriesA: string | null;
  setSelectedMannWhitneySeriesA: (value: string | null) => void;
  selectedMannWhitneySeriesB: string | null;
  setSelectedMannWhitneySeriesB: (value: string | null) => void;
  hiddenLegendKeys: string[];
  setHiddenLegendKeys: (value: string[]) => void;
  guidedWorkflowSession: GuidedWorkflowSession;
  setGuidedWorkflowSession: (value: GuidedWorkflowSession) => void;
  comparisonSlots: Record<ComparisonSlotId, EditorRuntimeComparisonSlot>;
  setComparisonSlots: (
    value: Record<ComparisonSlotId, EditorRuntimeComparisonSlot>
  ) => void;
  activeWorkspaceSection: WorkspaceSection;
  setActiveWorkspaceSection: (value: WorkspaceSection) => void;
  analysisInspectorSection: AnalysisInspectorSection;
  setAnalysisInspectorSection: (value: AnalysisInspectorSection) => void;
  enabledModules: Record<string, boolean>;
  setEnabledModules: (value: Record<string, boolean>) => void;
  controlPanelTab: "graph" | "library" | "data";
  setControlPanelTab: (value: "graph" | "library" | "data") => void;
  nextCurveIdRef: { current: number };
  generateGraph: (curveSource?: { id: number; expression: string; color: string }[]) => void;
  resetAnalysisSession: () => void;
  resetToSingleCurve: (expr: string) => void;
  createEmptyComparisonSlots: () => Record<
    ComparisonSlotId,
    EditorRuntimeComparisonSlot
  >;
  createDefaultEnabledModules: () => Record<string, boolean>;
  clearEphemeralUiState: () => void;
};

export const createGraphEditorProjectIntegration = (
  input: GraphEditorProjectIntegrationInput
) => {
  const buildReadContext = (): EditorProjectReadContext => ({
    metadata: input.projectMetadata,
    experimentalSeries: input.experimentalSeries,
    currentDatasetInfo: input.currentDatasetInfo,
    lastImportReport: input.lastImportReport,
    preserveAnalysisConfiguration: input.preserveAnalysisConfiguration,
    visibility: pickVisibilityState(input.visibilityBindings.state),
    modes: {
      regressionModel: input.regressionModel,
      errorBarMode: input.errorBarMode,
      correlationMethod: input.correlationMethod,
      outlierMethod: input.outlierMethod,
      heatmapMode: input.heatmapMode,
      nonParametricMode: input.nonParametricMode,
      histogramBins: input.histogramBins,
      axisScaleMode: input.axisScaleMode,
      naturalLanguageEnabled: input.naturalLanguageEnabled,
    },
    selections: {
      tTestSeriesA: input.selectedTTestSeriesA,
      tTestSeriesB: input.selectedTTestSeriesB,
      mannWhitneySeriesA: input.selectedMannWhitneySeriesA,
      mannWhitneySeriesB: input.selectedMannWhitneySeriesB,
    },
    hiddenLegendKeys: input.hiddenLegendKeys,
    guidedWorkflowSession: input.guidedWorkflowSession,
    comparisonSlots: {
      A: {
        label: input.comparisonSlots.A.label,
        profile: input.comparisonSlots.A.profile,
      },
      B: {
        label: input.comparisonSlots.B.label,
        profile: input.comparisonSlots.B.profile,
      },
    },
    workspace: {
      activeSection: input.activeWorkspaceSection,
      inspectorSection: input.analysisInspectorSection,
      enabledModules: { ...input.enabledModules },
      controlPanelTab: input.controlPanelTab,
    },
    title: input.title,
    minX: input.minX,
    maxX: input.maxX,
    visibleMinX: input.visibleMinX,
    visibleMaxX: input.visibleMaxX,
    autoScaleY: input.autoScaleY,
    useSecondaryYAxis: input.useSecondaryYAxis,
    curves: input.curves.map(({ expression, color }) => ({ expression, color })),
  });

  const buildApplyContext = (): EditorProjectApplyContext => ({
    setProjectMetadata: input.setProjectMetadata,
    setExperimentalSeries: input.setExperimentalSeries,
    setCurrentDatasetInfo: input.setCurrentDatasetInfo,
    setLastImportReport: input.setLastImportReport,
    setPreserveAnalysisConfiguration: input.setPreserveAnalysisConfiguration,
    setTitle: input.setTitle,
    setCurves: input.setCurves,
    setMinX: input.setMinX,
    setMaxX: input.setMaxX,
    setVisibleMinX: input.setVisibleMinX,
    setVisibleMaxX: input.setVisibleMaxX,
    setAutoScaleY: input.setAutoScaleY,
    setUseSecondaryYAxis: input.setUseSecondaryYAxis,
    setRegressionModel: (value) =>
      input.setRegressionModel(
        value as Parameters<typeof input.setRegressionModel>[0]
      ),
    setErrorBarMode: (value) =>
      input.setErrorBarMode(value as Parameters<typeof input.setErrorBarMode>[0]),
    setCorrelationMethod: (value) =>
      input.setCorrelationMethod(
        value as Parameters<typeof input.setCorrelationMethod>[0]
      ),
    setOutlierMethod: (value) =>
      input.setOutlierMethod(value as Parameters<typeof input.setOutlierMethod>[0]),
    setHeatmapMode: (value) =>
      input.setHeatmapMode(value as Parameters<typeof input.setHeatmapMode>[0]),
    setNonParametricMode: (value) =>
      input.setNonParametricMode(
        value as Parameters<typeof input.setNonParametricMode>[0]
      ),
    setHistogramBins: input.setHistogramBins,
    setAxisScaleMode: (value) =>
      input.setAxisScaleMode(value as Parameters<typeof input.setAxisScaleMode>[0]),
    setNaturalLanguageEnabled: input.setNaturalLanguageEnabled,
    setSelectedTTestSeriesA: input.setSelectedTTestSeriesA,
    setSelectedTTestSeriesB: input.setSelectedTTestSeriesB,
    setSelectedMannWhitneySeriesA: input.setSelectedMannWhitneySeriesA,
    setSelectedMannWhitneySeriesB: input.setSelectedMannWhitneySeriesB,
    setHiddenLegendKeys: input.setHiddenLegendKeys,
    setGuidedWorkflowSession: input.setGuidedWorkflowSession,
    setComparisonSlots: (value) =>
      input.setComparisonSlots(
        value as Parameters<typeof input.setComparisonSlots>[0]
      ),
    setActiveWorkspaceSection: (value) =>
      input.setActiveWorkspaceSection(
        value as Parameters<typeof input.setActiveWorkspaceSection>[0]
      ),
    setAnalysisInspectorSection: (value) =>
      input.setAnalysisInspectorSection(
        value as Parameters<typeof input.setAnalysisInspectorSection>[0]
      ),
    setEnabledModules: input.setEnabledModules,
    setControlPanelTab: input.setControlPanelTab,
    visibilitySetters: pickVisibilitySetters(input.visibilityBindings.setters),
    clearEphemeralUiState: input.clearEphemeralUiState,
    assignNextCurveIds: (count: number) => {
      input.nextCurveIdRef.current = count;
    },
    generateGraph: input.generateGraph,
  });

  const resetScientificProject = () => {
    input.clearEphemeralUiState();
    input.resetAnalysisSession();
    resetEditorVisibility(input.visibilityBindings.setters);
    input.setExperimentalSeries([]);
    input.setCurrentDatasetInfo(null);
    input.setLastImportReport(null);
    input.setPreserveAnalysisConfiguration(false);
    input.setComparisonSlots(input.createEmptyComparisonSlots());
    input.setGuidedWorkflowSession(GUIDED_WORKFLOW_IDLE_SESSION);
    input.setTitle("");
    input.resetToSingleCurve("");
    input.setMinX(-10);
    input.setMaxX(10);
    input.setVisibleMinX(-10);
    input.setVisibleMaxX(10);
    input.setAutoScaleY(false);
    input.setUseSecondaryYAxis(false);
    input.setHiddenLegendKeys([]);
    input.setActiveWorkspaceSection("data");
    input.setAnalysisInspectorSection("visualization");
    input.setEnabledModules(input.createDefaultEnabledModules());
    input.setControlPanelTab("graph");
    input.setProjectMetadata(createInitialProjectMetadata());
    input.suppressProjectDirtyRef.current = true;
    input.setIsProjectDirty(false);
    input.setProjectFileFeedback(null);
  };

  return {
    buildReadContext,
    ...createProjectFileActions({
      projectMetadata: input.projectMetadata,
      setProjectMetadata: input.setProjectMetadata,
      setIsProjectDirty: input.setIsProjectDirty,
      setProjectFileFeedback: input.setProjectFileFeedback,
      suppressProjectDirtyRef: input.suppressProjectDirtyRef,
      buildReadContext,
      buildApplyContext,
      resetScientificProject,
    }),
  };
};

export { buildEditorVisibilityBindings } from "./editorVisibilityBindings";
