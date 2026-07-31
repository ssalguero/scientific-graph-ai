/**
 * UX-3.11 — Theme Runtime Diagnostics Foundation gate.
 *
 * Blocks:
 * Layout · level/code freeze · message table · immutability · RULE_ORDER
 * Engine purity · health · rules · noReact · apiFreeze · collections
 * Cycles · frozen singletons · typecheck · prior UX-3.10
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DiagnosticCode,
  DiagnosticLevel,
  RuntimeDiagnosticBuilder,
  RuntimeDiagnosticEngine,
} from "../src/ui/theme/runtime/diagnostics";
import type { RuntimeSnapshot } from "../src/ui/theme/runtime/devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../src/ui/theme/runtime/metrics/RuntimeMetricsSnapshot";

type BlockId =
  | "diagnosticsLayout"
  | "levelAndCodeFreeze"
  | "messageTable"
  | "diagnosticImmutable"
  | "ruleOrder"
  | "enginePure"
  | "healthAggregate"
  | "rulesBehavior"
  | "noReact"
  | "apiFreeze"
  | "noObserversNoCache"
  | "noCycles"
  | "frozenSingletons"
  | "typecheckOk"
  | "ux310Ok";

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

const DIAG_DIR = "src/ui/theme/runtime/diagnostics";
const REQUIRED_FILES = [
  "DiagnosticLevel.ts",
  "DiagnosticCode.ts",
  "RuntimeDiagnostic.ts",
  "RuntimeDiagnosticBuilder.ts",
  "RuntimeDiagnosticEngine.ts",
  "RuntimeHealth.ts",
  "index.ts",
] as const;

const EXPECTED_CODES = [
  "EMPTY_REGISTRY",
  "NO_THEME_REGISTERED",
  "RESOLUTION_MISS",
  "CACHE_ACTIVITY_MISSING",
  "OBSERVER_INACTIVE",
  "METRICS_UNAVAILABLE",
] as const;

const EXPECTED_RULE_ORDER = [
  "EMPTY_REGISTRY",
  "NO_THEME_REGISTERED",
  "RESOLUTION_MISS",
  "CACHE_ACTIVITY_MISSING",
  "OBSERVER_INACTIVE",
  "METRICS_UNAVAILABLE",
] as const;

function readDiagSources(): string {
  return REQUIRED_FILES.map((f) => read(`${DIAG_DIR}/${f}`)).join("\n");
}

function emptyMetrics(
  overrides: Partial<RuntimeMetricsSnapshot> = {},
): RuntimeMetricsSnapshot {
  return {
    resolutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    fingerprintChanges: 0,
    observerNotifications: 0,
    snapshots: 0,
    ...overrides,
  };
}

function baseSnapshot(
  overrides: Partial<RuntimeSnapshot> = {},
): RuntimeSnapshot {
  return {
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
  };
}

/* -------------------------------------------------------------------------- */
/* diagnosticsLayout                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsLayout";
  const dir = join(repoRoot, DIAG_DIR);
  assertCase(
    block,
    "layout.dir",
    existsSync(dir),
    existsSync(dir) ? "diagnostics/ exists" : "diagnostics/ missing",
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

  const indexSrc = read(`${DIAG_DIR}/index.ts`);
  assertCase(
    block,
    "layout.privacyComment",
    /Not re-exported from @\/ui, theme\/index, runtime\/index, hooks\/index, or providers\/index/.test(
      indexSrc,
    ),
    "privacy comment matches metrics/devtools wording",
  );

  const reexports = [
    "DiagnosticLevel",
    "DiagnosticCode",
    "RuntimeDiagnostic",
    "RuntimeDiagnosticBuilder",
    "RuntimeDiagnosticEngine",
    "RuntimeHealth",
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
/* levelAndCodeFreeze                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "levelAndCodeFreeze";

  assertCase(
    block,
    "level.frozen",
    Object.isFrozen(DiagnosticLevel),
    "DiagnosticLevel is frozen",
  );
  assertCase(
    block,
    "code.frozen",
    Object.isFrozen(DiagnosticCode),
    "DiagnosticCode is frozen",
  );

  const levels = ["OK", "INFO", "WARNING", "ERROR"] as const;
  for (const L of levels) {
    assertCase(
      block,
      `level.has.${L}`,
      DiagnosticLevel[L] === L,
      `DiagnosticLevel.${L} === "${L}"`,
    );
  }

  for (const C of EXPECTED_CODES) {
    assertCase(
      block,
      `code.has.${C}`,
      DiagnosticCode[C] === C,
      `DiagnosticCode.${C} === "${C}"`,
    );
  }

  assertCase(
    block,
    "code.noCacheDisabled",
    !("CACHE_DISABLED" in DiagnosticCode),
    "CACHE_DISABLED not present (renamed to CACHE_ACTIVITY_MISSING)",
  );

  const levelSrc = stripComments(read(`${DIAG_DIR}/DiagnosticLevel.ts`));
  const codeSrc = stripComments(read(`${DIAG_DIR}/DiagnosticCode.ts`));
  assertCase(
    block,
    "level.noEnum",
    !/\benum\b/.test(levelSrc),
    "DiagnosticLevel.ts has no enum",
  );
  assertCase(
    block,
    "code.noEnum",
    !/\benum\b/.test(codeSrc),
    "DiagnosticCode.ts has no enum",
  );

  const allSrc = stripComments(readDiagSources());
  assertCase(
    block,
    "all.noEnum",
    !/\benum\b/.test(allSrc),
    "diagnostics/ has no TypeScript enum",
  );
}

/* -------------------------------------------------------------------------- */
/* messageTable                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "messageTable";
  const builderSrc = read(`${DIAG_DIR}/RuntimeDiagnosticBuilder.ts`);
  const stripped = stripComments(builderSrc);

  assertCase(
    block,
    "table.messages",
    /const DiagnosticMessages = Object\.freeze\(/.test(stripped),
    "DiagnosticMessages Object.freeze table present",
  );
  assertCase(
    block,
    "table.levels",
    /const DiagnosticLevelsByCode = Object\.freeze\(/.test(stripped),
    "DiagnosticLevelsByCode Object.freeze table present",
  );

  for (const C of EXPECTED_CODES) {
    assertCase(
      block,
      `table.msg.${C}`,
      stripped.includes(C) &&
        new RegExp(
          `DiagnosticMessages[\\s\\S]*${C}|\\[${C}\\]|${C}:`,
        ).test(builderSrc),
      `DiagnosticMessages covers ${C}`,
    );
  }

  assertCase(
    block,
    "build.signature",
    /function\s+build\s*\(\s*code\s*:\s*DiagnosticCode/.test(stripped) &&
      !/function\s+build\s*\([^)]*message/.test(stripped) &&
      !/function\s+build\s*\([^)]*level/.test(stripped),
    "build(code) only — no message/level params",
  );

  assertCase(
    block,
    "cache.heuristicDoc",
    /Heuristic only\. Indicates no cache hit\/miss activity was recorded while resolutions occurred\. Does not assert the cache is disabled\./.test(
      builderSrc,
    ),
    "CACHE_ACTIVITY_MISSING heuristic message exact",
  );

  for (const C of EXPECTED_CODES) {
    const d = RuntimeDiagnosticBuilder.build(DiagnosticCode[C]);
    assertCase(
      block,
      `table.runtime.${C}`,
      d.code === C && typeof d.message === "string" && d.message.length > 0,
      `${C} → message via build(code)`,
    );
  }

  const levelMap: Record<(typeof EXPECTED_CODES)[number], string> = {
    EMPTY_REGISTRY: DiagnosticLevel.ERROR,
    NO_THEME_REGISTERED: DiagnosticLevel.ERROR,
    RESOLUTION_MISS: DiagnosticLevel.WARNING,
    CACHE_ACTIVITY_MISSING: DiagnosticLevel.WARNING,
    OBSERVER_INACTIVE: DiagnosticLevel.INFO,
    METRICS_UNAVAILABLE: DiagnosticLevel.WARNING,
  };
  for (const C of EXPECTED_CODES) {
    const d = RuntimeDiagnosticBuilder.build(DiagnosticCode[C]);
    assertCase(
      block,
      `table.level.${C}`,
      d.level === levelMap[C],
      `${C} → level ${levelMap[C]} (got ${d.level})`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* diagnosticImmutable                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticImmutable";
  const d = RuntimeDiagnosticBuilder.build(DiagnosticCode.EMPTY_REGISTRY);
  assertCase(
    block,
    "diag.frozen",
    Object.isFrozen(d),
    "RuntimeDiagnostic from build is frozen",
  );
  const keys = Object.keys(d).sort().join(",");
  assertCase(
    block,
    "diag.shape",
    keys === "code,level,message",
    `shape is code,level,message (got ${keys})`,
  );
}

/* -------------------------------------------------------------------------- */
/* ruleOrder                                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "ruleOrder";
  const engineSrc = read(`${DIAG_DIR}/RuntimeDiagnosticEngine.ts`);
  const orderMatch = engineSrc.match(
    /const RULE_ORDER = Object\.freeze\(\[([\s\S]*?)\]\s*as const\)/,
  );
  assertCase(
    block,
    "order.declared",
    orderMatch !== null,
    "RULE_ORDER Object.freeze([...]) as const declared",
  );

  const extracted = orderMatch
    ? [...orderMatch[1]!.matchAll(/DiagnosticCode\.(\w+)/g)].map((m) => m[1]!)
    : [];
  assertCase(
    block,
    "order.exact",
    extracted.length === EXPECTED_RULE_ORDER.length &&
      EXPECTED_RULE_ORDER.every((c, i) => extracted[i] === c),
    `RULE_ORDER === [${EXPECTED_RULE_ORDER.join(", ")}] (got [${extracted.join(", ")}])`,
  );

  // Multi-rule fixture: EMPTY_REGISTRY + NO_THEME (tokenCount 0, empty name/fp)
  // plus RESOLUTION_MISS — output relative order must match RULE_ORDER
  const multi = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot({
      tokenCount: 0,
      themeName: "",
      fingerprint: "",
    }),
    emptyMetrics({ cacheMisses: 2 }),
  );
  const codes = multi.diagnostics.map((d) => d.code);
  const expectedMulti = [
    DiagnosticCode.EMPTY_REGISTRY,
    DiagnosticCode.NO_THEME_REGISTERED,
    DiagnosticCode.RESOLUTION_MISS,
  ];
  assertCase(
    block,
    "order.output",
    codes.length === expectedMulti.length &&
      expectedMulti.every((c, i) => codes[i] === c),
    `multi-rule order stable: [${codes.join(", ")}]`,
  );
}

/* -------------------------------------------------------------------------- */
/* enginePure                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "enginePure";
  const snap = baseSnapshot();
  const metrics = emptyMetrics({ resolutions: 1, cacheHits: 1 });
  const a = RuntimeDiagnosticEngine.evaluate(snap, metrics);
  const b = RuntimeDiagnosticEngine.evaluate(snap, metrics);
  assertCase(
    block,
    "pure.deterministic",
    a.healthy === b.healthy &&
      a.warningCount === b.warningCount &&
      a.errorCount === b.errorCount &&
      a.diagnostics.length === b.diagnostics.length &&
      a.diagnostics.every(
        (d, i) =>
          d.code === b.diagnostics[i]!.code &&
          d.level === b.diagnostics[i]!.level &&
          d.message === b.diagnostics[i]!.message,
      ),
    "double evaluate yields identical health",
  );
  assertCase(
    block,
    "pure.frozenHealth",
    Object.isFrozen(a) && Object.isFrozen(a.diagnostics),
    "RuntimeHealth and diagnostics array frozen",
  );
  assertCase(
    block,
    "engine.frozen",
    Object.isFrozen(RuntimeDiagnosticEngine),
    "RuntimeDiagnosticEngine namespace frozen",
  );
  assertCase(
    block,
    "builder.frozen",
    Object.isFrozen(RuntimeDiagnosticBuilder),
    "RuntimeDiagnosticBuilder namespace frozen",
  );
}

/* -------------------------------------------------------------------------- */
/* healthAggregate + rulesBehavior                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "rulesBehavior";

  // Clean OK case
  const clean = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot(),
    emptyMetrics({
      resolutions: 5,
      cacheHits: 3,
      cacheMisses: 0,
      fingerprintChanges: 1,
      observerNotifications: 2,
      snapshots: 1,
    }),
  );
  assertCase(
    block,
    "rules.clean",
    clean.diagnostics.length === 0 &&
      clean.healthy === true &&
      clean.warningCount === 0 &&
      clean.errorCount === 0,
    "clean snapshot+metrics → empty diagnostics, healthy",
  );

  // EMPTY_REGISTRY
  const emptyReg = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot({ tokenCount: 0, themeName: "light", fingerprint: "fp" }),
    emptyMetrics({ resolutions: 1, cacheHits: 1 }),
  );
  assertCase(
    block,
    "rules.EMPTY_REGISTRY",
    emptyReg.diagnostics.some((d) => d.code === DiagnosticCode.EMPTY_REGISTRY) &&
      emptyReg.errorCount >= 1 &&
      emptyReg.healthy === false,
    "EMPTY_REGISTRY fires at ERROR",
  );

  // NO_THEME_REGISTERED
  const noTheme = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot({ themeName: "", fingerprint: "fp" }),
    emptyMetrics({ resolutions: 1, cacheHits: 1, snapshots: 1 }),
  );
  assertCase(
    block,
    "rules.NO_THEME_REGISTERED",
    noTheme.diagnostics.some(
      (d) => d.code === DiagnosticCode.NO_THEME_REGISTERED,
    ) && noTheme.healthy === false,
    "NO_THEME_REGISTERED fires at ERROR",
  );

  const noFp = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot({ themeName: "light", fingerprint: "" }),
    emptyMetrics({ resolutions: 1, cacheHits: 1, snapshots: 1 }),
  );
  assertCase(
    block,
    "rules.NO_THEME_REGISTERED.fp",
    noFp.diagnostics.some(
      (d) => d.code === DiagnosticCode.NO_THEME_REGISTERED,
    ),
    "NO_THEME_REGISTERED fires on empty fingerprint",
  );

  // RESOLUTION_MISS
  const miss = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot(),
    emptyMetrics({ resolutions: 2, cacheMisses: 1 }),
  );
  assertCase(
    block,
    "rules.RESOLUTION_MISS",
    miss.diagnostics.some((d) => d.code === DiagnosticCode.RESOLUTION_MISS) &&
      miss.warningCount >= 1 &&
      miss.healthy === true,
    "RESOLUTION_MISS WARNING; still healthy",
  );

  // CACHE_ACTIVITY_MISSING
  const cacheMissAct = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot(),
    emptyMetrics({ resolutions: 3, cacheHits: 0, cacheMisses: 0 }),
  );
  assertCase(
    block,
    "rules.CACHE_ACTIVITY_MISSING",
    cacheMissAct.diagnostics.some(
      (d) => d.code === DiagnosticCode.CACHE_ACTIVITY_MISSING,
    ) && cacheMissAct.healthy === true,
    "CACHE_ACTIVITY_MISSING WARNING heuristic",
  );

  // OBSERVER_INACTIVE
  const obs = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot(),
    emptyMetrics({
      resolutions: 1,
      cacheHits: 1,
      fingerprintChanges: 2,
      observerNotifications: 0,
      snapshots: 1,
    }),
  );
  assertCase(
    block,
    "rules.OBSERVER_INACTIVE",
    obs.diagnostics.some((d) => d.code === DiagnosticCode.OBSERVER_INACTIVE) &&
      obs.diagnostics.find((d) => d.code === DiagnosticCode.OBSERVER_INACTIVE)
        ?.level === DiagnosticLevel.INFO &&
      obs.healthy === true,
    "OBSERVER_INACTIVE INFO; still healthy",
  );

  // METRICS_UNAVAILABLE
  const metricsUnavail = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot({ tokenCount: 5 }),
    emptyMetrics(),
  );
  assertCase(
    block,
    "rules.METRICS_UNAVAILABLE",
    metricsUnavail.diagnostics.some(
      (d) => d.code === DiagnosticCode.METRICS_UNAVAILABLE,
    ) && metricsUnavail.warningCount >= 1 &&
      metricsUnavail.healthy === true,
    "METRICS_UNAVAILABLE WARNING when tokens>0 and all counters 0",
  );

  // No OK diagnostic
  assertCase(
    block,
    "rules.noOkDiag",
    !clean.diagnostics.some((d) => d.level === DiagnosticLevel.OK),
    "no OK-level diagnostic emitted",
  );
}

{
  const block: BlockId = "healthAggregate";
  const health = RuntimeDiagnosticEngine.evaluate(
    baseSnapshot({ tokenCount: 0, themeName: "", fingerprint: "" }),
    emptyMetrics({ cacheMisses: 1 }),
  );
  const errors = health.diagnostics.filter(
    (d) => d.level === DiagnosticLevel.ERROR,
  ).length;
  const warnings = health.diagnostics.filter(
    (d) => d.level === DiagnosticLevel.WARNING,
  ).length;
  assertCase(
    block,
    "health.counts",
    health.errorCount === errors && health.warningCount === warnings,
    `errorCount=${health.errorCount} warningCount=${health.warningCount}`,
  );
  assertCase(
    block,
    "health.healthyFlag",
    health.healthy === (health.errorCount === 0),
    `healthy === (errorCount === 0) → ${health.healthy}`,
  );
}

/* -------------------------------------------------------------------------- */
/* noReact                                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const src = stripComments(readDiagSources());
  const bans = [
    { id: "react.import", re: /\bfrom\s+["']react["']|\brequire\s*\(\s*["']react["']/ },
    { id: "react.ident", re: /\bReact\b/ },
    { id: "hooks", re: /\buse(State|Effect|Memo|Callback|Ref|Context)\b/ },
    { id: "console", re: /\bconsole\.(log|warn|error|info|debug)\b/ },
    { id: "async", re: /\basync\b|\bawait\b|\bPromise\b/ },
    { id: "timers", re: /\bsetTimeout\b|\bsetInterval\b|\brequestAnimationFrame\b/ },
  ] as const;
  for (const b of bans) {
    assertCase(
      block,
      b.id,
      !b.re.test(src),
      !b.re.test(src) ? `no ${b.id}` : `found ${b.id}`,
    );
  }
  const files = readdirSync(join(repoRoot, DIAG_DIR));
  assertCase(
    block,
    "noTsx",
    !files.some((f) => f.endsWith(".tsx")),
    "no .tsx in diagnostics/",
  );
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
  const bannedSyms = [
    "DiagnosticLevel",
    "DiagnosticCode",
    "RuntimeDiagnostic",
    "RuntimeDiagnosticBuilder",
    "RuntimeDiagnosticEngine",
    "RuntimeHealth",
    "diagnostics",
  ];
  for (const barrel of barrels) {
    const src = existsSync(join(repoRoot, barrel))
      ? stripComments(read(barrel))
      : "";
    if (!existsSync(join(repoRoot, barrel))) {
      assertCase(
        block,
        `api.${barrel}`,
        true,
        `${barrel} absent (ok)`,
      );
      continue;
    }
    const hit = bannedSyms.find(
      (s) =>
        src.includes(`diagnostics`) ||
        new RegExp(`\\b${s}\\b`).test(src),
    );
    // More precise: must not re-export diagnostics folder or its symbols
    const exportsDiag =
      /from\s+["'][^"']*diagnostics[^"']*["']/.test(src) ||
      /runtime\/diagnostics/.test(src);
    const exportsSym = [
      "DiagnosticLevel",
      "DiagnosticCode",
      "RuntimeDiagnosticBuilder",
      "RuntimeDiagnosticEngine",
      "RuntimeHealth",
    ].some((s) => {
      const re = new RegExp(
        `export\\s+.*\\b${s}\\b|\\b${s}\\b\\s*,|\\b${s}\\b\\s*from`,
      );
      return re.test(src);
    });
    assertCase(
      block,
      `api.noExport.${barrel}`,
      !exportsDiag && !exportsSym,
      !exportsDiag && !exportsSym
        ? `${barrel} does not export diagnostics`
        : `${barrel} leaks diagnostics (hit=${hit ?? "pattern"})`,
    );
  }

  const providerSrc = stripComments(
    read("src/ui/providers/theme-provider.tsx"),
  );
  assertCase(
    block,
    "api.providerNoDiag",
    !/runtime\/diagnostics/.test(providerSrc),
    "ThemeProvider does not import diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* noObserversNoCache                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noObserversNoCache";
  const src = stripComments(readDiagSources());
  assertCase(
    block,
    "collections.noMap",
    !/\b(new\s+Map|WeakMap|new\s+Set|WeakSet)\b/.test(src),
    "no Map/Set/WeakMap/WeakSet",
  );
  assertCase(
    block,
    "noCollector",
    !/RuntimeMetricsCollector|RuntimeNotifier|RuntimeObserver/.test(src),
    "no Collector/Notifier/Observer imports",
  );
}

/* -------------------------------------------------------------------------- */
/* noCycles                                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noCycles";
  const banned = [
    /providers/,
    /theme-provider/,
    /observer/,
    /selectors/,
    /context/,
    /RuntimeMetricsCollector/,
    /RuntimeNotifier/,
    /RuntimeInspector/,
    /react/i,
    /hooks/,
    /runtime\/index/,
  ];

  for (const f of REQUIRED_FILES) {
    const imports = collectImports(stripComments(read(`${DIAG_DIR}/${f}`)));
    for (const spec of imports) {
      const isSibling = spec.startsWith("./");
      const isSnap =
        /devtools\/RuntimeSnapshot/.test(spec) ||
        /metrics\/RuntimeMetricsSnapshot/.test(spec);
      const bannedHit = banned.some((re) => re.test(spec));
      assertCase(
        block,
        `cycles.${f}.${spec}`,
        (isSibling || isSnap) && !bannedHit,
        (isSibling || isSnap) && !bannedHit
          ? `ok import ${spec}`
          : `banned/unexpected import ${spec} in ${f}`,
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* frozenSingletons                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenSingletons";
  const engineSrc = stripComments(
    read(`${DIAG_DIR}/RuntimeDiagnosticEngine.ts`),
  );
  const builderSrc = stripComments(
    read(`${DIAG_DIR}/RuntimeDiagnosticBuilder.ts`),
  );
  assertCase(
    block,
    "src.engineFreeze",
    /export const RuntimeDiagnosticEngine = Object\.freeze\(/.test(engineSrc),
    "Engine Object.freeze in source",
  );
  assertCase(
    block,
    "src.builderFreeze",
    /export const RuntimeDiagnosticBuilder = Object\.freeze\(/.test(builderSrc),
    "Builder Object.freeze in source",
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
/* Prior gate UX-3.10                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "ux310Ok";
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const run = spawnSync(npmCmd, ["run", "validate:ux-3.10"], {
    cwd: repoRoot,
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
  });
  const out = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
  const pass = run.status === 0 && /validate:ux-3\.10\s*\nPASS/m.test(out);
  assertCase(
    block,
    "prior.ux310",
    pass,
    pass
      ? "validate:ux-3.10 PASS"
      : `ux-3.10 failed: ${out.slice(-800)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; ca: string }> = [
  { id: "diagnosticsLayout", ca: "CA-UX-3.11.1" },
  { id: "levelAndCodeFreeze", ca: "CA-UX-3.11.2" },
  { id: "messageTable", ca: "CA-UX-3.11.3" },
  { id: "diagnosticImmutable", ca: "CA-UX-3.11.4" },
  { id: "ruleOrder", ca: "CA-UX-3.11.5" },
  { id: "enginePure", ca: "CA-UX-3.11.6" },
  { id: "healthAggregate", ca: "CA-UX-3.11.7" },
  { id: "rulesBehavior", ca: "CA-UX-3.11.8" },
  { id: "noReact", ca: "CA-UX-3.11.9" },
  { id: "apiFreeze", ca: "CA-UX-3.11.10" },
  { id: "noObserversNoCache", ca: "CA-UX-3.11.11" },
  { id: "noCycles", ca: "CA-UX-3.11.12" },
  { id: "frozenSingletons", ca: "CA-UX-3.11.13" },
  { id: "typecheckOk", ca: "CA-UX-3.11.14" },
  { id: "ux310Ok", ca: "prior" },
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
console.log("validate:ux-3.11");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
