/**
 * UX-3.10 — Theme Runtime Metrics Foundation gate.
 *
 * Blocks (12):
 * Layout · collector · snapshot · reporter
 * Purity — noReact · apiFreeze · noCollections · noDuplicateSites · noCycles
 * Gates — buildOk · typecheckOk
 * Prior — ux39Ok
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  RuntimeMetricsCollector,
  RuntimeMetricsReporter,
} from "../src/ui/theme/runtime/metrics";
import { RuntimeNotifier } from "../src/ui/theme/runtime/observer";
import { SnapshotBuilder } from "../src/ui/theme/runtime/devtools";
import { resolve } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";

type BlockId =
  | "metricsLayout"
  | "collectorPrivate"
  | "snapshotImmutable"
  | "reporterFunctional"
  | "noReact"
  | "apiFreeze"
  | "o1Recording"
  | "noAllocations"
  | "noCollections"
  | "noDuplicateSites"
  | "noCycles"
  | "frozenSingletons"
  | "buildOk"
  | "typecheckOk"
  | "ux39Ok";

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

function collectImports(src: string): string[] {
  return [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!);
}

const METRICS_DIR = "src/ui/theme/runtime/metrics";
const REQUIRED_FILES = [
  "RuntimeMetrics.ts",
  "RuntimeMetricsCollector.ts",
  "RuntimeMetricsSnapshot.ts",
  "RuntimeMetricsReporter.ts",
  "index.ts",
] as const;

function readMetricsSources(): string {
  return REQUIRED_FILES.map((f) => read(`${METRICS_DIR}/${f}`)).join("\n");
}

function extractFunctionBody(src: string, name: string): string {
  const re = new RegExp(
    `function\\s+${name}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\{`,
  );
  const match = re.exec(src);
  if (!match || match.index === undefined) return "";
  let i = match.index + match[0].length;
  let depth = 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  return src.slice(start, i - 1);
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.1 — metricsLayout                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "metricsLayout";

  assertCase(
    block,
    "layout.dir.exists",
    existsSync(join(repoRoot, METRICS_DIR)),
    METRICS_DIR,
  );

  for (const file of REQUIRED_FILES) {
    const rel = `${METRICS_DIR}/${file}`;
    assertCase(block, `layout.file.${file}`, existsSync(join(repoRoot, rel)), rel);
  }

  const privateBarrel = read(`${METRICS_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privateReexports",
    /\bRuntimeMetrics\b/.test(privateBarrel) &&
      /\bRuntimeMetricsSnapshot\b/.test(privateBarrel) &&
      /\bRuntimeMetricsCollector\b/.test(privateBarrel) &&
      /\bRuntimeMetricsReporter\b/.test(privateBarrel),
    "private metrics barrel reexports directory",
  );

  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported/.test(privateBarrel),
    "private barrel documents non-export privacy",
  );

  const typeSrc = stripComments(read(`${METRICS_DIR}/RuntimeMetrics.ts`));
  assertCase(
    block,
    "layout.type.sixScalars",
    /readonly resolutions:\s*number/.test(typeSrc) &&
      /readonly cacheHits:\s*number/.test(typeSrc) &&
      /readonly cacheMisses:\s*number/.test(typeSrc) &&
      /readonly fingerprintChanges:\s*number/.test(typeSrc) &&
      /readonly observerNotifications:\s*number/.test(typeSrc) &&
      /readonly snapshots:\s*number/.test(typeSrc),
    "RuntimeMetrics has six readonly scalar counters",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.2 — collectorPrivate                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "collectorPrivate";
  const src = stripComments(
    read(`${METRICS_DIR}/RuntimeMetricsCollector.ts`),
  );

  assertCase(
    block,
    "collector.methods",
    /\brecordResolution\b/.test(src) &&
      /\brecordCacheHit\b/.test(src) &&
      /\brecordCacheMiss\b/.test(src) &&
      /\brecordFingerprintChange\b/.test(src) &&
      /\brecordObserverNotifications\b/.test(src) &&
      /\brecordSnapshot\b/.test(src) &&
      /\bgetCounters\b/.test(src) &&
      /\bresetCounters\b/.test(src),
    "Collector exposes record* + getCounters/resetCounters",
  );

  assertCase(
    block,
    "collector.pluralNotifications",
    /\brecordObserverNotifications\b/.test(src) &&
      !/\brecordObserverNotification\s*\(/.test(src),
    "uses plural recordObserverNotifications",
  );

  assertCase(
    block,
    "collector.sixLets",
    (src.match(/\blet\s+\w+\s*=\s*0\b/g) ?? []).length === 6,
    "exactly six module-level scalar lets initialized to 0",
  );

  assertCase(
    block,
    "collector.callable",
    typeof RuntimeMetricsCollector.recordResolution === "function" &&
      typeof RuntimeMetricsCollector.recordCacheHit === "function" &&
      typeof RuntimeMetricsCollector.recordCacheMiss === "function" &&
      typeof RuntimeMetricsCollector.recordFingerprintChange === "function" &&
      typeof RuntimeMetricsCollector.recordObserverNotifications ===
        "function" &&
      typeof RuntimeMetricsCollector.recordSnapshot === "function",
    "Collector record* methods are functions",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.3 — snapshotImmutable                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "snapshotImmutable";

  RuntimeMetricsReporter.reset();
  RuntimeMetricsCollector.recordResolution();
  RuntimeMetricsCollector.recordCacheHit();
  const snap = RuntimeMetricsReporter.getSnapshot();

  assertCase(
    block,
    "snapshot.frozen",
    Object.isFrozen(snap),
    "getSnapshot returns Object.isFrozen snapshot",
  );

  assertCase(
    block,
    "snapshot.scalars",
    snap.resolutions === 1 &&
      snap.cacheHits === 1 &&
      snap.cacheMisses === 0 &&
      snap.fingerprintChanges === 0 &&
      snap.observerNotifications === 0 &&
      snap.snapshots === 0,
    `snap=${JSON.stringify(snap)}`,
  );

  const src = stripComments(
    read(`${METRICS_DIR}/RuntimeMetricsSnapshot.ts`),
  );
  assertCase(
    block,
    "snapshot.usesFreeze",
    /Object\.freeze\s*\(/.test(src) &&
      /\bcreateRuntimeMetricsSnapshot\b/.test(src),
    "RuntimeMetricsSnapshot uses Object.freeze + create helper",
  );

  RuntimeMetricsReporter.reset();
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.4 — reporterFunctional                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reporterFunctional";

  RuntimeMetricsReporter.reset();
  RuntimeMetricsCollector.recordResolution();
  RuntimeMetricsCollector.recordCacheMiss();
  RuntimeMetricsCollector.recordFingerprintChange();
  RuntimeMetricsCollector.recordObserverNotifications(3);
  RuntimeMetricsCollector.recordSnapshot();

  const before = RuntimeMetricsReporter.getSnapshot();
  assertCase(
    block,
    "reporter.getSnapshot",
    before.resolutions === 1 &&
      before.cacheMisses === 1 &&
      before.fingerprintChanges === 1 &&
      before.observerNotifications === 3 &&
      before.snapshots === 1,
    `before=${JSON.stringify(before)}`,
  );

  RuntimeMetricsReporter.reset();
  const after = RuntimeMetricsReporter.getSnapshot();
  assertCase(
    block,
    "reporter.reset",
    after.resolutions === 0 &&
      after.cacheHits === 0 &&
      after.cacheMisses === 0 &&
      after.fingerprintChanges === 0 &&
      after.observerNotifications === 0 &&
      after.snapshots === 0,
    `after=${JSON.stringify(after)}`,
  );

  assertCase(
    block,
    "reporter.api",
    typeof RuntimeMetricsReporter.getSnapshot === "function" &&
      typeof RuntimeMetricsReporter.reset === "function",
    "Reporter exposes getSnapshot/reset",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.5 — noReact                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const code = stripComments(readMetricsSources());

  assertCase(
    block,
    "react.noImport",
    !/\bfrom\s+["']react["']/.test(code) &&
      !/\bfrom\s+["']react\//.test(code) &&
      !/\brequire\s*\(\s*["']react["']/.test(code) &&
      !/\bReact\b/.test(code),
    "metrics/ has no React imports / React identifier",
  );

  assertCase(
    block,
    "react.noHooks",
    !/\buseMemo\b/.test(code) &&
      !/\buseRef\b/.test(code) &&
      !/\buseEffect\b/.test(code) &&
      !/\buseState\b/.test(code) &&
      !/\buseContext\b/.test(code),
    "metrics/ bans hooks",
  );

  assertCase(
    block,
    "react.noAsync",
    !/\bPromise\b/.test(code) &&
      !/\basync\b/.test(code) &&
      !/\bawait\b/.test(code) &&
      !/\bsetTimeout\b/.test(code) &&
      !/\bsetInterval\b/.test(code) &&
      !/\bconsole\b/.test(code),
    "metrics/ bans async/timers/console",
  );

  const metricsFiles = readdirSync(join(repoRoot, METRICS_DIR));
  assertCase(
    block,
    "react.noJsx",
    metricsFiles.every((f) => !f.endsWith(".tsx")),
    "metrics/ has no tsx",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.6 — apiFreeze                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const forbidden = [
    "RuntimeMetricsCollector",
    "RuntimeMetricsReporter",
    "RuntimeMetricsSnapshot",
    "createRuntimeMetricsSnapshot",
    "recordResolution",
    "recordSnapshot",
  ];

  const barrels: Array<[string, string]> = [
    ["src/ui/index.ts", "ui"],
    ["src/ui/theme/index.ts", "theme"],
    ["src/ui/theme/runtime/index.ts", "runtime"],
    ["src/ui/theme/hooks/index.ts", "hooks"],
    ["src/ui/providers/index.ts", "providers"],
  ];

  for (const [rel, id] of barrels) {
    const code = stripComments(read(rel));
    const hit = forbidden.find((sym) => new RegExp(`\\b${sym}\\b`).test(code));
    assertCase(
      block,
      `freeze.${id}.clean`,
      hit === undefined && !/\bmetrics\b/.test(code),
      hit ? `${rel} leaks ${hit}` : `${rel} has no metrics exports`,
    );
  }

  const runtimeBarrel = stripComments(read("src/ui/theme/runtime/index.ts"));
  assertCase(
    block,
    "freeze.runtimeNoMetrics",
    !/\bmetrics\b/.test(runtimeBarrel),
    "theme/runtime/index.ts excludes metrics/",
  );

  const providerSrc = stripComments(read("src/ui/providers/theme-provider.tsx"));
  assertCase(
    block,
    "freeze.providerNoMetrics",
    !/\bRuntimeMetricsCollector\b/.test(providerSrc) &&
      !/\brecordSnapshot\b/.test(providerSrc) &&
      !/\brecordFingerprintChange\b/.test(providerSrc),
    "ThemeProvider does not instrument metrics directly",
  );

  const tokenCacheSrc = stripComments(
    read("src/ui/theme/tokens/runtime/TokenCache.ts"),
  );
  assertCase(
    block,
    "freeze.tokenCacheUntouched",
    !/\bRuntimeMetricsCollector\b/.test(tokenCacheSrc) &&
      !/\brecordCache/.test(tokenCacheSrc),
    "TokenCache does not import metrics",
  );

  const inspectorSrc = stripComments(
    read("src/ui/theme/runtime/devtools/RuntimeInspector.ts"),
  );
  assertCase(
    block,
    "freeze.inspectorUntouched",
    !/\bRuntimeMetricsCollector\b/.test(inspectorSrc) &&
      !/\brecordSnapshot\b/.test(inspectorSrc),
    "RuntimeInspector does not record metrics",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.7 — o1Recording                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "o1Recording";
  const src = stripComments(
    read(`${METRICS_DIR}/RuntimeMetricsCollector.ts`),
  );

  const recordFns = [
    "recordResolution",
    "recordCacheHit",
    "recordCacheMiss",
    "recordFingerprintChange",
    "recordObserverNotifications",
    "recordSnapshot",
  ] as const;

  for (const name of recordFns) {
    const body = extractFunctionBody(src, name);
    assertCase(
      block,
      `o1.${name}`,
      body.length > 0 &&
        (/\+=\s*1/.test(body) || /\+=\s*count/.test(body)) &&
        !/\bfor\b/.test(body) &&
        !/\bwhile\b/.test(body) &&
        !/\.map\b/.test(body) &&
        !/\.forEach\b/.test(body),
      body ? `body ok` : `missing body for ${name}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.8 — noAllocations (record* bodies)                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noAllocations";
  const src = stripComments(
    read(`${METRICS_DIR}/RuntimeMetricsCollector.ts`),
  );

  const recordFns = [
    "recordResolution",
    "recordCacheHit",
    "recordCacheMiss",
    "recordFingerprintChange",
    "recordObserverNotifications",
    "recordSnapshot",
  ] as const;

  for (const name of recordFns) {
    const body = extractFunctionBody(src, name);
    assertCase(
      block,
      `alloc.${name}`,
      body.length > 0 &&
        !/\bnew\b/.test(body) &&
        !/\[/.test(body) &&
        !/\{/.test(body) &&
        !/\bObject\b/.test(body) &&
        !/\bArray\b/.test(body),
      body.includes("{")
        ? `${name} allocates object`
        : body
          ? "allocation-free"
          : `missing ${name}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Collector collections ban                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noCollections";
  const src = stripComments(
    read(`${METRICS_DIR}/RuntimeMetricsCollector.ts`),
  );

  assertCase(
    block,
    "collections.noMap",
    !/\bMap\b/.test(src),
    "Collector has no Map",
  );
  assertCase(
    block,
    "collections.noSet",
    !/\bSet\b/.test(src),
    "Collector has no Set",
  );
  assertCase(
    block,
    "collections.noWeakMap",
    !/\bWeakMap\b/.test(src),
    "Collector has no WeakMap",
  );
  assertCase(
    block,
    "collections.noWeakSet",
    !/\bWeakSet\b/.test(src),
    "Collector has no WeakSet",
  );
  assertCase(
    block,
    "collections.noArray",
    !/\bArray\b/.test(src) && !/\[\s*\]/.test(src),
    "Collector has no arrays",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.11 — frozenSingletons                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenSingletons";
  const collectorSrc = read(`${METRICS_DIR}/RuntimeMetricsCollector.ts`);
  const reporterSrc = read(`${METRICS_DIR}/RuntimeMetricsReporter.ts`);

  assertCase(
    block,
    "freeze.collectorSource",
    /export const RuntimeMetricsCollector\s*=\s*Object\.freeze\s*\(/.test(
      collectorSrc,
    ),
    "Collector uses Object.freeze in source",
  );
  assertCase(
    block,
    "freeze.reporterSource",
    /export const RuntimeMetricsReporter\s*=\s*Object\.freeze\s*\(/.test(
      reporterSrc,
    ),
    "Reporter uses Object.freeze in source",
  );
  assertCase(
    block,
    "freeze.collectorRuntime",
    Object.isFrozen(RuntimeMetricsCollector),
    "RuntimeMetricsCollector is frozen at runtime",
  );
  assertCase(
    block,
    "freeze.reporterRuntime",
    Object.isFrozen(RuntimeMetricsReporter),
    "RuntimeMetricsReporter is frozen at runtime",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.12 — noDuplicateSites                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noDuplicateSites";

  const themeRoot = join(repoRoot, "src/ui/theme");
  const hits: { snap: string[]; fp: string[] } = { snap: [], fp: [] };

  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
      const rel = full.slice(repoRoot.length + 1).replace(/\\/g, "/");
      const code = stripComments(read(rel));
      if (/\.recordSnapshot\s*\(/.test(code) || /\brecordSnapshot\s*\(/.test(code)) {
        // definition site in Collector is allowed; call sites only
        if (!rel.endsWith("RuntimeMetricsCollector.ts")) {
          hits.snap.push(rel);
        }
      }
      if (
        /\.recordFingerprintChange\s*\(/.test(code) ||
        (/\brecordFingerprintChange\s*\(/.test(code) &&
          !rel.endsWith("RuntimeMetricsCollector.ts"))
      ) {
        if (!rel.endsWith("RuntimeMetricsCollector.ts")) {
          hits.fp.push(rel);
        }
      }
    }
  }

  walk(themeRoot);

  assertCase(
    block,
    "dup.recordSnapshot.unique",
    hits.snap.length === 1 &&
      hits.snap[0] === "src/ui/theme/runtime/devtools/SnapshotBuilder.ts",
    `recordSnapshot call sites: ${hits.snap.join(", ") || "(none)"}`,
  );

  assertCase(
    block,
    "dup.recordFingerprintChange.unique",
    hits.fp.length === 1 &&
      hits.fp[0] === "src/ui/theme/runtime/observer/RuntimeNotifier.ts",
    `recordFingerprintChange call sites: ${hits.fp.join(", ") || "(none)"}`,
  );

  const resolverSrc = stripComments(
    read("src/ui/theme/tokens/runtime/ThemeTokenResolver.ts"),
  );
  assertCase(
    block,
    "wire.resolver",
    /RuntimeMetricsCollector\.recordResolution/.test(resolverSrc) &&
      /RuntimeMetricsCollector\.recordCacheHit/.test(resolverSrc) &&
      /RuntimeMetricsCollector\.recordCacheMiss/.test(resolverSrc),
    "ThemeTokenResolver records resolution/hit/miss",
  );

  // Behavioral smoke: resolve increments
  RuntimeMetricsReporter.reset();
  TokenCache.clear();
  resolve("light");
  const afterMiss = RuntimeMetricsReporter.getSnapshot();
  assertCase(
    block,
    "wire.resolveMiss",
    afterMiss.resolutions === 1 && afterMiss.cacheMisses === 1,
    `afterMiss=${JSON.stringify(afterMiss)}`,
  );
  resolve("light");
  const afterHit = RuntimeMetricsReporter.getSnapshot();
  assertCase(
    block,
    "wire.resolveHit",
    afterHit.resolutions === 2 &&
      afterHit.cacheHits === 1 &&
      afterHit.cacheMisses === 1,
    `afterHit=${JSON.stringify(afterHit)}`,
  );

  RuntimeMetricsReporter.reset();
  RuntimeNotifier.notifyIfChanged("a", "b");
  const afterNotify = RuntimeMetricsReporter.getSnapshot();
  assertCase(
    block,
    "wire.notifier",
    afterNotify.fingerprintChanges === 1,
    `afterNotify=${JSON.stringify(afterNotify)}`,
  );

  RuntimeMetricsReporter.reset();
  // SnapshotBuilder needs a real runtime — reuse resolved tokens
  const runtime = resolve("light");
  SnapshotBuilder.build(runtime);
  const afterSnap = RuntimeMetricsReporter.getSnapshot();
  assertCase(
    block,
    "wire.snapshotBuilder",
    afterSnap.snapshots >= 1,
    `afterSnap=${JSON.stringify(afterSnap)}`,
  );

  RuntimeMetricsReporter.reset();
}

/* -------------------------------------------------------------------------- */
/* noCycles                                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noCycles";

  const metricsImports = REQUIRED_FILES.flatMap((f) =>
    collectImports(stripComments(read(`${METRICS_DIR}/${f}`))),
  );

  const bannedFromMetrics = [
    /providers/,
    /context/,
    /observer/,
    /devtools/,
    /selectors/,
    /theme-provider/,
    /react/i,
  ];

  const metricsHit = metricsImports.find((spec) =>
    bannedFromMetrics.some((re) => re.test(spec)),
  );
  assertCase(
    block,
    "cycles.metricsLeaf",
    metricsHit === undefined,
    metricsHit
      ? `metrics imports banned path: ${metricsHit}`
      : "metrics/ is a leaf (no providers/context/observer/devtools/selectors/react)",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.9 — no visual impact (ThemeProvider unchanged for metrics)      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";
  // already covered providerNoMetrics; add explicit visual-impact alias case
  const providerSrc = stripComments(read("src/ui/providers/theme-provider.tsx"));
  assertCase(
    block,
    "visual.providerUnchangedMetrics",
    !/from\s+["'][^"']*runtime\/metrics["']/.test(providerSrc),
    "ThemeProvider does not import runtime/metrics",
  );
}

/* -------------------------------------------------------------------------- */
/* CA-UX-3.10.10 — buildOk                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "buildOk";
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const buildRun = spawnSync(npmCmd, ["run", "build"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const pass = buildRun.status === 0;
  assertCase(
    block,
    "build.next",
    pass,
    pass
      ? "npm run build PASS"
      : `build failed: ${(buildRun.stderr || buildRun.stdout || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* typecheckOk                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "typecheckOk";
  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const pass = tsc.status === 0;
  assertCase(
    block,
    "tsc.noEmit",
    pass,
    pass
      ? "npx tsc --noEmit PASS"
      : `tsc failed: ${(tsc.stderr || tsc.stdout || "").slice(0, 500)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Prior gate UX-3.9                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "ux39Ok";
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const run = spawnSync(npmCmd, ["run", "validate:ux-3.9"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const out = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
  const pass = run.status === 0 && /validate:ux-3\.9\s*\nPASS/m.test(out);
  assertCase(
    block,
    "prior.ux39",
    pass,
    pass
      ? "validate:ux-3.9 PASS"
      : `ux-3.9 failed: ${out.slice(-800)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary — map blocks to CA ids                                             */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; ca: string }> = [
  { id: "metricsLayout", ca: "CA-UX-3.10.1" },
  { id: "collectorPrivate", ca: "CA-UX-3.10.2" },
  { id: "snapshotImmutable", ca: "CA-UX-3.10.3" },
  { id: "reporterFunctional", ca: "CA-UX-3.10.4" },
  { id: "noReact", ca: "CA-UX-3.10.5" },
  { id: "apiFreeze", ca: "CA-UX-3.10.6+9" },
  { id: "o1Recording", ca: "CA-UX-3.10.7" },
  { id: "noAllocations", ca: "CA-UX-3.10.8" },
  { id: "noCollections", ca: "collections" },
  { id: "frozenSingletons", ca: "CA-UX-3.10.11" },
  { id: "noDuplicateSites", ca: "CA-UX-3.10.12" },
  { id: "noCycles", ca: "noCycles" },
  { id: "buildOk", ca: "CA-UX-3.10.10a" },
  { id: "typecheckOk", ca: "CA-UX-3.10.10b" },
  { id: "ux39Ok", ca: "prior" },
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
console.log("validate:ux-3.10");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
