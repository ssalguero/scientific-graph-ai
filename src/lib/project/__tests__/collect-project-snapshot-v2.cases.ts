import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  collectProjectSnapshotV2,
  prepareSessionDatasetsForCollect,
} from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const PROJECT_ID = "00000000-0000-4000-8000-000000000099";
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

const buildBaseContext = (
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => ({
  metadata: {
    id: PROJECT_ID,
    name: "Collect test project",
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
  hiddenLegendKeys: [],
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
  title: "",
  minX: -10,
  maxX: 10,
  visibleMinX: -10,
  visibleMaxX: 10,
  autoScaleY: false,
  useSecondaryYAxis: false,
  curves: [{ expression: "", color: "#3b82f6" }],
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

export const runCollectProjectSnapshotV2CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const emptySnapshot = collectProjectSnapshotV2(buildBaseContext());
  assertCase(
    "collect.empty.monoFallback.primaryDataset",
    emptySnapshot.datasets.length === 1 &&
      emptySnapshot.datasets[0]?.id === PRIMARY_ID &&
      emptySnapshot.activeDatasetId === PRIMARY_ID &&
      emptySnapshot.datasets[0]?.series.length === 1
  );

  const sessionA = buildSessionDataset(PRIMARY_ID, "DatasetA.csv", SAMPLE_SERIES_A);
  const sessionB = buildSessionDataset(DATASET_B_ID, "DatasetB.csv", SAMPLE_SERIES_B);

  const multiCtx = buildBaseContext({
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
      A: {
        label: "Slot A",
        profile: null,
        sourceDatasetId: PRIMARY_ID,
      },
      B: {
        label: "Slot B",
        profile: null,
        sourceDatasetId: DATASET_B_ID,
      },
    },
  });

  const multiSnapshot = collectProjectSnapshotV2(multiCtx);
  assertCase(
    "collect.multi.datasets.length",
    multiSnapshot.datasets.length === 2
  );
  assertCase(
    "collect.multi.datasets.ids",
    multiSnapshot.datasets[0]?.id === PRIMARY_ID &&
      multiSnapshot.datasets[1]?.id === DATASET_B_ID
  );
  assertCase(
    "collect.multi.activeDatasetId",
    multiSnapshot.activeDatasetId === DATASET_B_ID
  );
  assertCase(
    "collect.multi.sourceDatasetIds",
    multiSnapshot.comparison.slots.A.sourceDatasetId === PRIMARY_ID &&
      multiSnapshot.comparison.slots.B.sourceDatasetId === DATASET_B_ID
  );
  assertCase(
    "collect.multi.activeEditorFlushed",
    multiSnapshot.datasets[1]?.series[0]?.points.length === 2
  );

  const runtimeSessionB = buildSessionDataset(
    "session-ds-1700000000000-abc123",
    "DatasetB.csv",
    SAMPLE_SERIES_B
  );
  const runtimeRemapSnapshot = collectProjectSnapshotV2(
    buildBaseContext({
      sessionDatasets: [sessionA, runtimeSessionB],
      activeDatasetId: runtimeSessionB.id,
      experimentalSeries: SAMPLE_SERIES_B,
    })
  );
  assertCase(
    "collect.runtimeId.remappedToSequenced",
    runtimeRemapSnapshot.datasets[1]?.id === DATASET_B_ID &&
      !runtimeRemapSnapshot.datasets.some((dataset) =>
        dataset.id.startsWith("session-ds-")
      )
  );
  assertCase(
    "collect.runtimeId.activeRemapped",
    runtimeRemapSnapshot.activeDatasetId === DATASET_B_ID
  );

  const frozenRegistry = Object.freeze([
    Object.freeze(buildSessionDataset(PRIMARY_ID, "DatasetA.csv", SAMPLE_SERIES_A)),
  ]);
  const frozenCtx = Object.freeze(
    buildBaseContext({
      sessionDatasets: frozenRegistry as SessionDataset[],
      activeDatasetId: PRIMARY_ID,
    })
  );
  const beforeRegistry = JSON.stringify(frozenRegistry);
  collectProjectSnapshotV2(frozenCtx as EditorProjectCollectContextV2);
  assertCase(
    "collect.immutable.sessionDatasets",
    JSON.stringify(frozenRegistry) === beforeRegistry
  );

  const prepared = prepareSessionDatasetsForCollect(
    buildBaseContext({
      sessionDatasets: [sessionA],
      activeDatasetId: PRIMARY_ID,
      experimentalSeries: [
        {
          id: "s1",
          name: "Series A",
          color: "#3366cc",
          points: [
            { x: 1, y: 10 },
            { x: 2, y: 11 },
          ],
        },
      ],
    })
  );
  assertCase(
    "collect.prepare.flushesActiveEditor",
    prepared[0]?.datasetPayload.series[0]?.points.length === 2
  );

  const snapshotTwice = collectProjectSnapshotV2(multiCtx);
  const snapshotTwiceAgain = collectProjectSnapshotV2(multiCtx);
  assertCase(
    "collect.deterministic.repeatable",
    JSON.stringify(snapshotTwice) === JSON.stringify(snapshotTwiceAgain)
  );

  assertCase(
    "collect.nativeV2.noMigrationShape",
    Array.isArray(multiSnapshot.datasets) &&
      typeof multiSnapshot.activeDatasetId === "string" &&
      multiSnapshot.comparison.slots.A.sourceDatasetId !== undefined
  );

  assertCase(
    "collect.analysisConfig.preserved",
    multiSnapshot.analysisConfig.selections.tTestSeriesA === "s1" &&
      multiSnapshot.analysisConfig.modes.regressionModel === "linear"
  );

  assertCase(
    "collect.activePreserveAnalysisOnReimport",
    multiSnapshot.datasets.find((dataset) => dataset.id === DATASET_B_ID)
      ?.preserveAnalysisOnReimport === true
  );

  const inactivePreserveContext = buildBaseContext({
    sessionDatasets: [
      {
        ...buildSessionDataset(PRIMARY_ID, "DatasetA.csv", SAMPLE_SERIES_A),
        preserveAnalysisOnReimport: false,
      },
      {
        ...buildSessionDataset(DATASET_B_ID, "DatasetB.csv", SAMPLE_SERIES_B),
        preserveAnalysisOnReimport: false,
      },
    ],
    activeDatasetId: DATASET_B_ID,
    preserveAnalysisConfiguration: true,
    experimentalSeries: SAMPLE_SERIES_B,
    currentDatasetInfo: {
      fileName: "DatasetB.csv",
      importedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: 1,
      observationCount: 2,
    },
  });
  const inactivePreserveSnapshot = collectProjectSnapshotV2(inactivePreserveContext);
  assertCase(
    "collect.inactivePreserveAnalysisOnReimport",
    inactivePreserveSnapshot.datasets.find((dataset) => dataset.id === PRIMARY_ID)
      ?.preserveAnalysisOnReimport === false &&
      inactivePreserveSnapshot.datasets.find((dataset) => dataset.id === DATASET_B_ID)
        ?.preserveAnalysisOnReimport === true
  );

  return results;
};
