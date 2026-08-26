import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveActiveConversationDomain } from "../src/lib/conversation/analyze-adapter";
import { normalizeMathContext } from "../src/lib/conversation/math-adapter";
import { CONVERSATION_ARCHITECTURE } from "../src/lib/conversation/architecture";
import {
  CONVERSATION_CORE_CONTEXT_PROVIDERS,
  WIRED_CONVERSATION_DOMAINS,
} from "../src/lib/conversation/contract";
import { runConversationCore } from "../src/lib/conversation/core";
import { PRODUCT_RELATION_MAP } from "../src/lib/conversation/relations";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

const mathSystem = {
  hasDataset: false,
  hasExperimentalSeries: false,
  activeConversationDomain: "math" as const,
};

const emptyMath = normalizeMathContext({
  constructorPanelOpen: true,
  hasNonEmptyExpressions: false,
  hasGraphedCurves: false,
});
const expressionsOnly = normalizeMathContext({
  constructorPanelOpen: true,
  hasNonEmptyExpressions: true,
  hasGraphedCurves: false,
});
const graphedMath = normalizeMathContext({
  constructorPanelOpen: true,
  hasNonEmptyExpressions: true,
  hasGraphedCurves: true,
});

assertCase(
  "p6.3.adapter-occupancy-booleans",
  emptyMath.domain === "math" &&
    emptyMath.hasNonEmptyExpressions === false &&
    emptyMath.hasGraphedCurves === false &&
    expressionsOnly.hasNonEmptyExpressions === true &&
    expressionsOnly.hasGraphedCurves === false &&
    graphedMath.hasGraphedCurves === true &&
    graphedMath.constructorPanelOpen === true,
  emptyMath.domain
);

const emptyAsk = runConversationCore({
  text: "¿Qué estoy graficando?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: emptyMath,
  previous: null,
});
assertCase(
  "p6.3.occupancy-empty-no-write",
  /no tiene expresiones/i.test(emptyAsk.explanation) &&
    /no escribe expresiones/i.test(emptyAsk.explanation) &&
    emptyAsk.orientation.productArea === "data_graphs_math",
  emptyAsk.interpretation
);

const exprAsk = runConversationCore({
  text: "¿Hay curvas?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: expressionsOnly,
  previous: null,
});
assertCase(
  "p6.3.occupancy-expressions-not-graphed",
  /no se han graficado/i.test(exprAsk.explanation) &&
    /no llama a graficar/i.test(exprAsk.explanation) &&
    exprAsk.orientation.kind === "data_area",
  exprAsk.interpretation
);

const graphedAsk = runConversationCore({
  text: "¿Qué hay graficado?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: graphedMath,
  previous: null,
});
assertCase(
  "p6.3.occupancy-graphed-no-results-runtime",
  /graficado/i.test(graphedAsk.explanation) &&
    /resultados/i.test(graphedAsk.explanation) &&
    /no genera resultados/i.test(graphedAsk.explanation) &&
    graphedAsk.orientation.kind === "data_area",
  graphedAsk.orientation.productArea
);

const scenarioA = runConversationCore({
  text: "¿Esto lo puedo analizar?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: graphedMath,
  previous: null,
});
assertCase(
  "p6.3.scenario-a-analyze-from-math",
  scenarioA.orientation.kind === "scientific_area" &&
    !scenarioA.orientation.homeCardId &&
    /an[aá]lisis/i.test(scenarioA.explanation) &&
    /no cambia de secci/i.test(scenarioA.explanation),
  `${scenarioA.orientation.productArea}/${scenarioA.orientation.kind}`
);

const scenarioB = runConversationCore({
  text: "¿Puedo comparar estas curvas?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: graphedMath,
  previous: null,
});
assertCase(
  "p6.3.scenario-b-compare-from-math",
  scenarioB.orientation.kind === "data_area" &&
    scenarioB.orientation.productArea === "data_compare_groups" &&
    !scenarioB.orientation.homeCardId &&
    /no se capturan en slot a\/b/i.test(scenarioB.explanation) &&
    /datasets experimentales/i.test(scenarioB.explanation),
  scenarioB.orientation.productArea
);

