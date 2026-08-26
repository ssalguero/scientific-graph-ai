import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONVERSATION_ARCHITECTURE,
} from "../src/lib/conversation/architecture";
import {
  CONVERSATION_CORE_CONTEXT_PROVIDERS,
  CONVERSATION_DOMAINS_THAT_ARE_NOT_WORKSPACE_SECTIONS,
  CONVERSATION_POLICY,
  DOCUMENTED_WORKSPACE_SECTIONS,
  UNWIRED_CONVERSATION_DOMAINS,
  WIRED_CONVERSATION_DOMAINS,
  homeConversationContext,
  isWiredConversationDomain,
} from "../src/lib/conversation/contract";
import { runConversationCore } from "../src/lib/conversation/core";
import { deriveActiveConversationDomain, normalizeAnalyzeContext } from "../src/lib/conversation/analyze-adapter";
import { CONVERSATION_LAYER_OWNERS } from "../src/lib/conversation/layers";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectSourceFiles(relDir: string): string[] {
  const absDir = join(repoRoot, relDir);
  if (!existsSync(absDir)) return [];
  const out: string[] = [];
  function walk(abs: string, rel: string) {
    for (const name of readdirSync(abs)) {
      const nextAbs = join(abs, name);
      const nextRel = join(rel, name);
      if (statSync(nextAbs).isDirectory()) {
        walk(nextAbs, nextRel);
        continue;
      }
      if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(nextRel);
    }
  }
  walk(absDir, relDir);
  return out;
}

const conversationFiles = collectSourceFiles("src/lib/conversation");
const conversationSources = conversationFiles.map((rel) => ({
  rel,
  source: readFileSync(join(repoRoot, rel), "utf8"),
}));

assertCase(
  "p5.4.wired-home-only",
  WIRED_CONVERSATION_DOMAINS.length === 1 &&
    WIRED_CONVERSATION_DOMAINS[0] === "home" &&
    isWiredConversationDomain("home") &&
    !(UNWIRED_CONVERSATION_DOMAINS as readonly string[]).includes("home") &&
    UNWIRED_CONVERSATION_DOMAINS.length === 7 &&
    (UNWIRED_CONVERSATION_DOMAINS as readonly string[]).includes("reports"),
  WIRED_CONVERSATION_DOMAINS.join(",")
);

assertCase(
  "p6.0.reports-unwired",
  (UNWIRED_CONVERSATION_DOMAINS as readonly string[]).includes("reports") &&
    !(WIRED_CONVERSATION_DOMAINS as readonly string[]).includes("reports") &&
    !isWiredConversationDomain("reports"),
  "reports"
);

assertCase(
  "p5.4.policy-human-control",
  CONVERSATION_POLICY.allowLlm === false &&
    CONVERSATION_POLICY.allowAutoNavigation === false &&
    CONVERSATION_POLICY.allowAutoExecution === false &&
    CONVERSATION_POLICY.allowMethodDecision === false &&
    CONVERSATION_POLICY.allowPersistentMemory === false &&
    CONVERSATION_POLICY.allowProactiveIntervention === false &&
    CONVERSATION_POLICY.onDemandOnly === true,
  JSON.stringify(CONVERSATION_POLICY)
);

