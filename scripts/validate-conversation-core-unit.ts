import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  deriveActiveConversationDomain,
  normalizeAnalyzeContext,
} from "../src/lib/conversation/analyze-adapter";
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

const analyzeSystem = {
  hasDataset: true,
  hasExperimentalSeries: true,
  activeConversationDomain: "analyze" as const,
};

const analyzeContext = normalizeAnalyzeContext({
  hasDataset: true,
  hasExperimentalSeries: true,
  inspectorCategory: "statistics",
  hasExecutedAnalysis: false,
});

const scenarioA = runConversationCore({
  text: "¿Puedo comparar estos grupos?",
  system: analyzeSystem,
  analyzeContext,
  compareContext: null,
  previous: null,
});

assertCase(
  "p6.1.scenario-a-compare-from-analyze",
  scenarioA.orientation.kind === "data_area" &&
    scenarioA.orientation.productArea === "data_compare_groups" &&
    !scenarioA.orientation.homeCardId &&
    /comparar/i.test(scenarioA.explanation) &&
    /no inicia el flujo/i.test(scenarioA.explanation),
  `${scenarioA.orientation.productArea}/${scenarioA.orientation.kind}`
);

const scenarioB = runConversationCore({
  text: "¿Esto lo puedo analizar?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: false,
    activeConversationDomain: "math",
  },
  analyzeContext: null,
  compareContext: null,
  previous: null,
});

assertCase(
  "p6.1.scenario-b-analyze-from-math",
  scenarioB.orientation.kind === "scientific_area" &&
    (scenarioB.orientation.productArea === "scientific_statistics" ||
      scenarioB.orientation.productArea === "scientific_mathematics") &&
    !scenarioB.orientation.homeCardId &&
    /an[aá]lisis/i.test(scenarioB.explanation) &&
    /no cambia de secci/i.test(scenarioB.explanation),
  `${scenarioB.orientation.productArea}/${scenarioB.orientation.kind}`
);

const scenarioC = runConversationCore({
  text: "¿Y dónde hago eso?",
  system: analyzeSystem,
  analyzeContext,
  compareContext: null,
  previous: scenarioA,
});

assertCase(
  "p6.1.scenario-c-where-uses-previous",
  scenarioC.orientation.productArea === scenarioA.orientation.productArea &&
    scenarioC.orientation.kind === scenarioA.orientation.kind &&
    !scenarioC.orientation.homeCardId &&
    /localizar|encuentra/i.test(scenarioC.explanation) &&
    !/tarjeta/i.test(scenarioC.explanation),
  scenarioC.orientation.productArea
);

assertCase(
  "p6.1.active-domain-does-not-whitelist",
  scenarioA.orientation.productArea === "data_compare_groups" &&
    scenarioB.orientation.kind === "scientific_area",
  "cross-domain allowed"
);

const adapterKeys = Object.keys(analyzeContext);
assertCase(
  "p6.1.adapter-normalizes-only",
  analyzeContext.domain === "analyze" &&
    analyzeContext.scientificArea === "statistics_area" &&
    analyzeContext.userStatedMethod === null &&
    !adapterKeys.includes("orientation") &&
    !adapterKeys.includes("interpretation"),
  analyzeContext.scientificArea ?? "none"
);

assertCase(
  "p6.1.derive-active-domain",
  deriveActiveConversationDomain({
    workspaceSection: "analysis",
    dataWorkspaceView: "experimental",
    comparisonSurfaceOpen: false,
    importDestinationActive: false,
  }) === "analyze" &&
    deriveActiveConversationDomain({
      workspaceSection: "data",
      dataWorkspaceView: "curves",
      comparisonSurfaceOpen: false,
      importDestinationActive: false,
    }) === "math" &&
    deriveActiveConversationDomain({
      workspaceSection: "data",
      dataWorkspaceView: "experimental",
      comparisonSurfaceOpen: true,
      importDestinationActive: false,
    }) === "compare",
  "derive"
);

assertCase(
  "p6.1.visual-builder-null-is-unspecified-not-lost",
  deriveActiveConversationDomain({
    workspaceSection: "data",
    dataWorkspaceView: "visual-builder",
    comparisonSurfaceOpen: false,
    importDestinationActive: false,
  }) === null &&
    deriveActiveConversationDomain({
      workspaceSection: "data",
      dataWorkspaceView: "experimental",
      comparisonSurfaceOpen: false,
      importDestinationActive: false,
    }) === null,
  "visual-builder and experimental-without-compare are unspecified"
);

const nullDomainTurn = runConversationCore({
  text: "¿Esto lo puedo analizar?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: false,
    activeConversationDomain: null,
  },
  analyzeContext: null,
  compareContext: null,
  previous: null,
});
assertCase(
  "p6.1.core-runs-with-unspecified-domain",
  nullDomainTurn.orientation.kind === "scientific_area" &&
    /sin un dominio conversacional específico/i.test(nullDomainTurn.explanation) &&
    !nullDomainTurn.orientation.homeCardId,
  nullDomainTurn.orientation.productArea
);

const methodRefusal = runConversationCore({
  text: "Ejecuta ANOVA y elige el método",
  system: analyzeSystem,
  analyzeContext,
  compareContext: null,
  previous: null,
});
assertCase(
  "p6.1.no-method-decision",
  /no ejecuta|no elige/i.test(methodRefusal.explanation) &&
    !methodRefusal.orientation.homeCardId,
  methodRefusal.interpretation
);

const relationBlob = JSON.stringify(PRODUCT_RELATION_MAP).toLowerCase();
assertCase(
  "p6.1.relations-are-product-not-methods",
  !relationBlob.includes("pearson") &&
    !relationBlob.includes("anova") &&
    !relationBlob.includes("spearman") &&
    !relationBlob.includes("manova") &&
    PRODUCT_RELATION_MAP.analyze.includes("compare") &&
    PRODUCT_RELATION_MAP.math.includes("analyze"),
  "relations"
);

assertCase(
  "p6.1.core-providers-not-wired",
  (CONVERSATION_CORE_CONTEXT_PROVIDERS as readonly string[]).includes("analyze") &&
    WIRED_CONVERSATION_DOMAINS[0] === "home" &&
    !(WIRED_CONVERSATION_DOMAINS as readonly string[]).includes("analyze") &&
    CONVERSATION_ARCHITECTURE.coreRuntimeEnabled === true &&
    CONVERSATION_ARCHITECTURE.implemented === false,
  "providers"
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreSource = readFileSync(
  join(repoRoot, "src/lib/conversation/core.ts"),
  "utf8"
);
assertCase(
  "p6.1.core-does-not-import-home-vocab",
  !coreSource.includes("concept-vocabulary") &&
    !coreSource.includes("buildGuidanceDecision") &&
    !coreSource.includes("GuidanceDecision"),
  "core isolation"
);

const summary = {
  phase: "conversation-core-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
