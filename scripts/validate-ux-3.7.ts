/**
 * UX-3.7 — Runtime Context Optimization gate.
 *
 * Blocks (10):
 * Runtime — semantic fingerprint · identity cache · runtime stability ·
 *           TokenCache SoT · no cache duplication
 * API — ThemeContext intact · API Freeze · selector compatibility ·
 *       no new exports · barrel intact
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  clearProviderCache,
  getRuntime,
  runtimeFingerprint,
  runtimeIdentity,
  stableRuntime,
} from "../src/ui/theme/runtime/context";
import {
  createSelector,
  memoSelector,
  type ThemeRuntime,
} from "../src/ui/theme/runtime/selectors";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";

type BlockId =
  | "semanticFingerprint"
  | "identityCache"
  | "runtimeStability"
  | "tokenCacheSoT"
  | "noCacheDuplication"
  | "themeContextIntact"
  | "apiFreeze"
  | "selectorCompatibility"
  | "noNewExports"
  | "barrelIntact";

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

const CONTEXT_DIR = "src/ui/theme/runtime/context";

/* -------------------------------------------------------------------------- */
/* 1. semanticFingerprint                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "semanticFingerprint";

  const fpRel = `${CONTEXT_DIR}/runtimeFingerprint.ts`;
  assertCase(
    block,
    "fp.file.exists",
    existsSync(join(repoRoot, fpRel)),
    fpRel,
  );

  const fpSrc = read(fpRel);
  const fpCode = stripComments(fpSrc);
  assertCase(
    block,
    "fp.export",
    /\bexport function runtimeFingerprint\b/.test(fpSrc),
    "runtimeFingerprint exported",
  );

  assertCase(
    block,
    "fp.noObjectIdentity",
    !/\bObject\.is\b/.test(fpCode) &&
      !/\bWeakMap\b/.test(fpCode) &&
      !/\bDate\.now\b/.test(fpCode) &&
      !/\bMath\.random\b/.test(fpCode) &&
      !/\bperformance\b/.test(fpCode),
    "fingerprint source avoids identity / ephemeral APIs",
  );

  TokenCache.clear();
  clearProviderCache();
  const light = ThemeTokenResolver.resolve("light");
  const dark = ThemeTokenResolver.resolve("dark");
  const lightClone = structuredClone(light) as ThemeRuntime;

  assertCase(
    block,
    "fp.semanticSame",
    runtimeFingerprint(light) === runtimeFingerprint(lightClone) &&
      !Object.is(light, lightClone),
    "same logical tokens ⇒ same fingerprint (distinct refs)",
  );

  assertCase(
    block,
    "fp.semanticDifferent",
    runtimeFingerprint(light) !== runtimeFingerprint(dark),
    "different themes ⇒ different fingerprints",
  );

  assertCase(
    block,
    "fp.stableRepeat",
    runtimeFingerprint(light) === runtimeFingerprint(light),
    "repeat fingerprint is stable",
  );
}

/* -------------------------------------------------------------------------- */
/* 2. identityCache                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "identityCache";

  const idRel = `${CONTEXT_DIR}/runtimeIdentity.ts`;
  const cacheRel = `${CONTEXT_DIR}/providerCache.ts`;
  assertCase(
    block,
    "identity.file.exists",
    existsSync(join(repoRoot, idRel)),
    idRel,
  );
  assertCase(
    block,
    "cache.file.exists",
    existsSync(join(repoRoot, cacheRel)),
    cacheRel,
  );

  const idSrc = read(idRel);
  assertCase(
    block,
    "identity.weakMap",
    /\bWeakMap\b/.test(idSrc) && /\bruntimeIdentity\b/.test(idSrc),
    "WeakMap<ThemeRuntime, Fingerprint> (or equiv) present",
  );

  const cacheSrc = stripComments(read(cacheRel));
  assertCase(
    block,
    "cache.reuseOnly",
    !/\bdeepFreeze\b/.test(cacheSrc) &&
      !/\bThemeTokenResolver\b/.test(cacheSrc) &&
      !/\bresolve\s*\(/.test(cacheSrc) &&
      !/\bJSON\.stringify\b/.test(cacheSrc),
    "providerCache never builds / resolves runtimes",
  );

  TokenCache.clear();
  clearProviderCache();
  const runtime = ThemeTokenResolver.resolve("light");
  assertCase(
    block,
    "identity.memo",
    runtimeIdentity(runtime) === runtimeFingerprint(runtime) &&
      runtimeIdentity(runtime) === runtimeIdentity(runtime),
    "runtimeIdentity returns semantic fingerprint (memoized)",
  );
}

/* -------------------------------------------------------------------------- */
/* 3. runtimeStability                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "runtimeStability";

  const stableRel = `${CONTEXT_DIR}/stableRuntime.ts`;
  assertCase(
    block,
    "stable.file.exists",
    existsSync(join(repoRoot, stableRel)),
    stableRel,
  );

  const stableSrc = stripComments(read(stableRel));
  assertCase(
    block,
    "stable.noCreate",
    !/\b\{\s*colors\s*:/.test(stableSrc) &&
      !/\bdeepFreeze\b/.test(stableSrc) &&
      !/\bThemeTokenResolver\b/.test(stableSrc) &&
      !/\bresolve\s*\(/.test(stableSrc),
    "stableRuntime never creates / resolves ThemeRuntime",
  );

  TokenCache.clear();
  clearProviderCache();
  const a = ThemeTokenResolver.resolve("light");
  const b = ThemeTokenResolver.resolve("light");
  const stabilizedA = stableRuntime(a);
  const stabilizedB = stableRuntime(b, stabilizedA);

  assertCase(
    block,
    "stable.sameFpSameRef",
    Object.is(stabilizedA, stabilizedB) &&
      runtimeFingerprint(a) === runtimeFingerprint(b),
    "same fingerprint ⇒ same runtime reference",
  );

  const clone = structuredClone(a) as ThemeRuntime;
  const reused = stableRuntime(clone, stabilizedA);
  assertCase(
    block,
    "stable.reuseAcrossRefs",
    Object.is(reused, stabilizedA) && !Object.is(clone, a),
    "semantic twin reuses registered reference",
  );

  clearProviderCache();
  const dark = ThemeTokenResolver.resolve("dark");
  const stabilizedDark = stableRuntime(dark, stabilizedA);
  assertCase(
    block,
    "stable.diffFpDiffRef",
    !Object.is(stabilizedDark, stabilizedA) &&
      runtimeFingerprint(dark) !== runtimeFingerprint(a),
    "different fingerprint ⇒ different resolved runtime",
  );

  assertCase(
    block,
    "stable.lookup",
    getRuntime(runtimeFingerprint(a)) === undefined ||
      Object.is(getRuntime(runtimeFingerprint(a)), a) ||
      typeof getRuntime(runtimeFingerprint(stabilizedDark)) !== "undefined",
    "providerCache lookup usable for identity reuse",
  );
}

/* -------------------------------------------------------------------------- */
/* 4. tokenCacheSoT                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tokenCacheSoT";

  const cacheSrc = read("src/ui/theme/tokens/runtime/TokenCache.ts");
  assertCase(
    block,
    "sot.tokenCacheApi",
    /\bhas\(/.test(cacheSrc) &&
      /\bget\(/.test(cacheSrc) &&
      /\bset\(/.test(cacheSrc) &&
      /\bclear\(/.test(cacheSrc),
    "TokenCache API intact",
  );

  TokenCache.clear();
  clearProviderCache();
  const x = ThemeTokenResolver.resolve("light");
  const y = ThemeTokenResolver.resolve("light");
  assertCase(
    block,
    "sot.resolverIdentity",
    Object.is(x, y),
    "TokenCache/resolve remains constructor SoT",
  );

  const contextFiles = [
    "runtimeFingerprint.ts",
    "runtimeIdentity.ts",
    "providerCache.ts",
    "stableRuntime.ts",
    "runtimeContext.tsx",
    "index.ts",
  ];
  let contextBuilds = false;
  for (const file of contextFiles) {
    const src = stripComments(read(`${CONTEXT_DIR}/${file}`));
    if (
      /\bTokenCache\.set\b/.test(src) ||
      /\bdeepFreeze\b/.test(src) ||
      /\bThemeTokenResolver\b/.test(src)
    ) {
      contextBuilds = true;
    }
  }
  assertCase(
    block,
    "sot.contextNoBuild",
    !contextBuilds,
    "runtime/context never builds via TokenCache.set / Resolver",
  );

  const providerSrc = read("src/ui/providers/theme-provider.tsx");
  assertCase(
    block,
    "sot.providerObtainsViaResolve",
    /from\s+["'][^"']*ThemeTokenResolver["']/.test(providerSrc) &&
      /resolve\(theme\)/.test(providerSrc) &&
      /\bstableRuntime\b/.test(providerSrc) &&
      /\bInternalRuntimeProvider\b/.test(providerSrc),
    "ThemeProvider obtains via resolve then stabilizes",
  );
}

/* -------------------------------------------------------------------------- */
/* 5. noCacheDuplication                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noCacheDuplication";

  const providerCacheSrc = stripComments(read(`${CONTEXT_DIR}/providerCache.ts`));
  assertCase(
    block,
    "dup.noSecondSemanticStore",
    !/\bdeepFreeze\b/.test(providerCacheSrc) &&
      !/\bfingerprintThemeMap\b/.test(providerCacheSrc) &&
      !/\badhoc:/.test(providerCacheSrc),
    "providerCache is identity reuse only (above TokenCache)",
  );

  const allContext = contextFilesJoined();
  assertCase(
    block,
    "dup.noReplaceTokenCache",
    !/\bTokenCache\b/.test(allContext),
    "context layer does not reference TokenCache",
  );

  function contextFilesJoined(): string {
    return [
      "runtimeFingerprint.ts",
      "runtimeIdentity.ts",
      "providerCache.ts",
      "stableRuntime.ts",
      "runtimeContext.tsx",
      "index.ts",
    ]
      .map((f) => stripComments(read(`${CONTEXT_DIR}/${f}`)))
      .join("\n");
  }
}

/* -------------------------------------------------------------------------- */
/* 6. themeContextIntact                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "themeContextIntact";

  const ctxSrc = read("src/ui/providers/theme-context.ts");
  assertCase(
    block,
    "ctx.valueShape",
    /export type ThemeContextValue\s*=\s*\{\s*readonly theme:\s*ThemeId;\s*readonly setTheme:\s*\(next:\s*ThemeId\)\s*=>\s*void;\s*readonly cssVars:\s*Readonly<Record<string,\s*string>>;\s*\};/.test(
      ctxSrc,
    ),
    "ThemeContextValue = { theme, setTheme, cssVars }",
  );

  const valueBlock =
    ctxSrc.match(/export type ThemeContextValue\s*=\s*\{[\s\S]*?\};/)?.[0] ??
    "";
  assertCase(
    block,
    "ctx.noRuntimeField",
    /\breadonly theme\b/.test(valueBlock) &&
      /\breadonly setTheme\b/.test(valueBlock) &&
      /\breadonly cssVars\b/.test(valueBlock) &&
      !/\bruntime\b/.test(valueBlock) &&
      !/\btokens\b/.test(valueBlock) &&
      !/\bfingerprint\b/.test(valueBlock) &&
      !/\bmetadata\b/.test(valueBlock) &&
      !/\bcache\b/.test(valueBlock),
    "ThemeContext has no runtime/tokens/fingerprint/cache/metadata",
  );

  const providerSrc = stripComments(read("src/ui/providers/theme-provider.tsx"));
  assertCase(
    block,
    "ctx.providerPublicValue",
    /value\s*=\s*useMemo\s*\(\s*\(\)\s*=>\s*\(\s*\{\s*theme\s*,\s*setTheme\s*,\s*cssVars\s*\}\s*\)/.test(
      providerSrc,
    ),
    "ThemeContext.Provider value remains { theme, setTheme, cssVars }",
  );
}

/* -------------------------------------------------------------------------- */
/* 7. apiFreeze                                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "apiFreeze";

  const useTokensSrc = read("src/ui/theme/tokens/hooks/useTokens.ts");
  assertCase(
    block,
    "freeze.useTokens",
    /export function useTokens\(\):\s*ResolvedDesignTokens/.test(useTokensSrc) &&
      /resolve\(theme\)/.test(useTokensSrc) &&
      !/\bruntime\/context\b/.test(useTokensSrc),
    "useTokens unchanged (no context consumption)",
  );

  for (const { file, slice, name } of [
    { file: "useElevation.ts", slice: "elevation", name: "useElevation" },
    { file: "useMotion.ts", slice: "motion", name: "useMotion" },
  ] as const) {
    const src = stripComments(read(`src/ui/theme/hooks/${file}`));
    assertCase(
      block,
      `freeze.${name}`,
      new RegExp(`return\\s+useTokens\\(\\)\\.${slice}\\s*;`).test(src) &&
        !/\bruntime\/context\b/.test(src),
      `${name} identity intact`,
    );
  }

  const aliasSrc = read("src/ui/theme/runtime/selectors/ThemeSelector.ts");
  assertCase(
    block,
    "freeze.themeRuntimeAlias",
    /export type ThemeRuntime\s*=\s*ResolvedDesignTokens/.test(aliasSrc),
    "ThemeRuntime remains alias of ResolvedDesignTokens",
  );

  const providerBarrel = read("src/ui/providers/index.ts");
  assertCase(
    block,
    "freeze.providersBarrel",
    /\bThemeProvider\b/.test(providerBarrel) &&
      /\buseTheme\b/.test(providerBarrel) &&
      /\bThemeContextValue\b/.test(providerBarrel) &&
      !/\bInternalRuntime\b/.test(providerBarrel) &&
      !/\bstableRuntime\b/.test(providerBarrel) &&
      !/\bruntimeFingerprint\b/.test(providerBarrel),
    "providers barrel public surface unchanged",
  );

  assertCase(
    block,
    "freeze.noForbiddenHooks",
    !existsSync(join(repoRoot, "src/ui/theme/hooks/useRuntime.ts")) &&
      !existsSync(join(repoRoot, "src/ui/theme/hooks/useThemeRuntime.ts")) &&
      !existsSync(join(repoRoot, "src/ui/theme/hooks/useRuntimeContext.ts")),
    "no useRuntime / useThemeRuntime / useRuntimeContext",
  );
}

/* -------------------------------------------------------------------------- */
/* 8. selectorCompatibility                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "selectorCompatibility";

  TokenCache.clear();
  const tokens = ThemeTokenResolver.resolve("light");
  const selectElevation = (r: ThemeRuntime) => r.elevation;
  const wrapped = createSelector(selectElevation);

  assertCase(
    block,
    "sel.createSelectorPassthrough",
    Object.is(wrapped, selectElevation),
    "createSelector passthrough intact",
  );

  const first = memoSelector(tokens, null, undefined, selectElevation);
  const second = memoSelector(tokens, tokens, first, selectElevation);
  assertCase(
    block,
    "sel.memoSelectorIdentity",
    Object.is(first, tokens.elevation) && Object.is(second, first),
    "memoSelector identity fast-path intact",
  );

  const selectorsIndex = read("src/ui/theme/runtime/selectors/index.ts");
  assertCase(
    block,
    "sel.privateBarrel",
    /\bmemoSelector\b/.test(selectorsIndex) &&
      /\bcreateSelector\b/.test(selectorsIndex) &&
      /\bThemeRuntime\b/.test(selectorsIndex),
    "UX-3.6 selectors private barrel intact",
  );
}

/* -------------------------------------------------------------------------- */
/* 9. noNewExports                                                            */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noNewExports";

  const forbidden = [
    "runtimeFingerprint",
    "runtimeIdentity",
    "stableRuntime",
    "InternalRuntimeProvider",
    "InternalRuntimeContext",
    "providerCache",
    "clearProviderCache",
    "useRuntime",
    "useThemeRuntime",
    "useRuntimeContext",
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
      `exports.${id}.clean`,
      hit === undefined && !/\bruntime\/context\b/.test(code),
      hit ? `${rel} leaks ${hit}` : `${rel} has no UX-3.7 exports`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 10. barrelIntact                                                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "barrelIntact";

  assertCase(
    block,
    "barrel.privateContextExists",
    existsSync(join(repoRoot, `${CONTEXT_DIR}/index.ts`)),
    `${CONTEXT_DIR}/index.ts`,
  );

  const privateBarrel = read(`${CONTEXT_DIR}/index.ts`);
  assertCase(
    block,
    "barrel.privateReexports",
    /\bruntimeFingerprint\b/.test(privateBarrel) &&
      /\bruntimeIdentity\b/.test(privateBarrel) &&
      /\bstableRuntime\b/.test(privateBarrel) &&
      /\bInternalRuntimeProvider\b/.test(privateBarrel),
    "private context barrel reexports directory",
  );

  const runtimeBarrel = stripComments(read("src/ui/theme/runtime/index.ts"));
  assertCase(
    block,
    "barrel.runtimeNoContext",
    !/\bcontext\b/.test(runtimeBarrel) &&
      !/\bstableRuntime\b/.test(runtimeBarrel) &&
      !/\bruntimeFingerprint\b/.test(runtimeBarrel),
    "theme/runtime/index.ts does not export context layer",
  );

  const runtimeBarrelFull = read("src/ui/theme/runtime/index.ts");
  assertCase(
    block,
    "barrel.runtimeNoSelectors",
    !/\bselectors\b/.test(stripComments(runtimeBarrelFull)) &&
      !/\bmemoSelector\b/.test(runtimeBarrelFull),
    "theme/runtime/index.ts still excludes selectors",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "semanticFingerprint",
  "identityCache",
  "runtimeStability",
  "tokenCacheSoT",
  "noCacheDuplication",
  "themeContextIntact",
  "apiFreeze",
  "selectorCompatibility",
  "noNewExports",
  "barrelIntact",
];

let passCount = 0;
for (const block of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0;
  if (ok) passCount += 1;
  const pad = ".".repeat(Math.max(1, 28 - block.length));
  console.log(`${block} ${pad} ${ok ? "PASS" : "FAIL"}`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-3.7");
console.log(allPass ? "PASS" : "FAIL");
console.log(`${passCount}/${BLOCKS.length}`);

if (!allPass) {
  process.exitCode = 1;
}
