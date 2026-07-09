import { VisualGraphDomainError } from "@/lib/project/domain/visual-graph-domain";
import {
  persistedVisualGraphsEquivalent,
  projectVisualGraphEntriesToPersistedV2,
  projectVisualGraphEntryToPersistedV2,
  projectVisualGraphPersistedListToRuntimeEntries,
  projectVisualGraphPersistedV2ToRuntimeEntry,
} from "@/lib/project/domain/mappers/visual-graph";
import { remapVisualGraphSourceDatasetIds } from "@/lib/project/domain/visual-graph-domain";
import { toPrimaryDatasetId, toSequencedDatasetId } from "@/lib/project/domain";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  buildInvalidVisualGraphPersisted,
  buildSampleVisualGraphEntry,
  buildSampleVisualGraphPersisted,
  buildVisualGraphHydrateContextFromSeries,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  SAMPLE_VGB_DATASET_ID,
  SAMPLE_VGB_LINE_SPEC_INPUT,
  SAMPLE_VGB_HEATMAP_SPEC_INPUT,
  SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  SAMPLE_VGB_PCA_SPEC_INPUT,
  SAMPLE_VGB_PROJECT_ID,
  SAMPLE_VGB_SCATTER_SPEC_INPUT,
  cloneVisualGraphPreview,
} from "./visual-graph-mapper-helpers";

const SESSION_DATASET_ID = "session-ds-alpha";

