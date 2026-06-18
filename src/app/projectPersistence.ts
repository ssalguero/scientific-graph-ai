import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type { GuidedWorkflowSession } from "@/lib/scientific/workflow/types";
import {
  DEFAULT_PROJECT_NAME,
  PROJECT_FILE_EXTENSION,
  type GraphEditorProjectSnapshot,
  type HydrateProjectPatch,
  type ProjectAnalysisModesV1,
  type ProjectAnalysisSelectionsV1,
  type ProjectGraphContextV1,
  type ProjectImportedDatasetInfo,
  type ProjectMetadataV1,
  type ProjectWorkspaceV1,
  type VisibilityKeyV1,
  type DatasetAnalysisProfileV1,
} from "@/lib/project";
import { VISIBILITY_KEYS_V1 } from "@/lib/project/keys";

export type EditorComparisonProfile = DatasetAnalysisProfileV1;

export type EditorComparisonSlots = {
  A: { label: string; profile: EditorComparisonProfile | null };
  B: { label: string; profile: EditorComparisonProfile | null };
};

export type EditorVisibilityState = Partial<Record<VisibilityKeyV1, boolean>>;

export type EditorProjectReadContext = {
  metadata: ProjectMetadataV1;
  experimentalSeries: ExperimentalSeries[];
  currentDatasetInfo: ProjectImportedDatasetInfo | null;
  lastImportReport: ImportReport | null;
  preserveAnalysisConfiguration: boolean;
  visibility: EditorVisibilityState;
  modes: ProjectAnalysisModesV1;
  selections: ProjectAnalysisSelectionsV1;
  hiddenLegendKeys: string[];
  guidedWorkflowSession: GuidedWorkflowSession;
  comparisonSlots: EditorComparisonSlots;
  workspace: ProjectWorkspaceV1;
  title: string;
  minX: number;
  maxX: number;
  visibleMinX: number;
  visibleMaxX: number;
  autoScaleY: boolean;
  useSecondaryYAxis: boolean;
  curves: { expression: string; color: string }[];
};

export type EditorVisibilitySetters = Partial<
  Record<VisibilityKeyV1, (value: boolean) => void>
>;

export type EditorProjectApplyContext = {
  setProjectMetadata: (value: ProjectMetadataV1) => void;
  setExperimentalSeries: (value: ExperimentalSeries[]) => void;
  setCurrentDatasetInfo: (value: ProjectImportedDatasetInfo | null) => void;
  setLastImportReport: (value: ImportReport | null) => void;
  setPreserveAnalysisConfiguration: (value: boolean) => void;
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
    A: { id: "A"; label: string; profile: EditorComparisonProfile | null };
    B: { id: "B"; label: string; profile: EditorComparisonProfile | null };
  }) => void;
  setActiveWorkspaceSection: (value: ProjectWorkspaceV1["activeSection"]) => void;
  setAnalysisInspectorSection: (
    value: ProjectWorkspaceV1["inspectorSection"]
  ) => void;
  setEnabledModules: (value: Record<string, boolean>) => void;
  setControlPanelTab: (value: "graph" | "library" | "data") => void;
  visibilitySetters: EditorVisibilitySetters;
  clearEphemeralUiState: () => void;
  assignNextCurveIds: (count: number) => void;
  generateGraph: (
    curveSource?: { id: number; expression: string; color: string }[]
  ) => void;
};

export const createInitialProjectMetadata = (): ProjectMetadataV1 => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: DEFAULT_PROJECT_NAME,
    createdAt: now,
    updatedAt: now,
  };
};

export const sanitizeProjectFileName = (name: string): string => {
  const trimmed = name.trim() || DEFAULT_PROJECT_NAME;
  const safe = trimmed
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return `${safe}${PROJECT_FILE_EXTENSION}`;
};

export const pickVisibilityState = (
  source: Record<string, boolean>
): EditorVisibilityState => {
  const visibility: EditorVisibilityState = {};
  for (const key of VISIBILITY_KEYS_V1) {
    if (typeof source[key] === "boolean") {
      visibility[key] = source[key];
    }
  }
  return visibility;
};

export const pickVisibilitySetters = (
  source: Record<string, ((value: boolean) => void) | undefined>
): EditorVisibilitySetters => {
  const setters: EditorVisibilitySetters = {};
  for (const key of VISIBILITY_KEYS_V1) {
    const setter = source[key];
    if (setter) {
      setters[key] = setter;
    }
  }
  return setters;
};

const buildGraphContext = (
  ctx: EditorProjectReadContext
): ProjectGraphContextV1 | null => {
  const hasCurves = ctx.curves.some((curve) => curve.expression.trim().length > 0);
  const hasTitle = ctx.title.trim().length > 0;
  if (!hasCurves && !hasTitle) {
    return null;
  }

  return {
    title: ctx.title,
    curves: ctx.curves.map((curve) => ({
      expression: curve.expression,
      color: curve.color,
    })),
    minX: ctx.minX,
    maxX: ctx.maxX,
    visibleMinX: ctx.visibleMinX,
    visibleMaxX: ctx.visibleMaxX,
    autoScaleY: ctx.autoScaleY,
    useSecondaryYAxis: ctx.useSecondaryYAxis,
  };
};

