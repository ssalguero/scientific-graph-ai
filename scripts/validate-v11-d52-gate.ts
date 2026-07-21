/**
 * D52.3 / D52.4 — v1.1 Dock Features umbrella gate.
 *
 * Order (fixed):
 * 1. Own validators (d52-testing)
 * 2. Foundation (docking-foundation)
 * 3. UX chain
 * 4. tsc --noEmit
 * 5. next build
 *
 * Governor only — does not modify product code.
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
  { npmScript: "validate:d52-testing", gateId: "d52-testing" },
  {
    npmScript: "validate:docking-foundation",
    gateId: "docking-foundation",
  },
  {
    npmScript: "validate:inspector-foundation",
    gateId: "inspector-foundation",
  },
  {
    npmScript: "validate:toolbar-architecture",
    gateId: "toolbar-architecture",
  },
  {
    npmScript: "validate:toolbar-move-only",
    gateId: "toolbar-move-only",
  },
  {
    npmScript: "validate:design-tokens-v2",
    gateId: "design-tokens-v2",
  },
  {
    npmScript: "validate:workspace-architecture",
    gateId: "workspace-architecture",
  },
  { npmScript: "validate:ui-architecture", gateId: "ui-architecture" },
  { npmScript: "validate:sidebar-v2", gateId: "sidebar-v2" },
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
assertCase(
  "typescript.noEmit",
  tscRun.status === 0,
  tscRun.status === 0
    ? "tsc --noEmit PASS"
    : `tsc failed: ${(tscRun.stderr || tscRun.stdout || "").slice(0, 400)}`
);

const buildRun = spawnSync(npmCmd, ["run", "build"], {
  cwd: repoRoot,
  stdio: "pipe",
  shell: true,
  encoding: "utf8",
});
assertCase(
  "next.build",
  buildRun.status === 0,
  buildRun.status === 0
    ? "next build PASS"
    : `build failed: ${(buildRun.stderr || buildRun.stdout || "").slice(0, 500)}`
);

const allPass =
  subGates.every((g) => g.pass) &&
  tscRun.status === 0 &&
  buildRun.status === 0;

assertCase(
  "umbrella.rollups.all.pass",
  allPass,
  "d52-testing + docking-foundation + UX chain + tsc + build PASS"
);

const rollup = {
  phase: "v11-d52-gate-subgates",
  D52Testing: {
    pass: subGates.find((g) => g.gate === "d52-testing")?.pass ?? false,
    exitCode:
      subGates.find((g) => g.gate === "d52-testing")?.exitCode ?? null,
  },
  DockingFoundation: {
    pass:
      subGates.find((g) => g.gate === "docking-foundation")?.pass ?? false,
    exitCode:
      subGates.find((g) => g.gate === "docking-foundation")?.exitCode ?? null,
  },
  TypeScript: { pass: tscRun.status === 0, exitCode: tscRun.status },
  Build: { pass: buildRun.status === 0, exitCode: buildRun.status },
  final: allPass ? "D52 GATE PASS" : "D52 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD52 GATE PASS" : "\nD52 GATE FAIL");

emitGateSummary("v11-d52-gate", results);
process.exit(allPass ? 0 : 1);
