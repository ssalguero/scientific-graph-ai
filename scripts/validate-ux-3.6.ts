/**
 * UX-3.6 — Theme Runtime Selectors & Memoization Foundation gate.
 *
 * Blocks: Selector, createSelector, memoSelector, equality, cache,
 * Runtime, Hooks, Barrel.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { THEME_IDS } from "../src/ui/theme/ids";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import {
  createSelector,
  has as cacheHas,
  memoSelector,
  referenceEqual,
  shallowEqual,
  strictEqual,
  type ThemeRuntime,
  type ThemeSelector,
} from "../src/ui/theme/runtime/selectors";

type BlockId =
  | "Selector"
  | "createSelector"
  | "memoSelector"
  | "equality"
  | "cache"
  | "Runtime"
  | "Hooks"
  | "Barrel";

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

const SELECTORS_DIR = "src/ui/theme/runtime/selectors";

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
/* 1. Selector                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Selector";

  const themeSelectorRel = `${SELECTORS_DIR}/ThemeSelector.ts`;
  assertCase(
    block,
    "selector.file.exists",
    existsSync(join(repoRoot, themeSelectorRel)),
    themeSelectorRel,
  );

  const src = read(themeSelectorRel);
  assertCase(
    block,
    "selector.ThemeRuntime.alias",
    /export type ThemeRuntime\s*=\s*ResolvedDesignTokens/.test(src),
    "ThemeRuntime = ResolvedDesignTokens",
  );

  assertCase(
    block,
    "selector.ThemeSelector.type",
    /export type ThemeSelector\s*<\s*T\s*>\s*=\s*\(\s*runtime:\s*ThemeRuntime\s*\)\s*=>\s*T/.test(
      src.replace(/\s+/g, " "),
    ) ||
      /export type ThemeSelector<T>\s*=\s*\(runtime: ThemeRuntime\)\s*=>\s*T/.test(
        src,
      ),
    "ThemeSelector<T> = (runtime: ThemeRuntime) => T",
  );

  /* Type-level smoke: ThemeRuntime is usable as ResolvedDesignTokens shape */
  TokenCache.clear();
  const runtime: ThemeRuntime = ThemeTokenResolver.resolve("light");
  const selectColors: ThemeSelector<ThemeRuntime["colors"]> = (r) => r.colors;
  assertCase(
    block,
    "selector.runtime.smoke",
    Object.is(selectColors(runtime), runtime.colors),
    "ThemeSelector over ThemeRuntime identity slice",
  );
}

