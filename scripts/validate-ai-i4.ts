/**
 * AI-I4 — Analytical Interpretation + Workflow Guidance readiness gate.
 *
 * Authority: AI-P3 §6.6/§6.7 · AI-P6 AI-I4 · ENGINE execution ownership · AD-006
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_CORE_REEXPORTS,
  AI_I4_REQUIRED_DIRS,
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

const collectTsFiles = (dirs: string[]): string[] => {
  const out: string[] = [];
  const walk = (abs: string) => {
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(ts|tsx)$/.test(name)) out.push(child);
    }
  };
  for (const d of dirs) walk(d);
  return out;
};

for (const rel of AI_I4_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`i4.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

const REQUIRED_FILES = [
  "core/analytical-interpretation/index.ts",
  "core/analytical-interpretation/identity.ts",
  "core/analytical-interpretation/lifecycle.ts",
  "core/workflow-guidance/index.ts",
  "core/workflow-guidance/identity.ts",
  "core/workflow-guidance/lifecycle.ts",
  "core/core-capabilities-status.ts",
  "core/compose-core-capabilities.ts",
  "core/capability-registry/registry.ts",
];

for (const rel of REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`i4.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "i4.doc",
  existsSync(
    join(repoRoot, "docs/AI/implementation/AI-I4-Analytical-Interpretation-Workflow-Guidance.md"),
  ),
  "AI-I4 implementation record",
);

const aiLc = existsSync(join(coreDir, "analytical-interpretation/lifecycle.ts"))
  ? readFileSync(join(coreDir, "analytical-interpretation/lifecycle.ts"), "utf8")
  : "";
assertCase(
  "i4.interpretation.inactive",
  /runtimeInterpretation:\s*false/.test(aiLc) && /scientificValidation:\s*false/.test(aiLc),
  "Analytical Interpretation must remain inactive",
);

const aiId = existsSync(join(coreDir, "analytical-interpretation/identity.ts"))
  ? readFileSync(join(coreDir, "analytical-interpretation/identity.ts"), "utf8")
  : "";
assertCase(
  "i4.interpretation.no.certify",
  /AI_ANALYTICAL_INTERPRETATION_CERTIFIES_CORRECTNESS\s*=\s*false/.test(aiId),
  "Never certifies scientific correctness",
);

const wgLc = existsSync(join(coreDir, "workflow-guidance/lifecycle.ts"))
  ? readFileSync(join(coreDir, "workflow-guidance/lifecycle.ts"), "utf8")
  : "";
assertCase(
  "i4.guidance.inactive",
  /executesWorkflows:\s*false/.test(wgLc) &&
    /orchestratesProductFlows:\s*false/.test(wgLc) &&
    /runtimeGuidance:\s*false/.test(wgLc),
  "Workflow Guidance must not execute or orchestrate",
);

const wgId = existsSync(join(coreDir, "workflow-guidance/identity.ts"))
  ? readFileSync(join(coreDir, "workflow-guidance/identity.ts"), "utf8")
  : "";
assertCase(
  "i4.guidance.engine.owner",
  /AI_WORKFLOW_EXECUTION_OWNER\s*=\s*"ENGINE"/.test(wgId) &&
    /AI_WORKFLOW_GUIDANCE_EXECUTES\s*=\s*false/.test(wgId),
  "ENGINE remains sole workflow execution authority",
);

const compose = existsSync(join(coreDir, "compose-core-capabilities.ts"))
  ? readFileSync(join(coreDir, "compose-core-capabilities.ts"), "utf8")
  : "";
assertCase(
  "i4.compose.complete",
  /coreSetComplete:\s*true/.test(compose) &&
    /runtimeIntelligence:\s*false/.test(compose) &&
    /workflowExecution:\s*false/.test(compose),
  "compose snapshot: core complete, no runtime/execution",
);

const registry = existsSync(join(coreDir, "capability-registry/registry.ts"))
  ? readFileSync(join(coreDir, "capability-registry/registry.ts"), "utf8")
  : "";
assertCase(
  "i4.registry.count",
  /AI_CORE_CAPABILITY_COUNT\s*=\s*7/.test(registry) &&
    /AI_ANALYTICAL_INTERPRETATION_ID/.test(registry) &&
    /AI_WORKFLOW_GUIDANCE_ID/.test(registry),
  "Core registry includes AI-I4 capabilities (7 total)",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "i4.public.status.markers",
  /AI_CORE_CAPABILITIES_PHASE/.test(publicBarrel) &&
    /AI_CORE_CAPABILITIES_STATUS/.test(publicBarrel),
  "public barrel exports core-capabilities status markers",
);
assertCase(
  "i4.public.no.wiring",
  !/composeCoreCapabilities/.test(publicBarrel) &&
    !/from\s+["']\.\/core\/analytical-interpretation["']/.test(publicBarrel) &&
    !/from\s+["']\.\/core\/workflow-guidance["']/.test(publicBarrel),
  "public barrel must not export I4 wiring/capabilities",
);

for (const allowed of AI_ALLOWED_PUBLIC_CORE_REEXPORTS) {
  assertCase(
    `i4.public.allowed.${allowed}`,
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
  { id: "runtime-api", re: /\b(configureAi|getAiApi|createAssistant|runInference|executeWorkflow)\b/ },
  { id: "fetch", re: /\bfetch\s*\(/ },
];

const files = collectTsFiles([
  join(coreDir, "analytical-interpretation"),
  join(coreDir, "workflow-guidance"),
]);
for (const extra of [
  join(coreDir, "compose-core-capabilities.ts"),
  join(coreDir, "core-capabilities-status.ts"),
]) {
  if (existsSync(extra)) files.push(extra);
}

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    const hit = re.test(src);
    assertCase(`i4.no.${id}.${rel}`, !hit, hit ? `forbidden ${id}` : "clean");
  }
  if (/from\s+["']@\/engine/.test(src) || /from\s+["']@\/ui/.test(src)) {
    assertCase(`i4.deps.forbidden.${rel}`, false, "must not import ENGINE or UX modules");
  }
  if (/from\s+["']@\/data/.test(src)) {
    assertCase(`i4.deps.no.data.${rel}`, false, "AI-I4 skeleton must not import DATA");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-ai-i4: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-ai-i4: ${results.length} checks PASS`);
