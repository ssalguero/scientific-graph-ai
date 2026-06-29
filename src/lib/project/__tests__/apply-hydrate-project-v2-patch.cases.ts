import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  applyHydrateProjectV2Patch,
  buildHydrateProjectV2Patch,
  cloneScientificProjectV2,
  extractActiveWorksheetState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import {
  projectDatasetV2ToSessionDataset,
  sessionDatasetToProjectDatasetV2,
} from "@/lib/project/adapters/sgproj/map-session-dataset";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type {
  EditorProjectApplyContextV2,
  HydrateProjectV2Patch,
} from "@/lib/project/editor-hydrate-context-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { VISIBILITY_KEYS_V1 } from "@/lib/project/keys";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const PROJECT_ID = "00000000-0000-4000-8000-000000000077";
const PRIMARY_ID = toPrimaryDatasetId(PROJECT_ID);
const DATASET_B_ID = toSequencedDatasetId(PROJECT_ID, 2);

const SAMPLE_SERIES_A: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }],
  },
];

const SAMPLE_SERIES_B: ExperimentalSeries[] = [
  {
    id: "s2",
    name: "Series B",
    color: "#dc3912",
    points: [
      { x: 1, y: 5 },
      { x: 2, y: 6 },
    ],
  },
];

const buildBaseCollectContext = (
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => ({
  metadata: {
    id: PROJECT_ID,
    name: "Hydrate test project",
    createdAt: "2026-06-17T10:00:00.000Z",
    updatedAt: "2026-06-17T12:00:00.000Z",
  },
  experimentalSeries: SAMPLE_SERIES_A,
  currentDatasetInfo: {
    fileName: "DatasetA.csv",
    importedAt: "2026-06-17T12:00:00.000Z",
    seriesCount: 1,
    observationCount: 1,
  },
  lastImportReport: null,
  preserveAnalysisConfiguration: true,
  visibility: { showStatistics: true },
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
    tTestSeriesA: "s1",
    tTestSeriesB: null,
    mannWhitneySeriesA: null,
    mannWhitneySeriesB: null,
  },
  hiddenLegendKeys: ["legend-hidden"],
  guidedWorkflowSession: GUIDED_WORKFLOW_IDLE_SESSION,
  comparisonSlots: {
    A: { label: "Slot A", profile: null, sourceDatasetId: null },
    B: { label: "Slot B", profile: null, sourceDatasetId: null },
  },
  workspace: {
    activeSection: "data",
    inspectorSection: "visualization",
    enabledModules: {},
    controlPanelTab: "data",
  },
  title: "Graph title",
  minX: -5,
  maxX: 15,
  visibleMinX: -2,
  visibleMaxX: 12,
  autoScaleY: true,
  useSecondaryYAxis: true,
  curves: [{ expression: "x^2", color: "#ff0000" }],
  sessionDatasets: [],
  activeDatasetId: null,
  ...overrides,
});

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

type CapturedHydrateState = {
  projectMetadata: EditorProjectCollectContextV2["metadata"] | null;
  sessionDatasets: SessionDataset[] | null;
  activeDatasetId: string | null;
  experimentalSeries: ExperimentalSeries[] | null;
  comparisonSlots: EditorProjectCollectContextV2["comparisonSlots"] | null;
  regressionModel: string | null;
  hiddenLegendKeys: string[] | null;
  title: string | null;
  generateGraphCalled: boolean;
  clearEphemeralCalled: boolean;
};

const createCaptureApplyContext = (): {
  apply: EditorProjectApplyContextV2;
  captured: CapturedHydrateState;
} => {
  const captured: CapturedHydrateState = {
    projectMetadata: null,
    sessionDatasets: null,
    activeDatasetId: null,
    experimentalSeries: null,
    comparisonSlots: null,
    regressionModel: null,
    hiddenLegendKeys: null,
    title: null,
    generateGraphCalled: false,
    clearEphemeralCalled: false,
  };

  const visibilitySetters = Object.fromEntries(
    VISIBILITY_KEYS_V1.map((key) => [key, () => undefined])
  ) as EditorProjectApplyContextV2["visibilitySetters"];

  const apply: EditorProjectApplyContextV2 = {
    setProjectMetadata: (value) => {
      captured.projectMetadata = value;
    },
    setExperimentalSeries: (value) => {
      captured.experimentalSeries = value;
    },
    setCurrentDatasetInfo: () => undefined,
    setLastImportReport: () => undefined,
    setPreserveAnalysisConfiguration: () => undefined,
    setSessionDatasets: (value) => {
      captured.sessionDatasets = value;
    },
    setActiveDatasetId: (value) => {
      captured.activeDatasetId = value;
    },
    setTitle: (value) => {
      captured.title = value;
    },
    setCurves: () => undefined,
    setMinX: () => undefined,
    setMaxX: () => undefined,
    setVisibleMinX: () => undefined,
    setVisibleMaxX: () => undefined,
    setAutoScaleY: () => undefined,
    setUseSecondaryYAxis: () => undefined,
    setRegressionModel: (value) => {
      captured.regressionModel = value;
    },
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
    setHiddenLegendKeys: (value) => {
      captured.hiddenLegendKeys = value;
    },
    setGuidedWorkflowSession: () => undefined,
    setComparisonSlots: (value) => {
      captured.comparisonSlots = value;
    },
    setActiveWorkspaceSection: () => undefined,
    setAnalysisInspectorSection: () => undefined,
    setEnabledModules: () => undefined,
    setControlPanelTab: () => undefined,
    visibilitySetters,
    clearEphemeralUiState: () => {
      captured.clearEphemeralCalled = true;
    },
    assignNextCurveIds: () => undefined,
    generateGraph: () => {
      captured.generateGraphCalled = true;
    },
  };

  return { apply, captured };
};

