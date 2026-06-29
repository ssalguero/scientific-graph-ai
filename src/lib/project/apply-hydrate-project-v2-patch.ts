import type { ExperimentalSeries } from "@/lib/experimentalData";
import { projectDatasetV2ToSessionDataset } from "@/lib/project/adapters/sgproj/map-session-dataset";
import type {
  EditorProjectApplyContextV2,
  HydrateProjectV2Patch,
} from "@/lib/project/editor-hydrate-context-v2";
import {
  preservePersistedDatasetId,
} from "@/lib/project/domain";
import type { ProjectDatasetV2, ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { VISIBILITY_KEYS_V1, type VisibilityKeyV1 } from "@/lib/project/keys";
import type {
  PostHydrateAction,
  ProjectGraphContextV1,
  ProjectValidationIssue,
} from "@/lib/project/types";
import { createSessionDatasetInfo } from "@/lib/sessionDatasetRegistry";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";

const cloneSeries = (series: ExperimentalSeries[]): ExperimentalSeries[] =>
  series.map((item) => ({
    ...item,
    points: item.points.map((point) => ({ ...point })),
  }));

const cloneDataset = (dataset: ProjectDatasetV2): ProjectDatasetV2 => ({
  ...dataset,
  series: cloneSeries(dataset.series),
  info: dataset.info ? { ...dataset.info } : null,
  importReport: dataset.importReport ? { ...dataset.importReport } : null,
  worksheet: dataset.worksheet
    ? {
        modified: dataset.worksheet.modified,
        columnRegistry: dataset.worksheet.columnRegistry
          ? { ...dataset.worksheet.columnRegistry }
          : undefined,
        auxiliaryColumns: dataset.worksheet.auxiliaryColumns
          ? dataset.worksheet.auxiliaryColumns.map((item) => ({
              ...item,
              valuesByRowIndex: { ...item.valuesByRowIndex },
            }))
          : undefined,
      }
    : undefined,
});

export const cloneScientificProjectV2 = (
  project: ScientificProjectV2
): ScientificProjectV2 => ({
  metadata: { ...project.metadata },
  datasets: project.datasets.map(cloneDataset),
  activeDatasetId: project.activeDatasetId,
  analysisConfig: {
    visibility: { ...project.analysisConfig.visibility },
    modes: { ...project.analysisConfig.modes },
    selections: { ...project.analysisConfig.selections },
    legend: {
      hiddenKeys: [...project.analysisConfig.legend.hiddenKeys],
    },
  },
  workflow: {
    session: {
      ...project.workflow.session,
      completedStepIds: [...project.workflow.session.completedStepIds],
      skippedStepIds: [...project.workflow.session.skippedStepIds],
    },
  },
  comparison: {
    slots: {
      A: {
        label: project.comparison.slots.A.label,
        profile: project.comparison.slots.A.profile,
        sourceDatasetId: project.comparison.slots.A.sourceDatasetId,
      },
      B: {
        label: project.comparison.slots.B.label,
        profile: project.comparison.slots.B.profile,
        sourceDatasetId: project.comparison.slots.B.sourceDatasetId,
      },
    },
  },
  workspace: { ...project.workspace },
  graphContext: project.graphContext
    ? {
        ...project.graphContext,
        curves: project.graphContext.curves.map((curve) => ({ ...curve })),
      }
    : null,
  visualGraphs: project.visualGraphs
    ? project.visualGraphs.map((entry) => ({
        ...entry,
        graphSpec: { ...entry.graphSpec },
      }))
    : undefined,
  extensions: project.extensions ? { ...project.extensions } : undefined,
});

const resolvePostHydrateActions = (
  project: ScientificProjectV2
): PostHydrateAction[] => {
  const actions: PostHydrateAction[] = [];
  const hasGraphCurves =
    project.graphContext?.curves.some((curve) => curve.expression.trim()) ?? false;
  if (hasGraphCurves) {
    actions.push("generateGraph");
  }
  return actions;
};

const resolveActiveDataset = (
  project: ScientificProjectV2
): ProjectDatasetV2 => {
  const activeId = preservePersistedDatasetId(project.activeDatasetId);
  const active = project.datasets.find((dataset) => dataset.id === activeId);
  if (active) {
    return active;
  }

  if (project.datasets.length === 0) {
    throw new Error("HydrateProjectV2Patch requires at least one dataset.");
  }

  return project.datasets[0]!;
};

const cloneSessionDatasets = (datasets: SessionDataset[]): SessionDataset[] =>
  datasets.map((dataset) => ({
    ...dataset,
    datasetPayload: {
      ...dataset.datasetPayload,
      series: cloneSeries(dataset.datasetPayload.series),
      importReport: dataset.datasetPayload.importReport
        ? { ...dataset.datasetPayload.importReport }
        : null,
      columnRegistry: dataset.datasetPayload.columnRegistry
        ? { ...dataset.datasetPayload.columnRegistry }
        : undefined,
      auxiliaryColumns: dataset.datasetPayload.auxiliaryColumns
        ? dataset.datasetPayload.auxiliaryColumns.map((item) => ({
            ...item,
            valuesByRowIndex: { ...item.valuesByRowIndex },
          }))
        : undefined,
    },
  }));

/**
 * Builds a V2 hydrate patch from a validated native V2 project (no migration).
 */
export const buildHydrateProjectV2Patch = (
  project: ScientificProjectV2,
  options?: {
    warnings?: ProjectValidationIssue[];
    postHydrateActions?: PostHydrateAction[];
  }
): HydrateProjectV2Patch => {
  const clonedProject = cloneScientificProjectV2(project);
  const activeDataset = resolveActiveDataset(clonedProject);
  const activeDatasetId = preservePersistedDatasetId(activeDataset.id);
  const sessionDatasets = cloneSessionDatasets(
    clonedProject.datasets.map(projectDatasetV2ToSessionDataset)
  );

  return {
    project: clonedProject,
    sessionDatasets,
    activeDatasetId,
    postHydrateActions:
      options?.postHydrateActions ?? resolvePostHydrateActions(clonedProject),
    warnings: options?.warnings ?? [],
  };
};

const applyVisibility = (
  visibility: Partial<Record<VisibilityKeyV1, boolean>>,
  setters: EditorProjectApplyContextV2["visibilitySetters"]
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
  apply: EditorProjectApplyContextV2
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

const loadActiveDatasetIntoEditor = (
  patch: HydrateProjectV2Patch,
  apply: EditorProjectApplyContextV2
) => {
  const activeSession = patch.sessionDatasets.find(
    (dataset) => dataset.id === patch.activeDatasetId
  );
  if (!activeSession) {
    throw new Error(
      `Active dataset "${patch.activeDatasetId}" is missing from sessionDatasets.`
    );
  }

  const activePersisted = patch.project.datasets.find(
    (dataset) => dataset.id === patch.activeDatasetId
  );

  apply.setExperimentalSeries(cloneSeries(activeSession.datasetPayload.series));
  apply.setCurrentDatasetInfo(createSessionDatasetInfo(activeSession));
  apply.setLastImportReport(activeSession.datasetPayload.importReport);
  apply.setPreserveAnalysisConfiguration(
    activePersisted?.preserveAnalysisOnReimport ?? false
  );
};

/**
 * Applies a native V2 hydrate patch to runtime editor state (no migration).
 */
export const applyHydrateProjectV2Patch = (
  patch: HydrateProjectV2Patch,
  apply: EditorProjectApplyContextV2
) => {
  const { project } = patch;

  apply.clearEphemeralUiState();

  apply.setProjectMetadata({ ...project.metadata });
  apply.setSessionDatasets(cloneSessionDatasets(patch.sessionDatasets));
  apply.setActiveDatasetId(patch.activeDatasetId);
  loadActiveDatasetIntoEditor(patch, apply);

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
      sourceDatasetId: project.comparison.slots.A.sourceDatasetId,
    },
    B: {
      id: "B",
      label: project.comparison.slots.B.label,
      profile: project.comparison.slots.B.profile,
      sourceDatasetId: project.comparison.slots.B.sourceDatasetId,
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