export const runVisualGraphMapperCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const runtimeEntry = buildSampleVisualGraphEntry();
  const persisted = projectVisualGraphEntryToPersistedV2(
    runtimeEntry,
    SAMPLE_VGB_DATASET_ID
  );

  assertCase(
    "mapper.vgbR1.noEphemeralKeys",
    hasOnlyPersistedVisualGraphKeys(persisted as unknown as Record<string, unknown>)
  );

  assertCase(
    "mapper.vgbR1.noPreviewInGraphSpec",
    PREVIEW_ONLY_EPHEMERAL_KEYS.every(
      (key) => !(key in (persisted.graphSpec as unknown as Record<string, unknown>))
    )
  );

  const leakyRuntime = {
    ...runtimeEntry,
    preview: runtimeEntry.preview,
    displaySeries: runtimeEntry.displaySeries,
    extraDerivedCache: { cached: true },
  } as typeof runtimeEntry & { extraDerivedCache: { cached: boolean } };

  const persistedFromLeaky = projectVisualGraphEntryToPersistedV2(
    leakyRuntime,
    SAMPLE_VGB_DATASET_ID
  );

  assertCase(
    "mapper.vgbR1.noSpreadLeakage",
    hasOnlyPersistedVisualGraphKeys(
      persistedFromLeaky as unknown as Record<string, unknown>
    ) &&
      !("preview" in (persistedFromLeaky as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (persistedFromLeaky as unknown as Record<string, unknown>)) &&
      !("extraDerivedCache" in (persistedFromLeaky as unknown as Record<string, unknown>))
  );

  assertCase(
    "mapper.runtimeToPersisted.stripsEphemeral",
    !("preview" in (persisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (persisted as unknown as Record<string, unknown>))
  );

  assertCase(
    "mapper.runtimeToPersisted.exactFields",
    hasOnlyPersistedVisualGraphKeys(persisted as unknown as Record<string, unknown>)
  );

  assertCase(
    "mapper.runtimeToPersisted.preservesSpec",
    JSON.stringify(persisted.graphSpec) === JSON.stringify(runtimeEntry.graphSpec)
  );

  assertCase(
    "mapper.runtimeToPersisted.sourceDatasetId",
    persisted.sourceDatasetId === SAMPLE_VGB_DATASET_ID
  );

  const hydrateContext = buildVisualGraphHydrateContextFromSeries();
  const persistedSample = buildSampleVisualGraphPersisted();
  const rebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    persistedSample,
    hydrateContext
  );

  assertCase(
    "mapper.persistedToRuntime.rebuildsPreview",
    rebuilt !== null &&
      rebuilt.preview.graphType === persistedSample.graphSpec.graphType &&
      rebuilt.preview.scatterPoints.length > 0
  );

  assertCase(
    "mapper.persistedToRuntime.rebuildsDisplaySeries",
    rebuilt !== null &&
      rebuilt.displaySeries.length === 1 &&
      rebuilt.displaySeries[0]?.points.length === 3
  );

  const roundTripPersisted = projectVisualGraphEntryToPersistedV2(
    rebuilt!,
    persistedSample.sourceDatasetId
  );

  assertCase(
    "mapper.roundTrip.specStable",
    persistedVisualGraphsEquivalent(persistedSample, roundTripPersisted)
  );

  assertCase(
    "mapper.empty.omits",
    projectVisualGraphEntriesToPersistedV2([]) === undefined
  );

  assertCase(
    "mapper.b2Compat.noVisualGraphs",
    projectVisualGraphEntriesToPersistedV2(undefined) === undefined
  );

  const previewBefore = cloneVisualGraphPreview(runtimeEntry.preview);
  const displaySeriesBefore = runtimeEntry.displaySeries.map((series) => ({
    ...series,
    points: series.points.map((point) => ({ ...point })),
  }));

  projectVisualGraphEntryToPersistedV2(runtimeEntry, SAMPLE_VGB_DATASET_ID);

  assertCase(
    "mapper.immutability.inputUntouched",
    JSON.stringify(runtimeEntry.preview) === JSON.stringify(previewBefore) &&
      JSON.stringify(runtimeEntry.displaySeries) === JSON.stringify(displaySeriesBefore)
  );

  const remappedDatasetId = toSequencedDatasetId(SAMPLE_VGB_PROJECT_ID, 2);
  const remap = new Map<string, string>([[SESSION_DATASET_ID, remappedDatasetId]]);
  const remapped = remapVisualGraphSourceDatasetIds(
    [
      buildSampleVisualGraphPersisted({
        sourceDatasetId: SESSION_DATASET_ID,
      }),
    ],
    remap,
    SAMPLE_VGB_PROJECT_ID
  );

  assertCase(
    "mapper.remap.sourceDatasetId",
    remapped.length === 1 && remapped[0]?.sourceDatasetId === remappedDatasetId
  );

  let idMismatchThrown = false;
  try {
    projectVisualGraphEntryToPersistedV2(
      {
        ...runtimeEntry,
        id: "entry-id-mismatch",
      },
      SAMPLE_VGB_DATASET_ID
    );
  } catch (error) {
    idMismatchThrown =
      error instanceof VisualGraphDomainError && error.code === "VGB-ID-MISMATCH";
  }

  assertCase("mapper.idConsistency", idMismatchThrown);

  const invalidPersisted = buildInvalidVisualGraphPersisted();
  const failedRebuild = projectVisualGraphPersistedV2ToRuntimeEntry(
    invalidPersisted,
    hydrateContext
  );

  assertCase("mapper.rebuild.failureReturnsNull", failedRebuild === null);

  const scatterEntry = buildSampleVisualGraphEntry({
    graphId: "vg-scatter-multi",
    specInput: SAMPLE_VGB_SCATTER_SPEC_INPUT,
  });
  const lineEntry = buildSampleVisualGraphEntry({
    graphId: "vg-line-multi",
    createdAt: "2026-06-29T12:01:00.000Z",
    specInput: SAMPLE_VGB_LINE_SPEC_INPUT,
  });

  const multiPersisted = projectVisualGraphEntriesToPersistedV2([
    { entry: scatterEntry, sourceDatasetId: SAMPLE_VGB_DATASET_ID },
    {
      entry: lineEntry,
      sourceDatasetId: toSequencedDatasetId(SAMPLE_VGB_PROJECT_ID, 2),
    },
  ]);

  assertCase(
    "mapper.multiEntry.independent",
    multiPersisted !== undefined &&
      multiPersisted.length === 2 &&
      multiPersisted[0]?.id === "vg-scatter-multi" &&
      multiPersisted[1]?.id === "vg-line-multi" &&
      multiPersisted[0]?.graphSpec.graphType === "scatter" &&
      multiPersisted[1]?.graphSpec.graphType === "line"
  );

  const multiRuntime = projectVisualGraphPersistedListToRuntimeEntries(
    multiPersisted ?? [],
    (sourceDatasetId) =>
      sourceDatasetId === SAMPLE_VGB_DATASET_ID ||
      sourceDatasetId === toSequencedDatasetId(SAMPLE_VGB_PROJECT_ID, 2)
        ? hydrateContext
        : undefined
  );

  assertCase(
    "mapper.multiEntry.runtimeRebuild",
    multiRuntime.length === 2 &&
      multiRuntime[0]?.preview.graphType === "scatter" &&
      multiRuntime[0]?.preview.scatterPoints.length > 0 &&
      multiRuntime[1]?.preview.graphType === "line" &&
      (multiRuntime[1]?.preview.lineSeries?.length ?? 0) > 0
  );

  const collectRemapped = projectVisualGraphEntriesToPersistedV2(
    [{ entry: runtimeEntry, sourceDatasetId: SESSION_DATASET_ID }],
    {
      remap,
      projectMetadataId: SAMPLE_VGB_PROJECT_ID,
    }
  );

  assertCase(
    "mapper.collect.remapOption",
    collectRemapped !== undefined &&
      collectRemapped[0]?.sourceDatasetId === remappedDatasetId
  );

  const heatmapEntry = buildSampleVisualGraphEntry({
    graphId: "vg-heatmap-mapper",
    specInput: SAMPLE_VGB_HEATMAP_SPEC_INPUT,
  });
  const heatmapPersisted = projectVisualGraphEntryToPersistedV2(
    heatmapEntry,
    SAMPLE_VGB_DATASET_ID
  );

  assertCase(
    "mapper.heatmap.runtimeToPersisted",
    heatmapPersisted.graphSpec.graphType === "heatmap" &&
      heatmapPersisted.graphSpec.colorVariable === null &&
      hasOnlyPersistedVisualGraphKeys(heatmapPersisted as unknown as Record<string, unknown>)
  );

  assertCase(
    "mapper.heatmap.vgbR1.noHeatmapDataInGraphSpec",
    !("heatmapData" in (heatmapPersisted.graphSpec as unknown as Record<string, unknown>)) &&
      !("preview" in (heatmapPersisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (heatmapPersisted as unknown as Record<string, unknown>)) &&
      PREVIEW_ONLY_EPHEMERAL_KEYS.every(
        (key) => !(key in (heatmapPersisted.graphSpec as unknown as Record<string, unknown>))
      )
  );

  const heatmapRebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    heatmapPersisted,
    hydrateContext
  );
  assertCase(
    "mapper.heatmap.runtimeRebuild",
    heatmapRebuilt !== null &&
      heatmapRebuilt.preview.graphType === "heatmap" &&
      heatmapRebuilt.preview.heatmapData.length > 0 &&
      heatmapRebuilt.displaySeries.length === 0
  );

  const bubbleEntry = buildSampleVisualGraphEntry({
    graphId: "vg-bubble-mapper",
    specInput: SAMPLE_VGB_BUBBLE_SPEC_INPUT,
  });
  const bubblePersisted = projectVisualGraphEntryToPersistedV2(
    bubbleEntry,
    SAMPLE_VGB_DATASET_ID
  );

  assertCase(
    "mapper.bubble.runtimeToPersisted",
    bubblePersisted.graphSpec.graphType === "bubble" &&
      bubblePersisted.graphSpec.sizeVariable === "tratamiento1" &&
      hasOnlyPersistedVisualGraphKeys(bubblePersisted as unknown as Record<string, unknown>)
  );

  assertCase(
    "mapper.bubble.vgbR1.noBubbleDataInGraphSpec",
    !("bubbleData" in (bubblePersisted.graphSpec as unknown as Record<string, unknown>)) &&
      !("preview" in (bubblePersisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (bubblePersisted as unknown as Record<string, unknown>)) &&
      PREVIEW_ONLY_EPHEMERAL_KEYS.every(
        (key) => !(key in (bubblePersisted.graphSpec as unknown as Record<string, unknown>))
      )
  );

  const bubbleRebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    bubblePersisted,
    hydrateContext
  );
  assertCase(
    "mapper.bubble.runtimeRebuild",
    bubbleRebuilt !== null &&
      bubbleRebuilt.preview.graphType === "bubble" &&
      bubbleRebuilt.preview.bubbleData.length > 0 &&
      bubbleRebuilt.displaySeries.length === 0
  );

  const pcaEntry = buildSampleVisualGraphEntry({
    graphId: "vg-pca-mapper",
    specInput: SAMPLE_VGB_PCA_SPEC_INPUT,
  });
  const pcaPersisted = projectVisualGraphEntryToPersistedV2(
    pcaEntry,
    SAMPLE_VGB_DATASET_ID
  );

  assertCase(
    "mapper.pca.runtimeToPersisted",
    pcaPersisted.graphSpec.graphType === "pca" &&
      pcaPersisted.graphSpec.pcaVariables?.length === 2 &&
      pcaPersisted.graphSpec.pcaStandardize === true &&
      hasOnlyPersistedVisualGraphKeys(pcaPersisted as unknown as Record<string, unknown>)
  );

  assertCase(
    "mapper.pca.vgbR1.noPcaDataInGraphSpec",
    !("pcaData" in (pcaPersisted.graphSpec as unknown as Record<string, unknown>)) &&
      !("pcaMeta" in (pcaPersisted.graphSpec as unknown as Record<string, unknown>)) &&
      !("preview" in (pcaPersisted as unknown as Record<string, unknown>)) &&
      !("displaySeries" in (pcaPersisted as unknown as Record<string, unknown>)) &&
      PREVIEW_ONLY_EPHEMERAL_KEYS.every(
        (key) => !(key in (pcaPersisted.graphSpec as unknown as Record<string, unknown>))
      )
  );

  const pcaRebuilt = projectVisualGraphPersistedV2ToRuntimeEntry(
    pcaPersisted,
    hydrateContext
  );
  assertCase(
    "mapper.pca.runtimeRebuild",
    pcaRebuilt !== null &&
      pcaRebuilt.preview.graphType === "pca" &&
      pcaRebuilt.preview.pcaData.length > 0 &&
      pcaRebuilt.preview.pcaMeta !== null &&
      pcaRebuilt.displaySeries.length === 0
  );

  return results;
};
