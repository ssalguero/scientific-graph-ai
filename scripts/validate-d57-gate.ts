/**
 * D57.5 — Window Drag System umbrella gate.
 *
 * Order:
 * 1. validate:d57-drag-api
 * 2. validate:d57-governance
 * 3. validate:d57-bridge
 * 4. tsc --noEmit
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
  { npmScript: "validate:d57-drag-api", gateId: "d57-drag-api" },
  { npmScript: "validate:d57-governance", gateId: "d57-governance" },
  { npmScript: "validate:d57-bridge", gateId: "d57-bridge" },
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

const allPass = subGates.every((g) => g.pass) && tscPass;

const rollup = {
  phase: "d57-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  tsc: { pass: tscPass, exitCode: tscRun.status },
  final: allPass ? "D57 GATE PASS" : "D57 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD57 GATE PASS" : "\nD57 GATE FAIL");

emitGateSummary("d57-gate", results);
process.exit(allPass ? 0 : 1);
