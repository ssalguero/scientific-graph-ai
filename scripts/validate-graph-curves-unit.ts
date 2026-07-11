/**
 * PROD-2E D31.3 — graph-curves-unit gate.
 *
 * Maintenance note (shim temporal):
 * El re-export de translateNaturalLanguageToMath desde page.tsx existe únicamente
 * por compatibilidad histórica durante GRAPH-2. Deberá revisarse su eliminación al
 * cierre de GRAPH-2 (D32), una vez verificado que no existan consumidores externos.
 */
import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runGraphCurvesGateExtensionCaseSuite } from "./lib/graph-curves-gate.cases";
import { runCurvesCaseSuite } from "../src/lib/graph/curves/__tests__/curves.cases";

const results = [
  ...runCurvesCaseSuite(),
  ...runGraphCurvesGateExtensionCaseSuite(),
];

emitGateSummary("graph-curves-unit", results);
