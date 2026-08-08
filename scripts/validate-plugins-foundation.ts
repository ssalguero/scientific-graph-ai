/**
 * PLUGINS-I0 — Foundation package readiness gate.
 *
 * Authority: PLUGINS-P6 · PLUGINS-P11 · docs/PLUGINS/implementation/PLUGINS-I0-Foundation.md
 *
 * Checks package layout, barrel, planning records, and absence of forbidden
 * plugin runtime patterns in the PLUGINS package.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const pluginsDir = join(repoRoot, "src/plugins");

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
  "src/plugins",
  "src/plugins/foundation",
  "src/plugins/types",
  "src/plugins/abstractions",
  "src/plugins/public",
  "src/plugins/internal",
  "src/plugins/framework",
  "src/plugins/registry",
  "src/plugins/discovery",
  "src/plugins/registration",
  "src/plugins/admission",
  "src/plugins/capabilities",
  "src/plugins/permissions",
  "src/plugins/capability",
  "src/plugins/contracts",
  "src/plugins/lifecycle",
  "src/plugins/compatibility",
  "src/plugins/validation",
  "src/plugins/diagnostics",
  "src/plugins/observability",
  "src/plugins/integration",
  "src/plugins/certification",
  "src/plugins/sdk",
  "docs/PLUGINS/implementation",
  "docs/PLUGINS/official-records",
];

const REQUIRED_FILES = [
  "src/plugins/index.ts",
  "src/plugins/README.md",
  "src/plugins/ARCHITECTURE.md",
  "src/plugins/foundation/index.ts",
  "src/plugins/foundation/identity.ts",
  "src/plugins/types/index.ts",
  "src/plugins/types/vocabulary.ts",
  "src/plugins/abstractions/index.ts",
  "src/plugins/public/index.ts",
  "src/plugins/internal/index.ts",
  "src/plugins/internal/boundary-policy.ts",
  "docs/PLUGINS/implementation/README.md",
  "docs/PLUGINS/implementation/PLUGINS-I0-Foundation.md",
];

const REQUIRED_OFFICIAL_RECORDS = [
  "PLUGINS-P0-Executive-Planning-Foundation.md",
  "PLUGINS-P1-Domain-Architecture.md",
  "PLUGINS-P2-Functional-Model.md",
  "PLUGINS-P3-Component-Inventory.md",
  "PLUGINS-P4-Public-Contracts.md",
  "PLUGINS-P5-Lifecycle.md",
  "PLUGINS-P6-Implementation-Roadmap.md",
  "PLUGINS-P7-Governance.md",
  "PLUGINS-P8-Validation.md",
  "PLUGINS-P9-Implementation-Planning.md",
  "PLUGINS-P10-Hardening.md",
  "PLUGINS-P11-Planning-Certification.md",
];

/** Tokens that indicate forbidden PLUGINS-I0 runtime / loader behavior. */
const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "dynamic-import-loader", re: /\bimport\s*\(\s*[^)]+\s*\)/ },
  { id: "plugin-loader", re: /\b(loadPlugin|PluginLoader|requirePlugin)\b/ },
  { id: "marketplace", re: /\b(PluginMarketplace|installFromMarketplace)\b/ },
  { id: "remote-execution", re: /\b(remoteExecute|RemotePluginHost)\b/ },
  { id: "register-runtime", re: /\b(registerPlugin\s*\(|activatePlugin\s*\()\b/ },
  { id: "sdk-runtime", re: /\b(createPluginSdk|PluginSdkRuntime)\b/ },
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

assertCase(
  "planning.charter",
  existsSync(join(repoRoot, "docs/PLUGINS/PLUGINS-Planning-Charter.md")),
  "PLUGINS Planning Charter must be present",
);

for (const name of REQUIRED_OFFICIAL_RECORDS) {
  const rel = `docs/PLUGINS/official-records/${name}`;
  assertCase(
    `planning.record.${name}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

const barrel = existsSync(join(pluginsDir, "index.ts"))
  ? readFileSync(join(pluginsDir, "index.ts"), "utf8")
  : "";
assertCase(
  "barrel.exports.foundation",
  /PLUGINS_FOUNDATION_STATUS/.test(barrel) && /PLUGINS_DOMAIN_MOTTO/.test(barrel),
  "public barrel must export foundation identity symbols",
);
assertCase(
  "barrel.no.runtime.api",
  !/\b(configurePlugins|getPluginsApi|loadPlugin|registerPlugin|activatePlugin)\b/.test(
    barrel,
  ),
  "public barrel must not expose runtime plugin APIs in PLUGINS-I0",
);

const identitySrc = existsSync(join(pluginsDir, "foundation/identity.ts"))
  ? readFileSync(join(pluginsDir, "foundation/identity.ts"), "utf8")
  : "";
assertCase(
  "identity.naming",
  identitySrc.includes("Extensibility Layer") &&
    identitySrc.includes("Platform Extensibility"),
  "foundation identity must preserve PLUGINS-P0 / P1 naming",
);
assertCase(
  "identity.motto",
  identitySrc.includes(
    "Extend the platform without compromising its architecture.",
  ),
  "foundation identity must preserve Domain Motto",
);

const tsFiles = collectTsFiles(pluginsDir);
for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN_SOURCE_PATTERNS) {
    const hit = re.test(src);
    assertCase(
      `no.runtime.${id}.${rel}`,
      !hit,
      hit ? `forbidden pattern ${re} in ${rel}` : "clean",
    );
  }
}

assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 180,
  `PLUGINS package should remain early I-series skeleton (found ${tsFiles.length} .ts files)`,
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-plugins-foundation: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-plugins-foundation: ${results.length} checks PASS`);
