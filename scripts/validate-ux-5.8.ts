/**
 * UX-5.8 — Feature Integration Bridge gate
 * (pass-through · Availability assertion only · no product wire).
 *
 * Blocks:
 * priorGate · bridgeExists · bridgeContract · hookUsage · bridgeIsolation
 * noState · chromeIsolation · providerUntouched · hooksUntouched
 * registryUntouched · noRuntimeDep · noProductWire · publicBarrelIntact
 * noBehavior · tscCompile
 *
 * Architectural principles:
 * - Bridge = children-only pass-through · fragment render.
 * - useFeatures() = Availability assertion only (no Map consumption).
 * - Bridge Isolation · chromeIsolation · no product mount.
 * - Provider / Hooks / Registry untouched (UX-5.6 / UX-5.7 / UX-5.2 freezes).
 * - validate:ux-5.8 = active series gate; validate:ux-5.7 = historical.
 * - No setters · no dispatch · no product wiring · no @/ui expansion.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "bridgeExists"
  | "bridgeContract"
  | "hookUsage"
  | "bridgeIsolation"
  | "noState"
  | "chromeIsolation"
  | "providerUntouched"
  | "hooksUntouched"
  | "registryUntouched"
  | "noRuntimeDep"
  | "noProductWire"
  | "publicBarrelIntact"
  | "noBehavior"
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

/** Extract exported function body by name (brace-balanced). */
function extractFunctionBody(src: string, fnName: string): string {
  const re = new RegExp(
    `export\\s+function\\s+${fnName}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\{`,
  );
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
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

/** Extract a Readonly<{...}> type body by export name (brace-balanced). */
function extractReadonlyTypeBody(src: string, typeName: string): string {
  const re = new RegExp(
    `export\\s+type\\s+${typeName}\\s*=\\s*Readonly\\s*<\\s*\\{`,
  );
  const m = re.exec(src);
  if (!m || m.index === undefined) return "";
  let i = m.index + m[0].length;
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

const FEATURES_DIR = "src/ui/features";
const FEATURE_BRIDGE = `${FEATURES_DIR}/FeatureBridge.tsx`;
const FEATURE_HOOKS = `${FEATURES_DIR}/FeatureHooks.ts`;
const FEATURE_PROVIDER = `${FEATURES_DIR}/FeatureProvider.tsx`;
const FEATURE_REGISTRY = `${FEATURES_DIR}/FeatureRegistry.ts`;
const FEATURES_INDEX = `${FEATURES_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_5 = "docs/UX/UX-5.0-roadmap.md";
const DOC_5_1 = "docs/UX/UX-5.1.md";
const DOC_5_2 = "docs/UX/UX-5.2.md";
const DOC_5_3 = "docs/UX/UX-5.3.md";
const DOC_5_4 = "docs/UX/UX-5.4.md";
const DOC_5_5 = "docs/UX/UX-5.5.md";
const DOC_5_6 = "docs/UX/UX-5.6.md";
const DOC_5_7 = "docs/UX/UX-5.7.md";
const DOC_5_8 = "docs/UX/UX-5.8.md";
const UX_4_10 = "docs/UX/UX-4.10.md";

/* -------------------------------------------------------------------------- */
/* PASS 01 — priorGate                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "priorGate";

  assertCase(
    block,
    "prior.ux410Doc",
    existsSync(join(repoRoot, UX_4_10)),
    `${UX_4_10} exists`,
  );

  const ux410 = existsSync(join(repoRoot, UX_4_10)) ? read(UX_4_10) : "";
  assertCase(
    block,
    "prior.ux410Certified",
    /SERIES CERTIFIED/i.test(ux410) && /UX-5/.test(ux410),
    "UX-4.10 declares SERIES CERTIFIED and Next UX-5",
  );

  assertCase(
    block,
    "prior.roadmapExists",
    existsSync(join(repoRoot, ROADMAP_5)),
    `${ROADMAP_5} exists`,
  );

  const roadmap = existsSync(join(repoRoot, ROADMAP_5)) ? read(ROADMAP_5) : "";
  assertCase(
    block,
    "prior.roadmapFrozen",
    /Status:\s*FROZEN/.test(roadmap) && /UX-5\.0\s*=\s*FROZEN/.test(roadmap),
    "UX-5.0 roadmap is FROZEN",
  );

  assertCase(
    block,
    "prior.roadmap57Complete",
    /UX-5\.7\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.7 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap58Complete",
    /UX-5\.8\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.8 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext59",
    /Next\s*=\s*UX-5\.9/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.9",
  );

  assertCase(
    block,
    "prior.roadmap59to510Pending",
    /UX-5\.9\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.9–UX-5.10 remain PENDING",
  );

  assertCase(
    block,
    "prior.doc51",
    existsSync(join(repoRoot, DOC_5_1)),
    `${DOC_5_1} exists`,
  );

  assertCase(
    block,
    "prior.doc52",
    existsSync(join(repoRoot, DOC_5_2)),
    `${DOC_5_2} exists`,
  );

  assertCase(
    block,
    "prior.doc53",
    existsSync(join(repoRoot, DOC_5_3)),
    `${DOC_5_3} exists`,
  );

  assertCase(
    block,
    "prior.doc54",
    existsSync(join(repoRoot, DOC_5_4)),
    `${DOC_5_4} exists`,
  );

  assertCase(
    block,
    "prior.doc55",
    existsSync(join(repoRoot, DOC_5_5)),
    `${DOC_5_5} exists`,
  );

  assertCase(
    block,
    "prior.doc56",
    existsSync(join(repoRoot, DOC_5_6)),
    `${DOC_5_6} exists`,
  );

  assertCase(
    block,
    "prior.doc57",
    existsSync(join(repoRoot, DOC_5_7)),
    `${DOC_5_7} exists`,
  );

  assertCase(
    block,
    "prior.doc58",
    existsSync(join(repoRoot, DOC_5_8)),
    `${DOC_5_8} exists`,
  );

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript57",
    /"validate:ux-5\.7"\s*:/.test(pkg),
    "package.json has validate:ux-5.7 (historical)",
  );

  assertCase(
    block,
    "prior.pkgScript58",
    /"validate:ux-5\.8"\s*:/.test(pkg),
    "package.json has validate:ux-5.8 (active gate)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — bridgeExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "bridgeExists";

  assertCase(
    block,
    "bridge.fileExists",
    existsSync(join(repoRoot, FEATURE_BRIDGE)),
    `${FEATURE_BRIDGE} exists`,
  );

  const raw = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? read(FEATURE_BRIDGE)
    : "";
  const src = stripComments(raw);

  assertCase(
    block,
    "bridge.useClient",
    /["']use client["']/.test(raw),
    'FeatureBridge declares "use client"',
  );

  assertCase(
    block,
    "bridge.exportsFeatureBridge",
    /export\s+function\s+FeatureBridge\s*\(/.test(src),
    "FeatureBridge is exported",
  );

  assertCase(
    block,
    "bridge.exportsProps",
    /export\s+type\s+FeatureBridgeProps\s*=/.test(src),
    "FeatureBridgeProps is exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — bridgeContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "bridgeContract";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";
  const propsBody = extractReadonlyTypeBody(src, "FeatureBridgeProps");

  assertCase(
    block,
    "contract.childrenOnly",
    /\bchildren\s*:\s*ReactNode\b/.test(propsBody) &&
      !/\bregistry\b/i.test(propsBody) &&
      !/\bid\b/.test(propsBody) &&
      !/\bfeatures\b/i.test(propsBody) &&
      !/\bon[A-Z]/.test(propsBody),
    "FeatureBridgeProps contains only children: ReactNode",
  );

  assertCase(
    block,
    "contract.signature",
    /export\s+function\s+FeatureBridge\s*\(\s*\{\s*children\s*\}\s*:\s*FeatureBridgeProps\s*\)/.test(
      src,
    ),
    "FeatureBridge({ children }: FeatureBridgeProps)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — hookUsage                                                        */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hookUsage";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";
  const body = extractFunctionBody(src, "FeatureBridge");

  assertCase(
    block,
    "hook.usesUseFeatures",
    /\buseFeatures\s*\(\s*\)\s*;/.test(body),
    "FeatureBridge calls useFeatures()",
  );

  assertCase(
    block,
    "hook.noBinding",
    !/(?:const|let|var)\s+\w+\s*=\s*useFeatures\s*\(/.test(body) &&
      !/useFeatures\s*\(\s*\)\s*[.;]/.test(
        body.replace(/\buseFeatures\s*\(\s*\)\s*;/, ""),
      ),
    "useFeatures() return value is not bound",
  );

  // Stricter: after stripping the bare call, no remaining useFeatures usage that assigns
  assertCase(
    block,
    "hook.bareCallOnly",
    /^\s*useFeatures\s*\(\s*\)\s*;/.test(body.trim()) ||
      /\n\s*useFeatures\s*\(\s*\)\s*;/.test(body),
    "useFeatures() appears as a bare statement",
  );

  assertCase(
    block,
    "hook.noUseFeature",
    !/\buseFeature\s*\(/.test(src) && !/\buseFeatureState\s*\(/.test(src),
    "FeatureBridge does not call useFeature / useFeatureState",
  );

  assertCase(
    block,
    "hook.noSize",
    !/\.size\b/.test(body),
    "FeatureBridge does not consult .size",
  );

  assertCase(
    block,
    "hook.noIterate",
    !/\.forEach\s*\(/.test(body) &&
      !/\.entries\s*\(/.test(body) &&
      !/\.keys\s*\(/.test(body) &&
      !/\.values\s*\(/.test(body) &&
      !/\bfor\s*\(/.test(body) &&
      !/\bof\b/.test(body) &&
      !/Symbol\.iterator/.test(body),
    "FeatureBridge does not iterate the Map",
  );

  assertCase(
    block,
    "hook.noFlags",
    !/\benabled\b/.test(body) &&
      !/\bhidden\b/.test(body) &&
      !/\bvisible\b/.test(body) &&
      !/\bis[A-Z]/.test(body) &&
      !/\bhas[A-Z]/.test(body),
    "FeatureBridge does not derive flags from Features",
  );

  assertCase(
    block,
    "hook.noConditional",
    !/\bif\s*\(/.test(body) &&
      !/\?\s*[^=]/.test(body) &&
      !/&&\s*</.test(body) &&
      !/\|\|\s*</.test(body),
    "FeatureBridge does not render conditionally",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — bridgeIsolation                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "bridgeIsolation";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";

  assertCase(
    block,
    "iso.reactNode",
    /from\s+["']react["']/.test(src) && /\bReactNode\b/.test(src),
    "FeatureBridge imports ReactNode from react",
  );

  assertCase(
    block,
    "iso.useFeatures",
    /from\s+["']\.\/FeatureHooks["']/.test(src) && /\buseFeatures\b/.test(src),
    "FeatureBridge imports useFeatures from FeatureHooks",
  );

  assertCase(
    block,
    "iso.noProvider",
    !/from\s+["']\.\/FeatureProvider["']/.test(src) &&
      !/\bFeatureProvider\b/.test(src),
    "FeatureBridge does not import FeatureProvider",
  );

  assertCase(
    block,
    "iso.noContext",
    !/from\s+["']\.\/FeatureContext["']/.test(src) &&
      !/\bFeatureContext\b/.test(src),
    "FeatureBridge does not import FeatureContext",
  );

  assertCase(
    block,
    "iso.noRegistry",
    !/\bFeatureRegistry\b/.test(src) &&
      !/from\s+["']\.\/FeatureRegistry["']/.test(src),
    "FeatureBridge does not import FeatureRegistry",
  );

  assertCase(
    block,
    "iso.noDefinition",
    !/\bFeatureDefinition\b/.test(src) &&
      !/from\s+["']\.\/FeatureDefinition["']/.test(src),
    "FeatureBridge does not import FeatureDefinition",
  );

  assertCase(
    block,
    "iso.noRuntime",
    !/theme\/runtime/.test(src) &&
      !/from\s+["'][^"']*ui\/theme\/runtime/.test(src),
    "FeatureBridge does not import Runtime",
  );

  assertCase(
    block,
    "iso.noChrome",
    !/from\s+["'][^"']*toolbar/.test(src) &&
      !/from\s+["'][^"']*sidebar/.test(src) &&
      !/from\s+["'][^"']*inspector/.test(src) &&
      !/from\s+["'][^"']*panels/.test(src) &&
      !/from\s+["'][^"']*menus?/.test(src),
    "FeatureBridge does not import product chrome",
  );

  const localImports = [
    ...src.matchAll(/from\s+["'](\.\/[^"']+)["']/g),
  ].map((m) => m[1]);
  const allowedLocal = new Set(["./FeatureHooks"]);
  const badLocal = localImports.filter((p) => !allowedLocal.has(p));
  assertCase(
    block,
    "iso.onlyAllowedLocalImports",
    badLocal.length === 0,
    badLocal.length === 0
      ? "FeatureBridge local imports are only FeatureHooks"
      : `Unexpected local imports: ${badLocal.join(", ")}`,
  );

  // External package imports: only react
  const packageImports = [
    ...src.matchAll(/from\s+["']([^./][^"']*)["']/g),
  ].map((m) => m[1]);
  const badPkg = packageImports.filter((p) => p !== "react");
  assertCase(
    block,
    "iso.onlyReactPackage",
    badPkg.length === 0,
    badPkg.length === 0
      ? "FeatureBridge package imports are only react"
      : `Unexpected packages: ${badPkg.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — noState                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noState";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";

  assertCase(
    block,
    "state.noUseState",
    !/\buseState\b/.test(src),
    "FeatureBridge does not use useState",
  );

  assertCase(
    block,
    "state.noUseReducer",
    !/\buseReducer\b/.test(src),
    "FeatureBridge does not use useReducer",
  );

  assertCase(
    block,
    "state.noUseEffect",
    !/\buseEffect\b/.test(src),
    "FeatureBridge does not use useEffect",
  );

  assertCase(
    block,
    "state.noUseMemo",
    !/\buseMemo\b/.test(src),
    "FeatureBridge does not use useMemo",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — chromeIsolation                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "chromeIsolation";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";

  assertCase(
    block,
    "chrome.noToolbar",
    !/\bToolbar\b/.test(src) && !/toolbar/i.test(src),
    "FeatureBridge has no Toolbar references",
  );

  assertCase(
    block,
    "chrome.noSidebar",
    !/\bSidebar\b/.test(src) && !/sidebar/i.test(src),
    "FeatureBridge has no Sidebar references",
  );

  assertCase(
    block,
    "chrome.noInspector",
    !/\bInspector\b/.test(src) && !/inspector/i.test(src),
    "FeatureBridge has no Inspector references",
  );

  assertCase(
    block,
    "chrome.noPanels",
    !/\bPanels?\b/.test(src) && !/panels?/i.test(src),
    "FeatureBridge has no Panels references",
  );

  assertCase(
    block,
    "chrome.noMenus",
    !/\bMenus?\b/.test(src) && !/\bmenus?\b/i.test(src),
    "FeatureBridge has no Menus references",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — providerUntouched                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerUntouched";
  const src = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";

  assertCase(
    block,
    "provider.fileExists",
    existsSync(join(repoRoot, FEATURE_PROVIDER)),
    `${FEATURE_PROVIDER} exists`,
  );

  assertCase(
    block,
    "provider.useRef",
    /\buseRef\s*</.test(src) || /\buseRef\s*\(/.test(src),
    "FeatureProvider still uses useRef",
  );

  assertCase(
    block,
    "provider.freezeValue",
    /Object\.freeze\s*\(\s*\{\s*states\s*:\s*statesRef\.current\s*,?\s*\}\s*\)/.test(
      src,
    ),
    "value = Object.freeze({ states: statesRef.current }) intact",
  );

  assertCase(
    block,
    "provider.childrenOnly",
    /children/.test(src) &&
      !/\bregistry\b/i.test(src) &&
      !/\binitialStates\b/.test(src),
    "FeatureProvider props remain children-only",
  );

  assertCase(
    block,
    "provider.noUseState",
    !/\buseState\b/.test(src) && !/\buseReducer\b/.test(src),
    "FeatureProvider has no useState / useReducer",
  );

  assertCase(
    block,
    "provider.noHooksImport",
    !/from\s+["']\.\/FeatureHooks["']/.test(src) &&
      !/\buseFeature\b/.test(src) &&
      !/\buseFeatures\b/.test(src) &&
      !/\buseFeatureState\b/.test(src),
    "FeatureProvider does not import FeatureHooks",
  );

  assertCase(
    block,
    "provider.noBridge",
    !/from\s+["']\.\/FeatureBridge["']/.test(src) &&
      !/\bFeatureBridge\b/.test(src),
    "FeatureProvider does not import FeatureBridge",
  );

  assertCase(
    block,
    "provider.noCreateFeatureState",
    !/\bcreateFeatureState\b/.test(src),
    "FeatureProvider does not call createFeatureState",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — hooksUntouched                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hooksUntouched";
  const raw = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? read(FEATURE_HOOKS)
    : "";
  const src = stripComments(raw);
  const useFeaturesBody = extractFunctionBody(src, "useFeatures");
  const useFeatureBody = extractFunctionBody(src, "useFeature");

  assertCase(
    block,
    "hooks.fileExists",
    existsSync(join(repoRoot, FEATURE_HOOKS)),
    `${FEATURE_HOOKS} exists`,
  );

  assertCase(
    block,
    "hooks.useClient",
    /["']use client["']/.test(raw),
    'FeatureHooks declares "use client"',
  );

  assertCase(
    block,
    "hooks.threeExports",
    /export\s+function\s+useFeatures\s*\(/.test(src) &&
      /export\s+function\s+useFeatureState\s*\(/.test(src) &&
      /export\s+function\s+useFeature\s*\(/.test(src),
    "useFeatures · useFeatureState · useFeature remain exported",
  );

  assertCase(
    block,
    "hooks.referenceStability",
    /return\s+context\.states\s*;/.test(useFeaturesBody),
    "useFeatures still returns exactly context.states",
  );

  assertCase(
    block,
    "hooks.aliasIntact",
    /return\s+useFeatureState\s*\(\s*id\s*\)\s*;/.test(useFeatureBody),
    "useFeature remains alias of useFeatureState",
  );

  assertCase(
    block,
    "hooks.noBridge",
    !/\bFeatureBridge\b/.test(src),
    "FeatureHooks does not reference FeatureBridge",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — registryUntouched                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryUntouched";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "reg.typeReadonly",
    /export\s+type\s+FeatureRegistry\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureRegistry is Readonly object type",
  );

  assertCase(
    block,
    "reg.foundationMethods",
    /\bget\s*\(\s*id\s*:\s*FeatureId\s*\)/.test(src) &&
      /\bhas\s*\(\s*id\s*:\s*FeatureId\s*\)/.test(src) &&
      /\bsize\s*\(\s*\)/.test(src),
    "FeatureRegistry retains get / has / size",
  );

  assertCase(
    block,
    "reg.discoverySignatures",
    /getAll\s*\(\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(src) &&
      /byCategory\s*\(\s*category\s*:\s*FeatureCategory\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(
        src,
      ) &&
      /find\s*\(\s*predicate\s*:\s*\(\s*feature\s*:\s*FeatureDefinition\s*\)\s*=>\s*boolean\s*,?\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(
        src,
      ) &&
      /enabled\s*\(\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(src),
    "Discovery methods keep UX-5.2 signatures",
  );

  assertCase(
    block,
    "reg.exactApiSurface",
    /\bget\s*\(/.test(src) &&
      /\bhas\s*\(/.test(src) &&
      /\bsize\s*\(/.test(src) &&
      /\bgetAll\s*\(/.test(src) &&
      /\bbyCategory\s*\(/.test(src) &&
      /\bfind\s*\(/.test(src) &&
      /\benabled\s*\(/.test(src),
    "Registry exposes exactly UX-5.2 API surface",
  );

  assertCase(
    block,
    "reg.noMutators",
    !/\bregister\s*\(/.test(src) &&
      !/\bunregister\s*\(/.test(src) &&
      !/\bupdate\s*\(/.test(src) &&
      !/\bput\s*\(/.test(src) &&
      !/\b\.set\s*\(/.test(src) &&
      !/\bdelete\s*\(/.test(src) &&
      !/\bremove\s*\(/.test(src) &&
      !/\bclear\s*\(/.test(src),
    "No public mutators",
  );

  assertCase(
    block,
    "reg.noIterators",
    !/\bvalues\s*\(/.test(src) &&
      !/\bentries\s*\(/.test(src) &&
      !/\bkeys\s*\(/.test(src) &&
      !/\bforEach\s*\(/.test(src) &&
      !/Symbol\.iterator/.test(src),
    "No public iterators",
  );

  assertCase(
    block,
    "reg.enabledDelegates",
    /enabled\s*\(\s*\)\s*(?::\s*readonly\s+FeatureDefinition\s*\[\s*\])?\s*\{\s*return\s+(?:this|registry)\.getAll\s*\(\s*\)\s*;/.test(
      src,
    ),
    "enabled() still delegates to getAll()",
  );

  assertCase(
    block,
    "reg.shallowFreezeOnly",
    /Object\.freeze\s*\(\s*\{\s*\.\.\.def\s*\}\s*\)/.test(src),
    "Registry keeps shallow Object.freeze({ ...def })",
  );

  assertCase(
    block,
    "reg.noHooksOrBridge",
    !/\buseFeature\b/.test(src) &&
      !/\bFeatureContext\b/.test(src) &&
      !/\bFeatureProvider\b/.test(src) &&
      !/\bFeatureBridge\b/.test(src),
    "Registry does not reference Hooks / Context / Provider / Bridge",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — noRuntimeDep                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noRuntimeDep";
  const featureFiles = walkFiles(join(repoRoot, FEATURES_DIR));
  let runtimeDep = false;
  for (const full of featureFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /theme\/runtime/.test(src) ||
      /from\s+["'][^"']*ui\/theme\/runtime/.test(src)
    ) {
      runtimeDep = true;
      break;
    }
  }

  assertCase(
    block,
    "noRuntime.imports",
    featureFiles.length > 0 && !runtimeDep,
    "src/ui/features/** does not import theme/runtime",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — noProductWire                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProductWire";
  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  const featuresAbs = join(repoRoot, FEATURES_DIR);
  const offenders: string[] = [];
  const bridgeOffenders: string[] = [];

  for (const full of allSrc) {
    if (full.startsWith(featuresAbs)) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']@\/ui\/features/.test(src) ||
      /from\s+["'][^"']*ui\/features/.test(src) ||
      /\bFeatureProvider\b/.test(src) ||
      /\bFeatureContext\b/.test(src) ||
      /\bFeatureBridge\b/.test(src) ||
      /\buseFeature\b/.test(src) ||
      /\buseFeatures\b/.test(src) ||
      /\buseFeatureState\b/.test(src)
    ) {
      offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
    if (
      /\bFeatureBridge\b/.test(src) ||
      /from\s+["'][^"']*FeatureBridge/.test(src)
    ) {
      bridgeOffenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
  }

  assertCase(
    block,
    "wire.noExternalConsumers",
    offenders.length === 0,
    offenders.length === 0
      ? "No consumers of ui/features / Provider / Context / Hooks / Bridge outside features/"
      : `External consumers: ${offenders.slice(0, 5).join(", ")}`,
  );

  assertCase(
    block,
    "wire.bridgeNotMounted",
    bridgeOffenders.length === 0,
    bridgeOffenders.length === 0
      ? "FeatureBridge is not imported outside features/"
      : `FeatureBridge imported outside features/: ${bridgeOffenders
          .slice(0, 5)
          .join(", ")}`,
  );

  const featuresSrc = walkFiles(featuresAbs)
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");

  assertCase(
    block,
    "wire.noChromeImports",
    !/from\s+["'][^"']*toolbar/.test(featuresSrc) &&
      !/from\s+["'][^"']*sidebar/.test(featuresSrc) &&
      !/from\s+["'][^"']*inspector/.test(featuresSrc) &&
      !/from\s+["'][^"']*panels/.test(featuresSrc) &&
      !/from\s+["'][^"']*menus?/.test(featuresSrc),
    "features/** does not import Toolbar/Sidebar/Inspector/Panels/Menus",
  );

  // AppShell / Layout / page must not mention FeatureBridge
  const shellCandidates = [
    "src/components/app-shell",
    "src/app",
  ];
  let shellWire = false;
  for (const rel of shellCandidates) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    for (const full of walkFiles(abs)) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (/\bFeatureBridge\b/.test(src) || /\bFeatureProvider\b/.test(src)) {
        shellWire = true;
        break;
      }
    }
  }
  assertCase(
    block,
    "wire.noAppShellOrLayout",
    !shellWire,
    "AppShell / app Layout / pages do not mount FeatureBridge or FeatureProvider",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — publicBarrelIntact                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "publicBarrelIntact";
  const uiSrc = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
    : "";
  const featuresIndexSrc = existsSync(join(repoRoot, FEATURES_INDEX))
    ? stripComments(read(FEATURES_INDEX))
    : "";

  assertCase(
    block,
    "barrel.exists",
    existsSync(join(repoRoot, UI_INDEX)),
    `${UI_INDEX} exists`,
  );

  assertCase(
    block,
    "barrel.noFeatures",
    !/features/.test(uiSrc) &&
      !/\bFeatureRegistry\b/.test(uiSrc) &&
      !/\bFeatureDefinition\b/.test(uiSrc) &&
      !/\bFeatureState\b/.test(uiSrc) &&
      !/\bFeatureStatus\b/.test(uiSrc) &&
      !/\bFeatureVisibility\b/.test(uiSrc) &&
      !/\bFeatureProvider\b/.test(uiSrc) &&
      !/\bFeatureContext\b/.test(uiSrc) &&
      !/\bFeatureBridge\b/.test(uiSrc) &&
      !/\buseFeature\b/.test(uiSrc) &&
      !/\buseFeatures\b/.test(uiSrc) &&
      !/\buseFeatureState\b/.test(uiSrc) &&
      !/\basFeatureId\b/.test(uiSrc) &&
      !/\bcreateFeatureDefinition\b/.test(uiSrc) &&
      !/\bcreateFeatureState\b/.test(uiSrc),
    "src/ui/index.ts does not re-export features / Provider / Context / Hooks / Bridge",
  );

  assertCase(
    block,
    "barrel.featuresIndexIntact",
    !/\bFeatureProvider\b/.test(featuresIndexSrc) &&
      !/\bFeatureContext\b/.test(featuresIndexSrc) &&
      !/\bFeatureBridge\b/.test(featuresIndexSrc) &&
      !/\bFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureStatus\b/.test(featuresIndexSrc) &&
      !/\bcreateFeatureState\b/.test(featuresIndexSrc) &&
      !/\buseFeature\b/.test(featuresIndexSrc) &&
      !/\buseFeatures\b/.test(featuresIndexSrc) &&
      !/\buseFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureHooks\b/.test(featuresIndexSrc),
    "features/index.ts does not re-export Provider / Context / State / Hooks / Bridge",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — noBehavior                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noBehavior";
  const src = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? stripComments(read(FEATURE_BRIDGE))
    : "";
  const body = extractFunctionBody(src, "FeatureBridge");
  const compact = body.replace(/\s+/g, " ").trim();

  assertCase(
    block,
    "behavior.passThrough",
    /useFeatures\s*\(\s*\)\s*;/.test(body) &&
      (/return\s*<>\s*\{?\s*children\s*\}?\s*<\/>/.test(compact) ||
        /return\s*\(\s*<>\s*\{?\s*children\s*\}?\s*<\/>\s*\)/.test(compact) ||
        /return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(body) ||
        /return\s*\(\s*<>[\s\S]*\{\s*children\s*\}[\s\S]*<\/>\s*\)/.test(body)),
    "FeatureBridge body is useFeatures(); return <>{children}</>",
  );

  assertCase(
    block,
    "behavior.noExtraStatements",
    (() => {
      const cleaned = body
        .replace(/\buseFeatures\s*\(\s*\)\s*;/, "")
        .replace(/return\s*\(?\s*<>[\s\S]*\{\s*children\s*\}[\s\S]*<\/>\s*\)?\s*;?/, "")
        .replace(/\s+/g, "")
        .trim();
      return cleaned.length === 0;
    })(),
    "FeatureBridge has no statements beyond availability assertion + children render",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — tscCompile                                                       */
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
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; pass: number; ca: string }> = [
  { id: "priorGate", pass: 1, ca: "CA-UX-5.8.12 / CA-UX-5.8.13" },
  { id: "bridgeExists", pass: 2, ca: "CA-UX-5.8.2 / CA-UX-5.8.3" },
  { id: "bridgeContract", pass: 3, ca: "CA-UX-5.8.3" },
  { id: "hookUsage", pass: 4, ca: "CA-UX-5.8.4 / CA-UX-5.8.5" },
  { id: "bridgeIsolation", pass: 5, ca: "CA-UX-5.8.6" },
  { id: "noState", pass: 6, ca: "CA-UX-5.8.7" },
  { id: "chromeIsolation", pass: 7, ca: "CA-UX-5.8.10" },
  { id: "providerUntouched", pass: 8, ca: "CA-UX-5.8.9" },
  { id: "hooksUntouched", pass: 9, ca: "CA-UX-5.8.9" },
  { id: "registryUntouched", pass: 10, ca: "CA-UX-5.8.9" },
  { id: "noRuntimeDep", pass: 11, ca: "CA-UX-5.8.10" },
  { id: "noProductWire", pass: 12, ca: "CA-UX-5.8.10" },
  { id: "publicBarrelIntact", pass: 13, ca: "CA-UX-5.8.10" },
  { id: "noBehavior", pass: 14, ca: "CA-UX-5.8.8" },
  { id: "tscCompile", pass: 15, ca: "CA-UX-5.8.11" },
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
console.log("validate:ux-5.8");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Integration Bridge");
  console.log("FeatureBridge (children-only · Availability assertion)");
  console.log("Bridge Isolation · No Map consumption · No product wire");
  console.log("Hooks API Freeze UX-5.7 intact");
  console.log("Provider Freeze UX-5.6 intact");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("validate:ux-5.7 = historical");
  console.log("No setters · No dispatch · No production mount");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
