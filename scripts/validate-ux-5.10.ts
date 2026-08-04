/**
 * UX-5.10 — Integration Certification gate.
 *
 * Blocks:
 * roadmapCertified · docsExist · registryCertified · metadataCertified
 * stateCertified · providerCertified · hooksCertified · bridgeCertified
 * diagnosticsCertified · protectedFiles · productionUntouched
 * historicalValidators · noPublicExpansion · seriesIsolation
 * architectureFreeze · tscCompile · certificationSummary
 *
 * Frozen principles:
 * - Documentary — certification only; no production changes
 * - Architectural — system under certification is unchanged
 * - Evidence Reuse Only — aggregates UX-5.1–5.9 proofs; does not redefine criteria
 * - Read-only Validator — reads / verifies / reports only; never mutates artifacts
 * - Series Closure — SERIES CERTIFIED only if every block passes (17/17)
 *
 * No nested validate:ux-5.N (Windows hang). Inline evidence reuse only.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "roadmapCertified"
  | "docsExist"
  | "registryCertified"
  | "metadataCertified"
  | "stateCertified"
  | "providerCertified"
  | "hooksCertified"
  | "bridgeCertified"
  | "diagnosticsCertified"
  | "protectedFiles"
  | "productionUntouched"
  | "historicalValidators"
  | "noPublicExpansion"
  | "seriesIsolation"
  | "architectureFreeze"
  | "tscCompile"
  | "certificationSummary";

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

const FEATURES_DIR = "src/ui/features";
const UI_INDEX = "src/ui/index.ts";
const FEATURES_INDEX = `${FEATURES_DIR}/index.ts`;
const FEATURE_DEFINITION = `${FEATURES_DIR}/FeatureDefinition.ts`;
const FEATURE_REGISTRY = `${FEATURES_DIR}/FeatureRegistry.ts`;
const FEATURE_STATE = `${FEATURES_DIR}/FeatureState.ts`;
const FEATURE_PROVIDER = `${FEATURES_DIR}/FeatureProvider.tsx`;
const FEATURE_CONTEXT = `${FEATURES_DIR}/FeatureContext.tsx`;
const FEATURE_HOOKS = `${FEATURES_DIR}/FeatureHooks.ts`;
const FEATURE_BRIDGE = `${FEATURES_DIR}/FeatureBridge.tsx`;
const FEATURE_DIAGNOSTICS = `${FEATURES_DIR}/FeatureDiagnostics.ts`;
const FEATURE_TYPES = `${FEATURES_DIR}/FeatureTypes.ts`;
const ROADMAP = "docs/UX/UX-5.0-roadmap.md";
const DOC_510 = "docs/UX/UX-5.10.md";
const APP_SHELL = "src/components/app-shell/AppShell.tsx";
const LAYOUT = "src/app/layout.tsx";
const PAGE = "src/app/page.tsx";

const CERTIFIED_FEATURE_FILES = new Set([
  "FeatureTypes.ts",
  "FeatureDefinition.ts",
  "FeatureRegistry.ts",
  "FeatureState.ts",
  "FeatureContext.tsx",
  "FeatureProvider.tsx",
  "FeatureHooks.ts",
  "FeatureBridge.tsx",
  "FeatureDiagnostics.ts",
  "index.ts",
]);

/* -------------------------------------------------------------------------- */
/* PASS 01 — roadmapCertified                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "roadmapCertified";
  const roadmap = existsSync(join(repoRoot, ROADMAP)) ? read(ROADMAP) : "";
  const doc510 = existsSync(join(repoRoot, DOC_510)) ? read(DOC_510) : "";

  assertCase(
    block,
    "roadmap.exists",
    existsSync(join(repoRoot, ROADMAP)),
    "UX-5.0-roadmap.md exists",
  );

  assertCase(
    block,
    "roadmap.seriesCertified",
    /UX-5\s+SERIES\s+CERTIFIED/.test(roadmap),
    "roadmap declares UX-5 SERIES CERTIFIED",
  );

  assertCase(
    block,
    "roadmap.ux510Complete",
    /UX-5\.10\s*=\s*COMPLETE/.test(roadmap) ||
      /### UX-5\.10[\s\S]*?COMPLETE/.test(roadmap),
    "roadmap marks UX-5.10 COMPLETE",
  );

  assertCase(
    block,
    "roadmap.nextUx6",
    /Next Series\s*=\s*UX-6/.test(roadmap) ||
      /Next:\s*UX-6/.test(roadmap),
    "roadmap Next Series → UX-6",
  );

  assertCase(
    block,
    "doc510.exists",
    existsSync(join(repoRoot, DOC_510)),
    "docs/UX/UX-5.10.md exists",
  );

  assertCase(
    block,
    "doc510.evidenceReuseOnly",
    /Evidence Reuse Only/.test(doc510),
    "UX-5.10.md declares Evidence Reuse Only",
  );

  assertCase(
    block,
    "doc510.principles",
    /Documentary Principle/.test(doc510) &&
      /Architectural Principles/.test(doc510) &&
      /Read-only Validator Principle/.test(doc510) &&
      /Series Closure Principle/.test(doc510),
    "UX-5.10.md declares Documentary / Architectural / Read-only / Series Closure",
  );

  assertCase(
    block,
    "doc510.certificationStatement",
    /UX-5 SERIES CERTIFIED/.test(doc510) &&
      /fully certified/i.test(doc510) &&
      /officially closed/i.test(doc510),
    "UX-5.10.md contains official certification statement",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — docsExist                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "docsExist";

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
    const doc = `docs/UX/UX-5.${n}.md`;
    assertCase(
      block,
      `docs.ux5${n}`,
      existsSync(join(repoRoot, doc)),
      `${doc} exists`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — registryCertified (UX-5.1–5.2 evidence reuse)                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryCertified";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "registry.exists",
    existsSync(join(repoRoot, FEATURE_REGISTRY)),
    "FeatureRegistry.ts exists",
  );

  for (const method of [
    "get",
    "has",
    "size",
    "getAll",
    "byCategory",
    "find",
    "enabled",
  ] as const) {
    assertCase(
      block,
      `registry.method.${method}`,
      new RegExp(`\\b${method}\\s*\\(`).test(src),
      `Registry exposes ${method}()`,
    );
  }

  assertCase(
    block,
    "registry.freezeFactory",
    /return\s+Object\.freeze\s*\(/.test(src),
    "createFeatureRegistry returns Object.freeze(...)",
  );

  assertCase(
    block,
    "registry.emptySeed",
    /EMPTY_FEATURE_DEFINITIONS[\s\S]*Object\.freeze\s*\(\s*\[\s*\]\s*\)/.test(
      src,
    ) ||
      /export\s+const\s+EMPTY_FEATURE_DEFINITIONS[\s\S]*?=\s*Object\.freeze\s*\(\s*\[\s*\]\s*\)/.test(
        src,
      ),
    "EMPTY_FEATURE_DEFINITIONS uses Object.freeze([])",
  );

  assertCase(
    block,
    "registry.shallowDefFreeze",
    /Object\.freeze\s*\(\s*\{\s*\.\.\.def\s*\}\s*\)/.test(src),
    "Registry freezes each definition shallowly",
  );

  assertCase(
    block,
    "registry.queryOnlyEnabled",
    /enabled\s*\(\s*\)[\s\S]*?return\s+this\.getAll\s*\(\s*\)/.test(src),
    "enabled() delegates to getAll() (query-only)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — metadataCertified (UX-5.3–5.4 evidence reuse)                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "metadataCertified";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";

  assertCase(
    block,
    "metadata.exists",
    existsSync(join(repoRoot, FEATURE_DEFINITION)),
    "FeatureDefinition.ts exists",
  );

  assertCase(
    block,
    "metadata.visibilityType",
    /export\s+type\s+FeatureVisibility\s*=/.test(src) &&
      /"visible"/.test(src) &&
      /"hidden"/.test(src) &&
      /"experimental"/.test(src) &&
      /"beta"/.test(src) &&
      /"internal"/.test(src),
    "FeatureVisibility Freeze v2 intact",
  );

  assertCase(
    block,
    "metadata.fields",
    /readonly\s+icon/.test(src) &&
      /readonly\s+title/.test(src) &&
      /readonly\s+description/.test(src) &&
      /readonly\s+tags/.test(src) &&
      /readonly\s+keywords/.test(src) &&
      /readonly\s+visibility/.test(src),
    "FeatureDefinition metadata fields intact",
  );

  assertCase(
    block,
    "metadata.copyBeforeFreeze",
    /Object\.freeze\s*\(\s*\[\s*\.\.\.init\.tags\s*\]\s*\)/.test(src) &&
      /Object\.freeze\s*\(\s*\[\s*\.\.\.init\.keywords\s*\]\s*\)/.test(src) &&
      /return\s+Object\.freeze\s*\(\s*\{[\s\S]*?\.\.\.init[\s\S]*?tags[\s\S]*?keywords[\s\S]*?\}\s*\)/.test(
        src,
      ),
    "createFeatureDefinition copy-before-freeze intact",
  );

  assertCase(
    block,
    "metadata.noBooleanFlags",
    !/\bexperimental\s*:\s*boolean/.test(src) &&
      !/\bhidden\s*:\s*boolean/.test(src),
    "No legacy boolean experimental/hidden flags",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — stateCertified (UX-5.5 evidence reuse)                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "stateCertified";
  const src = existsSync(join(repoRoot, FEATURE_STATE))
    ? stripComments(read(FEATURE_STATE))
    : "";

  assertCase(
    block,
    "state.exists",
    existsSync(join(repoRoot, FEATURE_STATE)),
    "FeatureState.ts exists",
  );

  assertCase(
    block,
    "state.statusUnion",
    /"enabled"/.test(src) &&
      /"disabled"/.test(src) &&
      /"loading"/.test(src) &&
      /"error"/.test(src),
    "FeatureStatus union intact",
  );

  assertCase(
    block,
    "state.snapshot",
    /export\s+type\s+FeatureState\s*=\s*Readonly\s*</.test(src) &&
      /readonly\s+id/.test(src) &&
      /readonly\s+status/.test(src),
    "FeatureState is immutable snapshot Readonly",
  );

  assertCase(
    block,
    "state.freezeOnly",
    /export\s+function\s+createFeatureState/.test(src) &&
      /return\s+Object\.freeze\s*\(\s*\{\s*\.\.\.init\s*,?\s*\}\s*\)/.test(src),
    "createFeatureState returns Object.freeze({ ...init })",
  );

  assertCase(
    block,
    "state.separatedFromDefinition",
    !/FeatureDefinition/.test(src) && !/visibility/.test(src),
    "FeatureState separated from FeatureDefinition metadata",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — providerCertified (UX-5.6 evidence reuse)                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerCertified";
  const providerSrc = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";
  const contextSrc = existsSync(join(repoRoot, FEATURE_CONTEXT))
    ? stripComments(read(FEATURE_CONTEXT))
    : "";

  assertCase(
    block,
    "provider.exists",
    existsSync(join(repoRoot, FEATURE_PROVIDER)),
    "FeatureProvider.tsx exists",
  );

  assertCase(
    block,
    "context.exists",
    existsSync(join(repoRoot, FEATURE_CONTEXT)),
    "FeatureContext.tsx exists",
  );

  assertCase(
    block,
    "provider.useRefOwnership",
    /\buseRef\b/.test(providerSrc) &&
      /statesRef/.test(providerSrc) &&
      /ReadonlyMap/.test(providerSrc),
    "FeatureProvider owns map via useRef",
  );

  assertCase(
    block,
    "provider.frozenValue",
    /Object\.freeze\s*\(\s*\{\s*states\s*:\s*statesRef\.current\s*,?\s*\}\s*\)/.test(
      providerSrc,
    ),
    "value = Object.freeze({ states: statesRef.current })",
  );

  assertCase(
    block,
    "provider.noSetters",
    !/\buseState\b/.test(providerSrc) &&
      !/\buseReducer\b/.test(providerSrc) &&
      !/\bsetStates\b/.test(providerSrc),
    "Provider has no useState / useReducer / setters",
  );

  assertCase(
    block,
    "context.nullDefault",
    /createContext\s*<\s*FeatureContextValue\s*\|\s*null\s*>\s*\(\s*null\s*\)/.test(
      contextSrc,
    ),
    "FeatureContext default is null",
  );

  assertCase(
    block,
    "context.statesOnly",
    /states\s*:\s*ReadonlyMap/.test(contextSrc) &&
      !/\bRegistry\b/.test(contextSrc) &&
      !/\bsetters?\b/i.test(contextSrc),
    "FeatureContextValue exposes states only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — hooksCertified (UX-5.7 evidence reuse)                           */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hooksCertified";
  const src = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";

  assertCase(
    block,
    "hooks.exists",
    existsSync(join(repoRoot, FEATURE_HOOKS)),
    "FeatureHooks.ts exists",
  );

  assertCase(
    block,
    "hooks.useFeatures",
    /export\s+function\s+useFeatures\s*\(\s*\)/.test(src),
    "useFeatures() exported",
  );

  assertCase(
    block,
    "hooks.useFeatureState",
    /export\s+function\s+useFeatureState\s*\(/.test(src),
    "useFeatureState(id) exported",
  );

  assertCase(
    block,
    "hooks.useFeatureAlias",
    /export\s+function\s+useFeature\s*\(/.test(src) &&
      /return\s+useFeatureState\s*\(\s*id\s*\)/.test(src),
    "useFeature is alias of useFeatureState",
  );

  assertCase(
    block,
    "hooks.contextOnly",
    /useContext\s*\(\s*FeatureContext\s*\)/.test(src) &&
      !/Object\.freeze\b/.test(src),
    "Hooks read FeatureContext only (no Object.freeze)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — bridgeCertified (UX-5.8 evidence reuse)                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "bridgeCertified";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";

  assertCase(
    block,
    "bridge.exists",
    existsSync(join(repoRoot, FEATURE_BRIDGE)),
    "FeatureBridge.tsx exists",
  );

  assertCase(
    block,
    "bridge.export",
    /export\s+function\s+FeatureBridge\s*\(/.test(src),
    "FeatureBridge exported",
  );

  assertCase(
    block,
    "bridge.availabilityAssertion",
    /useFeatures\s*\(\s*\)/.test(src),
    "Bridge calls useFeatures() (availability assertion)",
  );

  assertCase(
    block,
    "bridge.passThrough",
    /return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(src) ||
      /return\s+\(\s*<>\s*\{\s*children\s*\}\s*<\/>\s*\)/.test(src),
    "Bridge is children pass-through",
  );

  assertCase(
    block,
    "bridge.noMapConsume",
    !/\.get\s*\(/.test(src) && !/\.has\s*\(/.test(src),
    "Bridge does not consume the Map",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — diagnosticsCertified (UX-5.9 evidence reuse)                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsCertified";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";
  const raw = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? read(FEATURE_DIAGNOSTICS)
    : "";

  assertCase(
    block,
    "diagnostics.exists",
    existsSync(join(repoRoot, FEATURE_DIAGNOSTICS)),
    "FeatureDiagnostics.ts exists",
  );

  assertCase(
    block,
    "diagnostics.reportType",
    /export\s+type\s+FeatureDiagnosticsReport\s*=\s*Readonly\s*</.test(src) &&
      /registryFrozen/.test(src) &&
      /providerAvailable/.test(src) &&
      /hooksAvailable/.test(src) &&
      /bridgeAvailable/.test(src),
    "FeatureDiagnosticsReport Readonly contract intact",
  );

  assertCase(
    block,
    "diagnostics.factory",
    /export\s+function\s+createFeatureDiagnosticsReport\s*\(\s*\)/.test(src) &&
      /Object\.freeze\s*\(/.test(src),
    "createFeatureDiagnosticsReport() immutable report",
  );

  assertCase(
    block,
    "diagnostics.zeroImports",
    !/^\s*import\b/m.test(raw.replace(/^\/\*[\s\S]*?\*\//, "").trim()),
    "FeatureDiagnostics has zero import statements",
  );

  assertCase(
    block,
    "diagnostics.noFeatureRefs",
    !/\bFeatureRegistry\b/.test(src) &&
      !/\bFeatureProvider\b/.test(src) &&
      !/\bFeatureHooks\b/.test(src) &&
      !/\bFeatureBridge\b/.test(src) &&
      !/\bFeatureState\b/.test(src),
    "Diagnostics does not reference features/* modules",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — protectedFiles                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "protectedFiles";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  const featuresIndex = existsSync(join(repoRoot, FEATURES_INDEX))
    ? stripComments(read(FEATURES_INDEX))
    : "";

  assertCase(
    block,
    "protected.uiIndexExists",
    existsSync(join(repoRoot, UI_INDEX)),
    "src/ui/index.ts exists",
  );

  assertCase(
    block,
    "protected.featuresIndexExists",
    existsSync(join(repoRoot, FEATURES_INDEX)),
    "src/ui/features/index.ts exists",
  );

  assertCase(
    block,
    "protected.uiNoFeatures",
    !/features/.test(uiIndex) &&
      !/\bFeatureRegistry\b/.test(uiIndex) &&
      !/\bFeatureProvider\b/.test(uiIndex) &&
      !/\bFeatureBridge\b/.test(uiIndex) &&
      !/\bFeatureDiagnostics\b/.test(uiIndex) &&
      !/\buseFeature\b/.test(uiIndex),
    "src/ui/index.ts does not re-export features surface",
  );

  assertCase(
    block,
    "protected.featuresIndexNoExpansion",
    !/\bFeatureProvider\b/.test(featuresIndex) &&
      !/\bFeatureContext\b/.test(featuresIndex) &&
      !/\bFeatureState\b/.test(featuresIndex) &&
      !/\buseFeature\b/.test(featuresIndex) &&
      !/\bFeatureBridge\b/.test(featuresIndex) &&
      !/\bFeatureDiagnostics\b/.test(featuresIndex) &&
      !/\bcreateFeatureDiagnosticsReport\b/.test(featuresIndex),
    "features/index.ts does not re-export Provider/Hooks/Bridge/Diagnostics",
  );

  assertCase(
    block,
    "protected.featuresIndexRegistryOnly",
    /\bFeatureDefinition\b/.test(featuresIndex) &&
      /\bFeatureRegistry\b/.test(featuresIndex) &&
      /\bcreateFeatureRegistry\b/.test(featuresIndex),
    "features/index.ts retains Types/Definition/Registry surface only",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — productionUntouched                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "productionUntouched";
  const doc510 = existsSync(join(repoRoot, DOC_510)) ? read(DOC_510) : "";
  const shell = existsSync(join(repoRoot, APP_SHELL))
    ? stripComments(read(APP_SHELL))
    : "";
  const layout = existsSync(join(repoRoot, LAYOUT))
    ? stripComments(read(LAYOUT))
    : "";
  const page = existsSync(join(repoRoot, PAGE))
    ? stripComments(read(PAGE))
    : "";

  assertCase(
    block,
    "prod.docDeclaresDocumentary",
    /productionUntouched/i.test(doc510) &&
      /exclusivamente documentación/i.test(doc510) &&
      /validator/.test(doc510) &&
      /package\.json/.test(doc510),
    "UX-5.10.md declares documentary-only productionUntouched scope",
  );

  assertCase(
    block,
    "prod.docFilesScope",
    /docs\/UX\/UX-5\.10\.md/.test(doc510) &&
      /scripts\/validate-ux-5\.10\.ts/.test(doc510) &&
      /UX-5\.0-roadmap\.md/.test(doc510),
    "Files section lists only certification artifacts",
  );

  const featureMountRe =
    /\bFeatureProvider\b|\bFeatureBridge\b|\bFeatureDiagnostics\b|\bcreateFeatureDiagnosticsReport\b|\buseFeature\b|\buseFeatures\b|\buseFeatureState\b/;

  assertCase(
    block,
    "prod.noMountAppShell",
    existsSync(join(repoRoot, APP_SHELL)) && !featureMountRe.test(shell),
    "AppShell does not mount Feature* surface",
  );

  assertCase(
    block,
    "prod.noMountLayout",
    existsSync(join(repoRoot, LAYOUT)) && !featureMountRe.test(layout),
    "layout.tsx does not mount Feature* surface",
  );

  assertCase(
    block,
    "prod.noMountPage",
    existsSync(join(repoRoot, PAGE)) && !featureMountRe.test(page),
    "page.tsx does not mount Feature* surface",
  );

  const featureFiles = existsSync(join(repoRoot, FEATURES_DIR))
    ? readdirSync(join(repoRoot, FEATURES_DIR)).filter((n) =>
        /\.(ts|tsx)$/.test(n),
      )
    : [];
  const unexpected = featureFiles.filter((n) => !CERTIFIED_FEATURE_FILES.has(n));

  assertCase(
    block,
    "prod.featuresSurfaceFrozen",
    unexpected.length === 0 && featureFiles.length === CERTIFIED_FEATURE_FILES.size,
    unexpected.length === 0
      ? "src/ui/features/** matches certified file set"
      : `unexpected feature files: ${unexpected.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — historicalValidators                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "historicalValidators";
  const pkg = read("package.json");

  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
    const script = `scripts/validate-ux-5.${n}.ts`;
    assertCase(
      block,
      `historical.ux5${n}`,
      existsSync(join(repoRoot, script)) &&
        new RegExp(`"validate:ux-5\\.${n}"\\s*:`).test(pkg),
      `UX-5.${n} validator file + npm script retained`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — noPublicExpansion                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noPublicExpansion";
  const uiIndex = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";

  assertCase(
    block,
    "public.themeProvider",
    /\bThemeProvider\b/.test(uiIndex) && /\buseTheme\b/.test(uiIndex),
    "@/ui exports ThemeProvider + useTheme",
  );

  assertCase(
    block,
    "public.tokens",
    /\bprimitive\b/.test(uiIndex) && /\bsemantic\b/.test(uiIndex),
    "@/ui exports foundation tokens",
  );

  assertCase(
    block,
    "public.themes",
    /\bTHEME_IDS\b/.test(uiIndex) || /\bthemes\b/.test(uiIndex),
    "@/ui exports theme surface",
  );

  assertCase(
    block,
    "public.noFeatures",
    !/features/.test(uiIndex) &&
      !/\bFeature/.test(uiIndex) &&
      !/\basFeatureId\b/.test(uiIndex),
    "@/ui has no Feature* / features reexports",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — seriesIsolation                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "seriesIsolation";
  const files = walkFiles(join(repoRoot, FEATURES_DIR));
  const runtimeOffenders: string[] = [];
  const chromeOffenders: string[] = [];

  for (const f of files) {
    const rel = relative(repoRoot, f).replace(/\\/g, "/");
    const stripped = stripComments(readFileSync(f, "utf8"));
    if (
      /theme\/runtime/.test(stripped) ||
      /from\s+["']@\/ui\/theme\/runtime/.test(stripped)
    ) {
      runtimeOffenders.push(rel);
    }
    if (
      /app-shell/.test(stripped) ||
      /from\s+["']@\/components\/(app-shell|toolbar|inspector|workspace|status-bar|ui\/sidebar)/.test(
        stripped,
      ) ||
      /\bAppShell\b/.test(stripped) ||
      /\bAdaptiveToolbar\b/.test(stripped) ||
      /\bWorkspaceLayout\b/.test(stripped)
    ) {
      chromeOffenders.push(rel);
    }
  }

  assertCase(
    block,
    "isolation.noRuntime",
    runtimeOffenders.length === 0,
    runtimeOffenders.length === 0
      ? "features/** has no Runtime imports"
      : `Runtime imports: ${runtimeOffenders.join(", ")}`,
  );

  assertCase(
    block,
    "isolation.noChrome",
    chromeOffenders.length === 0,
    chromeOffenders.length === 0
      ? "features/** has no chrome / AppShell imports"
      : `Chrome refs: ${chromeOffenders.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — architectureFreeze                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "architectureFreeze";
  const chain: Array<{ id: string; path: string }> = [
    { id: "Definition", path: FEATURE_DEFINITION },
    { id: "Registry", path: FEATURE_REGISTRY },
    { id: "State", path: FEATURE_STATE },
    { id: "Provider", path: FEATURE_PROVIDER },
    { id: "Hooks", path: FEATURE_HOOKS },
    { id: "Bridge", path: FEATURE_BRIDGE },
    { id: "Diagnostics", path: FEATURE_DIAGNOSTICS },
  ];

  for (const { id, path } of chain) {
    assertCase(
      block,
      `arch.exists.${id}`,
      existsSync(join(repoRoot, path)),
      `${path} present in certified chain`,
    );
  }

  assertCase(
    block,
    "arch.typesSupport",
    existsSync(join(repoRoot, FEATURE_TYPES)) &&
      existsSync(join(repoRoot, FEATURE_CONTEXT)),
    "FeatureTypes + FeatureContext support the chain",
  );

  const registrySrc = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";
  const providerSrc = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";
  const hooksSrc = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";
  const bridgeSrc = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";

  assertCase(
    block,
    "arch.registryUsesDefinition",
    /from\s+["']\.\/FeatureDefinition["']/.test(registrySrc),
    "Registry depends on FeatureDefinition",
  );

  assertCase(
    block,
    "arch.providerUsesState",
    /from\s+["']\.\/FeatureState["']/.test(providerSrc) &&
      /from\s+["']\.\/FeatureContext["']/.test(providerSrc),
    "Provider depends on FeatureState + FeatureContext",
  );

  assertCase(
    block,
    "arch.hooksUsesContext",
    /from\s+["']\.\/FeatureContext["']/.test(hooksSrc) &&
      /from\s+["']\.\/FeatureState["']/.test(hooksSrc),
    "Hooks depend on FeatureContext + FeatureState",
  );

  assertCase(
    block,
    "arch.bridgeUsesHooks",
    /from\s+["']\.\/FeatureHooks["']/.test(bridgeSrc),
    "Bridge depends on FeatureHooks",
  );

  assertCase(
    block,
    "arch.diagnosticsIsolated",
    existsSync(join(repoRoot, FEATURE_DIAGNOSTICS)) &&
      !/from\s+["']\.\//.test(
        stripComments(read(FEATURE_DIAGNOSTICS)),
      ),
    "Diagnostics remains isolated at chain end",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 16 — tscCompile                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "tscCompile";
  const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
    timeout: 180_000,
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
/* PASS 17 — certificationSummary                                             */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "certificationSummary";
  const priorBlocks: BlockId[] = [
    "roadmapCertified",
    "docsExist",
    "registryCertified",
    "metadataCertified",
    "stateCertified",
    "providerCertified",
    "hooksCertified",
    "bridgeCertified",
    "diagnosticsCertified",
    "protectedFiles",
    "productionUntouched",
    "historicalValidators",
    "noPublicExpansion",
    "seriesIsolation",
    "architectureFreeze",
    "tscCompile",
  ];

  let priorAllPass = true;
  for (const id of priorBlocks) {
    const blockResults = results.filter((r) => r.block === id);
    if (
      blockResults.length === 0 ||
      blockResults.some((r) => r.pass === false)
    ) {
      priorAllPass = false;
      break;
    }
  }

  assertCase(
    block,
    "summary.allPriorPass",
    priorAllPass,
    priorAllPass
      ? "All prior certification blocks PASS (16/16)"
      : "One or more prior certification blocks FAILED",
  );

  assertCase(
    block,
    "summary.seriesCertified",
    priorAllPass,
    priorAllPass
      ? "UX-5 SERIES CERTIFIED (all-or-nothing)"
      : "UX-5 SERIES CERTIFIED is NOT valid",
  );

  assertCase(
    block,
    "summary.gateFinal",
    priorAllPass,
    "validate:ux-5.10 is the final series gate",
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; pass: number; ca: string }> = [
  { id: "roadmapCertified", pass: 1, ca: "CA-UX-5.10.1" },
  { id: "docsExist", pass: 2, ca: "CA-UX-5.10.2" },
  { id: "registryCertified", pass: 3, ca: "CA-UX-5.10.3" },
  { id: "metadataCertified", pass: 4, ca: "CA-UX-5.10.4" },
  { id: "stateCertified", pass: 5, ca: "CA-UX-5.10.5" },
  { id: "providerCertified", pass: 6, ca: "CA-UX-5.10.6" },
  { id: "hooksCertified", pass: 7, ca: "CA-UX-5.10.7" },
  { id: "bridgeCertified", pass: 8, ca: "CA-UX-5.10.8" },
  { id: "diagnosticsCertified", pass: 9, ca: "CA-UX-5.10.9" },
  { id: "protectedFiles", pass: 10, ca: "CA-UX-5.10.10" },
  { id: "productionUntouched", pass: 11, ca: "CA-UX-5.10.11" },
  { id: "historicalValidators", pass: 12, ca: "CA-UX-5.10.12" },
  { id: "noPublicExpansion", pass: 13, ca: "CA-UX-5.10.13" },
  { id: "seriesIsolation", pass: 14, ca: "CA-UX-5.10.14" },
  { id: "architectureFreeze", pass: 15, ca: "CA-UX-5.10.15" },
  { id: "tscCompile", pass: 16, ca: "CA-UX-5.10.16" },
  { id: "certificationSummary", pass: 17, ca: "CA-UX-5.10.17" },
];

let passCount = 0;
for (const { id: block, pass, ca } of BLOCKS) {
  const blockResults = results.filter((r) => r.block === block);
  const failed = blockResults.filter((r) => r.pass === false);
  const ok = failed.length === 0 && blockResults.length > 0;
  if (ok) passCount += 1;
  const label = `PASS ${String(pass).padStart(2, "0")} ${block}`;
  const pad = ".".repeat(Math.max(1, 48 - label.length));
  console.log(`${label} ${pad} ${ok ? "PASS" : "FAIL"} (${ca})`);
  for (const f of failed) {
    console.log(`  FAIL ${f.id}: ${f.detail}`);
  }
  if (blockResults.length === 0) {
    console.log(`  FAIL (no cases)`);
  }
}

const allPass = passCount === BLOCKS.length;
console.log("validate:ux-5.10");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("UX-5 SERIES CERTIFIED");
  console.log("Series Closed · Next UX-6");
  console.log("Partial certification is not permitted — all blocks passed");
  console.log("validate:ux-5.10 = final series gate");
} else {
  console.log(
    "UX-5 SERIES CERTIFIED is NOT valid (partial certification forbidden)",
  );
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
