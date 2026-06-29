import fs from "node:fs";
import path from "node:path";

import type { WorksheetColumnRegistry } from "@/lib/experimentalWorksheet";
import type { ImportAuxiliaryColumn } from "@/lib/import/types";
import { hydrateProjectJson, serializeProjectV2 } from "@/lib/project";
import { collectProjectSnapshotV2 } from "@/lib/project/collect-project-snapshot-v2";

import { patchToCollectContextV2WithWorksheet } from "../src/lib/project/__tests__/worksheet-pipeline-helpers";

const APP_VERSION = "0.1.0";
const FIXTURES_DIR = path.join(process.cwd(), "scripts", "fixtures");

const D5_WORKSHEET_REGISTRY: WorksheetColumnRegistry = {
  "d5-control1": {
    columnType: "numeric",
    transforms: [
      {
        kind: "formula",
        enabled: true,
        expression: "d5-control1 * 2",
        sourceSeriesIds: ["d5-control1"],
      },
    ],
  },
};

const D5_WORKSHEET_AUXILIARY: ImportAuxiliaryColumn[] = [
  {
    id: "aux-group",
    label: "Group",
    role: "group",
    valuesByRowIndex: {
      0: "control",
      1: "control",
      2: "control",
      3: "control",
      4: "control",
      5: "control",
      6: "control",
      7: "control",
      8: "control",
      9: "control",
    },
  },
];

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
  (dataset) => dataset.id === collectContext.activeDatasetId
);
if (!activeSession) {
  throw new Error("Active session missing from dataset5 minimal fixture.");
}

const project = collectProjectSnapshotV2({
  ...collectContext,
  worksheetModified: true,
  activeColumnRegistry: D5_WORKSHEET_REGISTRY,
  activeAuxiliaryColumns: D5_WORKSHEET_AUXILIARY,
  experimentalSeries: activeSession.datasetPayload.series,
});

const serialized = serializeProjectV2({
  project,
  appVersion: APP_VERSION,
  options: { includeChecksum: false },
});
if (!serialized.ok) {
  throw new Error(`Failed to serialize golden worksheet fixture: ${JSON.stringify(serialized.errors)}`);
}

const targetPath = path.join(FIXTURES_DIR, "project-v2-dataset5-with-worksheet.sgproj");
fs.writeFileSync(targetPath, `${serialized.json}\n`, "utf8");
console.log(`Wrote ${targetPath}`);
