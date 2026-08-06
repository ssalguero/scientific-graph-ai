/**
 * AI-I2 — Core Intelligence readiness gate.
 *
 * Authority: AI-P2 · AI-P3 · AI-P6 AI-I2 · AD-006 · docs/AI/implementation/AI-I2-Core-Intelligence.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_CORE_REEXPORTS,
  AI_CORE_REQUIRED_DIRS,
  AI_CORE_REQUIRED_FILES,
  AI_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES,
} from "../src/ai/internal/boundary-policy";

const repoRoot = process.cwd();
const aiDir = join(repoRoot, "src/ai");
const coreDir = join(aiDir, "core");

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

for (const rel of AI_CORE_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`core.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

for (const rel of AI_CORE_REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`core.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "core.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I2-Core-Intelligence.md")),
  "AI-I2 implementation record",
);

const ig = existsSync(join(coreDir, "intelligence-generation/identity.ts"))
  ? readFileSync(join(coreDir, "intelligence-generation/identity.ts"), "utf8")
  : "";
assertCase(
  "core.ig.identity",
  /intelligence-generation/.test(ig) && /AI_INTELLIGENCE_GENERATION_ID/.test(ig),
  "Intelligence Generation identity present",
);

const lifecycle = existsSync(join(coreDir, "intelligence-generation/lifecycle.ts"))
  ? readFileSync(join(coreDir, "intelligence-generation/lifecycle.ts"), "utf8")
  : "";
assertCase(
  "core.ig.inactive",
  /runtimeExecution:\s*false/.test(lifecycle) && /inferenceEnabled:\s*false/.test(lifecycle),
  "Intelligence Generation must remain inactive",
);

const derivation = existsSync(join(coreDir, "scientific-grounding/derivation.ts"))
  ? readFileSync(join(coreDir, "scientific-grounding/derivation.ts"), "utf8")
  : "";
assertCase(
  "core.sg.data.owner",
  /truthOwner:\s*AI_SCIENTIFIC_TRUTH_OWNER/.test(derivation) || /"DATA"/.test(derivation),
  "Scientific Grounding truth owner is DATA",
);
assertCase(
  "core.sg.no.mutate",
  /mutatesData:\s*false/.test(derivation) && /ownsData:\s*false/.test(derivation),
  "Scientific Grounding never owns or mutates DATA",
);
assertCase(
  "core.sg.no.reasoning",
  /scientificReasoningImplemented:\s*false/.test(derivation),
  "No scientific reasoning implemented",
);

const compose = existsSync(join(coreDir, "wiring/compose-core.ts"))
  ? readFileSync(join(coreDir, "wiring/compose-core.ts"), "utf8")
  : "";
assertCase(
  "core.wiring.no.runtime",
  /runtimeIntelligence:\s*false/.test(compose) &&
    /intelligenceGenerationActive:\s*false/.test(compose),
  "compose snapshot declares no runtime intelligence",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "core.public.status.markers",
  /AI_CORE_PHASE/.test(publicBarrel) && /AI_CORE_STATUS/.test(publicBarrel),
  "public barrel exports core status markers",
);
assertCase(
  "core.public.no.wiring",
  !/composeAiCore/.test(publicBarrel) &&
    !/AI_CORE_CAPABILITY_REGISTRY/.test(publicBarrel) &&
    !/from\s+["']\.\/core["']/.test(publicBarrel),
  "public barrel must not export core wiring or full core barrel",
);

for (const prefix of AI_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES.filter((p) => p.startsWith("./core"))) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`from\\s+["']${escaped}["']`);
  assertCase(
    `core.public.no.reexport.${prefix}`,
    !re.test(publicBarrel),
    re.test(publicBarrel) ? `forbidden ${prefix}` : "clean",
  );
}

for (const allowed of AI_ALLOWED_PUBLIC_CORE_REEXPORTS) {
  assertCase(
    `core.public.allowed.${allowed}`,
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
  { id: "runtime-api", re: /\b(configureAi|getAiApi|createAssistant|runInference)\b/ },
  { id: "fetch", re: /\bfetch\s*\(/ },
];

const coreFiles = collectTsFiles(coreDir);
for (const file of coreFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    const hit = re.test(src);
    assertCase(`core.no.${id}.${rel}`, !hit, hit ? `forbidden ${id}` : "clean");
  }
  // Dependency isolation: Core must not import ENGINE / UX / data internals
  if (/from\s+["']@\/engine/.test(src) || /from\s+["']@\/ui/.test(src)) {
    assertCase(`core.deps.forbidden.${rel}`, false, "Core must not import ENGINE or UX");
  }
  if (/from\s+["']@\/data\//.test(src) && !/from\s+["']@\/data["']/.test(src)) {
    // Allow only conceptual rules — AI-I2 forbids DATA imports entirely (no runtime)
    assertCase(`core.deps.no.data.import.${rel}`, false, "AI-I2 Core must not import DATA modules");
  }
  if (/from\s+["']@\/data["']/.test(src)) {
    assertCase(`core.deps.no.data.barrel.${rel}`, false, "AI-I2 Core must not import @/data (skeleton only)");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-ai-core: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-ai-core: ${results.length} checks PASS`);
