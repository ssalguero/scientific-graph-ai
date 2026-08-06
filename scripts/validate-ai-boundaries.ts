/**
 * AI Domain boundary gate (AI-I0 / AI-I1).
 *
 * Authority: AI-P1 · AI-P8 · AI Optional · Golden Rule
 * Policy SSOT: src/ai/internal/boundary-policy.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  AI_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
  AI_FORBIDDEN_FOREIGN_INTERNAL_PREFIXES,
  isForbiddenAiConsumerImport,
  isForbiddenAiForeignInternalImport,
} from "../src/ai/internal/boundary-policy";

const repoRoot = process.cwd();
const srcDir = join(repoRoot, "src");
const aiDir = join(repoRoot, "src/ai");
const engineDir = join(repoRoot, "src/engine");
const dataDir = join(repoRoot, "src/data");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const toPosix = (p: string) => p.replace(/\\/g, "/");
const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

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

const extractFromSpecifiers = (code: string): string[] => {
  const specs: string[] = [];
  const re = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) specs.push(m[1]!);
  return specs;
};

const isUnder = (file: string, root: string) =>
  toPosix(file).startsWith(toPosix(root) + "/") || toPosix(file) === toPosix(root);

assertCase("ai.package.exists", existsSync(aiDir), existsSync(aiDir) ? "present" : "missing");
assertCase(
  "ai.boundary.policy.exists",
  existsSync(join(aiDir, "internal/boundary-policy.ts")),
  "boundary-policy SSOT",
);
assertCase(
  "ai.boundary.policy.prefixes",
  AI_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.length > 0 &&
    AI_FORBIDDEN_FOREIGN_INTERNAL_PREFIXES.length > 0,
  "policy prefixes loaded",
);

const allSrc = collectTsFiles(srcDir);
const outsideAi = allSrc.filter((f) => !isUnder(f, aiDir));
const aiFiles = allSrc.filter((f) => isUnder(f, aiDir));
const engineFiles = allSrc.filter((f) => isUnder(f, engineDir));
const dataFiles = allSrc.filter((f) => isUnder(f, dataDir));

for (const file of outsideAi) {
  const code = stripComments(readFileSync(file, "utf8"));
  const specs = extractFromSpecifiers(code);
  for (const spec of specs) {
    if (isForbiddenAiConsumerImport(spec)) {
      assertCase(
        `boundary.outside.no.ai.internal.${relFromRepo(file)}`,
        false,
        `imports ${spec}`,
      );
    }
  }
}

for (const file of aiFiles) {
  const code = stripComments(readFileSync(file, "utf8"));
  const specs = extractFromSpecifiers(code);
  for (const spec of specs) {
    if (isForbiddenAiForeignInternalImport(spec)) {
      assertCase(
        `boundary.ai.no.foreign.internal.${relFromRepo(file)}`,
        false,
        `imports ${spec}`,
      );
    }
  }
}

const checkNoAiDependency = (files: string[], domain: string) => {
  for (const file of files) {
    const code = stripComments(readFileSync(file, "utf8"));
    const specs = extractFromSpecifiers(code);
    for (const spec of specs) {
      if (spec === "@/ai" || spec.startsWith("@/ai/") || spec.includes("/src/ai/")) {
        assertCase(
          `ai.optional.${domain}.${relFromRepo(file)}`,
          false,
          `${domain} must not depend on AI (found ${spec})`,
        );
      }
    }
  }
};

checkNoAiDependency(engineFiles, "engine");
checkNoAiDependency(dataFiles, "data");

const failedExplicit = results.filter((r) => !r.pass);
if (failedExplicit.length === 0) {
  assertCase("boundary.outside.clean", true, "no outside imports of AI internals");
  assertCase("boundary.ai.clean", true, "AI does not import ENGINE/DATA internals");
  assertCase("ai.optional.engine", true, "ENGINE does not depend on @/ai");
  assertCase("ai.optional.data", true, "DATA does not depend on @/ai");
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-ai-boundaries: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-ai-boundaries: ${results.length} checks PASS`);
