/**
 * AI-I8 — Extension Infrastructure readiness gate.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_EXTENSION_REEXPORTS,
  AI_EXTENSION_REQUIRED_DIRS,
  AI_EXTENSION_REQUIRED_FILES,
} from "../src/ai/internal/boundary-policy";

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

for (const rel of AI_EXTENSION_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`i8.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

for (const rel of AI_EXTENSION_REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`i8.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "i8.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I8-Extension-Infrastructure.md")),
  "AI-I8 implementation record",
);

const registry = existsSync(join(aiDir, "extension/registration/registry.ts"))
  ? readFileSync(join(aiDir, "extension/registration/registry.ts"), "utf8")
  : "";
assertCase(
  "i8.registry.count",
  /AI_EXTENSION_SLOT_COUNT\s*=\s*3/.test(registry) &&
    /AI_SPECIALIZED_ASSISTANT_EXTENSION_ID/.test(registry) &&
    /AI_DISCIPLINE_SPECIFIC_EXTENSION_ID/.test(registry) &&
    /AI_PREDICTIVE_ASSISTANCE_EXTENSION_ID/.test(registry) &&
    /introducesNewCapabilityCategory:\s*false/.test(registry),
  "3 certified slots; no new capability categories",
);

const sa = existsSync(join(aiDir, "extension/specialized-assistants/identity.ts"))
  ? readFileSync(join(aiDir, "extension/specialized-assistants/identity.ts"), "utf8")
  : "";
assertCase(
  "i8.no.assistants",
  /AI_SPECIALIZED_ASSISTANT_IMPLEMENTED\s*=\s*false/.test(sa),
  "specialized assistants not implemented",
);

const pred = existsSync(join(aiDir, "extension/predictive-assistance/identity.ts"))
  ? readFileSync(join(aiDir, "extension/predictive-assistance/identity.ts"), "utf8")
  : "";
assertCase(
  "i8.no.prediction",
  /AI_PREDICTION_IMPLEMENTED\s*=\s*false/.test(pred) &&
    /AI_INFERENCE_ENABLED\s*=\s*false/.test(pred),
  "prediction/inference not implemented",
);

const disc = existsSync(join(aiDir, "extension/discipline-specific/identity.ts"))
  ? readFileSync(join(aiDir, "extension/discipline-specific/identity.ts"), "utf8")
  : "";
assertCase(
  "i8.no.discipline",
  /AI_DISCIPLINE_LOGIC_IMPLEMENTED\s*=\s*false/.test(disc),
  "discipline logic not implemented",
);

const compose = existsSync(join(aiDir, "extension/compose-extension.ts"))
  ? readFileSync(join(aiDir, "extension/compose-extension.ts"), "utf8")
  : "";
assertCase(
  "i8.compose",
  /runtimeExtension:\s*false/.test(compose) &&
    /anyImplemented:\s*false/.test(compose) &&
    /aiOptionalPreserved:\s*true/.test(compose),
  "compose: slots inactive; AI Optional preserved",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "i8.public.status",
  /AI_EXTENSION_PHASE/.test(publicBarrel) && /AI_EXTENSION_STATUS/.test(publicBarrel),
  "public barrel exports extension status markers",
);
assertCase(
  "i8.public.no.wiring",
  !/composeExtension/.test(publicBarrel) &&
    !/from\s+["']\.\/extension["']/.test(publicBarrel),
  "public barrel must not export extension wiring",
);

for (const allowed of AI_ALLOWED_PUBLIC_EXTENSION_REEXPORTS) {
  assertCase(
    `i8.public.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected ${allowed}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "llm", re: /\b(OpenAI|Anthropic|createChatCompletion)\b/ },
  { id: "prompt", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "provider", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
  { id: "assistant-impl", re: /\b(createAssistant|AssistantRuntime|ChatBot)\b/ },
  { id: "prediction-engine", re: /\b(PredictionEngine|runInference|forecastModel)\b/ },
  { id: "fetch", re: /\bfetch\s*\(/ },
];

for (const file of collectTsFiles(join(aiDir, "extension"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    assertCase(`i8.no.${id}.${rel}`, !re.test(src), re.test(src) ? `forbidden ${id}` : "clean");
  }
  if (/from\s+["']@\/(engine|data|ui)/.test(src)) {
    assertCase(`i8.deps.${rel}`, false, "must not import ENGINE/DATA/UX");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-ai-extension: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-ai-extension: ${results.length} checks PASS`);
