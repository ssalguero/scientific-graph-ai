/**
 * DATA-G6 Registry — SSOT / no shadow Authoritative Registry (P6).
 */
import { readFileSync } from "node:fs";
import {
  assertCase,
  collectTsFiles,
  dataDir,
  finishGate,
  fileExists,
  readRel,
  relFromRepo,
  type GateCase,
} from "./lib/data-gate-helpers";

const results: GateCase[] = [];

assertCase(
  results,
  "g6.authority",
  fileExists("src/data/internal/registry/authority.ts"),
  "RegistryAuthority present"
);

assertCase(
  results,
  "g6.authoritative",
  fileExists("src/data/internal/registry/authoritative-registry.ts"),
  "AuthoritativeRegistry present"
);

assertCase(
  results,
  "g6.supporting",
  fileExists("src/data/internal/registry/supporting-registry.ts"),
  "SupportingRegistry present"
);

assertCase(
  results,
  "g6.roles",
  fileExists("src/data/internal/registry/roles.ts"),
  "registry roles present"
);

assertCase(
  results,
  "g6.datasetManager",
  fileExists("src/data/repository/dataset-manager/DatasetManager.ts"),
  "Dataset Authoritative Manager present"
);

assertCase(
  results,
  "g6.modelManager",
  fileExists(
    "src/data/model/scientific-model-manager/ScientificModelManager.ts"
  ),
  "Scientific Model Authoritative Manager present"
);

const claimHits: string[] = [];
for (const abs of collectTsFiles(dataDir)) {
  const rel = relFromRepo(abs);
  const code = readFileSync(abs, "utf8");
  if (!/claimAuthoritative/.test(code)) continue;
  const allowed =
    rel.includes("dataset-manager") ||
    rel.includes("scientific-model-manager") ||
    rel.includes("internal/registry/authority") ||
    rel.includes("__tests__");
  if (!allowed) claimHits.push(rel);
}

assertCase(
  results,
  "g6.claimSites",
  claimHits.length === 0,
  claimHits.length === 0
    ? "Authoritative claims limited to Dataset + Model managers + authority"
    : `unexpected: ${claimHits.join(", ")}`
);

const barrel = readRel("src/data/index.ts");
assertCase(
  results,
  "g6.notOnPublicBarrel",
  !/AuthoritativeRegistry|claimAuthoritative/.test(barrel),
  "registries not re-exported on @/data"
);

finishGate("data-g6-registry", results);
