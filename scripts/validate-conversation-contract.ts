import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONVERSATION_POLICY,
  UNWIRED_CONVERSATION_DOMAINS,
  WIRED_CONVERSATION_DOMAINS,
  homeConversationContext,
  isWiredConversationDomain,
} from "../src/lib/conversation/contract";
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
    UNWIRED_CONVERSATION_DOMAINS.length === 6,
  WIRED_CONVERSATION_DOMAINS.join(",")
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
assertCase(
  "p5.4.no-other-domain-wiring",
  !pageSource.includes("@/lib/conversation") &&
    !useSmartStartSource.includes("@/lib/conversation") &&
    !assistantSource.includes("@/lib/conversation") &&
    !assistantSource.includes("src/lib/conversation"),
  "ui unwired"
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

const summary = {
  phase: "conversation-contract",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