export const collectProjectSnapshot = (
  ctx: EditorProjectReadContext
): GraphEditorProjectSnapshot => ({
  metadata: { ...ctx.metadata },
  dataset: {
    series: ctx.experimentalSeries.map((series) => ({
      id: series.id,
      name: series.name,
      color: series.color,
      points: series.points.map((point) => ({ x: point.x, y: point.y })),
    })),
    info: ctx.currentDatasetInfo,
  },
  importProvenance: {
    report: ctx.lastImportReport,
    preserveAnalysisOnReimport: ctx.preserveAnalysisConfiguration,
  },
  analysisConfig: {
    visibility: { ...ctx.visibility },
    modes: { ...ctx.modes },
    selections: { ...ctx.selections },
    legend: { hiddenKeys: [...ctx.hiddenLegendKeys] },
  },
  workflow: {
    session: { ...ctx.guidedWorkflowSession },
  },
  comparison: {
    slots: {
      A: {
        label: ctx.comparisonSlots.A.label,
        profile: ctx.comparisonSlots.A.profile,
      },
      B: {
        label: ctx.comparisonSlots.B.label,
        profile: ctx.comparisonSlots.B.profile,
      },
    },
  },
  workspace: { ...ctx.workspace },
  graphContext: buildGraphContext(ctx),
});

const applyVisibility = (
  visibility: Partial<Record<VisibilityKeyV1, boolean>>,
  setters: EditorVisibilitySetters
) => {
  for (const key of VISIBILITY_KEYS_V1) {
    const setter = setters[key];
    if (!setter) continue;
    if (typeof visibility[key] === "boolean") {
      setter(visibility[key]!);
    } else {
      setter(false);
    }
  }
};

const applyGraphContext = (
  graphContext: ProjectGraphContextV1 | null,
  apply: EditorProjectApplyContext
) => {
  if (!graphContext) {
    apply.setTitle("");
    apply.assignNextCurveIds(1);
    apply.setCurves([{ id: 1, expression: "", color: "#3b82f6" }]);
    apply.setMinX(-10);
    apply.setMaxX(10);
    apply.setVisibleMinX(-10);
    apply.setVisibleMaxX(10);
    apply.setAutoScaleY(false);
    apply.setUseSecondaryYAxis(false);
    return;
  }

  apply.setTitle(graphContext.title);
  const nextCurves = graphContext.curves.map((curve, index) => ({
    id: index + 1,
    expression: curve.expression,
    color: curve.color || "#3b82f6",
  }));
  apply.assignNextCurveIds(Math.max(nextCurves.length + 1, 2));
  apply.setCurves(
    nextCurves.length > 0
      ? nextCurves
      : [{ id: 1, expression: "", color: "#3b82f6" }]
  );
  apply.setMinX(graphContext.minX);
  apply.setMaxX(graphContext.maxX);
  apply.setVisibleMinX(graphContext.visibleMinX);
  apply.setVisibleMaxX(graphContext.visibleMaxX);
  apply.setAutoScaleY(graphContext.autoScaleY);
  apply.setUseSecondaryYAxis(graphContext.useSecondaryYAxis);
};

export const applyHydrateProjectPatch = (
  patch: HydrateProjectPatch,
  apply: EditorProjectApplyContext
) => {
  const { project } = patch;

  apply.clearEphemeralUiState();

  apply.setProjectMetadata({ ...project.metadata });
  apply.setExperimentalSeries(
    project.dataset.series.map((series) => ({
      id: series.id,
      name: series.name,
      color: series.color,
      points: series.points.map((point) => ({ x: point.x, y: point.y })),
    }))
  );
  apply.setCurrentDatasetInfo(project.dataset.info);
  apply.setLastImportReport(project.importProvenance.report);
  apply.setPreserveAnalysisConfiguration(
    project.importProvenance.preserveAnalysisOnReimport
  );

  applyGraphContext(project.graphContext, apply);

  const { modes } = project.analysisConfig;
  apply.setRegressionModel(modes.regressionModel);
  apply.setErrorBarMode(modes.errorBarMode);
  apply.setCorrelationMethod(modes.correlationMethod);
  apply.setOutlierMethod(modes.outlierMethod);
  apply.setHeatmapMode(modes.heatmapMode);
  apply.setNonParametricMode(modes.nonParametricMode);
  apply.setHistogramBins(modes.histogramBins);
  apply.setAxisScaleMode(modes.axisScaleMode);
  apply.setNaturalLanguageEnabled(modes.naturalLanguageEnabled);

  applyVisibility(project.analysisConfig.visibility, apply.visibilitySetters);
  apply.setHiddenLegendKeys([...project.analysisConfig.legend.hiddenKeys]);

  apply.setSelectedTTestSeriesA(project.analysisConfig.selections.tTestSeriesA);
  apply.setSelectedTTestSeriesB(project.analysisConfig.selections.tTestSeriesB);
  apply.setSelectedMannWhitneySeriesA(
    project.analysisConfig.selections.mannWhitneySeriesA
  );
  apply.setSelectedMannWhitneySeriesB(
    project.analysisConfig.selections.mannWhitneySeriesB
  );

  apply.setComparisonSlots({
    A: {
      id: "A",
      label: project.comparison.slots.A.label,
      profile: project.comparison.slots.A.profile,
    },
    B: {
      id: "B",
      label: project.comparison.slots.B.label,
      profile: project.comparison.slots.B.profile,
    },
  });
  apply.setGuidedWorkflowSession({ ...project.workflow.session });

  apply.setActiveWorkspaceSection(project.workspace.activeSection);
  apply.setAnalysisInspectorSection(project.workspace.inspectorSection);
  apply.setEnabledModules({ ...project.workspace.enabledModules });
  if (project.workspace.controlPanelTab) {
    apply.setControlPanelTab(project.workspace.controlPanelTab);
  }

  if (patch.postHydrateActions.includes("generateGraph")) {
    const curveSource =
      project.graphContext?.curves.map((curve, index) => ({
        id: index + 1,
        expression: curve.expression,
        color: curve.color || "#3b82f6",
      })) ?? undefined;
    apply.generateGraph(curveSource);
  }
};
