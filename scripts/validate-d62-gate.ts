/**
 * D62.10 — Tabs UI Foundation umbrella gate.
 *
 * Order:
 * 1. validate:d61-gate
 * 2. validate:d62-tabs-api
 * 3. validate:d62-governance
 * 4. tsc --noEmit
 * 5. next build
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
  { npmScript: "validate:d61-gate", gateId: "d61-gate" },
  { npmScript: "validate:d62-tabs-api", gateId: "d62-tabs-api" },
  { npmScript: "validate:d62-governance", gateId: "d62-governance" },
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
  phase: "d62-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  tsc: { pass: tscPass, exitCode: tscRun.status },
  build: { pass: buildPass, exitCode: buildRun.status },
  final: allPass ? "D62 GATE PASS" : "D62 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD62 GATE PASS" : "\nD62 GATE FAIL");

emitGateSummary("d62-gate", results);
process.exit(allPass ? 0 : 1);
