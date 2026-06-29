import type { ExperimentalSeries } from "@/lib/experimentalData";
import {
  buildColumnRegistryFromImportAuxiliary,
  seriesToWorksheet,
  type WorksheetColumnRegistry,
} from "@/lib/experimentalWorksheet";
import type { ImportAuxiliaryColumn, ImportReport } from "@/lib/import/types";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { HydrateProjectV2Patch } from "@/lib/project/editor-hydrate-context-v2";
import type { ScientificProjectV2 } from "@/lib/project/domain/types-v2";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";
import { updateSessionDatasetPayload } from "@/lib/sessionDatasetRegistry";
import { GUIDED_WORKFLOW_IDLE_SESSION } from "@/lib/scientific/workflow/catalog";

import { normalizeProjectForRoundTrip } from "./b2-9-invariants.cases";

const APP_VERSION = "0.1.0";

export const SAMPLE_WORKSHEET_SERIES_A: ExperimentalSeries[] = [
  {
    id: "s1",
    name: "Series A",
    color: "#3366cc",
    points: [{ x: 1, y: 10 }],
  },
];

export const SAMPLE_WORKSHEET_SERIES_B: ExperimentalSeries[] = [
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

export const SAMPLE_WORKSHEET_REGISTRY_A: WorksheetColumnRegistry = {
  s1: {
    columnType: "numeric",
    transforms: [
      {
        kind: "formula",
        enabled: true,
        expression: "s1 * 2",
        sourceSeriesIds: ["s1"],
      },
    ],
  },
};

export const SAMPLE_WORKSHEET_REGISTRY_B: WorksheetColumnRegistry = {
  s2: {
    columnType: "numeric",
    transforms: [],
  },
};

export const SAMPLE_WORKSHEET_AUXILIARY: ImportAuxiliaryColumn[] = [
  {
    id: "aux-1",
    label: "Group",
    role: "group",
    valuesByRowIndex: { 0: "alpha", 1: "beta" },
  },
];

export const buildWorksheetSessionDataset = (
  id: string,
  name: string,
  series: ExperimentalSeries[],
  worksheetOverrides?: {
    worksheetModified?: boolean;
    columnRegistry?: WorksheetColumnRegistry;
    auxiliaryColumns?: ImportAuxiliaryColumn[];
    preserveAnalysisOnReimport?: boolean;
  }
): SessionDataset => ({
  id,
  name,
  importedAt: "2026-06-17T12:00:00.000Z",
  seriesCount: series.length,
  observationCount: series.reduce((total, item) => total + item.points.length, 0),
  worksheetModified: worksheetOverrides?.worksheetModified ?? true,
  preserveAnalysisOnReimport: worksheetOverrides?.preserveAnalysisOnReimport,
  datasetPayload: {
    series,
    importReport: null,
    columnRegistry: worksheetOverrides?.columnRegistry,
    auxiliaryColumns: worksheetOverrides?.auxiliaryColumns,
  },
});

export const buildWorksheetCollectContext = (
  projectId: string,
  primaryId: string,
  datasetBId: string,
  overrides?: Partial<EditorProjectCollectContextV2>
): EditorProjectCollectContextV2 => ({
  metadata: {
    id: projectId,
    name: "Worksheet pipeline test",
    createdAt: "2026-06-17T10:00:00.000Z",
    updatedAt: "2026-06-17T12:00:00.000Z",
  },
  experimentalSeries: SAMPLE_WORKSHEET_SERIES_B,
  currentDatasetInfo: {
    fileName: "DatasetB.csv",
    importedAt: "2026-06-17T12:00:00.000Z",
    seriesCount: 1,
    observationCount: 2,
  },
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
    tTestSeriesA: "s2",
    tTestSeriesB: null,
    mannWhitneySeriesA: null,
    mannWhitneySeriesB: null,
  },
  hiddenLegendKeys: [],
  guidedWorkflowSession: GUIDED_WORKFLOW_IDLE_SESSION,
  comparisonSlots: {
    A: { label: "Slot A", profile: null, sourceDatasetId: primaryId },
    B: { label: "Slot B", profile: null, sourceDatasetId: datasetBId },
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
  sessionDatasets: [
    buildWorksheetSessionDataset(
      primaryId,
      "DatasetA.csv",
      SAMPLE_WORKSHEET_SERIES_A,
      {
        columnRegistry: SAMPLE_WORKSHEET_REGISTRY_A,
        auxiliaryColumns: SAMPLE_WORKSHEET_AUXILIARY,
        preserveAnalysisOnReimport: true,
      }
    ),
    buildWorksheetSessionDataset(
      datasetBId,
      "DatasetB.csv",
      SAMPLE_WORKSHEET_SERIES_B,
      {
        columnRegistry: SAMPLE_WORKSHEET_REGISTRY_B,
        preserveAnalysisOnReimport: false,
      }
    ),
  ],
  activeDatasetId: datasetBId,
  worksheetModified: true,
  activeColumnRegistry: SAMPLE_WORKSHEET_REGISTRY_B,
  ...overrides,
});

export const patchToCollectContextV2WithWorksheet = (
  patch: HydrateProjectV2Patch
): EditorProjectCollectContextV2 => {
  const activeSession = patch.sessionDatasets.find(
    (dataset) => dataset.id === patch.activeDatasetId
  );

  return {
    metadata: patch.project.metadata,
    experimentalSeries: activeSession?.datasetPayload.series ?? [],
    currentDatasetInfo: activeSession
      ? {
          fileName: activeSession.name,
          importedAt: activeSession.importedAt,
          seriesCount: activeSession.seriesCount,
          observationCount: activeSession.observationCount,
        }
      : null,
    lastImportReport: activeSession?.datasetPayload.importReport ?? null,
    preserveAnalysisConfiguration:
      patch.project.datasets.find((dataset) => dataset.id === patch.activeDatasetId)
        ?.preserveAnalysisOnReimport ?? false,
    visibility: patch.project.analysisConfig.visibility,
    modes: patch.project.analysisConfig.modes,
    selections: patch.project.analysisConfig.selections,
    hiddenLegendKeys: patch.project.analysisConfig.legend.hiddenKeys,
    guidedWorkflowSession: patch.project.workflow.session,
    comparisonSlots: {
      A: {
        label: patch.project.comparison.slots.A.label,
        profile: patch.project.comparison.slots.A.profile,
        sourceDatasetId: patch.project.comparison.slots.A.sourceDatasetId,
      },
      B: {
        label: patch.project.comparison.slots.B.label,
        profile: patch.project.comparison.slots.B.profile,
        sourceDatasetId: patch.project.comparison.slots.B.sourceDatasetId,
      },
    },
    workspace: patch.project.workspace,
    title: patch.project.graphContext?.title ?? "",
    minX: patch.project.graphContext?.minX ?? -10,
    maxX: patch.project.graphContext?.maxX ?? 10,
    visibleMinX: patch.project.graphContext?.visibleMinX ?? -10,
    visibleMaxX: patch.project.graphContext?.visibleMaxX ?? 10,
    autoScaleY: patch.project.graphContext?.autoScaleY ?? false,
    useSecondaryYAxis: patch.project.graphContext?.useSecondaryYAxis ?? false,
    curves:
      patch.project.graphContext?.curves.map((curve) => ({
        expression: curve.expression,
        color: curve.color,
      })) ?? [{ expression: "", color: "#3b82f6" }],
    sessionDatasets: patch.sessionDatasets,
    activeDatasetId: patch.activeDatasetId,
    worksheetModified: activeSession?.worksheetModified ?? false,
    activeColumnRegistry: activeSession?.datasetPayload.columnRegistry,
    activeAuxiliaryColumns: activeSession?.datasetPayload.auxiliaryColumns,
  };
};

export const normalizeWorksheetForCompare = (
  worksheet: ScientificProjectV2["datasets"][number]["worksheet"] | undefined
) =>
  worksheet === undefined
    ? null
    : {
        columnRegistry: worksheet.columnRegistry,
        auxiliaryColumns: worksheet.auxiliaryColumns,
        modified: worksheet.modified,
      };

export const normalizeProjectWorksheetsForCompare = (
  project: ScientificProjectV2
): Array<{ id: string; worksheet: ScientificProjectV2["datasets"][number]["worksheet"] | null }> =>
  project.datasets.map((dataset) => ({
    id: dataset.id,
    worksheet: dataset.worksheet ?? null,
  }));

export const worksheetsEquivalent = (
  left: ScientificProjectV2,
  right: ScientificProjectV2
): boolean =>
  JSON.stringify(normalizeProjectWorksheetsForCompare(left)) ===
  JSON.stringify(normalizeProjectWorksheetsForCompare(right));

export const runWorksheetPipelineRoundTrip = (
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
      `Worksheet pipeline round-trip: first serialize failed: ${JSON.stringify(firstSerialized.errors)}`
    );
  }

  const hydrated = hydrateProjectJson(firstSerialized.json);
  if (!hydrated.ok) {
    throw new Error("Worksheet pipeline round-trip: hydrate failed.");
  }

  const reloadedContext = patchToCollectContextV2WithWorksheet(hydrated.patch);
  const secondProject = collectProjectSnapshotV2(reloadedContext);

  return {
    firstProject: normalizeProjectForRoundTrip(firstProject),
    secondProject: normalizeProjectForRoundTrip(secondProject),
    hydratedPatch: hydrated.patch,
  };
};

