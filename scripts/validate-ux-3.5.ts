/**
 * UX-3.5 — Theme Hooks & Consumption API gate (freeze-safe).
 *
 * Blocks: API Freeze, Hook files, Selectors, Helpers, Barrel, No adapters.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { THEME_IDS } from "../src/ui/theme/ids";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";
import {
  selectColors,
  selectElevation,
  selectMotion,
  selectRadius,
  selectShadows,
  selectSpacing,
  selectTypography,
} from "../src/ui/theme/hooks/selectors";
import {
  assertTheme,
  assertTokens,
  freezeDev,
  memoSelector,
} from "../src/ui/theme/hooks/helpers";

type BlockId =
  | "API Freeze"
  | "Hook files"
  | "Selectors"
  | "Helpers"
  | "Barrel"
  | "No adapters";

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

const EXPECTED_CONTEXT = `export type ThemeContextValue = {
  readonly theme: ThemeId;
  readonly setTheme: (next: ThemeId) => void;
  readonly cssVars: Readonly<Record<string, string>>;
};`;

const CERTIFIED_HELPERS: ReadonlyArray<{ file: string; slice: string }> = [
  { file: "useColorToken.ts", slice: "colors" },
  { file: "useSpacingToken.ts", slice: "spacing" },
  { file: "useTypographyToken.ts", slice: "typography" },
  { file: "useRadiusToken.ts", slice: "radius" },
  { file: "useShadowToken.ts", slice: "shadows" },
];

const NEW_HELPERS: ReadonlyArray<{ file: string; slice: string; name: string }> =
  [
    { file: "useElevation.ts", slice: "elevation", name: "useElevation" },
    { file: "useMotion.ts", slice: "motion", name: "useMotion" },
  ];

const FORBIDDEN_HOOK =
  /\buseMemo\b|\buseCallback\b|\buseRef\b|ThemeTokenResolver|TokenCache|TokenValidation|foundation|contracts/;

/* -------------------------------------------------------------------------- */
/* 1. API Freeze                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "API Freeze";

  const uiIndex = read("src/ui/index.ts");
  assertCase(
    block,
    "freeze.uiNoTokenHooks",
    !/\buseTokens\b/.test(uiIndex) &&
      !/\buseColorToken\b/.test(uiIndex) &&
      !/\buseElevation\b/.test(uiIndex) &&
      !/\buseMotion\b/.test(uiIndex) &&
      !/\bfrom\s+["']\.\/theme\/tokens/.test(uiIndex) &&
      !/\bThemeTokenResolver\b/.test(uiIndex) &&
      !/\bTokenCache\b/.test(uiIndex),
    "@/ui must not export token runtime / consumption hooks",
  );

  assertCase(
    block,
    "freeze.uiKeepsProvider",
    /\bThemeProvider\b/.test(uiIndex) && /\buseTheme\b/.test(uiIndex),
    "ThemeProvider + useTheme remain on @/ui",
  );

  const contextSrc = read("src/ui/providers/theme-context.ts").replace(
    /\r\n/g,
    "\n",
  );
  assertCase(
    block,
    "freeze.themeContextValue",
    contextSrc.includes(EXPECTED_CONTEXT) &&
      !/\bthemeId\b/.test(contextSrc) &&
      !/\bthemeName\b/.test(contextSrc) &&
      !/\bisDark\b/.test(contextSrc) &&
      !/\bavailableThemes\b/.test(contextSrc) &&
      !/\bresolvedTokens\b/.test(contextSrc),
    "ThemeContextValue remains { theme, setTheme, cssVars }",
  );

  const tokensBarrel = read("src/ui/theme/tokens/index.ts");
  assertCase(
    block,
    "freeze.tokensBarrel",
    tokensBarrel.replace(/\r\n/g, "\n") ===
      EXPECTED_TOKENS_BARREL.replace(/\r\n/g, "\n"),
    "tokens barrel exact freeze (UX-3.2.6)",
  );

  assertCase(
    block,
    "freeze.themeIds",
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
    "freeze.resolverSignature",
    /export function resolve\(theme: ThemeId \| ThemeMap\): ResolvedDesignTokens/.test(
      resolverSrc,
    ) &&
      /export const ThemeTokenResolver = \{[\s\S]*resolve,[\s\S]*\} as const/.test(
        resolverSrc,
      ),
    "ThemeTokenResolver.resolve signature unchanged",
  );

  const cacheSrc = read("src/ui/theme/tokens/runtime/TokenCache.ts");
  assertCase(
    block,
    "freeze.tokenCacheApi",
    /\bhas\(/.test(cacheSrc) &&
      /\bget\(/.test(cacheSrc) &&
      /\bset\(/.test(cacheSrc) &&
      /\bclear\(/.test(cacheSrc) &&
      !/\bdelete\(/.test(cacheSrc.replace(/\/\*[\s\S]*?\*\//g, "")),
    "TokenCache public API unchanged (no delete)",
  );

  const resolvedSrc = read(
    "src/ui/theme/tokens/contracts/ResolvedDesignTokens.ts",
  );
  assertCase(
    block,
    "freeze.resolvedDesignTokens",
    /readonly colors: ColorTokens/.test(resolvedSrc) &&
      /readonly elevation: ElevationTokens/.test(resolvedSrc) &&
      /readonly motion: MotionTokens/.test(resolvedSrc) &&
      /readonly shadows: ShadowTokens/.test(resolvedSrc),
    "ResolvedDesignTokens domains unchanged",
  );

  /* Certified UX-3.3 hooks untouched */
  for (const { file, slice } of CERTIFIED_HELPERS) {
    const src = stripComments(read(`src/ui/theme/hooks/${file}`));
    const onlyUseTokens =
      [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]).join(",") ===
      "../tokens/hooks/useTokens";
    const returnOk = new RegExp(
      `return\\s+useTokens\\(\\)\\.${slice}\\s*;`,
    ).test(src);
    assertCase(
      block,
      `freeze.certified.${file}`,
      onlyUseTokens && returnOk && !/\bfrom\s+["']\.\/selectors/.test(src),
      `unchanged UX-3.3 pattern → useTokens().${slice}`,
    );
  }

  TokenCache.clear();
  const a = ThemeTokenResolver.resolve("light");
  const b = ThemeTokenResolver.resolve("light");
  assertCase(
    block,
    "freeze.resolverIdentity",
    Object.is(a, b),
    "resolve(light) identity preserved",
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Hook files                                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Hook files";

  for (const { file, slice, name } of NEW_HELPERS) {
    const rel = `src/ui/theme/hooks/${file}`;
    assertCase(
      block,
      `hooks.${name}.exists`,
      existsSync(join(repoRoot, rel)),
      rel,
    );

    const src = read(rel);
    const code = stripComments(src);

    const importMatches = [
      ...code.matchAll(/from\s+["']([^"']+)["']/g),
    ].map((m) => m[1]);

    const onlyUseTokensImport =
      importMatches.length === 1 &&
      importMatches[0] === "../tokens/hooks/useTokens";

    assertCase(
      block,
      `hooks.${name}.import`,
      onlyUseTokensImport,
      onlyUseTokensImport
        ? "sole import ../tokens/hooks/useTokens"
        : `imports=${JSON.stringify(importMatches)}`,
    );

    assertCase(
      block,
      `hooks.${name}.noForbidden`,
      !FORBIDDEN_HOOK.test(code),
      "no useMemo/useCallback/useRef/Runtime/Cache",
    );

    assertCase(
      block,
      `hooks.${name}.noBranching`,
      !/\bif\s*\(/.test(code) &&
        !/\bswitch\s*\(/.test(code) &&
        !/\?/.test(code),
      "no if/switch/ternary",
    );

    const direct = new RegExp(
      `return\\s+useTokens\\(\\)\\.${slice}\\s*;`,
    ).test(code);
    const viaLocal =
      /const\s+tokens\s*=\s*useTokens\s*\(\s*\)\s*;/.test(code) &&
      new RegExp(`return\\s+tokens\\.${slice}\\s*;`).test(code);

    assertCase(
      block,
      `hooks.${name}.slice`,
      direct || viaLocal,
      `must return useTokens().${slice} (or tokens.${slice})`,
    );

    assertCase(
      block,
      `hooks.${name}.export`,
      new RegExp(`export function ${name}\\s*\\(`).test(code),
      `export function ${name}()`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Selectors                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Selectors";
  const src = read("src/ui/theme/hooks/selectors.ts");
  const code = stripComments(src);

  assertCase(
    block,
    "selectors.exists",
    existsSync(join(repoRoot, "src/ui/theme/hooks/selectors.ts")),
    "selectors.ts present",
  );

  assertCase(
    block,
    "selectors.noMemoSelector",
    !/\bmemoSelector\b/.test(code),
    "selectors must not use memoSelector",
  );

  assertCase(
    block,
    "selectors.noSpread",
    !/\.\.\./.test(code),
    "no object spreads",
  );

  assertCase(
    block,
    "selectors.noObjectLiterals",
    !/return\s*\{/.test(code),
    "no return { ... }",
  );

  assertCase(
    block,
    "selectors.noRuntime",
    !/\bThemeTokenResolver\b/.test(code) && !/\bTokenCache\b/.test(code),
    "no Runtime/Cache imports",
  );

  const names = [
    "selectColors",
    "selectSpacing",
    "selectTypography",
    "selectRadius",
    "selectShadows",
    "selectElevation",
    "selectMotion",
  ] as const;

  for (const name of names) {
    assertCase(
      block,
      `selectors.export.${name}`,
      new RegExp(`export function ${name}\\s*\\(`).test(code),
      `export function ${name}`,
    );
  }

  TokenCache.clear();
  for (const id of THEME_IDS) {
    const tokens = ThemeTokenResolver.resolve(id);
    const checks: Array<[string, boolean]> = [
      ["colors", Object.is(selectColors(tokens), tokens.colors)],
      ["spacing", Object.is(selectSpacing(tokens), tokens.spacing)],
      ["typography", Object.is(selectTypography(tokens), tokens.typography)],
      ["radius", Object.is(selectRadius(tokens), tokens.radius)],
      ["shadows", Object.is(selectShadows(tokens), tokens.shadows)],
      ["elevation", Object.is(selectElevation(tokens), tokens.elevation)],
      ["motion", Object.is(selectMotion(tokens), tokens.motion)],
    ];
    for (const [slice, ok] of checks) {
      assertCase(
        block,
        `selectors.identity.${id}.${slice}`,
        ok,
        ok ? "Object.is" : "identity broken",
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Helpers                                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Helpers";
  const rel = "src/ui/theme/hooks/helpers.ts";
  assertCase(block, "helpers.exists", existsSync(join(repoRoot, rel)), rel);

  const src = read(rel);
  assertCase(
    block,
    "helpers.exports",
    /\bexport function assertTheme\b/.test(src) &&
      /\bexport function assertTokens\b/.test(src) &&
      /\bexport function freezeDev\b/.test(src) &&
      /\bexport function memoSelector\b/.test(src),
    "assertTheme, assertTokens, freezeDev, memoSelector",
  );

  /* Behavioral smoke — does not mutate Runtime */
  let threw = false;
  try {
    assertTheme("not-a-theme");
  } catch {
    threw = true;
  }
  assertCase(block, "helpers.assertTheme.reject", threw, "rejects invalid id");

  assertTheme("light");
  assertCase(block, "helpers.assertTheme.accept", true, "accepts light");

  TokenCache.clear();
  const tokens = ThemeTokenResolver.resolve("dark");
  let tokensOk = false;
  try {
    assertTokens(tokens);
    tokensOk = true;
  } catch {
    tokensOk = false;
  }
  assertCase(block, "helpers.assertTokens.accept", tokensOk, "accepts resolve()");

  const frozen = freezeDev({ a: 1 });
  assertCase(
    block,
    "helpers.freezeDev",
    frozen.a === 1,
    "freezeDev returns same shape",
  );

  const sel = (t: typeof tokens) => t.colors;
  const first = memoSelector(tokens, undefined, undefined, sel);
  const second = memoSelector(tokens, tokens, first, sel);
  assertCase(
    block,
    "helpers.memoSelector.identity",
    Object.is(first, tokens.colors) && Object.is(second, first),
    "memoSelector reserved; identity when tokens === previous",
  );

  /* Selectors source must not call memoSelector */
  const selectorsSrc = read("src/ui/theme/hooks/selectors.ts");
  assertCase(
    block,
    "helpers.memoSelector.unusedBySelectors",
    !/\bmemoSelector\b/.test(selectorsSrc),
    "memoSelector unused by selectors in UX-3.5",
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Barrel                                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Barrel";
  const src = read("src/ui/theme/hooks/index.ts");
  const code = stripComments(src);

  const required = [
    "useColorToken",
    "useSpacingToken",
    "useTypographyToken",
    "useRadiusToken",
    "useShadowToken",
    "useElevation",
    "useMotion",
  ];

  for (const name of required) {
    assertCase(
      block,
      `barrel.export.${name}`,
      new RegExp(`from\\s+["']\\.\\/${name}["']`).test(code) ||
        new RegExp(`from\\s+["']\\.\\/${name}\\.ts["']`).test(code),
      `export * from "./${name}"`,
    );
  }

  assertCase(
    block,
    "barrel.noUseTokens",
    !/\buseTokens\b/.test(code),
    "useTokens must not be re-exported from theme/hooks",
  );

  assertCase(
    block,
    "barrel.noSelectors",
    !/\bselectors\b/.test(code),
    "selectors not public",
  );

  assertCase(
    block,
    "barrel.noHelpers",
    !/\bhelpers\b/.test(code),
    "helpers not public",
  );

  assertCase(
    block,
    "barrel.noRuntime",
    !/\bThemeTokenResolver\b/.test(code) &&
      !/\bTokenCache\b/.test(code) &&
      !/\bBenchmark\b/.test(code) &&
      !/\bRuntimeMetrics\b/.test(code) &&
      !/\bPerformanceCounters\b/.test(code),
    "no Runtime/Cache/Benchmark/Metrics",
  );

  assertCase(
    block,
    "barrel.noForbiddenNames",
    !/\buseColor\b/.test(code) &&
      !/\buseSpacing\b/.test(code) &&
      !/\buseTypography\b/.test(code) &&
      !/\buseThemeState\b/.test(code),
    "no renamed / useThemeState exports",
  );
}

/* -------------------------------------------------------------------------- */
/* 6. No adapters                                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "No adapters";
  const hooksDir = join(repoRoot, "src/ui/theme/hooks");
  const files = listTsFiles(hooksDir);

  const FORBIDDEN_PATTERNS: Array<{ id: string; re: RegExp }> = [
    { id: "alias.background", re: /\bcolors\.background\b|\bbackground:\s*/ },
    { id: "alias.spacing.xs", re: /\bspacing\.xs\b|\b\bxs\b.*spacing/ },
    { id: "alias.fontFamilyTop", re: /selectTypography[\s\S]*fontFamily\s*:/ },
    { id: "adapter.spread", re: /return\s*\{\s*\.\.\./ },
    { id: "adapter.flatten", re: /\bflatten\w*\s*\(/i },
  ];

  for (const abs of files) {
    const rel = relative(repoRoot, abs).replace(/\\/g, "/");
    const code = stripComments(read(rel));
    for (const { id, re } of FORBIDDEN_PATTERNS) {
      /* Certified helpers / docs comments may mention words — skip comment-stripped false positives on index */
      if (rel.endsWith("index.ts")) continue;
      assertCase(
        block,
        `noAdapter.${id}.${rel.split("/").pop()}`,
        !re.test(code),
        re.test(code) ? `forbidden pattern in ${rel}` : "clean",
      );
    }
  }

  /* Explicit: no useColor / useSpacing / useTypography files */
  for (const bad of ["useColor.ts", "useSpacing.ts", "useTypography.ts"]) {
    assertCase(
      block,
      `noAdapter.noFile.${bad}`,
      !existsSync(join(hooksDir, bad)),
      `${bad} must not exist`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "API Freeze",
  "Hook files",
  "Selectors",
  "Helpers",
  "Barrel",
  "No adapters",
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
  `UX-3.5 Validation: ${passCount}/${BLOCKS.length} ${passCount === BLOCKS.length ? "PASS" : "FAIL"}`,
);

if (passCount !== BLOCKS.length) {
  process.exitCode = 1;
}
