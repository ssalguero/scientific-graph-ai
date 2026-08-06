/**
 * AI-I5 — Supporting Components readiness gate.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS,
  AI_SUPPORTING_REQUIRED_DIRS,
  AI_SUPPORTING_REQUIRED_FILES,
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

for (const rel of AI_SUPPORTING_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`i5.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

for (const rel of AI_SUPPORTING_REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`i5.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "i5.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I5-Supporting-Components.md")),
  "AI-I5 implementation record",
);

const registry = existsSync(join(aiDir, "supporting/registration/registry.ts"))
  ? readFileSync(join(aiDir, "supporting/registration/registry.ts"), "utf8")
  : "";
assertCase(
  "i5.registry.count",
  /AI_SUPPORTING_COMPONENT_COUNT\s*=\s*3/.test(registry),
  "3 supporting components registered",
);

const conf = existsSync(join(aiDir, "supporting/assumption-confidence/identity.ts"))
  ? readFileSync(join(aiDir, "supporting/assumption-confidence/identity.ts"), "utf8")
  : "";
assertCase(
  "i5.no.certification",
  /AI_ASSUMPTION_CONFIDENCE_IS_CERTIFICATION\s*=\s*false/.test(conf),
  "Assumption/confidence is not scientific certification",
);

const compose = existsSync(join(aiDir, "supporting/compose-supporting.ts"))
  ? readFileSync(join(aiDir, "supporting/compose-supporting.ts"), "utf8")
  : "";
assertCase(
  "i5.compose.inactive",
  /runtimeIntelligence:\s*false/.test(compose) && /scoringEngine:\s*false/.test(compose),
  "compose declares no runtime / scoring",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "i5.public.status",
  /AI_SUPPORTING_PHASE/.test(publicBarrel) && /AI_SUPPORTING_STATUS/.test(publicBarrel),
  "public barrel exports supporting status markers",
);
assertCase(
  "i5.public.no.wiring",
  !/composeSupporting/.test(publicBarrel) &&
    !/from\s+["']\.\/supporting["']/.test(publicBarrel),
  "public barrel must not export supporting wiring",
);

for (const allowed of AI_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS) {
  assertCase(
    `i5.public.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected ${allowed}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "llm", re: /\b(OpenAI|Anthropic|createChatCompletion)\b/ },
  { id: "prompt", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "provider", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
  { id: "runtime-api", re: /\b(configureAi|getAiApi|createAssistant|runInference)\b/ },
  { id: "fetch", re: /\bfetch\s*\(/ },
];

for (const file of collectTsFiles(join(aiDir, "supporting"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    assertCase(`i5.no.${id}.${rel}`, !re.test(src), re.test(src) ? `forbidden ${id}` : "clean");
  }
  if (/from\s+["']@\/(engine|ui|data)/.test(src)) {
    assertCase(`i5.deps.${rel}`, false, "must not import ENGINE/UX/DATA");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-ai-supporting: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-ai-supporting: ${results.length} checks PASS`);
