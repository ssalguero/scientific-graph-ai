/**
 * D46.5 — v1.1 Sidebar v2 umbrella gate.
 *
 * Consolidates architecture + sidebar-v2 + smoke gates, TypeScript, and build.
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
  { npmScript: "validate:ui-architecture", gateId: "ui-architecture" },
  {
    npmScript: "validate:ui-sidebar-architecture",
    gateId: "ui-sidebar-architecture",
  },
  { npmScript: "validate:ui-sidebar-smoke", gateId: "ui-sidebar-smoke" },
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

assertCase(
  "umbrella.rollups.all.pass",
  subGates.every((g) => g.pass) && tscRun.status === 0 && buildRun.status === 0,
  "all D46 sub-gates + tsc + build PASS"
);

console.log(
  JSON.stringify(
    {
      phase: "v11-d46-gate-subgates",
      subGates: subGates.map((g) => ({
        gate: g.gate,
        pass: g.pass,
        exitCode: g.exitCode,
      })),
      tsc: { pass: tscRun.status === 0, exitCode: tscRun.status },
      build: { pass: buildRun.status === 0, exitCode: buildRun.status },
    },
    null,
    2
  )
);

emitGateSummary("v11-d46-gate", results);
