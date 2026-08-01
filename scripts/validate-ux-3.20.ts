/**
 * UX-3.20 — Runtime Diagnostics Facade Foundation gate.
 *
 * Blocks:
 * facadeExists · reporterDelegation · diagnosticsImports
 * pipelineIntact · layersIntact · apiFreeze · invariants
 * priorGates · tscCompile
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { RuntimeReporter } from "../src/ui/theme/runtime/RuntimeReporter";
import { RuntimeDiagnostics } from "../src/ui/theme/runtime/diagnostics/RuntimeDiagnostics";
import { RuntimePipeline } from "../src/ui/theme/runtime/pipeline/RuntimePipeline";
import { RuntimeMetricsReporter } from "../src/ui/theme/runtime/metrics/RuntimeMetricsReporter";

type BlockId =
  | "facadeExists"
  | "reporterDelegation"
  | "diagnosticsImports"
  | "pipelineIntact"
  | "layersIntact"
  | "apiFreeze"
  | "invariants"
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

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "dist") {
        continue;
      }
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

const REPORTER_PATH = "src/ui/theme/runtime/RuntimeReporter.ts";
const PIPELINE_PATH = "src/ui/theme/runtime/pipeline/RuntimePipeline.ts";
const DIAGNOSTICS_PATH =
  "src/ui/theme/runtime/diagnostics/RuntimeDiagnostics.ts";
const DIAG_INDEX = "src/ui/theme/runtime/diagnostics/index.ts";
const INDEX_PATH = "src/ui/theme/runtime/index.ts";
const PROVIDER_PATH = "src/ui/providers/theme-provider.tsx";
const RUNTIME_ROOT = "src/ui/theme/runtime";
const PIPELINE_DIR = "src/ui/theme/runtime/pipeline";
const DIAG_DIR = "src/ui/theme/runtime/diagnostics";

/* -------------------------------------------------------------------------- */
/* PASS 01 — facadeExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "facadeExists";
  const src = stripComments(read(DIAGNOSTICS_PATH));

  assertCase(
    block,
    "facade.fileExists",
    existsSync(join(repoRoot, DIAGNOSTICS_PATH)),
    `${DIAGNOSTICS_PATH} exists`,
  );

  assertCase(
    block,
    "facade.noNewFolder",
    existsSync(join(repoRoot, DIAG_DIR)) &&
      existsSync(join(repoRoot, `${DIAG_DIR}/RuntimeDiagnosticEngine.ts`)),
    "reuses UX-3.11 diagnostics/ (DiagnosticEngine present)",
  );

  assertCase(
    block,
    "facade.frozenExport",
    /export const RuntimeDiagnostics = Object\.freeze\(\{\s*collect\s*,?\s*\}\)/.test(
      src,
    ),
    "export const RuntimeDiagnostics = Object.freeze({ collect })",
  );

  assertCase(
    block,
    "facade.keys",
    Object.keys(RuntimeDiagnostics).length === 1 &&
      "collect" in RuntimeDiagnostics,
    "RuntimeDiagnostics keys = [collect]",
  );

  assertCase(
    block,
    "facade.Object.isFrozen",
    Object.isFrozen(RuntimeDiagnostics),
    "Object.isFrozen(RuntimeDiagnostics)",
  );

  assertCase(
    block,
    "facade.collectIsFunction",
    typeof RuntimeDiagnostics.collect === "function",
    "typeof RuntimeDiagnostics.collect === 'function'",
  );

  assertCase(
    block,
    "facade.signature",
    /function\s+collect\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      src,
    ),
    "collect(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "facade.barrelExport",
    /export\s+\{\s*RuntimeDiagnostics\s*\}\s+from\s+["']\.\/RuntimeDiagnostics["']/.test(
      stripComments(read(DIAG_INDEX)),
    ),
    "diagnostics/index.ts exports RuntimeDiagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — reporterDelegation                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterDelegation";
  const src = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "reporter.importsDiagnostics",
    /from\s+["']\.\/diagnostics\/RuntimeDiagnostics["']/.test(src),
    "imports RuntimeDiagnostics from direct file path",
  );

  assertCase(
    block,
    "reporter.noPipeline",
    !/\bRuntimePipeline\b/.test(src) && !/pipeline\//.test(src),
    "RuntimeReporter does not import RuntimePipeline",
  );

  assertCase(
    block,
    "reporter.delegates",
    /const\s+report\s*=\s*RuntimeDiagnostics\.collect\s*\(\s*runtime\s*\)/.test(
      src,
    ) &&
      /return\s+report\s*;/.test(src) &&
      !/return\s+report\.health\s*;/.test(src),
    "build → RuntimeDiagnostics.collect → return report",
  );

  const buildBody = src.match(
    /function\s+build\s*\([^)]*\)[^{]*\{([\s\S]*?)\}/,
  );
  const body = buildBody?.[1] ?? "";
  assertCase(
    block,
    "reporter.bodyMinimal",
    /RuntimeDiagnostics\.collect/.test(body) &&
      /return\s+report\s*;/.test(body) &&
      !/\bnew\s+/.test(body) &&
      !/\{\s*\.\.\./.test(body) &&
      !/\bObject\.assign\b/.test(body) &&
      !/\bstructuredClone\b/.test(body) &&
      !/\.map\s*\(/.test(body),
    "build() body is only collect + return report",
  );

  assertCase(
    block,
    "reporter.frozenExport",
    /export const RuntimeReporter = Object\.freeze\(\{\s*build\s*,?\s*\}\)/.test(
      src,
    ),
    "export const RuntimeReporter = Object.freeze({ build })",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — diagnosticsImports                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsImports";
  const src = stripComments(read(DIAGNOSTICS_PATH));

  const fromMatches = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (m) => m[1],
  );

  const allowedFrom = [
    "../pipeline/RuntimePipeline",
    "../selectors/ThemeSelector",
    "../report/RuntimeReportTypes",
  ];

  const unexpected = fromMatches.filter((f) => !allowedFrom.includes(f));

  assertCase(
    block,
    "imports.onlyAllowed",
    unexpected.length === 0 &&
      fromMatches.includes("../pipeline/RuntimePipeline"),
    unexpected.length === 0
      ? "imports = RuntimePipeline + ThemeRuntime type + RuntimeReportSnapshot type"
      : `unexpected imports: ${unexpected.join(", ")}`,
  );

  assertCase(
    block,
    "imports.runsPipeline",
    /const\s+report\s*=\s*RuntimePipeline\.run\s*\(\s*runtime\s*\)/.test(src) &&
      /return\s+report\s*;/.test(src) &&
      !/return\s+report\.health\s*;/.test(src),
    "collect → RuntimePipeline.run → return report (no .health)",
  );

  const banned = [
    "SnapshotBuilder",
    "RuntimeMetricsReporter",
    "RuntimeHealthReporter",
    "RuntimeAggregationAccumulator",
    "RuntimeAggregationReporter",
    "RuntimeAggregationBuilder",
    "RuntimeTelemetryCollector",
    "RuntimeTelemetryReporter",
    "RuntimeTelemetryBuilder",
    "RuntimeReportCollector",
    "RuntimeReportReporter",
    "RuntimeReportBuilder",
    "RuntimeDiagnosticBuilder",
    "RuntimeDiagnosticEngine",
  ];

  const foundBanned = banned.filter((s) => new RegExp(`\\b${s}\\b`).test(src));

  assertCase(
    block,
    "imports.noBuildersCollectors",
    foundBanned.length === 0 &&
      !/\bBuilder\b/.test(src) &&
      !/\bCollector\b/.test(src) &&
      !/\bAccumulator\b/.test(src),
    foundBanned.length === 0
      ? "no Builder / Collector / Accumulator / layer Reporter / SnapshotBuilder"
      : `banned symbols: ${foundBanned.join(", ")}`,
  );

  const collectBody = src.match(
    /function\s+collect\s*\([^)]*\)[^{]*\{([\s\S]*?)\}/,
  );
  const body = collectBody?.[1] ?? "";
  assertCase(
    block,
    "imports.bodyMinimal",
    /RuntimePipeline\.run/.test(body) &&
      /return\s+report\s*;/.test(body) &&
      !/\bnew\s+/.test(body) &&
      !/\{\s*\.\.\./.test(body) &&
      !/\bObject\.assign\b/.test(body) &&
      !/\bstructuredClone\b/.test(body),
    "collect() body is only pipeline.run + return report",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — pipelineIntact                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineIntact";
  const src = stripComments(read(PIPELINE_PATH));

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
    "pipeline.signature",
    /function\s+run\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      src,
    ),
    "run(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "pipeline.neverReturnHealth",
    !/return\s+health\s*;/.test(src) &&
      !/return\s+runtimeReport\.health\s*;/.test(src),
    "never return health or runtimeReport.health",
  );

  assertCase(
    block,
    "pipeline.frozenExport",
    /export const RuntimePipeline = Object\.freeze\(\{\s*run\s*,?\s*\}\)/.test(
      src,
    ),
    "export const RuntimePipeline = Object.freeze({ run })",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — layersIntact                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "layersIntact";

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
    "src/ui/theme/runtime/health/RuntimeHealth.ts",
    "src/ui/theme/runtime/health/RuntimeHealthReporter.ts",
    "src/ui/theme/runtime/metrics/RuntimeMetrics.ts",
    "src/ui/theme/runtime/devtools/RuntimeSnapshot.ts",
    "src/ui/theme/runtime/devtools/SnapshotBuilder.ts",
  ];

  for (const rel of layerFiles) {
    assertCase(
      block,
      `layer.exists.${rel}`,
      existsSync(join(repoRoot, rel)),
      `${rel} exists`,
    );
  }

  const aggIndex = stripComments(
    read("src/ui/theme/runtime/aggregation/index.ts"),
  );
  const telIndex = stripComments(
    read("src/ui/theme/runtime/telemetry/index.ts"),
  );
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
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  const reporterSrc = stripComments(read(REPORTER_PATH));

  assertCase(
    block,
    "api.reporterSignature",
    /function\s+build\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      reporterSrc,
    ),
    "build(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "api.reporterKeys",
    Object.keys(RuntimeReporter).length === 1 && "build" in RuntimeReporter,
    "RuntimeReporter keys = [build]",
  );

  assertCase(
    block,
    "api.reporterFrozen",
    Object.isFrozen(RuntimeReporter),
    "Object.isFrozen(RuntimeReporter)",
  );

  const barrels = [
    "src/ui/index.ts",
    "src/ui/theme/index.ts",
    "src/ui/theme/runtime/index.ts",
    "src/ui/theme/hooks/index.ts",
    "src/ui/providers/index.ts",
  ];

  const leakIdents = [
    "RuntimePipeline",
    "RuntimeReporter",
    "RuntimeDiagnostics",
    "RuntimeReportSnapshot",
  ];

  for (const barrel of barrels) {
    if (!existsSync(join(repoRoot, barrel))) {
      assertCase(block, `api.private.${barrel}`, true, `${barrel} absent (ok)`);
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
      /runtime\/pipeline/.test(src) ||
      /runtime\/diagnostics/.test(src) ||
      /RuntimeDiagnostics/.test(src);

    assertCase(
      block,
      `api.noExport.${barrel}`,
      !leaks && !pathLeak,
      !leaks && !pathLeak
        ? `${barrel} does not export facade/pipeline`
        : `${barrel} leaks RuntimeDiagnostics / Pipeline / Reporter`,
    );
  }

  const indexSrc = stripComments(read(INDEX_PATH));
  assertCase(
    block,
    "api.runtimeIndexClean",
    !/\bRuntimePipeline\b/.test(indexSrc) &&
      !/\bRuntimeReporter\b/.test(indexSrc) &&
      !/\bRuntimeDiagnostics\b/.test(indexSrc),
    "runtime/index.ts has no Pipeline / Reporter / Diagnostics",
  );

  const providerSrc = existsSync(join(repoRoot, PROVIDER_PATH))
    ? stripComments(read(PROVIDER_PATH))
    : "";

  assertCase(
    block,
    "api.themeProviderClean",
    !/\bRuntimePipeline\b/.test(providerSrc) &&
      !/\bRuntimeReporter\b/.test(providerSrc) &&
      !/\bRuntimeDiagnostics\b/.test(providerSrc) &&
      !/runtime\/pipeline/.test(providerSrc) &&
      !/runtime\/diagnostics/.test(providerSrc),
    "ThemeProvider does not import Pipeline / Reporter / Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — invariants                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "invariants";
  const reporterSrc = stripComments(read(REPORTER_PATH));
  const diagSrc = stripComments(read(DIAGNOSTICS_PATH));
  const providerSrc = existsSync(join(repoRoot, PROVIDER_PATH))
    ? stripComments(read(PROVIDER_PATH))
    : "";

  assertCase(
    block,
    "inv.neverProviderPipeline",
    !/\bRuntimePipeline\b/.test(providerSrc) &&
      !/runtime\/pipeline/.test(providerSrc),
    "Never ThemeProvider → RuntimePipeline",
  );

  assertCase(
    block,
    "inv.neverReporterPipeline",
    !/\bRuntimePipeline\b/.test(reporterSrc) &&
      !/pipeline\//.test(reporterSrc),
    "Never RuntimeReporter → RuntimePipeline",
  );

  assertCase(
    block,
    "inv.alwaysReporterDiagnosticsPipeline",
    /RuntimeDiagnostics\.collect/.test(reporterSrc) &&
      /RuntimePipeline\.run/.test(diagSrc),
    "Always RuntimeReporter → RuntimeDiagnostics → RuntimePipeline",
  );

  const runtimeAbs = join(repoRoot, RUNTIME_ROOT);
  const pipelineAbs = join(repoRoot, PIPELINE_DIR);
  const diagAbs = join(repoRoot, DIAG_DIR);
  const offenders: string[] = [];

  for (const full of walkFiles(runtimeAbs)) {
    const underPipeline =
      full.startsWith(pipelineAbs + "\\") ||
      full.startsWith(pipelineAbs + "/") ||
      full === join(pipelineAbs, "RuntimePipeline.ts");
    const underDiag =
      full.startsWith(diagAbs + "\\") || full.startsWith(diagAbs + "/");

    if (underPipeline || underDiag) continue;

    const src = readFileSync(full, "utf8");
    if (
      /from\s+["'][^"']*pipeline\/RuntimePipeline[^"']*["']/.test(src) ||
      /from\s+["'][^"']*\/pipeline["']/.test(src)
    ) {
      offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
  }

  assertCase(
    block,
    "inv.pipelineImportsOnlyDiagOrPipeline",
    offenders.length === 0,
    offenders.length === 0
      ? "RuntimePipeline imports only inside pipeline/ or diagnostics/"
      : `illegal RuntimePipeline imports: ${offenders.join(", ")}`,
  );

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtimeA = ThemeTokenResolver.resolve("light");
  const viaReporter = RuntimeReporter.build(runtimeA);

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtimeB = ThemeTokenResolver.resolve("light");
  const viaDiag = RuntimeDiagnostics.collect(runtimeB);

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtimeC = ThemeTokenResolver.resolve("light");
  const viaPipeline = RuntimePipeline.run(runtimeC);

  assertCase(
    block,
    "inv.behaviorParityFrozen",
    Object.isFrozen(viaReporter) &&
      Object.isFrozen(viaDiag) &&
      Object.isFrozen(viaPipeline) &&
      viaReporter !== null &&
      viaDiag !== null &&
      viaPipeline !== null,
    "Reporter / Diagnostics / Pipeline all return frozen objects",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — priorGates                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGates";
  const priors = [
    { id: "ux311", script: "scripts/validate-ux-3.11.ts", label: "ux-3.11" },
    { id: "ux316", script: "scripts/validate-ux-3.16.ts", label: "ux-3.16" },
    { id: "ux318", script: "scripts/validate-ux-3.18.ts", label: "ux-3.18" },
    { id: "ux319", script: "scripts/validate-ux-3.19.ts", label: "ux-3.19" },
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
/* PASS 09 — tscCompile                                                       */
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
  { id: "facadeExists", pass: 1, ca: "CA-UX-3.20.1" },
  { id: "reporterDelegation", pass: 2, ca: "CA-UX-3.20.2" },
  { id: "diagnosticsImports", pass: 3, ca: "CA-UX-3.20.3" },
  { id: "pipelineIntact", pass: 4, ca: "CA-UX-3.20.4" },
  { id: "layersIntact", pass: 5, ca: "CA-UX-3.20.5" },
  { id: "apiFreeze", pass: 6, ca: "CA-UX-3.20.6" },
  { id: "invariants", pass: 7, ca: "CA-UX-3.20.7" },
  { id: "priorGates", pass: 8, ca: "CA-UX-3.20.8" },
  { id: "tscCompile", pass: 9, ca: "CA-UX-3.20.8" },
];

let passCount = 0;
for (const { id: block, pass, ca } of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => r.pass === false);
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
console.log("validate:ux-3.20");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
