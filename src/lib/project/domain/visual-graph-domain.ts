import type { GraphSpecification } from "@/lib/visualGraphBuilder";
import { sanitizePublicationPresetId } from "@/lib/visualGraphBuilder";

import {
  isSessionRuntimeDatasetId,
  preservePersistedDatasetId,
  toSequencedDatasetId,
} from "./dataset-id-policy";
import type { ProjectVisualGraphPersistedV2 } from "./types-v2";

export const PERSISTED_VISUAL_GRAPH_ENTRY_KEYS = [
  "id",
  "graphSpec",
  "sourceDatasetId",
  "createdAt",
] as const;

export class VisualGraphDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "VisualGraphDomainError";
    this.code = code;
  }
}

export const cloneGraphSpecification = (
  spec: GraphSpecification
): GraphSpecification => ({
  graphType: spec.graphType,
  xVariable: spec.xVariable,
  yVariable: spec.yVariable,
  groupVariable: spec.groupVariable,
  color: spec.color,
  marker: spec.marker,
  lineStyle: spec.lineStyle,
  markerSize: spec.markerSize,
  errorBars: spec.errorBars,
  bins: spec.bins,
  title: spec.title,
  ...(spec.graphType === "heatmap" || spec.colorVariable !== undefined
    ? { colorVariable: spec.colorVariable ?? null }
    : {}),
  ...(spec.graphType === "bubble"
    ? { sizeVariable: spec.sizeVariable ?? null }
    : {}),
  ...(spec.graphType === "pca"
    ? {
        pcaVariables: [...(spec.pcaVariables ?? [])],
        pcaStandardize: spec.pcaStandardize ?? true,
      }
    : {}),
  publicationPresetId: sanitizePublicationPresetId(spec.publicationPresetId),
  id: spec.id,
  createdAt: spec.createdAt,
  xLabel: spec.xLabel,
  yLabel: spec.yLabel,
  groupLabel: spec.groupLabel,
});

export const cloneProjectVisualGraphPersistedV2 = (
  entry: ProjectVisualGraphPersistedV2
): ProjectVisualGraphPersistedV2 => ({
  id: entry.id,
  graphSpec: cloneGraphSpecification(entry.graphSpec),
  sourceDatasetId: entry.sourceDatasetId,
  createdAt: entry.createdAt,
});

export const cloneProjectVisualGraphPersistedList = (
  entries: readonly ProjectVisualGraphPersistedV2[]
): ProjectVisualGraphPersistedV2[] =>
  entries.map(cloneProjectVisualGraphPersistedV2);

export const isVisualGraphPayloadEmpty = (
  entries: readonly ProjectVisualGraphPersistedV2[] | undefined
): boolean => entries === undefined || entries.length === 0;

const resolveRemappedDatasetId = (
  sessionId: string,
  projectMetadataId: string,
  sequencedIndex: number
): string => {
  if (isSessionRuntimeDatasetId(sessionId)) {
    return toSequencedDatasetId(projectMetadataId, sequencedIndex);
  }

  return preservePersistedDatasetId(sessionId);
};

export const remapVisualGraphSourceDatasetId = (
  sourceDatasetId: string,
  remap: Map<string, string>,
  projectMetadataId: string
): string => {
  if (sourceDatasetId.trim() === "") {
    return sourceDatasetId;
  }

  if (remap.has(sourceDatasetId)) {
    return remap.get(sourceDatasetId)!;
  }

  if (isSessionRuntimeDatasetId(sourceDatasetId)) {
    return preservePersistedDatasetId(
      resolveRemappedDatasetId(sourceDatasetId, projectMetadataId, remap.size + 1)
    );
  }

  return preservePersistedDatasetId(sourceDatasetId);
};

export const remapVisualGraphSourceDatasetIds = (
  entries: readonly ProjectVisualGraphPersistedV2[],
  remap: Map<string, string>,
  projectMetadataId: string
): ProjectVisualGraphPersistedV2[] =>
  entries.map((entry) => ({
    id: entry.id,
    graphSpec: cloneGraphSpecification(entry.graphSpec),
    sourceDatasetId: remapVisualGraphSourceDatasetId(
      entry.sourceDatasetId,
      remap,
      projectMetadataId
    ),
    createdAt: entry.createdAt,
  }));

export const assertVisualGraphIdConsistency = (input: {
  id: string;
  graphSpec: GraphSpecification;
}): void => {
  if (input.id !== input.graphSpec.id) {
    throw new VisualGraphDomainError(
      "VGB-ID-MISMATCH",
      `Visual graph entry id "${input.id}" does not match graphSpec.id "${input.graphSpec.id}".`
    );
  }
};
