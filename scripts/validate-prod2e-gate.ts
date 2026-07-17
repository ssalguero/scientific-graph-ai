/**
 * PROD-2E D36.2 — epic umbrella governance gate (CONSOLIDATION-2E).
 *
 * Governor only — certifies epic-level structure, consolidated API Freeze
 * registry metadata, required docs, and umbrella package wiring.
 *
 * Does NOT re-run domain/product asserts owned by D29–D35 governors.
 *
 * Full sibling chain (package.json — anti-nest, paridad D34/D35):
 *   governor D36 (this script)
 *   → validate:prod2e-d35-rendering-gate
 *   → validate:prod2e-data3b-gate
 *   → validate:visual-graph-builder-unit
 *   → npx tsc --noEmit
 *
 * Performance measurement is intentionally excluded (D36.1 documental).
 */
import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runProd2eEpicGovernanceCaseSuite } from "./lib/prod2e-gate.cases";

const results = runProd2eEpicGovernanceCaseSuite();

emitGateSummary("prod2e-gate", results);
