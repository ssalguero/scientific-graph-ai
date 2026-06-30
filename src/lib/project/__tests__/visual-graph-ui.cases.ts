import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import {
  activateSessionVisualGraphsForTest,
  buildDistinctVisualGraphEntries,
  buildUiVisualGraphCollectContext,
  flattenInputsFromContext,
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
  runVisualGraphUiSaveOpenRoundTrip,
  UI_VGB_DATASET_A_ID,
} from "./visual-graph-ui-helpers";
import {
  persistActiveVisualGraphsInRegistry,
  readVisualGraphEntriesFromDataset,
} from "@/lib/project/visual-graph-session-ui";

export const runVisualGraphUiCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const baseContext = buildUiVisualGraphCollectContext();
  const { datasetBId, entryA, entryB } = buildDistinctVisualGraphEntries();

  let registry = baseContext.sessionDatasets;
  let activeId = UI_VGB_DATASET_A_ID;
  let activeVisualGraphs = [entryA];

  const stashA = persistActiveVisualGraphsInRegistry(registry, activeId, activeVisualGraphs);
  assertCase(
    "ui.vgb.invariantCD.createOnA",
    readVisualGraphEntriesFromDataset(
      stashA.find((dataset) => dataset.id === UI_VGB_DATASET_A_ID)
    ).length === 1
  );

  const switchToB = activateSessionVisualGraphsForTest(
    stashA,
    activeId,
    activeVisualGraphs,
    datasetBId
  );
  assertCase("ui.vgb.invariantCD.switchToB", switchToB !== null);
  if (!switchToB) {
    return results;
  }

  registry = switchToB.registry;
  activeId = switchToB.activeId;
  activeVisualGraphs = [...switchToB.activeVisualGraphs, entryB];

  const stashB = persistActiveVisualGraphsInRegistry(registry, activeId, activeVisualGraphs);
  assertCase(
    "ui.vgb.invariantCD.createOnB",
    readVisualGraphEntriesFromDataset(
      stashB.find((dataset) => dataset.id === datasetBId)
    ).length === 1 &&
      readVisualGraphEntriesFromDataset(
        stashB.find((dataset) => dataset.id === UI_VGB_DATASET_A_ID)
      ).length === 1
  );

  const switchBackToA = activateSessionVisualGraphsForTest(
    stashB,
    activeId,
    activeVisualGraphs,
    UI_VGB_DATASET_A_ID
  );
  assertCase(
    "ui.vgb.invariantCD.switchCycle",
    switchBackToA !== null &&
      switchBackToA.activeVisualGraphs.length === 1 &&
      switchBackToA.activeVisualGraphs[0]?.id === entryA.id
  );

  assertCase(
    "ui.vgb.invariantCD.previewSurvivesSwitch",
    switchBackToA !== null &&
      switchBackToA.activeVisualGraphs[0]?.preview !== undefined &&
      Object.keys(switchBackToA.activeVisualGraphs[0]?.preview ?? {}).length > 0
  );

  assertCase(
    "ui.vgb.invariantCD.noCrossContamination",
    switchBackToA !== null &&
      !switchBackToA.activeVisualGraphs.some((entry) => entry.id === entryB.id)
  );

  const switchToBAgain = activateSessionVisualGraphsForTest(
    stashB,
    UI_VGB_DATASET_A_ID,
    switchBackToA!.activeVisualGraphs,
    datasetBId
  );
  assertCase(
    "ui.vgb.invariantCD.switchToBAgain",
    switchToBAgain !== null &&
      switchToBAgain.activeVisualGraphs.length === 1 &&
      switchToBAgain.activeVisualGraphs[0]?.id === entryB.id
  );

  const saveContext = buildUiVisualGraphCollectContext({
    sessionDatasets: stashB,
    activeDatasetId: datasetBId,
  });
  const roundTrip = runVisualGraphUiSaveOpenRoundTrip(saveContext, [entryB]);

  assertCase(
    "ui.vgb.save.multiDatasetSourceIds",
    roundTrip.merged.visualGraphs !== undefined &&
      roundTrip.merged.visualGraphs.length === 2 &&
      new Set(roundTrip.merged.visualGraphs.map((entry) => entry.sourceDatasetId)).size ===
        2 &&
      roundTrip.merged.visualGraphs.some(
        (entry) => entry.sourceDatasetId === UI_VGB_DATASET_A_ID && entry.id === entryA.id
      ) &&
      roundTrip.merged.visualGraphs.some(
        (entry) => entry.sourceDatasetId === datasetBId && entry.id === entryB.id
      )
  );

  assertCase(
    "ui.vgb.hydrate.partitionsBySourceDataset",
    readVisualGraphEntriesFromDataset(
      roundTrip.injectedRegistry.find((dataset) => dataset.id === UI_VGB_DATASET_A_ID)
    ).length === 1 &&
      readVisualGraphEntriesFromDataset(
        roundTrip.injectedRegistry.find((dataset) => dataset.id === datasetBId)
      ).length === 1
  );

  const remainingAfterRemove = stashB.filter((dataset) => dataset.id !== datasetBId);
  assertCase(
    "ui.vgb.removeDataset.onlyAffectedBucket",
    readVisualGraphEntriesFromDataset(
      remainingAfterRemove.find((dataset) => dataset.id === UI_VGB_DATASET_A_ID)
    ).length === 1 &&
      remainingAfterRemove.every((dataset) => dataset.id !== datasetBId)
  );

  assertCase(
    "ui.vgbR1.saveNoPreviewLeak",
    roundTrip.merged.visualGraphs !== undefined &&
      roundTrip.merged.visualGraphs.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      ) &&
      roundTrip.merged.visualGraphs.every((entry) =>
        PREVIEW_ONLY_EPHEMERAL_KEYS.every(
          (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
        )
      ) &&
      !roundTrip.serialized.json.includes('"preview"') &&
      !roundTrip.serialized.json.includes('"displaySeries"')
  );

  assertCase(
    "ui.vgb.flatten.perDatasetSourceIds",
    flattenInputsFromContext(stashB).length === 2 &&
      new Set(flattenInputsFromContext(stashB).map((input) => input.sourceDatasetId)).size ===
        2
  );

  return results;
};
