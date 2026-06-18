/**
 * PROD-2A F0 validation gate — fixtures, key registry, envelope shape.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FIXTURES_DIR = path.join(__dirname, "fixtures");
const KEYS_PATH = path.join(ROOT, "src/lib/project/keys.ts");

const PROJECT_KIND = "scientific-graph-ai.project";
const MIN_VISIBILITY_KEYS = 45;

const FIXTURE_FILES = [
  "project-v1-empty.sgproj",
  "project-v1-dataset5-minimal.sgproj",
];

const issues = [];

const assert = (condition, message) => {
  if (!condition) issues.push(message);
};

const extractConstArrayKeys = (source, constName) => {
  const pattern = new RegExp(
    `export const ${constName} = \\[([\\s\\S]*?)\\] as const`,
    "m"
  );
  const match = source.match(pattern);
  if (!match) return null;
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
};

const loadKeyRegistry = () => {
  assert(fs.existsSync(KEYS_PATH), `Missing keys registry: ${KEYS_PATH}`);
  if (!fs.existsSync(KEYS_PATH)) {
    return {
      visibility: [],
      modules: [],
      workflow: [],
    };
  }

  const source = fs.readFileSync(KEYS_PATH, "utf8");
  return {
    visibility: extractConstArrayKeys(source, "VISIBILITY_KEYS_V1") ?? [],
    modules: extractConstArrayKeys(source, "MODULE_KEYS_V1") ?? [],
    workflow: extractConstArrayKeys(source, "GUIDED_WORKFLOW_TOGGLE_KEYS_V1") ?? [],
  };
};

const loadFixture = (fileName) => {
  const filePath = path.join(FIXTURES_DIR, fileName);
  assert(fs.existsSync(filePath), `Missing fixture: ${fileName}`);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    issues.push(`Invalid JSON in ${fileName}: ${error.message}`);
    return null;
  }
};

const validateEnvelope = (file, fileName) => {
  assert(file?.kind === PROJECT_KIND, `${fileName}: kind must be ${PROJECT_KIND}`);
  assert(file?.schemaVersion === 1, `${fileName}: schemaVersion must be 1`);
  assert(typeof file?.appVersion === "string", `${fileName}: appVersion required`);
  assert(typeof file?.exportedAt === "string", `${fileName}: exportedAt required`);
  assert(file?.project && typeof file.project === "object", `${fileName}: project required`);

  const project = file?.project;
  if (!project) return;

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

  assert(Array.isArray(project.dataset?.series), `${fileName}: dataset.series must be array`);
  assert(
    project.comparison?.slots?.A && project.comparison?.slots?.B,
    `${fileName}: comparison slots A/B required`
  );
};

const keys = loadKeyRegistry();

assert(
  keys.visibility.length >= MIN_VISIBILITY_KEYS,
  `VISIBILITY_KEYS_V1 must have >= ${MIN_VISIBILITY_KEYS} keys (got ${keys.visibility.length})`
);

const visibilitySet = new Set(keys.visibility);
assert(
  visibilitySet.size === keys.visibility.length,
  "VISIBILITY_KEYS_V1 contains duplicates"
);

for (const key of keys.workflow) {
  assert(
    visibilitySet.has(key),
    `Guided workflow toggle missing from VISIBILITY_KEYS_V1: ${key}`
  );
}

assert(keys.modules.length === 6, "MODULE_KEYS_V1 must list 6 modules");

for (const fileName of FIXTURE_FILES) {
  const file = loadFixture(fileName);
  if (file) validateEnvelope(file, fileName);
}

const dataset5 = loadFixture("project-v1-dataset5-minimal.sgproj");
if (dataset5) {
  assert(
    dataset5.project.dataset.series.length === 4,
    "Dataset5 fixture must contain 4 series"
  );
  assert(
    dataset5.project.dataset.info?.observationCount === 40,
    "Dataset5 fixture must report 40 observations"
  );
}

const summary = {
  phase: "F0",
  pass: issues.length === 0,
  visibilityKeyCount: keys.visibility.length,
  moduleKeyCount: keys.modules.length,
  workflowToggleCount: keys.workflow.length,
  fixturesChecked: FIXTURE_FILES,
  issues,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
