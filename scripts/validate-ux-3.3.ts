/**
 * UX-3.3.7 — Component Token Migration gate.
 *
 * Validates consumption helpers, DS component import rules,
 * Runtime API Freeze (tokens barrel + resolver surface), and theme snapshots.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { THEME_IDS } from "../src/ui/theme/ids";
import { ThemeTokenResolver } from "../src/ui/theme/tokens/runtime/ThemeTokenResolver";
import { TokenCache } from "../src/ui/theme/tokens/runtime/TokenCache";

type BlockId =
  | "Component helpers"
  | "Component imports"
  | "Runtime API Freeze"
  | "Theme snapshots";

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

function isStubExportEmpty(src: string): boolean {
  const body = stripComments(src).replace(/\s+/g, " ").trim();
  return body === "export {};" || body === "export {}";
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

/* -------------------------------------------------------------------------- */
/* 1. Component helpers                                                       */
/* -------------------------------------------------------------------------- */

const HELPERS: ReadonlyArray<{ file: string; slice: string }> = [
  { file: "useColorToken.ts", slice: "colors" },
  { file: "useSpacingToken.ts", slice: "spacing" },
  { file: "useTypographyToken.ts", slice: "typography" },
  { file: "useRadiusToken.ts", slice: "radius" },
  { file: "useShadowToken.ts", slice: "shadows" },
];

const FORBIDDEN_HELPER_IMPORT =
  /ThemeTokenResolver|TokenCache|foundation|contracts|TokenValidation/;