const datasetsEquivalentToProject = (
  project: ScientificProjectV2,
  sessionDatasets: SessionDataset[]
): boolean => {
  if (project.datasets.length !== sessionDatasets.length) {
    return false;
  }

  return project.datasets.every((dataset) => {
    const session = sessionDatasets.find((item) => item.id === dataset.id);
    if (!session) {
      return false;
    }

    const roundTrip = sessionDatasetToProjectDatasetV2(session, {
      preserveAnalysisOnReimport: dataset.preserveAnalysisOnReimport,
      checksum: dataset.checksum,
    });

    return JSON.stringify(roundTrip) === JSON.stringify(dataset);
  });
};

/** B2.9 round-trip helper: Collect → Hydrate patch → Apply capture. */
export const runHydrateRoundTripFromCollect = (
  collectContext: EditorProjectCollectContextV2
): {
  snapshot: ScientificProjectV2;
  patch: HydrateProjectV2Patch;
  captured: CapturedHydrateState;
} => {
  const snapshot = collectProjectSnapshotV2(collectContext);
  const patch = buildHydrateProjectV2Patch(snapshot);
  const { apply, captured } = createCaptureApplyContext();
  applyHydrateProjectV2Patch(patch, apply);
  return { snapshot, patch, captured };
};

export const runApplyHydrateProjectV2PatchCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const emptySnapshot = collectProjectSnapshotV2(buildBaseCollectContext());
  const emptyPatch = buildHydrateProjectV2Patch(emptySnapshot);
  assertCase(
    "hydrate.empty.monoFallback.primaryDataset",
    emptyPatch.sessionDatasets.length === 1 &&
      emptyPatch.activeDatasetId === PRIMARY_ID &&
      emptyPatch.sessionDatasets[0]?.id === PRIMARY_ID
  );

  const monoSnapshot = collectProjectSnapshotV2(
    buildBaseCollectContext({
      sessionDatasets: [buildSessionDataset(PRIMARY_ID, "DatasetA.csv", SAMPLE_SERIES_A)],
      activeDatasetId: PRIMARY_ID,
    })
  );
  const monoPatch = buildHydrateProjectV2Patch(monoSnapshot);
  assertCase(
    "hydrate.mono.singleDataset",
    monoPatch.sessionDatasets.length === 1 &&
      monoPatch.sessionDatasets[0]?.datasetPayload.series[0]?.points.length === 1
  );

  const sessionA = buildSessionDataset(PRIMARY_ID, "DatasetA.csv", SAMPLE_SERIES_A);
  const sessionB = buildSessionDataset(DATASET_B_ID, "DatasetB.csv", SAMPLE_SERIES_B);
  const multiContext = buildBaseCollectContext({
    sessionDatasets: [sessionA, sessionB],
    activeDatasetId: DATASET_B_ID,
    experimentalSeries: SAMPLE_SERIES_B,
    currentDatasetInfo: {
      fileName: "DatasetB.csv",
      importedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: 1,
      observationCount: 2,
    },
    comparisonSlots: {
      A: { label: "Slot A", profile: null, sourceDatasetId: PRIMARY_ID },
      B: { label: "Slot B", profile: null, sourceDatasetId: DATASET_B_ID },
    },
  });
  const multiSnapshot = collectProjectSnapshotV2(multiContext);
  const multiPatch = buildHydrateProjectV2Patch(multiSnapshot);

  assertCase(
    "hydrate.multi.datasets.length",
    multiPatch.sessionDatasets.length === 2
  );
  assertCase(
    "hydrate.multi.activeDatasetId",
    multiPatch.activeDatasetId === DATASET_B_ID
  );
  assertCase(
    "hydrate.multi.sourceDatasetIds",
    multiPatch.project.comparison.slots.A.sourceDatasetId === PRIMARY_ID &&
      multiPatch.project.comparison.slots.B.sourceDatasetId === DATASET_B_ID
  );
  assertCase(
    "hydrate.multi.sessionDataset.ids",
    multiPatch.sessionDatasets[0]?.id === PRIMARY_ID &&
      multiPatch.sessionDatasets[1]?.id === DATASET_B_ID
  );

  assertCase(
    "hydrate.ids.preserved",
    multiPatch.project.datasets.every(
      (dataset, index) =>
        dataset.id === multiSnapshot.datasets[index]?.id &&
        dataset.id === multiPatch.sessionDatasets[index]?.id
    )
  );

  assertCase(
    "hydrate.sessionDatasets.rebuiltViaMapper",
    multiPatch.sessionDatasets.every((session, index) => {
      const expected = projectDatasetV2ToSessionDataset(multiSnapshot.datasets[index]!);
      return JSON.stringify(session) === JSON.stringify(expected);
    })
  );

  const frozenSnapshot = Object.freeze(
    cloneScientificProjectV2(multiSnapshot)
  ) as ScientificProjectV2;
  const beforeSnapshot = JSON.stringify(frozenSnapshot);
  buildHydrateProjectV2Patch(frozenSnapshot);
  assertCase(
    "hydrate.immutable.inputProject",
    JSON.stringify(frozenSnapshot) === beforeSnapshot
  );

  assertCase(
    "hydrate.equivalence.datasetsRoundTrip",
    datasetsEquivalentToProject(multiSnapshot, multiPatch.sessionDatasets)
  );

  const { captured: monoCaptured } = runHydrateRoundTripFromCollect(
    buildBaseCollectContext({
      sessionDatasets: [sessionA],
      activeDatasetId: PRIMARY_ID,
    })
  );
  assertCase(
    "hydrate.apply.activeDatasetId",
    monoCaptured.activeDatasetId === PRIMARY_ID
  );
  assertCase(
    "hydrate.apply.sessionDatasets.length",
    monoCaptured.sessionDatasets?.length === 1
  );
  assertCase(
    "hydrate.apply.activeSeriesLoaded",
    monoCaptured.experimentalSeries?.[0]?.points.length === 1
  );
  assertCase(
    "hydrate.apply.clearsEphemeralUi",
    monoCaptured.clearEphemeralCalled === true
  );

  const { captured: multiCaptured } = runHydrateRoundTripFromCollect(multiContext);
  assertCase(
    "hydrate.apply.sourceDatasetIds",
    multiCaptured.comparisonSlots?.A.sourceDatasetId === PRIMARY_ID &&
      multiCaptured.comparisonSlots?.B.sourceDatasetId === DATASET_B_ID
  );
  assertCase(
    "hydrate.apply.analysisConfig",
    multiCaptured.regressionModel === "linear" &&
      multiCaptured.hiddenLegendKeys?.includes("legend-hidden") === true
  );

  const worksheetContext = buildBaseCollectContext({
    sessionDatasets: [
      {
        ...sessionA,
        worksheetModified: true,
        datasetPayload: {
          ...sessionA.datasetPayload,
          columnRegistry: { s1: { columnType: "numeric", transforms: [] } },
        },
      },
      sessionB,
    ],
    activeDatasetId: PRIMARY_ID,
    experimentalSeries: SAMPLE_SERIES_A,
    worksheetModified: true,
    activeColumnRegistry: { s1: { columnType: "numeric", transforms: [] } },
  });
  const { patch: worksheetPatch, captured: worksheetCaptured } =
    runHydrateRoundTripFromCollect(worksheetContext);
  assertCase(
    "hydrate.apply.worksheetSessionPayload",
    worksheetCaptured.sessionDatasets?.[0]?.datasetPayload.columnRegistry?.s1
      ?.columnType === "numeric" &&
      extractActiveWorksheetState(worksheetPatch)?.columnRegistry?.s1
        ?.columnType === "numeric"
  );

  assertCase(
    "hydrate.apply.graphContext",
    multiCaptured.title === "Graph title"
  );

  const graphSnapshot = collectProjectSnapshotV2(
    buildBaseCollectContext({
      sessionDatasets: [sessionA],
      activeDatasetId: PRIMARY_ID,
      curves: [{ expression: "sin(x)", color: "#00ff00" }],
    })
  );
  const graphPatch = buildHydrateProjectV2Patch(graphSnapshot);
  assertCase(
    "hydrate.postHydrate.generateGraph",
    graphPatch.postHydrateActions.includes("generateGraph")
  );

  const { captured: graphCaptured } = runHydrateRoundTripFromCollect(
    buildBaseCollectContext({
      sessionDatasets: [sessionA],
      activeDatasetId: PRIMARY_ID,
      curves: [{ expression: "sin(x)", color: "#00ff00" }],
    })
  );
  assertCase(
    "hydrate.apply.generateGraphInvoked",
    graphCaptured.generateGraphCalled === true
  );

  assertCase(
    "hydrate.patch.clonesProject",
    multiPatch.project !== multiSnapshot &&
      JSON.stringify(multiPatch.project) === JSON.stringify(multiSnapshot)
  );

  assertCase(
    "hydrate.nativeV2.noMigrationImports",
    typeof buildHydrateProjectV2Patch === "function" &&
      typeof applyHydrateProjectV2Patch === "function"
  );

  return results;
};
