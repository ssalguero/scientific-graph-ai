import fs from "node:fs";
import path from "node:path";

import {
  hydrateProjectJson,
  loadProjectJson,
  migrateProjectJson,
  projectFileToHydrateV1,
  SCHEMA_VERSION_V2,
  serializeProject,
} from "../../index";
import { getHydratedActiveSeries } from "../../__tests__/hydrate-v2-pipeline.cases";
import {
  createAssertCase,
  type CaseResult,
} from "@/lib/scientific/comparison/__tests__/run-assertions";

const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const readFixture = (name: string) =>
  fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");

export const runAdaptersB14Cases = (
  assertCase: (id: string, pass: boolean, detail?: string) => void
): void => {
  const emptyV1 = readFixture("project-v1-empty.sgproj");
  const dataset5V1 = readFixture("project-v1-dataset5-minimal.sgproj");
  const emptyV2 = readFixture("project-v2-empty.sgproj");
  const dataset5V2 = readFixture("project-v2-dataset5-minimal.sgproj");

  const migratedEmpty = migrateProjectJson(emptyV1);
  assertCase(
    "wire.migrate.empty.ok",
    migratedEmpty.ok === true &&
      migratedEmpty.file?.schemaVersion === SCHEMA_VERSION_V2
  );

  const migratedDataset5 = migrateProjectJson(dataset5V1);
  assertCase(
    "wire.migrate.dataset5.ok",
    migratedDataset5.ok === true &&
      migratedDataset5.file?.schemaVersion === SCHEMA_VERSION_V2 &&
      migratedDataset5.file?.project.datasets[0]?.series.length === 4
  );

  const loadedV2 = loadProjectJson(emptyV2);
  assertCase(
    "wire.load.v2Fixture.ok",
    loadedV2.ok === true && loadedV2.file?.schemaVersion === SCHEMA_VERSION_V2
  );

  assertCase(
    "wire.parse.v1.stillSchema1",
    JSON.parse(emptyV1).schemaVersion === 1
  );

  if (migratedDataset5.ok && migratedDataset5.file) {
    const serialized = serializeProject({
      snapshot: projectFileToHydrateV1(migratedDataset5.file),
      appVersion: "0.1.0",
    });
    assertCase(
      "wire.serialize.writesV2",
      serialized.ok === true && serialized.file.schemaVersion === SCHEMA_VERSION_V2
    );

    if (serialized.ok) {
      const hydrated = hydrateProjectJson(serialized.json);
      assertCase(
        "wire.hydrate.v2NativeMultiDataset",
        hydrated.ok === true &&
          hydrated.patch.sessionDatasets.length >= 1 &&
          getHydratedActiveSeries(hydrated.patch).length === 4 &&
          hydrated.patch.project.analysisConfig.selections.tTestSeriesA ===
            "d5-control1"
      );
      assertCase(
        "wire.hydrate.noCollapseToSingleDataset",
        hydrated.ok === true &&
          hydrated.patch.project.datasets.length ===
            hydrated.patch.sessionDatasets.length
      );
    }
  }

  const hydratedV2Fixture = hydrateProjectJson(dataset5V2);
  assertCase(
    "wire.hydrate.v2Fixture.series",
    hydratedV2Fixture.ok === true &&
      getHydratedActiveSeries(hydratedV2Fixture.patch).length === 4
  );

  assertCase(
    "wire.fixture.v2.empty.activeDataset",
    JSON.parse(emptyV2).project.activeDatasetId ===
      `${JSON.parse(emptyV2).project.metadata.id}::primary`
  );
};

export const runAdaptersB14CaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runAdaptersB14Cases(assertCase);
  return results;
};
