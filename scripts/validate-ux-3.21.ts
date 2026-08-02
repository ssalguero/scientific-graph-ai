/**
 * UX-3.21 — Runtime Final Certification & Release Validation gate.
 *
 * Blocks:
 * apiFreeze · pipelineFreeze · snapshotFreeze · collectorFreeze
 * reportFreeze · reporterFreeze · validationIndependence
 * publicLayerFreeze · noReactNoUiNoApp · priorGates · tscCompile
 *
 * Certifies the ACTUAL frozen architecture (UX-3.18–3.20):
 * RuntimeReporter → RuntimeDiagnostics → RuntimePipeline
 * Snapshot → Metrics → Health → Aggregation → Telemetry → Report
 *
 * No Runtime source changes. Documentation + certification only.
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
import { RuntimeReportCollector } from "../src/ui/theme/runtime/report/RuntimeReportCollector";

type BlockId =
  | "apiFreeze"
  | "pipelineFreeze"
  | "snapshotFreeze"
  | "collectorFreeze"
  | "reportFreeze"
  | "reporterFreeze"
  | "validationIndependence"
  | "publicLayerFreeze"
  | "noReactNoUiNoApp"
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
const SNAPSHOT_PATH = "src/ui/theme/runtime/devtools/RuntimeSnapshot.ts";
const COLLECTOR_PATH = "src/ui/theme/runtime/report/RuntimeReportCollector.ts";
const REPORT_TYPES_PATH = "src/ui/theme/runtime/report/RuntimeReportTypes.ts";
const REPORT_BUILDER_PATH = "src/ui/theme/runtime/report/RuntimeReportBuilder.ts";
const REPORT_REPORTER_PATH =
  "src/ui/theme/runtime/report/RuntimeReportReporter.ts";
const INDEX_PATH = "src/ui/theme/runtime/index.ts";
const PROVIDER_PATH = "src/ui/providers/theme-provider.tsx";

const VALIDATION_MODULES = [
  "src/ui/theme/runtime/ThemeValidator.ts",
  "src/ui/theme/runtime/ThemeAssertions.ts",
  "src/ui/theme/runtime/adapters/ThemeValidationAdapter.ts",
  "src/ui/theme/runtime/adapters/index.ts",
] as const;

const DIAGNOSTICS_CHAIN = [
  REPORTER_PATH,
  DIAGNOSTICS_PATH,
  PIPELINE_PATH,
  SNAPSHOT_PATH,
  "src/ui/theme/runtime/devtools/SnapshotBuilder.ts",
  "src/ui/theme/runtime/metrics/RuntimeMetricsReporter.ts",
  "src/ui/theme/runtime/health/RuntimeHealthReporter.ts",
  "src/ui/theme/runtime/aggregation/RuntimeAggregationAccumulator.ts",
  "src/ui/theme/runtime/aggregation/RuntimeAggregationReporter.ts",
  "src/ui/theme/runtime/telemetry/RuntimeTelemetryCollector.ts",
  "src/ui/theme/runtime/telemetry/RuntimeTelemetryReporter.ts",
  COLLECTOR_PATH,
  REPORT_TYPES_PATH,
  REPORT_BUILDER_PATH,
  REPORT_REPORTER_PATH,
] as const;

/* -------------------------------------------------------------------------- */
/* PASS 01 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  const reporterSrc = stripComments(read(REPORTER_PATH));
  const diagSrc = stripComments(read(DIAGNOSTICS_PATH));
  const pipeSrc = stripComments(read(PIPELINE_PATH));

  assertCase(
    block,
    "api.reporterSignature",
    /function\s+build\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      reporterSrc,
    ),
    "RuntimeReporter.build(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "api.diagnosticsSignature",
    /function\s+collect\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      diagSrc,
    ),
    "RuntimeDiagnostics.collect(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "api.pipelineSignature",
    /function\s+run\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      pipeSrc,
    ),
    "RuntimePipeline.run(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "api.reporterKeys",
    Object.keys(RuntimeReporter).length === 1 && "build" in RuntimeReporter,
    "RuntimeReporter keys = [build]",
  );

  assertCase(
    block,
    "api.diagnosticsKeys",
    Object.keys(RuntimeDiagnostics).length === 1 &&
      "collect" in RuntimeDiagnostics,
    "RuntimeDiagnostics keys = [collect]",
  );

  assertCase(
    block,
    "api.pipelineKeys",
    Object.keys(RuntimePipeline).length === 1 && "run" in RuntimePipeline,
    "RuntimePipeline keys = [run]",
  );

  assertCase(
    block,
    "api.reporterFrozen",
    Object.isFrozen(RuntimeReporter),
    "Object.isFrozen(RuntimeReporter)",
  );

  assertCase(
    block,
    "api.diagnosticsFrozen",
    Object.isFrozen(RuntimeDiagnostics),
    "Object.isFrozen(RuntimeDiagnostics)",
  );

  assertCase(
    block,
    "api.pipelineFrozen",
    Object.isFrozen(RuntimePipeline),
    "Object.isFrozen(RuntimePipeline)",
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
        ? `${barrel} does not export Pipeline / Reporter / Diagnostics / ReportSnapshot`
        : `${barrel} leaks Runtime diagnostics API`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — pipelineFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineFreeze";
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
    "pipeline.noHooks",
    !/\bhooks?\b/i.test(src) &&
      !/\bextension\b/i.test(src) &&
      !/\bmiddleware\b/i.test(src) &&
      !/\bplugin\b/i.test(src),
    "no hooks / extensions / middleware / plugins in Pipeline",
  );

  assertCase(
    block,
    "pipeline.frozenExport",
    /export const RuntimePipeline = Object\.freeze\(\{\s*run\s*,?\s*\}\)/.test(
      src,
    ),
    "export const RuntimePipeline = Object.freeze({ run })",
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
/* PASS 03 — snapshotFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotFreeze";
  const src = stripComments(read(SNAPSHOT_PATH));

  assertCase(
    block,
    "snapshot.typeExists",
    /export\s+type\s+RuntimeSnapshot\s*=\s*\{/.test(src),
    "export type RuntimeSnapshot = { ... }",
  );

  assertCase(
    block,
    "snapshot.readonlyFields",
    /readonly\s+fingerprint\s*:/.test(src) &&
      /readonly\s+themeName\s*:/.test(src) &&
      /readonly\s+version\s*:/.test(src) &&
      /readonly\s+tokenCount\s*:/.test(src) &&
      /readonly\s+colorCount\s*:/.test(src) &&
      /readonly\s+typographyCount\s*:/.test(src) &&
      /readonly\s+spacingCount\s*:/.test(src) &&
      /readonly\s+radiusCount\s*:/.test(src) &&
      /readonly\s+elevationCount\s*:/.test(src),
    "all RuntimeSnapshot fields are readonly",
  );

  assertCase(
    block,
    "snapshot.noTimestamp",
    !/\btimestamp\b/.test(src),
    "RuntimeSnapshot has no timestamp",
  );

  assertCase(
    block,
    "snapshot.scalarShape",
    !/:\s*(?:Array|Map|Set|Record)\b/.test(src) &&
      !/:\s*\w+\[\]/.test(src) &&
      !/\bThemeRuntime\b/.test(src),
    "immutable scalar shape (no arrays/maps/ThemeRuntime refs)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — collectorFreeze                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "collectorFreeze";
  const src = stripComments(read(COLLECTOR_PATH));
  const collector = new RuntimeReportCollector();
  const proto = Object.getPrototypeOf(collector) as object;
  const methods = Object.getOwnPropertyNames(proto).filter(
    (n) => n !== "constructor",
  );
  const expected = ["record", "build", "reset"];
  const onlyExpected =
    methods.length === expected.length &&
    expected.every((m) => methods.includes(m));

  assertCase(
    block,
    "collector.methods",
    onlyExpected,
    onlyExpected
      ? "RuntimeReportCollector methods = [record, build, reset]"
      : `unexpected methods: ${methods.join(", ")}`,
  );

  assertCase(
    block,
    "collector.recordInSource",
    /\brecord\s*\(/.test(src),
    "record() present in source",
  );

  assertCase(
    block,
    "collector.buildInSource",
    /\bbuild\s*\(/.test(src),
    "build() present in source",
  );

  assertCase(
    block,
    "collector.resetInSource",
    /\breset\s*\(/.test(src),
    "reset() present in source",
  );

  const banned = [
    "history",
    "cache",
    "subscribe",
    "unsubscribe",
    "events",
    "listeners",
    "emit",
    "on(",
  ] as const;

  for (const ban of banned) {
    const re =
      ban === "on("
        ? /\bon\s*\(/
        : new RegExp(`\\b${ban}\\b`, "i");
    assertCase(
      block,
      `collector.no.${ban.replace("(", "")}`,
      !re.test(src),
      !re.test(src) ? `no ${ban}` : `found banned ${ban}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — reportFreeze                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportFreeze";
  const typesSrc = stripComments(read(REPORT_TYPES_PATH));
  const collectorSrc = stripComments(read(COLLECTOR_PATH));
  const builderSrc = stripComments(read(REPORT_BUILDER_PATH));
  const reportReporterSrc = stripComments(read(REPORT_REPORTER_PATH));

  assertCase(
    block,
    "report.exactFields",
    /export\s+interface\s+RuntimeReportSnapshot\s*\{[\s\S]*?readonly\s+runtime\s*:[\s\S]*?readonly\s+metrics\s*:[\s\S]*?readonly\s+health\s*:[\s\S]*?\}/.test(
      typesSrc,
    ),
    "RuntimeReportSnapshot = { runtime, metrics, health }",
  );

  assertCase(
    block,
    "report.onlyThreeFields",
    (typesSrc.match(/readonly\s+\w+\s*:/g) ?? []).length === 3,
    "exactly three readonly fields",
  );

  assertCase(
    block,
    "report.noTimestamp",
    !/\btimestamp\b/.test(typesSrc) &&
      !/\btimestamp\b/.test(builderSrc) &&
      !/\btimestamp\b/.test(collectorSrc) &&
      !/\btimestamp\b/.test(reportReporterSrc),
    "no timestamp in report layer",
  );

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtime = ThemeTokenResolver.resolve("light");
  const report = RuntimeReporter.build(runtime);

  assertCase(
    block,
    "report.frozen",
    Object.isFrozen(report),
    "Object.isFrozen(report)",
  );

  assertCase(
    block,
    "report.hasExactKeys",
    Object.keys(report).sort().join(",") === "health,metrics,runtime",
    "report keys = [health, metrics, runtime]",
  );

  assertCase(
    block,
    "report.noCircularCollectorReporter",
    !/\bRuntimeReportReporter\b/.test(collectorSrc) &&
      !/\bRuntimeReportCollector\b/.test(builderSrc) &&
      !/\bRuntimeReportReporter\b/.test(builderSrc),
    "Collector does not import Reporter; Builder does not import Collector/Reporter",
  );

  assertCase(
    block,
    "report.reporterUsesCollectorBuild",
    /collector\.build\s*\(\s*\)/.test(reportReporterSrc),
    "RuntimeReportReporter.build → collector.build()",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — reporterFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterFreeze";
  const reporterSrc = stripComments(read(REPORTER_PATH));
  const diagSrc = stripComments(read(DIAGNOSTICS_PATH));

  assertCase(
    block,
    "reporter.importsDiagnostics",
    /from\s+["']\.\/diagnostics\/RuntimeDiagnostics["']/.test(reporterSrc),
    "imports RuntimeDiagnostics from direct file path",
  );

  assertCase(
    block,
    "reporter.noPipeline",
    !/\bRuntimePipeline\b/.test(reporterSrc) && !/pipeline\//.test(reporterSrc),
    "RuntimeReporter does not import RuntimePipeline",
  );

  assertCase(
    block,
    "reporter.delegates",
    /const\s+report\s*=\s*RuntimeDiagnostics\.collect\s*\(\s*runtime\s*\)/.test(
      reporterSrc,
    ) &&
      /return\s+report\s*;/.test(reporterSrc) &&
      !/return\s+report\.health\s*;/.test(reporterSrc),
    "build → RuntimeDiagnostics.collect → return report",
  );

  const buildBody = reporterSrc.match(
    /function\s+build\s*\([^)]*\)[^{]*\{([\s\S]*?)\}/,
  );
  const body = buildBody?.[1] ?? "";
  assertCase(
    block,
    "reporter.bodyMinimal",
    /RuntimeDiagnostics\.collect/.test(body) &&
      /return\s+report\s*;/.test(body) &&
      !/\bnew\s+/.test(body) &&
      !/\.map\b/.test(body) &&
      !/\.\.\./.test(body) &&
      !/\bstructuredClone\b/.test(body),
    "build() body is only Diagnostics.collect + return report",
  );

  assertCase(
    block,
    "diagnostics.importsPipeline",
    /from\s+["']\.\.\/pipeline\/RuntimePipeline["']/.test(diagSrc),
    "RuntimeDiagnostics imports RuntimePipeline",
  );

  assertCase(
    block,
    "diagnostics.delegates",
    /const\s+report\s*=\s*RuntimePipeline\.run\s*\(\s*runtime\s*\)/.test(
      diagSrc,
    ) &&
      /return\s+report\s*;/.test(diagSrc) &&
      !/return\s+report\.health\s*;/.test(diagSrc),
    "collect → RuntimePipeline.run → return report",
  );

  const collectBody = diagSrc.match(
    /function\s+collect\s*\([^)]*\)[^{]*\{([\s\S]*?)\}/,
  );
  const cBody = collectBody?.[1] ?? "";
  assertCase(
    block,
    "diagnostics.bodyMinimal",
    /RuntimePipeline\.run/.test(cBody) &&
      /return\s+report\s*;/.test(cBody) &&
      !/\bnew\s+/.test(cBody) &&
      !/\.map\b/.test(cBody) &&
      !/\.\.\./.test(cBody) &&
      !/\bstructuredClone\b/.test(cBody),
    "collect() body is only Pipeline.run + return report",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — validationIndependence                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "validationIndependence";
  const bannedIdents = [
    "RuntimeReporter",
    "RuntimeDiagnostics",
    "RuntimePipeline",
    "RuntimeReportCollector",
  ];

  for (const rel of VALIDATION_MODULES) {
    if (!existsSync(join(repoRoot, rel))) {
      assertCase(block, `val.missing.${rel}`, false, `${rel} missing`);
      continue;
    }
    const src = stripComments(read(rel));

    for (const ident of bannedIdents) {
      assertCase(
        block,
        `val.no.${ident}.${rel}`,
        !new RegExp(`\\b${ident}\\b`).test(src),
        `${rel} does not reference ${ident}`,
      );
    }

    assertCase(
      block,
      `val.noReact.${rel}`,
      !/\bfrom\s+["']react["']/.test(src) &&
        !/\bfrom\s+["']react\//.test(src) &&
        !/\brequire\s*\(\s*["']react["']/.test(src),
      `${rel} has no React imports`,
    );

    assertCase(
      block,
      `val.noUiComponents.${rel}`,
      !/from\s+["'][^"']*\/components\//.test(src) &&
        !/from\s+["'][^"']*\/providers\//.test(src) &&
        !/\bThemeProvider\b/.test(src) &&
        !/\.tsx["']/.test(src),
      `${rel} has no UI component / provider imports`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — publicLayerFreeze                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "publicLayerFreeze";

  assertCase(
    block,
    "public.noDiagnosticsAdapterFile",
    !existsSync(
      join(
        repoRoot,
        "src/ui/theme/runtime/adapters/RuntimeDiagnosticsAdapter.ts",
      ),
    ) &&
      !existsSync(
        join(repoRoot, "src/ui/theme/runtime/public/RuntimeDiagnostics.ts"),
      ),
    "no public Runtime Diagnostics adapter file",
  );

  const adaptersIndex = existsSync(
    join(repoRoot, "src/ui/theme/runtime/adapters/index.ts"),
  )
    ? stripComments(read("src/ui/theme/runtime/adapters/index.ts"))
    : "";

  assertCase(
    block,
    "public.adaptersNoDiagnostics",
    !/\bRuntimeDiagnostics\b/.test(adaptersIndex) &&
      !/\bRuntimePipeline\b/.test(adaptersIndex) &&
      !/\bRuntimeReporter\b/.test(adaptersIndex),
    "adapters/index.ts does not export diagnostics facade",
  );

  const runtimeIndex = stripComments(read(INDEX_PATH));
  assertCase(
    block,
    "public.runtimeIndexPrivate",
    !/\bRuntimePipeline\b/.test(runtimeIndex) &&
      !/\bRuntimeReporter\b/.test(runtimeIndex) &&
      !/\bRuntimeDiagnostics\b/.test(runtimeIndex) &&
      !/\bRuntimeReportSnapshot\b/.test(runtimeIndex),
    "runtime/index.ts keeps diagnostics private",
  );

  assertCase(
    block,
    "public.privateFacadeIsDiagnostics",
    Object.keys(RuntimeDiagnostics).length === 1 &&
      typeof RuntimeDiagnostics.collect === "function" &&
      Object.isFrozen(RuntimeDiagnostics),
    "private facade remains RuntimeDiagnostics.collect only",
  );

  const providerSrc = existsSync(join(repoRoot, PROVIDER_PATH))
    ? stripComments(read(PROVIDER_PATH))
    : "";

  assertCase(
    block,
    "public.themeProviderClean",
    !/\bRuntimePipeline\b/.test(providerSrc) &&
      !/\bRuntimeReporter\b/.test(providerSrc) &&
      !/\bRuntimeDiagnostics\b/.test(providerSrc) &&
      !/runtime\/pipeline/.test(providerSrc) &&
      !/runtime\/diagnostics/.test(providerSrc) &&
      !/runtime\/report/.test(providerSrc),
    "ThemeProvider does not wire runtime diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noReactNoUiNoApp                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReactNoUiNoApp";
  const offendersReact: string[] = [];
  const offendersApp: string[] = [];
  const offendersUi: string[] = [];

  for (const rel of DIAGNOSTICS_CHAIN) {
    if (!existsSync(join(repoRoot, rel))) {
      assertCase(block, `chain.missing.${rel}`, false, `${rel} missing`);
      continue;
    }
    const src = stripComments(read(rel));
    const norm = rel.replace(/\\/g, "/");

    if (
      /\bfrom\s+["']react["']/.test(src) ||
      /\bfrom\s+["']react\//.test(src) ||
      /\bfrom\s+["']react-dom/.test(src) ||
      /\brequire\s*\(\s*["']react["']/.test(src)
    ) {
      offendersReact.push(norm);
    }

    if (
      /from\s+["'][^"']*\/app\//.test(src) ||
      /from\s+["']@\/app\//.test(src) ||
      /from\s+["'][^"']*src\/app\//.test(src)
    ) {
      offendersApp.push(norm);
    }

    if (
      /from\s+["'][^"']*\/components\//.test(src) ||
      /from\s+["'][^"']*\/providers\//.test(src) ||
      /from\s+["'][^"']*hooks\/use[A-Z]/.test(src) ||
      /\bThemeProvider\b/.test(src) ||
      /\bcreateContext\b/.test(src)
    ) {
      offendersUi.push(norm);
    }
  }

  assertCase(
    block,
    "no.react",
    offendersReact.length === 0,
    offendersReact.length === 0
      ? "diagnostics chain has no React imports"
      : `React imports in: ${offendersReact.join(", ")}`,
  );

  assertCase(
    block,
    "no.app",
    offendersApp.length === 0,
    offendersApp.length === 0
      ? "diagnostics chain has no App imports"
      : `App imports in: ${offendersApp.join(", ")}`,
  );

  assertCase(
    block,
    "no.ui",
    offendersUi.length === 0,
    offendersUi.length === 0
      ? "diagnostics chain has no UI component / provider imports"
      : `UI imports in: ${offendersUi.join(", ")}`,
  );

  assertCase(
    block,
    "no.tsxInChain",
    DIAGNOSTICS_CHAIN.every((rel) => !rel.endsWith(".tsx")),
    "diagnostics chain contains no .tsx files",
  );

  // Ensure Pipeline imports stay within pipeline/ + diagnostics/ only
  // (outside those dirs — already certified by UX-3.20; re-check here).
  const runtimeAbs = join(repoRoot, "src/ui/theme/runtime");
  const pipelineAbs = join(repoRoot, "src/ui/theme/runtime/pipeline");
  const diagAbs = join(repoRoot, "src/ui/theme/runtime/diagnostics");
  const illegalPipelineImporters: string[] = [];

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
      illegalPipelineImporters.push(
        relative(repoRoot, full).replace(/\\/g, "/"),
      );
    }
  }

  assertCase(
    block,
    "no.externalPipelineImports",
    illegalPipelineImporters.length === 0,
    illegalPipelineImporters.length === 0
      ? "RuntimePipeline imports only inside pipeline/ or diagnostics/"
      : `illegal RuntimePipeline imports: ${illegalPipelineImporters.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — priorGates                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGates";
  const priors = [
    { id: "ux315", script: "scripts/validate-ux-3.15.ts", label: "ux-3.15" },
    { id: "ux316", script: "scripts/validate-ux-3.16.ts", label: "ux-3.16" },
    { id: "ux317", script: "scripts/validate-ux-3.17.ts", label: "ux-3.17" },
    { id: "ux318", script: "scripts/validate-ux-3.18.ts", label: "ux-3.18" },
    { id: "ux319", script: "scripts/validate-ux-3.19.ts", label: "ux-3.19" },
    { id: "ux320", script: "scripts/validate-ux-3.20.ts", label: "ux-3.20" },
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
  { id: "apiFreeze", pass: 1, ca: "CA-UX-3.21.1" },
  { id: "pipelineFreeze", pass: 2, ca: "CA-UX-3.21.2" },
  { id: "snapshotFreeze", pass: 3, ca: "CA-UX-3.21.3" },
  { id: "collectorFreeze", pass: 4, ca: "CA-UX-3.21.4" },
  { id: "reportFreeze", pass: 5, ca: "CA-UX-3.21.5" },
  { id: "reporterFreeze", pass: 6, ca: "CA-UX-3.21.6" },
  { id: "validationIndependence", pass: 7, ca: "CA-UX-3.21.7" },
  { id: "publicLayerFreeze", pass: 8, ca: "CA-UX-3.21.8" },
  { id: "noReactNoUiNoApp", pass: 9, ca: "CA-UX-3.21.9" },
  { id: "priorGates", pass: 10, ca: "CA-UX-3.21.10" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-3.21.11" },
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
console.log("validate:ux-3.21");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Runtime Certified");
  console.log("UX Runtime API Frozen");
  console.log("Release Ready");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