/* -------------------------------------------------------------------------- */
/* 2. createSelector                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "createSelector";

  const rel = `${SELECTORS_DIR}/createSelector.ts`;
  assertCase(block, "createSelector.exists", existsSync(join(repoRoot, rel)), rel);

  const src = read(rel);
  assertCase(
    block,
    "createSelector.export",
    /export function createSelector\s*</.test(src),
    "export function createSelector",
  );

  const sel: ThemeSelector<string> = (r) => r.colors.background;
  const wrapped = createSelector(sel);
  assertCase(
    block,
    "createSelector.passthrough",
    Object.is(wrapped, sel),
    "returns exactly the selector received",
  );

  TokenCache.clear();
  const runtime = ThemeTokenResolver.resolve("dark");
  assertCase(
    block,
    "createSelector.invoke",
    Object.is(wrapped(runtime), sel(runtime)),
    "passthrough invoke identical",
  );
}

/* -------------------------------------------------------------------------- */
/* 3. memoSelector                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "memoSelector";

  const rel = `${SELECTORS_DIR}/memoSelector.ts`;
  assertCase(block, "memoSelector.exists", existsSync(join(repoRoot, rel)), rel);

  const src = read(rel);
  assertCase(
    block,
    "memoSelector.export",
    /export function memoSelector\s*</.test(src),
    "export function memoSelector SSOT",
  );

  assertCase(
    block,
    "memoSelector.weakMapGuard",
    /typeof tokens === ["']object["']/.test(src) &&
      /tokens !== null/.test(src),
    "WeakMap only for non-null objects",
  );

  TokenCache.clear();
  const tokens = ThemeTokenResolver.resolve("light");
  let calls = 0;
  const sel = (t: typeof tokens) => {
    calls += 1;
    return t.colors;
  };

  const first = memoSelector(tokens, undefined, undefined, sel);
  assertCase(
    block,
    "memoSelector.first",
    Object.is(first, tokens.colors) && calls === 1,
    "first call computes",
  );

  const second = memoSelector(tokens, tokens, first, sel);
  assertCase(
    block,
    "memoSelector.fastPath",
    Object.is(second, first) && calls === 1,
    "identity fast-path skips select",
  );

  /* WeakMap hit: same runtime + select, no previousTokens path */
  const third = memoSelector(tokens, undefined, undefined, sel);
  assertCase(
    block,
    "memoSelector.weakMapHit",
    Object.is(third, first) && calls === 1,
    "WeakMap reuses result for same runtime+select",
  );

  assertCase(
    block,
    "memoSelector.cacheHas",
    cacheHas(tokens, sel),
    "cache.has(runtime, select) true after compute",
  );

  /* Primitives: no cache, always select */
  let primCalls = 0;
  const primSel = (n: number) => {
    primCalls += 1;
    return n * 2;
  };
  const p1 = memoSelector(3, undefined, undefined, primSel);
  const p2 = memoSelector(3, undefined, undefined, primSel);
  assertCase(
    block,
    "memoSelector.primitiveNoCache",
    p1 === 6 && p2 === 6 && primCalls === 2,
    "primitives never use WeakMap",
  );
}

