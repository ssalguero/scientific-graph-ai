import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeAnalyzeContext } from "../src/lib/conversation/analyze-adapter";
import { CONVERSATION_ARCHITECTURE } from "../src/lib/conversation/architecture";
import {
  CONVERSATION_CORE_CONTEXT_PROVIDERS,
  WIRED_CONVERSATION_DOMAINS,
} from "../src/lib/conversation/contract";
import { runConversationCore } from "../src/lib/conversation/core";

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

const coreInput = {
  system: analyzeSystem,
  analyzeContext,
  compareContext: null as null,
  mathContext: null as null,
};

const resultsAsk = runConversationCore({
  ...coreInput,
  text: "¿Dónde están los resultados?",
  previous: null,
});
assertCase(
  "p6.5.results-first-turn-location",
  resultsAsk.orientation.productArea === "existing_results" &&
    resultsAsk.orientation.kind === "existing_dashboard" &&
    !resultsAsk.orientation.homeCardId &&
    /no genera resultados/i.test(resultsAsk.explanation) &&
    !/no hay un referente previo/i.test(resultsAsk.explanation),
  `${resultsAsk.orientation.productArea}/${resultsAsk.interpretation}`
);

const reportsAsk = runConversationCore({
  ...coreInput,
  text: "¿Dónde están los reportes?",
  previous: null,
});
assertCase(
  "p6.5.reports-first-turn-location",
  reportsAsk.orientation.productArea === "existing_reports" &&
    reportsAsk.orientation.kind === "existing_dashboard" &&
    !reportsAsk.orientation.homeCardId &&
    /no genera un reporte/i.test(reportsAsk.explanation) &&
    !/no hay un referente previo/i.test(reportsAsk.explanation),
  `${reportsAsk.orientation.productArea}/${reportsAsk.interpretation}`
);

const evaluateAsk = runConversationCore({
  ...coreInput,
  text: "¿Dónde evalúo la metodología?",
  previous: null,
});
const evaluateBlob = `${evaluateAsk.explanation} ${evaluateAsk.interpretation}`.toLowerCase();
assertCase(
  "p6.5.evaluate-methodology-location",
  evaluateAsk.orientation.productArea === "publication_evaluation" &&
    evaluateAsk.orientation.kind === "scientific_area" &&
    !evaluateAsk.orientation.homeCardId &&
    /no inicia un flujo/i.test(evaluateAsk.explanation) &&
    /no elige un m[eé]todo/i.test(evaluateAsk.explanation) &&
    !evaluateBlob.includes("sci-50") &&
    !evaluateBlob.includes("pearson") &&
    !evaluateBlob.includes("anova"),
  `${evaluateAsk.orientation.productArea}/${evaluateAsk.interpretation}`
);

const methodChoice = runConversationCore({
  ...coreInput,
  text: "¿Qué metodología uso?",
  previous: null,
});
const methodChoice2 = runConversationCore({
  ...coreInput,
  text: "¿Qué método elijo?",
  previous: null,
});
assertCase(
  "p6.5.method-refusal-preserved",
  /no ejecuta|no elige/i.test(methodChoice.explanation) &&
    /no ejecuta|no elige/i.test(methodChoice2.explanation) &&
    methodChoice.orientation.productArea !== "publication_evaluation" &&
    methodChoice2.orientation.productArea !== "publication_evaluation",
  `${methodChoice.interpretation}/${methodChoice2.interpretation}`
);

const compareAsk = runConversationCore({
  ...coreInput,
  text: "¿Puedo comparar estos grupos?",
  previous: null,
});
const whereContinuation = runConversationCore({
  ...coreInput,
  text: "¿Y dónde hago eso?",
  previous: compareAsk,
});
assertCase(
  "p6.5.previous-turn-where-preserved",
  compareAsk.orientation.productArea === "data_compare_groups" &&
    whereContinuation.orientation.productArea === compareAsk.orientation.productArea &&
    whereContinuation.orientation.kind === compareAsk.orientation.kind &&
    /localizar|encuentra/i.test(whereContinuation.explanation),
  whereContinuation.orientation.productArea
);

const constructorAsk = runConversationCore({
  ...coreInput,
  text: "¿Dónde está el constructor de curvas?",
  previous: null,
});
assertCase(
  "p6.5.math-constructor-location-preserved",
  constructorAsk.orientation.productArea === "data_graphs_math" &&
    constructorAsk.orientation.kind === "data_area" &&
    /constructor de curvas/i.test(constructorAsk.explanation),
  constructorAsk.orientation.productArea
);

const vgbAsk = runConversationCore({
  ...coreInput,
  text: "¿Dónde está el constructor visual?",
  previous: null,
});
const vgbAsk2 = runConversationCore({
  ...coreInput,
  text: "Quiero el Visual Builder",
  previous: null,
});
assertCase(
  "p6.5.vgb-not-math-constructor",
  vgbAsk.orientation.productArea !== "data_graphs_math" &&
    vgbAsk2.orientation.productArea !== "data_graphs_math" &&
    !vgbAsk.orientation.homeCardId,
  `${vgbAsk.orientation.productArea}/${vgbAsk2.orientation.productArea}`
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const conversationDir = join(repoRoot, "src/lib/conversation");
const conversationFiles = readdirSync(conversationDir).join(" ");
assertCase(
  "p6.5.no-new-adapter-or-wired-domain",
  CONVERSATION_CORE_CONTEXT_PROVIDERS.length === 3 &&
    (CONVERSATION_CORE_CONTEXT_PROVIDERS as readonly string[]).includes("math") &&
    WIRED_CONVERSATION_DOMAINS[0] === "home" &&
    WIRED_CONVERSATION_DOMAINS.length === 1 &&
    CONVERSATION_ARCHITECTURE.implemented === false &&
    CONVERSATION_ARCHITECTURE.independentDomainAssistants === false &&
    !conversationFiles.includes("evaluate-adapter") &&
    !conversationFiles.includes("results-adapter") &&
    !conversationFiles.includes("reports-adapter") &&
    !conversationFiles.includes("advanced-adapter"),
  conversationFiles
);

const coreSource = readFileSync(join(conversationDir, "core.ts"), "utf8");
assertCase(
  "p6.5.core-no-nav-exec-generation",
  !coreSource.includes("selectWorkspaceSection") &&
    !coreSource.includes("generateGraph") &&
    !coreSource.includes("generateScientificAssistantReport") &&
    !coreSource.includes("startGuidedWorkflow") &&
    !coreSource.includes("scientificAssistantReport"),
  "core isolation"
);

const summary = {
  phase: "conversation-location-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
