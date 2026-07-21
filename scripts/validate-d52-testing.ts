/**
 * D52.3 — Dock Features testing umbrella (partial).
 * Chains dedicated dock validators only — no foundation / tsc / build.
 */
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
  { npmScript: "validate:dock-registration", gateId: "dock-registration" },
  { npmScript: "validate:dock-layout", gateId: "dock-layout" },
  { npmScript: "validate:dock-visibility", gateId: "dock-visibility" },
  { npmScript: "validate:dock-state", gateId: "dock-state" },
  { npmScript: "validate:dock-features", gateId: "dock-features" },
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

const allPass = subGates.every((g) => g.pass);

assertCase(
  "d52.testing.rollups.all.pass",
  allPass,
  "dock-registration + dock-layout + dock-visibility + dock-state + dock-features PASS"
);

const rollup = {
  phase: "d52-testing",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  final: allPass ? "D52 TESTING PASS" : "D52 TESTING FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD52 TESTING PASS" : "\nD52 TESTING FAIL");

emitGateSummary("d52-testing", results);
process.exit(allPass ? 0 : 1);
