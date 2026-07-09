import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runBubbleCaseSuite } from "../src/lib/visualGraphBuilder/__tests__/bubble.cases";

const results = runBubbleCaseSuite();
emitGateSummary("prod2e-d27-bubble-unit", results);
