import type { ExperimentalSeries } from "@/lib/experimentalData";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import {
  loadProjectJson,
  SCHEMA_VERSION_V2,
  serializeProjectV2,
  type ScientificProjectFileV2,
} from "@/lib/project";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const APP_VERSION = "0.1.0";
const EXPORTED_AT = "2026-06-17T12:00:00.000Z";
const PROJECT_ID = "00000000-0000-4000-8000-000000000088";
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
    name: "Serialize test project",
    createdAt: "2026-06-17T10:00:00.000Z",
    updatedAt: "2026-06-17T11:00:00.000Z",
  },
  experimentalSeries: [],
  currentDatasetInfo: null,
  lastImportReport: null,
  preserveAnalysisConfiguration: false,
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

const serializeCollected = (ctx: EditorProjectCollectContextV2) => {
  const project = collectProjectSnapshotV2(ctx);
  return serializeProjectV2({
    project,
    appVersion: APP_VERSION,
    exportedAt: EXPORTED_AT,
    options: { includeChecksum: false, pretty: true },
  });
};

export const runSerializeProjectV2CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const emptySerialized = serializeCollected(buildBaseContext());
  assertCase("serialize.empty.ok", emptySerialized.ok === true);
  if (emptySerialized.ok) {
    const project = emptySerialized.file.project as ScientificProjectFileV2["project"];
    assertCase(
      "serialize.empty.schemaV2",
      emptySerialized.file.schemaVersion === SCHEMA_VERSION_V2
    );
    assertCase(
      "serialize.empty.primaryDataset",
      project.datasets.length === 1 &&
        project.datasets[0]?.id === PRIMARY_ID &&
        project.activeDatasetId === PRIMARY_ID &&
        project.datasets[0]?.series.length === 0
    );
  }

  const monoSerialized = serializeCollected(
    buildBaseContext({
      experimentalSeries: SAMPLE_SERIES_A,
      currentDatasetInfo: {
        fileName: "DatasetA.csv",
        importedAt: "2026-06-17T12:00:00.000Z",
        seriesCount: 1,
        observationCount: 1,
      },
    })
  );
  assertCase("serialize.mono.ok", monoSerialized.ok === true);
  if (monoSerialized.ok) {
    const project = monoSerialized.file.project as ScientificProjectFileV2["project"];
    assertCase(
      "serialize.mono.series",
      project.datasets[0]?.series.length === 1
    );
    assertCase(
      "serialize.mono.activeDatasetId",
      project.activeDatasetId === PRIMARY_ID
    );
  }

  const sessionA = buildSessionDataset(PRIMARY_ID, "DatasetA.csv", SAMPLE_SERIES_A);
  const sessionB = buildSessionDataset(DATASET_B_ID, "DatasetB.csv", SAMPLE_SERIES_B);
  const multiSerialized = serializeCollected(
    buildBaseContext({
      sessionDatasets: [sessionA, sessionB],
      activeDatasetId: DATASET_B_ID,
      experimentalSeries: SAMPLE_SERIES_B,
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
    })
  );
  assertCase("serialize.multi.ok", multiSerialized.ok === true);
  if (multiSerialized.ok) {
    const project = multiSerialized.file.project as ScientificProjectFileV2["project"];
    assertCase(
      "serialize.multi.datasets.length",
      project.datasets.length === 2
    );
    assertCase(
      "serialize.multi.dataset.ids",
      project.datasets[0]?.id === PRIMARY_ID &&
        project.datasets[1]?.id === DATASET_B_ID
    );
    assertCase(
      "serialize.multi.activeDatasetId",
      project.activeDatasetId === DATASET_B_ID
    );
    assertCase(
      "serialize.multi.sourceDatasetIds",
      project.comparison.slots.A.sourceDatasetId === PRIMARY_ID &&
        project.comparison.slots.B.sourceDatasetId === DATASET_B_ID
    );
    assertCase(
      "serialize.multi.workflowPreserved",
      project.workflow.session.status === "idle"
    );
    assertCase(
      "serialize.multi.workspacePreserved",
      project.workspace.activeSection === "data"
    );
  }

  const collected = collectProjectSnapshotV2(
    buildBaseContext({
      sessionDatasets: [sessionA, sessionB],
      activeDatasetId: PRIMARY_ID,
      experimentalSeries: SAMPLE_SERIES_A,
    })
  );
  const beforeSnapshot = JSON.stringify(collected);
  const immutableResult = serializeProjectV2({
    project: collected,
    appVersion: APP_VERSION,
    exportedAt: EXPORTED_AT,
    options: { includeChecksum: false },
  });
  assertCase(
    "serialize.immutable.inputProject",
    JSON.stringify(collected) === beforeSnapshot
  );
  assertCase("serialize.immutable.ok", immutableResult.ok === true);

  const deterministicA = serializeProjectV2({
    project: collected,
    appVersion: APP_VERSION,
    exportedAt: EXPORTED_AT,
    options: { includeChecksum: false, pretty: false },
  });
  const deterministicB = serializeProjectV2({
    project: collected,
    appVersion: APP_VERSION,
    exportedAt: EXPORTED_AT,
    options: { includeChecksum: false, pretty: false },
  });
  assertCase(
    "serialize.deterministic.json",
    deterministicA.ok === true &&
      deterministicB.ok === true &&
      deterministicA.ok &&
      deterministicB.ok &&
      deterministicA.json === deterministicB.json
  );

  if (multiSerialized.ok) {
    const loaded = loadProjectJson(multiSerialized.json);
    assertCase(
      "serialize.multi.loadableV2",
      loaded.ok === true &&
        loaded.file?.schemaVersion === SCHEMA_VERSION_V2 &&
        loaded.file?.project.datasets.length === 2
    );
  }

  const collectThenSerialize = serializeCollected(
    buildBaseContext({
      sessionDatasets: [sessionA, sessionB],
      activeDatasetId: DATASET_B_ID,
      experimentalSeries: SAMPLE_SERIES_B,
      comparisonSlots: {
        A: { label: "Slot A", profile: null, sourceDatasetId: PRIMARY_ID },
        B: { label: "Slot B", profile: null, sourceDatasetId: DATASET_B_ID },
      },
    })
  );
  assertCase(
    "serialize.collectIntegration.pipeline",
    collectThenSerialize.ok === true &&
      (collectThenSerialize.file.project as ScientificProjectFileV2["project"])
        .datasets.length === 2
  );

  return results;
};
