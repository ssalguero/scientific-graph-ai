import fs from "node:fs";
import path from "node:path";

import {
  extractVisualGraphRuntimeState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import { persistedVisualGraphsEquivalent } from "@/lib/project/domain/mappers/visual-graph";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import {
  injectVisualGraphEntriesBySourceDatasetId,
  readVisualGraphEntriesFromDataset,
} from "@/lib/project/visual-graph-session-ui";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

import { normalizeProjectForRoundTrip } from "./b2-9-invariants.cases";
import { runUiSaveOpenRoundTrip } from "./ui-project-pipeline-v2.cases";
import {
  buildVisualGraphPreview,
  type VisualGraphPreview,
} from "@/lib/visualGraphBuilder";
import { seriesToWorksheet } from "@/lib/experimentalWorksheet";
import {
  hasOnlyPersistedVisualGraphKeys,
  PREVIEW_ONLY_EPHEMERAL_KEYS,
} from "./visual-graph-mapper-helpers";
import {
  patchToCollectContextV2WithVisualGraphs,
  runVisualGraphHydrateRoundTrip,
} from "./visual-graph-hydrate-helpers";
import { runVisualGraphUiSaveOpenRoundTrip } from "./visual-graph-ui-helpers";
import { patchToCollectContextV2WithWorksheet } from "./worksheet-pipeline-helpers";

const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const MONO_GOLDEN_FIXTURE = "project-v2-dataset5-with-visual-graph.sgproj";
const HEATMAP_GOLDEN_FIXTURE = "project-v2-dataset5-with-heatmap.sgproj";
const BUBBLE_GOLDEN_FIXTURE = "project-v2-dataset5-with-bubble.sgproj";
const PCA_GOLDEN_FIXTURE = "project-v2-dataset5-with-pca.sgproj";
const SCATTER_PRO_GOLDEN_FIXTURE = "project-v2-dataset5-with-scatter-pro.sgproj";
const MULTI_GOLDEN_FIXTURE = "project-v2-dataset5-dataset6-with-visual-graphs.sgproj";
const B2_MINIMAL_FIXTURE = "project-v2-dataset5-minimal.sgproj";

const MONO_PRIMARY_DATASET_ID = "00000000-0000-4000-8000-000000000002::primary";
const MULTI_PRIMARY_DATASET_ID = "00000000-0000-4000-8000-000000009901::primary";
const MULTI_SECOND_DATASET_ID = "00000000-0000-4000-8000-000000009901::ds-2";

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

const visualGraphsPersistedEquivalent = (
  left: NonNullable<
    ReturnType<typeof runVisualGraphHydrateRoundTrip>["firstProject"]["visualGraphs"]
  >,
  right: NonNullable<
    ReturnType<typeof runVisualGraphHydrateRoundTrip>["secondProject"]["visualGraphs"]
  >
): boolean =>
  left.length === right.length &&
  left.every((entry, index) => persistedVisualGraphsEquivalent(entry, right[index]!));

const assertVgbR1InSerializedJson = (json: string): boolean => {
  if (
    json.includes('"preview"') ||
    json.includes('"displaySeries"') ||
    json.includes('"heatmapData"') ||
    json.includes('"bubbleData"') ||
    json.includes('"pcaData"') ||
    json.includes('"pcaMeta"') ||
    json.includes('"scatterPoints"')
  ) {
    return false;
  }

  const hydrated = hydrateProjectJson(json);
  if (!hydrated.ok) {
    return false;
  }

  const visualGraphs = hydrated.patch.project.visualGraphs ?? [];
  return visualGraphs.every((entry) => {
    if (!hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)) {
      return false;
    }

    return PREVIEW_ONLY_EPHEMERAL_KEYS.every(
      (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
    );
  });
};

export const runVisualGraphFixturesCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const monoGoldenText = readFixture(MONO_GOLDEN_FIXTURE);
  const monoGoldenHydrated = hydrateProjectJson(monoGoldenText);
  assertCase(
    "fixtures.vgb.golden.mono.fixtureLoads",
    monoGoldenHydrated.ok === true &&
      (monoGoldenHydrated.patch.project.visualGraphs?.length ?? 0) === 1 &&
      monoGoldenHydrated.patch.project.visualGraphs?.[0]?.sourceDatasetId ===
        MONO_PRIMARY_DATASET_ID
  );

  if (monoGoldenHydrated.ok) {
    const monoRuntime = extractVisualGraphRuntimeState(monoGoldenHydrated.patch);
    assertCase(
      "fixtures.vgb.golden.mono.hydrateRebuildsPreview",
      monoRuntime.length === 1 &&
        monoRuntime[0]?.preview !== undefined &&
        Object.keys(monoRuntime[0]?.preview ?? {}).length > 0
    );

    const monoRoundTrip = runVisualGraphHydrateRoundTrip(
      patchToCollectContextV2WithVisualGraphs(monoGoldenHydrated.patch)
    );
    const firstPersisted = monoRoundTrip.firstProject.visualGraphs ?? [];
    const secondPersisted = monoRoundTrip.secondProject.visualGraphs ?? [];

    assertCase(
      "fixtures.vgb.golden.mono.roundtrip",
      visualGraphsPersistedEquivalent(firstPersisted, secondPersisted)
    );

    assertCase(
      "fixtures.vgb.golden.mono.invariantA.fullProject",
      JSON.stringify(normalizeProjectForRoundTrip(monoRoundTrip.firstProject)) ===
        JSON.stringify(normalizeProjectForRoundTrip(monoRoundTrip.secondProject))
    );

    assertCase(
      "fixtures.vgbR1.golden.roundtripReCollectClean",
      secondPersisted.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      ) &&
        secondPersisted.every((entry) =>
          PREVIEW_ONLY_EPHEMERAL_KEYS.every(
            (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
          )
        )
    );
  } else {
    assertCase("fixtures.vgb.golden.mono.hydrateRebuildsPreview", false);
    assertCase("fixtures.vgb.golden.mono.roundtrip", false);
    assertCase("fixtures.vgb.golden.mono.invariantA.fullProject", false);
    assertCase("fixtures.vgbR1.golden.roundtripReCollectClean", false);
  }

  assertCase(
    "fixtures.vgbR1.golden.mono.noPreviewLeakInJson",
    assertVgbR1InSerializedJson(monoGoldenText)
  );

  const heatmapGoldenText = readFixture(HEATMAP_GOLDEN_FIXTURE);
  const heatmapGoldenHydrated = hydrateProjectJson(heatmapGoldenText);
  assertCase(
    "fixtures.vgb.golden.heatmap.fixtureLoads",
    heatmapGoldenHydrated.ok === true &&
      (heatmapGoldenHydrated.patch.project.visualGraphs?.length ?? 0) === 1 &&
      heatmapGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec.graphType ===
        "heatmap" &&
      heatmapGoldenHydrated.patch.project.visualGraphs?.[0]?.sourceDatasetId ===
        MONO_PRIMARY_DATASET_ID
  );

  if (heatmapGoldenHydrated.ok) {
    const heatmapRuntime = extractVisualGraphRuntimeState(heatmapGoldenHydrated.patch);
    const heatmapPreview = heatmapRuntime[0]?.preview as VisualGraphPreview | undefined;

    assertCase(
      "fixtures.vgb.golden.heatmap.hydrateRebuildsPreview",
      heatmapRuntime.length === 1 &&
        heatmapPreview?.graphType === "heatmap" &&
        (heatmapPreview?.heatmapData.length ?? 0) > 0
    );

    const heatmapRoundTrip = runVisualGraphHydrateRoundTrip(
      patchToCollectContextV2WithVisualGraphs(heatmapGoldenHydrated.patch)
    );
    const heatmapFirstPersisted = heatmapRoundTrip.firstProject.visualGraphs ?? [];
    const heatmapSecondPersisted = heatmapRoundTrip.secondProject.visualGraphs ?? [];

    assertCase(
      "fixtures.vgb.golden.heatmap.roundtrip",
      visualGraphsPersistedEquivalent(heatmapFirstPersisted, heatmapSecondPersisted)
    );

    const heatmapSpec = heatmapGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec;
    const sessionDataset = heatmapGoldenHydrated.patch.sessionDatasets.find(
      (dataset) => dataset.id === MONO_PRIMARY_DATASET_ID
    );
    const series = sessionDataset?.datasetPayload.series ?? [];
    const columnRegistry = sessionDataset?.datasetPayload.columnRegistry ?? {};

    if (heatmapSpec) {
      const worksheetModel = seriesToWorksheet(series);
      const previewA = buildVisualGraphPreview(
        heatmapSpec,
        worksheetModel,
        columnRegistry
      );
      const previewB = buildVisualGraphPreview(
        heatmapSpec,
        worksheetModel,
        columnRegistry
      );
      assertCase(
        "fixtures.vgb.golden.heatmap.determinism",
        !("error" in previewA) &&
          !("error" in previewB) &&
          JSON.stringify(previewA.heatmapData) === JSON.stringify(previewB.heatmapData)
      );
    } else {
      assertCase("fixtures.vgb.golden.heatmap.determinism", false);
    }

    assertCase(
      "fixtures.vgbR1.golden.heatmap.reCollectClean",
      heatmapSecondPersisted.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      ) &&
        heatmapSecondPersisted.every((entry) =>
          PREVIEW_ONLY_EPHEMERAL_KEYS.every(
            (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
          )
        )
    );
  } else {
    assertCase("fixtures.vgb.golden.heatmap.hydrateRebuildsPreview", false);
    assertCase("fixtures.vgb.golden.heatmap.roundtrip", false);
    assertCase("fixtures.vgb.golden.heatmap.determinism", false);
    assertCase("fixtures.vgbR1.golden.heatmap.reCollectClean", false);
  }

  assertCase(
    "fixtures.vgbR1.golden.heatmap.noPreviewLeakInJson",
    assertVgbR1InSerializedJson(heatmapGoldenText)
  );

  const bubbleGoldenText = readFixture(BUBBLE_GOLDEN_FIXTURE);
  const bubbleGoldenHydrated = hydrateProjectJson(bubbleGoldenText);
  assertCase(
    "fixtures.vgb.golden.bubble.fixtureLoads",
    bubbleGoldenHydrated.ok === true &&
      (bubbleGoldenHydrated.patch.project.visualGraphs?.length ?? 0) === 1 &&
      bubbleGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec.graphType ===
        "bubble" &&
      bubbleGoldenHydrated.patch.project.visualGraphs?.[0]?.sourceDatasetId ===
        MONO_PRIMARY_DATASET_ID
  );

  if (bubbleGoldenHydrated.ok) {
    const bubbleRuntime = extractVisualGraphRuntimeState(bubbleGoldenHydrated.patch);
    const bubblePreview = bubbleRuntime[0]?.preview as VisualGraphPreview | undefined;

    assertCase(
      "fixtures.vgb.golden.bubble.hydrateRebuildsPreview",
      bubbleRuntime.length === 1 &&
        bubblePreview?.graphType === "bubble" &&
        (bubblePreview?.bubbleData.length ?? 0) > 0
    );

    const bubbleRoundTrip = runVisualGraphHydrateRoundTrip(
      patchToCollectContextV2WithVisualGraphs(bubbleGoldenHydrated.patch)
    );
    const bubbleFirstPersisted = bubbleRoundTrip.firstProject.visualGraphs ?? [];
    const bubbleSecondPersisted = bubbleRoundTrip.secondProject.visualGraphs ?? [];

    assertCase(
      "fixtures.vgb.golden.bubble.roundtrip",
      visualGraphsPersistedEquivalent(bubbleFirstPersisted, bubbleSecondPersisted)
    );

    const bubbleSpec = bubbleGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec;
    const bubbleSessionDataset = bubbleGoldenHydrated.patch.sessionDatasets.find(
      (dataset) => dataset.id === MONO_PRIMARY_DATASET_ID
    );
    const bubbleSeries = bubbleSessionDataset?.datasetPayload.series ?? [];
    const bubbleColumnRegistry = bubbleSessionDataset?.datasetPayload.columnRegistry ?? {};

    if (bubbleSpec) {
      const bubbleWorksheetModel = seriesToWorksheet(bubbleSeries);
      const bubblePreviewA = buildVisualGraphPreview(
        bubbleSpec,
        bubbleWorksheetModel,
        bubbleColumnRegistry
      );
      const bubblePreviewB = buildVisualGraphPreview(
        bubbleSpec,
        bubbleWorksheetModel,
        bubbleColumnRegistry
      );
      assertCase(
        "fixtures.vgb.golden.bubble.determinism",
        !("error" in bubblePreviewA) &&
          !("error" in bubblePreviewB) &&
          JSON.stringify(bubblePreviewA.bubbleData) ===
            JSON.stringify(bubblePreviewB.bubbleData)
      );
    } else {
      assertCase("fixtures.vgb.golden.bubble.determinism", false);
    }

    const bubbleCollectContext = patchToCollectContextV2WithVisualGraphs(
      bubbleGoldenHydrated.patch
    );
    const bubbleFirstProject = collectProjectSnapshotV2(bubbleCollectContext);
    const bubbleFirstSerialized = serializeProjectV2({
      project: bubbleFirstProject,
      appVersion: "0.1.0",
      exportedAt: "2026-06-30T10:00:00.000Z",
      options: { includeChecksum: false },
    });
    const bubbleReloaded = bubbleFirstSerialized.ok
      ? hydrateProjectJson(bubbleFirstSerialized.json)
      : { ok: false as const, errors: [] as string[] };
    const bubbleSecondProject =
      bubbleReloaded.ok === true
        ? collectProjectSnapshotV2(
            patchToCollectContextV2WithVisualGraphs(bubbleReloaded.patch)
          )
        : null;
    const bubbleSecondSerialized =
      bubbleSecondProject !== null
        ? serializeProjectV2({
            project: bubbleSecondProject,
            appVersion: "0.1.0",
            exportedAt: "2026-06-30T10:00:00.000Z",
            options: { includeChecksum: false },
          })
        : { ok: false as const, errors: [] as string[] };

    assertCase(
      "fixtures.vgb.golden.bubble.idempotent",
      bubbleFirstSerialized.ok === true &&
        bubbleReloaded.ok === true &&
        bubbleSecondSerialized.ok === true &&
        bubbleFirstSerialized.json === bubbleSecondSerialized.json
    );

    assertCase(
      "fixtures.vgbR1.golden.bubble.reCollectClean",
      bubbleSecondPersisted.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      ) &&
        bubbleSecondPersisted.every((entry) =>
          PREVIEW_ONLY_EPHEMERAL_KEYS.every(
            (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
          )
        )
    );
  } else {
    assertCase("fixtures.vgb.golden.bubble.hydrateRebuildsPreview", false);
    assertCase("fixtures.vgb.golden.bubble.roundtrip", false);
    assertCase("fixtures.vgb.golden.bubble.determinism", false);
    assertCase("fixtures.vgb.golden.bubble.idempotent", false);
    assertCase("fixtures.vgbR1.golden.bubble.reCollectClean", false);
  }

  assertCase(
    "fixtures.vgbR1.golden.bubble.noPreviewLeakInJson",
    assertVgbR1InSerializedJson(bubbleGoldenText)
  );

  const pcaGoldenText = readFixture(PCA_GOLDEN_FIXTURE);
  const pcaGoldenHydrated = hydrateProjectJson(pcaGoldenText);
  assertCase(
    "fixtures.vgb.golden.pca.fixtureLoads",
    pcaGoldenHydrated.ok === true &&
      (pcaGoldenHydrated.patch.project.visualGraphs?.length ?? 0) === 1 &&
      pcaGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec.graphType === "pca" &&
      pcaGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec.pcaVariables?.length ===
        3 &&
      pcaGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec.pcaStandardize === true &&
      pcaGoldenHydrated.patch.project.visualGraphs?.[0]?.sourceDatasetId ===
        MONO_PRIMARY_DATASET_ID
  );

  if (pcaGoldenHydrated.ok) {
    const pcaRuntime = extractVisualGraphRuntimeState(pcaGoldenHydrated.patch);
    const pcaPreview = pcaRuntime[0]?.preview as VisualGraphPreview | undefined;

    assertCase(
      "fixtures.vgb.golden.pca.hydrateRebuildsPreview",
      pcaRuntime.length === 1 &&
        pcaPreview?.graphType === "pca" &&
        (pcaPreview?.pcaData.length ?? 0) > 0 &&
        pcaPreview?.pcaMeta !== null
    );

    const pcaRoundTrip = runVisualGraphHydrateRoundTrip(
      patchToCollectContextV2WithVisualGraphs(pcaGoldenHydrated.patch)
    );
    const pcaFirstPersisted = pcaRoundTrip.firstProject.visualGraphs ?? [];
    const pcaSecondPersisted = pcaRoundTrip.secondProject.visualGraphs ?? [];

    assertCase(
      "fixtures.vgb.golden.pca.roundtrip",
      visualGraphsPersistedEquivalent(pcaFirstPersisted, pcaSecondPersisted)
    );

    const pcaSpec = pcaGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec;
    const pcaSessionDataset = pcaGoldenHydrated.patch.sessionDatasets.find(
      (dataset) => dataset.id === MONO_PRIMARY_DATASET_ID
    );
    const pcaSeries = pcaSessionDataset?.datasetPayload.series ?? [];
    const pcaColumnRegistry = pcaSessionDataset?.datasetPayload.columnRegistry ?? {};

    if (pcaSpec) {
      const pcaWorksheetModel = seriesToWorksheet(pcaSeries);
      const pcaPreviewA = buildVisualGraphPreview(
        pcaSpec,
        pcaWorksheetModel,
        pcaColumnRegistry
      );
      const pcaPreviewB = buildVisualGraphPreview(
        pcaSpec,
        pcaWorksheetModel,
        pcaColumnRegistry
      );
      assertCase(
        "fixtures.vgb.golden.pca.determinism",
        !("error" in pcaPreviewA) &&
          !("error" in pcaPreviewB) &&
          JSON.stringify(pcaPreviewA.pcaData) === JSON.stringify(pcaPreviewB.pcaData) &&
          JSON.stringify(pcaPreviewA.pcaMeta) === JSON.stringify(pcaPreviewB.pcaMeta)
      );
    } else {
      assertCase("fixtures.vgb.golden.pca.determinism", false);
    }

    const pcaCollectContext = patchToCollectContextV2WithVisualGraphs(
      pcaGoldenHydrated.patch
    );
    const pcaFirstProject = collectProjectSnapshotV2(pcaCollectContext);
    const pcaFirstSerialized = serializeProjectV2({
      project: pcaFirstProject,
      appVersion: "0.1.0",
      exportedAt: "2026-06-30T10:00:00.000Z",
      options: { includeChecksum: false },
    });
    const pcaReloaded = pcaFirstSerialized.ok
      ? hydrateProjectJson(pcaFirstSerialized.json)
      : { ok: false as const, errors: [] as string[] };
    const pcaSecondProject =
      pcaReloaded.ok === true
        ? collectProjectSnapshotV2(
            patchToCollectContextV2WithVisualGraphs(pcaReloaded.patch)
          )
        : null;
    const pcaSecondSerialized =
      pcaSecondProject !== null
        ? serializeProjectV2({
            project: pcaSecondProject,
            appVersion: "0.1.0",
            exportedAt: "2026-06-30T10:00:00.000Z",
            options: { includeChecksum: false },
          })
        : { ok: false as const, errors: [] as string[] };

    assertCase(
      "fixtures.vgb.golden.pca.idempotent",
      pcaFirstSerialized.ok === true &&
        pcaReloaded.ok === true &&
        pcaSecondSerialized.ok === true &&
        pcaFirstSerialized.json === pcaSecondSerialized.json
    );

    assertCase(
      "fixtures.vgbR1.golden.pca.reCollectClean",
      pcaSecondPersisted.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      ) &&
        pcaSecondPersisted.every((entry) =>
          PREVIEW_ONLY_EPHEMERAL_KEYS.every(
            (key) => !(key in (entry.graphSpec as unknown as Record<string, unknown>))
          )
        )
    );
  } else {
    assertCase("fixtures.vgb.golden.pca.hydrateRebuildsPreview", false);
    assertCase("fixtures.vgb.golden.pca.roundtrip", false);
    assertCase("fixtures.vgb.golden.pca.determinism", false);
    assertCase("fixtures.vgb.golden.pca.idempotent", false);
    assertCase("fixtures.vgbR1.golden.pca.reCollectClean", false);
  }

  assertCase(
    "fixtures.vgbR1.golden.pca.noPreviewLeakInJson",
    assertVgbR1InSerializedJson(pcaGoldenText)
  );

  const scatterProGoldenText = readFixture(SCATTER_PRO_GOLDEN_FIXTURE);
  const scatterProGoldenHydrated = hydrateProjectJson(scatterProGoldenText);
  assertCase(
    "fixtures.vgb.golden.scatterPro.fixtureLoads",
    scatterProGoldenHydrated.ok === true &&
      (scatterProGoldenHydrated.patch.project.visualGraphs?.length ?? 0) === 1 &&
      scatterProGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec.graphType ===
        "scatter" &&
      scatterProGoldenHydrated.patch.project.visualGraphs?.[0]?.sourceDatasetId ===
        MONO_PRIMARY_DATASET_ID
  );

  if (scatterProGoldenHydrated.ok) {
    const scatterProRuntime = extractVisualGraphRuntimeState(scatterProGoldenHydrated.patch);
    const scatterProPreview = scatterProRuntime[0]?.preview as VisualGraphPreview | undefined;

    assertCase(
      "fixtures.vgb.golden.scatterPro.hydrateRebuildsPreview",
      scatterProRuntime.length === 1 &&
        scatterProPreview?.graphType === "scatter" &&
        (scatterProPreview?.scatterPoints.length ?? 0) > 0
    );

    const scatterProRoundTrip = runVisualGraphHydrateRoundTrip(
      patchToCollectContextV2WithVisualGraphs(scatterProGoldenHydrated.patch)
    );
    const scatterProFirstPersisted = scatterProRoundTrip.firstProject.visualGraphs ?? [];
    const scatterProSecondPersisted = scatterProRoundTrip.secondProject.visualGraphs ?? [];

    assertCase(
      "fixtures.vgb.golden.scatterPro.roundtrip",
      visualGraphsPersistedEquivalent(scatterProFirstPersisted, scatterProSecondPersisted)
    );

    const scatterProSpec =
      scatterProGoldenHydrated.patch.project.visualGraphs?.[0]?.graphSpec;
    const scatterProSession = scatterProGoldenHydrated.patch.sessionDatasets.find(
      (dataset) => dataset.id === MONO_PRIMARY_DATASET_ID
    );
    const scatterProSeries = scatterProSession?.datasetPayload.series ?? [];
    const scatterProRegistry = scatterProSession?.datasetPayload.columnRegistry ?? {};

    if (scatterProSpec) {
      const worksheetModel = seriesToWorksheet(scatterProSeries);
      const previewA = buildVisualGraphPreview(
        scatterProSpec,
        worksheetModel,
        scatterProRegistry
      );
      const previewB = buildVisualGraphPreview(
        scatterProSpec,
        worksheetModel,
        scatterProRegistry
      );
      assertCase(
        "fixtures.vgb.golden.scatterPro.determinism",
        !("error" in previewA) &&
          !("error" in previewB) &&
          JSON.stringify(previewA.scatterPoints) === JSON.stringify(previewB.scatterPoints)
      );
    } else {
      assertCase("fixtures.vgb.golden.scatterPro.determinism", false);
    }

    assertCase(
      "fixtures.vgbR1.golden.scatterPro.reCollectClean",
      scatterProSecondPersisted.every((entry) =>
        hasOnlyPersistedVisualGraphKeys(entry as unknown as Record<string, unknown>)
      )
    );
  } else {
    assertCase("fixtures.vgb.golden.scatterPro.hydrateRebuildsPreview", false);
    assertCase("fixtures.vgb.golden.scatterPro.roundtrip", false);
    assertCase("fixtures.vgb.golden.scatterPro.determinism", false);
    assertCase("fixtures.vgbR1.golden.scatterPro.reCollectClean", false);
  }

  assertCase(
    "fixtures.vgbR1.golden.scatterPro.noPreviewLeakInJson",
    assertVgbR1InSerializedJson(scatterProGoldenText)
  );

  const multiGoldenText = readFixture(MULTI_GOLDEN_FIXTURE);
  const multiGoldenHydrated = hydrateProjectJson(multiGoldenText);
  assertCase(
    "fixtures.vgb.golden.multi.fixtureLoads",
    multiGoldenHydrated.ok === true &&
      (multiGoldenHydrated.patch.project.visualGraphs?.length ?? 0) === 2 &&
      new Set(
        multiGoldenHydrated.patch.project.visualGraphs?.map((entry) => entry.sourceDatasetId)
      ).size === 2
  );

  if (multiGoldenHydrated.ok) {
    const collectContext = patchToCollectContextV2WithWorksheet(multiGoldenHydrated.patch);
    const injectedRegistry = injectVisualGraphEntriesBySourceDatasetId(
      multiGoldenHydrated.patch.sessionDatasets,
      multiGoldenHydrated.patch.project.visualGraphs ?? [],
      extractVisualGraphRuntimeState(multiGoldenHydrated.patch)
    );

    const bucketA = readVisualGraphEntriesFromDataset(
      injectedRegistry.find((dataset) => dataset.id === MULTI_PRIMARY_DATASET_ID)
    );
    const bucketB = readVisualGraphEntriesFromDataset(
      injectedRegistry.find((dataset) => dataset.id === MULTI_SECOND_DATASET_ID)
    );

    assertCase(
      "fixtures.vgb.invariantCD.goldenPartitionsBySourceDataset",
      bucketA.length === 1 && bucketB.length === 1
    );

    assertCase(
      "fixtures.vgb.invariantCD.goldenNoCrossContamination",
      bucketA[0]?.id !== bucketB[0]?.id &&
        bucketA.every((entry) => entry.id !== bucketB[0]?.id) &&
        bucketB.every((entry) => entry.id !== bucketA[0]?.id)
    );

    const multiRoundTrip = runVisualGraphUiSaveOpenRoundTrip(
      {
        ...collectContext,
        sessionDatasets: injectedRegistry,
        activeDatasetId: multiGoldenHydrated.patch.activeDatasetId,
        projectVisualGraphEntries: undefined,
      },
      readVisualGraphEntriesFromDataset(
        injectedRegistry.find(
          (dataset) => dataset.id === multiGoldenHydrated.patch.activeDatasetId
        )
      )
    );
    const firstSourceIds =
      multiGoldenHydrated.patch.project.visualGraphs?.map(
        (entry) => entry.sourceDatasetId
      ) ?? [];
    const secondSourceIds =
      multiRoundTrip.merged.visualGraphs?.map((entry) => entry.sourceDatasetId) ?? [];

    assertCase(
      "fixtures.vgb.invariantCD.goldenSourceIdsStable",
      firstSourceIds.length === 2 &&
        secondSourceIds.length === 2 &&
        [...firstSourceIds].sort().join("|") === [...secondSourceIds].sort().join("|")
    );
  } else {
    assertCase("fixtures.vgb.invariantCD.goldenPartitionsBySourceDataset", false);
    assertCase("fixtures.vgb.invariantCD.goldenNoCrossContamination", false);
    assertCase("fixtures.vgb.invariantCD.goldenSourceIdsStable", false);
  }

  assertCase(
    "fixtures.vgbR1.golden.multi.noPreviewLeakInJson",
    assertVgbR1InSerializedJson(multiGoldenText)
  );

  const b2MinimalText = readFixture(B2_MINIMAL_FIXTURE);
  const b2Hydrated = hydrateProjectJson(b2MinimalText);
  assertCase(
    "fixtures.vgb.compat.b2.noVisualGraphsOnLoad",
    b2Hydrated.ok === true &&
      (b2Hydrated.patch.project.visualGraphs === undefined ||
        b2Hydrated.patch.project.visualGraphs.length === 0) &&
      extractVisualGraphRuntimeState(b2Hydrated.patch).length === 0
  );

  if (b2Hydrated.ok) {
    const b2RoundTrip = runUiSaveOpenRoundTrip(
      patchToCollectContextV2WithWorksheet(b2Hydrated.patch)
    );
    const b2Reparsed = hydrateProjectJson(b2RoundTrip.savedJson);
    assertCase(
      "fixtures.vgb.compat.b2.noRegressionAfterRoundTrip",
      b2Reparsed.ok === true &&
        (b2Reparsed.patch.project.visualGraphs === undefined ||
          b2Reparsed.patch.project.visualGraphs.length === 0)
    );
  } else {
    assertCase("fixtures.vgb.compat.b2.noRegressionAfterRoundTrip", false);
  }

  const b2AfterGolden =
    b2Hydrated.ok === true
      ? hydrateProjectJson(b2MinimalText)
      : { ok: false as const, errors: [] as string[] };
  const goldenAfterB2 = hydrateProjectJson(multiGoldenText);
  assertCase(
    "fixtures.vgb.compat.b2.goldenDoesNotBreakB2Fixture",
    b2AfterGolden.ok === true &&
      goldenAfterB2.ok === true &&
      (b2AfterGolden.patch.project.visualGraphs === undefined ||
        b2AfterGolden.patch.project.visualGraphs.length === 0) &&
      (goldenAfterB2.patch.project.visualGraphs?.length ?? 0) === 2
  );

  return results;
};
