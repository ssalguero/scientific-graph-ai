/**
 * D59.4 — Snap Foundation umbrella gate.
 *
 * Order:
 * 1. validate:d59-snap-api
 * 2. validate:d59-governance
 * 3. validate:d59-engine
 * 4. validate:d59-determinism
 * 5. validate:d55-gate
 * 6. validate:d56-gate
 * 7. validate:d57-gate
 * 8. validate:d58-gate
 * 9. tsc --noEmit
 * 10. next build
 */
import { spawnSync } from "node:child_process";

import {
  createCaseRecorder,
  emitGateSummary,
  getRepoRoot,
  runNpmScriptGate,
  type SubGateSummary,
} from "./lib/methodology-gate-utils";

const repoRoot = getRepoRoot(import.meta.url);
const { results, assertCase } = createCaseRecorder();

const SUB_GATE_SCRIPTS: { npmScript: string; gateId: string }[] = [
  { npmScript: "validate:d59-snap-api", gateId: "d59-snap-api" },
  { npmScript: "validate:d59-governance", gateId: "d59-governance" },
  { npmScript: "validate:d59-engine", gateId: "d59-engine" },
  { npmScript: "validate:d59-determinism", gateId: "d59-determinism" },
  { npmScript: "validate:d55-gate", gateId: "d55-gate" },
  { npmScript: "validate:d56-gate", gateId: "d56-gate" },
  { npmScript: "validate:d57-gate", gateId: "d57-gate" },
  { npmScript: "validate:d58-gate", gateId: "d58-gate" },
];

const subGates: SubGateSummary[] = SUB_GATE_SCRIPTS.map(({ npmScript, gateId }) =>
  runNpmScriptGate(repoRoot, npmScript, gateId)
);

for (const gate of subGates) {
  assertCase(
    `subgate.${gate.gate}`,
    gate.pass,
    `exitCode=${gate.exitCode ?? "null"}`
  );
}

assertCase(
  "subgates.executed",
  subGates.length === SUB_GATE_SCRIPTS.length,
  `expected=${SUB_GATE_SCRIPTS.length}, actual=${subGates.length}`
);

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const tscRun = spawnSync(npmCmd, ["exec", "--", "tsc", "--noEmit"], {
  cwd: repoRoot,
  stdio: "pipe",
  shell: true,
  encoding: "utf8",
});

const tscPass = tscRun.status === 0;
assertCase(
  "tsc.noEmit",
  tscPass,
  tscPass
    ? "tsc --noEmit PASS"
    : `tsc failed: ${(tscRun.stderr || tscRun.stdout || "").slice(0, 400)}`
);

const buildRun = spawnSync(npmCmd, ["run", "build"], {
  cwd: repoRoot,
  stdio: "pipe",
  shell: true,
  encoding: "utf8",
});

const buildPass = buildRun.status === 0;
assertCase(
  "build.next",
  buildPass,
  buildPass
    ? "next build PASS"
    : `build failed: ${(buildRun.stderr || buildRun.stdout || "").slice(0, 400)}`
);

const allPass = subGates.every((g) => g.pass) && tscPass && buildPass;

const rollup = {
  phase: "d59-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  tsc: { pass: tscPass, exitCode: tscRun.status },
  build: { pass: buildPass, exitCode: buildRun.status },
  final: allPass ? "D59 GATE PASS" : "D59 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD59 GATE PASS" : "\nD59 GATE FAIL");

emitGateSummary("d59-gate", results);
process.exit(allPass ? 0 : 1);
