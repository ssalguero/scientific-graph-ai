/**
 * UX-3.17 — Runtime Diagnostics Integration Foundation gate.
 *
 * Blocks:
 * pipelineOrder · usesReportReporter · encapsulation · healthFromReport
 * deterministic · apiFreeze · noPublicBarrelLeaks · noReactNoWiring
 * priorGates · tscCompile
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
import { RuntimeReportCollector } from "../src/ui/theme/runtime/report/RuntimeReportCollector";
import { RuntimeReportReporter } from "../src/ui/theme/runtime/report/RuntimeReportReporter";

type BlockId =
  | "pipelineOrder"
  | "usesReportReporter"
  | "encapsulation"
  | "healthFromReport"
  | "deterministic"
  | "apiFreeze"
  | "noPublicBarrelLeaks"
  | "noReactNoWiring"
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
const PROVIDER_PATH = "src/ui/providers/theme-provider.tsx";

/* -------------------------------------------------------------------------- */
/* PASS 01 — pipelineOrder                                                    */
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
    "pipeline.neverReturnHealthDirect",
    !/return\s+health\s*;/.test(src),
    "never return health",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — usesReportReporter                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "usesReportReporter";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "imports.reportCollector",
    /from\s+["']\.\/report\/RuntimeReportCollector["']/.test(src) ||
      /from\s+["']\.\/report["']/.test(src),
    "imports RuntimeReportCollector",
  );

  assertCase(
    block,
    "imports.reportReporter",
    /from\s+["']\.\/report\/RuntimeReportReporter["']/.test(src) ||
      /from\s+["']\.\/report["']/.test(src),
    "imports RuntimeReportReporter",
  );

  assertCase(
    block,
    "calls.reportReporterBuild",
    /RuntimeReportReporter\.build\s*\(\s*report\s*\)/.test(src),
    "RuntimeReportReporter.build(report)",
  );

  assertCase(
    block,
    "assigns.runtimeReport",
    /const\s+runtimeReport\s*=\s*RuntimeReportReporter\.build\s*\(\s*report\s*\)/.test(
      src,
    ),
    "const runtimeReport = RuntimeReportReporter.build(report)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — encapsulation                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "encapsulation";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "enc.noBuilders",
    !/\bRuntimeAggregationBuilder\b/.test(src) &&
      !/\bRuntimeTelemetryBuilder\b/.test(src) &&
      !/\bRuntimeReportBuilder\b/.test(src),
    "no Aggregation/Telemetry/Report Builder imports",
  );

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
    "enc.soleAggregationEntry",
    /RuntimeAggregationReporter\.build\s*\(\s*aggregation\s*\)/.test(src),
    "sole aggregation entry = RuntimeAggregationReporter.build(aggregation)",
  );

  assertCase(
    block,
    "enc.soleTelemetryEntry",
    /RuntimeTelemetryReporter\.build\s*\(\s*telemetry\s*\)/.test(src),
    "sole telemetry entry = RuntimeTelemetryReporter.build(telemetry)",
  );

  assertCase(
    block,
    "enc.soleReportEntry",
    /RuntimeReportReporter\.build\s*\(\s*report\s*\)/.test(src),
    "sole report entry = RuntimeReportReporter.build(report)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — healthFromReport                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "healthFromReport";

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtime = ThemeTokenResolver.resolve("light");
  const snapshot = SnapshotBuilder.build(runtime);
  const metrics = RuntimeMetricsReporter.getSnapshot();
  const healthDirect = RuntimeHealthReporter.build(snapshot, metrics);
  const reportCollector = new RuntimeReportCollector();
  reportCollector.record(snapshot, metrics, healthDirect);
  const reportSnap = RuntimeReportReporter.build(reportCollector);

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const viaReporter = RuntimeReporter.build(
    ThemeTokenResolver.resolve("light"),
  );

  assertCase(
    block,
    "health.frozen",
    Object.isFrozen(viaReporter),
    "returned health is Object.isFrozen",
  );

  const keys = Object.keys(viaReporter).sort();
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
    viaReporter.status === RuntimeHealthStatus.OK ||
      viaReporter.status === RuntimeHealthStatus.WARNING ||
      viaReporter.status === RuntimeHealthStatus.ERROR,
    `status=${String(viaReporter.status)}`,
  );

  assertCase(
    block,
    "health.notTelemetryShape",
    !(
      "runtime" in viaReporter &&
      "timestamp" in viaReporter &&
      "health" in viaReporter
    ),
    "return value is RuntimeHealth, not RuntimeTelemetrySnapshot",
  );

  assertCase(
    block,
    "health.notReportShape",
    !(
      "runtime" in viaReporter &&
      "metrics" in viaReporter &&
      "health" in viaReporter &&
      !("status" in viaReporter)
    ),
    "return value is RuntimeHealth, not RuntimeReportSnapshot",
  );

  assertCase(
    block,
    "report.healthIdentity",
    Object.is(reportSnap.health, healthDirect),
    "report.health shares recorded health identity",
  );

  assertCase(
    block,
    "viaReporter.hasStatus",
    typeof viaReporter.status === "string",
    "RuntimeReporter returns RuntimeHealth with status",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — deterministic                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "deterministic";
  const src = stripComments(read(REPORTER_PATH));

  const bans: Array<{ id: string; re: RegExp }> = [
    { id: "Date.now", re: /\bDate\.now\b/ },
    { id: "performance.now", re: /\bperformance\.now\b/ },
    { id: "Math.random", re: /\bMath\.random\b/ },
    {
      id: "timers",
      re: /\bsetTimeout\b|\bsetInterval\b|\brequestAnimationFrame\b/,
    },
    { id: "console", re: /\bconsole\s*\./ },
    { id: "Map", re: /\bMap\b/ },
    { id: "WeakMap", re: /\bWeakMap\b/ },
    { id: "Set", re: /\bSet\b/ },
    { id: "memo", re: /\buseMemo\b|\buseCallback\b|\bmemo\b/ },
    { id: "moduleLet", re: /^let\s+/m },
    { id: "moduleVar", re: /^var\s+/m },
  ];

  for (const b of bans) {
    assertCase(
      block,
      `ban.${b.id}`,
      !b.re.test(src),
      !b.re.test(src) ? `no ${b.id}` : `found ${b.id}`,
    );
  }

  assertCase(
    block,
    "locals.perBuild",
    /new\s+RuntimeAggregationAccumulator\s*\(\s*\)/.test(src) &&
      /new\s+RuntimeTelemetryCollector\s*\(\s*\)/.test(src) &&
      /new\s+RuntimeReportCollector\s*\(\s*\)/.test(src),
    "collectors/accumulator instantiated inside build()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiFreeze                                                        */
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

  assertCase(
    block,
    "file.exists",
    existsSync(join(repoRoot, REPORTER_PATH)),
    `${REPORTER_PATH} exists`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — noPublicBarrelLeaks                                              */
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

  const leakIdents = [
    "RuntimeReporter",
    "RuntimeReportSnapshot",
    "RuntimeReportBuilder",
    "RuntimeReportCollector",
    "RuntimeReportReporter",
    "RuntimeAggregation",
    "RuntimeAggregationAccumulator",
    "RuntimeAggregationReporter",
    "RuntimeTelemetrySnapshot",
    "RuntimeTelemetryBuilder",
    "RuntimeTelemetryCollector",
    "RuntimeTelemetryReporter",
  ];

  for (const barrel of barrels) {
    if (!existsSync(join(repoRoot, barrel))) {
      assertCase(block, `leak.${barrel}`, true, `${barrel} absent (ok)`);
      continue;
    }
    const src = stripComments(read(barrel));
    const leaks = leakIdents.some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    const pathLeak =
      /runtime\/(aggregation|telemetry|report)/.test(src) ||
      /RuntimeReporter/.test(src);

    assertCase(
      block,
      `leak.noExport.${barrel}`,
      !leaks && !(barrel !== INDEX_PATH && pathLeak && /\bRuntimeReporter\b/.test(src)),
      !leaks
        ? `${barrel} does not export diagnostics pipeline`
        : `${barrel} leaks diagnostics symbols`,
    );
  }

  const indexSrc = stripComments(read(INDEX_PATH));
  assertCase(
    block,
    "index.noPipeline",
    !/\bRuntimeReporter\b/.test(indexSrc) &&
      !/aggregation/i.test(indexSrc) &&
      !/telemetry/i.test(indexSrc) &&
      !/report/i.test(indexSrc),
    "runtime/index.ts has no RuntimeReporter / aggregation / telemetry / report",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noReactNoWiring                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReactNoWiring";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "no.react",
    !/\bfrom\s+["']react["']/.test(src) &&
      !/\breact\b/i.test(src) &&
      !/\buse[A-Z]\w*\b/.test(src),
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

  const providerSrc = existsSync(join(repoRoot, PROVIDER_PATH))
    ? stripComments(read(PROVIDER_PATH))
    : "";

  assertCase(
    block,
    "no.themeProviderWiring",
    !/\bRuntimeReporter\b/.test(providerSrc) &&
      !/runtime\/report/.test(providerSrc) &&
      !/runtime\/aggregation/.test(providerSrc) &&
      !/runtime\/telemetry/.test(providerSrc),
    "ThemeProvider does not import RuntimeReporter / report / aggregation / telemetry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — priorGates                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGates";
  const priors = [
    { id: "ux313", script: "scripts/validate-ux-3.13.ts", label: "ux-3.13" },
    { id: "ux314", script: "scripts/validate-ux-3.14.ts", label: "ux-3.14" },
    { id: "ux315", script: "scripts/validate-ux-3.15.ts", label: "ux-3.15" },
    { id: "ux316", script: "scripts/validate-ux-3.16.ts", label: "ux-3.16" },
  ] as const;

  for (const p of priors) {
    const prior = spawnSync("npx", ["tsx", p.script], {
      cwd: repoRoot,
      stdio: "pipe",
      shell: true,
      encoding: "utf8",
    });
    const out = `${prior.stdout || ""}\n${prior.stderr || ""}`;
    const priorPass =
      prior.status === 0 &&
      new RegExp(`validate:${p.label}\\s*\\nPASS`, "m").test(out);

    assertCase(
      block,
      `prior.${p.id}`,
      priorPass,
      priorPass
        ? `validate:${p.label} PASS`
        : `validate:${p.label} failed: ${out.slice(-500)}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — tscCompile                                                       */
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
  { id: "pipelineOrder", pass: 1, ca: "CA-UX-3.17.1" },
  { id: "usesReportReporter", pass: 2, ca: "CA-UX-3.17.2" },
  { id: "encapsulation", pass: 3, ca: "CA-UX-3.17.4" },
  { id: "healthFromReport", pass: 4, ca: "CA-UX-3.17.3" },
  { id: "deterministic", pass: 5, ca: "CA-UX-3.17.5" },
  { id: "apiFreeze", pass: 6, ca: "CA-UX-3.17.6" },
  { id: "noPublicBarrelLeaks", pass: 7, ca: "CA-UX-3.17.6" },
  { id: "noReactNoWiring", pass: 8, ca: "CA-UX-3.17.6" },
  { id: "priorGates", pass: 9, ca: "CA-UX-3.17.7" },
  { id: "tscCompile", pass: 10, ca: "CA-UX-3.17.7" },
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
console.log("validate:ux-3.17");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
