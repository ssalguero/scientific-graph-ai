import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { deriveActiveConversationDomain } from "../src/lib/conversation/analyze-adapter";
import { normalizeCompareContext } from "../src/lib/conversation/compare-adapter";
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

const compareSystem = {
  hasDataset: true,
  hasExperimentalSeries: true,
  activeConversationDomain: "compare" as const,
};

const emptyCompare = normalizeCompareContext({
  slotAOccupied: false,
  slotBOccupied: false,
  slotAFileName: null,
  slotBFileName: null,
});
const aOnlyCompare = normalizeCompareContext({
  slotAOccupied: true,
  slotBOccupied: false,
  slotAFileName: "grupo-a.csv",
  slotBFileName: "should-not-appear.csv",
});
const bothCompare = normalizeCompareContext({
  slotAOccupied: true,
  slotBOccupied: true,
  slotAFileName: "grupo-a.csv",
  slotBFileName: "grupo-b.csv",
});

assertCase(
  "p6.2.adapter-occupancy-filenames",
  emptyCompare.domain === "compare" &&
    emptyCompare.slotAOccupied === false &&
    emptyCompare.slotBFileName === null &&
    aOnlyCompare.slotAFileName === "grupo-a.csv" &&
    aOnlyCompare.slotBFileName === null &&
    bothCompare.slotBFileName === "grupo-b.csv",
  aOnlyCompare.slotAFileName ?? "none"
);

const scenarioA = runConversationCore({
  text: "¿Y esto lo puedo analizar?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: null,
});
assertCase(
  "p6.2.scenario-a-analyze-from-compare",
  scenarioA.orientation.kind === "scientific_area" &&
    !scenarioA.orientation.homeCardId &&
    /an[aá]lisis/i.test(scenarioA.explanation) &&
    /no cambia de secci/i.test(scenarioA.explanation) &&
    /ejecuta el an[aá]lisis/i.test(scenarioA.explanation),
  `${scenarioA.orientation.productArea}/${scenarioA.orientation.kind}`
);

const scenarioB = runConversationCore({
  text: "¿Puedo comparar estos grupos?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: true,
    activeConversationDomain: "analyze",
  },
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: null,
});
assertCase(
  "p6.2.scenario-b-compare-from-analyze",
  scenarioB.orientation.kind === "data_area" &&
    scenarioB.orientation.productArea === "data_compare_groups" &&
    !scenarioB.orientation.homeCardId &&
    /no inicia el flujo/i.test(scenarioB.explanation),
  scenarioB.orientation.productArea
);

const occupancyEmpty = runConversationCore({
  text: "¿Qué estoy comparando?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: emptyCompare,
  previous: null,
});
assertCase(
  "p6.2.occupancy-empty-does-not-capture",
  /vacío|vacio/i.test(occupancyEmpty.explanation) &&
    /no captura/i.test(occupancyEmpty.explanation) &&
    occupancyEmpty.orientation.productArea === "data_compare_groups",
  occupancyEmpty.interpretation
);

const occupancyA = runConversationCore({
  text: "¿Qué estoy comparando?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: null,
});
const occupancyOther = runConversationCore({
  text: "¿Y esto con qué otro grupo?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: occupancyA,
});
assertCase(
  "p6.2.scenario-c-slot-referent",
  /grupo-a\.csv/i.test(occupancyA.explanation) &&
    /slot b está vacío/i.test(occupancyA.explanation) &&
    /no llena/i.test(occupancyA.explanation) &&
    occupancyOther.orientation.productArea === occupancyA.orientation.productArea &&
    /lo anterior/i.test(occupancyOther.explanation) &&
    !occupancyOther.orientation.homeCardId,
  occupancyOther.orientation.productArea
);

const slotAAsk = runConversationCore({
  text: "¿Qué hay en A?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: occupancyA,
});
const slotBAsk = runConversationCore({
  text: "¿Qué hay en B?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: occupancyA,
});
assertCase(
  "p6.2.slot-a-b-questions",
  slotAAsk.orientation.productArea === "data_compare_groups" &&
    slotBAsk.orientation.productArea === "data_compare_groups" &&
    /vacío|vacio/i.test(slotBAsk.explanation),
  slotBAsk.interpretation
);

const bothOccupied = runConversationCore({
  text: "¿Qué estoy comparando?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: bothCompare,
  previous: null,
});
assertCase(
  "p6.2.both-slots-no-results-runtime",
  /grupo-a\.csv/i.test(bothOccupied.explanation) &&
    /grupo-b\.csv/i.test(bothOccupied.explanation) &&
    /resultados/i.test(bothOccupied.explanation) &&
    /no (ejecuta|genera)/i.test(bothOccupied.explanation) &&
    bothOccupied.orientation.kind === "data_area",
  bothOccupied.orientation.productArea
);

const scenarioD = runConversationCore({
  text: "¿Y dónde hago eso?",
  system: compareSystem,
  analyzeContext: null,
  compareContext: aOnlyCompare,
  previous: occupancyA,
});
assertCase(
  "p6.2.scenario-d-where-referent",
  scenarioD.orientation.productArea === occupancyA.orientation.productArea &&
    scenarioD.orientation.kind === occupancyA.orientation.kind &&
    !scenarioD.orientation.homeCardId &&
    /no navega ni ejecuta/i.test(scenarioD.explanation),
  scenarioD.orientation.productArea
);

assertCase(
  "p6.2.active-domain-compare",
  deriveActiveConversationDomain({
    workspaceSection: "data",
    dataWorkspaceView: "experimental",
    comparisonSurfaceOpen: true,
    importDestinationActive: false,
  }) === "compare",
  "compare domain"
);

assertCase(
  "p6.2.compare-provider-not-wired",
  (CONVERSATION_CORE_CONTEXT_PROVIDERS as readonly string[]).includes("compare") &&
    !(WIRED_CONVERSATION_DOMAINS as readonly string[]).includes("compare") &&
    CONVERSATION_ARCHITECTURE.independentDomainAssistants === false &&
    CONVERSATION_ARCHITECTURE.implemented === false,
  "provider"
);

const relationBlob = JSON.stringify(PRODUCT_RELATION_MAP).toLowerCase();
assertCase(
  "p6.2.relations-product-not-methods",
  PRODUCT_RELATION_MAP.compare.includes("analyze") &&
    PRODUCT_RELATION_MAP.analyze.includes("compare") &&
    !relationBlob.includes("pearson") &&
    !relationBlob.includes("anova") &&
    !relationBlob.includes("spearman") &&
    !relationBlob.includes("manova") &&
    !relationBlob.includes("regression"),
  "relations"
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const adapterSource = readFileSync(
  join(repoRoot, "src/lib/conversation/compare-adapter.ts"),
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

assertCase(
  "p6.2.no-compare-assistant-or-mutators",
  !adapterSource.includes("Assistant") &&
    !queryBoxSource.includes("CompareQueryBox") &&
    !adapterSource.includes("captureComparisonSlot") &&
    !adapterSource.includes("startGuidedWorkflow") &&
    !coreSource.includes("comparisonAnalysis") &&
    !contractSource.includes("groupLabels") &&
    !contractSource.includes("workflowStepLabel"),
  "isolation"
);

const summary = {
  phase: "conversation-compare-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
