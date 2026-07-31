/**
 * UX-3.12 — Theme Runtime Health Integration Foundation gate.
 *
 * Blocks:
 * healthLayout · healthImmutable · builderSoleConstructor · integration
 * statusFromDiagnostics · reporterPure · noReact · noProviderWiring
 * apiFreeze · objectFreeze · o1NoDynamicStructures (incl. tsc)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { RuntimeDiagnosticEngine } from "../src/ui/theme/runtime/diagnostics";
import type { RuntimeSnapshot } from "../src/ui/theme/runtime/devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../src/ui/theme/runtime/metrics/RuntimeMetricsSnapshot";
import {
  RuntimeHealthBuilder,
  RuntimeHealthReporter,
  RuntimeHealthStatus,
} from "../src/ui/theme/runtime/health";

type BlockId =
  | "healthLayout"
  | "healthImmutable"
  | "builderSoleConstructor"
  | "integration"
  | "statusFromDiagnostics"
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

const HEALTH_DIR = "src/ui/theme/runtime/health";
const REQUIRED_FILES = [
  "RuntimeHealth.ts",
  "RuntimeHealthStatus.ts",
  "RuntimeHealthBuilder.ts",
  "RuntimeHealthReporter.ts",
  "index.ts",
] as const;

const EXPECTED_KEYS = [
  "fingerprint",
  "version",
  "diagnostics",
  "metrics",
  "status",
  "generatedAt",
] as const;

function readHealthSources(): string {
  return REQUIRED_FILES.map((f) => read(`${HEALTH_DIR}/${f}`)).join("\n");
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

function baseSnapshot(
  overrides: Partial<RuntimeSnapshot> = {},
): RuntimeSnapshot {
  return Object.freeze({
    fingerprint: "fp-ok",
    themeName: "light",
    version: "3.1.3",
    tokenCount: 10,
    colorCount: 2,
    typographyCount: 2,
    spacingCount: 2,
    radiusCount: 2,
    elevationCount: 2,
    ...overrides,
  });
}

function shapeWithoutGeneratedAt(health: {
  fingerprint: string;
  version: string;
  diagnostics: unknown;
  metrics: unknown;
  status: string;
}): string {
  return JSON.stringify({
    fingerprint: health.fingerprint,
    version: health.version,
    diagnostics: health.diagnostics,
    metrics: health.metrics,
    status: health.status,
  });
}

/* -------------------------------------------------------------------------- */
/* healthLayout                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "healthLayout";
  const dir = join(repoRoot, HEALTH_DIR);
  assertCase(
    block,
    "layout.dir",
    existsSync(dir),
    existsSync(dir) ? "health/ exists" : "health/ missing",
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

  const indexSrc = read(`${HEALTH_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported from @\/ui, theme\/index, runtime\/index, hooks\/index, or providers\/index/.test(
      indexSrc,
    ),
    "privacy comment matches prior private barrels",
  );

  const reexports = [
    "RuntimeHealth",
    "RuntimeHealthStatus",
    "RuntimeHealthBuilder",
    "RuntimeHealthReporter",
  ];
  for (const name of reexports) {
    assertCase(
      block,
      `layout.reexport.${name}`,
      indexSrc.includes(name),
      indexSrc.includes(name)
        ? `barrel mentions ${name}`
        : `barrel missing ${name}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* healthImmutable                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "healthImmutable";
  const snapshot = baseSnapshot();
  const metrics = emptyMetrics({ resolutions: 1, cacheHits: 1, snapshots: 1 });
  const snapBefore = JSON.stringify(snapshot);
  const metBefore = JSON.stringify(metrics);

  const health = RuntimeHealthBuilder.create(snapshot, metrics);

  assertCase(
    block,
    "immutable.frozen",
    Object.isFrozen(health),
    "RuntimeHealth instance Object.isFrozen",
  );

  const keys = Object.keys(health).sort();
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
    "immutable.inputsUnchanged",
    JSON.stringify(snapshot) === snapBefore &&
      JSON.stringify(metrics) === metBefore,
    "snapshot and metrics inputs unchanged after create",
  );

  assertCase(
    block,
    "immutable.generatedAtNumber",
    typeof health.generatedAt === "number" &&
      Number.isFinite(health.generatedAt),
    `generatedAt is finite number (${health.generatedAt})`,
  );
}

/* -------------------------------------------------------------------------- */
/* builderSoleConstructor                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "builderSoleConstructor";
  const builderSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthBuilder.ts`),
  );
  const reporterSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthReporter.ts`),
  );
  const allSrc = stripComments(readHealthSources());

  assertCase(
    block,
    "builder.createOnly",
    /function create\(/.test(builderSrc) &&
      /export const RuntimeHealthBuilder = Object\.freeze\(\{\s*create/.test(
        builderSrc.replace(/\s+/g, " "),
      ),
    "Builder exposes create only",
  );

  assertCase(
    block,
    "reporter.delegatesCreate",
    /RuntimeHealthBuilder\.create\(/.test(reporterSrc) &&
      !/Object\.freeze\(\s*\{[\s\S]*fingerprint/.test(reporterSrc),
    "Reporter delegates to Builder.create; no local construction",
  );

  assertCase(
    block,
    "noClasses",
    !/\bclass\b/.test(allSrc),
    "no classes in health/",
  );

  assertCase(
    block,
    "noExtraFactories",
    !/\bfunction\s+(make|from|of|newHealth|buildHealth)\b/.test(allSrc) &&
      (allSrc.match(/\bObject\.freeze\(\s*\{[\s\S]*?fingerprint/g) ?? [])
        .length <= 1,
    "no extra RuntimeHealth factories",
  );
}

/* -------------------------------------------------------------------------- */
/* integration                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "integration";
  const snapshot = baseSnapshot({
    fingerprint: "fp-integration",
    version: "3.1.3",
  });
  const metrics = emptyMetrics({
    resolutions: 2,
    cacheHits: 1,
    snapshots: 1,
  });

  const aggregate = RuntimeDiagnosticEngine.evaluate(snapshot, metrics);
  const health = RuntimeHealthBuilder.create(snapshot, metrics);
  const builderSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthBuilder.ts`),
  );

  assertCase(
    block,
    "integration.fingerprint",
    health.fingerprint === snapshot.fingerprint,
    `fingerprint=${health.fingerprint}`,
  );
  assertCase(
    block,
    "integration.version",
    health.version === snapshot.version,
    `version=${health.version}`,
  );
  assertCase(
    block,
    "integration.metricsIdentity",
    health.metrics === metrics,
    "health.metrics === metrics (same reference)",
  );
  assertCase(
    block,
    "integration.diagnosticsIdentity",
    /diagnostics:\s*aggregate\.diagnostics/.test(builderSrc) &&
      Object.isFrozen(health.diagnostics) &&
      JSON.stringify(health.diagnostics) ===
        JSON.stringify(aggregate.diagnostics),
    "diagnostics reuses aggregate.diagnostics ref (source) + content match",
  );
  assertCase(
    block,
    "integration.engineWired",
    health.status ===
      RuntimeHealthStatus.status(aggregate.errorCount, aggregate.warningCount),
    `status=${health.status} matches Status.status from engine counts`,
  );

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const run = spawnSync(npmCmd, ["run", "validate:ux-3.11"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const out = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
  const priorPass =
    run.status === 0 && /validate:ux-3\.11\s*\nPASS/m.test(out);
  assertCase(
    block,
    "integration.priorUx311",
    priorPass,
    priorPass
      ? "validate:ux-3.11 PASS"
      : `ux-3.11 failed: ${out.slice(-800)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* statusFromDiagnostics                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "statusFromDiagnostics";

  assertCase(
    block,
    "status.values",
    RuntimeHealthStatus.OK === "OK" &&
      RuntimeHealthStatus.WARNING === "WARNING" &&
      RuntimeHealthStatus.ERROR === "ERROR",
    "Status values OK|WARNING|ERROR",
  );

  assertCase(
    block,
    "status.error",
    RuntimeHealthStatus.status(1, 0) === RuntimeHealthStatus.ERROR &&
      RuntimeHealthStatus.status(2, 5) === RuntimeHealthStatus.ERROR,
    "errorCount > 0 → ERROR",
  );
  assertCase(
    block,
    "status.warning",
    RuntimeHealthStatus.status(0, 1) === RuntimeHealthStatus.WARNING,
    "warningCount > 0 (no errors) → WARNING",
  );
  assertCase(
    block,
    "status.ok",
    RuntimeHealthStatus.status(0, 0) === RuntimeHealthStatus.OK,
    "no errors/warnings → OK",
  );

  // INFO-only: OBSERVER_INACTIVE fires with fingerprintChanges>0 and notifications===0
  const infoSnap = baseSnapshot({ tokenCount: 10, themeName: "light" });
  const infoMetrics = emptyMetrics({
    fingerprintChanges: 1,
    observerNotifications: 0,
    resolutions: 1,
    cacheHits: 1,
    snapshots: 1,
  });
  const infoAgg = RuntimeDiagnosticEngine.evaluate(infoSnap, infoMetrics);
  const infoHealth = RuntimeHealthBuilder.create(infoSnap, infoMetrics);
  const hasInfo =
    infoAgg.diagnostics.some((d) => d.level === "INFO") &&
    infoAgg.errorCount === 0 &&
    infoAgg.warningCount === 0;
  assertCase(
    block,
    "status.infoOnlyOk",
    hasInfo && infoHealth.status === RuntimeHealthStatus.OK,
    hasInfo
      ? `INFO-only → OK (status=${infoHealth.status})`
      : `fixture did not yield INFO-only (errors=${infoAgg.errorCount} warnings=${infoAgg.warningCount} diags=${infoAgg.diagnostics.map((d) => d.code).join(",")})`,
  );

  // ERROR fixture
  const errHealth = RuntimeHealthBuilder.create(
    baseSnapshot({ tokenCount: 0, themeName: "light", fingerprint: "fp" }),
    emptyMetrics({ resolutions: 1, cacheHits: 1, snapshots: 1 }),
  );
  assertCase(
    block,
    "status.fixtureError",
    errHealth.status === RuntimeHealthStatus.ERROR,
    `EMPTY_REGISTRY → ${errHealth.status}`,
  );

  // WARNING fixture (RESOLUTION_MISS)
  const warnHealth = RuntimeHealthBuilder.create(
    baseSnapshot(),
    emptyMetrics({
      resolutions: 1,
      cacheHits: 1,
      cacheMisses: 1,
      snapshots: 1,
    }),
  );
  assertCase(
    block,
    "status.fixtureWarning",
    warnHealth.status === RuntimeHealthStatus.WARNING,
    `RESOLUTION_MISS → ${warnHealth.status}`,
  );

  const statusSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthStatus.ts`),
  );
  assertCase(
    block,
    "status.noEnum",
    !/\benum\b/.test(statusSrc),
    "no TypeScript enum",
  );
  assertCase(
    block,
    "status.noConfigurablePriority",
    !/priority|PRIORITY|configurable/.test(statusSrc),
    "no configurable priorities",
  );
}

/* -------------------------------------------------------------------------- */
/* reporterPure                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterPure";
  const reporterSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthReporter.ts`),
  );

  assertCase(
    block,
    "reporter.onlyBuild",
    /export const RuntimeHealthReporter = Object\.freeze\(\{\s*build/.test(
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

  const snapshot = baseSnapshot();
  const metrics = emptyMetrics({ resolutions: 1, cacheHits: 1, snapshots: 1 });
  const viaBuilder = RuntimeHealthBuilder.create(snapshot, metrics);
  const viaReporter = RuntimeHealthReporter.build(snapshot, metrics);

  assertCase(
    block,
    "reporter.shapeMatchesBuilder",
    shapeWithoutGeneratedAt(viaBuilder) ===
      shapeWithoutGeneratedAt(viaReporter),
    "build matches create shape (ignoring generatedAt metadata)",
  );

  assertCase(
    block,
    "reporter.delegatesOnly",
    /return RuntimeHealthBuilder\.create\(/.test(reporterSrc),
    "build returns Builder.create directly",
  );
}

/* -------------------------------------------------------------------------- */
/* noReact                                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const src = stripComments(readHealthSources());
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
  ] as const;
  for (const b of bans) {
    assertCase(
      block,
      b.id,
      !b.re.test(src),
      !b.re.test(src) ? `no ${b.id}` : `found ${b.id}`,
    );
  }
  const files = readdirSync(join(repoRoot, HEALTH_DIR));
  assertCase(
    block,
    "noTsx",
    !files.some((f) => f.endsWith(".tsx")),
    "no .tsx in health/",
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
      `provider.noHealth.${rel}`,
      !/runtime\/health/.test(src) && !/theme\/runtime\/health/.test(src),
      !/runtime\/health/.test(src)
        ? `${rel} does not import health`
        : `${rel} imports runtime/health`,
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
    const exportsHealth =
      /from\s+["'][^"']*runtime\/health[^"']*["']/.test(src) ||
      /runtime\/health/.test(src);
    const exportsSym = [
      "RuntimeHealthBuilder",
      "RuntimeHealthReporter",
      "RuntimeHealthStatus",
    ].some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    // Avoid false positive: diagnostics RuntimeHealth in comments already stripped;
    // still ban re-export of health composition symbols / health path.
    assertCase(
      block,
      `api.noExport.${barrel}`,
      !exportsHealth && !exportsSym,
      !exportsHealth && !exportsSym
        ? `${barrel} does not export health`
        : `${barrel} leaks health`,
    );
  }

  const builderSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthBuilder.ts`),
  );
  const reporterSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthReporter.ts`),
  );
  const statusSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthStatus.ts`),
  );

  assertCase(
    block,
    "api.builderOnlyCreate",
    Object.keys(RuntimeHealthBuilder).length === 1 &&
      "create" in RuntimeHealthBuilder &&
      !/\bfunction\s+(?!create\b)\w+/.test(builderSrc),
    "Builder API = create only",
  );
  assertCase(
    block,
    "api.reporterOnlyBuild",
    Object.keys(RuntimeHealthReporter).length === 1 &&
      "build" in RuntimeHealthReporter,
    "Reporter API = build only",
  );
  assertCase(
    block,
    "api.statusMethod",
    typeof RuntimeHealthStatus.status === "function" &&
      /function status\(/.test(statusSrc),
    "Status exposes status() method",
  );
}

/* -------------------------------------------------------------------------- */
/* objectFreeze                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "objectFreeze";
  const builderSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthBuilder.ts`),
  );
  const reporterSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthReporter.ts`),
  );
  const statusSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthStatus.ts`),
  );

  assertCase(
    block,
    "src.builderFreeze",
    /export const RuntimeHealthBuilder = Object\.freeze\(/.test(builderSrc),
    "Builder Object.freeze in source",
  );
  assertCase(
    block,
    "src.reporterFreeze",
    /export const RuntimeHealthReporter = Object\.freeze\(/.test(reporterSrc),
    "Reporter Object.freeze in source",
  );
  assertCase(
    block,
    "src.statusFreeze",
    /export const RuntimeHealthStatus = Object\.freeze\(/.test(statusSrc),
    "Status Object.freeze in source",
  );

  assertCase(
    block,
    "runtime.builderFrozen",
    Object.isFrozen(RuntimeHealthBuilder),
    "Object.isFrozen(RuntimeHealthBuilder)",
  );
  assertCase(
    block,
    "runtime.reporterFrozen",
    Object.isFrozen(RuntimeHealthReporter),
    "Object.isFrozen(RuntimeHealthReporter)",
  );
  assertCase(
    block,
    "runtime.statusFrozen",
    Object.isFrozen(RuntimeHealthStatus),
    "Object.isFrozen(RuntimeHealthStatus)",
  );

  const health = RuntimeHealthBuilder.create(
    baseSnapshot(),
    emptyMetrics({ resolutions: 1, cacheHits: 1, snapshots: 1 }),
  );
  assertCase(
    block,
    "runtime.healthFrozen",
    Object.isFrozen(health),
    "Object.isFrozen(health instance)",
  );
}

/* -------------------------------------------------------------------------- */
/* o1NoDynamicStructures                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "o1NoDynamicStructures";
  const src = stripComments(readHealthSources());
  const builderSrc = stripComments(
    read(`${HEALTH_DIR}/RuntimeHealthBuilder.ts`),
  );

  assertCase(
    block,
    "collections.noMap",
    !/\b(new\s+Map|WeakMap|new\s+Set|WeakSet|Map\b|Set\b)\b/.test(src) ||
      (!/\bnew\s+Map\b/.test(src) &&
        !/\bWeakMap\b/.test(src) &&
        !/\bnew\s+Set\b/.test(src) &&
        !/\bWeakSet\b/.test(src)),
    "no Map/Set/WeakMap/WeakSet",
  );
  // Stricter: ban constructor / Weak* identifiers used as collections
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
    "noDiagnosticsClone",
    !/\.diagnostics\s*\.\s*slice\b/.test(builderSrc) &&
      !/\.diagnostics\s*\.\s*map\b/.test(builderSrc) &&
      !/\[\s*\.\.\.\s*\w*\.?diagnostics/.test(builderSrc) &&
      !/Array\.from\s*\(\s*\w*\.?diagnostics/.test(builderSrc),
    "diagnostics array not cloned",
  );
  assertCase(
    block,
    "noMetricsClone",
    !/\{\s*\.\.\.\s*metrics/.test(builderSrc) &&
      !/Object\.assign\s*\([^)]*metrics/.test(builderSrc),
    "metrics reference not cloned",
  );
  assertCase(
    block,
    "reuseMetricsRef",
    /metrics,\s*$/m.test(builderSrc) ||
      /metrics,\n/.test(builderSrc) ||
      /\bmetrics\b/.test(builderSrc),
    "Builder references metrics field",
  );
  assertCase(
    block,
    "reuseDiagnosticsRef",
    /aggregate\.diagnostics/.test(builderSrc),
    "Builder uses aggregate.diagnostics reference",
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
  { id: "healthLayout", ca: "CA-UX-3.12.1" },
  { id: "healthImmutable", ca: "CA-UX-3.12.2" },
  { id: "builderSoleConstructor", ca: "CA-UX-3.12.3" },
  { id: "integration", ca: "CA-UX-3.12.4" },
  { id: "statusFromDiagnostics", ca: "CA-UX-3.12.5" },
  { id: "reporterPure", ca: "CA-UX-3.12.6" },
  { id: "noReact", ca: "CA-UX-3.12.7" },
  { id: "noProviderWiring", ca: "CA-UX-3.12.8" },
  { id: "apiFreeze", ca: "CA-UX-3.12.9" },
  { id: "objectFreeze", ca: "CA-UX-3.12.10" },
  { id: "o1NoDynamicStructures", ca: "CA-UX-3.12.11" },
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
console.log("validate:ux-3.12");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
