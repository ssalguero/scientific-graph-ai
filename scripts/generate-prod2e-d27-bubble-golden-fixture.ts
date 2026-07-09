import fs from "node:fs";
import path from "node:path";

import type { ExperimentalSeries } from "@/lib/experimentalData";
import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";
import {
  applyVisualGraphSpecification,
  DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  type ProjectVisualGraphEntry,
  type VisualGraphSpecification,
} from "@/lib/visualGraphBuilder";
import {
  mergeVisualGraphsFromSessionIntoProjectSnapshot,
  persistActiveVisualGraphsInRegistry,
} from "@/lib/project/visual-graph-session-ui";

import { patchToCollectContextV2WithWorksheet } from "../src/lib/project/__tests__/worksheet-pipeline-helpers";

const APP_VERSION = "0.1.0";
const GOLDEN_EXPORTED_AT = "2026-06-30T10:00:00.000Z";
const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const MONO_PRIMARY_DATASET_ID = "00000000-0000-4000-8000-000000000002::primary";

const D5_VGB_BUBBLE_SPEC: VisualGraphSpecification = {
  ...DEFAULT_VISUAL_GRAPH_SPECIFICATION,
  graphType: "bubble",
  xVariable: "x",
  yVariable: "d5-control1",
  sizeVariable: "d5-tratamiento1",
  groupVariable: null,
};

const buildRuntimeVisualGraphEntry = (
  specInput: VisualGraphSpecification,
  series: ExperimentalSeries[],
  columnRegistry: WorksheetColumnRegistry,
  graphId: string,
  createdAt: string
): ProjectVisualGraphEntry => {
  const applied = applyVisualGraphSpecification(specInput, series, columnRegistry);
  if (!applied.ok) {
    throw new Error(`Failed to build visual graph entry ${graphId}: ${applied.message}`);
  }

  return {
    id: graphId,
    graphSpec: {
      ...applied.graphSpec,
      id: graphId,
      createdAt,
    },
    preview: applied.preview,
    displaySeries: applied.displaySeries,
    createdAt,
  };
};

const writeGoldenFixture = (
  targetName: string,
  project: ReturnType<typeof mergeVisualGraphsFromSessionIntoProjectSnapshot>
) => {
  const serialized = serializeProjectV2({
    project,
    appVersion: APP_VERSION,
    exportedAt: GOLDEN_EXPORTED_AT,
    options: { includeChecksum: false },
  });
  if (!serialized.ok) {
    throw new Error(
      `Failed to serialize golden bubble fixture ${targetName}: ${JSON.stringify(serialized.errors)}`
    );
  }

  const targetPath = path.join(FIXTURES_DIR, targetName);
  fs.writeFileSync(targetPath, `${serialized.json}\n`, "utf8");
  console.log(`Wrote ${targetPath}`);
};

const generateBubbleGoldenFixture = () => {
  const minimalText = fs.readFileSync(
    path.join(FIXTURES_DIR, "project-v2-dataset5-minimal.sgproj"),
    "utf8"
  );
  const hydrated = hydrateProjectJson(minimalText);
  if (!hydrated.ok) {
    throw new Error("Failed to hydrate dataset5 minimal fixture.");
  }

  const collectContext = patchToCollectContextV2WithWorksheet(hydrated.patch);
  const activeSession = collectContext.sessionDatasets.find(
    (dataset) => dataset.id === MONO_PRIMARY_DATASET_ID
  );
  if (!activeSession) {
    throw new Error("Primary dataset missing from dataset5 minimal fixture.");
  }

  const entry = buildRuntimeVisualGraphEntry(
    D5_VGB_BUBBLE_SPEC,
    activeSession.datasetPayload.series,
    activeSession.datasetPayload.columnRegistry ?? {},
    "vg-golden-d5-bubble",
    "2026-06-30T10:00:00.000Z"
  );

  const sessionDatasets = persistActiveVisualGraphsInRegistry(
    collectContext.sessionDatasets,
    MONO_PRIMARY_DATASET_ID,
    [entry]
  );

  const ctxWithGraphs = {
    ...collectContext,
    sessionDatasets,
    activeDatasetId: MONO_PRIMARY_DATASET_ID,
    projectVisualGraphEntries: undefined,
  };

  const collected = collectProjectSnapshotV2(ctxWithGraphs);
  const merged = mergeVisualGraphsFromSessionIntoProjectSnapshot(collected, ctxWithGraphs);

  writeGoldenFixture("project-v2-dataset5-with-bubble.sgproj", merged);
};

generateBubbleGoldenFixture();
