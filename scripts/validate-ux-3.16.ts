/**
 * UX-3.16 — Theme Runtime Report Snapshot Foundation gate.
 *
 * Blocks (14):
 * reportLayout · snapshotImmutable · sharedRuntimeRef · sharedMetricsRef
 * sharedHealthRef · builderFrozen · builderSoleConstructor · collectorApi
 * reporterDelegates · noReactNoWiring · noPublicBarrelLeaks · apiFreeze
 * o1NoDeepCopies · tscCompile
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
  RuntimeReportBuilder,
  RuntimeReportCollector,
  RuntimeReportReporter,
} from "../src/ui/theme/runtime/report";

type BlockId =
  | "reportLayout"
  | "snapshotImmutable"
  | "sharedRuntimeRef"
  | "sharedMetricsRef"
  | "sharedHealthRef"
  | "builderFrozen"
  | "builderSoleConstructor"
  | "collectorApi"
  | "reporterDelegates"
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

const REPORT_DIR = "src/ui/theme/runtime/report";
const REQUIRED_FILES = [
  "RuntimeReportTypes.ts",
  "RuntimeReportBuilder.ts",
  "RuntimeReportCollector.ts",
  "RuntimeReportReporter.ts",
  "index.ts",
] as const;

const EXPECTED_KEYS = ["runtime", "metrics", "health"] as const;

function readReportSources(): string {
  return REQUIRED_FILES.map((f) => read(`${REPORT_DIR}/${f}`)).join("\n");
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
    fingerprint: "fp-report",
    themeName: "light",
    version: "3.1.6",
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
    fingerprint: "fp-report",
    version: "3.1.6",
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
/* PASS 1 — reportLayout                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportLayout";
  const dir = join(repoRoot, REPORT_DIR);
  assertCase(
    block,
    "layout.dir",
    existsSync(dir),
    existsSync(dir) ? "report/ exists" : "report/ missing",
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

  assertCase(
    block,
    "layout.notReporterFolder",
    !existsSync(join(repoRoot, "src/ui/theme/runtime/reporter")) &&
      !existsSync(join(repoRoot, "src/ui/theme/runtime/reporting")) &&
      !existsSync(join(repoRoot, "src/ui/theme/runtime/snapshot")),
    "no reporter/reporting/snapshot folders",
  );

  const indexSrc = read(`${REPORT_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported from @\/ui, theme\/index, runtime\/index, hooks\/index, or providers\/index/.test(
      indexSrc,
    ),
    "privacy comment matches prior private barrels",
  );

  const mustExport = [
    "RuntimeReportSnapshot",
    "RuntimeReportBuilder",
    "RuntimeReportCollector",
    "RuntimeReportReporter",
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
    !/report/.test(runtimeIndex),
    "runtime/index.ts does not mention report",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 2 — snapshotImmutable                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotImmutable";
  const typeSrc = stripComments(read(`${REPORT_DIR}/RuntimeReportTypes.ts`));

  assertCase(
    block,
    "immutable.interface",
    /export interface RuntimeReportSnapshot/.test(typeSrc),
    "RuntimeReportSnapshot is an interface",
  );

  assertCase(
    block,
    "immutable.threeFields",
    /readonly runtime/.test(typeSrc) &&
      /readonly metrics/.test(typeSrc) &&
      /readonly health/.test(typeSrc) &&
      !/\btimestamp\b/.test(typeSrc),
    "exactly three readonly fields; no timestamp",
  );

  const { runtime, metrics, health } = fixtures();
  const snap = RuntimeReportBuilder.create(runtime, metrics, health);

  assertCase(
    block,
    "immutable.frozen",
    Object.isFrozen(snap) === true,
    "RuntimeReportBuilder.create(...) returns Object.isFrozen(snapshot) === true",
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
    "immutable.threeFieldsOnly",
    EXPECTED_KEYS.every((k) => k in snap) && Object.keys(snap).length === 3,
    "exactly three fields",
  );

  const a = RuntimeReportBuilder.create(runtime, metrics, health);
  const b = RuntimeReportBuilder.create(runtime, metrics, health);
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
  const snap = RuntimeReportBuilder.create(runtime, metrics, health);
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
  const snap = RuntimeReportBuilder.create(runtime, metrics, health);
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
  const snap = RuntimeReportBuilder.create(runtime, metrics, health);
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
    read(`${REPORT_DIR}/RuntimeReportBuilder.ts`),
  );

  assertCase(
    block,
    "src.builderFreeze",
    /export const RuntimeReportBuilder = Object\.freeze\(/.test(builderSrc),
    "Builder Object.freeze in source",
  );
  assertCase(
    block,
    "src.instanceFreeze",
    /return Object\.freeze\(result\)/.test(builderSrc),
    "Builder freezes ReportSnapshot instance",
  );
  assertCase(
    block,
    "runtime.builderFrozen",
    Object.isFrozen(RuntimeReportBuilder),
    "Object.isFrozen(RuntimeReportBuilder)",
  );
  assertCase(
    block,
    "runtime.reporterFrozen",
    Object.isFrozen(RuntimeReportReporter),
    "Object.isFrozen(RuntimeReportReporter)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 7 — builderSoleConstructor                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderSoleConstructor";
  const builderSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportBuilder.ts`),
  );
  const collectorSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportCollector.ts`),
  );
  const reporterSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportReporter.ts`),
  );
  const typesSrc = stripComments(read(`${REPORT_DIR}/RuntimeReportTypes.ts`));

  assertCase(
    block,
    "builder.onlyCreate",
    /export const RuntimeReportBuilder = Object\.freeze\(\{\s*create/.test(
      builderSrc.replace(/\s+/g, " "),
    ) &&
      Object.keys(RuntimeReportBuilder).length === 1 &&
      "create" in RuntimeReportBuilder,
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
    "builder.noBranching",
    !/\bif\b|\bswitch\b|\b\?\./.test(builderSrc),
    "Builder has no branching",
  );

  assertCase(
    block,
    "sole.collectorUsesBuilder",
    /RuntimeReportBuilder\.create\(/.test(collectorSrc),
    "Collector.build uses Builder.create",
  );

  assertCase(
    block,
    "sole.noOtherFactories",
    !/\bcreateRuntimeReportSnapshot\b/.test(
      builderSrc + collectorSrc + reporterSrc + typesSrc,
    ),
    "no alternate report snapshot factories",
  );

  assertCase(
    block,
    "sole.noTimestampAnywhere",
    !/\btimestamp\b/.test(builderSrc + collectorSrc + reporterSrc + typesSrc),
    "no timestamp in report layer",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 8 — collectorApi                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "collectorApi";
  const collectorSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportCollector.ts`),
  );

  assertCase(
    block,
    "api.class",
    /export class RuntimeReportCollector/.test(collectorSrc),
    "Collector is an instance class",
  );

  assertCase(
    block,
    "api.methods",
    typeof RuntimeReportCollector.prototype.record === "function" &&
      typeof RuntimeReportCollector.prototype.build === "function" &&
      typeof RuntimeReportCollector.prototype.reset === "function",
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

  // Throw before record
  {
    const collector = new RuntimeReportCollector();
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
      "api.throwBeforeRecord",
      threw &&
        message === "RuntimeReportCollector has no recorded runtime.",
      threw
        ? `message=${JSON.stringify(message)}`
        : "build() did not throw before record",
    );
  }

  const { runtime, metrics, health } = fixtures();
  const collector = new RuntimeReportCollector();
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

  // build does not clear state — double build
  const snap2 = collector.build();
  assertCase(
    block,
    "api.buildDoesNotClear",
    snap !== snap2 &&
      Object.is(snap2.runtime, runtime) &&
      Object.is(snap2.metrics, metrics) &&
      Object.is(snap2.health, health),
    "build does not clear state; second build shares nested refs",
  );

  collector.reset();
  let threwAfterReset = false;
  let resetMessage = "";
  try {
    collector.build();
  } catch (e) {
    threwAfterReset = true;
    resetMessage = e instanceof Error ? e.message : String(e);
  }
  assertCase(
    block,
    "api.throwAfterReset",
    threwAfterReset &&
      resetMessage === "RuntimeReportCollector has no recorded runtime.",
    threwAfterReset
      ? `message=${JSON.stringify(resetMessage)}`
      : "reset() did not clear; subsequent build did not throw",
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
/* PASS 9 — reporterDelegates                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterDelegates";
  const reporterSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportReporter.ts`),
  );

  assertCase(
    block,
    "reporter.onlyBuild",
    /export const RuntimeReportReporter = Object\.freeze\(\{\s*build/.test(
      reporterSrc.replace(/\s+/g, " "),
    ) &&
      Object.keys(RuntimeReportReporter).length === 1 &&
      "build" in RuntimeReportReporter,
    "Reporter exposes build only",
  );

  assertCase(
    block,
    "reporter.delegatesOnly",
    /return collector\.build\(\);/.test(reporterSrc),
    "implementation is only return collector.build();",
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
  const collector = new RuntimeReportCollector();
  collector.record(runtime, metrics, health);
  const viaCollector = collector.build();
  const viaReporter = RuntimeReportReporter.build(collector);
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
/* PASS 10 — noReactNoWiring                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReactNoWiring";
  const src = stripComments(readReportSources());
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
    { id: "date", re: /\bDate\b/ },
  ] as const;
  for (const b of bans) {
    assertCase(
      block,
      b.id,
      !b.re.test(src),
      !b.re.test(src) ? `no ${b.id}` : `found ${b.id}`,
    );
  }

  const files = readdirSync(join(repoRoot, REPORT_DIR));
  assertCase(
    block,
    "noTsx",
    !files.some((f) => f.endsWith(".tsx")),
    "no .tsx in report/",
  );

  const reporterOrchestrator = stripComments(
    read("src/ui/theme/runtime/pipeline/RuntimePipeline.ts"),
  );
  const reporterFacade = stripComments(
    read("src/ui/theme/runtime/RuntimeReporter.ts"),
  );
  assertCase(
    block,
    "runtimeReporterUsesReport",
    (/from\s+["']\.\.\/report\/RuntimeReportCollector["']/.test(
      reporterOrchestrator,
    ) ||
      /from\s+["']\.\.\/report["']/.test(reporterOrchestrator)) &&
      (/from\s+["']\.\.\/report\/RuntimeReportReporter["']/.test(
        reporterOrchestrator,
      ) ||
        /from\s+["']\.\.\/report["']/.test(reporterOrchestrator)) &&
      /\bRuntimeReportCollector\b/.test(reporterOrchestrator) &&
      /RuntimeReportReporter\.build\s*\(/.test(reporterOrchestrator) &&
      /return\s+runtimeReport\s*;/.test(reporterOrchestrator) &&
      !/return\s+runtimeReport\.health\s*;/.test(reporterOrchestrator) &&
      !/\bRuntimeReportBuilder\b/.test(reporterOrchestrator) &&
      /\bRuntimeReportSnapshot\b/.test(reporterFacade) &&
      /RuntimePipeline\.run/.test(reporterFacade) &&
      /return\s+report\s*;/.test(reporterFacade) &&
      !/return\s+report\.health\s*;/.test(reporterFacade) &&
      !/report\.build\s*\(/.test(reporterOrchestrator),
    "RuntimePipeline returns RuntimeReportSnapshot via RuntimeReportReporter; RuntimeReporter delegates (UX-3.19)",
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
      `provider.noReport.${rel}`,
      !/runtime\/report/.test(psrc) &&
        !/theme\/runtime\/report/.test(psrc),
      !/runtime\/report/.test(psrc)
        ? `${rel} does not import report`
        : `${rel} imports runtime/report`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — noPublicBarrelLeaks                                              */
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
    const exportsReport =
      /from\s+["'][^"']*runtime\/report[^"']*["']/.test(src) ||
      /runtime\/report/.test(src);
    const exportsSym = [
      "RuntimeReportSnapshot",
      "RuntimeReportBuilder",
      "RuntimeReportCollector",
      "RuntimeReportReporter",
      "RuntimeReportTypes",
    ].some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    assertCase(
      block,
      `leak.noExport.${barrel}`,
      !exportsReport && !exportsSym,
      !exportsReport && !exportsSym
        ? `${barrel} does not export report`
        : `${barrel} leaks report`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  assertCase(
    block,
    "api.builderOnlyCreate",
    Object.keys(RuntimeReportBuilder).length === 1 &&
      "create" in RuntimeReportBuilder,
    "Builder API Freeze = create",
  );
  assertCase(
    block,
    "api.reporterOnlyBuild",
    Object.keys(RuntimeReportReporter).length === 1 &&
      "build" in RuntimeReportReporter,
    "Reporter API Freeze = build",
  );

  const proto = RuntimeReportCollector.prototype;
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

  const src = stripComments(readReportSources());
  assertCase(
    block,
    "api.noAggregationImport",
    !/aggregation/.test(src),
    "report does not import aggregation",
  );
  assertCase(
    block,
    "api.noObserverImport",
    !/observer/.test(src) && !/RuntimeNotifier/.test(src),
    "report does not import observer/notifier",
  );
  assertCase(
    block,
    "api.noTelemetryImport",
    !/telemetry/.test(src),
    "report does not import telemetry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — o1NoDeepCopies                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "o1NoDeepCopies";
  const src = stripComments(readReportSources());
  const collectorSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportCollector.ts`),
  );
  const builderSrc = stripComments(
    read(`${REPORT_DIR}/RuntimeReportBuilder.ts`),
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
/* PASS 14 — tscCompile                                                       */
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
  { id: "reportLayout", pass: 1, ca: "CA-UX-3.16.layout" },
  { id: "snapshotImmutable", pass: 2, ca: "CA-UX-3.16.1" },
  { id: "sharedRuntimeRef", pass: 3, ca: "CA-UX-3.16.2" },
  { id: "sharedMetricsRef", pass: 4, ca: "CA-UX-3.16.2" },
  { id: "sharedHealthRef", pass: 5, ca: "CA-UX-3.16.2" },
  { id: "builderFrozen", pass: 6, ca: "CA-UX-3.16.3" },
  { id: "builderSoleConstructor", pass: 7, ca: "CA-UX-3.16.3" },
  { id: "collectorApi", pass: 8, ca: "CA-UX-3.16.4" },
  { id: "reporterDelegates", pass: 9, ca: "CA-UX-3.16.5" },
  { id: "noReactNoWiring", pass: 10, ca: "CA-UX-3.16.6" },
  { id: "noPublicBarrelLeaks", pass: 11, ca: "CA-UX-3.16.7" },
  { id: "apiFreeze", pass: 12, ca: "CA-UX-3.16.7" },
  { id: "o1NoDeepCopies", pass: 13, ca: "CA-UX-3.16.perf" },
  { id: "tscCompile", pass: 14, ca: "CA-UX-3.16.8" },
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
console.log("validate:ux-3.16");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
