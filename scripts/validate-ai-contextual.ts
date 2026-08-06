/**
 * AI-I3 — Contextual Assistance readiness gate.
 *
 * Authority: AI-P2 · AI-P3 §6.1/6.3/6.4 · AI-P6 AI-I3 · Decision Authority
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_CORE_REEXPORTS,
  AI_CONTEXTUAL_REQUIRED_DIRS,
} from "../src/ai/internal/boundary-policy";

const repoRoot = process.cwd();
const aiDir = join(repoRoot, "src/ai");
const caDir = join(aiDir, "core/contextual-assistance");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  walk(dir);
  return out;
};

for (const rel of AI_CONTEXTUAL_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`ca.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

const REQUIRED_FILES = [
  "core/contextual-assistance/index.ts",
  "core/contextual-assistance/status.ts",
  "core/contextual-assistance/compose-contextual.ts",
  "core/contextual-assistance/assistance/identity.ts",
  "core/contextual-assistance/assistance/lifecycle.ts",
  "core/contextual-assistance/recommendation/identity.ts",
  "core/contextual-assistance/recommendation/lifecycle.ts",
  "core/contextual-assistance/explanation/identity.ts",
  "core/contextual-assistance/explanation/lifecycle.ts",
  "core/contextual-assistance/registration/registry.ts",
];

for (const rel of REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`ca.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "ca.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I3-Contextual-Assistance.md")),
  "AI-I3 implementation record",
);

const assistanceLc = existsSync(join(caDir, "assistance/lifecycle.ts"))
  ? readFileSync(join(caDir, "assistance/lifecycle.ts"), "utf8")
  : "";
assertCase(
  "ca.assistance.inactive",
  /runtimeAssistance:\s*false/.test(assistanceLc) &&
    /conversationsEnabled:\s*false/.test(assistanceLc),
  "Contextual Assistance must remain inactive",
);

const recLc = existsSync(join(caDir, "recommendation/lifecycle.ts"))
  ? readFileSync(join(caDir, "recommendation/lifecycle.ts"), "utf8")
  : "";
assertCase(
  "ca.recommendation.inactive",
  /generatesRecommendations:\s*false/.test(recLc) &&
    /runtimeRecommendations:\s*false/.test(recLc),
  "No runtime recommendations",
);

const recId = existsSync(join(caDir, "recommendation/identity.ts"))
  ? readFileSync(join(caDir, "recommendation/identity.ts"), "utf8")
  : "";
assertCase(
  "ca.recommendation.not.command",
  /AI_RECOMMENDATION_IS_COMMAND\s*=\s*false/.test(recId),
  "Recommendations must never be commands",
);

const expLc = existsSync(join(caDir, "explanation/lifecycle.ts"))
  ? readFileSync(join(caDir, "explanation/lifecycle.ts"), "utf8")
  : "";
assertCase(
  "ca.explanation.inactive",
  /generatesExplanations:\s*false/.test(expLc) &&
    /runtimeExplanations:\s*false/.test(expLc),
  "No runtime explanations",
);

const compose = existsSync(join(caDir, "compose-contextual.ts"))
  ? readFileSync(join(caDir, "compose-contextual.ts"), "utf8")
  : "";
assertCase(
  "ca.wiring.no.runtime",
  /runtimeIntelligence:\s*false/.test(compose) &&
    /runtimeAssistance:\s*false/.test(compose),
  "compose snapshot declares no runtime intelligence",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "ca.public.status.markers",
  /AI_CONTEXTUAL_ASSISTANCE_PHASE/.test(publicBarrel) &&
    /AI_CONTEXTUAL_ASSISTANCE_STATUS/.test(publicBarrel),
  "public barrel exports contextual status markers",
);
assertCase(
  "ca.public.no.wiring",
  !/composeContextualAssistance/.test(publicBarrel) &&
    !/AI_CONTEXTUAL_CAPABILITY_REGISTRY/.test(publicBarrel) &&
    !/from\s+["']\.\/core\/contextual-assistance["']/.test(publicBarrel),
  "public barrel must not export contextual wiring",
);

for (const allowed of AI_ALLOWED_PUBLIC_CORE_REEXPORTS) {
  assertCase(
    `ca.public.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected allowlisted re-export ${allowed}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "llm-client", re: /\b(OpenAI|Anthropic|createChatCompletion|chat\.completions)\b/ },
  { id: "prompt-engine", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "streaming", re: /\b(tokenStream|EventSource)\b/ },
  { id: "tool-calling", re: /\b(toolCall|functionCalling|ToolExecutor)\b/ },
  { id: "session-runtime", re: /\b(AssistantSession|ConversationMemory)\b/ },
  { id: "provider-runtime", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
  { id: "chat", re: /\b(ChatCompletion|chatbot|ChatSession)\b/i },
  { id: "runtime-api", re: /\b(configureAi|getAiApi|createAssistant|runInference)\b/ },
  { id: "fetch", re: /\bfetch\s*\(/ },
];

const caFiles = collectTsFiles(caDir);
for (const file of caFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    const hit = re.test(src);
    assertCase(`ca.no.${id}.${rel}`, !hit, hit ? `forbidden ${id}` : "clean");
  }
  if (/from\s+["']@\/engine/.test(src) || /from\s+["']@\/ui/.test(src)) {
    assertCase(`ca.deps.forbidden.${rel}`, false, "must not import ENGINE or UX");
  }
  if (/from\s+["']@\/data/.test(src)) {
    assertCase(`ca.deps.no.data.${rel}`, false, "AI-I3 must not import DATA (skeleton only)");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-ai-contextual: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-ai-contextual: ${results.length} checks PASS`);