{
  const block: BlockId = "Component helpers";

  for (const { file, slice } of HELPERS) {
    const rel = `src/ui/theme/hooks/${file}`;
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
      `helpers.${file}.import`,
      onlyUseTokensImport,
      onlyUseTokensImport
        ? "sole import ../tokens/hooks/useTokens"
        : `imports=${JSON.stringify(importMatches)}`,
    );

    assertCase(
      block,
      `helpers.${file}.noForbidden`,
      !FORBIDDEN_HELPER_IMPORT.test(code) && !/\buseMemo\b/.test(code),
      "no resolver/cache/contracts/foundation/useMemo",
    );

    assertCase(
      block,
      `helpers.${file}.noBranching`,
      !/\bif\s*\(/.test(code) &&
        !/\bswitch\s*\(/.test(code) &&
        !/\?/.test(code),
      "no if/switch/ternary",
    );

    const returnRe = new RegExp(
      `return\\s+useTokens\\(\\)\\.${slice}\\s*;`,
    );
    assertCase(
      block,
      `helpers.${file}.slice`,
      returnRe.test(code),
      `must return useTokens().${slice}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Component imports                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Component imports";
  const roots = [
    "src/ui/primitives",
    "src/ui/components",
    "src/ui/patterns",
  ] as const;

  /** Paths that bypass Theme Runtime / consumption hooks. */
  function isForbiddenImport(specifier: string): boolean {
    const n = specifier.replace(/\\/g, "/");
    return (
      /theme\/contracts(?:\/|$)/.test(n) ||
      /theme\/tokens\/contracts(?:\/|$)/.test(n) ||
      /theme\/foundation(?:\/|$)/.test(n) ||
      /theme\/tokens\/foundation(?:\/|$)/.test(n) ||
      /(?:^|\/)foundation\/(?:colors|spacing|typography|elevation|motion)(?:\/|$)/.test(
        n,
      ) ||
      /(?:^|\/)foundation\/tokens(?:\/|$)/.test(n)
    );
  }

  let scannedNonStub = 0;

  for (const root of roots) {
    const files = listTsFiles(join(repoRoot, root));

    for (const abs of files) {
      const rel = relative(repoRoot, abs).replace(/\\/g, "/");
      const src = read(rel);

      if (isStubExportEmpty(src)) {
        continue;
      }

      scannedNonStub += 1;
      const code = stripComments(src);
      const imports = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map(
        (m) => m[1],
      );
      const forbidden = imports.filter(isForbiddenImport);

      assertCase(
        block,
        `imports.${rel}`,
        forbidden.length === 0,
        forbidden.length === 0
          ? "ok"
          : `forbidden imports: ${JSON.stringify(forbidden)}`,
      );
    }
  }

  // Stubs-only catalog: silent PASS (no warnings).
  if (scannedNonStub === 0) {
    assertCase(block, "imports.stubsOnly", true, "stubs only");
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Runtime API Freeze                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Runtime API Freeze";

  const expectedBarrel = `/**
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

  const barrel = read("src/ui/theme/tokens/index.ts");
  assertCase(
    block,
    "freeze.tokensBarrel",
    barrel.replace(/\r\n/g, "\n") === expectedBarrel.replace(/\r\n/g, "\n"),
    "theme/tokens/index.ts export surface unchanged",
  );

  const resolverSrc = read(
    "src/ui/theme/tokens/runtime/ThemeTokenResolver.ts",
  );
  assertCase(
    block,
    "freeze.ThemeTokenResolver.resolve",
    /export function resolve\(theme: ThemeId \| ThemeMap\): ResolvedDesignTokens/.test(
      resolverSrc,
    ) && /export const ThemeTokenResolver = \{[\s\S]*resolve,[\s\S]*\} as const/.test(
      resolverSrc,
    ),
    "resolve(theme): ResolvedDesignTokens + ThemeTokenResolver.resolve",
  );

  const cacheSrc = read("src/ui/theme/tokens/runtime/TokenCache.ts");
  assertCase(
    block,
    "freeze.TokenCache.surface",
    /export const TokenCache = \{/.test(cacheSrc) &&
      /\bhas\b/.test(cacheSrc) &&
      /\bget\b/.test(cacheSrc) &&
      /\bset\b/.test(cacheSrc) &&
      /\bclear\b/.test(cacheSrc),
    "TokenCache has/get/set/clear",
  );

  const useTokensSrc = read("src/ui/theme/tokens/hooks/useTokens.ts");
  assertCase(
    block,
    "freeze.useTokens.signature",
    /export function useTokens\(\): ResolvedDesignTokens/.test(useTokensSrc),
    "useTokens(): ResolvedDesignTokens",
  );

  const contractFiles = [
    "ColorTokens.ts",
    "TypographyTokens.ts",
    "SpacingTokens.ts",
    "RadiusTokens.ts",
    "ShadowTokens.ts",
    "MotionTokens.ts",
    "ElevationTokens.ts",
    "LayoutTokens.ts",
    "ResolvedDesignTokens.ts",
  ];
  for (const name of contractFiles) {
    const rel = `src/ui/theme/tokens/contracts/${name}`;
    assertCase(
      block,
      `freeze.contract.${name}`,
      existsSync(join(repoRoot, rel)) && read(rel).length > 0,
      "contract present",
    );
  }

  // Runtime objects exist and are callable (smoke, not behavior change).
  assertCase(
    block,
    "freeze.runtimeObjects",
    typeof ThemeTokenResolver.resolve === "function" &&
      typeof TokenCache.get === "function" &&
      typeof TokenCache.set === "function" &&
      typeof TokenCache.has === "function" &&
      typeof TokenCache.clear === "function",
    "ThemeTokenResolver + TokenCache runtime bindings",
  );

  const uiIndex = read("src/ui/index.ts");
  assertCase(
    block,
    "freeze.publicUiNoTokenHooks",
    !/\buseTokens\b/.test(uiIndex) &&
      !/\buseColorToken\b/.test(uiIndex) &&
      !/\bfrom\s+["']\.\/theme\/hooks/.test(uiIndex) &&
      !/\bfrom\s+["']\.\/theme\/tokens/.test(uiIndex),
    "@/ui must not export token hooks / tokens barrel",
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Theme snapshots                                                         */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "Theme snapshots";
  const snapDir = "src/ui/theme/tokens/__snapshots__";

  assertCase(
    block,
    "snapshots.themeIds",
    THEME_IDS.length === 4 &&
      THEME_IDS[0] === "light" &&
      THEME_IDS[1] === "dark" &&
      THEME_IDS[2] === "highContrastLight" &&
      THEME_IDS[3] === "highContrastDark",
    `THEME_IDS=${JSON.stringify(THEME_IDS)}`,
  );

  for (const themeId of THEME_IDS) {
    const rel = `${snapDir}/${themeId}.json`;
    const abs = join(repoRoot, rel);

    if (!existsSync(abs)) {
      assertCase(
        block,
        `snapshots.${themeId}.exists`,
        false,
        `missing snapshot ${rel}`,
      );
      continue;
    }

    const expected = read(rel).replace(/\r\n/g, "\n").trimEnd();
    const actualObj = ThemeTokenResolver.resolve(themeId);
    const actual = `${JSON.stringify(actualObj, null, 2)}\n`.trimEnd();

    assertCase(
      block,
      `snapshots.${themeId}.match`,
      actual === expected,
      actual === expected
        ? "ResolvedDesignTokens match"
        : `drift in theme "${themeId}" (${rel})`,
    );
  }

  // Forbidden snapshot names from the ticket sketch.
  assertCase(
    block,
    "snapshots.noPrint",
    !existsSync(join(repoRoot, snapDir, "print.json")),
    "print.json must not exist",
  );
  assertCase(
    block,
    "snapshots.noHighContrastAlias",
    !existsSync(join(repoRoot, snapDir, "highContrast.json")),
    "highContrast.json must not exist",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: BlockId[] = [
  "Component helpers",
  "Component imports",
  "Runtime API Freeze",
  "Theme snapshots",
];

let passCount = 0;
for (const block of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => !r.pass);
  const ok = failed.length === 0;
  if (ok) passCount += 1;
  const dots = ".".repeat(Math.max(1, 24 - block.length));
  console.log(`${block} ${dots} ${ok ? "PASS" : "FAIL"}`);
  if (!ok) {
    for (const f of failed) {
      console.error(`  FAIL ${f.id}: ${f.detail}`);
    }
  }
}

console.log(`UX-3.3 Validation: ${passCount}/${BLOCKS.length} ${passCount === BLOCKS.length ? "PASS" : "FAIL"}`);

if (passCount !== BLOCKS.length) {
  process.exitCode = 1;
}
