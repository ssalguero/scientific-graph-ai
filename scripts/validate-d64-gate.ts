/**
 * D64.6 — Production Stabilization Foundation · umbrella production gate.
 *
 * Order:
 * 1. validate:v11-d52-gate
 * 2. validate:d53-gate
 * 3. validate:d54-gate
 * 4. validate:d60-gate
 * 5. validate:d63-gate
 * 6. validate:production-boundaries
 * 7. validate:registry-integrity
 * 8. validate:api-freeze
 * 9. validate:foundation-coverage
 * 10. tsc --noEmit
 * 11. next build
 *
 * Authority: docs/D64.0-production-baseline.md · Foundation Manifest
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
  { npmScript: "validate:v11-d52-gate", gateId: "v11-d52-gate" },
  { npmScript: "validate:d53-gate", gateId: "d53-gate" },
  { npmScript: "validate:d54-gate", gateId: "d54-gate" },
  { npmScript: "validate:d60-gate", gateId: "d60-gate" },
  { npmScript: "validate:d63-gate", gateId: "d63-gate" },
  {
    npmScript: "validate:production-boundaries",
    gateId: "production-boundaries",
  },
  { npmScript: "validate:registry-integrity", gateId: "registry-integrity" },
  { npmScript: "validate:api-freeze", gateId: "api-freeze" },
  {
    npmScript: "validate:foundation-coverage",
    gateId: "foundation-coverage",
  },
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
  phase: "d64-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  tsc: { pass: tscPass, exitCode: tscRun.status },
  build: { pass: buildPass, exitCode: buildRun.status },
  final: allPass ? "D64 GATE PASS" : "D64 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD64 GATE PASS" : "\nD64 GATE FAIL");

emitGateSummary("d64-gate", results);
process.exit(allPass ? 0 : 1);
