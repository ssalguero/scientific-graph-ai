import { emitGateSummary } from "./lib/methodology-gate-utils";
import { runPublicationPresetsGateExtensionCaseSuite } from "./lib/graph-publication-presets-gate.cases";
import { runPublicationPresetsCaseSuite } from "../src/lib/graph/publication-presets/__tests__/publication-presets.cases";

const results = [
  ...runPublicationPresetsCaseSuite(),
  ...runPublicationPresetsGateExtensionCaseSuite(),
];

emitGateSummary("graph-publication-presets-unit", results);
