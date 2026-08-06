/**
 * AI-I7 — Cross-Domain Integration readiness gate.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS,
  AI_INTEGRATION_REQUIRED_DIRS,
  AI_INTEGRATION_REQUIRED_FILES,
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

for (const rel of AI_INTEGRATION_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`i7.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

for (const rel of AI_INTEGRATION_REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`i7.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "i7.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I7-Cross-Domain-Integration.md")),
  "AI-I7 implementation record",
);

const dataPw = existsSync(join(aiDir, "integration/data-integration/pathway.ts"))
  ? readFileSync(join(aiDir, "integration/data-integration/pathway.ts"), "utf8")
  : "";
assertCase(
  "i7.data.ownership",
  /mutatesPeer:\s*false/.test(dataPw) && /ownsPeer:\s*false/.test(dataPw) && /"DATA"/.test(dataPw),
  "DATA pathway never owns/mutates DATA",
);

const engPw = existsSync(join(aiDir, "integration/engine-integration/pathway.ts"))
  ? readFileSync(join(aiDir, "integration/engine-integration/pathway.ts"), "utf8")
  : "";
assertCase(
  "i7.engine.ownership",
  /executesWorkflows:\s*false/.test(engPw) &&
    /AI_ENGINE_EXECUTION_OWNER\s*=\s*"ENGINE"/.test(engPw),
  "ENGINE remains execution owner; no workflow execution",
);

const uxPw = existsSync(join(aiDir, "integration/ux-integration/pathway.ts"))
  ? readFileSync(join(aiDir, "integration/ux-integration/pathway.ts"), "utf8")
  : "";
assertCase(
  "i7.ux.ownership",
  /ownsPresentation:\s*false/.test(uxPw) &&
    /AI_PRESENTATION_OWNER\s*=\s*"UX"/.test(uxPw) &&
    /uiBehavior:\s*false/.test(uxPw),
  "UX remains presentation owner; no UI behavior",
);

const registry = existsSync(join(aiDir, "integration/registration/registry.ts"))
  ? readFileSync(join(aiDir, "integration/registration/registry.ts"), "utf8")
  : "";
assertCase(
  "i7.registry",
  /AI_INTEGRATION_PATHWAY_COUNT\s*=\s*5/.test(registry) &&
    /introducesNewContract:\s*false/.test(registry),
  "5 pathways; no new contracts",
);

const compose = existsSync(join(aiDir, "integration/compose-integration.ts"))
  ? readFileSync(join(aiDir, "integration/compose-integration.ts"), "utf8")
  : "";
assertCase(
  "i7.compose",
  /runtimeCommunication:\s*false/.test(compose) &&
    /apiImplemented:\s*false/.test(compose) &&
    /aiOptionalPreserved:\s*true/.test(compose),
  "compose: no runtime/API; AI Optional preserved",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "i7.public.status",
  /AI_INTEGRATION_PHASE/.test(publicBarrel) && /AI_INTEGRATION_STATUS/.test(publicBarrel),
  "public barrel exports integration status markers",
);
assertCase(
  "i7.public.no.wiring",
  !/composeIntegration/.test(publicBarrel) &&
    !/from\s+["']\.\/integration["']/.test(publicBarrel),
  "public barrel must not export integration wiring",
);

for (const allowed of AI_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS) {
  assertCase(
    `i7.public.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected ${allowed}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "llm", re: /\b(OpenAI|Anthropic|createChatCompletion)\b/ },
  { id: "prompt", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "provider", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
  { id: "runtime-api", re: /\b(configureAi|getAiApi|fetch\s*\(|axios|http\.request)\b/ },
  { id: "execute", re: /\b(executeWorkflow|runInference)\b/ },
];

for (const file of collectTsFiles(join(aiDir, "integration"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    assertCase(`i7.no.${id}.${rel}`, !re.test(src), re.test(src) ? `forbidden ${id}` : "clean");
  }
  // Integration may import infrastructure boundaries only — not ENGINE/DATA/UX packages
  if (/from\s+["']@\/(engine|data|ui)/.test(src)) {
    assertCase(`i7.deps.${rel}`, false, "must not import ENGINE/DATA/UX packages");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-ai-integration: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-ai-integration: ${results.length} checks PASS`);
