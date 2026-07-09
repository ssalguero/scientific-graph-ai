import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runPcaCaseSuite } from "../src/lib/visualGraphBuilder/__tests__/pca.cases";

const results = runPcaCaseSuite();
emitGateSummary("prod2e-d28-pca-unit", results);
