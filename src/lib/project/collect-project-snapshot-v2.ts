import type { ImportReport } from "@/lib/import/types";
import { sessionDatasetToProjectDatasetV2 } from "@/lib/project/adapters/sgproj/map-session-dataset";
import {
  cloneExperimentalSeries,
  computeDatasetMetrics,
  isSessionRuntimeDatasetId,
  preservePersistedDatasetId,
  toPrimaryDatasetId,
  toSequencedDatasetId,
} from "@/lib/project/domain";
import type {
  ComparisonSlotV2,
  ProjectComparisonV2,
  ProjectDatasetV2,
  ScientificProjectV2,
} from "@/lib/project/domain/types-v2";
import { projectVisualGraphEntriesToPersistedV2 } from "@/lib/project/domain/mappers/visual-graph";
import { resolveVisualGraphCollectInputs } from "@/lib/project/collect-visual-graph-v2";
import type {
  EditorProjectCollectContextV2,
  EditorComparisonSlotCollect,
} from "@/lib/project/editor-collect-context-v2";
import type { ProjectGraphContextV1 } from "@/lib/project/types";
import type { SessionDataset } from "@/lib/sessionDatasetRegistry";

const cloneImportReport = (report: ImportReport | null): ImportReport | null =>
  report ? { ...report } : null;