/* -------------------------------------------------------------------------- */
/* 4. equality                                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "equality";

  const rel = `${SELECTORS_DIR}/equality.ts`;
  assertCase(block, "equality.exists", existsSync(join(repoRoot, rel)), rel);

  const src = read(rel);
  assertCase(
    block,
    "equality.exports",
    /\bexport function referenceEqual\b/.test(src) &&
      /\bexport function strictEqual\b/.test(src) &&
      /\bexport function shallowEqual\b/.test(src),
    "referenceEqual, strictEqual, shallowEqual",
  );

  assertCase(
    block,
    "equality.referenceEqual",
    referenceEqual(NaN, NaN) &&
      !referenceEqual(0, -0) &&
      referenceEqual(1, 1),
    "referenceEqual = Object.is",
  );

  assertCase(
    block,
    "equality.strictEqual",
    !strictEqual(NaN, NaN) &&
      strictEqual(0, -0) &&
      strictEqual(1, 1),
    "strictEqual = ===",
  );

  const a = { x: 1, y: 2 };
  const b = { x: 1, y: 2 };
  const c = { x: 1, y: 3 };
  assertCase(
    block,
    "equality.shallowEqual",
    shallowEqual(a, b) &&
      !shallowEqual(a, c) &&
      shallowEqual(a, a) &&
      !shallowEqual(a, null),
    "shallowEqual uses Object.is per property",
  );
}

/* -------------------------------------------------------------------------- */
/* 5. cache                                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "cache";

  const rel = `${SELECTORS_DIR}/cache.ts`;
  assertCase(block, "cache.exists", existsSync(join(repoRoot, rel)), rel);

  const src = read(rel);
  const code = stripComments(src);

  assertCase(
    block,
    "cache.weakMap",
    /\bWeakMap\b/.test(code) && /new WeakMap/.test(code),
    "uses WeakMap",
  );

  assertCase(
    block,
    "cache.api",
    /\bexport function has\b/.test(src) &&
      /\bexport function get\b/.test(src) &&
      /\bexport function set\b/.test(src),
    "has / get / set",
  );

  assertCase(
    block,
    "cache.noSerialize",
    !/\bJSON\.stringify\b/.test(code) &&
      !/\bJSON\.parse\b/.test(code) &&
      !/\bMap\s*</.test(code.replace(/WeakMap/g, "")),
    "never serializes; no strong Map store",
  );

  assertCase(
    block,
    "cache.functionIdentity",
    /WeakMap<\s*Function/.test(code.replace(/\s+/g, " ")) ||
      /WeakMap<Function/.test(code),
    "selector key = Function identity",
  );

  assertCase(
    block,
    "cache.ephemeralComment",
    /ephemeral|GC|WeakMap/i.test(src),
    "documented as ephemeral / GC-bound",
  );

  /* Private module — not part of runtime barrel (checked in Barrel block) */
  assertCase(
    block,
    "cache.privateModule",
    existsSync(join(repoRoot, `${SELECTORS_DIR}/index.ts`)),
    "selectors barrel private",
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Runtime                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Runtime";

  const tokensBarrel = read("src/ui/theme/tokens/index.ts");
  assertCase(
    block,
    "runtime.tokensBarrel",
    tokensBarrel.replace(/\r\n/g, "\n") ===
      EXPECTED_TOKENS_BARREL.replace(/\r\n/g, "\n"),
    "tokens barrel exact freeze",
  );

  assertCase(
    block,
    "runtime.themeIds",
    THEME_IDS.length === 4 &&
      THEME_IDS[0] === "light" &&
      THEME_IDS[1] === "dark" &&
      THEME_IDS[2] === "highContrastLight" &&
      THEME_IDS[3] === "highContrastDark",
    `THEME_IDS=${JSON.stringify(THEME_IDS)}`,
  );

  const resolverSrc = read(
    "src/ui/theme/tokens/runtime/ThemeTokenResolver.ts",
  );
  assertCase(
    block,
    "runtime.resolverSignature",
    /export function resolve\(theme: ThemeId \| ThemeMap\): ResolvedDesignTokens/.test(
      resolverSrc,
    ),
    "ThemeTokenResolver.resolve unchanged",
  );

  const cacheSrc = read("src/ui/theme/tokens/runtime/TokenCache.ts");
  assertCase(
    block,
    "runtime.tokenCacheApi",
    /\bhas\(/.test(cacheSrc) &&
      /\bget\(/.test(cacheSrc) &&
      /\bset\(/.test(cacheSrc) &&
      /\bclear\(/.test(cacheSrc),
    "TokenCache API unchanged",
  );

  const runtimeBarrel = read("src/ui/theme/runtime/index.ts");
  assertCase(
    block,
    "runtime.barrelNoSelectors",
    !/\bselectors\b/.test(stripComments(runtimeBarrel)) &&
      !/\bmemoSelector\b/.test(runtimeBarrel) &&
      !/\bcreateSelector\b/.test(runtimeBarrel) &&
      !/\bThemeSelector\b/.test(runtimeBarrel),
    "theme/runtime/index.ts unchanged (no selectors export)",
  );

  TokenCache.clear();
  const a = ThemeTokenResolver.resolve("light");
  const b = ThemeTokenResolver.resolve("light");
  assertCase(
    block,
    "runtime.resolverIdentity",
    Object.is(a, b),
    "resolve(light) identity preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* 7. Hooks                                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Hooks";

  const useTokensSrc = read("src/ui/theme/tokens/hooks/useTokens.ts");
  assertCase(
    block,
    "hooks.useTokens.unchanged",
    /export function useTokens\(\):\s*ResolvedDesignTokens/.test(useTokensSrc) &&
      /from\s+["']\.\.\/runtime\/ThemeTokenResolver["']/.test(useTokensSrc) &&
      /resolve\(theme\)/.test(useTokensSrc),
    "useTokens signature/resolve path intact",
  );

  for (const { file, slice, name } of [
    { file: "useElevation.ts", slice: "elevation", name: "useElevation" },
    { file: "useMotion.ts", slice: "motion", name: "useMotion" },
  ] as const) {
    const src = stripComments(read(`src/ui/theme/hooks/${file}`));
    assertCase(
      block,
      `hooks.${name}.identity`,
      new RegExp(`return\\s+useTokens\\(\\)\\.${slice}\\s*;`).test(src) &&
        !/\bmemoSelector\b/.test(src) &&
        !/\bruntime\/selectors\b/.test(src),
      `${name} still identity useTokens().${slice}`,
    );
  }

  const hooksSelectors = read("src/ui/theme/hooks/selectors.ts");
  assertCase(
    block,
    "hooks.selectors.noMemo",
    !/\bmemoSelector\b/.test(hooksSelectors) &&
      !/\bruntime\/selectors\b/.test(hooksSelectors),
    "hooks/selectors.ts untouched by runtime selectors",
  );

  const helpersSrc = read("src/ui/theme/hooks/helpers.ts");
  assertCase(
    block,
    "hooks.helpers.adapter",
    /\bexport function memoSelector\b/.test(helpersSrc) &&
      /from\s+["']\.\.\/runtime\/selectors["']/.test(helpersSrc) &&
      /memoSelectorImpl/.test(helpersSrc),
    "helpers.ts adapts to SSOT",
  );

  assertCase(
    block,
    "hooks.helpers.keepsAsserts",
    /\bexport function assertTheme\b/.test(helpersSrc) &&
      /\bexport function assertTokens\b/.test(helpersSrc) &&
      /\bexport function freezeDev\b/.test(helpersSrc),
    "assertTheme / assertTokens / freezeDev intact",
  );
}

/* -------------------------------------------------------------------------- */
/* 8. Barrel                                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Barrel";

  const checks: Array<[string, string]> = [
    ["src/ui/index.ts", "ui"],
    ["src/ui/theme/index.ts", "theme"],
    ["src/ui/theme/runtime/index.ts", "runtime"],
    ["src/ui/theme/hooks/index.ts", "hooks"],
  ];

  for (const [rel, id] of checks) {
    const code = stripComments(read(rel));
    assertCase(
      block,
      `barrel.${id}.noSelectors`,
      !/\bfrom\s+["'][^"']*selectors[^"']*["']/.test(code) &&
        !/\bmemoSelector\b/.test(code) &&
        !/\bcreateSelector\b/.test(code) &&
        !/\bThemeSelector\b/.test(code) &&
        !/\bThemeRuntime\b/.test(code),
      `${rel} must not export selectors surface`,
    );
  }

  const privateBarrel = `${SELECTORS_DIR}/index.ts`;
  assertCase(
    block,
    "barrel.private.exists",
    existsSync(join(repoRoot, privateBarrel)),
    privateBarrel,
  );

  const privateSrc = read(privateBarrel);
  assertCase(
    block,
    "barrel.private.reexports",
    /\bThemeRuntime\b/.test(privateSrc) &&
      /\bThemeSelector\b/.test(privateSrc) &&
      /\bcreateSelector\b/.test(privateSrc) &&
      /\bmemoSelector\b/.test(privateSrc) &&
      /\breferenceEqual\b/.test(privateSrc),
    "private selectors barrel reexports directory",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "Selector",
  "createSelector",
  "memoSelector",
  "equality",
  "cache",
  "Runtime",
  "Hooks",
  "Barrel",
];

let passCount = 0;
for (const block of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0;
  if (ok) passCount += 1;
  const pad = ".".repeat(Math.max(1, 30 - block.length));
  console.log(`${block} ${pad} ${ok ? "PASS" : "FAIL"}`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
}

console.log(
  `UX-3.6 Validation: ${passCount}/${BLOCKS.length} ${passCount === BLOCKS.length ? "PASS" : "FAIL"}`,
);

if (passCount !== BLOCKS.length) {
  process.exitCode = 1;
}
