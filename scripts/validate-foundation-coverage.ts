/**
 * D64.6 — Production Stabilization · Foundation Coverage.
 *
 * Reads docs/D64.0-foundation-manifest.md as SSOT and verifies every foundation
 * domain has (1) a certified path on disk and (2) an official gate npm script
 * registered and reachable from validate:d64-gate.
 *
 * Authority: docs/D64.0-foundation-manifest.md
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getRepoRoot } from "./lib/methodology-gate-utils";

const repoRoot = getRepoRoot(import.meta.url);

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const MANIFEST_REL = "docs/D64.0-foundation-manifest.md";

/** Domain → certified foundation path(s) from D64.0 baseline. */
const DOMAIN_PATHS: Record<string, string[]> = {
  UI: ["src/components/ui", "src/lib/ui"],
  Workspace: ["src/components/workspace"],
  Toolbar: ["src/components/toolbar"],
  Inspector: ["src/components/inspector"],
  Docking: ["src/components/docking"],
  "Layout Engine": ["src/components/layout-engine"],
  Windows: ["src/components/windows"],
  Series: ["src/components/windows/series"],
  Tabs: ["src/components/windows/tabs"],
  Content: ["src/components/windows/content"],
};

/**
 * Official gates that validate:d64-gate must chain (D64.6 composition).
 * Domain validators from the manifest must be members of this set.
 */
const D64_GATE_REACHABLE = new Set([
  "validate:v11-d52-gate",
  "validate:d53-gate",
  "validate:d54-gate",
  "validate:d60-gate",
  "validate:d63-gate",
  "validate:production-boundaries",
  "validate:registry-integrity",
  "validate:api-freeze",
  "validate:foundation-coverage",
]);

const REQUIRED_DOMAINS = [
  "UI",
  "Workspace",
  "Toolbar",
  "Inspector",
  "Docking",
  "Layout Engine",
  "Windows",
  "Series",
  "Tabs",
  "Content",
] as const;

type ManifestRow = {
  domain: string;
  status: string;
  validator: string;
};

const parseManifest = (source: string): ManifestRow[] => {
  const rows: ManifestRow[] = [];
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(
      /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*`?(validate:[^`|]+?)`?\s*\|$/
    );
    if (!match) continue;
    const domain = match[1].trim();
    if (domain === "Domain" || domain.startsWith("---")) continue;
    rows.push({
      domain,
      status: match[2].trim(),
      validator: match[3].trim().replace(/`/g, ""),
    });
  }
  return rows;
};

const manifestPath = join(repoRoot, MANIFEST_REL);
assertCase(
  "coverage.manifest.exists",
  existsSync(manifestPath),
  MANIFEST_REL
);

const manifestSource = existsSync(manifestPath)
  ? readFileSync(manifestPath, "utf8")
  : "";
const rows = parseManifest(manifestSource);

assertCase(
  "coverage.manifest.parsed",
  rows.length >= REQUIRED_DOMAINS.length,
  `rows=${rows.length}`
);

const packageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8")
) as { scripts?: Record<string, string> };
const npmScripts = packageJson.scripts ?? {};

const byDomain = new Map(rows.map((r) => [r.domain, r]));

for (const domain of REQUIRED_DOMAINS) {
  const row = byDomain.get(domain);
  assertCase(
    `coverage.domain.present.${domain.replace(/\s+/g, "_")}`,
    row !== undefined,
    row ? "in manifest" : "MISSING from manifest"
  );

  if (!row) continue;

  assertCase(
    `coverage.domain.status.${domain.replace(/\s+/g, "_")}`,
    /certified/i.test(row.status),
    `status=${row.status}`
  );

  const paths = DOMAIN_PATHS[domain] ?? [];
  assertCase(
    `coverage.domain.pathsMapped.${domain.replace(/\s+/g, "_")}`,
    paths.length > 0,
    paths.join(", ") || "no path mapping"
  );

  for (const rel of paths) {
    assertCase(
      `coverage.domain.pathExists.${domain.replace(/\s+/g, "_")}.${rel.replace(/\//g, ".")}`,
      existsSync(join(repoRoot, rel)),
      rel
    );
  }

  assertCase(
    `coverage.domain.validatorRegistered.${domain.replace(/\s+/g, "_")}`,
    Object.prototype.hasOwnProperty.call(npmScripts, row.validator),
    row.validator
  );

  assertCase(
    `coverage.domain.validatorReachableFromD64Gate.${domain.replace(/\s+/g, "_")}`,
    D64_GATE_REACHABLE.has(row.validator),
    `${row.validator} must be chained by validate:d64-gate`
  );
}

// Fail if manifest has domains without path mapping (orphan / incomplete coverage)
for (const row of rows) {
  assertCase(
    `coverage.manifest.domainMapped.${row.domain.replace(/\s+/g, "_")}`,
    DOMAIN_PATHS[row.domain] !== undefined,
    DOMAIN_PATHS[row.domain]
      ? "mapped"
      : "manifest domain lacks DOMAIN_PATHS entry"
  );
}

// Every required domain covered exactly once in rollup
assertCase(
  "coverage.requiredDomains.complete",
  REQUIRED_DOMAINS.every((d) => byDomain.has(d)),
  `required=${REQUIRED_DOMAINS.length}, found=${REQUIRED_DOMAINS.filter((d) => byDomain.has(d)).length}`
);

const pass = results.every((r) => r.pass);
const failed = results.filter((r) => !r.pass);

console.log(
  JSON.stringify(
    {
      phase: "foundation-coverage",
      authority: MANIFEST_REL,
      pass,
      total: results.length,
      passed: results.filter((r) => r.pass).length,
      failed: failed.length,
      failedIds: failed.map((r) => r.id),
      domains: rows.map((r) => ({
        domain: r.domain,
        status: r.status,
        validator: r.validator,
      })),
      results,
    },
    null,
    2
  )
);
console.log(
  pass
    ? "\nPASS — foundation-coverage"
    : `\nFAIL — foundation-coverage (${failed.length} cases)`
);
process.exit(pass ? 0 : 1);
