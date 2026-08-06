/**
 * AI-I9 — Domain Hardening consistency gate.
 *
 * Verifies planning/implementation traceability, registry counts,
 * public barrel consistency, documentation presence, and certification readiness.
 * No new capabilities. No runtime intelligence.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_ALLOWED_PUBLIC_CORE_REEXPORTS,
  AI_ALLOWED_PUBLIC_EXTENSION_REEXPORTS,
  AI_ALLOWED_PUBLIC_GOVERNANCE_REEXPORTS,
  AI_ALLOWED_PUBLIC_HARDENING_REEXPORTS,
  AI_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS,
  AI_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS,
  AI_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS,
} from "../src/ai/internal/boundary-policy";
import { AI_QUALITY_GATES, AI_QUALITY_GATE_COUNT } from "../src/ai/hardening/quality-gates";

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

const IMPLEMENTATION_RECORDS = [
  "AI-I0-Foundation.md",
  "AI-I1-Infrastructure.md",
  "AI-I2-Core-Intelligence.md",
  "AI-I3-Contextual-Assistance.md",
  "AI-I4-Analytical-Interpretation-Workflow-Guidance.md",
  "AI-I5-Supporting-Components.md",
  "AI-I6-Governance-Components.md",
  "AI-I7-Cross-Domain-Integration.md",
  "AI-I8-Extension-Infrastructure.md",
  "AI-I9-Domain-Hardening.md",
];

const OFFICIAL_RECORDS = [
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

const HARDENING_DOCS = [
  "src/ai/hardening/QUALITY_GATES.md",
  "src/ai/hardening/EVIDENCE_PACKAGE.md",
  "src/ai/hardening/TRACEABILITY.md",
  "src/ai/hardening/CERTIFICATION_READINESS.md",
  "src/ai/hardening/README.md",
  "src/ai/hardening/status.ts",
  "src/ai/hardening/quality-gates.ts",
  "src/ai/hardening/index.ts",
];

const PUBLIC_STATUS_MARKERS = [
  "AI_FOUNDATION_STATUS",
  "AI_INFRASTRUCTURE_STATUS",
  "AI_CORE_STATUS",
  "AI_CONTEXTUAL_ASSISTANCE_STATUS",
  "AI_CORE_CAPABILITIES_STATUS",
  "AI_SUPPORTING_STATUS",
  "AI_GOVERNANCE_STATUS",
  "AI_INTEGRATION_STATUS",
  "AI_EXTENSION_STATUS",
  "AI_HARDENING_STATUS",
];

for (const name of IMPLEMENTATION_RECORDS) {
  const rel = `docs/AI/implementation/${name}`;
  assertCase(
    `i9.impl.${name}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const name of OFFICIAL_RECORDS) {
  const rel = `docs/AI/official-records/${name}`;
  assertCase(
    `i9.planning.${name}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

for (const rel of HARDENING_DOCS) {
  assertCase(
    `i9.hardening.${rel}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

assertCase(
  "i9.gates.count",
  AI_QUALITY_GATE_COUNT === 11,
  `expected 11 quality gates (found ${AI_QUALITY_GATE_COUNT})`,
);

assertCase(
  "i9.gates.scripts",
  AI_QUALITY_GATES.every((g) => g.npmScript.startsWith("validate:ai")),
  "all gates map to validate:ai-* scripts",
);

const publicBarrel = existsSync(join(aiDir, "index.ts"))
  ? readFileSync(join(aiDir, "index.ts"), "utf8")
  : "";

for (const marker of PUBLIC_STATUS_MARKERS) {
  assertCase(
    `i9.barrel.${marker}`,
    publicBarrel.includes(marker),
    publicBarrel.includes(marker) ? "exported" : "missing from public barrel",
  );
}

assertCase(
  "i9.barrel.no.wiring",
  !/composeAiCore|composeGovernance|composeIntegration|composeExtension|composeSupporting|composeContextual/.test(
    publicBarrel,
  ),
  "public barrel must not export compose/wiring",
);

const allowedReexports = [
  ...AI_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_CORE_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_GOVERNANCE_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_INTEGRATION_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_EXTENSION_REEXPORTS,
  ...AI_ALLOWED_PUBLIC_HARDENING_REEXPORTS,
];

for (const allowed of allowedReexports) {
  assertCase(
    `i9.barrel.allowed.${allowed}`,
    publicBarrel.includes(allowed),
    `expected allowlisted status re-export ${allowed}`,
  );
}

const registryChecks: { id: string; file: string; re: RegExp }[] = [
  {
    id: "core",
    file: "core/capability-registry/registry.ts",
    re: /AI_CORE_CAPABILITY_COUNT\s*=\s*7/,
  },
  {
    id: "supporting",
    file: "supporting/registration/registry.ts",
    re: /AI_SUPPORTING_COMPONENT_COUNT\s*=\s*3/,
  },
  {
    id: "governance",
    file: "governance/registration/registry.ts",
    re: /AI_GOVERNANCE_COMPONENT_COUNT\s*=\s*3/,
  },
  {
    id: "extension",
    file: "extension/registration/registry.ts",
    re: /AI_EXTENSION_SLOT_COUNT\s*=\s*3/,
  },
  {
    id: "integration",
    file: "integration/registration/registry.ts",
    re: /AI_INTEGRATION_PATHWAY_COUNT\s*=\s*5/,
  },
];

for (const { id, file, re } of registryChecks) {
  const src = existsSync(join(aiDir, file)) ? readFileSync(join(aiDir, file), "utf8") : "";
  assertCase(`i9.registry.${id}`, re.test(src), re.test(src) ? "count ok" : `mismatch in ${file}`);
}

const arch = existsSync(join(aiDir, "ARCHITECTURE.md"))
  ? readFileSync(join(aiDir, "ARCHITECTURE.md"), "utf8")
  : "";
assertCase(
  "i9.arch.mentions.hardening",
  /AI-I9|Hardening/.test(arch),
  "ARCHITECTURE documents hardening / AI-I9",
);

const readiness = existsSync(join(aiDir, "hardening/CERTIFICATION_READINESS.md"))
  ? readFileSync(join(aiDir, "hardening/CERTIFICATION_READINESS.md"), "utf8")
  : "";
assertCase(
  "i9.cert.ready",
  /Ready for AI-I10/.test(readiness) && /\*\*YES\*\*/.test(readiness),
  "certification readiness declares YES for AI-I10",
);

