/**
 * PERFORMANCE-I9 — Boundary integrity gate.
 *
 * Enforces consumer public-only `@/performance` imports and PERFORMANCE
 * peer-import discipline (I2 instrumentation allowlist).
 * Policy SSOT: src/performance/internal/boundary-policy.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
  isAllowedPerformanceI2PeerImport,
  isForbiddenPerformanceConsumerImport,
  isForbiddenPerformancePeerImport,
} from "../src/performance/internal/boundary-policy";

const repoRoot = process.cwd();
const srcDir = join(repoRoot, "src");
const performanceDir = join(repoRoot, "src/performance");

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
  toPosix(file).startsWith(`${toPosix(root)}/`) || toPosix(file) === toPosix(root);

assertCase(
  "policy.exists",
  existsSync(join(performanceDir, "internal/boundary-policy.ts")),
  "boundary-policy SSOT",
);
assertCase(
  "policy.prefixes",
  PERFORMANCE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.includes(
    "@/performance/integrity",
  ),
  "integrity deep import forbidden for consumers",
);

assertCase(
  "helper.public.ok",
  isForbiddenPerformanceConsumerImport("@/performance") === false,
  "@/performance allowed",
);
assertCase(
  "helper.deep.forbidden",
  isForbiddenPerformanceConsumerImport("@/performance/gates") === true,
  "deep path forbidden",
);
assertCase(
  "helper.i2.peer.allowed",
  isAllowedPerformanceI2PeerImport("@/engine") &&
    !isForbiddenPerformancePeerImport("@/engine"),
  "@/engine allowlisted",
);
assertCase(
  "helper.peer.deep.forbidden",
  isForbiddenPerformancePeerImport("@/engine/foo") === true,
  "deep peer forbidden",
);
assertCase(
  "helper.ai.forbidden",
  isForbiddenPerformancePeerImport("@/ai") === true,
  "@/ai forbidden",
);

const allSrc = collectTsFiles(srcDir);
const outsidePerf = allSrc.filter((f) => !isUnder(f, performanceDir));
const perfFiles = allSrc.filter((f) => isUnder(f, performanceDir));

for (const file of outsidePerf) {
  const code = stripComments(readFileSync(file, "utf8"));
  const rel = relFromRepo(file);
  for (const spec of extractFromSpecifiers(code)) {
    if (!spec.startsWith("@/performance")) continue;
    const forbidden = isForbiddenPerformanceConsumerImport(spec);
    const onlyPublic = spec === "@/performance";
    assertCase(
      `consumer.import.${rel}::${spec}`,
      onlyPublic && !forbidden,
      onlyPublic ? "public only" : "deep PERFORMANCE import forbidden",
    );
  }
}

for (const file of perfFiles) {
  const code = stripComments(readFileSync(file, "utf8"));
  const rel = relFromRepo(file);
  const inInstrumentation = rel.includes("/instrumentation/");
  for (const spec of extractFromSpecifiers(code)) {
    if (!spec.startsWith("@/")) continue;
    if (spec.startsWith("@/performance")) continue;

    if (inInstrumentation) {
      const ok =
        isAllowedPerformanceI2PeerImport(spec) ||
        !isForbiddenPerformancePeerImport(spec);
      // Instrumentation may only use exact public barrels for engine/data/ui.
      if (
        spec === "@/engine" ||
        spec === "@/data" ||
        spec === "@/ui" ||
        isForbiddenPerformancePeerImport(spec)
      ) {
        assertCase(
          `perf.peer.${rel}::${spec}`,
          isAllowedPerformanceI2PeerImport(spec),
          isAllowedPerformanceI2PeerImport(spec)
            ? "I2 allowlisted"
            : "forbidden peer import",
        );
      } else {
        assertCase(
          `perf.peer.other.${rel}::${spec}`,
          ok,
          "non-peer or allowed",
        );
      }
    } else if (isForbiddenPerformancePeerImport(spec)) {
      assertCase(
        `perf.no.peer.${rel}::${spec}`,
        false,
        "peer import outside instrumentation",
      );
    }
  }
}

assertCase("no.collab", !existsSync(join(repoRoot, "src/collab")), "absent");

const peerRoots = ["engine", "data", "ai", "ui", "plugins"] as const;
for (const peer of peerRoots) {
  assertCase(
    `peer.root.${peer}`,
    existsSync(join(repoRoot, "src", peer)),
    "peer root present (unmodified expectation)",
  );
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  const mark = r.pass ? "PASS" : "FAIL";
  console.log(`[${mark}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-performance-boundaries: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-performance-boundaries: ${results.length} checks PASS`);