export type WorksheetEditorState = {
  experimentalSeries: ExperimentalSeries[];
  lastImportReport: ImportReport | null;
  worksheetModified: boolean;
  columnRegistry: WorksheetColumnRegistry;
  auxiliaryColumns: ImportAuxiliaryColumn[];
};

export const persistActiveSessionDatasetForTest = (
  registry: SessionDataset[],
  activeId: string | null,
  editor: WorksheetEditorState
): SessionDataset[] => {
  if (!activeId) {
    return registry;
  }

  return registry.map((dataset) =>
    dataset.id === activeId
      ? updateSessionDatasetPayload(
          dataset,
          editor.experimentalSeries,
          editor.lastImportReport,
          editor.worksheetModified,
          {
            columnRegistry: editor.columnRegistry,
            auxiliaryColumns: editor.auxiliaryColumns,
          }
        )
      : dataset
  );
};

export const loadSessionDatasetEditorState = (
  dataset: SessionDataset
): WorksheetEditorState => {
  const series = dataset.datasetPayload.series;

  return {
    experimentalSeries: series,
    lastImportReport: dataset.datasetPayload.importReport,
    worksheetModified: dataset.worksheetModified,
    columnRegistry:
      dataset.datasetPayload.columnRegistry ??
      buildColumnRegistryFromImportAuxiliary(
        seriesToWorksheet(series).columns,
        dataset.datasetPayload.auxiliaryColumns
      ),
    auxiliaryColumns: dataset.datasetPayload.auxiliaryColumns ?? [],
  };
};

export const activateSessionDatasetForTest = (
  registry: SessionDataset[],
  activeId: string | null,
  targetId: string,
  editor: WorksheetEditorState
): {
  registry: SessionDataset[];
  activeId: string;
  editor: WorksheetEditorState;
} | null => {
  const persisted = persistActiveSessionDatasetForTest(registry, activeId, editor);
  const target = persisted.find((dataset) => dataset.id === targetId);
  if (!target) {
    return null;
  }

  return {
    registry: persisted,
    activeId: targetId,
    editor: loadSessionDatasetEditorState(target),
  };
};

export const prepareCollectContextForSaveForTest = (
  ctx: EditorProjectCollectContextV2,
  editor: WorksheetEditorState
): EditorProjectCollectContextV2 => ({
  ...ctx,
  sessionDatasets: persistActiveSessionDatasetForTest(
    [...ctx.sessionDatasets],
    ctx.activeDatasetId,
    editor
  ),
});
