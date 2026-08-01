/**
 * UX-3.19 — Runtime Pipeline Encapsulation Finalization gate.
 *
 * Blocks:
 * delegation · pipelineEncapsulates · reporterNoLayerImports
 * pipelinePrivate · noExternalPipelineImports · apiFreeze
 * behaviorParity · layersUntouched · priorGates · tscCompile
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { RuntimeReporter } from "../src/ui/theme/runtime/RuntimeReporter";
import { RuntimePipeline } from "../src/ui/theme/runtime/pipeline/RuntimePipeline";
import { RuntimeMetricsReporter } from "../src/ui/theme/runtime/metrics/RuntimeMetricsReporter";

type BlockId =
  | "delegation"
  | "pipelineEncapsulates"
  | "reporterNoLayerImports"
  | "pipelinePrivate"
  | "noExternalPipelineImports"
  | "apiFreeze"
  | "behaviorParity"
  | "layersUntouched"
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
const INDEX_PATH = "src/ui/theme/runtime/index.ts";
const RUNTIME_ROOT = "src/ui/theme/runtime";

/* -------------------------------------------------------------------------- */
/* PASS 01 — delegation                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "delegation";
  const src = stripComments(read(REPORTER_PATH));
  const diagSrc = stripComments(read(DIAGNOSTICS_PATH));

  assertCase(
    block,
    "delegates.collect",
    /const\s+report\s*=\s*RuntimeDiagnostics\.collect\s*\(\s*runtime\s*\)/.test(
      src,
    ),
    "const report = RuntimeDiagnostics.collect(runtime)",
  );

  assertCase(
    block,
    "delegates.returnReport",
    /return\s+report\s*;/.test(src) && !/return\s+report\.health\s*;/.test(src),
    "return report (not report.health)",
  );

  assertCase(
    block,
    "delegates.noPipelineInReporter",
    !/\bRuntimePipeline\b/.test(src),
    "RuntimeReporter does not reference RuntimePipeline",
  );

  assertCase(
    block,
    "delegates.noExtraLogic",
    !/\bSnapshotBuilder\b/.test(src) &&
      !/\bRuntimeMetricsReporter\b/.test(src) &&
      !/\bRuntimeHealthReporter\b/.test(src) &&
      !/\bRuntimeAggregation\w*\b/.test(src) &&
      !/\bRuntimeTelemetry\w*\b/.test(src) &&
      !/\bRuntimeReportCollector\b/.test(src) &&
      !/\bRuntimeReportReporter\b/.test(src) &&
      !/\bRuntimeReportBuilder\b/.test(src),
    "RuntimeReporter has no layer orchestration symbols",
  );

  const buildBody = src.match(
    /function\s+build\s*\([^)]*\)[^{]*\{([\s\S]*?)\}/,
  );
  const body = buildBody?.[1] ?? "";
  assertCase(
    block,
    "delegates.buildBodyMinimal",
    /RuntimeDiagnostics\.collect/.test(body) &&
      /return\s+report\s*;/.test(body) &&
      !/\bnew\s+/.test(body) &&
      !/\{\s*\.\.\./.test(body) &&
      !/\bObject\.assign\b/.test(body) &&
      !/\bstructuredClone\b/.test(body),
    "build() body is only Diagnostics.collect + return report",
  );

  assertCase(
    block,
    "delegates.diagnosticsRunsPipeline",
    /const\s+report\s*=\s*RuntimePipeline\.run\s*\(\s*runtime\s*\)/.test(
      diagSrc,
    ) && /return\s+report\s*;/.test(diagSrc),
    "RuntimeDiagnostics.collect → RuntimePipeline.run → return report",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — pipelineEncapsulates                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelineEncapsulates";
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
    "pipeline.neverReturnHealth",
    !/return\s+health\s*;/.test(src) &&
      !/return\s+runtimeReport\.health\s*;/.test(src),
    "never return health or runtimeReport.health",
  );

  assertCase(
    block,
    "pipeline.noBarrelIndex",
    !existsSync(join(repoRoot, "src/ui/theme/runtime/pipeline/index.ts")),
    "no pipeline/index.ts barrel",
  );

  assertCase(
    block,
    "pipeline.fileExists",
    existsSync(join(repoRoot, PIPELINE_PATH)),
    `${PIPELINE_PATH} exists`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — reporterNoLayerImports                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterNoLayerImports";
  const src = stripComments(read(REPORTER_PATH));
  const diagSrc = stripComments(read(DIAGNOSTICS_PATH));

  const fromMatches = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (m) => m[1],
  );

  const allowedFrom = [
    "./diagnostics/RuntimeDiagnostics",
    "./selectors/ThemeSelector",
    "./report/RuntimeReportTypes",
  ];

  const unexpected = fromMatches.filter((f) => !allowedFrom.includes(f));

  assertCase(
    block,
    "imports.onlyAllowed",
    unexpected.length === 0,
    unexpected.length === 0
      ? "imports = RuntimeDiagnostics + ThemeRuntime type + RuntimeReportSnapshot type"
      : `unexpected imports: ${unexpected.join(", ")}`,
  );

  assertCase(
    block,
    "imports.noPipelineInReporter",
    !/\bRuntimePipeline\b/.test(src) &&
      !fromMatches.some((f) => /pipeline/.test(f)),
    "RuntimeReporter does not import RuntimePipeline",
  );

  const diagFrom = [...diagSrc.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (m) => m[1],
  );
  const diagAllowed = [
    "../pipeline/RuntimePipeline",
    "../selectors/ThemeSelector",
    "../report/RuntimeReportTypes",
  ];
  const diagUnexpected = diagFrom.filter((f) => !diagAllowed.includes(f));

  assertCase(
    block,
    "imports.diagnosticsOnlyAllowed",
    diagUnexpected.length === 0 &&
      diagFrom.includes("../pipeline/RuntimePipeline"),
    diagUnexpected.length === 0
      ? "RuntimeDiagnostics imports = RuntimePipeline + types"
      : `unexpected diagnostics imports: ${diagUnexpected.join(", ")}`,
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
  ];

  const foundBanned = banned.filter((s) => new RegExp(`\\b${s}\\b`).test(src));
  const foundBannedDiag = banned.filter((s) =>
    new RegExp(`\\b${s}\\b`).test(diagSrc),
  );

  assertCase(
    block,
    "imports.noLayerSymbols",
    foundBanned.length === 0 && foundBannedDiag.length === 0,
    foundBanned.length === 0 && foundBannedDiag.length === 0
      ? "no Snapshot/Metrics/Health/Aggregation/Telemetry/Report layer imports"
      : `banned symbols: ${[...foundBanned, ...foundBannedDiag].join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — pipelinePrivate                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "pipelinePrivate";
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
    "RuntimeReportSnapshot",
    "RuntimeReportBuilder",
    "RuntimeReportCollector",
    "RuntimeReportReporter",
  ];

  for (const barrel of barrels) {
    if (!existsSync(join(repoRoot, barrel))) {
      assertCase(block, `private.${barrel}`, true, `${barrel} absent (ok)`);
      continue;
    }
    const src = stripComments(read(barrel));
    const leaks = leakIdents.some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    const pathLeak = /runtime\/pipeline/.test(src);

    assertCase(
      block,
      `private.noExport.${barrel}`,
      !leaks && !pathLeak,
      !leaks && !pathLeak
        ? `${barrel} does not export pipeline`
        : `${barrel} leaks RuntimePipeline / pipeline path`,
    );
  }

  const indexSrc = stripComments(read(INDEX_PATH));
  assertCase(
    block,
    "index.noPipeline",
    !/\bRuntimePipeline\b/.test(indexSrc) &&
      !/\bpipeline\b/i.test(indexSrc) &&
      !/\bRuntimeReporter\b/.test(indexSrc),
    "runtime/index.ts has no RuntimePipeline / RuntimeReporter",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — noExternalPipelineImports                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noExternalPipelineImports";
  const runtimeAbs = join(repoRoot, RUNTIME_ROOT);
  const srcRoot = join(repoRoot, "src");
  const offenders: string[] = [];

  for (const full of walkFiles(srcRoot)) {
    if (full.startsWith(runtimeAbs + "\\") || full.startsWith(runtimeAbs + "/")) {
      continue;
    }
    // Also allow files exactly under runtime (Windows/posix)
    const relToRuntime = relative(runtimeAbs, full);
    if (!relToRuntime.startsWith("..") && !relToRuntime.includes(":")) {
      continue;
    }

    const src = readFileSync(full, "utf8");
    if (
      /runtime\/pipeline/.test(src) ||
      /from\s+["'][^"']*pipeline\/RuntimePipeline[^"']*["']/.test(src)
    ) {
      offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
  }

  // Scripts may import for validation — only forbid under src/ outside runtime/
  assertCase(
    block,
    "imports.onlyInsideRuntime",
    offenders.length === 0,
    offenders.length === 0
      ? "no src/ imports of runtime/pipeline outside runtime/"
      : `external pipeline imports: ${offenders.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — apiFreeze                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  const reporterSrc = stripComments(read(REPORTER_PATH));
  const pipelineSrc = stripComments(read(PIPELINE_PATH));

  assertCase(
    block,
    "api.reporterFrozenExport",
    /export const RuntimeReporter = Object\.freeze\(\{\s*build\s*,?\s*\}\)/.test(
      reporterSrc,
    ),
    "export const RuntimeReporter = Object.freeze({ build })",
  );

  assertCase(
    block,
    "api.pipelineFrozenExport",
    /export const RuntimePipeline = Object\.freeze\(\{\s*run\s*,?\s*\}\)/.test(
      pipelineSrc,
    ),
    "export const RuntimePipeline = Object.freeze({ run })",
  );

  assertCase(
    block,
    "api.reporterKeys",
    Object.keys(RuntimeReporter).length === 1 && "build" in RuntimeReporter,
    "RuntimeReporter keys = [build]",
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
    "api.pipelineFrozen",
    Object.isFrozen(RuntimePipeline),
    "Object.isFrozen(RuntimePipeline)",
  );

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
    "api.pipelineSignature",
    /function\s+run\s*\(\s*runtime\s*:\s*ThemeRuntime\s*\)\s*:\s*Readonly<\s*RuntimeReportSnapshot\s*>/.test(
      pipelineSrc,
    ),
    "run(...): Readonly<RuntimeReportSnapshot>",
  );

  assertCase(
    block,
    "api.noRuntimeReportType",
    !/\btype\s+RuntimeReport\b/.test(reporterSrc) &&
      !/\binterface\s+RuntimeReport\b/.test(reporterSrc) &&
      !/\btype\s+RuntimeReport\b/.test(pipelineSrc) &&
      !/\binterface\s+RuntimeReport\b/.test(pipelineSrc),
    "does not invent a RuntimeReport type",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — behaviorParity                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "behaviorParity";
  const src = stripComments(read(REPORTER_PATH));
  const diagSrc = stripComments(read(DIAGNOSTICS_PATH));

  assertCase(
    block,
    "parity.directReturn",
    /const\s+report\s*=\s*RuntimeDiagnostics\.collect\s*\(\s*runtime\s*\)\s*;\s*return\s+report\s*;/.test(
      src,
    ),
    "returns exactly the object from RuntimeDiagnostics.collect (no transform)",
  );

  assertCase(
    block,
    "parity.diagnosticsDirectReturn",
    /const\s+report\s*=\s*RuntimePipeline\.run\s*\(\s*runtime\s*\)\s*;\s*return\s+report\s*;/.test(
      diagSrc,
    ),
    "RuntimeDiagnostics returns exactly RuntimePipeline.run result",
  );

  assertCase(
    block,
    "parity.noClone",
    !/\bstructuredClone\b/.test(src) &&
      !/\bJSON\.parse\b/.test(src) &&
      !/\bJSON\.stringify\b/.test(src) &&
      !/\bstructuredClone\b/.test(diagSrc) &&
      !/\bJSON\.parse\b/.test(diagSrc) &&
      !/\bJSON\.stringify\b/.test(diagSrc),
    "no clone",
  );

  assertCase(
    block,
    "parity.noSpread",
    !/\{\s*\.\.\./.test(src) &&
      !/\[\s*\.\.\./.test(src) &&
      !/\{\s*\.\.\./.test(diagSrc) &&
      !/\[\s*\.\.\./.test(diagSrc),
    "no spread",
  );

  assertCase(
    block,
    "parity.noMapping",
    !/\.map\s*\(/.test(src) &&
      !/\bObject\.assign\b/.test(src) &&
      !/\bObject\.fromEntries\b/.test(src) &&
      !/\.map\s*\(/.test(diagSrc) &&
      !/\bObject\.assign\b/.test(diagSrc) &&
      !/\bObject\.fromEntries\b/.test(diagSrc),
    "no mapping / Object.assign reconstruction",
  );

  assertCase(
    block,
    "parity.noHealthProjection",
    !/return\s+report\.health\s*;/.test(src) &&
      !/return\s+.*\.health\s*;/.test(src) &&
      !/return\s+report\.health\s*;/.test(diagSrc) &&
      !/return\s+.*\.health\s*;/.test(diagSrc),
    "no .health projection",
  );

  // Runtime identity: same call path produces same reference chain via
  // direct delegation (source-level). Do not assert report shape keys —
  // that remains UX-3.18 responsibility.
  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtimeA = ThemeTokenResolver.resolve("light");
  const viaReporter = RuntimeReporter.build(runtimeA);

  TokenCache.clear();
  RuntimeMetricsReporter.reset();
  const runtimeB = ThemeTokenResolver.resolve("light");
  const viaPipeline = RuntimePipeline.run(runtimeB);

  assertCase(
    block,
    "parity.samePublicTypeContract",
    viaReporter !== null &&
      typeof viaReporter === "object" &&
      viaPipeline !== null &&
      typeof viaPipeline === "object" &&
      Object.isFrozen(viaReporter) &&
      Object.isFrozen(viaPipeline),
    "both paths return frozen objects (shape owned by UX-3.18)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — layersUntouched                                                  */
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

  assertCase(
    block,
    "layers.readable",
    layerFiles.every((f) => fileHash(f).length === 64),
    "all frozen layer files readable",
  );

  const pipelineSrc = stripComments(read(PIPELINE_PATH));
  assertCase(
    block,
    "pipeline.enc.noCollectorBuild",
    !/collector\.build\s*\(/.test(pipelineSrc) &&
      !/telemetry\.build\s*\(/.test(pipelineSrc) &&
      !/report\.build\s*\(/.test(pipelineSrc) &&
      !/aggregation\.build\s*\(/.test(pipelineSrc) &&
      !/accumulator\.build\s*\(/.test(pipelineSrc),
    "pipeline never calls collector/accumulator.build()",
  );

  assertCase(
    block,
    "pipeline.enc.soleEntries",
    /RuntimeAggregationReporter\.build\s*\(\s*aggregation\s*\)/.test(
      pipelineSrc,
    ) &&
      /RuntimeTelemetryReporter\.build\s*\(\s*telemetry\s*\)/.test(
        pipelineSrc,
      ) &&
      /RuntimeReportReporter\.build\s*\(\s*report\s*\)/.test(pipelineSrc),
    "sole entries via Aggregation/Telemetry/Report Reporters",
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
    { id: "ux317", script: "scripts/validate-ux-3.17.ts", label: "ux-3.17" },
    { id: "ux318", script: "scripts/validate-ux-3.18.ts", label: "ux-3.18" },
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
  { id: "delegation", pass: 1, ca: "CA-UX-3.19.2" },
  { id: "pipelineEncapsulates", pass: 2, ca: "CA-UX-3.19.1" },
  { id: "reporterNoLayerImports", pass: 3, ca: "CA-UX-3.19.2" },
  { id: "pipelinePrivate", pass: 4, ca: "CA-UX-3.19.5" },
  { id: "noExternalPipelineImports", pass: 5, ca: "CA-UX-3.19.5" },
  { id: "apiFreeze", pass: 6, ca: "CA-UX-3.19.3" },
  { id: "behaviorParity", pass: 7, ca: "CA-UX-3.19.4" },
  { id: "layersUntouched", pass: 8, ca: "CA-UX-3.19.6" },
  { id: "priorGates", pass: 9, ca: "CA-UX-3.19.8" },
  { id: "tscCompile", pass: 10, ca: "CA-UX-3.19.8" },
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
console.log("validate:ux-3.19");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
