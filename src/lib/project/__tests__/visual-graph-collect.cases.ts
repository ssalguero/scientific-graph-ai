import type { ExperimentalSeries } from "@/lib/experimentalData";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import { VisualGraphDomainError } from "@/lib/project/domain/visual-graph-domain";
import { serializeProjectV2 } from "@/lib/project/serialize-project-v2";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { runCollectProjectSnapshotV2CaseSuite } from "./collect-project-snapshot-v2.cases";
import {
  buildSampleVisualGraphEntry,
  cloneVisualGraphPreview,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_LINE_SPEC_INPUT,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
} from "./visual-graph-mapper-helpers";

const PROJECT_ID = "00000000-0000-4000-8000-00000000c501";
const PRIMARY_ID = toPrimaryDatasetId(PROJECT_ID);
const SESSION_DATASET_ID = "session-ds-alpha";

const SAMPLE_SERIES: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }],
  },
];

const buildBaseContext = (
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => ({
  metadata: {
    id: PROJECT_ID,
    name: "Visual graph collect test",
    createdAt: "2026-06-17T10:00:00.000Z",
    updatedAt: "2026-06-17T12:00:00.000Z",
  },
  experimentalSeries: SAMPLE_SERIES,
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
  series: ExperimentalSeries[] = SAMPLE_SERIES
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

export const runVisualGraphCollectCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const emptySnapshot = collectProjectSnapshotV2(buildBaseContext());
  assertCase(
    "collect.vgb.emptyOmits",
    !("visualGraphs" in emptySnapshot) && emptySnapshot.visualGraphs === undefined
  );

  const runtimeEntry = buildSampleVisualGraphEntry();
  const withGraphSnapshot = collectProjectSnapshotV2(
    buildBaseContext({
      projectVisualGraphEntries: [runtimeEntry],
    })
  );

  assertCase(
    "collect.vgbR1.noEphemeralKeys",
    withGraphSnapshot.visualGraphs !== undefined &&
      withGraphSnapshot.visualGraphs.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      )
  );

  assertCase(
    "collect.vgbR1.noPreviewLeak",
    withGraphSnapshot.visualGraphs !== undefined &&
      withGraphSnapshot.visualGraphs.every(
        (entry) =>
          !("preview" in (entry as unknown as Record<string, unknown>)) &&
          !("displaySeries" in (entry as unknown as Record<string, unknown>)) &&
          PREVIEW_ONLY_EPHEMERAL_KEYS.every(
            (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
          )
      )
  );

  assertCase(
    "collect.vgb.sourceDatasetId.primary",
    withGraphSnapshot.visualGraphs?.[0]?.sourceDatasetId === PRIMARY_ID
  );

  const sessionA = buildSessionDataset("session-ds-a", "Dataset A");
  const sessionB = buildSessionDataset("session-ds-b", "Dataset B");
  const multiActiveSnapshot = collectProjectSnapshotV2(
    buildBaseContext({
      sessionDatasets: [sessionA, sessionB],
      activeDatasetId: "session-ds-b",
      projectVisualGraphEntries: [runtimeEntry],
    })
  );

  assertCase(
    "collect.vgb.sourceDatasetId.active",
    multiActiveSnapshot.visualGraphs?.[0]?.sourceDatasetId ===
      toSequencedDatasetId(PROJECT_ID, 2)
  );

  const remapSnapshot = collectProjectSnapshotV2(
    buildBaseContext({
      sessionDatasets: [buildSessionDataset(SESSION_DATASET_ID, "Runtime dataset")],
      activeDatasetId: SESSION_DATASET_ID,
      projectVisualGraphEntries: [runtimeEntry],
    })
  );

  assertCase(
    "collect.vgb.remap.sessionToPersisted",
    remapSnapshot.visualGraphs?.[0]?.sourceDatasetId ===
      toSequencedDatasetId(PROJECT_ID, 1)
  );

  const scatterEntry = buildSampleVisualGraphEntry({
    graphId: "vg-scatter-collect",
    specInput: SAMPLE_VGB_SCATTER_SPEC_INPUT,
  });
  const lineEntry = buildSampleVisualGraphEntry({
    graphId: "vg-line-collect",
    createdAt: "2026-06-29T12:01:00.000Z",
    specInput: SAMPLE_VGB_LINE_SPEC_INPUT,
  });
  const multiEntrySnapshot = collectProjectSnapshotV2(
    buildBaseContext({
      projectVisualGraphEntries: [scatterEntry, lineEntry],
    })
  );

  assertCase(
    "collect.vgb.multiEntries",
    multiEntrySnapshot.visualGraphs?.length === 2 &&
      new Set(multiEntrySnapshot.visualGraphs.map((entry) => entry.id)).size === 2
  );

  const previewBefore = cloneVisualGraphPreview(runtimeEntry.preview);
  const displaySeriesBefore = runtimeEntry.displaySeries.map((series) => ({
    ...series,
    points: series.points.map((point) => ({ ...point })),
  }));

  collectProjectSnapshotV2(
    buildBaseContext({
      projectVisualGraphEntries: [runtimeEntry],
    })
  );

  assertCase(
    "collect.vgb.immutability",
    JSON.stringify(runtimeEntry.preview) === JSON.stringify(previewBefore) &&
      JSON.stringify(runtimeEntry.displaySeries) === JSON.stringify(displaySeriesBefore)
  );

  let idMismatchThrown = false;
  try {
    collectProjectSnapshotV2(
      buildBaseContext({
        projectVisualGraphEntries: [
          {
            ...runtimeEntry,
            id: "entry-id-mismatch",
          },
        ],
      })
    );
  } catch (error) {
    idMismatchThrown =
      error instanceof VisualGraphDomainError && error.code === "VGB-ID-MISMATCH";
  }

  assertCase("collect.vgb.idConsistency", idMismatchThrown);

  const serialized = serializeProjectV2({
    project: collectProjectSnapshotV2(
      buildBaseContext({
        projectVisualGraphEntries: [runtimeEntry],
      })
    ),
    appVersion: "0.1.0",
    options: { includeChecksum: false, pretty: true },
  });

  assertCase(
    "collect.vgb.serializeRoundTrip",
    serialized.ok === true &&
      serialized.json.includes('"visualGraphs"') &&
      serialized.json.includes('"sourceDatasetId"')
  );

  const b2Results = runCollectProjectSnapshotV2CaseSuite();
  assertCase(
    "collect.b2Compat.existingCases",
    b2Results.every((item) => item.pass)
  );

  return results;
};
