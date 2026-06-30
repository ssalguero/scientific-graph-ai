import type { ExperimentalSeries } from "@/lib/experimentalData";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import {
  buildHydrateProjectV2Patch,
  extractVisualGraphRuntimeState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { HydrateProjectV2Patch } from "@/lib/project/editor-hydrate-context-v2";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";

import { normalizeProjectForRoundTrip } from "./b2-9-invariants.cases";
import { patchToCollectContextV2WithWorksheet } from "./worksheet-pipeline-helpers";
import {
  SAMPLE_VGB_REGISTRY,
  SAMPLE_VGB_SERIES,
} from "./visual-graph-mapper-helpers";

const APP_VERSION = "0.1.0";

export const HYDRATE_VGB_PROJECT_ID = "00000000-0000-4000-8000-00000000c601";
export const HYDRATE_VGB_PRIMARY_ID = toPrimaryDatasetId(HYDRATE_VGB_PROJECT_ID);

export const buildVisualGraphSessionDataset = (
  id: string,
  name: string,
  series: ExperimentalSeries[] = SAMPLE_VGB_SERIES,
  worksheetOverrides?: {
    worksheetModified?: boolean;
    columnRegistry?: typeof SAMPLE_VGB_REGISTRY;
  }
): SessionDataset => ({
  id,
  name,
  importedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: series.length,
  observationCount: series.reduce((total, item) => total + item.points.length, 0),
  worksheetModified: worksheetOverrides?.worksheetModified ?? true,
  datasetPayload: {
    series,
    importReport: null,
    columnRegistry: worksheetOverrides?.columnRegistry ?? SAMPLE_VGB_REGISTRY,
  },
});

export const buildVisualGraphHydrateCollectContext = (
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => {
  const sessionDataset = buildVisualGraphSessionDataset(
    HYDRATE_VGB_PRIMARY_ID,
    "DatasetA.csv"
  );

  return {
    metadata: {
      id: HYDRATE_VGB_PROJECT_ID,
      name: "Visual graph hydrate test",
      createdAt: "2026-06-17T10:00:00.000Z",
      updatedAt: "2026-06-17T12:00:00.000Z",
    },
    experimentalSeries: SAMPLE_VGB_SERIES,
    currentDatasetInfo: {
      fileName: "DatasetA.csv",
      importedAt: "2026-06-17T12:00:00.000Z",
      seriesCount: SAMPLE_VGB_SERIES.length,
      observationCount: SAMPLE_VGB_SERIES.reduce(
        (total, item) => total + item.points.length,
        0
      ),
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
      tTestSeriesA: "control1",
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
    sessionDatasets: [sessionDataset],
    activeDatasetId: HYDRATE_VGB_PRIMARY_ID,
    worksheetModified: true,
    activeColumnRegistry: SAMPLE_VGB_REGISTRY,
    activeAuxiliaryColumns: [],
    ...overrides,
  };
};

export const patchToCollectContextV2WithVisualGraphs = (
  patch: HydrateProjectV2Patch
): EditorProjectCollectContextV2 => {
  const runtimeEntries = extractVisualGraphRuntimeState(patch);

  return {
    ...patchToCollectContextV2WithWorksheet(patch),
    projectVisualGraphEntries:
      runtimeEntries.length > 0 ? runtimeEntries : undefined,
  };
};

export const runVisualGraphHydrateRoundTrip = (
  collectContext: EditorProjectCollectContextV2
): {
  firstProject: ScientificProjectV2;
  secondProject: ScientificProjectV2;
  hydratedPatch: HydrateProjectV2Patch;
} => {
  const firstProject = collectProjectSnapshotV2(collectContext);
  const firstSerialized = serializeProjectV2({
    project: firstProject,
    appVersion: APP_VERSION,
    exportedAt: "2026-06-17T12:00:00.000Z",
    options: { includeChecksum: false },
  });
  if (!firstSerialized.ok) {
    throw new Error(
      `Visual graph hydrate round-trip: first serialize failed: ${JSON.stringify(firstSerialized.errors)}`
    );
  }

  const hydrated = hydrateProjectJson(firstSerialized.json);
  if (!hydrated.ok) {
    throw new Error("Visual graph hydrate round-trip: hydrate failed.");
  }

  const reloadedContext = patchToCollectContextV2WithVisualGraphs(hydrated.patch);
  const secondProject = collectProjectSnapshotV2(reloadedContext);

  return {
    firstProject: normalizeProjectForRoundTrip(firstProject),
    secondProject: normalizeProjectForRoundTrip(secondProject),
    hydratedPatch: hydrated.patch,
  };
};

export const buildHydratePatchFromProject = (
  project: ScientificProjectV2
): HydrateProjectV2Patch => buildHydrateProjectV2Patch(project);

export const buildMultiDatasetVisualGraphIds = () => ({
  datasetBId: toSequencedDatasetId(HYDRATE_VGB_PROJECT_ID, 2),
});
