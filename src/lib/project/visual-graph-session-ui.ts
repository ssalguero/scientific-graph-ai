import {
  isSessionRuntimeDatasetId,
  preservePersistedDatasetId,
  toSequencedDatasetId,
} from "@/lib/project/domain";
import { projectVisualGraphEntriesToPersistedV2 } from "@/lib/project/domain/mappers/visual-graph";
import type {
  ProjectVisualGraphPersistedV2,
  ScientificProjectV2,
} from "@/lib/project/domain/types-v2";
import type { EditorProjectCollectContextV2 } from "@/lib/project/editor-collect-context-v2";
import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { ImportReport } from "@/lib/import/types";
import type {
  SessionDataset,
  SessionDatasetPayload,
} from "@/lib/sessionDatasetRegistry";
import { updateSessionDatasetPayload } from "@/lib/sessionDatasetRegistry";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";

export type SessionDatasetPayloadWithVisualGraphs = SessionDatasetPayload & {
  visualGraphEntries?: ProjectVisualGraphEntry[];
};

const cloneVisualGraphPreview = (
  preview: ProjectVisualGraphEntry["preview"]
): ProjectVisualGraphEntry["preview"] => ({
  ...preview,
  scatterPoints: preview.scatterPoints?.map((point) => ({ ...point })),
  lineSeries: preview.lineSeries?.map((series) => ({
    ...series,
    points: series.points.map((point) => ({ ...point })),
  })),
  bars: preview.bars?.map((bar) => ({ ...bar })),
  histogramBins: preview.histogramBins?.map((bin) => ({ ...bin })),
  boxPlots: preview.boxPlots?.map((box) => ({ ...box })),
  violinPlots: preview.violinPlots?.map((violin) => ({ ...violin })),
});

export const cloneProjectVisualGraphEntry = (
  entry: ProjectVisualGraphEntry
): ProjectVisualGraphEntry => ({
  id: entry.id,
  graphSpec: { ...entry.graphSpec },
  preview: cloneVisualGraphPreview(entry.preview),
  displaySeries: entry.displaySeries.map((series) => ({
    ...series,
    points: series.points.map((point) => ({ ...point })),
  })),
  createdAt: entry.createdAt,
});

export const cloneProjectVisualGraphEntries = (
  entries: readonly ProjectVisualGraphEntry[]
): ProjectVisualGraphEntry[] => entries.map(cloneProjectVisualGraphEntry);

export const readVisualGraphEntriesFromDataset = (
  dataset: SessionDataset | undefined
): ProjectVisualGraphEntry[] => {
  const payload = dataset?.datasetPayload as SessionDatasetPayloadWithVisualGraphs;
  return cloneProjectVisualGraphEntries(payload?.visualGraphEntries ?? []);
};

export const persistActiveVisualGraphsInRegistry = (
  registry: readonly SessionDataset[],
  activeDatasetId: string | null,
  entries: readonly ProjectVisualGraphEntry[]
): SessionDataset[] => {
  if (!activeDatasetId) {
    return [...registry];
  }

  const clonedEntries = cloneProjectVisualGraphEntries(entries);

  return registry.map((dataset) =>
    dataset.id === activeDatasetId
      ? {
          ...dataset,
          datasetPayload: {
            ...dataset.datasetPayload,
            visualGraphEntries: clonedEntries,
          } as SessionDatasetPayloadWithVisualGraphs,
        }
      : dataset
  );
};

export const clearVisualGraphEntriesInRegistry = (
  registry: readonly SessionDataset[]
): SessionDataset[] =>
  registry.map((dataset) => ({
    ...dataset,
    datasetPayload: {
      ...dataset.datasetPayload,
      visualGraphEntries: undefined,
    } as SessionDatasetPayloadWithVisualGraphs,
  }));

export const removeVisualGraphEntriesForDatasetFromRegistry = (
  registry: readonly SessionDataset[],
  datasetId: string
): SessionDataset[] =>
  registry.map((dataset) =>
    dataset.id === datasetId
      ? {
          ...dataset,
          datasetPayload: {
            ...dataset.datasetPayload,
            visualGraphEntries: undefined,
          } as SessionDatasetPayloadWithVisualGraphs,
        }
      : dataset
  );