const hardeningStatus = existsSync(join(aiDir, "hardening/status.ts"))
  ? readFileSync(join(aiDir, "hardening/status.ts"), "utf8")
  : "";
assertCase(
  "i9.cert.flag",
  /AI_CERTIFICATION_READY\s*=\s*true/.test(hardeningStatus),
  "AI_CERTIFICATION_READY is true",
);

const FORBIDDEN: { id: string; re: RegExp }[] = [
  { id: "llm", re: /\b(OpenAI|Anthropic|createChatCompletion)\b/ },
  { id: "prompt", re: /\b(PromptTemplate|systemPrompt|buildPrompt)\b/ },
  { id: "provider", re: /\b(LlmProvider|ModelProvider|InferenceClient)\b/ },
  { id: "runtime-api", re: /\b(configureAi|getAiApi|createAssistant|runInference)\b/ },
];

for (const file of collectTsFiles(join(aiDir, "hardening"))) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN) {
    assertCase(`i9.no.${id}.${rel}`, !re.test(src), re.test(src) ? `forbidden ${id}` : "clean");
  }
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}
if (failed.length > 0) {
  console.error(`\nvalidate-ai-hardening: ${failed.length} failure(s)`);
  process.exit(1);
}
console.log(`\nvalidate-ai-hardening: ${results.length} checks PASS`);
