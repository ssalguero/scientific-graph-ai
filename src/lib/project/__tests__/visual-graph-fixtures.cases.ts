import fs from "node:fs";
import path from "node:path";

import {
  extractVisualGraphRuntimeState,
} from "@/lib/project/apply-hydrate-project-v2-patch";
import { persistedVisualGraphsEquivalent } from "@/lib/project/domain/mappers/visual-graph";
import { hydrateProjectJson } from "@/lib/project";
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
  if (json.includes('"preview"') || json.includes('"displaySeries"')) {
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
