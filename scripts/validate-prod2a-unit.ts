import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  hydrateProject,
  hydrateProjectJson,
  loadProjectJson,
  migrateProjectJson,
  parseProjectJson,
  serializeProject,
  validateScientificProjectFile,
} from "../src/lib/project/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "fixtures");

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

const assertCase = (id: string, condition: boolean, detail?: string) => {
  results.push({ id, pass: condition, detail });
};

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES, name), "utf8");

// --- valid fixtures ---

const emptyText = readFixture("project-v1-empty.sgproj");
const dataset5Text = readFixture("project-v1-dataset5-minimal.sgproj");

const emptyLoaded = loadProjectJson(emptyText);
assertCase("empty.load", emptyLoaded.ok === true);
assertCase(
  "empty.series",
  emptyLoaded.ok && emptyLoaded.file?.project.dataset.series.length === 0
);

const dataset5Loaded = loadProjectJson(dataset5Text);
assertCase("dataset5.load", dataset5Loaded.ok === true);
assertCase(
  "dataset5.series",
  dataset5Loaded.ok && dataset5Loaded.file?.project.dataset.series.length === 4
);

// --- round-trip parse → validate ---

const parsed = parseProjectJson(dataset5Text);
assertCase("dataset5.parse", parsed.ok === true);
if (parsed.ok) {
  const validated = validateScientificProjectFile(parsed.file);
  assertCase("dataset5.validate", validated.ok === true);
}

// --- F2: serialize + round-trip ---

if (dataset5Loaded.ok && dataset5Loaded.file) {
  const serialized = serializeProject({
    snapshot: dataset5Loaded.file.project,
    appVersion: "0.1.0",
  });
  assertCase("dataset5.serialize", serialized.ok === true);

  if (serialized.ok) {
    assertCase(
      "dataset5.serialize.envelope",
      serialized.file.kind === "scientific-graph-ai.project" &&
        serialized.file.schemaVersion === 1
    );
    assertCase(
      "dataset5.serialize.checksum",
      typeof serialized.file.project.dataset.checksum === "string" &&
        serialized.file.project.dataset.checksum.length > 0
    );

    const reloaded = loadProjectJson(serialized.json);
    assertCase("dataset5.roundtrip.load", reloaded.ok === true);
    assertCase(
      "dataset5.roundtrip.series",
      reloaded.ok &&
        reloaded.file?.project.dataset.series.length === 4 &&
        reloaded.file?.project.dataset.info?.observationCount === 40
    );
    assertCase(
      "dataset5.roundtrip.selections",
      reloaded.ok &&
        reloaded.file?.project.analysisConfig.selections.tTestSeriesA ===
          "d5-control1"
    );
  }
}

if (emptyLoaded.ok && emptyLoaded.file) {
  const serializedEmpty = serializeProject({
    snapshot: emptyLoaded.file.project,
    appVersion: "0.1.0",
  });
  assertCase("empty.serialize", serializedEmpty.ok === true);
  if (serializedEmpty.ok) {
    const reloadedEmpty = loadProjectJson(serializedEmpty.json);
    assertCase("empty.roundtrip.load", reloadedEmpty.ok === true);
  }
}

// --- F3: hydrate + sanitize ---

