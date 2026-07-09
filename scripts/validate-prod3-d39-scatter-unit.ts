import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runScatterCaseSuite } from "../src/lib/visualGraphBuilder/__tests__/scatter.cases";

const results = runScatterCaseSuite();
emitGateSummary("prod3-d39-scatter-unit", results);
