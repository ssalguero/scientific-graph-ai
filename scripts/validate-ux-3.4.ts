/**
 * UX-3.4 — Runtime Optimization gate.
 *
 * 10 blocks: API, Theme IDs, snapshots, exports, no app/ imports,
 * ThemeTokenResolver contract, TokenCache contract, no Benchmark exports,
 * no Metrics exports, private helpers + resolver identity.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { THEME_IDS } from "../src/ui/theme/ids";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import { Benchmark } from "../src/ui/theme/tokens/runtime/Benchmark";
import { PerformanceCounters } from "../src/ui/theme/tokens/runtime/PerformanceCounters";
import { RuntimeMetrics } from "../src/ui/theme/tokens/runtime/RuntimeMetrics";

type BlockId =
  | "Public API"
  | "Theme IDs"
  | "Snapshots"
  | "Exports"
  | "No app imports"
  | "ThemeTokenResolver contract"
  | "TokenCache contract"
  | "No Benchmark exports"
  | "No Metrics exports"
  | "Private helpers + identity";

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

function listTsFiles(absDir: string): string[] {
  if (!existsSync(absDir)) {
    return [];
  }

  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      const st = statSync(abs);
      if (st.isDirectory()) {
        walk(abs);
        continue;
      }
      if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) {
        out.push(abs);
      }
    }
  };
  walk(absDir);
  return out;
}

const EXPECTED_TOKENS_BARREL = `/**
 * UX-3.2.6 — Design Tokens module barrel.
 * Package-internal surface only — not reexported from @/ui or theme/index.
 */

export type { ColorTokens } from "./contracts/ColorTokens";
export type { TypographyTokens } from "./contracts/TypographyTokens";
export type { SpacingTokens } from "./contracts/SpacingTokens";
export type { RadiusTokens } from "./contracts/RadiusTokens";
export type { ShadowTokens } from "./contracts/ShadowTokens";
export type { MotionTokens } from "./contracts/MotionTokens";
export type { ElevationTokens } from "./contracts/ElevationTokens";
export type { LayoutTokens } from "./contracts/LayoutTokens";
export type { ResolvedDesignTokens } from "./contracts/ResolvedDesignTokens";

export { ThemeTokenResolver } from "./runtime/ThemeTokenResolver";
export { TokenCache } from "./runtime/TokenCache";
export * as TokenValidation from "./runtime/TokenValidation";