const scenarioC = runConversationCore({
  text: "¿Puedo graficar y=f(x)?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: true,
    activeConversationDomain: "analyze",
  },
  analyzeContext: null,
  compareContext: null,
  mathContext: emptyMath,
  previous: null,
});
assertCase(
  "p6.3.scenario-c-analyze-to-math",
  scenarioC.orientation.productArea === "data_graphs_math" &&
    scenarioC.orientation.kind === "data_area" &&
    !scenarioC.orientation.homeCardId &&
    /no navega ni reescribe/i.test(scenarioC.explanation),
  scenarioC.orientation.productArea
);

const scenarioD1 = runConversationCore({
  text: "¿Qué estoy graficando?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: graphedMath,
  previous: null,
});
const scenarioD2 = runConversationCore({
  text: "¿Y esto lo puedo analizar?",
  system: mathSystem,
  analyzeContext: null,
  compareContext: null,
  mathContext: graphedMath,
  previous: scenarioD1,
});
assertCase(
  "p6.3.scenario-d-referent",
  scenarioD1.orientation.productArea === "data_graphs_math" &&
    scenarioD2.orientation.kind === "scientific_area" &&
    !scenarioD2.orientation.homeCardId &&
    /no cambia de secci/i.test(scenarioD2.explanation),
  scenarioD2.orientation.productArea
);

assertCase(
  "p6.3.active-domain-math",
  deriveActiveConversationDomain({
    workspaceSection: "data",
    dataWorkspaceView: "curves",
    comparisonSurfaceOpen: false,
    importDestinationActive: false,
  }) === "math",
  "math domain"
);

assertCase(
  "p6.3.vgb-still-unspecified",
  deriveActiveConversationDomain({
    workspaceSection: "data",
    dataWorkspaceView: "visual-builder",
    comparisonSurfaceOpen: false,
    importDestinationActive: false,
  }) === null,
  "vgb null"
);

assertCase(
  "p6.3.math-provider-not-wired",
  (CONVERSATION_CORE_CONTEXT_PROVIDERS as readonly string[]).includes("math") &&
    !(WIRED_CONVERSATION_DOMAINS as readonly string[]).includes("math") &&
    CONVERSATION_ARCHITECTURE.independentDomainAssistants === false &&
    CONVERSATION_ARCHITECTURE.implemented === false,
  "provider"
);

const relationBlob = JSON.stringify(PRODUCT_RELATION_MAP).toLowerCase();
assertCase(
  "p6.3.relations-product-not-methods",
  PRODUCT_RELATION_MAP.math.includes("analyze") &&
    PRODUCT_RELATION_MAP.math.includes("compare") &&
    PRODUCT_RELATION_MAP.analyze.includes("math") &&
    !relationBlob.includes("pearson") &&
    !relationBlob.includes("anova") &&
    !relationBlob.includes("spearman") &&
    !relationBlob.includes("manova") &&
    !relationBlob.includes("regression"),
  "relations"
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const adapterSource = readFileSync(
  join(repoRoot, "src/lib/conversation/math-adapter.ts"),
  "utf8"
);
const queryBoxSource = readFileSync(
  join(repoRoot, "src/components/conversation/ConversationQueryBox.tsx"),
  "utf8"
);
const contractSource = readFileSync(
  join(repoRoot, "src/lib/conversation/contract.ts"),
  "utf8"
);
const coreSource = readFileSync(
  join(repoRoot, "src/lib/conversation/core.ts"),
  "utf8"
);
const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
const conversationDir = readFileSync(
  join(repoRoot, "src/lib/conversation/layers.ts"),
  "utf8"
);

assertCase(
  "p6.3.no-math-assistant-or-mutators",
  !adapterSource.includes("Assistant") &&
    !queryBoxSource.includes("MathQueryBox") &&
    queryBoxSource.includes("normalizeMathContext") &&
    !adapterSource.includes("generateGraph") &&
    !adapterSource.includes("setCurves") &&
    !adapterSource.includes("openDataView") &&
    !adapterSource.includes("selectWorkspaceSection") &&
    !coreSource.includes("generateGraph") &&
    !contractSource.includes("constructorOpen") &&
    !contractSource.includes("hasVisibleCurves") &&
    !pageSource.includes("@/lib/conversation") &&
    !conversationDir.includes("results-adapter") &&
    !conversationDir.includes("reports-adapter") &&
    !adapterSource.includes("@/ai") &&
    !coreSource.includes("@/ai"),
  "isolation"
);

const summary = {
  phase: "conversation-math-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
