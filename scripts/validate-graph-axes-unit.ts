/**
 * PROD-2E D33.4 — graph-axes-unit gate.
 */
import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runGraphAxesGateExtensionCaseSuite } from "./lib/graph-axes-gate.cases";
import { runAxesCaseSuite } from "../src/lib/graph/axes/__tests__/axes.cases";

const results = [
  ...runAxesCaseSuite(),
  ...runGraphAxesGateExtensionCaseSuite(),
];

emitGateSummary("graph-axes-unit", results);
