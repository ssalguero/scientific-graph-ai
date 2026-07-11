/**
 * PROD-2E D32.4 — graph-series-unit gate.
 */
import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runGraphSeriesGateExtensionCaseSuite } from "./lib/graph-series-gate.cases";
import { runSeriesCaseSuite } from "../src/lib/graph/series/__tests__/series.cases";

const results = [
  ...runSeriesCaseSuite(),
  ...runGraphSeriesGateExtensionCaseSuite(),
];

emitGateSummary("graph-series-unit", results);