const cloneSessionDataset = (dataset: SessionDataset): SessionDataset => ({
  id: dataset.id,
  name: dataset.name,
  importedAt: dataset.importedAt,
  seriesCount: dataset.seriesCount,
  observationCount: dataset.observationCount,
  worksheetModified: dataset.worksheetModified,
  preserveAnalysisOnReimport: dataset.preserveAnalysisOnReimport,
  datasetPayload: {
    series: cloneExperimentalSeries(dataset.datasetPayload.series),
    importReport: cloneImportReport(dataset.datasetPayload.importReport),
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
});

const mergeActiveEditorIntoSession = (
  dataset: SessionDataset,
  ctx: EditorProjectCollectContextV2
): SessionDataset => {
  const clonedSeries = cloneExperimentalSeries(ctx.experimentalSeries);
  const metrics = computeDatasetMetrics(clonedSeries);

  return {
    ...dataset,
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified: ctx.worksheetModified ?? dataset.worksheetModified,
    datasetPayload: {
      series: clonedSeries,
      importReport: cloneImportReport(ctx.lastImportReport),
      columnRegistry:
        ctx.activeColumnRegistry ?? dataset.datasetPayload.columnRegistry,
      auxiliaryColumns:
        ctx.activeAuxiliaryColumns ?? dataset.datasetPayload.auxiliaryColumns,
    },
  };
};

const buildMonoSessionDataset = (
  ctx: EditorProjectCollectContextV2,
  datasetId: string
): SessionDataset => {
  const clonedSeries = cloneExperimentalSeries(ctx.experimentalSeries);
  const metrics = computeDatasetMetrics(clonedSeries);

  return {
    id: datasetId,
    name:
      ctx.currentDatasetInfo?.fileName?.trim() ||
      ctx.metadata.name.trim() ||
      "Untitled dataset",
    importedAt: ctx.currentDatasetInfo?.importedAt ?? "",
    seriesCount: metrics.seriesCount,
    observationCount: metrics.observationCount,
    worksheetModified: ctx.worksheetModified ?? false,
    preserveAnalysisOnReimport: ctx.preserveAnalysisConfiguration,
    datasetPayload: {
      series: clonedSeries,
      importReport: cloneImportReport(ctx.lastImportReport),
      columnRegistry: ctx.activeColumnRegistry,
      auxiliaryColumns: ctx.activeAuxiliaryColumns,
    },
  };
};

const resolveCollectDatasetId = (
  sessionId: string,
  projectMetadataId: string,
  sequencedIndex: number
): string => {
  if (isSessionRuntimeDatasetId(sessionId)) {
    return toSequencedDatasetId(projectMetadataId, sequencedIndex);
  }

  return preservePersistedDatasetId(sessionId);
};

const buildDatasetIdRemap = (
  sessions: readonly SessionDataset[],
  projectMetadataId: string
): Map<string, string> => {
  const remap = new Map<string, string>();

  sessions.forEach((session, index) => {
    remap.set(
      session.id,
      resolveCollectDatasetId(session.id, projectMetadataId, index + 1)
    );
  });

  return remap;
};

const remapDatasetId = (
  id: string | null | undefined,
  remap: Map<string, string>,
  projectMetadataId: string
): string | null => {
  if (id == null || id.trim() === "") {
    return null;
  }

  if (remap.has(id)) {
    return remap.get(id)!;
  }

  if (isSessionRuntimeDatasetId(id)) {
    return preservePersistedDatasetId(
      resolveCollectDatasetId(id, projectMetadataId, remap.size + 1)
    );
  }

  return preservePersistedDatasetId(id);
};

export const prepareSessionDatasetsForCollect = (
  ctx: EditorProjectCollectContextV2
): SessionDataset[] => {
  const primaryId = toPrimaryDatasetId(ctx.metadata.id);

  if (ctx.sessionDatasets.length === 0) {
    return [buildMonoSessionDataset(ctx, primaryId)];
  }

  const clonedRegistry = ctx.sessionDatasets.map(cloneSessionDataset);

  if (!ctx.activeDatasetId) {
    return clonedRegistry;
  }

  return clonedRegistry.map((dataset) =>
    dataset.id === ctx.activeDatasetId
      ? mergeActiveEditorIntoSession(dataset, ctx)
      : dataset
  );
};

const buildGraphContext = (
  ctx: EditorProjectCollectContextV2
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

const buildComparisonSlots = (
  ctx: EditorProjectCollectContextV2,
  remap: Map<string, string>
): ProjectComparisonV2 => {
  const buildSlot = (slot: EditorComparisonSlotCollect): ComparisonSlotV2 => ({
    label: slot.label,
    profile: slot.profile,
    sourceDatasetId: remapDatasetId(
      slot.sourceDatasetId,
      remap,
      ctx.metadata.id
    ),
  });

  return {
    slots: {
      A: buildSlot(ctx.comparisonSlots.A),
      B: buildSlot(ctx.comparisonSlots.B),
    },
  };
};

const buildProjectDatasets = (
  ctx: EditorProjectCollectContextV2,
  preparedSessions: readonly SessionDataset[],
  remap: Map<string, string>
): ProjectDatasetV2[] =>
  preparedSessions.map((session) => {
    const persistedId = remap.get(session.id)!;
    const isActive =
      ctx.activeDatasetId != null && session.id === ctx.activeDatasetId;

    return sessionDatasetToProjectDatasetV2(
      {
        ...session,
        id: persistedId,
      },
      isActive
        ? { preserveAnalysisOnReimport: ctx.preserveAnalysisConfiguration }
        : session.preserveAnalysisOnReimport !== undefined
          ? { preserveAnalysisOnReimport: session.preserveAnalysisOnReimport }
          : undefined
    );
  });

const resolveActiveDatasetId = (
  ctx: EditorProjectCollectContextV2,
  datasets: readonly ProjectDatasetV2[],
  remap: Map<string, string>
): string => {
  if (ctx.activeDatasetId) {
    return remapDatasetId(ctx.activeDatasetId, remap, ctx.metadata.id)!;
  }

  if (datasets.length === 1) {
    return datasets[0]!.id;
  }

  return datasets[0]?.id ?? toPrimaryDatasetId(ctx.metadata.id);
};

/**
 * Builds a native V2 project snapshot from runtime editor state.
 * Pure, non-mutating, and does not invoke schema migrators.
 */
export const collectProjectSnapshotV2 = (
  ctx: EditorProjectCollectContextV2
): ScientificProjectV2 => {
  const preparedSessions = prepareSessionDatasetsForCollect(ctx);
  const idRemap = buildDatasetIdRemap(preparedSessions, ctx.metadata.id);
  const datasets = buildProjectDatasets(ctx, preparedSessions, idRemap);
  const activeDatasetId = resolveActiveDatasetId(ctx, datasets, idRemap);
  const visualGraphs = projectVisualGraphEntriesToPersistedV2(
    resolveVisualGraphCollectInputs(ctx, preparedSessions),
    { remap: idRemap, projectMetadataId: ctx.metadata.id }
  );

  return {
    metadata: { ...ctx.metadata },
    datasets,
    activeDatasetId,
    analysisConfig: {
      visibility: { ...ctx.visibility },
      modes: { ...ctx.modes },
      selections: { ...ctx.selections },
      legend: { hiddenKeys: [...ctx.hiddenLegendKeys] },
    },
    workflow: {
      session: { ...ctx.guidedWorkflowSession },
    },
    comparison: buildComparisonSlots(ctx, idRemap),
    workspace: { ...ctx.workspace },
    graphContext: buildGraphContext(ctx),
    ...(visualGraphs !== undefined ? { visualGraphs } : {}),
  };
};
