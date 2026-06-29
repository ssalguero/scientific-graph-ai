import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import {
  applyVisualGraphSpecification,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  type GraphSpecification,
  type ProjectVisualGraphEntry,
  type VisualGraphPreview,
} from "@/lib/visualGraphBuilder";

import { cloneExperimentalSeries } from "../dataset-series-utils";
import {
  assertVisualGraphIdConsistency,
  cloneGraphSpecification,
  cloneProjectVisualGraphPersistedV2,
  isVisualGraphPayloadEmpty,
  remapVisualGraphSourceDatasetId,
} from "../visual-graph-domain";
import type { ProjectDatasetV2, ProjectVisualGraphPersistedV2 } from "../types-v2";

export type VisualGraphCollectInput = {
  entry: ProjectVisualGraphEntry;
  sourceDatasetId: string;
};

export type VisualGraphHydrateContext = {
  series: ExperimentalSeries[];
  columnRegistry?: WorksheetColumnRegistry;
};

export type VisualGraphEntriesToPersistedOptions = {
  remap?: Map<string, string>;
  projectMetadataId?: string;
};

const buildPersistedVisualGraphEntry = (
  id: string,
  graphSpec: GraphSpecification,
  sourceDatasetId: string,
  createdAt: string
): ProjectVisualGraphPersistedV2 => ({
  id,
  graphSpec: cloneGraphSpecification(graphSpec),
  sourceDatasetId,
  createdAt,
});

export const projectVisualGraphEntryToPersistedV2 = (
  entry: ProjectVisualGraphEntry,
  sourceDatasetId: string
): ProjectVisualGraphPersistedV2 => {
  assertVisualGraphIdConsistency(entry);

  return buildPersistedVisualGraphEntry(
    entry.id,
    entry.graphSpec,
    sourceDatasetId,
    entry.createdAt
  );
};

export const projectVisualGraphEntriesToPersistedV2 = (
  inputs: readonly VisualGraphCollectInput[] | undefined,
  options?: VisualGraphEntriesToPersistedOptions
): ProjectVisualGraphPersistedV2[] | undefined => {
  if (inputs === undefined || inputs.length === 0) {
    return undefined;
  }

  const persisted = inputs.map(({ entry, sourceDatasetId }) => {
    const mapped = projectVisualGraphEntryToPersistedV2(entry, sourceDatasetId);

    if (options?.remap === undefined || options.projectMetadataId === undefined) {
      return mapped;
    }

    return buildPersistedVisualGraphEntry(
      mapped.id,
      mapped.graphSpec,
      remapVisualGraphSourceDatasetId(
        mapped.sourceDatasetId,
        options.remap,
        options.projectMetadataId
      ),
      mapped.createdAt
    );
  });

  return isVisualGraphPayloadEmpty(persisted) ? undefined : persisted;
};

export const buildVisualGraphHydrateContextFromDataset = (
  dataset: ProjectDatasetV2
): VisualGraphHydrateContext => ({
  series: cloneExperimentalSeries(dataset.series),
  columnRegistry: dataset.worksheet?.columnRegistry,
});

export const projectVisualGraphPersistedV2ToRuntimeEntry = (
  entry: ProjectVisualGraphPersistedV2,
  context: VisualGraphHydrateContext
): ProjectVisualGraphEntry | null => {
  assertVisualGraphIdConsistency(entry);

  const applied = applyVisualGraphSpecification(
    entry.graphSpec,
    context.series,
    context.columnRegistry ?? {}
  );

  if (!applied.ok) {
    return null;
  }

  return {
    id: entry.id,
    graphSpec: cloneGraphSpecification(entry.graphSpec),
    preview: applied.preview,
    displaySeries: applied.displaySeries,
    createdAt: entry.createdAt,
  };
};

export const projectVisualGraphPersistedListToRuntimeEntries = (
  entries: readonly ProjectVisualGraphPersistedV2[],
  resolveContext: (sourceDatasetId: string) => VisualGraphHydrateContext | undefined
): ProjectVisualGraphEntry[] => {
  const runtimeEntries: ProjectVisualGraphEntry[] = [];

  for (const entry of entries) {
    const context = resolveContext(entry.sourceDatasetId);
    if (context === undefined) {
      continue;
    }

    const runtimeEntry = projectVisualGraphPersistedV2ToRuntimeEntry(entry, context);
    if (runtimeEntry !== null) {
      runtimeEntries.push(runtimeEntry);
    }
  }

  return runtimeEntries;
};

export const persistedVisualGraphsEquivalent = (
  left: ProjectVisualGraphPersistedV2,
  right: ProjectVisualGraphPersistedV2
): boolean => {
  const normalizedLeft = cloneProjectVisualGraphPersistedV2(left);
  const normalizedRight = cloneProjectVisualGraphPersistedV2(right);
  return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
};