export { useTokens } from "./hooks/useTokens";
`;

/* -------------------------------------------------------------------------- */
/* 1. Public API                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Public API";
  const uiIndex = read("src/ui/index.ts");

  assertCase(
    block,
    "api.uiNoTokenHooks",
    !/\buseTokens\b/.test(uiIndex) &&
      !/\buseColorToken\b/.test(uiIndex) &&
      !/\bfrom\s+["']\.\/theme\/tokens/.test(uiIndex) &&
      !/\bThemeTokenResolver\b/.test(uiIndex) &&
      !/\bTokenCache\b/.test(uiIndex),
    "@/ui must not export token runtime / hooks",
  );

  assertCase(
    block,
    "api.uiKeepsProvider",
    /\bThemeProvider\b/.test(uiIndex) && /\buseTheme\b/.test(uiIndex),
    "ThemeProvider + useTheme remain on @/ui",
  );

  const providersIndex = read("src/ui/providers/index.ts");
  assertCase(
    block,
    "api.providersBarrel",
    providersIndex.includes("ThemeProvider") &&
      providersIndex.includes("useTheme") &&
      !/\bstable-theme-css-vars\b/.test(providersIndex) &&
      !/\bBenchmark\b/.test(providersIndex),
    "providers barrel unchanged (no private helpers)",
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Theme IDs                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Theme IDs";
  assertCase(
    block,
    "ids.exact",
    THEME_IDS.length === 4 &&
      THEME_IDS[0] === "light" &&
      THEME_IDS[1] === "dark" &&
      THEME_IDS[2] === "highContrastLight" &&
      THEME_IDS[3] === "highContrastDark",
    `THEME_IDS=${JSON.stringify(THEME_IDS)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Snapshots                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Snapshots";
  const snapDir = "src/ui/theme/tokens/__snapshots__";

  TokenCache.clear();

  for (const themeId of THEME_IDS) {
    const rel = `${snapDir}/${themeId}.json`;
    const abs = join(repoRoot, rel);

    if (!existsSync(abs)) {
      assertCase(block, `snapshots.${themeId}.exists`, false, `missing ${rel}`);
      continue;
    }

    const expected = read(rel).replace(/\r\n/g, "\n").trimEnd();
    const actualObj = ThemeTokenResolver.resolve(themeId);
    const actual = `${JSON.stringify(actualObj, null, 2)}\n`.trimEnd();

    assertCase(
      block,
      `snapshots.${themeId}.match`,
      actual === expected,
      actual === expected ? "byte match" : `drift in "${themeId}"`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Exports                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Exports";
  const barrel = read("src/ui/theme/tokens/index.ts");
  assertCase(
    block,
    "exports.tokensBarrel",
    barrel.replace(/\r\n/g, "\n") === EXPECTED_TOKENS_BARREL.replace(/\r\n/g, "\n"),
    "theme/tokens/index.ts exact freeze",
  );

  const themeRuntimeBarrel = read("src/ui/theme/runtime/index.ts");
  assertCase(
    block,
    "exports.themeRuntimeNoOpt",
    !/\bBenchmark\b/.test(themeRuntimeBarrel) &&
      !/\bRuntimeMetrics\b/.test(themeRuntimeBarrel) &&
      !/\bPerformanceCounters\b/.test(themeRuntimeBarrel) &&
      !/\bResolverOptimization\b/.test(themeRuntimeBarrel),
    "theme/runtime barrel has no UX-3.4 private helpers",
  );

  const themeIndex = read("src/ui/theme/index.ts");
  assertCase(
    block,
    "exports.themeIndexNoOpt",
    !/\bBenchmark\b/.test(themeIndex) &&
      !/\bRuntimeMetrics\b/.test(themeIndex) &&
      !/\bPerformanceCounters\b/.test(themeIndex) &&
      !/\bResolverOptimization\b/.test(themeIndex),
    "theme/index has no UX-3.4 private helpers",
  );
}

/* -------------------------------------------------------------------------- */
/* 5. No app/ imports                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "No app imports";
  const themeFiles = listTsFiles(join(repoRoot, "src/ui/theme"));
  let bad: string[] = [];

  for (const abs of themeFiles) {
    const rel = relative(repoRoot, abs).replace(/\\/g, "/");
    const src = read(rel);
    const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map(
      (m) => m[1],
    );
    for (const spec of imports) {
      const n = spec.replace(/\\/g, "/");
      if (
        n.includes("/app/") ||
        n.startsWith("app/") ||
        n.startsWith("@/app") ||
        /(^|\/)app\//.test(n)
      ) {
        bad.push(`${rel} → ${spec}`);
      }
    }
  }

  assertCase(
    block,
    "imports.noApp",
    bad.length === 0,
    bad.length === 0 ? "no app/ imports in theme/" : bad.join("; "),
  );
}

/* -------------------------------------------------------------------------- */
/* 6. ThemeTokenResolver contract                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "ThemeTokenResolver contract";
  const resolverSrc = read(
    "src/ui/theme/tokens/runtime/ThemeTokenResolver.ts",
  );

  assertCase(
    block,
    "resolver.signature",
    /export function resolve\(theme: ThemeId \| ThemeMap\): ResolvedDesignTokens/.test(
      resolverSrc,
    ) &&
      /export const ThemeTokenResolver = \{[\s\S]*resolve,[\s\S]*\} as const/.test(
        resolverSrc,
      ),
    "resolve(theme) + ThemeTokenResolver.resolve",
  );

  assertCase(
    block,
    "resolver.callable",
    typeof ThemeTokenResolver.resolve === "function",
    "ThemeTokenResolver.resolve is a function",
  );
}

/* -------------------------------------------------------------------------- */
/* 7. TokenCache contract                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "TokenCache contract";
  const cacheSrc = read("src/ui/theme/tokens/runtime/TokenCache.ts");

  assertCase(
    block,
    "cache.surface",
    /export const TokenCache = \{/.test(cacheSrc) &&
      /\bhas\b/.test(cacheSrc) &&
      /\bget\b/.test(cacheSrc) &&
      /\bset\b/.test(cacheSrc) &&
      /\bclear\b/.test(cacheSrc),
    "TokenCache has/get/set/clear",
  );

  assertCase(
    block,
    "cache.noPublicDelete",
    !/^\s*delete\s*\(/m.test(cacheSrc) &&
      !/\bdelete\s*\(theme/.test(cacheSrc),
    "no public delete()",
  );

  assertCase(
    block,
    "cache.runtime",
    typeof TokenCache.has === "function" &&
      typeof TokenCache.get === "function" &&
      typeof TokenCache.set === "function" &&
      typeof TokenCache.clear === "function",
    "TokenCache methods callable",
  );
}

/* -------------------------------------------------------------------------- */
/* 8. No Benchmark exports                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "No Benchmark exports";
  const uiIndex = read("src/ui/index.ts");
  const tokensBarrel = read("src/ui/theme/tokens/index.ts");
  const themeIndex = read("src/ui/theme/index.ts");
  const runtimeBarrel = read("src/ui/theme/runtime/index.ts");

  const noBench =
    !/\bBenchmark\b/.test(uiIndex) &&
    !/\bBenchmark\b/.test(tokensBarrel) &&
    !/\bBenchmark\b/.test(themeIndex) &&
    !/\bBenchmark\b/.test(runtimeBarrel);

  assertCase(block, "bench.notExported", noBench, "Benchmark not in public barrels");
}

/* -------------------------------------------------------------------------- */
/* 9. No Metrics exports                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "No Metrics exports";
  const uiIndex = read("src/ui/index.ts");
  const tokensBarrel = read("src/ui/theme/tokens/index.ts");
  const themeIndex = read("src/ui/theme/index.ts");
  const runtimeBarrel = read("src/ui/theme/runtime/index.ts");

  const noMetrics =
    !/\bRuntimeMetrics\b/.test(uiIndex) &&
    !/\bPerformanceCounters\b/.test(uiIndex) &&
    !/\bRuntimeMetrics\b/.test(tokensBarrel) &&
    !/\bPerformanceCounters\b/.test(tokensBarrel) &&
    !/\bRuntimeMetrics\b/.test(themeIndex) &&
    !/\bPerformanceCounters\b/.test(themeIndex) &&
    !/\bRuntimeMetrics\b/.test(runtimeBarrel) &&
    !/\bPerformanceCounters\b/.test(runtimeBarrel);

  assertCase(
    block,
    "metrics.notExported",
    noMetrics,
    "RuntimeMetrics / PerformanceCounters not in public barrels",
  );
}

/* -------------------------------------------------------------------------- */
/* 10. Private helpers + resolver identity                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Private helpers + identity";

  const privateFiles = [
    "src/ui/theme/tokens/runtime/ResolverOptimization.ts",
    "src/ui/theme/tokens/runtime/Benchmark.ts",
    "src/ui/theme/tokens/runtime/PerformanceCounters.ts",
    "src/ui/theme/tokens/runtime/RuntimeMetrics.ts",
  ];

  for (const rel of privateFiles) {
    assertCase(
      block,
      `helpers.exists.${rel.split("/").pop()}`,
      existsSync(join(repoRoot, rel)),
      rel,
    );
  }

  TokenCache.clear();
  const a = ThemeTokenResolver.resolve("light");
  const b = ThemeTokenResolver.resolve("light");
  assertCase(
    block,
    "identity.resolveLight",
    Object.is(a, b),
    "Object.is(resolve('light'), resolve('light'))",
  );

  /* Behavioral: resolver same input → same JSON + identity */
  TokenCache.clear();
  const r1 = ThemeTokenResolver.resolve("dark");
  const r2 = ThemeTokenResolver.resolve("dark");
  assertCase(
    block,
    "behavior.resolver.identity",
    Object.is(r1, r2),
    "dark resolve identity",
  );
  assertCase(
    block,
    "behavior.resolver.json",
    JSON.stringify(r1) === JSON.stringify(r2),
    "dark resolve JSON equal",
  );

  /* Behavioral: cache same references */
  TokenCache.clear();
  const built = ThemeTokenResolver.resolve("highContrastLight");
  assertCase(
    block,
    "behavior.cache.getSame",
    Object.is(TokenCache.get("highContrastLight"), built),
    "TokenCache.get returns same ref as resolve",
  );

  /* Behavioral: shared invariant domains across themes */
  TokenCache.clear();
  const light = ThemeTokenResolver.resolve("light");
  const dark = ThemeTokenResolver.resolve("dark");
  assertCase(
    block,
    "behavior.invariants.shared",
    Object.is(light.typography, dark.typography) &&
      Object.is(light.spacing, dark.spacing) &&
      Object.is(light.layout, dark.layout),
    "invariant domains shared across themes",
  );

  /* Behavioral: Benchmark */
  Benchmark.reset();
  Benchmark.setEnabled(true);
  Benchmark.start("t");
  const dur = Benchmark.stop();
  assertCase(
    block,
    "behavior.benchmark.startStop",
    typeof dur === "number" && dur >= 0 && Benchmark.getSamples().length === 1,
    `duration=${dur} samples=${Benchmark.getSamples().length}`,
  );

  const measured = Benchmark.measure(() => 42, "m");
  assertCase(
    block,
    "behavior.benchmark.measure",
    measured === 42 && Benchmark.getSamples().length === 2,
    "measure returns fn result",
  );

  Benchmark.reset();
  assertCase(
    block,
    "behavior.benchmark.reset",
    Benchmark.getSamples().length === 0,
    "reset clears samples",
  );
  Benchmark.setEnabled(false);

  /* Behavioral: PerformanceCounters */
  PerformanceCounters.reset();
  PerformanceCounters.setEnabled(true);
  PerformanceCounters.inc("hits");
  PerformanceCounters.inc("hits");
  assertCase(
    block,
    "behavior.counters.inc",
    PerformanceCounters.get("hits") === 2,
    `hits=${PerformanceCounters.get("hits")}`,
  );
  PerformanceCounters.reset();
  assertCase(
    block,
    "behavior.counters.reset",
    PerformanceCounters.get("hits") === 0,
    "counter reset",
  );
  PerformanceCounters.setEnabled(false);

  const snap = RuntimeMetrics.snapshot();
  assertCase(
    block,
    "behavior.metrics.snapshot",
    Array.isArray(snap.counters) && Array.isArray(snap.samples),
    "RuntimeMetrics.snapshot shape",
  );

  /* Hooks: source-level memoization */
  const useTokensSrc = read("src/ui/theme/tokens/hooks/useTokens.ts");
  assertCase(
    block,
    "behavior.hooks.useTokensMemo",
    /useMemo\(\s*\(\)\s*=>\s*resolve\(theme\)\s*,\s*\[\s*theme\s*\]\s*\)/.test(
      useTokensSrc,
    ) && /export function useTokens\(\): ResolvedDesignTokens/.test(useTokensSrc),
    "useTokens keeps useMemo(() => resolve(theme), [theme])",
  );

  const providerSrc = read("src/ui/providers/theme-provider.tsx");
  assertCase(
    block,
    "behavior.hooks.providerMemo",
    /\buseMemo\b/.test(providerSrc) &&
      /\buseCallback\b/.test(providerSrc) &&
      /\buseRef\b/.test(providerSrc) &&
      /getStableThemeCssVars/.test(providerSrc) &&
      /value = useMemo/.test(providerSrc),
    "ThemeProvider memoizes value/cssVars; stable setTheme via ref",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "Public API",
  "Theme IDs",
  "Snapshots",
  "Exports",
  "No app imports",
  "ThemeTokenResolver contract",
  "TokenCache contract",
  "No Benchmark exports",
  "No Metrics exports",
  "Private helpers + identity",
];

let passCount = 0;
for (const block of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0;
  if (ok) passCount += 1;
  const dots = ".".repeat(Math.max(1, 32 - block.length));
  console.log(`${block} ${dots} ${ok ? "PASS" : "FAIL"}`);
  if (!ok) {
    for (const f of failed) {
      console.error(`  FAIL ${f.id}: ${f.detail}`);
    }
  }
}

console.log(
  `UX-3.4 Validation: ${passCount}/${BLOCKS.length} ${passCount === BLOCKS.length ? "PASS" : "FAIL"}`,
);

if (passCount !== BLOCKS.length) {
  process.exitCode = 1;
}
