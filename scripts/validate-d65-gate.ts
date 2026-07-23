/**
 * D65.9 — Session Foundation umbrella gate.
 * Executes: d65-session-api · d65-governance · session-serializable.
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
  { npmScript: "validate:d65-session-api", gateId: "d65-session-api" },
  { npmScript: "validate:d65-governance", gateId: "d65-governance" },
  {
    npmScript: "validate:session-serializable",
    gateId: "session-serializable",
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

const allPass = subGates.every((g) => g.pass) && results.every((r) => r.pass);

const rollup = {
  phase: "d65-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  final: allPass ? "D65 GATE PASS" : "D65 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD65 GATE PASS" : "\nD65 GATE FAIL");

emitGateSummary("d65-gate", results);
process.exit(allPass ? 0 : 1);
