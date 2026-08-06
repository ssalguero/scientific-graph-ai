/**
 * AI-I6 — Governance Components readiness gate.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_GOVERNANCE_REEXPORTS,
  AI_GOVERNANCE_REQUIRED_DIRS,
  AI_GOVERNANCE_REQUIRED_FILES,
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

for (const rel of AI_GOVERNANCE_REQUIRED_DIRS) {
  const full = join(aiDir, rel);
  assertCase(`i6.dir.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

for (const rel of AI_GOVERNANCE_REQUIRED_FILES) {
  const full = join(aiDir, rel);
  assertCase(`i6.file.${rel}`, existsSync(full), existsSync(full) ? "present" : "missing");
}

assertCase(
  "i6.doc",
  existsSync(join(repoRoot, "docs/AI/implementation/AI-I6-Governance-Components.md")),
  "AI-I6 implementation record",
);

const registry = existsSync(join(aiDir, "governance/registration/registry.ts"))
  ? readFileSync(join(aiDir, "governance/registration/registry.ts"), "utf8")
  : "";
assertCase(
  "i6.registry.count",
  /AI_GOVERNANCE_COMPONENT_COUNT\s*=\s*3/.test(registry) &&
    /AI_CAPABILITY_GOVERNANCE_ID/.test(registry) &&
    /AI_NON_AUTHORITATIVE_GUARD_ID/.test(registry) &&
    /AI_OPTIONALITY_PRESERVATION_ID/.test(registry),
  "3 governance components registered",
);

const guard = existsSync(join(aiDir, "governance/non-authoritative-guard/identity.ts"))
  ? readFileSync(join(aiDir, "governance/non-authoritative-guard/identity.ts"), "utf8")
  : "";
assertCase(
  "i6.decision.authority",
  /AI_DECISION_AUTHORITY_PRESERVED\s*=\s*true/.test(guard) &&
    /AI_GUARD_VALIDATES_SCIENTIFIC_TRUTH\s*=\s*false/.test(guard) &&
    /AI_GUARD_EXECUTES_WORKFLOWS\s*=\s*false/.test(guard),
  "Decision Authority preserved; no truth validation / workflow execution",
);

const opt = existsSync(join(aiDir, "governance/optionality-preservation/identity.ts"))
  ? readFileSync(join(aiDir, "governance/optionality-preservation/identity.ts"), "utf8")
  : "";
assertCase(
  "i6.ai.optional",
  /AI_OPTIONAL_PRESERVED\s*=\s*true/.test(opt) &&
    /AI_MANDATORY_FOR_SCIENTIFIC_CORRECTNESS\s*=\s*false/.test(opt),
  "AI Optional preserved; not mandatory for scientific correctness",
);

const compose = existsSync(join(aiDir, "governance/compose-governance.ts"))
  ? readFileSync(join(aiDir, "governance/compose-governance.ts"), "utf8")
  : "";
assertCase(
  "i6.compose.inactive",
  /runtimeGovernance:\s*false/.test(compose) &&
    /policyEngine:\s*false/.test(compose) &&
    /permissionSystem:\s*false/.test(compose),
  "compose declares no runtime governance / policy / permissions",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";
assertCase(
  "i6.public.status",
  /AI_GOVERNANCE_PHASE/.test(publicBarrel) && /AI_GOVERNANCE_STATUS/.test(publicBarrel),
  "public barrel exports governance status markers",
);
assertCase(
  "i6.public.no.wiring",
  !/composeGovernance/.test(publicBarrel) &&
    !/from\s+["']\.\/governance["']/.test(publicBarrel),
  "public barrel must not export governance wiring",
);

for (const allowed of AI_ALLOWED_PUBLIC_GOVERNANCE_REEXPORTS) {
  assertCase(
    `i6.public.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected ${allowed}`,
  );
}

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "llm", re: /\b(OpenAI|Anthropic|createChatCompletion)\b/ },
  { id: "prompt", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "provider", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
  { id: "policy-engine", re: /\b(evaluatePolicy|PermissionEngine|AuthorizationEngine)\b/ },
  { id: "runtime-api", re: /\b(configureAi|getAiApi|createAssistant|runInference)\b/ },
  { id: "fetch", re: /\bfetch\s*\(/ },
];

for (const file of collectTsFiles(join(aiDir, "governance"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    assertCase(`i6.no.${id}.${rel}`, !re.test(src), re.test(src) ? `forbidden ${id}` : "clean");
  }
  if (/from\s+["']@\/(engine|ui|data)/.test(src)) {
    assertCase(`i6.deps.${rel}`, false, "must not import ENGINE/UX/DATA");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-ai-governance: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-ai-governance: ${results.length} checks PASS`);
