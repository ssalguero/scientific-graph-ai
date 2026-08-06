/**
 * AI-I0 — Foundation package readiness gate.
 *
 * Authority: AI-P6 · AI-P11 · docs/AI/implementation/AI-I0-Foundation.md
 *
 * Checks package layout, barrel, planning records, and absence of forbidden
 * intelligence/runtime patterns in the AI package.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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

const REQUIRED_DIRS = [
  "src/ai",
  "src/ai/foundation",
  "src/ai/public",
  "src/ai/internal",
  "src/ai/identity",
  "src/ai/core",
  "src/ai/supporting",
  "src/ai/governance",
  "src/ai/extension",
  "src/ai/infrastructure",
  "docs/AI/implementation",
  "docs/AI/official-records",
];

const REQUIRED_FILES = [
  "src/ai/index.ts",
  "src/ai/README.md",
  "src/ai/ARCHITECTURE.md",
  "src/ai/foundation/index.ts",
  "src/ai/foundation/identity.ts",
  "src/ai/public/index.ts",
  "src/ai/internal/index.ts",
  "docs/AI/implementation/README.md",
  "docs/AI/implementation/AI-I0-Foundation.md",
];

const REQUIRED_OFFICIAL_RECORDS = [
  "AI-P0-Vision-and-Scope.md",
  "AI-P1-Domain-Architecture.md",
  "AI-P2-Domain-Definition.md",
  "AI-P3-Component-Inventory.md",
  "AI-P4-Contract-Strategy.md",
  "AI-P5-Lifecycle.md",
  "AI-P6-Master-Implementation-Roadmap.md",
  "AI-P7-Execution-Governance.md",
  "AI-P8-Validation-Strategy.md",
  "AI-P9-Implementation-Strategy.md",
  "AI-P10-Hardening-Strategy.md",
  "AI-P11-Planning-Certification.md",
];

/** Tokens that indicate forbidden AI-I0 capability / runtime intelligence. */
const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "llm-client", re: /\b(OpenAI|Anthropic|createChatCompletion|chat\.completions)\b/ },
  { id: "prompt-engine", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "streaming", re: /\b(ReadableStream|SSE|tokenStream)\b/ },
  { id: "tool-calling", re: /\b(toolCall|functionCalling|ToolExecutor)\b/ },
  { id: "session-runtime", re: /\b(AssistantSession|ConversationMemory)\b/ },
  { id: "provider-runtime", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
];

for (const rel of REQUIRED_DIRS) {
  assertCase(
    `layout.dir.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const rel of REQUIRED_FILES) {
  assertCase(
    `layout.file.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const name of REQUIRED_OFFICIAL_RECORDS) {
  const rel = `docs/AI/official-records/${name}`;
  assertCase(
    `planning.record.${name}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

const barrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "barrel.exports.foundation",
  /AI_FOUNDATION_STATUS/.test(barrel) && /AI_DOMAIN_MOTTO/.test(barrel),
  "public barrel must export foundation identity symbols",
);
assertCase(
  "barrel.no.runtime.api",
  !/\b(configureAi|getAiApi|createAssistant|runInference)\b/.test(barrel),
  "public barrel must not expose runtime AI APIs in AI-I0",
);

const identitySrc = existsSync(join(aiDir, "foundation/identity.ts"))
  ? readFileSync(join(aiDir, "foundation/identity.ts"), "utf8")
  : "";
assertCase(
  "identity.dual.naming",
  identitySrc.includes("Scientific Assistant Platform") &&
    identitySrc.includes("Intelligence Domain"),
  "foundation identity must preserve AI-P0 dual naming",
);
assertCase(
  "identity.motto",
  identitySrc.includes("Amplify scientific reasoning without replacing scientific judgment."),
  "foundation identity must preserve Domain Motto",
);

const tsFiles = collectTsFiles(aiDir);
for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN_SOURCE_PATTERNS) {
    const hit = re.test(src);
    assertCase(
      `no.intelligence.${id}.${rel}`,
      !hit,
      hit ? `forbidden pattern ${re} in ${rel}` : "clean",
    );
  }
}

assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 180,
  `AI package should remain I0–I8 skeleton only (found ${tsFiles.length} .ts files)`,
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-ai-foundation: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-ai-foundation: ${results.length} checks PASS`);