const forbiddenImportPatterns = [
  /from\s+["']openai["']/,
  /from\s+["']@\/app\/page["']/,
  /from\s+["']@\/app\/page\.tsx["']/,
  /handleSmartStartSelect/,
  /selectWorkspaceSection/,
];
const conversationHits = conversationSources.flatMap((file) =>
  forbiddenImportPatterns
    .filter((pattern) => pattern.test(file.source))
    .map((pattern) => `${file.rel}:${pattern}`)
);
assertCase(
  "p5.4.no-llm-no-results-imports",
  conversationHits.length === 0,
  conversationHits.join(", ") || "none"
);

const mapped = homeConversationContext({
  hasDataset: false,
  hasExperimentalSeries: true,
});
assertCase(
  "p5.4.home-context-map",
  mapped.domain === "home" &&
    mapped.hasDataset === false &&
    mapped.hasExperimentalSeries === true,
  `${mapped.domain}/${mapped.hasDataset}/${mapped.hasExperimentalSeries}`
);

assertCase(
  "p5.4.layers-keep-results-separate",
  CONVERSATION_LAYER_OWNERS.results_reporting.some((item) =>
    item.includes("generateScientificAssistantReport")
  ) &&
    CONVERSATION_LAYER_OWNERS.results_reporting.some((item) =>
      item.includes("reports domain is unwired")
    ) &&
    !CONVERSATION_LAYER_OWNERS.conversational.some((item) =>
      item.includes("page.tsx")
    ),
  "layers"
);

const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
const useSmartStartSource = readFileSync(
  join(repoRoot, "src/app/useSmartStart.ts"),
  "utf8"
);
const assistantSource = readFileSync(
  join(repoRoot, "src/components/home/SmartStartIntentAssistant.tsx"),
  "utf8"
);

const uiImportDirs = [
  "src/app",
  "src/components/home",
  "src/components/comparison",
  "src/components/reports",
  "src/components/graph-builder",
];
const uiImportHits = uiImportDirs.flatMap((dir) =>
  collectSourceFiles(dir)
    .filter((rel) => {
      const source = readFileSync(join(repoRoot, rel), "utf8");
      return (
        source.includes("@/lib/conversation") ||
        source.includes("src/lib/conversation")
      );
    })
);

assertCase(
  "p5.4.no-other-domain-wiring",
  !pageSource.includes("@/lib/conversation") &&
    !useSmartStartSource.includes("@/lib/conversation") &&
    !assistantSource.includes("@/lib/conversation") &&
    !assistantSource.includes("src/lib/conversation"),
  "ui unwired"
);

assertCase(
  "p6.0.ui-does-not-import-contract",
  uiImportHits.length === 0,
  uiImportHits.join(", ") || "none"
);

assertCase(
  "p6.0.home-context-tests-only",
  !assistantSource.includes("homeConversationContext") &&
    !pageSource.includes("homeConversationContext") &&
    !useSmartStartSource.includes("homeConversationContext"),
  "homeConversationContext tests-only"
);

const followUpCatalog = readFileSync(
  join(repoRoot, "src/lib/smart-start/follow-up-catalog.ts"),
  "utf8"
);
const resolveTurn = readFileSync(
  join(repoRoot, "src/lib/smart-start/resolve-turn.ts"),
  "utf8"
);
const continuationResolve = readFileSync(
  join(repoRoot, "src/lib/smart-start/continuation-resolve.ts"),
  "utf8"
);
assertCase(
  "p5.4.catalogs-not-moved",
  followUpCatalog.includes("FOLLOW_UP_CUES") &&
    resolveTurn.includes("resolveTurnType") &&
    continuationResolve.includes("matchContinuationAnswer") &&
    !followUpCatalog.includes("@/lib/conversation") &&
    !resolveTurn.includes("@/lib/conversation") &&
    !continuationResolve.includes("@/lib/conversation"),
  "catalogs stay in smart-start"
);

assertCase(
  "p6.0.single-conversation-core",
  CONVERSATION_ARCHITECTURE.singleConversationCore === true &&
    CONVERSATION_ARCHITECTURE.independentDomainAssistants === false &&
    CONVERSATION_ARCHITECTURE.adaptersNormalizeContextOnly === true &&
    CONVERSATION_ARCHITECTURE.orientationIsSemanticNotNavigation === true &&
    CONVERSATION_ARCHITECTURE.implemented === false &&
    CONVERSATION_ARCHITECTURE.coreRuntimeEnabled === true,
  JSON.stringify(CONVERSATION_ARCHITECTURE)
);

assertCase(
  "p6.1.analyze-is-provider-not-wired",
  CONVERSATION_CORE_CONTEXT_PROVIDERS.length === 1 &&
    CONVERSATION_CORE_CONTEXT_PROVIDERS[0] === "analyze" &&
    WIRED_CONVERSATION_DOMAINS[0] === "home" &&
    !(WIRED_CONVERSATION_DOMAINS as readonly string[]).includes("analyze") &&
    (UNWIRED_CONVERSATION_DOMAINS as readonly string[]).includes("analyze"),
  "analyze provider"
);

const scenarioA = runConversationCore({
  text: "¿Puedo comparar estos grupos?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: true,
    activeConversationDomain: "analyze",
  },
  analyzeContext: normalizeAnalyzeContext({
    hasDataset: true,
    hasExperimentalSeries: true,
    inspectorCategory: "statistics",
    hasExecutedAnalysis: false,
  }),
  previous: null,
});
assertCase(
  "p6.1.scenario-a",
  scenarioA.orientation.productArea === "data_compare_groups" &&
    scenarioA.orientation.kind === "data_area" &&
    !scenarioA.orientation.homeCardId,
  scenarioA.orientation.productArea
);

const scenarioB = runConversationCore({
  text: "¿Esto lo puedo analizar?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: false,
    activeConversationDomain: "math",
  },
  analyzeContext: null,
  previous: null,
});
assertCase(
  "p6.1.scenario-b",
  scenarioB.orientation.kind === "scientific_area" &&
    !scenarioB.orientation.homeCardId,
  scenarioB.orientation.productArea
);

const scenarioC = runConversationCore({
  text: "¿Y dónde hago eso?",
  system: {
    hasDataset: true,
    hasExperimentalSeries: true,
    activeConversationDomain: "analyze",
  },
  analyzeContext: normalizeAnalyzeContext({
    hasDataset: true,
    hasExperimentalSeries: true,
    inspectorCategory: "statistics",
    hasExecutedAnalysis: false,
  }),
  previous: scenarioA,
});
assertCase(
  "p6.1.scenario-c",
  scenarioC.orientation.productArea === scenarioA.orientation.productArea &&
    !scenarioC.orientation.homeCardId,
  scenarioC.orientation.productArea
);

assertCase(
  "p6.1.visual-builder-unspecified-domain",
  deriveActiveConversationDomain({
    workspaceSection: "data",
    dataWorkspaceView: "visual-builder",
    comparisonSurfaceOpen: false,
    importDestinationActive: false,
  }) === null &&
    runConversationCore({
      text: "¿Puedo comparar estos grupos?",
      system: {
        hasDataset: true,
        hasExperimentalSeries: false,
        activeConversationDomain: null,
      },
      analyzeContext: null,
      previous: null,
    }).orientation.productArea === "data_compare_groups",
  "null is unspecified; Core still orients"
);

const queryBoxSource = readFileSync(
  join(repoRoot, "src/components/conversation/ConversationQueryBox.tsx"),
  "utf8"
);
assertCase(
  "p6.1.query-box-no-mutators",
  queryBoxSource.includes("runConversationCore") &&
    !queryBoxSource.includes("selectWorkspaceSection") &&
    !queryBoxSource.includes("setAnalysisInspectorSection") &&
    !queryBoxSource.includes("handleSmartStartSelect") &&
    !queryBoxSource.includes("startGuidedWorkflow") &&
    !queryBoxSource.includes("setShow"),
  "query box"
);

assertCase(
  "p6.1.page-mounts-box-not-contract",
  pageSource.includes("ConversationQueryBox") &&
    !pageSource.includes("@/lib/conversation"),
  "page mount"
);

const assistantNamedFiles = conversationFiles.filter((rel) =>
  /assistant/i.test(basename(rel))
);
assertCase(
  "p6.0.no-domain-assistants",
  assistantNamedFiles.length === 0,
  assistantNamedFiles.join(", ") || "none"
);

const workspaceSectionSet = new Set<string>(DOCUMENTED_WORKSPACE_SECTIONS);
const domainSectionCollisions =
  CONVERSATION_DOMAINS_THAT_ARE_NOT_WORKSPACE_SECTIONS.filter((domain) =>
    workspaceSectionSet.has(domain)
  );
assertCase(
  "p6.0.domain-is-not-workspace-section",
  domainSectionCollisions.length === 0 &&
    workspaceSectionSet.has("results") &&
    workspaceSectionSet.has("reports") &&
    workspaceSectionSet.has("home"),
  domainSectionCollisions.join(",") || "ok"
);

const orientationRel = "src/lib/conversation/orientation.ts";
const orientationSource = conversationSources.find(
  (file) => file.rel.replace(/\\/g, "/") === orientationRel
)?.source ?? "";
const forbiddenOrientationFields = [
  "target:",
  "route:",
  "href:",
  "navigate:",
  "destination:",
  "workspaceSection:",
  "inspectorSection:",
];
const orientationFieldHits = forbiddenOrientationFields.filter((field) =>
  orientationSource.includes(field)
);
const forbiddenOrientationFns = [
  "orientationToNavigation",
  "applyOrientation",
  "navigateTo",
  "setAnalysisInspectorSection",
  "startGuidedWorkflow",
];
const orientationFnHits = conversationSources.flatMap((file) =>
  forbiddenOrientationFns
    .filter((name) => file.source.includes(name))
    .map((name) => `${file.rel}:${name}`)
);
assertCase(
  "p6.0.orientation-not-a-command",
  orientationSource.includes("ConversationOrientation") &&
    orientationSource.includes("Display / explain only") &&
    orientationFieldHits.length === 0 &&
    orientationFnHits.length === 0,
  [...orientationFieldHits, ...orientationFnHits].join(", ") || "ok"
);

const architectureSource =
  conversationSources.find(
    (file) => file.rel.replace(/\\/g, "/").endsWith("architecture.ts")
  )?.source ?? "";
assertCase(
  "p6.0.adapters-normalize-context-only",
  architectureSource.includes('role: "normalize_context"') &&
    architectureSource.includes("DomainContextAdapter") &&
    !architectureSource.includes("buildGuidanceDecision") &&
    !/:\s*GuidanceDecision/.test(architectureSource) &&
    !/:\s*ConversationOrientation/.test(architectureSource),
  "ok"
);

const summary = {
  phase: "conversation-contract",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
