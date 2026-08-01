/**
 * UX-3.14 — Theme Runtime Telemetry Foundation gate.
 *
 * Blocks (18):
 * telemetryLayout · snapshotImmutable · sharedRuntimeRef · sharedMetricsRef
 * sharedHealthRef · builderFrozen · reporterFrozen · builderSoleConstructor
 * collectorApi · reporterDelegates · buildThrowsBeforeRecord · doubleBuild
 * timestampInCollectorOnly · noReactNoWiring · noPublicBarrelLeaks
 * apiFreeze · o1NoDeepCopies · tscCompile
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { RuntimeSnapshot } from "../src/ui/theme/runtime/devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../src/ui/theme/runtime/metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../src/ui/theme/runtime/health/RuntimeHealth";
import type { RuntimeDiagnostic } from "../src/ui/theme/runtime/diagnostics/RuntimeDiagnostic";
import { RuntimeHealthStatus } from "../src/ui/theme/runtime/health/RuntimeHealthStatus";
import {
  RuntimeTelemetryBuilder,
  RuntimeTelemetryCollector,
  RuntimeTelemetryReporter,
} from "../src/ui/theme/runtime/telemetry";

type BlockId =
  | "telemetryLayout"
  | "snapshotImmutable"
  | "sharedRuntimeRef"
  | "sharedMetricsRef"
  | "sharedHealthRef"
  | "builderFrozen"
  | "reporterFrozen"
  | "builderSoleConstructor"
  | "collectorApi"
  | "reporterDelegates"
  | "buildThrowsBeforeRecord"
  | "doubleBuild"
  | "timestampInCollectorOnly"
  | "noReactNoWiring"
  | "noPublicBarrelLeaks"
  | "apiFreeze"
  | "o1NoDeepCopies"
  | "tscCompile";

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

const TEL_DIR = "src/ui/theme/runtime/telemetry";
const REQUIRED_FILES = [
  "TelemetryTypes.ts",
  "RuntimeTelemetryBuilder.ts",
  "RuntimeTelemetryCollector.ts",
  "RuntimeTelemetryReporter.ts",
  "index.ts",
] as const;

const EXPECTED_KEYS = ["runtime", "metrics", "health", "timestamp"] as const;

function readTelSources(): string {
  return REQUIRED_FILES.map((f) => read(`${TEL_DIR}/${f}`)).join("\n");
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

function makeSnapshot(
  overrides: Partial<RuntimeSnapshot> = {},
): RuntimeSnapshot {
  return Object.freeze({
    fingerprint: "fp-tel",
    themeName: "light",
    version: "3.1.4",
    tokenCount: 10,
    colorCount: 2,
    typographyCount: 1,
    spacingCount: 1,
    radiusCount: 1,
    elevationCount: 1,
    ...overrides,
  });
}

function makeHealth(
  metrics: RuntimeMetricsSnapshot,
  overrides: Partial<RuntimeHealth> = {},
): RuntimeHealth {
  const diags: RuntimeDiagnostic[] = [makeDiag()];
  return Object.freeze({
    fingerprint: "fp-tel",
    version: "3.1.4",
    diagnostics: Object.freeze(diags),
    metrics,
    status: RuntimeHealthStatus.OK,
    generatedAt: 0,
    ...overrides,
  });
}

function fixtures(): {
  runtime: RuntimeSnapshot;
  metrics: RuntimeMetricsSnapshot;
  health: RuntimeHealth;
} {
  const runtime = makeSnapshot();
  const metrics = emptyMetrics({ resolutions: 5, cacheMisses: 1 });
  const health = makeHealth(metrics);
  return { runtime, metrics, health };
}

/* -------------------------------------------------------------------------- */
/* PASS 1 — telemetryLayout                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "telemetryLayout";
  const dir = join(repoRoot, TEL_DIR);
  assertCase(
    block,
    "layout.dir",
    existsSync(dir),
    existsSync(dir) ? "telemetry/ exists" : "telemetry/ missing",
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

  const indexSrc = read(`${TEL_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported from @\/ui, theme\/index, runtime\/index, hooks\/index, or providers\/index/.test(
      indexSrc,
    ),
    "privacy comment matches prior private barrels",
  );

  const mustExport = [
    "RuntimeTelemetrySnapshot",
    "RuntimeTelemetryBuilder",
    "RuntimeTelemetryCollector",
    "RuntimeTelemetryReporter",
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

  const runtimeIndex = stripComments(
    read("src/ui/theme/runtime/index.ts"),
  );
  assertCase(
    block,
    "layout.runtimeIndexUntouched",
    !/telemetry/.test(runtimeIndex),
    "runtime/index.ts does not mention telemetry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 2 — snapshotImmutable                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotImmutable";
  const typeSrc = stripComments(read(`${TEL_DIR}/TelemetryTypes.ts`));

  assertCase(
    block,
    "immutable.readonlyWrapper",
    /export type RuntimeTelemetrySnapshot = Readonly<\{/.test(
      typeSrc.replace(/\s+/g, " "),
    ),
    "RuntimeTelemetrySnapshot uses Readonly<{...}>",
  );

  const { runtime, metrics, health } = fixtures();
  const snap = RuntimeTelemetryBuilder.create(runtime, metrics, health, 42);

  assertCase(
    block,
    "immutable.frozen",
    Object.isFrozen(snap),
    "RuntimeTelemetrySnapshot instance Object.isFrozen",
  );

  const keys = Object.keys(snap).sort();
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
    "immutable.fourFieldsOnly",
    EXPECTED_KEYS.every((k) => k in snap) && Object.keys(snap).length === 4,
    "exactly four fields",
  );

  const a = RuntimeTelemetryBuilder.create(runtime, metrics, health, 1);
  const b = RuntimeTelemetryBuilder.create(runtime, metrics, health, 1);
  assertCase(
    block,
    "immutable.newInstanceEachCreate",
    a !== b,
    "each create() returns a new frozen instance",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 3 — sharedRuntimeRef                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sharedRuntimeRef";
  const { runtime, metrics, health } = fixtures();
  const snap = RuntimeTelemetryBuilder.create(runtime, metrics, health, 1);
  assertCase(
    block,
    "shared.runtime",
    Object.is(snap.runtime, runtime),
    "snapshot.runtime === recorded RuntimeSnapshot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 4 — sharedMetricsRef                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sharedMetricsRef";
  const { runtime, metrics, health } = fixtures();
  const snap = RuntimeTelemetryBuilder.create(runtime, metrics, health, 1);
  assertCase(
    block,
    "shared.metrics",
    Object.is(snap.metrics, metrics),
    "snapshot.metrics === recorded RuntimeMetricsSnapshot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 5 — sharedHealthRef                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sharedHealthRef";
  const { runtime, metrics, health } = fixtures();
  const snap = RuntimeTelemetryBuilder.create(runtime, metrics, health, 1);
  assertCase(
    block,
    "shared.health",
    Object.is(snap.health, health),
    "snapshot.health === recorded RuntimeHealth",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 6 — builderFrozen                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderFrozen";
  const builderSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryBuilder.ts`),
  );

  assertCase(
    block,
    "src.builderFreeze",
    /export const RuntimeTelemetryBuilder = Object\.freeze\(/.test(builderSrc),
    "Builder Object.freeze in source",
  );
  assertCase(
    block,
    "src.instanceFreeze",
    /return Object\.freeze\(result\)/.test(builderSrc),
    "Builder freezes TelemetrySnapshot instance",
  );
  assertCase(
    block,
    "runtime.builderFrozen",
    Object.isFrozen(RuntimeTelemetryBuilder),
    "Object.isFrozen(RuntimeTelemetryBuilder)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — reporterFrozen                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterFrozen";
  const reporterSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryReporter.ts`),
  );

  assertCase(
    block,
    "src.reporterFreeze",
    /export const RuntimeTelemetryReporter = Object\.freeze\(/.test(
      reporterSrc,
    ),
    "Reporter Object.freeze in source",
  );
  assertCase(
    block,
    "runtime.reporterFrozen",
    Object.isFrozen(RuntimeTelemetryReporter),
    "Object.isFrozen(RuntimeTelemetryReporter)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — builderSoleConstructor                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderSoleConstructor";
  const builderSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryBuilder.ts`),
  );
  const collectorSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryCollector.ts`),
  );
  const reporterSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryReporter.ts`),
  );
  const typesSrc = stripComments(read(`${TEL_DIR}/TelemetryTypes.ts`));

  assertCase(
    block,
    "builder.onlyCreate",
    /export const RuntimeTelemetryBuilder = Object\.freeze\(\{\s*create/.test(
      builderSrc.replace(/\s+/g, " "),
    ) &&
      Object.keys(RuntimeTelemetryBuilder).length === 1 &&
      "create" in RuntimeTelemetryBuilder,
    "Builder API = create only",
  );

  assertCase(
    block,
    "builder.noDateNow",
    !/\bDate\.now\b/.test(builderSrc) && !/\bDate\b/.test(builderSrc),
    "Builder has no Date.now / Date",
  );

  assertCase(
    block,
    "builder.trustedTimestamp",
    /timestamp/.test(builderSrc) &&
      !/\bvalidate\b|\bnormalize\b|\bMath\.(abs|max|min)\b/.test(builderSrc),
    "timestamp trusted — no validate/normalize",
  );

  assertCase(
    block,
    "builder.noBranching",
    !/\bif\b|\bswitch\b|\b\?\./.test(builderSrc.replace(/timestamp: number/g, "")),
    "Builder has no branching",
  );

  assertCase(
    block,
    "sole.collectorUsesBuilder",
    /RuntimeTelemetryBuilder\.create\(/.test(collectorSrc),
    "Collector.build uses Builder.create",
  );

  assertCase(
    block,
    "sole.noOtherFactories",
    !/\bcreateRuntimeTelemetrySnapshot\b/.test(
      builderSrc + collectorSrc + reporterSrc + typesSrc,
    ),
    "no alternate telemetry snapshot factories",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 9 — collectorApi                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "collectorApi";
  const collectorSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryCollector.ts`),
  );

  assertCase(
    block,
    "api.class",
    /export class RuntimeTelemetryCollector/.test(collectorSrc),
    "Collector is an instance class",
  );

  assertCase(
    block,
    "api.methods",
    typeof RuntimeTelemetryCollector.prototype.record === "function" &&
      typeof RuntimeTelemetryCollector.prototype.build === "function" &&
      typeof RuntimeTelemetryCollector.prototype.reset === "function",
    "Collector API = record / build / reset",
  );

  assertCase(
    block,
    "api.atomicRecord",
    /record\([\s\S]*?this\.runtime\s*=\s*runtime[\s\S]*?this\.metrics\s*=\s*metrics[\s\S]*?this\.health\s*=\s*health/.test(
      collectorSrc,
    ),
    "record atomically assigns all three refs",
  );

  assertCase(
    block,
    "api.fieldsStartNull",
    /private runtime[\s\S]*?=\s*null/.test(collectorSrc) &&
      /private metrics[\s\S]*?=\s*null/.test(collectorSrc) &&
      /private health[\s\S]*?=\s*null/.test(collectorSrc),
    "private fields initially null",
  );

  const { runtime, metrics, health } = fixtures();
  const collector = new RuntimeTelemetryCollector();
  collector.record(runtime, metrics, health);
  const snap = collector.build();

  assertCase(
    block,
    "api.recordThenBuild",
    Object.isFrozen(snap) &&
      Object.is(snap.runtime, runtime) &&
      Object.is(snap.metrics, metrics) &&
      Object.is(snap.health, health),
    "record → build produces frozen shared-ref snapshot",
  );

  collector.reset();
  let threwAfterReset = false;
  try {
    collector.build();
  } catch {
    threwAfterReset = true;
  }
  assertCase(
    block,
    "api.resetClears",
    threwAfterReset,
    "reset() clears refs; subsequent build throws",
  );

  // Atomic overwrite — second record replaces all three
  const runtime2 = makeSnapshot({ fingerprint: "fp-2" });
  const metrics2 = emptyMetrics({ resolutions: 99 });
  const health2 = makeHealth(metrics2, { fingerprint: "fp-2" });
  collector.record(runtime, metrics, health);
  collector.record(runtime2, metrics2, health2);
  const after = collector.build();
  assertCase(
    block,
    "api.atomicOverwrite",
    Object.is(after.runtime, runtime2) &&
      Object.is(after.metrics, metrics2) &&
      Object.is(after.health, health2) &&
      !Object.is(after.runtime, runtime),
    "second record fully overwrites all three refs",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — reporterDelegates                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterDelegates";
  const reporterSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryReporter.ts`),
  );

  assertCase(
    block,
    "reporter.onlyBuild",
    /export const RuntimeTelemetryReporter = Object\.freeze\(\{\s*build/.test(
      reporterSrc.replace(/\s+/g, " "),
    ) &&
      Object.keys(RuntimeTelemetryReporter).length === 1 &&
      "build" in RuntimeTelemetryReporter,
    "Reporter exposes build only",
  );

  assertCase(
    block,
    "reporter.delegatesOnly",
    /return collector\.build\(/.test(reporterSrc),
    "build returns collector.build() directly",
  );

  assertCase(
    block,
    "reporter.noModuleState",
    !/\blet\b|\bvar\b/.test(reporterSrc) &&
      !/\bMap\b|\bSet\b|\bWeakMap\b/.test(reporterSrc) &&
      !/\bcache\b|\bstate\b/.test(reporterSrc),
    "no mutable module state in Reporter",
  );

  const { runtime, metrics, health } = fixtures();
  const collector = new RuntimeTelemetryCollector();
  collector.record(runtime, metrics, health);
  const viaCollector = collector.build();
  const viaReporter = RuntimeTelemetryReporter.build(collector);
  assertCase(
    block,
    "reporter.sharedRefsMatch",
    Object.is(viaReporter.runtime, viaCollector.runtime) &&
      Object.is(viaReporter.metrics, viaCollector.metrics) &&
      Object.is(viaReporter.health, viaCollector.health),
    "Reporter.build shares same nested refs as Collector.build",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — buildThrowsBeforeRecord                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "buildThrowsBeforeRecord";
  const collector = new RuntimeTelemetryCollector();
  let message = "";
  let threw = false;
  try {
    collector.build();
  } catch (e) {
    threw = true;
    message = e instanceof Error ? e.message : String(e);
  }
  assertCase(
    block,
    "throws.beforeRecord",
    threw &&
      message === "RuntimeTelemetryCollector has no recorded runtime.",
    threw
      ? `message=${JSON.stringify(message)}`
      : "build() did not throw before record",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — doubleBuild                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "doubleBuild";
  const { runtime, metrics, health } = fixtures();
  const collector = new RuntimeTelemetryCollector();
  collector.record(runtime, metrics, health);
  const a = collector.build();
  const b = collector.build();

  assertCase(block, "double.notSameInstance", a !== b, "a !== b");
  assertCase(
    block,
    "double.sharedRuntime",
    a.runtime === b.runtime,
    "a.runtime === b.runtime",
  );
  assertCase(
    block,
    "double.sharedMetrics",
    a.metrics === b.metrics,
    "a.metrics === b.metrics",
  );
  assertCase(
    block,
    "double.sharedHealth",
    a.health === b.health,
    "a.health === b.health",
  );
  assertCase(
    block,
    "double.timestampMonotonic",
    a.timestamp <= b.timestamp,
    `a.timestamp=${a.timestamp} b.timestamp=${b.timestamp}`,
  );
  assertCase(
    block,
    "double.doesNotClear",
    Object.is(a.runtime, runtime) && Object.is(b.runtime, runtime),
    "build does not clear stored refs",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — timestampInCollectorOnly                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "timestampInCollectorOnly";
  const builderSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryBuilder.ts`),
  );
  const collectorSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryCollector.ts`),
  );
  const reporterSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryReporter.ts`),
  );
  const typesSrc = stripComments(read(`${TEL_DIR}/TelemetryTypes.ts`));

  assertCase(
    block,
    "timestamp.collectorHasDateNow",
    /const timestamp = Date\.now\(\)/.test(collectorSrc) ||
      /Date\.now\(\)/.test(collectorSrc),
    "Collector computes Date.now()",
  );

  assertCase(
    block,
    "timestamp.builderNoDateNow",
    !/\bDate\.now\b/.test(builderSrc) && !/\bDate\b/.test(builderSrc),
    "Builder has no Date.now",
  );

  assertCase(
    block,
    "timestamp.reporterNoDateNow",
    !/\bDate\.now\b/.test(reporterSrc) && !/\bDate\b/.test(reporterSrc),
    "Reporter has no Date.now",
  );

  assertCase(
    block,
    "timestamp.typesNoDateNow",
    !/\bDate\.now\b/.test(typesSrc) && !/\bDate\b/.test(typesSrc),
    "TelemetryTypes has no Date.now",
  );

  const { runtime, metrics, health } = fixtures();
  const before = Date.now();
  const snap = RuntimeTelemetryBuilder.create(
    runtime,
    metrics,
    health,
    before,
  );
  assertCase(
    block,
    "timestamp.trustedPassthrough",
    snap.timestamp === before,
    "Builder passes timestamp through unchanged",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — noReactNoWiring                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReactNoWiring";
  const src = stripComments(readTelSources());
  // Allow Date only in Collector — strip Collector Date.now for ban scan of other concerns
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
    { id: "json", re: /\bJSON\b/ },
    {
      id: "storage",
      re: /\blocalStorage\b|\bIndexedDB\b|\bindexedDB\b/,
    },
    {
      id: "network",
      re: /\bfetch\b|\bXMLHttpRequest\b|\bWebSocket\b/,
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

  const files = readdirSync(join(repoRoot, TEL_DIR));
  assertCase(
    block,
    "noTsx",
    !files.some((f) => f.endsWith(".tsx")),
    "no .tsx in telemetry/",
  );

  const providerCandidates = [
    "src/ui/providers/theme-provider.tsx",
    "src/ui/providers/index.ts",
  ];
  for (const rel of providerCandidates) {
    if (!existsSync(join(repoRoot, rel))) {
      assertCase(block, `provider.absent.${rel}`, true, `${rel} absent (ok)`);
      continue;
    }
    const psrc = stripComments(read(rel));
    assertCase(
      block,
      `provider.noTelemetry.${rel}`,
      !/runtime\/telemetry/.test(psrc) &&
        !/theme\/runtime\/telemetry/.test(psrc),
      !/runtime\/telemetry/.test(psrc)
        ? `${rel} does not import telemetry`
        : `${rel} imports runtime/telemetry`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — noPublicBarrelLeaks                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noPublicBarrelLeaks";
  const barrels = [
    "src/ui/index.ts",
    "src/ui/theme/index.ts",
    "src/ui/theme/runtime/index.ts",
    "src/ui/theme/hooks/index.ts",
    "src/ui/providers/index.ts",
  ];

  for (const barrel of barrels) {
    if (!existsSync(join(repoRoot, barrel))) {
      assertCase(block, `leak.${barrel}`, true, `${barrel} absent (ok)`);
      continue;
    }
    const src = stripComments(read(barrel));
    const exportsTel =
      /from\s+["'][^"']*runtime\/telemetry[^"']*["']/.test(src) ||
      /runtime\/telemetry/.test(src);
    const exportsSym = [
      "RuntimeTelemetrySnapshot",
      "RuntimeTelemetryBuilder",
      "RuntimeTelemetryCollector",
      "RuntimeTelemetryReporter",
      "TelemetryTypes",
    ].some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    assertCase(
      block,
      `leak.noExport.${barrel}`,
      !exportsTel && !exportsSym,
      !exportsTel && !exportsSym
        ? `${barrel} does not export telemetry`
        : `${barrel} leaks telemetry`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  assertCase(
    block,
    "api.builderOnlyCreate",
    Object.keys(RuntimeTelemetryBuilder).length === 1 &&
      "create" in RuntimeTelemetryBuilder,
    "Builder API Freeze = create",
  );
  assertCase(
    block,
    "api.reporterOnlyBuild",
    Object.keys(RuntimeTelemetryReporter).length === 1 &&
      "build" in RuntimeTelemetryReporter,
    "Reporter API Freeze = build",
  );

  const proto = RuntimeTelemetryCollector.prototype;
  const ownMethods = Object.getOwnPropertyNames(proto).filter(
    (n) => n !== "constructor",
  );
  assertCase(
    block,
    "api.collectorMethods",
    ownMethods.length === 3 &&
      ownMethods.includes("record") &&
      ownMethods.includes("build") &&
      ownMethods.includes("reset"),
    `Collector methods=${ownMethods.join(",")}`,
  );

  // Unchanged sibling layers — telemetry must not import aggregation or mutate metrics
  const src = stripComments(readTelSources());
  assertCase(
    block,
    "api.noAggregationImport",
    !/aggregation/.test(src),
    "telemetry does not import aggregation",
  );
  assertCase(
    block,
    "api.noObserverImport",
    !/observer/.test(src) && !/RuntimeNotifier/.test(src),
    "telemetry does not import observer/notifier",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 17 — o1NoDeepCopies                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "o1NoDeepCopies";
  const src = stripComments(readTelSources());
  const collectorSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryCollector.ts`),
  );
  const builderSrc = stripComments(
    read(`${TEL_DIR}/RuntimeTelemetryBuilder.ts`),
  );

  assertCase(
    block,
    "collections.noWeakOrNew",
    !/\bnew\s+(Map|Set)\b/.test(src) &&
      !/\bWeakMap\b/.test(src) &&
      !/\bWeakSet\b/.test(src) &&
      !/\bMap\b|\bSet\b/.test(src),
    "no Map/Set/WeakMap/WeakSet",
  );

  assertCase(
    block,
    "noDeepCopy",
    !/\bstructuredClone\b/.test(src) &&
      !/\bJSON\.parse\b/.test(src) &&
      !/\bJSON\.stringify\b/.test(src) &&
      !/\.\.\./.test(builderSrc),
    "no deep copies / spreads in Builder",
  );

  assertCase(
    block,
    "record.noLoops",
    !/record\([\s\S]*?\bfor\b/.test(collectorSrc) &&
      !/record\([\s\S]*?\bwhile\b/.test(collectorSrc) &&
      !/record\([\s\S]*?\.forEach\b/.test(collectorSrc) &&
      !/record\([\s\S]*?\.map\b/.test(collectorSrc),
    "record() has no loops (O(1))",
  );

  assertCase(
    block,
    "noHistoryArrays",
    !/private\s+\w+\s*[:=]\s*\[/.test(collectorSrc) &&
      !/this\.\w+\s*=\s*\[/.test(collectorSrc) &&
      !/\.push\(/.test(collectorSrc),
    "Collector has no history arrays",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 18 — tscCompile                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tscCompile";
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

const BLOCKS: Array<{ id: BlockId; pass: number; ca: string }> = [
  { id: "telemetryLayout", pass: 1, ca: "CA-UX-3.14.layout" },
  { id: "snapshotImmutable", pass: 2, ca: "CA-UX-3.14.1" },
  { id: "sharedRuntimeRef", pass: 3, ca: "CA-UX-3.14.2" },
  { id: "sharedMetricsRef", pass: 4, ca: "CA-UX-3.14.2" },
  { id: "sharedHealthRef", pass: 5, ca: "CA-UX-3.14.2" },
  { id: "builderFrozen", pass: 6, ca: "CA-UX-3.14.3" },
  { id: "reporterFrozen", pass: 7, ca: "CA-UX-3.14.6" },
  { id: "builderSoleConstructor", pass: 8, ca: "CA-UX-3.14.3" },
  { id: "collectorApi", pass: 9, ca: "CA-UX-3.14.4" },
  { id: "reporterDelegates", pass: 10, ca: "CA-UX-3.14.6" },
  { id: "buildThrowsBeforeRecord", pass: 11, ca: "CA-UX-3.14.4" },
  { id: "doubleBuild", pass: 12, ca: "CA-UX-3.14.5" },
  { id: "timestampInCollectorOnly", pass: 13, ca: "CA-UX-3.14.3" },
  { id: "noReactNoWiring", pass: 14, ca: "CA-UX-3.14.8–9" },
  { id: "noPublicBarrelLeaks", pass: 15, ca: "CA-UX-3.14.10" },
  { id: "apiFreeze", pass: 16, ca: "CA-UX-3.14.10" },
  { id: "o1NoDeepCopies", pass: 17, ca: "CA-UX-3.14.perf" },
  { id: "tscCompile", pass: 18, ca: "CA-UX-3.14.11" },
];

let passCount = 0;
for (const { id: block, pass, ca } of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0 && blockResults.length > 0;
  if (ok) passCount += 1;
  const label = `PASS ${String(pass).padStart(2, "0")} ${block}`;
  const pad = ".".repeat(Math.max(1, 42 - label.length));
  console.log(`${label} ${pad} ${ok ? "PASS" : "FAIL"} (${ca})`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
  if (blockResults.length === 0) {
    console.log(`  FAIL (no cases)`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-3.14");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
