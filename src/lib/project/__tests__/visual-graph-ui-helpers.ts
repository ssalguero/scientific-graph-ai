import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import {
  buildHydrateProjectV2Patch,
  extractVisualGraphRuntimeState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import { serializeProjectV2 } from "@/lib/project/serialize-project-v2";
import { hydrateProjectJson } from "@/lib/project";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

import {
  buildSampleVisualGraphEntry,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_LINE_SPEC_INPUT,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
} from "./visual-graph-mapper-helpers";
import {
  buildVisualGraphSessionDataset,
  HYDRATE_VGB_PRIMARY_ID,
  HYDRATE_VGB_PROJECT_ID,
} from "./visual-graph-hydrate-helpers";
import {
  flattenVisualGraphCollectInputsFromRegistry,
  injectVisualGraphEntriesBySourceDatasetId,
  mergeVisualGraphsFromSessionIntoProjectSnapshot,
  persistActiveVisualGraphsInRegistry,
  prepareCollectContextWithSessionVisualGraphs,
  readVisualGraphEntriesFromDataset,
} from "@/lib/project/visual-graph-session-ui";

const APP_VERSION = "0.1.0";

export const UI_VGB_PROJECT_ID = HYDRATE_VGB_PROJECT_ID;
export const UI_VGB_DATASET_A_ID = HYDRATE_VGB_PRIMARY_ID;

export const buildUiVisualGraphSessionDataset = buildVisualGraphSessionDataset;

export const buildUiVisualGraphCollectContext = (
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => {
  const sessionA = buildVisualGraphSessionDataset(UI_VGB_DATASET_A_ID, "DatasetA.csv");
  const datasetBId = toSequencedDatasetId(UI_VGB_PROJECT_ID, 2);
  const sessionB = buildVisualGraphSessionDataset(datasetBId, "DatasetB.csv");

  return {
    metadata: {
      id: UI_VGB_PROJECT_ID,
      name: "Visual graph UI test",
      createdAt: "2026-06-17T10:00:00.000Z",
      updatedAt: "2026-06-17T12:00:00.000Z",
    },
    experimentalSeries: sessionA.datasetPayload.series,
    currentDatasetInfo: {
      fileName: "DatasetA.csv",
      importedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: sessionA.seriesCount,
      observationCount: sessionA.observationCount,
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
    minX: 0,
    maxX: 10,
    visibleMinX: 0,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
    curves: [],
    sessionDatasets: [sessionA, sessionB],
    activeDatasetId: UI_VGB_DATASET_A_ID,
    worksheetModified: true,
    activeColumnRegistry: sessionA.datasetPayload.columnRegistry,
    ...overrides,
  };
};

export type UiVisualGraphSwitchState = {
  registry: SessionDataset[];
  activeId: string;
  activeVisualGraphs: ProjectVisualGraphEntry[];
};

export const activateSessionVisualGraphsForTest = (
  registry: SessionDataset[],
  activeId: string | null,
  activeVisualGraphs: readonly ProjectVisualGraphEntry[],
  targetId: string
): UiVisualGraphSwitchState | null => {
  const withVisualGraphs = persistActiveVisualGraphsInRegistry(
    registry,
    activeId,
    activeVisualGraphs
  );
  const target = withVisualGraphs.find((dataset) => dataset.id === targetId);
  if (!target) {
    return null;
  }

  return {
    registry: withVisualGraphs,
    activeId: targetId,
    activeVisualGraphs: readVisualGraphEntriesFromDataset(target),
  };
};

export const runVisualGraphUiSaveOpenRoundTrip = (
  collectContext: EditorProjectCollectContextV2,
  activeVisualGraphs: readonly ProjectVisualGraphEntry[]
) => {
  const prepared = prepareCollectContextWithSessionVisualGraphs(
    collectContext,
    activeVisualGraphs
  );
  const collected = collectProjectSnapshotV2(prepared);
  const merged = mergeVisualGraphsFromSessionIntoProjectSnapshot(collected, prepared);
  const serialized = serializeProjectV2({
    project: merged,
    appVersion: APP_VERSION,
    options: { includeChecksum: false, pretty: true },
  });
  if (!serialized.ok) {
    throw new Error("Visual graph UI round-trip serialize failed");
  }

  const hydrated = hydrateProjectJson(serialized.json);
  if (!hydrated.ok) {
    throw new Error("Visual graph UI round-trip hydrate failed");
  }

  return {
    prepared,
    merged,
    serialized,
    hydrated,
    runtimeEntries: extractVisualGraphRuntimeState(hydrated.patch),
    injectedRegistry: injectVisualGraphEntriesBySourceDatasetId(
      hydrated.patch.sessionDatasets,
      hydrated.patch.project.visualGraphs ?? [],
      extractVisualGraphRuntimeState(hydrated.patch)
    ),
  };
};

export const buildDistinctVisualGraphEntries = () => {
  const datasetBId = toSequencedDatasetId(UI_VGB_PROJECT_ID, 2);
  const entryA = buildSampleVisualGraphEntry({
    graphId: "vg-ui-dataset-a",
    specInput: SAMPLE_VGB_SCATTER_SPEC_INPUT,
  });
  const entryB = buildSampleVisualGraphEntry({
    graphId: "vg-ui-dataset-b",
    createdAt: "2026-06-29T12:01:00.000Z",
    specInput: SAMPLE_VGB_LINE_SPEC_INPUT,
  });

  return { datasetBId, entryA, entryB };
};

export { hasOnlyPersistedVisualGraphKeys, PREVIEW_ONLY_EPHEMERAL_KEYS };

export const buildHydratePatchFromMergedProject = (
  project: ReturnType<typeof collectProjectSnapshotV2>
) => buildHydrateProjectV2Patch(project);

export const flattenInputsFromContext = flattenVisualGraphCollectInputsFromRegistry;
