/**
 * AI-I1 — Infrastructure readiness gate.
 *
 * Authority: AI-P3 · AI-P4 · AI-P6 AI-I1 · docs/AI/implementation/AI-I1-Infrastructure.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS,
  AI_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES,
  AI_INFRASTRUCTURE_REQUIRED_DIRS,
  AI_INFRASTRUCTURE_REQUIRED_FILES,
} from "../src/ai/internal/boundary-policy";
import { AI_CONTRACT_CLASSIFICATION } from "../src/ai/infrastructure/contract-classification";

const repoRoot = process.cwd();
const aiDir = join(repoRoot, "src/ai");

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

for (const rel of AI_INFRASTRUCTURE_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`infra.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

for (const rel of AI_INFRASTRUCTURE_REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`infra.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "infra.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I1-Infrastructure.md")),
  "AI-I1 implementation record",
);

const classificationSrc = existsSync(join(aiDir, "infrastructure/contract-classification.ts"))
  ? readFileSync(join(aiDir, "infrastructure/contract-classification.ts"), "utf8")
  : "";
for (const cls of AI_CONTRACT_CLASSIFICATION) {
  assertCase(
    `infra.classification.${cls}`,
    classificationSrc.includes(`"${cls}"`),
    `contract classification skeleton must include ${cls}`,
  );
}

const exposure = existsSync(join(aiDir, "infrastructure/exposure-boundary.ts"))
  ? readFileSync(join(aiDir, "infrastructure/exposure-boundary.ts"), "utf8")
  : "";
assertCase(
  "infra.exposure.boundary",
  /AI_EXPOSURE_BOUNDARY_ID/.test(exposure) && /intelligence-exposure-boundary/.test(exposure),
  "Intelligence Exposure Boundary marker present",
);

const coordination = existsSync(join(aiDir, "infrastructure/coordination-boundary.ts"))
  ? readFileSync(join(aiDir, "infrastructure/coordination-boundary.ts"), "utf8")
  : "";
assertCase(
  "infra.coordination.boundary",
  /AI_COORDINATION_BOUNDARY_ID/.test(coordination) && /ENGINE/.test(coordination),
  "Coordination Boundary marker; ENGINE remains owner",
);

const compose = existsSync(join(aiDir, "infrastructure/wiring/compose-infrastructure.ts"))
  ? readFileSync(join(aiDir, "infrastructure/wiring/compose-infrastructure.ts"), "utf8")
  : "";
assertCase(
  "infra.wiring.no.side.effects",
  /intelligenceEnabled:\s*false/.test(compose) && /runtimeBehavior:\s*false/.test(compose),
  "compose snapshot must declare no intelligence / no runtime behavior",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "infra.public.status.markers",
  /AI_INFRASTRUCTURE_PHASE/.test(publicBarrel) && /AI_INFRASTRUCTURE_STATUS/.test(publicBarrel),
  "public barrel exports infrastructure status markers",
);
assertCase(
  "infra.public.no.wiring",
  !/composeAiInfrastructure/.test(publicBarrel) &&
    !/AI_DOMAIN_SLOT_REGISTRY/.test(publicBarrel) &&
    !/from\s+["']\.\/infrastructure["']/.test(publicBarrel),
  "public barrel must not export wiring/registration or full infrastructure barrel",
);

for (const prefix of AI_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`from\\s+["']${escaped}["']`);
  const hit = re.test(publicBarrel);
  assertCase(
    `infra.public.no.reexport.${prefix}`,
    !hit,
    hit ? `forbidden re-export ${prefix}` : "clean",
  );
}

for (const allowed of AI_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS) {
  assertCase(
    `infra.public.allowed.${allowed}`,
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
];

const infraFiles = collectTsFiles(join(aiDir, "infrastructure")).concat(
  collectTsFiles(join(aiDir, "internal")),
);
for (const file of infraFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    const hit = re.test(src);
    assertCase(`infra.no.${id}.${rel}`, !hit, hit ? `forbidden ${id}` : "clean");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-ai-infrastructure: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-ai-infrastructure: ${results.length} checks PASS`);
