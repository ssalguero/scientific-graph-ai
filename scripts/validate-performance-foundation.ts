/**
 * PERFORMANCE-I0 — Foundation package readiness gate.
 *
 * Authority: PERFORMANCE-P6 · PERFORMANCE-P9 · PERFORMANCE-P11 ·
 * docs/PERFORMANCE/implementation/PERFORMANCE-I0-Foundation.md
 *
 * Checks package layout, barrel, planning records, identity freeze,
 * absence of measurement/runtime/peer-seam patterns, and no peer coupling.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();
const performanceDir = join(repoRoot, "src/performance");

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
  "src/performance",
  "src/performance/foundation",
  "src/performance/public",
  "src/performance/internal",
  "docs/PERFORMANCE/implementation",
  "docs/PERFORMANCE/official-records",
];

const REQUIRED_FILES = [
  "src/performance/index.ts",
  "src/performance/README.md",
  "src/performance/ARCHITECTURE.md",
  "src/performance/foundation/index.ts",
  "src/performance/foundation/identity.ts",
  "src/performance/public/index.ts",
  "src/performance/internal/index.ts",
  "src/performance/internal/boundary-policy.ts",
  "docs/PERFORMANCE/implementation/README.md",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I0-Foundation.md",
];

const REQUIRED_OFFICIAL_RECORDS = [
  "PERFORMANCE-P0-Identity-Boundary-Freeze.md",
  "PERFORMANCE-P1-Measurement-and-Optimization-Architecture.md",
  "PERFORMANCE-P2-Functional-Model.md",
  "PERFORMANCE-P3-Component-Inventory.md",
  "PERFORMANCE-P4-Public-Contracts-and-Peer-Seam-Matrix.md",
  "PERFORMANCE-P5-Lifecycle.md",
  "PERFORMANCE-P6-Master-Implementation-Roadmap.md",
  "PERFORMANCE-P7-Execution-Governance.md",
  "PERFORMANCE-P8-Validation-Strategy.md",
  "PERFORMANCE-P9-Implementation-Strategy.md",
  "PERFORMANCE-P10-Hardening-Strategy.md",
  "PERFORMANCE-P11-Planning-Certification.md",
];

const PEER_SRC_ROOTS = [
  "src/engine",
  "src/data",
  "src/ai",
  "src/ui",
  "src/plugins",
];

/** Tokens that indicate forbidden optimization / CI beyond I4. */
const FORBIDDEN_SOURCE_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "optimizer", re: /\b(autoOptimize|OptimizationEngine|AdaptiveTuner)\b/ },
  { id: "ci-gate", re: /\b(PerformanceCiGate|registerPerformanceGate)\b/ },
];

const PEER_IMPORT_RE =
  /from\s+["']@\/(engine|data|ai|ui|plugins|collab|components|app)(\/|["'])/;

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
  existsSync(join(repoRoot, "docs/PERFORMANCE/PERFORMANCE-Planning-Charter.md")),
  "PERFORMANCE Planning Charter must exist",
);

for (const name of REQUIRED_OFFICIAL_RECORDS) {
  const rel = `docs/PERFORMANCE/official-records/${name}`;
  assertCase(
    `planning.record.${name}`,
    existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "present" : "missing",
  );
}

const barrel = existsSync(join(performanceDir, "index.ts"))
  ? readFileSync(join(performanceDir, "index.ts"), "utf8")
  : "";
assertCase(
  "barrel.exports.foundation",
  /PERFORMANCE_FOUNDATION_STATUS/.test(barrel) &&
    /PERFORMANCE_DOMAIN_MOTTO/.test(barrel) &&
    /PERFORMANCE_OWNERSHIP_PRINCIPLE/.test(barrel),
  "public barrel must export foundation identity symbols",
);
assertCase(
  "barrel.no.runtime.api",
  !/\b(createCollector|measure|optimize|registerBudget|runWorkload)\b/.test(barrel),
  "public barrel must not expose runtime PERFORMANCE APIs in I0",
);

const identitySrc = existsSync(join(performanceDir, "foundation/identity.ts"))
  ? readFileSync(join(performanceDir, "foundation/identity.ts"), "utf8")
  : "";
assertCase(
  "identity.optimization.layer",
  identitySrc.includes("Optimization Layer"),
  "foundation identity must preserve Optimization Layer naming",
);
assertCase(
  "identity.motto",
  identitySrc.includes("Optimize without owning."),
  "foundation identity must preserve Domain Motto",
);
assertCase(
  "identity.ownership.principle",
  identitySrc.includes("Peers Own. PERFORMANCE Observes and Optimizes."),
  "foundation identity must preserve ownership principle",
);

const tsFiles = collectTsFiles(performanceDir);
assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 90,
  `PERFORMANCE package remains bounded through I9 (found ${tsFiles.length} .ts files)`,
);

for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  for (const { id, re } of FORBIDDEN_SOURCE_PATTERNS) {
    const hit = re.test(src);
    assertCase(
      `no.forbidden.${id}.${rel}`,
      !hit,
      hit ? `forbidden pattern ${re} in ${rel}` : "clean",
    );
  }
  const inInstrumentation = rel.includes("/instrumentation/");
  const peerHit = PEER_IMPORT_RE.test(src);
  if (inInstrumentation) {
    assertCase(
      `peer.import.deferred.${rel}`,
      true,
      "I2 instrumentation peer imports validated separately",
    );
  } else {
    assertCase(
      `no.peer.import.${rel}`,
      !peerHit,
      peerHit ? "peer import forbidden outside instrumentation" : "clean",
    );
  }
}

/** I4 authorizes workloads/; later phases remain forbidden here. */
const forbiddenFutureDirs = [
  "src/performance/collectors",
  "src/performance/adapters",
  "src/performance/baselines",
  "src/performance/optimization",
  "src/performance/validation",
  "src/performance/certification",
  "src/performance/benchmarks",
];
for (const rel of forbiddenFutureDirs) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "must not exist in I0" : "absent",
  );
}

for (const peer of PEER_SRC_ROOTS) {
  assertCase(
    `peer.root.exists.${peer}`,
    existsSync(join(repoRoot, peer)),
    "peer package root must remain present (unmodified by this gate)",
  );
}

assertCase(
  "no.collab.src",
  !existsSync(join(repoRoot, "src/collab")),
  "I0 must not create src/collab",
);

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-performance-foundation: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-performance-foundation: ${results.length} checks PASS`);
