/**
 * D48.4 — v1.1 Design Tokens v2 umbrella gate.
 *
 * Consolidates Design Tokens v2 + Workspace + UI + Sidebar gates,
 * TypeScript, and build. Governor only — does not modify product code.
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

const designTokensPass =
  subGates.find((g) => g.gate === "design-tokens-v2")?.pass ?? false;
const workspacePass =
  subGates.find((g) => g.gate === "workspace-architecture")?.pass ?? false;
const uiPass =
  subGates.find((g) => g.gate === "ui-architecture")?.pass ?? false;
const sidebarPass =
  subGates.find((g) => g.gate === "sidebar-v2")?.pass ?? false;

const allPass =
  subGates.every((g) => g.pass) &&
  tscRun.status === 0 &&
  buildRun.status === 0;

assertCase(
  "umbrella.rollups.all.pass",
  allPass,
  "design-tokens-v2 + workspace + ui + sidebar-v2 + tsc + build PASS"
);

const rollup = {
  phase: "v11-d48-gate-subgates",
  DesignTokensV2: {
    pass: designTokensPass,
    exitCode:
      subGates.find((g) => g.gate === "design-tokens-v2")?.exitCode ?? null,
  },
  Workspace: {
    pass: workspacePass,
    exitCode:
      subGates.find((g) => g.gate === "workspace-architecture")?.exitCode ??
      null,
  },
  UI: {
    pass: uiPass,
    exitCode:
      subGates.find((g) => g.gate === "ui-architecture")?.exitCode ?? null,
  },
  Sidebar: {
    pass: sidebarPass,
    exitCode: subGates.find((g) => g.gate === "sidebar-v2")?.exitCode ?? null,
  },
  TypeScript: { pass: tscRun.status === 0, exitCode: tscRun.status },
  Build: { pass: buildRun.status === 0, exitCode: buildRun.status },
  final: allPass ? "D48 GATE PASS" : "D48 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD48 GATE PASS" : "\nD48 GATE FAIL");

emitGateSummary("v11-d48-gate", results);
