import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runViewportCaseSuite } from "../src/lib/graph/__tests__/viewport.cases";

const yResults = runViewportCaseSuite().filter((item) => item.id.startsWith("y."));
emitGateSummary("chart-viewport-y", yResults);