export const flattenVisualGraphCollectInputsFromRegistry = (
  registry: readonly SessionDataset[]
): { entry: ProjectVisualGraphEntry; sourceDatasetId: string }[] => {
  const inputs: { entry: ProjectVisualGraphEntry; sourceDatasetId: string }[] = [];

  for (const dataset of registry) {
    const payload = dataset.datasetPayload as SessionDatasetPayloadWithVisualGraphs;
    const entries = payload.visualGraphEntries;
    if (entries === undefined || entries.length === 0) {
      continue;
    }

    for (const entry of entries) {
      inputs.push({
        entry: cloneProjectVisualGraphEntry(entry),
        sourceDatasetId: dataset.id,
      });
    }
  }

  return inputs;
};

export const injectVisualGraphEntriesBySourceDatasetId = (
  registry: readonly SessionDataset[],
  persisted: readonly ProjectVisualGraphPersistedV2[],
  runtimeEntries: readonly ProjectVisualGraphEntry[]
): SessionDataset[] => {
  const runtimeById = new Map(runtimeEntries.map((entry) => [entry.id, entry]));
  const sourceById = new Map(
    persisted.map((entry) => [entry.id, entry.sourceDatasetId])
  );

  const buckets = new Map<string, ProjectVisualGraphEntry[]>();

  for (const [id, runtimeEntry] of runtimeById) {
    const sourceDatasetId = sourceById.get(id);
    if (sourceDatasetId === undefined) {
      continue;
    }

    const bucket = buckets.get(sourceDatasetId) ?? [];
    bucket.push(cloneProjectVisualGraphEntry(runtimeEntry));
    buckets.set(sourceDatasetId, bucket);
  }

  return registry.map((dataset) => {
    const entries = buckets.get(dataset.id);
    if (entries === undefined) {
      return dataset;
    }

    return {
      ...dataset,
      datasetPayload: {
        ...dataset.datasetPayload,
        visualGraphEntries: entries,
      } as SessionDatasetPayloadWithVisualGraphs,
    };
  });
};

export const preserveVisualGraphEntriesOnPayloadUpdate = (
  dataset: SessionDataset
): SessionDatasetPayloadWithVisualGraphs["visualGraphEntries"] => {
  const payload = dataset.datasetPayload as SessionDatasetPayloadWithVisualGraphs;
  return payload.visualGraphEntries
    ? cloneProjectVisualGraphEntries(payload.visualGraphEntries)
    : undefined;
};

export const updateSessionDatasetPayloadPreservingVisualGraphs = (
  dataset: SessionDataset,
  series: ExperimentalSeries[],
  importReport: ImportReport | null,
  worksheetModified: boolean,
  payloadExtras?: Pick<
    SessionDatasetPayload,
    "columnRegistry" | "auxiliaryColumns"
  >
): SessionDataset => {
  const visualGraphEntries = preserveVisualGraphEntriesOnPayloadUpdate(dataset);
  const updated = updateSessionDatasetPayload(
    dataset,
    series,
    importReport,
    worksheetModified,
    payloadExtras
  );

  return {
    ...updated,
    datasetPayload: {
      ...updated.datasetPayload,
      visualGraphEntries,
    } as SessionDatasetPayloadWithVisualGraphs,
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

/**
 * C5 assigns a single sourceDatasetId (active) to all projectVisualGraphEntries.
 * Multi-dataset save merges buckets from sessionDatasets via C4 mapper post-collect.
 */
export const mergeVisualGraphsFromSessionIntoProjectSnapshot = (
  project: ScientificProjectV2,
  ctx: EditorProjectCollectContextV2
): ScientificProjectV2 => {
  const inputs = flattenVisualGraphCollectInputsFromRegistry(ctx.sessionDatasets);
  if (inputs.length === 0) {
    const { visualGraphs: _removed, ...rest } = project;
    return rest;
  }

  const visualGraphs = projectVisualGraphEntriesToPersistedV2(inputs, {
    remap: buildDatasetIdRemap(ctx.sessionDatasets, ctx.metadata.id),
    projectMetadataId: ctx.metadata.id,
  });

  if (visualGraphs === undefined) {
    const { visualGraphs: _removed, ...rest } = project;
    return rest;
  }

  return {
    ...project,
    visualGraphs,
  };
};

export const prepareCollectContextWithSessionVisualGraphs = (
  ctx: EditorProjectCollectContextV2,
  activeVisualGraphs: readonly ProjectVisualGraphEntry[]
): EditorProjectCollectContextV2 => {
  const sessionDatasets = persistActiveVisualGraphsInRegistry(
    ctx.sessionDatasets,
    ctx.activeDatasetId,
    activeVisualGraphs
  );

  return {
    ...ctx,
    sessionDatasets,
    projectVisualGraphEntries: undefined,
  };
};
