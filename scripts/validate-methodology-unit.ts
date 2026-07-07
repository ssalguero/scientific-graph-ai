import {
  emitUmbrellaSummary,
  getRepoRoot,
  runNpmScriptGate,
} from "./lib/methodology-gate-utils";

const repoRoot = getRepoRoot(import.meta.url);

const subGates = [
  runNpmScriptGate(
    repoRoot,
    "validate:methodology-f5a-unit",
    "methodology-f5a-unit"
  ),
  runNpmScriptGate(
    repoRoot,
    "validate:methodology-f5b-unit",
    "methodology-f5b-unit"
  ),
  runNpmScriptGate(
    repoRoot,
    "validate:methodology-f5c-unit",
    "methodology-f5c-unit"
  ),
  runNpmScriptGate(
    repoRoot,
    "validate:methodology-f5d-unit",
    "methodology-f5d-unit"
  ),
  runNpmScriptGate(
    repoRoot,
    "validate:methodology-f5e-unit",
    "methodology-f5e-unit"
  ),
];

emitUmbrellaSummary("methodology-unit", subGates);
