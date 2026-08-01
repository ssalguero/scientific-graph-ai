/**
 * UX-3.18 — Runtime Report Integration (Pipeline Finalization) gate.
 *
 * Blocks:
 * returnsReport · signatureType · pipelineOrder · noNewImports
 * layersUntouched · encapsulation · apiFreeze · noPublicBarrelLeaks
 * noReactNoWiring · priorGates · tscCompile
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { RuntimeReporter } from "../src/ui/theme/runtime/RuntimeReporter";
import { SnapshotBuilder } from "../src/ui/theme/runtime/devtools/SnapshotBuilder";
import { RuntimeMetricsReporter } from "../src/ui/theme/runtime/metrics/RuntimeMetricsReporter";
import { RuntimeHealthReporter } from "../src/ui/theme/runtime/health/RuntimeHealthReporter";
import { RuntimeReportCollector } from "../src/ui/theme/runtime/report/RuntimeReportCollector";
import { RuntimeReportReporter } from "../src/ui/theme/runtime/report/RuntimeReportReporter";

type BlockId =
  | "returnsReport"
  | "signatureType"
  | "pipelineOrder"
  | "noNewImports"
  | "layersUntouched"
  | "encapsulation"
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

function fileHash(rel: string): string {
  return createHash("sha256").update(read(rel)).digest("hex");
}

const REPORTER_PATH = "src/ui/theme/runtime/RuntimeReporter.ts";
const INDEX_PATH = "src/ui/theme/runtime/index.ts";
const PROVIDER_PATH = "src/ui/providers/theme-provider.tsx";

/* -------------------------------------------------------------------------- */
/* PASS 01 — returnsReport                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "returnsReport";

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtime = ThemeTokenResolver.resolve("light");
  const snapshot = SnapshotBuilder.build(runtime);
  const metrics = RuntimeMetricsReporter.getSnapshot();
  const healthDirect = RuntimeHealthReporter.build(snapshot, metrics);
  const collector = new RuntimeReportCollector();
  collector.record(snapshot, metrics, healthDirect);
  const expected = RuntimeReportReporter.build(collector);

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const viaReporter = RuntimeReporter.build(
    ThemeTokenResolver.resolve("light"),
  );

  assertCase(
    block,
    "report.frozen",
    Object.isFrozen(viaReporter),
    "returned value is Object.isFrozen",
  );

  const keys = Object.keys(viaReporter).sort();
  const expectedKeys = ["health", "metrics", "runtime"].sort();

  assertCase(
    block,
    "report.keys",
    keys.length === expectedKeys.length &&
      expectedKeys.every((k, i) => keys[i] === k),
    `keys match RuntimeReportSnapshot (${keys.join(",")})`,
  );

  assertCase(
    block,
    "report.notHealthShape",
    !(
      "status" in viaReporter &&
      "fingerprint" in viaReporter &&
      "generatedAt" in viaReporter
    ),
    "return value is not RuntimeHealth",
  );

  assertCase(
    block,
    "report.notTelemetryShape",
    !("timestamp" in viaReporter),
    "return value is not RuntimeTelemetrySnapshot",
  );

  assertCase(
    block,
    "report.hasNestedHealth",
    typeof viaReporter.health?.status === "string",
    "report.health.status present",
  );

  assertCase(
    block,
    "report.manualShapeParity",
    Object.keys(expected).sort().join(",") === keys.join(","),
    "RuntimeReporter shape matches RuntimeReportReporter.build",
  );

  assertCase(
    block,
    "report.sharesMetricsWithHealth",
    Object.is(viaReporter.metrics, viaReporter.health.metrics),
    "report.metrics === report.health.metrics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — signatureType                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "signatureType";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "sig.returnType",
    /function\s+build\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      src,
    ),
    "build(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "sig.importsReportType",
    /import\s+type\s+\{\s*RuntimeReportSnapshot\s*\}\s+from\s+["']\.\/report\/RuntimeReportTypes["']/.test(
      src,
    ) ||
      /import\s+type\s+\{\s*RuntimeReportSnapshot\s*\}\s+from\s+["']\.\/report["']/.test(
        src,
      ),
    "imports type RuntimeReportSnapshot",
  );

  assertCase(
    block,
    "sig.noRuntimeHealthImport",
    !/import\s+type\s+\{[^}]*\bRuntimeHealth\b[^}]*\}\s+from\s+["']\.\/health/.test(
      src,
    ),
    "no longer imports type RuntimeHealth",
  );

  assertCase(
    block,
    "sig.returnStatement",
    /return\s+runtimeReport\s*;/.test(src) &&
      !/return\s+runtimeReport\.health\s*;/.test(src),
    "return runtimeReport (not runtimeReport.health)",
  );

  assertCase(
    block,
    "sig.noRuntimeReportAlias",
    !/\btype\s+RuntimeReport\b/.test(src) &&
      !/\binterface\s+RuntimeReport\b/.test(src),
    "does not invent a RuntimeReport type",
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
  const returnIdx = src.search(/return\s+runtimeReport\s*;/);

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
      ? "Snapshot → Metrics → Health → Aggregation → Telemetry → Report → return runtimeReport"
      : `order indices snap=${snapIdx} mets=${metsIdx} health=${healthIdx} agg=${newAggIdx}/${aggRecordIdx}/${aggRepIdx} tel=${newTelIdx}/${telRecordIdx}/${telIdx} rep=${newRepIdx}/${repRecordIdx}/${reportIdx} ret=${returnIdx}`,
  );

  assertCase(
    block,
    "pipeline.neverReturnHealth",
    !/return\s+health\s*;/.test(src) &&
      !/return\s+runtimeReport\.health\s*;/.test(src),
    "never return health or runtimeReport.health",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — noNewImports                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noNewImports";
  const src = stripComments(read(REPORTER_PATH));

  const allowedFrom = [
    "./devtools/SnapshotBuilder",
    "./metrics/RuntimeMetricsReporter",
    "./health/RuntimeHealthReporter",
    "./aggregation/RuntimeAggregationAccumulator",
    "./aggregation/RuntimeAggregationReporter",
    "./telemetry/RuntimeTelemetryCollector",
    "./telemetry/RuntimeTelemetryReporter",
    "./report/RuntimeReportCollector",
    "./report/RuntimeReportReporter",
    "./selectors/ThemeSelector",
    "./report/RuntimeReportTypes",
  ];

  const fromMatches = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (m) => m[1],
  );

  const unexpected = fromMatches.filter((f) => !allowedFrom.includes(f));

  assertCase(
    block,
    "imports.onlyAllowed",
    unexpected.length === 0,
    unexpected.length === 0
      ? "imports match UX-3.17 set + RuntimeReportTypes"
      : `unexpected imports: ${unexpected.join(", ")}`,
  );

  assertCase(
    block,
    "imports.noBuilders",
    !/\bRuntimeAggregationBuilder\b/.test(src) &&
      !/\bRuntimeTelemetryBuilder\b/.test(src) &&
      !/\bRuntimeReportBuilder\b/.test(src),
    "no Builder imports",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — layersUntouched                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "layersUntouched";

  const layerFiles = [
    "src/ui/theme/runtime/aggregation/RuntimeAggregation.ts",
    "src/ui/theme/runtime/aggregation/RuntimeAggregationAccumulator.ts",
    "src/ui/theme/runtime/aggregation/RuntimeAggregationBuilder.ts",
    "src/ui/theme/runtime/aggregation/RuntimeAggregationReporter.ts",
    "src/ui/theme/runtime/aggregation/index.ts",
    "src/ui/theme/runtime/telemetry/TelemetryTypes.ts",
    "src/ui/theme/runtime/telemetry/RuntimeTelemetryBuilder.ts",
    "src/ui/theme/runtime/telemetry/RuntimeTelemetryCollector.ts",
    "src/ui/theme/runtime/telemetry/RuntimeTelemetryReporter.ts",
    "src/ui/theme/runtime/telemetry/index.ts",
    "src/ui/theme/runtime/report/RuntimeReportTypes.ts",
    "src/ui/theme/runtime/report/RuntimeReportBuilder.ts",
    "src/ui/theme/runtime/report/RuntimeReportCollector.ts",
    "src/ui/theme/runtime/report/RuntimeReportReporter.ts",
    "src/ui/theme/runtime/report/index.ts",
  ];

  for (const rel of layerFiles) {
    assertCase(
      block,
      `layer.exists.${rel}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  // Structural freeze: layer modules must still export expected symbols
  // (content hash not pinned — verifies presence + key export contracts).
  const aggIndex = stripComments(read("src/ui/theme/runtime/aggregation/index.ts"));
  const telIndex = stripComments(read("src/ui/theme/runtime/telemetry/index.ts"));
  const repIndex = stripComments(read("src/ui/theme/runtime/report/index.ts"));

  assertCase(
    block,
    "agg.barrelExports",
    /\bRuntimeAggregationReporter\b/.test(aggIndex) &&
      /\bRuntimeAggregationAccumulator\b/.test(aggIndex),
    "aggregation barrel unchanged contract",
  );

  assertCase(
    block,
    "tel.barrelExports",
    /\bRuntimeTelemetryReporter\b/.test(telIndex) &&
      /\bRuntimeTelemetryCollector\b/.test(telIndex),
    "telemetry barrel unchanged contract",
  );

  assertCase(
    block,
    "rep.barrelExports",
    /\bRuntimeReportReporter\b/.test(repIndex) &&
      /\bRuntimeReportCollector\b/.test(repIndex) &&
      /\bRuntimeReportSnapshot\b/.test(repIndex),
    "report barrel unchanged contract",
  );

  const reportTypes = stripComments(
    read("src/ui/theme/runtime/report/RuntimeReportTypes.ts"),
  );
  assertCase(
    block,
    "rep.typesUnchanged",
    /export interface RuntimeReportSnapshot/.test(reportTypes) &&
      /readonly runtime:/.test(reportTypes) &&
      /readonly metrics:/.test(reportTypes) &&
      /readonly health:/.test(reportTypes) &&
      !/\bexport interface RuntimeReport\b/.test(reportTypes),
    "RuntimeReportTypes still defines RuntimeReportSnapshot only",
  );

  // Hash self-check: ensure validator can read files (non-empty)
  assertCase(
    block,
    "layers.readable",
    layerFiles.every((f) => fileHash(f).length === 64),
    "all frozen layer files readable",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — encapsulation                                                    */
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
    "enc.soleEntries",
    /RuntimeAggregationReporter\.build\s*\(\s*aggregation\s*\)/.test(src) &&
      /RuntimeTelemetryReporter\.build\s*\(\s*telemetry\s*\)/.test(src) &&
      /RuntimeReportReporter\.build\s*\(\s*report\s*\)/.test(src),
    "sole entries via Aggregation/Telemetry/Report Reporters",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — apiFreeze                                                        */
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
    "api.noReportMethod",
    !("report" in RuntimeReporter),
    "no report() method on RuntimeReporter",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noPublicBarrelLeaks                                              */
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

    assertCase(
      block,
      `leak.noExport.${barrel}`,
      !leaks,
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
/* PASS 09 — noReactNoWiring                                                  */
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
/* PASS 10 — priorGates                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGates";
  const priors = [
    { id: "ux313", script: "scripts/validate-ux-3.13.ts", label: "ux-3.13" },
    { id: "ux314", script: "scripts/validate-ux-3.14.ts", label: "ux-3.14" },
    { id: "ux315", script: "scripts/validate-ux-3.15.ts", label: "ux-3.15" },
    { id: "ux316", script: "scripts/validate-ux-3.16.ts", label: "ux-3.16" },
    { id: "ux317", script: "scripts/validate-ux-3.17.ts", label: "ux-3.17" },
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
  { id: "returnsReport", pass: 1, ca: "CA-UX-3.18.1" },
  { id: "signatureType", pass: 2, ca: "CA-UX-3.18.2" },
  { id: "pipelineOrder", pass: 3, ca: "CA-UX-3.18.3" },
  { id: "noNewImports", pass: 4, ca: "CA-UX-3.18.4" },
  { id: "layersUntouched", pass: 5, ca: "CA-UX-3.18.5" },
  { id: "encapsulation", pass: 6, ca: "CA-UX-3.18.6" },
  { id: "apiFreeze", pass: 7, ca: "CA-UX-3.18.7" },
  { id: "noPublicBarrelLeaks", pass: 8, ca: "CA-UX-3.18.7" },
  { id: "noReactNoWiring", pass: 9, ca: "CA-UX-3.18.7" },
  { id: "priorGates", pass: 10, ca: "CA-UX-3.18.8" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-3.18.8" },
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
console.log("validate:ux-3.18");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
