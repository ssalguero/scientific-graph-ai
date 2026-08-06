/**
 * DATA-G1 Architecture — layout / layers / P8 structural fidelity.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  assertCase,
  dataDir,
  finishGate,
  readRel,
  type GateCase,
} from "./lib/data-gate-helpers";
import { DATA_REQUIRED_LAYOUT_DIRS } from "../src/data/internal/boundary-policy";

const results: GateCase[] = [];

assertCase(
  results,
  "g1.root",
  existsSync(join(dataDir, "index.ts")),
  "src/data/index.ts exists"
);

for (const dir of DATA_REQUIRED_LAYOUT_DIRS) {
  assertCase(
    results,
    `g1.layout.${dir}`,
    existsSync(join(dataDir, dir)),
    `src/data/${dir}/ exists`
  );
}

const arch = readRel("src/data/ARCHITECTURE.md");
assertCase(
  results,
  "g1.architectureDoc",
  arch.includes("Architecture Freeze") && arch.length > 500,
  "ARCHITECTURE.md present with Freeze authority"
);

assertCase(
  results,
  "g1.noUiOwnership",
  !/export\s+function\s+render|from\s+["']react["']/.test(
    readRel("src/data/index.ts")
  ),
  "public barrel does not own UI/render"
);

assertCase(
  results,
  "g1.composeInternal",
  existsSync(join(dataDir, "internal/compose-domain.ts")),
  "composeDataDomain remains internal composition root"
);

finishGate("data-g1-architecture", results);
