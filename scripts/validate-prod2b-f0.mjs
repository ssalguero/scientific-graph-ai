import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures");

const PROJECT_KIND = "scientific-graph-ai.project";

const V1_FIXTURE_FILES = [
  "project-v1-empty.sgproj",
  "project-v1-dataset5-minimal.sgproj",
];

const V2_FIXTURE_FILES = [
  "project-v2-empty.sgproj",
  "project-v2-dataset5-minimal.sgproj",
];

const issues = [];

const assert = (condition, message) => {
  if (!condition) issues.push(message);
};

const loadFixture = (fileName) => {
  const filePath = path.join(FIXTURES_DIR, fileName);
  assert(fs.existsSync(filePath), `Missing fixture: ${fileName}`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    issues.push(`Invalid JSON in ${fileName}: ${error.message}`);
    return null;
  }
};

const validateV1Envelope = (file, fileName) => {
  assert(file?.kind === PROJECT_KIND, `${fileName}: kind must be ${PROJECT_KIND}`);
  assert(file?.schemaVersion === 1, `${fileName}: schemaVersion must be 1`);
  assert(typeof file?.appVersion === "string", `${fileName}: appVersion required`);
  assert(typeof file?.exportedAt === "string", `${fileName}: exportedAt required`);
  assert(file?.project && typeof file.project === "object", `${fileName}: project required`);

  const project = file.project;
  const requiredBlocks = [
    "metadata",
    "dataset",
    "importProvenance",
    "analysisConfig",
    "workflow",
    "comparison",
    "workspace",
  ];
  for (const block of requiredBlocks) {
    assert(block in project, `${fileName}: missing project.${block}`);
  }
};

const validateV2Envelope = (file, fileName) => {
  assert(file?.kind === PROJECT_KIND, `${fileName}: kind must be ${PROJECT_KIND}`);
  assert(file?.schemaVersion === 2, `${fileName}: schemaVersion must be 2`);
  assert(typeof file?.appVersion === "string", `${fileName}: appVersion required`);
  assert(typeof file?.exportedAt === "string", `${fileName}: exportedAt required`);
  assert(file?.project && typeof file.project === "object", `${fileName}: project required`);

  const project = file.project;
  const requiredBlocks = [
    "metadata",
    "datasets",
    "activeDatasetId",
    "analysisConfig",
    "workflow",
    "comparison",
    "workspace",
  ];
  for (const block of requiredBlocks) {
    assert(block in project, `${fileName}: missing project.${block}`);
  }

  assert(Array.isArray(project.datasets), `${fileName}: datasets must be array`);
  assert(project.datasets.length >= 1, `${fileName}: datasets must not be empty`);
  assert(
    project.datasets.some((item) => item.id === project.activeDatasetId),
    `${fileName}: activeDatasetId must reference a dataset`
  );
  assert(!("dataset" in project), `${fileName}: V2 project must not include dataset`);
  assert(
    project.comparison?.slots?.A && project.comparison?.slots?.B,
    `${fileName}: comparison slots A/B required`
  );
  assert(
    "sourceDatasetId" in project.comparison.slots.A,
    `${fileName}: comparison.slots.A.sourceDatasetId required`
  );
};

for (const fileName of V1_FIXTURE_FILES) {
  const file = loadFixture(fileName);
  if (file) validateV1Envelope(file, fileName);
}

for (const fileName of V2_FIXTURE_FILES) {
  const file = loadFixture(fileName);
  if (file) validateV2Envelope(file, fileName);
}

const dataset5V2 = loadFixture("project-v2-dataset5-minimal.sgproj");
if (dataset5V2) {
  assert(
    dataset5V2.project.datasets[0].series.length === 4,
    "Dataset5 V2 fixture must contain 4 series"
  );
}

const summary = {
  phase: "prod-2b-f0",
  pass: issues.length === 0,
  v1FixturesChecked: V1_FIXTURE_FILES,
  v2FixturesChecked: V2_FIXTURE_FILES,
  issues,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
