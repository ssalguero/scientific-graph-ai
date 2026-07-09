import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runHeatmapCaseSuite } from "../src/lib/visualGraphBuilder/__tests__/heatmap.cases";

const results = runHeatmapCaseSuite();
emitGateSummary("prod2e-d26-heatmap-unit", results);
