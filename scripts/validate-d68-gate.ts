/**
 * D68.9 — Session Autosave Foundation umbrella gate.
 * Executes: validate:d65-gate · validate:d66-gate · validate:d67-gate · validate:d68.
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
  { npmScript: "validate:d65-gate", gateId: "d65-gate" },
  { npmScript: "validate:d66-gate", gateId: "d66-gate" },
  { npmScript: "validate:d67-gate", gateId: "d67-gate" },
  { npmScript: "validate:d68", gateId: "d68" },
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
  phase: "d68-gate",
  subGates: Object.fromEntries(
    subGates.map((g) => [g.gate, { pass: g.pass, exitCode: g.exitCode ?? null }])
  ),
  final: allPass ? "D68 GATE PASS" : "D68 GATE FAIL",
};

console.log(JSON.stringify(rollup, null, 2));
console.log(allPass ? "\nD68 GATE PASS" : "\nD68 GATE FAIL");

emitGateSummary("d68-gate", results);
process.exit(allPass ? 0 : 1);