if (dataset5Loaded.ok && dataset5Loaded.file) {
  const hydrated = hydrateProject(dataset5Loaded.file);
  assertCase("dataset5.hydrate", hydrated.ok === true);
  if (hydrated.ok) {
    assertCase(
      "dataset5.hydrate.series",
      hydrated.patch.project.dataset.series.length === 4
    );
    assertCase(
      "dataset5.hydrate.selections",
      hydrated.patch.project.analysisConfig.selections.tTestSeriesA ===
        "d5-control1"
    );
    assertCase(
      "dataset5.hydrate.noGenerateGraph",
      !hydrated.patch.postHydrateActions.includes("generateGraph")
    );
  }

  const serialized = serializeProject({
    snapshot: dataset5Loaded.file.project,
    appVersion: "0.1.0",
  });
  if (serialized.ok) {
    const hydratedJson = hydrateProjectJson(serialized.json);
    assertCase("dataset5.hydrateJson", hydratedJson.ok === true);
    if (hydratedJson.ok) {
      assertCase(
        "dataset5.hydrateJson.series",
        hydratedJson.patch.project.dataset.series.length === 4
      );
    }
  }

  const orphanProject = structuredClone(dataset5Loaded.file);
  orphanProject.project.analysisConfig.selections.tTestSeriesB =
    "missing-series-id";
  const orphanHydrated = hydrateProject(orphanProject);
  assertCase("hydrate.orphanSelection", orphanHydrated.ok === true);
  if (orphanHydrated.ok) {
    assertCase(
      "hydrate.orphanSelection.cleared",
      orphanHydrated.patch.project.analysisConfig.selections.tTestSeriesB ===
        null
    );
    assertCase(
      "hydrate.orphanSelection.warning",
      orphanHydrated.patch.warnings.some((item) => item.code === "H-SEL-ORPHAN")
    );
  }

  const workflowProject = structuredClone(dataset5Loaded.file);
  workflowProject.project.workflow.session = {
    status: "active",
    templateId: "compare-groups",
    currentStepIndex: 999,
    completedStepIds: ["descriptive"],
    skippedStepIds: [],
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: null,
  };
  const workflowHydrated = hydrateProject(workflowProject);
  assertCase("hydrate.workflowClamp", workflowHydrated.ok === true);
  if (workflowHydrated.ok) {
    assertCase(
      "hydrate.workflowClamp.index",
      workflowHydrated.patch.project.workflow.session.currentStepIndex === 6
    );
  }

  const graphProject = structuredClone(dataset5Loaded.file);
  graphProject.project.graphContext = {
    title: "Test",
    curves: [{ expression: "sin(x)", color: "#000" }],
    minX: -10,
    maxX: 10,
    visibleMinX: -10,
    visibleMaxX: 10,
    autoScaleY: false,
    useSecondaryYAxis: false,
  };
  const graphHydrated = hydrateProject(graphProject);
  assertCase("hydrate.graphContext", graphHydrated.ok === true);
  if (graphHydrated.ok) {
    assertCase(
      "hydrate.generateGraph",
      graphHydrated.patch.postHydrateActions.includes("generateGraph")
    );
  }
}

const hydrateBad = hydrateProjectJson("{ invalid");
assertCase("hydrate.badJson", hydrateBad.ok === false);

if (dataset5Loaded.ok && dataset5Loaded.file) {
  const blankNameSnapshot = {
    ...dataset5Loaded.file.project,
    metadata: {
      ...dataset5Loaded.file.project.metadata,
      name: "   ",
    },
  };
  const invalidSerialize = serializeProject({
    snapshot: blankNameSnapshot,
    appVersion: "0.1.0",
  });
  assertCase("serialize.blankName", invalidSerialize.ok === true);
  if (invalidSerialize.ok) {
    assertCase(
      "serialize.blankName.default",
      invalidSerialize.file.project.metadata.name === "Proyecto sin título"
    );
  }
}

// --- malformed JSON ---

const badJson = loadProjectJson("{ invalid");
assertCase("malformed.json", badJson.ok === false);

// --- wrong kind ---

const wrongKind = loadProjectJson(
  JSON.stringify({
    kind: "wrong",
    schemaVersion: 1,
    appVersion: "0.1.0",
    exportedAt: "2026-01-01T00:00:00.000Z",
    project: JSON.parse(emptyText).project,
  })
);
assertCase("wrong.kind", wrongKind.ok === false);

// --- duplicate series id ---

const duplicatePayload = JSON.parse(dataset5Text);
duplicatePayload.project.dataset.series[1].id =
  duplicatePayload.project.dataset.series[0].id;
const duplicate = loadProjectJson(JSON.stringify(duplicatePayload));
assertCase("duplicate.seriesId", duplicate.ok === false);

// --- future schema ---

const futurePayload = JSON.parse(emptyText);
futurePayload.schemaVersion = 99;
const future = migrateProjectJson(JSON.stringify(futurePayload));
assertCase("future.schema", future.ok === false);

// --- empty metadata name in file (pre-serialize validation) ---

const emptyNamePayload = JSON.parse(emptyText);
emptyNamePayload.project.metadata.name = "   ";
const emptyName = loadProjectJson(JSON.stringify(emptyNamePayload));
assertCase("empty.metadata.name", emptyName.ok === false);

const summary = {
  phase: "F1+F2+F3",
  pass: results.every((item) => item.pass),
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
