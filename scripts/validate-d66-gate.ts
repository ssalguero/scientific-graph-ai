/**
 * D66.8 — Session Persistence Foundation umbrella gate.
 * Executes: session-persistence · session-persistence-boundaries.
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
  {
    npmScript: "validate:session-persistence",
    gateId: "session-persistence",
  },
  {
    npmScript: "validate:session-persistence-boundaries",
    gateId: "session-persistence-boundaries",
  },
];

const subGates: SubGateSummary[] = SUB_GATE_SCRIPTS.map(
  ({ npmScript, gateId }) => runNpmScriptGate(repoRoot, npmScript, gateId)
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
  phase: "d66-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  final: allPass ? "D66 GATE PASS" : "D66 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD66 GATE PASS" : "\nD66 GATE FAIL");

emitGateSummary("d66-gate", results);
process.exit(allPass ? 0 : 1);
