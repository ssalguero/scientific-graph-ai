/**
 * UX-3.13 — Theme Runtime Health Aggregation Foundation gate.
 *
 * Blocks:
 * aggregationLayout · aggregationImmutable · builderSoleConstructor
 * accumulatorBehavior · reporterPure · noReact · noProviderWiring
 * apiFreeze · objectFreeze · o1NoDynamicStructures (incl. tsc)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { RuntimeHealth } from "../src/ui/theme/runtime/health/RuntimeHealth";
import { RuntimeHealthStatus } from "../src/ui/theme/runtime/health/RuntimeHealthStatus";
import type { RuntimeMetricsSnapshot } from "../src/ui/theme/runtime/metrics/RuntimeMetricsSnapshot";
import type { RuntimeDiagnostic } from "../src/ui/theme/runtime/diagnostics/RuntimeDiagnostic";
import {
  RuntimeAggregationAccumulator,
  RuntimeAggregationReporter,
} from "../src/ui/theme/runtime/aggregation";
import { RuntimeAggregationBuilder } from "../src/ui/theme/runtime/aggregation/RuntimeAggregationBuilder";
import type { RuntimeAggregation } from "../src/ui/theme/runtime/aggregation/RuntimeAggregation";

type BlockId =
  | "aggregationLayout"
  | "aggregationImmutable"
  | "builderSoleConstructor"
  | "accumulatorBehavior"
  | "reporterPure"
  | "noReact"
  | "noProviderWiring"
  | "apiFreeze"
  | "objectFreeze"
  | "o1NoDynamicStructures";

type CaseResult = { block: BlockId; id: string; pass: boolean; detail: string };

const results: CaseResult[] = [];

function assertCase(
  block: BlockId,
  id: string,
  pass: boolean,
  detail: string,
): void {
  results.push({ block, id, pass, detail });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const AGG_DIR = "src/ui/theme/runtime/aggregation";
const REQUIRED_FILES = [
  "RuntimeAggregation.ts",
  "RuntimeAggregationBuilder.ts",
  "RuntimeAggregationAccumulator.ts",
  "RuntimeAggregationReporter.ts",
  "index.ts",
] as const;

const EXPECTED_KEYS = [
  "totalSamples",
  "okCount",
  "warningCount",
  "errorCount",
  "averageResolutionCount",
  "averageFallbackCount",
  "averageObserverCount",
  "averageDiagnosticCount",
] as const;

function readAggSources(): string {
  return REQUIRED_FILES.map((f) => read(`${AGG_DIR}/${f}`)).join("\n");
}

function emptyMetrics(
  overrides: Partial<RuntimeMetricsSnapshot> = {},
): RuntimeMetricsSnapshot {
  return Object.freeze({
    resolutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    fingerprintChanges: 0,
    observerNotifications: 0,
    snapshots: 0,
    ...overrides,
  });
}

function makeDiag(code: "EMPTY_REGISTRY" = "EMPTY_REGISTRY"): RuntimeDiagnostic {
  return Object.freeze({
    code,
    level: "ERROR" as const,
    message: "test",
  });
}

function makeHealth(opts: {
  status: "OK" | "WARNING" | "ERROR";
  resolutions?: number;
  cacheMisses?: number;
  observerNotifications?: number;
  diagnosticCount?: number;
}): RuntimeHealth {
  const diags: RuntimeDiagnostic[] = [];
  const count = opts.diagnosticCount ?? 0;
  for (let i = 0; i < count; i++) {
    diags.push(makeDiag());
  }
  return Object.freeze({
    fingerprint: "fp-agg",
    version: "3.1.3",
    diagnostics: Object.freeze(diags),
    metrics: emptyMetrics({
      resolutions: opts.resolutions ?? 0,
      cacheMisses: opts.cacheMisses ?? 0,
      observerNotifications: opts.observerNotifications ?? 0,
      cacheHits: 0,
      fingerprintChanges: 0,
      snapshots: 0,
    }),
    status: opts.status,
    generatedAt: 0,
  });
}

function shapeOf(agg: RuntimeAggregation): string {
  return JSON.stringify({
    totalSamples: agg.totalSamples,
    okCount: agg.okCount,
    warningCount: agg.warningCount,
    errorCount: agg.errorCount,
    averageResolutionCount: agg.averageResolutionCount,
    averageFallbackCount: agg.averageFallbackCount,
    averageObserverCount: agg.averageObserverCount,
    averageDiagnosticCount: agg.averageDiagnosticCount,
  });
}

/* -------------------------------------------------------------------------- */
/* aggregationLayout                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "aggregationLayout";
  const dir = join(repoRoot, AGG_DIR);
  assertCase(
    block,
    "layout.dir",
    existsSync(dir),
    existsSync(dir) ? "aggregation/ exists" : "aggregation/ missing",
  );

  const files = existsSync(dir) ? readdirSync(dir) : [];
  for (const f of REQUIRED_FILES) {
    assertCase(
      block,
      `layout.file.${f}`,
      files.includes(f),
      files.includes(f) ? `${f} present` : `${f} missing`,
    );
  }

  assertCase(
    block,
    "layout.noExtra",
    files.length === REQUIRED_FILES.length &&
      REQUIRED_FILES.every((f) => files.includes(f)),
    `exactly ${REQUIRED_FILES.length} files (found ${files.length}: ${files.join(", ")})`,
  );

  const indexSrc = read(`${AGG_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported from @\/ui, theme\/index, runtime\/index, hooks\/index, or providers\/index/.test(
      indexSrc,
    ),
    "privacy comment matches prior private barrels",
  );

  const mustExport = [
    "RuntimeAggregation",
    "RuntimeAggregationAccumulator",
    "RuntimeAggregationReporter",
  ];
  for (const name of mustExport) {
    assertCase(
      block,
      `layout.reexport.${name}`,
      indexSrc.includes(name),
      indexSrc.includes(name)
        ? `barrel mentions ${name}`
        : `barrel missing ${name}`,
    );
  }

  assertCase(
    block,
    "layout.builderNotExported",
    !/export\s+.*RuntimeAggregationBuilder/.test(indexSrc) &&
      !/from\s+["']\.\/RuntimeAggregationBuilder["']/.test(indexSrc),
    "Builder not exported from barrel",
  );

  const runtimeIndex = stripComments(
    read("src/ui/theme/runtime/index.ts"),
  );
  assertCase(
    block,
    "layout.runtimeIndexUntouched",
    !/aggregation/.test(runtimeIndex),
    "runtime/index.ts does not mention aggregation",
  );
}

/* -------------------------------------------------------------------------- */
/* aggregationImmutable                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "aggregationImmutable";
  const typeSrc = stripComments(read(`${AGG_DIR}/RuntimeAggregation.ts`));

  assertCase(
    block,
    "immutable.readonlyWrapper",
    /export type RuntimeAggregation = Readonly<\{/.test(
      typeSrc.replace(/\s+/g, " "),
    ),
    "RuntimeAggregation uses Readonly<{...}>",
  );

  const viaBuilder = RuntimeAggregationBuilder.create(0, 0, 0, 0, 0, 0, 0, 0);

  assertCase(
    block,
    "immutable.frozen",
    Object.isFrozen(viaBuilder),
    "RuntimeAggregation instance Object.isFrozen",
  );

  const keys = Object.keys(viaBuilder).sort();
  const expected = [...EXPECTED_KEYS].sort();
  assertCase(
    block,
    "immutable.keys",
    keys.length === expected.length &&
      keys.every((k, i) => k === expected[i]),
    `keys=${keys.join(",")} expected=${expected.join(",")}`,
  );

  assertCase(
    block,
    "immutable.noArrays",
    EXPECTED_KEYS.every(
      (k) => typeof viaBuilder[k] === "number" && !Array.isArray(viaBuilder[k]),
    ),
    "all fields are scalar numbers (no arrays)",
  );

  const a = RuntimeAggregationBuilder.create(1, 1, 0, 0, 2, 3, 4, 5);
  const b = RuntimeAggregationBuilder.create(1, 1, 0, 0, 2, 3, 4, 5);
  assertCase(
    block,
    "immutable.newInstanceEachCreate",
    a !== b && shapeOf(a) === shapeOf(b),
    "each create() returns a new frozen instance",
  );
}

/* -------------------------------------------------------------------------- */
/* builderSoleConstructor                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderSoleConstructor";
  const builderSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationBuilder.ts`),
  );
  const accumulatorSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationAccumulator.ts`),
  );
  const reporterSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationReporter.ts`),
  );

  assertCase(
    block,
    "builder.createOnly",
    /function create\(/.test(builderSrc) &&
      /export const RuntimeAggregationBuilder = Object\.freeze\(\{\s*create/.test(
        builderSrc.replace(/\s+/g, " "),
      ),
    "Builder exposes create only",
  );

  assertCase(
    block,
    "builder.noAverageMath",
    !/\?\s*0\s*:/.test(builderSrc) &&
      !/sumResolutions|sumFallbacks|sumObservers|sumDiagnostics/.test(
        builderSrc,
      ) &&
      !/\bMath\.(round|floor|ceil|trunc)\b/.test(builderSrc) &&
      !/\w+\s*\/\s*\w+/.test(builderSrc),
    "Builder performs no average calculations / division",
  );

  assertCase(
    block,
    "accumulator.usesBuilder",
    /RuntimeAggregationBuilder\.create\(/.test(accumulatorSrc),
    "Accumulator.build delegates to Builder.create",
  );

  assertCase(
    block,
    "reporter.noLocalConstruction",
    !/Object\.freeze\(\s*\{[\s\S]*totalSamples/.test(reporterSrc) &&
      !/RuntimeAggregationBuilder/.test(reporterSrc),
    "Reporter does not construct Aggregation locally",
  );

  assertCase(
    block,
    "api.builderOnlyCreate",
    Object.keys(RuntimeAggregationBuilder).length === 1 &&
      "create" in RuntimeAggregationBuilder,
    "Builder API = create only",
  );
}

/* -------------------------------------------------------------------------- */
/* accumulatorBehavior                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "accumulatorBehavior";

  assertCase(
    block,
    "accumulator.isClass",
    typeof RuntimeAggregationAccumulator === "function" &&
      /\bexport\s+class\s+RuntimeAggregationAccumulator\b/.test(
        stripComments(read(`${AGG_DIR}/RuntimeAggregationAccumulator.ts`)),
      ),
    "RuntimeAggregationAccumulator is a class",
  );

  // Empty aggregation
  {
    const acc = new RuntimeAggregationAccumulator();
    const empty = acc.build();
    assertCase(
      block,
      "behavior.empty",
      empty.totalSamples === 0 &&
        empty.okCount === 0 &&
        empty.warningCount === 0 &&
        empty.errorCount === 0 &&
        empty.averageResolutionCount === 0 &&
        empty.averageFallbackCount === 0 &&
        empty.averageObserverCount === 0 &&
        empty.averageDiagnosticCount === 0,
      `empty aggregation zeros (got ${shapeOf(empty)})`,
    );
  }

  // Single sample
  {
    const acc = new RuntimeAggregationAccumulator();
    acc.record(
      makeHealth({
        status: RuntimeHealthStatus.OK,
        resolutions: 4,
        cacheMisses: 2,
        observerNotifications: 6,
        diagnosticCount: 3,
      }),
    );
    const one = acc.build();
    assertCase(
      block,
      "behavior.oneSample",
      one.totalSamples === 1 &&
        one.okCount === 1 &&
        one.warningCount === 0 &&
        one.errorCount === 0 &&
        one.averageResolutionCount === 4 &&
        one.averageFallbackCount === 2 &&
        one.averageObserverCount === 6 &&
        one.averageDiagnosticCount === 3,
      `one sample averages (got ${shapeOf(one)})`,
    );
  }

  // Multiple samples + status counts + native division
  {
    const acc = new RuntimeAggregationAccumulator();
    acc.record(
      makeHealth({
        status: RuntimeHealthStatus.OK,
        resolutions: 2,
        cacheMisses: 1,
        observerNotifications: 4,
        diagnosticCount: 2,
      }),
    );
    acc.record(
      makeHealth({
        status: RuntimeHealthStatus.WARNING,
        resolutions: 4,
        cacheMisses: 3,
        observerNotifications: 2,
        diagnosticCount: 0,
      }),
    );
    acc.record(
      makeHealth({
        status: RuntimeHealthStatus.ERROR,
        resolutions: 6,
        cacheMisses: 5,
        observerNotifications: 0,
        diagnosticCount: 4,
      }),
    );
    const multi = acc.build();
    const expectedRes = (2 + 4 + 6) / 3;
    const expectedFb = (1 + 3 + 5) / 3;
    const expectedObs = (4 + 2 + 0) / 3;
    const expectedDiag = (2 + 0 + 4) / 3;
    assertCase(
      block,
      "behavior.multiStatus",
      multi.totalSamples === 3 &&
        multi.okCount === 1 &&
        multi.warningCount === 1 &&
        multi.errorCount === 1,
      `status counts ok=${multi.okCount} warn=${multi.warningCount} err=${multi.errorCount}`,
    );
    assertCase(
      block,
      "behavior.multiAverages",
      multi.averageResolutionCount === expectedRes &&
        multi.averageFallbackCount === expectedFb &&
        multi.averageObserverCount === expectedObs &&
        multi.averageDiagnosticCount === expectedDiag,
      `native averages res=${multi.averageResolutionCount} fb=${multi.averageFallbackCount} obs=${multi.averageObserverCount} diag=${multi.averageDiagnosticCount}`,
    );
    assertCase(
      block,
      "behavior.noRounding",
      multi.averageFallbackCount === 3 && // (1+3+5)/3 = 3 exact
        multi.averageResolutionCount === 4 && // (2+4+6)/3 = 4
        Math.abs(multi.averageObserverCount - expectedObs) < 1e-12 &&
        Math.abs(multi.averageDiagnosticCount - expectedDiag) < 1e-12,
      "averages use native division (no Math.round)",
    );
  }

  // build() pure + new instances
  {
    const acc = new RuntimeAggregationAccumulator();
    acc.record(
      makeHealth({
        status: RuntimeHealthStatus.OK,
        resolutions: 10,
        cacheMisses: 1,
        observerNotifications: 2,
        diagnosticCount: 1,
      }),
    );
    const first = acc.build();
    const second = acc.build();
    const third = RuntimeAggregationReporter.build(acc);
    assertCase(
      block,
      "behavior.buildPure",
      shapeOf(first) === shapeOf(second) &&
        first.totalSamples === 1 &&
        second.totalSamples === 1,
      "consecutive build() produce equal values without mutating state",
    );
    assertCase(
      block,
      "behavior.buildNewInstance",
      first !== second && first !== third && second !== third,
      "each build() returns a distinct instance (a !== b)",
    );
    assertCase(
      block,
      "behavior.buildFrozen",
      Object.isFrozen(first) &&
        Object.isFrozen(second) &&
        Object.isFrozen(third),
      "built aggregations are frozen",
    );
  }

  // reset()
  {
    const acc = new RuntimeAggregationAccumulator();
    acc.record(
      makeHealth({
        status: RuntimeHealthStatus.ERROR,
        resolutions: 5,
        cacheMisses: 5,
        observerNotifications: 5,
        diagnosticCount: 5,
      }),
    );
    acc.reset();
    const after = acc.build();
    assertCase(
      block,
      "behavior.reset",
      after.totalSamples === 0 &&
        after.okCount === 0 &&
        after.warningCount === 0 &&
        after.errorCount === 0 &&
        after.averageResolutionCount === 0 &&
        after.averageFallbackCount === 0 &&
        after.averageObserverCount === 0 &&
        after.averageDiagnosticCount === 0,
      `reset zeros all scalars (got ${shapeOf(after)})`,
    );
  }

  // Independent instances (no shared global state)
  {
    const a = new RuntimeAggregationAccumulator();
    const b = new RuntimeAggregationAccumulator();
    a.record(
      makeHealth({
        status: RuntimeHealthStatus.OK,
        resolutions: 1,
        diagnosticCount: 0,
      }),
    );
    assertCase(
      block,
      "behavior.independentInstances",
      a.build().totalSamples === 1 && b.build().totalSamples === 0,
      "accumulators do not share state",
    );
  }

  // No retained RuntimeHealth — source scan
  {
    const accSrc = stripComments(
      read(`${AGG_DIR}/RuntimeAggregationAccumulator.ts`),
    );
    assertCase(
      block,
      "behavior.noHealthField",
      !/this\.\w*[Hh]ealth\w*\s*=/.test(accSrc) &&
        !/private\s+\w*[Hh]ealth/.test(accSrc) &&
        !/RuntimeHealth\s*\[/.test(accSrc) &&
        !/:\s*RuntimeHealth\s*[;=]/.test(accSrc.replace(/record\(health:/g, "")),
      "Accumulator does not store RuntimeHealth fields",
    );
    assertCase(
      block,
      "behavior.noHistoryArrays",
      !/private\s+\w+\s*[:=]\s*\[/.test(accSrc) &&
        !/this\.\w+\s*=\s*\[/.test(accSrc) &&
        !/\.push\(/.test(accSrc),
      "Accumulator has no history arrays",
    );
  }

  // Mapping source check
  {
    const accSrc = stripComments(
      read(`${AGG_DIR}/RuntimeAggregationAccumulator.ts`),
    );
    assertCase(
      block,
      "behavior.mappingResolutions",
      /metrics\.resolutions/.test(accSrc),
      "record maps metrics.resolutions",
    );
    assertCase(
      block,
      "behavior.mappingCacheMisses",
      /metrics\.cacheMisses/.test(accSrc),
      "record maps metrics.cacheMisses → fallback",
    );
    assertCase(
      block,
      "behavior.mappingObservers",
      /metrics\.observerNotifications/.test(accSrc),
      "record maps metrics.observerNotifications",
    );
    assertCase(
      block,
      "behavior.mappingDiagnostics",
      /diagnostics\.length/.test(accSrc),
      "record maps diagnostics.length",
    );
  }

  // Prior validate:ux-3.12
  {
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const run = spawnSync(npmCmd, ["run", "validate:ux-3.12"], {
      cwd: repoRoot,
      stdio: "pipe",
      shell: true,
      encoding: "utf8",
    });
    const out = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
    const priorPass =
      run.status === 0 && /validate:ux-3\.12\s*\nPASS/m.test(out);
    assertCase(
      block,
      "behavior.priorUx312",
      priorPass,
      priorPass
        ? "validate:ux-3.12 PASS"
        : `ux-3.12 failed: ${out.slice(-800)}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* reporterPure                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterPure";
  const reporterSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationReporter.ts`),
  );

  assertCase(
    block,
    "reporter.onlyBuild",
    /export const RuntimeAggregationReporter = Object\.freeze\(\{\s*build/.test(
      reporterSrc.replace(/\s+/g, " "),
    ) && !/\b(cache|reset|getSnapshot|state)\b/.test(reporterSrc),
    "Reporter exposes build only; no cache/state APIs",
  );

  assertCase(
    block,
    "reporter.noModuleState",
    !/\blet\b|\bvar\b/.test(reporterSrc) &&
      !/\bMap\b|\bSet\b|\bWeakMap\b/.test(reporterSrc),
    "no mutable module state in Reporter",
  );

  assertCase(
    block,
    "reporter.delegatesOnly",
    /return accumulator\.build\(/.test(reporterSrc),
    "build returns accumulator.build() directly",
  );

  const acc = new RuntimeAggregationAccumulator();
  acc.record(
    makeHealth({
      status: RuntimeHealthStatus.WARNING,
      resolutions: 3,
      cacheMisses: 1,
      observerNotifications: 2,
      diagnosticCount: 1,
    }),
  );
  const viaAcc = acc.build();
  const viaReporter = RuntimeAggregationReporter.build(acc);
  assertCase(
    block,
    "reporter.shapeMatchesAccumulator",
    shapeOf(viaAcc) === shapeOf(viaReporter),
    "Reporter.build matches Accumulator.build shape",
  );
  assertCase(
    block,
    "api.reporterOnlyBuild",
    Object.keys(RuntimeAggregationReporter).length === 1 &&
      "build" in RuntimeAggregationReporter,
    "Reporter API = build only",
  );
}

/* -------------------------------------------------------------------------- */
/* noReact                                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const src = stripComments(readAggSources());
  const bans = [
    {
      id: "react.import",
      re: /\bfrom\s+["']react["']|\brequire\s*\(\s*["']react["']/,
    },
    { id: "react.ident", re: /\bReact\b/ },
    {
      id: "hooks",
      re: /\buse(State|Effect|Memo|Callback|Ref|Context)\b/,
    },
    {
      id: "console",
      re: /\bconsole\.(log|warn|error|info|debug)\b/,
    },
    { id: "async", re: /\basync\b|\bawait\b|\bPromise\b/ },
    {
      id: "timers",
      re: /\bsetTimeout\b|\bsetInterval\b|\brequestAnimationFrame\b/,
    },
    { id: "date", re: /\bDate\b/ },
    { id: "json", re: /\bJSON\b/ },
    {
      id: "storage",
      re: /\blocalStorage\b|\bIndexedDB\b|\bindexedDB\b/,
    },
  ] as const;
  for (const b of bans) {
    assertCase(
      block,
      b.id,
      !b.re.test(src),
      !b.re.test(src) ? `no ${b.id}` : `found ${b.id}`,
    );
  }
  const files = readdirSync(join(repoRoot, AGG_DIR));
  assertCase(
    block,
    "noTsx",
    !files.some((f) => f.endsWith(".tsx")),
    "no .tsx in aggregation/",
  );
}

/* -------------------------------------------------------------------------- */
/* noProviderWiring                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProviderWiring";
  const providerCandidates = [
    "src/ui/providers/theme-provider.tsx",
    "src/ui/providers/index.ts",
  ];
  for (const rel of providerCandidates) {
    if (!existsSync(join(repoRoot, rel))) {
      assertCase(block, `provider.absent.${rel}`, true, `${rel} absent (ok)`);
      continue;
    }
    const src = stripComments(read(rel));
    assertCase(
      block,
      `provider.noAggregation.${rel}`,
      !/runtime\/aggregation/.test(src) &&
        !/theme\/runtime\/aggregation/.test(src),
      !/runtime\/aggregation/.test(src)
        ? `${rel} does not import aggregation`
        : `${rel} imports runtime/aggregation`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* apiFreeze                                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  const barrels = [
    "src/ui/index.ts",
    "src/ui/theme/index.ts",
    "src/ui/theme/runtime/index.ts",
    "src/ui/theme/hooks/index.ts",
    "src/ui/providers/index.ts",
  ];

  for (const barrel of barrels) {
    if (!existsSync(join(repoRoot, barrel))) {
      assertCase(block, `api.${barrel}`, true, `${barrel} absent (ok)`);
      continue;
    }
    const src = stripComments(read(barrel));
    const exportsAgg =
      /from\s+["'][^"']*runtime\/aggregation[^"']*["']/.test(src) ||
      /runtime\/aggregation/.test(src);
    const exportsSym = [
      "RuntimeAggregation",
      "RuntimeAggregationAccumulator",
      "RuntimeAggregationReporter",
      "RuntimeAggregationBuilder",
    ].some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    assertCase(
      block,
      `api.noExport.${barrel}`,
      !exportsAgg && !exportsSym,
      !exportsAgg && !exportsSym
        ? `${barrel} does not export aggregation`
        : `${barrel} leaks aggregation`,
    );
  }

  const indexSrc = stripComments(read(`${AGG_DIR}/index.ts`));
  assertCase(
    block,
    "api.barrelNoBuilder",
    !/RuntimeAggregationBuilder/.test(indexSrc),
    "private barrel does not export Builder",
  );
}

/* -------------------------------------------------------------------------- */
/* objectFreeze                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "objectFreeze";
  const builderSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationBuilder.ts`),
  );
  const reporterSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationReporter.ts`),
  );

  assertCase(
    block,
    "src.builderFreeze",
    /export const RuntimeAggregationBuilder = Object\.freeze\(/.test(
      builderSrc,
    ),
    "Builder Object.freeze in source",
  );
  assertCase(
    block,
    "src.reporterFreeze",
    /export const RuntimeAggregationReporter = Object\.freeze\(/.test(
      reporterSrc,
    ),
    "Reporter Object.freeze in source",
  );
  assertCase(
    block,
    "src.instanceFreeze",
    /return Object\.freeze\(result\)/.test(builderSrc),
    "Builder freezes Aggregation instance",
  );

  assertCase(
    block,
    "runtime.builderFrozen",
    Object.isFrozen(RuntimeAggregationBuilder),
    "Object.isFrozen(RuntimeAggregationBuilder)",
  );
  assertCase(
    block,
    "runtime.reporterFrozen",
    Object.isFrozen(RuntimeAggregationReporter),
    "Object.isFrozen(RuntimeAggregationReporter)",
  );
}

/* -------------------------------------------------------------------------- */
/* o1NoDynamicStructures                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "o1NoDynamicStructures";
  const src = stripComments(readAggSources());
  const accSrc = stripComments(
    read(`${AGG_DIR}/RuntimeAggregationAccumulator.ts`),
  );

  assertCase(
    block,
    "collections.noWeakOrNew",
    !/\bnew\s+(Map|Set)\b/.test(src) &&
      !/\bWeakMap\b/.test(src) &&
      !/\bWeakSet\b/.test(src),
    "no new Map/Set or WeakMap/WeakSet",
  );

  assertCase(
    block,
    "record.noLoops",
    !/record\([\s\S]*?\bfor\b/.test(accSrc) &&
      !/record\([\s\S]*?\bwhile\b/.test(accSrc) &&
      !/record\([\s\S]*?\.forEach\b/.test(accSrc) &&
      !/record\([\s\S]*?\.map\b/.test(accSrc),
    "record() has no loops (O(1))",
  );

  assertCase(
    block,
    "noRounding",
    !/\bMath\.(round|floor|ceil|trunc)\b/.test(src) &&
      !/\.toFixed\b/.test(src),
    "no rounding/truncation/formatting of averages",
  );

  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const tscPass = tsc.status === 0;
  assertCase(
    block,
    "tsc.noEmit",
    tscPass,
    tscPass
      ? "npx tsc --noEmit PASS"
      : `tsc failed: ${(tsc.stderr || tsc.stdout || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; ca: string }> = [
  { id: "aggregationLayout", ca: "CA-UX-3.13.1" },
  { id: "aggregationImmutable", ca: "CA-UX-3.13.1" },
  { id: "builderSoleConstructor", ca: "CA-UX-3.13.5" },
  { id: "accumulatorBehavior", ca: "CA-UX-3.13.2–4" },
  { id: "reporterPure", ca: "CA-UX-3.13.4" },
  { id: "noReact", ca: "CA-UX-3.13.6" },
  { id: "noProviderWiring", ca: "CA-UX-3.13.7" },
  { id: "apiFreeze", ca: "CA-UX-3.13.8–9" },
  { id: "objectFreeze", ca: "CA-UX-3.13.1" },
  { id: "o1NoDynamicStructures", ca: "CA-UX-3.13.3/10" },
];

let passCount = 0;
for (const { id: block, ca } of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0 && blockResults.length > 0;
  if (ok) passCount += 1;
  const pad = ".".repeat(Math.max(1, 28 - block.length));
  console.log(`${block} ${pad} ${ok ? "PASS" : "FAIL"} (${ca})`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
  if (blockResults.length === 0) {
    console.log(`  FAIL (no cases)`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-3.13");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
