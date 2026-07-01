import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { HydrateProjectV2Patch } from "@/lib/project/editor-hydrate-context-v2";
import { applyHydrateProjectV2Patch } from "@/lib/project/apply-hydrate-project-v2-patch";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";

const SAMPLE_SERIES: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }],
  },
];

const buildSessionDataset = (
  id: string,
  name: string,
  series: ExperimentalSeries[]
): SessionDataset => ({
  id,
  name,
  importedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: series.length,
  observationCount: series.reduce((total, item) => total + item.points.length, 0),
  worksheetModified: false,
  datasetPayload: {
    series,
    importReport: null,
  },
});

export const buildLocalProjectCollectContext = (
  projectId: string,
  projectName = "Local project test"
): EditorProjectCollectContextV2 => {
  const primaryId = toPrimaryDatasetId(projectId);
  const session = buildSessionDataset(primaryId, "Dataset.csv", SAMPLE_SERIES);

  return {
    metadata: {
      id: projectId,
      name: projectName,
      createdAt: "2026-06-17T10:00:00.000Z",
      updatedAt: "2026-06-17T12:00:00.000Z",
    },
    experimentalSeries: SAMPLE_SERIES,
    currentDatasetInfo: {
      fileName: "Dataset.csv",
      importedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: 1,
      observationCount: 1,
    },
    lastImportReport: null,
    preserveAnalysisConfiguration: true,
    visibility: {},
    modes: {
      regressionModel: "linear",
      errorBarMode: "sd",
      correlationMethod: "pearson",
      outlierMethod: "iqr",
      heatmapMode: "correlation",
      nonParametricMode: "mann-whitney",
      histogramBins: 10,
      axisScaleMode: "linear",
      naturalLanguageEnabled: false,
    },
    selections: {
      tTestSeriesA: null,
      tTestSeriesB: null,
      mannWhitneySeriesA: null,
      mannWhitneySeriesB: null,
    },
    hiddenLegendKeys: [],
    guidedWorkflowSession: GUIDED_WORKFLOW_IDLE_SESSION,
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
      B: { label: "Slot B", profile: null, sourceDatasetId: null },
    },
    workspace: {
      activeSection: "data",
      inspectorSection: "visualization",
      enabledModules: {},
      controlPanelTab: "data",
    },
    title: "",
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
    curves: [{ expression: "", color: "#3b82f6" }],
    sessionDatasets: [session],
    activeDatasetId: primaryId,
    worksheetModified: false,
  };
};

export const buildMultiLocalProjectCollectContext = (
  projectId: string
): EditorProjectCollectContextV2 => {
  const primaryId = toPrimaryDatasetId(projectId);
  const datasetBId = toSequencedDatasetId(projectId, 2);
  const sessionA = buildSessionDataset(primaryId, "DatasetA.csv", SAMPLE_SERIES);
  const sessionB = buildSessionDataset(datasetBId, "DatasetB.csv", [
    {
      id: "s2",
      name: "Series B",
      color: "#dc3912",
      points: [{ x: 1, y: 5 }],
    },
  ]);

  return {
    ...buildLocalProjectCollectContext(projectId, "Multi local test"),
    experimentalSeries: sessionB.datasetPayload.series,
    sessionDatasets: [sessionA, sessionB],
    activeDatasetId: datasetBId,
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
      B: { label: "Slot B", profile: null, sourceDatasetId: datasetBId },
    },
  };
};

export const captureMetadataNameFromPatch = (patch: HydrateProjectV2Patch): string => {
  let name = "";
  applyHydrateProjectV2Patch(patch, {
    setProjectMetadata: (value) => {
      name = value.name;
    },
    setExperimentalSeries: () => undefined,
    setCurrentDatasetInfo: () => undefined,
    setLastImportReport: () => undefined,
    setPreserveAnalysisConfiguration: () => undefined,
    setSessionDatasets: () => undefined,
    setActiveDatasetId: () => undefined,
    setProjectVisualGraphs: () => undefined,
    setTitle: () => undefined,
    setCurves: () => undefined,
    setMinX: () => undefined,
    setMaxX: () => undefined,
    setVisibleMinX: () => undefined,
    setVisibleMaxX: () => undefined,
    setAutoScaleY: () => undefined,
    setUseSecondaryYAxis: () => undefined,
    setRegressionModel: () => undefined,
    setErrorBarMode: () => undefined,
    setCorrelationMethod: () => undefined,
    setOutlierMethod: () => undefined,
    setHeatmapMode: () => undefined,
    setNonParametricMode: () => undefined,
    setHistogramBins: () => undefined,
    setAxisScaleMode: () => undefined,
    setNaturalLanguageEnabled: () => undefined,
    setSelectedTTestSeriesA: () => undefined,
    setSelectedTTestSeriesB: () => undefined,
    setSelectedMannWhitneySeriesA: () => undefined,
    setSelectedMannWhitneySeriesB: () => undefined,
    setHiddenLegendKeys: () => undefined,
    setGuidedWorkflowSession: () => undefined,
    setComparisonSlots: () => undefined,
    setActiveWorkspaceSection: () => undefined,
    setAnalysisInspectorSection: () => undefined,
    setEnabledModules: () => undefined,
    setControlPanelTab: () => undefined,
    visibilitySetters: {},
    clearEphemeralUiState: () => undefined,
    assignNextCurveIds: () => undefined,
    generateGraph: () => undefined,
  });
  return name;
};
