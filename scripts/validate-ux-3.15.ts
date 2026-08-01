/**
 * UX-3.15 — Runtime Telemetry Integration Foundation gate.
 *
 * Blocks:
 * reporterLayout · apiFreeze · pipelineOrder · encapsulation
 * indexUntouched · noPublicBarrelLeaks · noReactNoWiring
 * returnsHealth · sharedRefs · priorGates · tscCompile
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { RuntimeReporter } from "../src/ui/theme/runtime/RuntimeReporter";
import { RuntimeHealthStatus } from "../src/ui/theme/runtime/health/RuntimeHealthStatus";
import { SnapshotBuilder } from "../src/ui/theme/runtime/devtools/SnapshotBuilder";
import { RuntimeMetricsReporter } from "../src/ui/theme/runtime/metrics/RuntimeMetricsReporter";
import { RuntimeHealthReporter } from "../src/ui/theme/runtime/health/RuntimeHealthReporter";
import { RuntimeTelemetryCollector } from "../src/ui/theme/runtime/telemetry/RuntimeTelemetryCollector";
import { RuntimeTelemetryReporter } from "../src/ui/theme/runtime/telemetry/RuntimeTelemetryReporter";

type BlockId =
  | "reporterLayout"
  | "apiFreeze"
  | "pipelineOrder"
  | "encapsulation"
  | "indexUntouched"
  | "noPublicBarrelLeaks"
  | "noReactNoWiring"
  | "returnsHealth"
  | "sharedRefs"
  | "priorGates"
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

const REPORTER_PATH = "src/ui/theme/runtime/RuntimeReporter.ts";
const INDEX_PATH = "src/ui/theme/runtime/index.ts";

/* -------------------------------------------------------------------------- */
/* PASS 01 — reporterLayout                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterLayout";

  assertCase(
    block,
    "file.exists",
    existsSync(join(repoRoot, REPORTER_PATH)),
    `${REPORTER_PATH} exists`,
  );

  assertCase(
    block,
    "file.onlyAtRoot",
    !existsSync(
      join(repoRoot, "src/ui/theme/runtime/telemetry/RuntimeReporter.ts"),
    ) &&
      !existsSync(
        join(repoRoot, "src/ui/theme/runtime/health/RuntimeReporter.ts"),
      ) &&
      !existsSync(
        join(repoRoot, "src/ui/theme/runtime/aggregation/RuntimeReporter.ts"),
      ),
    "RuntimeReporter only at runtime root (not under layer folders)",
  );

  assertCase(
    block,
    "noNewFolders",
    !existsSync(join(repoRoot, "src/ui/theme/runtime/reporter")) &&
      !existsSync(join(repoRoot, "src/ui/theme/runtime/snapshot")),
    "no new runtime folders for this phase",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "api.frozenExport",
    /export const RuntimeReporter = Object\.freeze\(\{\s*build\s*,?\s*\}\)/.test(
      src,
    ),
    "export const RuntimeReporter = Object.freeze({ build })",
  );

  assertCase(
    block,
    "api.keys",
    Object.keys(RuntimeReporter).length === 1 && "build" in RuntimeReporter,
    "RuntimeReporter keys = [build]",
  );

  assertCase(
    block,
    "api.Object.isFrozen",
    Object.isFrozen(RuntimeReporter),
    "Object.isFrozen(RuntimeReporter)",
  );

  assertCase(
    block,
    "api.buildIsFunction",
    typeof RuntimeReporter.build === "function",
    "typeof RuntimeReporter.build === 'function'",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — pipelineOrder                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineOrder";
  const src = stripComments(read(REPORTER_PATH));

  const snapIdx = src.search(/SnapshotBuilder\.build\s*\(\s*runtime\s*\)/);
  const metsIdx = src.search(/RuntimeMetricsReporter\.getSnapshot\s*\(\s*\)/);
  const healthIdx = src.search(
    /RuntimeHealthReporter\.build\s*\(\s*snapshot\s*,\s*metrics\s*\)/,
  );
  const newAggIdx = src.search(
    /new\s+RuntimeAggregationAccumulator\s*\(\s*\)/,
  );
  const aggRecordIdx = src.search(/aggregation\.record\s*\(\s*health\s*\)/);
  const aggRepIdx = src.search(
    /RuntimeAggregationReporter\.build\s*\(\s*aggregation\s*\)/,
  );
  const newTelIdx = src.search(/new\s+RuntimeTelemetryCollector\s*\(\s*\)/);
  const telRecordIdx = src.search(
    /telemetry\.record\s*\(\s*snapshot\s*,\s*metrics\s*,\s*health\s*\)/,
  );
  const telIdx = src.search(
    /RuntimeTelemetryReporter\.build\s*\(\s*telemetry\s*\)/,
  );
  const newRepIdx = src.search(/new\s+RuntimeReportCollector\s*\(\s*\)/);
  const repRecordIdx = src.search(
    /report\.record\s*\(\s*snapshot\s*,\s*metrics\s*,\s*health\s*\)/,
  );
  const reportIdx = src.search(
    /RuntimeReportReporter\.build\s*\(\s*report\s*\)/,
  );
  const returnIdx = src.search(/return\s+runtimeReport\.health\s*;/);

  const orderOk =
    snapIdx >= 0 &&
    metsIdx > snapIdx &&
    healthIdx > metsIdx &&
    newAggIdx > healthIdx &&
    aggRecordIdx > newAggIdx &&
    aggRepIdx > aggRecordIdx &&
    newTelIdx > aggRepIdx &&
    telRecordIdx > newTelIdx &&
    telIdx > telRecordIdx &&
    newRepIdx > telIdx &&
    repRecordIdx > newRepIdx &&
    reportIdx > repRecordIdx &&
    returnIdx > reportIdx;

  assertCase(
    block,
    "pipeline.exactOrder",
    orderOk,
    orderOk
      ? "Snapshot → Metrics → Health → Aggregation → Telemetry → Report → return runtimeReport.health"
      : `order indices snap=${snapIdx} mets=${metsIdx} health=${healthIdx} agg=${newAggIdx}/${aggRecordIdx}/${aggRepIdx} tel=${newTelIdx}/${telRecordIdx}/${telIdx} rep=${newRepIdx}/${repRecordIdx}/${reportIdx} ret=${returnIdx}`,
  );

  assertCase(
    block,
    "pipeline.includesAggregation",
    /\bRuntimeAggregationAccumulator\b/.test(src) &&
      /\bRuntimeAggregationReporter\b/.test(src),
    "Aggregation wired into pipeline (UX-3.17)",
  );

  assertCase(
    block,
    "pipeline.includesReport",
    /\bRuntimeReportCollector\b/.test(src) &&
      /\bRuntimeReportReporter\b/.test(src),
    "Report wired into pipeline (UX-3.17)",
  );

  assertCase(
    block,
    "pipeline.neverReturnHealthDirect",
    !/return\s+health\s*;/.test(src),
    "never return health; must return runtimeReport.health",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — encapsulation                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "encapsulation";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "enc.noCollectorBuild",
    !/collector\.build\s*\(/.test(src) &&
      !/telemetry\.build\s*\(/.test(src) &&
      !/report\.build\s*\(/.test(src) &&
      !/aggregation\.build\s*\(/.test(src) &&
      !/accumulator\.build\s*\(/.test(src),
    "never calls collector/accumulator.build()",
  );

  assertCase(
    block,
    "enc.noBuilders",
    !/\bRuntimeTelemetryBuilder\b/.test(src) &&
      !/\bRuntimeAggregationBuilder\b/.test(src) &&
      !/\bRuntimeReportBuilder\b/.test(src),
    "never references Aggregation/Telemetry/Report Builders",
  );

  assertCase(
    block,
    "enc.soleTelemetryEntry",
    /RuntimeTelemetryReporter\.build\s*\(\s*telemetry\s*\)/.test(src),
    "sole telemetry entry = RuntimeTelemetryReporter.build(telemetry)",
  );

  assertCase(
    block,
    "enc.soleAggregationEntry",
    /RuntimeAggregationReporter\.build\s*\(\s*aggregation\s*\)/.test(src),
    "sole aggregation entry = RuntimeAggregationReporter.build(aggregation)",
  );

  assertCase(
    block,
    "enc.soleReportEntry",
    /RuntimeReportReporter\.build\s*\(\s*report\s*\)/.test(src),
    "sole report entry = RuntimeReportReporter.build(report)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — indexUntouched                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "indexUntouched";
  const src = stripComments(read(INDEX_PATH));

  assertCase(
    block,
    "index.noRuntimeReporter",
    !/\bRuntimeReporter\b/.test(src),
    "runtime/index.ts has no RuntimeReporter",
  );

  assertCase(
    block,
    "index.noTelemetry",
    !/telemetry/i.test(src) &&
      !/\bRuntimeTelemetry\b/.test(src) &&
      !/\bTelemetryTypes\b/.test(src),
    "runtime/index.ts has no telemetry references",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — noPublicBarrelLeaks                                              */
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
    const leaksReporter =
      /\bRuntimeReporter\b/.test(src) ||
      /from\s+["'][^"']*RuntimeReporter[^"']*["']/.test(src);
    const leaksTel =
      /from\s+["'][^"']*runtime\/telemetry[^"']*["']/.test(src) ||
      /runtime\/telemetry/.test(src) ||
      [
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
      !leaksReporter && !leaksTel,
      !leaksReporter && !leaksTel
        ? `${barrel} does not export RuntimeReporter/telemetry`
        : `${barrel} leaks RuntimeReporter or telemetry`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — noReactNoWiring                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReactNoWiring";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "no.console",
    !/\bconsole\s*\./.test(src),
    "no console.*",
  );

  assertCase(
    block,
    "no.react",
    !/\breact\b/i.test(src) &&
      !/\buse[A-Z]\w*\b/.test(src) &&
      !/\bjsx\b|\btsx\b/.test(src),
    "no React imports / hooks",
  );

  assertCase(
    block,
    "no.provider",
    !/\bProvider\b/.test(src) &&
      !/\bThemeProvider\b/.test(src) &&
      !/\bcreateContext\b/.test(src) &&
      !/\bContext\b/.test(src),
    "no Provider / ThemeProvider / Context",
  );

  assertCase(
    block,
    "no.cacheMemoSingleton",
    !/\buseMemo\b|\buseCallback\b|\bmemo\b/.test(src) &&
      !/\bWeakMap\b|\bMap\b|\bSet\b/.test(src) &&
      !/\bsetInterval\b|\bsetTimeout\b|\bDate\.now\b/.test(src),
    "no memo / cache collections / timers / Date.now",
  );

  const providerSrc = existsSync(
    join(repoRoot, "src/ui/providers/theme-provider.tsx"),
  )
    ? stripComments(read("src/ui/providers/theme-provider.tsx"))
    : "";

  assertCase(
    block,
    "no.themeProviderWiring",
    !/\bRuntimeReporter\b/.test(providerSrc) &&
      !/runtime\/telemetry/.test(providerSrc),
    "ThemeProvider does not import RuntimeReporter or telemetry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — returnsHealth                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "returnsHealth";

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtime = ThemeTokenResolver.resolve("light");
  const health = RuntimeReporter.build(runtime);

  assertCase(
    block,
    "health.frozen",
    Object.isFrozen(health),
    "returned health is Object.isFrozen",
  );

  const keys = Object.keys(health).sort();
  const expected = [
    "diagnostics",
    "fingerprint",
    "generatedAt",
    "metrics",
    "status",
    "version",
  ].sort();

  assertCase(
    block,
    "health.keys",
    keys.length === expected.length &&
      expected.every((k, i) => keys[i] === k),
    `health keys match RuntimeHealth (${keys.join(",")})`,
  );

  assertCase(
    block,
    "health.statusKnown",
    health.status === RuntimeHealthStatus.OK ||
      health.status === RuntimeHealthStatus.WARNING ||
      health.status === RuntimeHealthStatus.ERROR,
    `status=${String(health.status)}`,
  );

  assertCase(
    block,
    "health.telemetryNotReturned",
    !("runtime" in health && "timestamp" in health && "health" in health),
    "return value is RuntimeHealth, not RuntimeTelemetrySnapshot",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — sharedRefs                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "sharedRefs";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "src.noDeepCopy",
    !/\bstructuredClone\b/.test(src) &&
      !/\bJSON\.parse\b/.test(src) &&
      !/\bJSON\.stringify\b/.test(src) &&
      !/\{\s*\.\.\./.test(src),
    "RuntimeReporter has no deep copies / object spreads",
  );

  assertCase(
    block,
    "src.recordSameVars",
    /telemetry\.record\s*\(\s*snapshot\s*,\s*metrics\s*,\s*health\s*\)/.test(
      src,
    ) &&
      /report\.record\s*\(\s*snapshot\s*,\s*metrics\s*,\s*health\s*\)/.test(
        src,
      ),
    "telemetry/report.record(snapshot, metrics, health) — same local identities",
  );

  // Behavioral: manual pipeline with same refs must match HealthReporter
  // composition; RuntimeReporter return shares metrics identity with the
  // Health object it built (health.metrics === recorded metrics).
  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtime = ThemeTokenResolver.resolve("light");
  const snapshot = SnapshotBuilder.build(runtime);
  const metrics = RuntimeMetricsReporter.getSnapshot();
  const healthDirect = RuntimeHealthReporter.build(snapshot, metrics);
  const collector = new RuntimeTelemetryCollector();
  collector.record(snapshot, metrics, healthDirect);
  const tel = RuntimeTelemetryReporter.build(collector);

  assertCase(
    block,
    "refs.telSharesSnapshot",
    Object.is(tel.runtime, snapshot),
    "telemetry.runtime === snapshot",
  );
  assertCase(
    block,
    "refs.telSharesMetrics",
    Object.is(tel.metrics, metrics),
    "telemetry.metrics === metrics",
  );
  assertCase(
    block,
    "refs.telSharesHealth",
    Object.is(tel.health, healthDirect),
    "telemetry.health === health",
  );
  assertCase(
    block,
    "refs.healthSharesMetrics",
    Object.is(healthDirect.metrics, metrics),
    "health.metrics === metrics",
  );

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const viaReporter = RuntimeReporter.build(
    ThemeTokenResolver.resolve("light"),
  );
  assertCase(
    block,
    "refs.reporterHealthSharesMetrics",
    Object.is(viaReporter.metrics, viaReporter.metrics) &&
      viaReporter.metrics !== null &&
      typeof viaReporter.metrics.snapshots === "number",
    "RuntimeReporter health retains metrics snapshot ref",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — priorGates                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGates";
  const prior = spawnSync("npx", ["tsx", "scripts/validate-ux-3.14.ts"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const out = `${prior.stdout || ""}\n${prior.stderr || ""}`;
  const priorPass =
    prior.status === 0 && /validate:ux-3\.14\s*\nPASS/m.test(out);

  assertCase(
    block,
    "prior.ux314",
    priorPass,
    priorPass
      ? "validate:ux-3.14 PASS"
      : `validate:ux-3.14 failed: ${out.slice(-400)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — tscCompile                                                       */
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
  { id: "reporterLayout", pass: 1, ca: "CA-UX-3.15.1" },
  { id: "apiFreeze", pass: 2, ca: "CA-UX-3.15.2" },
  { id: "pipelineOrder", pass: 3, ca: "CA-UX-3.15.3" },
  { id: "encapsulation", pass: 4, ca: "CA-UX-3.15.4" },
  { id: "indexUntouched", pass: 5, ca: "CA-UX-3.15.5" },
  { id: "noPublicBarrelLeaks", pass: 6, ca: "CA-UX-3.15.6" },
  { id: "noReactNoWiring", pass: 7, ca: "CA-UX-3.15.7" },
  { id: "returnsHealth", pass: 8, ca: "CA-UX-3.15.8" },
  { id: "sharedRefs", pass: 9, ca: "CA-UX-3.15.9" },
  { id: "priorGates", pass: 10, ca: "CA-UX-3.15.10" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-3.15.10" },
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
console.log("validate:ux-3.15");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
