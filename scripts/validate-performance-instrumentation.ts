/**
 * PERFORMANCE-I2 — Instrumentation seams readiness + behavioral gate.
 *
 * Authority: PERFORMANCE-P4 · P6 I2 · P9 ·
 * docs/PERFORMANCE/implementation/PERFORMANCE-I2-Instrumentation-Seams.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  PERFORMANCE_INSTRUMENTATION_STATUS,
  PERFORMANCE_SEAM_REGISTRY,
  bindAdapterObservations,
  getSeamDescriptor,
  isEnginePublicOperationLabel,
  listImplementedSeams,
  listUnavailableOrDeferredSeams,
  observeDataPublicSurface,
  observeEnginePublicSurface,
  observePassivePublicTiming,
  observeSupportedPublicSeams,
  observeUxPublicSurface,
} from "../src/performance/instrumentation";
import { collectThenAggregate } from "../src/performance/measurement";
import { isAllowedPerformanceI2PeerImport } from "../src/performance/internal/boundary-policy";

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

const REQUIRED_FILES = [
  "src/performance/instrumentation/index.ts",
  "src/performance/instrumentation/seams.ts",
  "src/performance/instrumentation/engine-adapter.ts",
  "src/performance/instrumentation/data-adapter.ts",
  "src/performance/instrumentation/ux-adapter.ts",
  "src/performance/instrumentation/bind.ts",
  "docs/PERFORMANCE/implementation/PERFORMANCE-I2-Instrumentation-Seams.md",
];

const FORBIDDEN_DIRS = [
  "src/performance/optimization",
  "src/performance/benchmarks",
  "src/performance/certification",
];

for (const rel of REQUIRED_FILES) {
  assertCase(`layout.file.${rel}`, existsSync(join(repoRoot, rel)), "present");
}
for (const rel of FORBIDDEN_DIRS) {
  assertCase(
    `no.future.dir.${rel}`,
    !existsSync(join(repoRoot, rel)),
    existsSync(join(repoRoot, rel)) ? "forbidden" : "absent",
  );
}

assertCase(
  "status.marker",
  PERFORMANCE_INSTRUMENTATION_STATUS === "INSTRUMENTATION_SEAMS_COMPLETE",
  "I2 status",
);

const implemented = listImplementedSeams();
assertCase(
  "seams.implemented",
  implemented.length === 3 &&
    implemented.every((s) => ["engine", "data", "ux"].includes(s.seamId)),
  `implemented=${implemented.map((s) => s.seamId).join(",")}`,
);

const deferred = listUnavailableOrDeferredSeams();
assertCase(
  "seams.deferred.ai",
  deferred.some((s) => s.seamId === "ai" && s.availability === "conditional"),
  "AI conditional",
);
assertCase(
  "seams.deferred.collab",
  deferred.some((s) => s.seamId === "collab" && s.availability === "conditional"),
  "COLLAB conditional",
);
assertCase(
  "seams.deferred.plugins",
  deferred.some((s) => s.seamId === "plugins" && s.availability === "partial"),
  "PLUGINS partial",
);
assertCase(
  "seams.cross.domain.not.implemented",
  deferred.some((s) => s.seamId === "cross-domain" && !s.adapterImplemented),
  "cross-domain deferred to I6",
);
assertCase(
  "registry.size",
  PERFORMANCE_SEAM_REGISTRY.length === 7,
  `registry=${PERFORMANCE_SEAM_REGISTRY.length}`,
);
assertCase(
  "ai.not.adapter",
  getSeamDescriptor("ai")?.adapterImplemented === false,
  "AI has no fabricated adapter",
);

const engineBatch = observeEnginePublicSurface(1000);
assertCase(
  "adapter.engine.count",
  engineBatch.observations.length === 12 &&
    engineBatch.observations.every((o) => o.numericValue === 1),
  `engine observations=${engineBatch.observations.length}`,
);

const dataBatch = observeDataPublicSurface(2000);
assertCase(
  "adapter.data.count",
  dataBatch.observations.length === 2 &&
    dataBatch.observations.every((o) => o.numericValue > 0),
  `data observations=${dataBatch.observations.length}`,
);

const uxBatch = observeUxPublicSurface(3000);
assertCase(
  "adapter.ux.count",
  uxBatch.observations.length === 4 &&
    uxBatch.observations.every((o) => o.numericValue > 0),
  `ux observations=${uxBatch.observations.length}`,
);

const bound = bindAdapterObservations("i2-bind", [engineBatch, dataBatch, uxBatch]);
assertCase("bind.ok", bound.ok === true, "adapter → C-COL → C-AGG");
if (bound.ok) {
  assertCase(
    "bind.count",
    bound.value.observationCount ===
      engineBatch.observations.length +
        dataBatch.observations.length +
        uxBatch.observations.length,
    `observationCount=${bound.value.observationCount}`,
  );
}

const supported = observeSupportedPublicSeams("i2-all", 5000);
assertCase("supported.ok", supported.ok === true, "observeSupportedPublicSeams");

const passiveOk = observePassivePublicTiming({
  observationId: "t1",
  seamId: "engine",
  operationLabel: "saveProject",
  durationMs: 42,
  collectedAtMs: 9000,
});
assertCase("passive.ok", passiveOk.ok === true, "passive timing allowlisted");

const passiveBadOp = observePassivePublicTiming({
  observationId: "t2",
  seamId: "engine",
  operationLabel: "secretInternal",
  durationMs: 1,
  collectedAtMs: 9001,
});
assertCase("passive.reject.private", passiveBadOp.ok === false, "rejects non-public ENGINE label");

const passiveUx = observePassivePublicTiming({
  observationId: "t3",
  seamId: "ux",
  operationLabel: "resolveTheme",
  durationMs: 5,
  collectedAtMs: 9003,
});
assertCase("passive.ux.ok", passiveUx.ok === true, "UX passive timing accepted");

assertCase("allowlist.save", isEnginePublicOperationLabel("saveProject"), "saveProject allowlisted");
assertCase(
  "allowlist.internal",
  !isEnginePublicOperationLabel("business/flows"),
  "private rejected",
);

const core = collectThenAggregate("i1-still", [
  {
    observationId: "x",
    sourceLabel: "core",
    signalName: "ping",
    numericValue: 1,
    collectedAtMs: 1,
  },
]);
assertCase("i1.continuity", core.ok === true, "measurement core still works");

const barrel = readFileSync(join(performanceDir, "index.ts"), "utf8");
assertCase(
  "barrel.exports.i2",
  /observeSupportedPublicSeams/.test(barrel) &&
    /PERFORMANCE_SEAM_REGISTRY/.test(barrel),
  "barrel exports I2",
);
// I3 authorizes budget APIs on the shared public barrel.

const tsFiles = collectTsFiles(performanceDir);
for (const file of tsFiles) {
  const src = readFileSync(file, "utf8");
  const rel = relFromRepo(file);
  const inInstrumentation = rel.includes("/instrumentation/");
  const specs = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);

  for (const spec of specs) {
    if (!spec.startsWith("@/")) continue;
    if (spec === "@/performance" || spec.startsWith("@/performance/")) {
      // deep @/performance/* from inside package via relative imports preferred;
      // relative imports won't match @/performance
      continue;
    }
    if (inInstrumentation && isAllowedPerformanceI2PeerImport(spec)) {
      assertCase(`peer.allow.${rel}::${spec}`, true, "I2 public barrel");
      continue;
    }
    assertCase(
      `peer.forbid.${rel}::${spec}`,
      false,
      `disallowed peer import ${spec}`,
    );
  }

  assertCase(
    `no.workload.${rel}`,
    !/\b(BenchmarkSuite)\b/.test(src),
    "clean",
  );
  assertCase(
    `no.optimize.${rel}`,
    !/\b(OptimizationEngine|autoOptimize)\b/.test(src),
    "clean",
  );
  // Budget policy lives in I3; instrumentation gate does not forbid evaluateBudget.
}

assertCase(
  "package.ts.count.bounded",
  tsFiles.length <= 90,
  `found ${tsFiles.length} .ts files`,
);
assertCase(
  "no.collab.coupling",
  !tsFiles.some((file) =>
    /from\s+["']@\/collab(\/|["'])/.test(readFileSync(file, "utf8")),
  ),
  "PERFORMANCE must not import @/collab",
);

for (const peer of ["src/engine", "src/data", "src/ai", "src/ui", "src/plugins"]) {
  assertCase(`peer.root.${peer}`, existsSync(join(repoRoot, peer)), "present");
}

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`[${r.pass ? "PASS" : "FAIL"}] ${r.id}: ${r.detail}`);
}

if (failed.length > 0) {
  console.error(`\nvalidate-performance-instrumentation: ${failed.length} failure(s)`);
  process.exit(1);
}

console.log(`\nvalidate-performance-instrumentation: ${results.length} checks PASS`);
