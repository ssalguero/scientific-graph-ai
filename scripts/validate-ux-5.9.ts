/**
 * UX-5.9 — Feature Diagnostics gate
 * (structural acknowledgements only · Report Isolation · no product wire).
 *
 * Blocks:
 * priorGate · diagnosticsExists · reportContract · factoryContract
 * frozenReport · reportIsolation · noReact · noRuntimeDep · noHooks
 * noProductWire · bridgeUntouched · providerUntouched · registryUntouched
 * publicBarrelIntact · noSideEffects · tscCompile
 *
 * Architectural principles:
 * - Diagnostics = compile-time structural acknowledgements (not runtime health).
 * - Report Isolation = zero imports from src/ui/features/*.
 * - Bridge / Provider / Registry untouched (UX-5.8 / UX-5.6 / UX-5.2 freezes).
 * - validate:ux-5.9 = active series gate; validate:ux-5.8 = historical.
 * - No React · no Runtime · no hooks · no side effects · no @/ui expansion.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "diagnosticsExists"
  | "reportContract"
  | "factoryContract"
  | "frozenReport"
  | "reportIsolation"
  | "noReact"
  | "noRuntimeDep"
  | "noHooks"
  | "noProductWire"
  | "bridgeUntouched"
  | "providerUntouched"
  | "registryUntouched"
  | "publicBarrelIntact"
  | "noSideEffects"
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
const FEATURE_DIAGNOSTICS = `${FEATURES_DIR}/FeatureDiagnostics.ts`;
const FEATURE_BRIDGE = `${FEATURES_DIR}/FeatureBridge.tsx`;
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
const DOC_5_9 = "docs/UX/UX-5.9.md";
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
    "prior.roadmap58Complete",
    /UX-5\.8\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.8 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap59Complete",
    /UX-5\.9\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.9 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext510",
    /Next\s*=\s*UX-5\.10/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.10",
  );

  assertCase(
    block,
    "prior.roadmap510Pending",
    /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.10 remains PENDING",
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

  assertCase(
    block,
    "prior.doc59",
    existsSync(join(repoRoot, DOC_5_9)),
    `${DOC_5_9} exists`,
  );

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript58",
    /"validate:ux-5\.8"\s*:/.test(pkg),
    "package.json has validate:ux-5.8 (historical)",
  );

  assertCase(
    block,
    "prior.pkgScript59",
    /"validate:ux-5\.9"\s*:/.test(pkg),
    "package.json has validate:ux-5.9 (active gate)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — diagnosticsExists                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "diagnosticsExists";

  assertCase(
    block,
    "diag.fileExists",
    existsSync(join(repoRoot, FEATURE_DIAGNOSTICS)),
    `${FEATURE_DIAGNOSTICS} exists`,
  );

  const raw = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? read(FEATURE_DIAGNOSTICS)
    : "";
  const src = stripComments(raw);

  assertCase(
    block,
    "diag.exportsReport",
    /export\s+type\s+FeatureDiagnosticsReport\s*=/.test(src),
    "FeatureDiagnosticsReport is exported",
  );

  assertCase(
    block,
    "diag.exportsFactory",
    /export\s+function\s+createFeatureDiagnosticsReport\s*\(/.test(src),
    "createFeatureDiagnosticsReport is exported",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — reportContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportContract";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureDiagnosticsReport");
  const fields = [
    ...body.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/gm),
  ].map((m) => m[1]);
  const expected = [
    "registryFrozen",
    "providerAvailable",
    "hooksAvailable",
    "bridgeAvailable",
  ];

  assertCase(
    block,
    "report.readonlyType",
    /export\s+type\s+FeatureDiagnosticsReport\s*=\s*Readonly\s*<\s*\{/.test(
      src,
    ),
    "FeatureDiagnosticsReport is Readonly<{...}>",
  );

  assertCase(
    block,
    "report.exactFields",
    fields.length === expected.length &&
      expected.every((f) => fields.includes(f)),
    fields.length === expected.length &&
      expected.every((f) => fields.includes(f))
      ? "FeatureDiagnosticsReport has exactly the four diagnostic fields"
      : `Unexpected fields: [${fields.join(", ")}]`,
  );

  assertCase(
    block,
    "report.booleanFields",
    /registryFrozen\s*:\s*boolean/.test(body) &&
      /providerAvailable\s*:\s*boolean/.test(body) &&
      /hooksAvailable\s*:\s*boolean/.test(body) &&
      /bridgeAvailable\s*:\s*boolean/.test(body),
    "All four fields are boolean",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — factoryContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "factoryContract";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";

  assertCase(
    block,
    "factory.noParams",
    /export\s+function\s+createFeatureDiagnosticsReport\s*\(\s*\)\s*:/.test(
      src,
    ) ||
      /export\s+function\s+createFeatureDiagnosticsReport\s*\(\s*\)\s*\{/.test(
        src,
      ),
    "createFeatureDiagnosticsReport() takes no parameters",
  );

  assertCase(
    block,
    "factory.returnType",
    /export\s+function\s+createFeatureDiagnosticsReport\s*\(\s*\)\s*:\s*FeatureDiagnosticsReport/.test(
      src,
    ),
    "Factory return type is FeatureDiagnosticsReport",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — frozenReport                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenReport";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";
  const body = extractFunctionBody(src, "createFeatureDiagnosticsReport");

  assertCase(
    block,
    "freeze.objectFreeze",
    /return\s+Object\.freeze\s*\(/.test(body),
    "Factory returns Object.freeze(...)",
  );

  assertCase(
    block,
    "freeze.allTrue",
    /registryFrozen\s*:\s*true/.test(body) &&
      /providerAvailable\s*:\s*true/.test(body) &&
      /hooksAvailable\s*:\s*true/.test(body) &&
      /bridgeAvailable\s*:\s*true/.test(body),
    "Frozen report sets all four acknowledgements to true",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — reportIsolation                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "reportIsolation";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";

  const anyImport = /^\s*import\b/m.test(src);
  const fromFeatures =
    /from\s+["']\.\/[^"']+["']/.test(src) ||
    /from\s+["'][^"']*ui\/features/.test(src) ||
    /from\s+["']@\/ui\/features/.test(src);

  assertCase(
    block,
    "iso.noImports",
    !anyImport,
    anyImport
      ? "FeatureDiagnostics.ts must have zero import statements"
      : "FeatureDiagnostics.ts has zero imports",
  );

  assertCase(
    block,
    "iso.noFeaturesModules",
    !fromFeatures &&
      !/\bFeatureRegistry\b/.test(src) &&
      !/\bFeatureDefinition\b/.test(src) &&
      !/\bFeatureState\b/.test(src) &&
      !/\bFeatureContext\b/.test(src) &&
      !/\bFeatureProvider\b/.test(src) &&
      !/\bFeatureHooks\b/.test(src) &&
      !/\bFeatureBridge\b/.test(src) &&
      !/\bFeatureTypes\b/.test(src),
    "FeatureDiagnostics does not reference or import features/* modules",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — noReact                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const raw = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? read(FEATURE_DIAGNOSTICS)
    : "";
  const src = stripComments(raw);

  assertCase(
    block,
    "react.noUseClient",
    !/["']use client["']/.test(raw),
    'FeatureDiagnostics does not declare "use client"',
  );

  assertCase(
    block,
    "react.noReactImport",
    !/from\s+["']react["']/.test(src) &&
      !/from\s+["']react\//.test(src) &&
      !/\bReact\b/.test(src) &&
      !/\bReactNode\b/.test(src) &&
      !/\bjsx\b/i.test(src),
    "FeatureDiagnostics has no React imports or references",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — noRuntimeDep                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noRuntimeDep";
  const diagSrc = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";

  assertCase(
    block,
    "noRuntime.diagnostics",
    !/theme\/runtime/.test(diagSrc) &&
      !/from\s+["'][^"']*ui\/theme\/runtime/.test(diagSrc) &&
      !/\bRuntime\b/.test(diagSrc),
    "FeatureDiagnostics does not import Runtime",
  );

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
    "noRuntime.featuresWalk",
    featureFiles.length > 0 && !runtimeDep,
    "src/ui/features/** does not import theme/runtime",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — noHooks                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noHooks";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";

  assertCase(
    block,
    "hooks.noUseFeature",
    !/\buseFeature\b/.test(src) &&
      !/\buseFeatures\b/.test(src) &&
      !/\buseFeatureState\b/.test(src),
    "FeatureDiagnostics does not use useFeature*",
  );

  assertCase(
    block,
    "hooks.noUseContext",
    !/\buseContext\b/.test(src) && !/\bFeatureContext\b/.test(src),
    "FeatureDiagnostics does not use useContext / FeatureContext",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — noProductWire                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noProductWire";
  const diagSrc = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";

  assertCase(
    block,
    "wire.diagNoChrome",
    !/\bToolbar\b/.test(diagSrc) &&
      !/\bSidebar\b/.test(diagSrc) &&
      !/\bInspector\b/.test(diagSrc) &&
      !/\bPanels?\b/.test(diagSrc) &&
      !/\bMenus?\b/.test(diagSrc) &&
      !/\bAppShell\b/.test(diagSrc),
    "FeatureDiagnostics has no chrome / AppShell references",
  );

  const srcRoot = join(repoRoot, "src");
  const allSrc = walkFiles(srcRoot);
  const featuresAbs = join(repoRoot, FEATURES_DIR);
  const offenders: string[] = [];

  for (const full of allSrc) {
    if (full.startsWith(featuresAbs)) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']@\/ui\/features/.test(src) ||
      /from\s+["'][^"']*ui\/features/.test(src) ||
      /\bFeatureProvider\b/.test(src) ||
      /\bFeatureContext\b/.test(src) ||
      /\bFeatureBridge\b/.test(src) ||
      /\bFeatureDiagnostics\b/.test(src) ||
      /\bcreateFeatureDiagnosticsReport\b/.test(src) ||
      /\buseFeature\b/.test(src) ||
      /\buseFeatures\b/.test(src) ||
      /\buseFeatureState\b/.test(src)
    ) {
      offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
  }

  assertCase(
    block,
    "wire.noExternalConsumers",
    offenders.length === 0,
    offenders.length === 0
      ? "No consumers of features / Provider / Context / Hooks / Bridge / Diagnostics outside features/"
      : `External consumers: ${offenders.slice(0, 5).join(", ")}`,
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

  const shellCandidates = ["src/components/app-shell", "src/app"];
  let shellWire = false;
  for (const rel of shellCandidates) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    for (const full of walkFiles(abs)) {
      const src = stripComments(readFileSync(full, "utf8"));
      if (
        /\bFeatureBridge\b/.test(src) ||
        /\bFeatureProvider\b/.test(src) ||
        /\bFeatureDiagnostics\b/.test(src) ||
        /\bcreateFeatureDiagnosticsReport\b/.test(src)
      ) {
        shellWire = true;
        break;
      }
    }
  }
  assertCase(
    block,
    "wire.noAppShellOrLayout",
    !shellWire,
    "AppShell / app Layout / pages do not mount Bridge / Provider / Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — bridgeUntouched                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "bridgeUntouched";
  const raw = existsSync(join(repoRoot, FEATURE_BRIDGE))
    ? read(FEATURE_BRIDGE)
    : "";
  const src = stripComments(raw);
  const body = extractFunctionBody(src, "FeatureBridge");

  assertCase(
    block,
    "bridge.fileExists",
    existsSync(join(repoRoot, FEATURE_BRIDGE)),
    `${FEATURE_BRIDGE} exists`,
  );

  assertCase(
    block,
    "bridge.useClient",
    /["']use client["']/.test(raw),
    'FeatureBridge still declares "use client"',
  );

  assertCase(
    block,
    "bridge.childrenOnly",
    /export\s+type\s+FeatureBridgeProps\s*=\s*Readonly\s*<\s*\{\s*children\s*:\s*ReactNode\s*;?\s*\}\s*>/.test(
      src,
    ),
    "FeatureBridgeProps remains children-only",
  );

  assertCase(
    block,
    "bridge.availabilityAssertion",
    /useFeatures\s*\(\s*\)\s*;/.test(body),
    "FeatureBridge still calls bare useFeatures()",
  );

  assertCase(
    block,
    "bridge.passThrough",
    /return\s*<>\s*\{?\s*children\s*\}?\s*<\/>/.test(
      body.replace(/\s+/g, " ").trim(),
    ) ||
      /return\s*\(\s*<>\s*\{?\s*children\s*\}?\s*<\/>\s*\)/.test(
        body.replace(/\s+/g, " ").trim(),
      ) ||
      /return\s+<>\s*\{\s*children\s*\}\s*<\/>/.test(body),
    "FeatureBridge still returns <>{children}</>",
  );

  assertCase(
    block,
    "bridge.noDiagnostics",
    !/\bFeatureDiagnostics\b/.test(src) &&
      !/\bcreateFeatureDiagnosticsReport\b/.test(src),
    "FeatureBridge does not reference Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 12 — providerUntouched                                                */
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
    "provider.noDiagnostics",
    !/\bFeatureDiagnostics\b/.test(src) &&
      !/\bcreateFeatureDiagnosticsReport\b/.test(src),
    "FeatureProvider does not reference Diagnostics",
  );

  assertCase(
    block,
    "provider.noCreateFeatureState",
    !/\bcreateFeatureState\b/.test(src),
    "FeatureProvider does not call createFeatureState",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 13 — registryUntouched                                                */
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
    "reg.noHooksOrBridgeOrDiagnostics",
    !/\buseFeature\b/.test(src) &&
      !/\bFeatureContext\b/.test(src) &&
      !/\bFeatureProvider\b/.test(src) &&
      !/\bFeatureBridge\b/.test(src) &&
      !/\bFeatureDiagnostics\b/.test(src) &&
      !/\bcreateFeatureDiagnosticsReport\b/.test(src),
    "Registry does not reference Hooks / Context / Provider / Bridge / Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — publicBarrelIntact                                               */
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
      !/\bFeatureDiagnostics\b/.test(uiSrc) &&
      !/\bcreateFeatureDiagnosticsReport\b/.test(uiSrc) &&
      !/\buseFeature\b/.test(uiSrc) &&
      !/\buseFeatures\b/.test(uiSrc) &&
      !/\buseFeatureState\b/.test(uiSrc) &&
      !/\basFeatureId\b/.test(uiSrc) &&
      !/\bcreateFeatureDefinition\b/.test(uiSrc) &&
      !/\bcreateFeatureState\b/.test(uiSrc),
    "src/ui/index.ts does not re-export features / Provider / Context / Hooks / Bridge / Diagnostics",
  );

  assertCase(
    block,
    "barrel.featuresIndexIntact",
    !/\bFeatureProvider\b/.test(featuresIndexSrc) &&
      !/\bFeatureContext\b/.test(featuresIndexSrc) &&
      !/\bFeatureBridge\b/.test(featuresIndexSrc) &&
      !/\bFeatureDiagnostics\b/.test(featuresIndexSrc) &&
      !/\bcreateFeatureDiagnosticsReport\b/.test(featuresIndexSrc) &&
      !/\bFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureStatus\b/.test(featuresIndexSrc) &&
      !/\bcreateFeatureState\b/.test(featuresIndexSrc) &&
      !/\buseFeature\b/.test(featuresIndexSrc) &&
      !/\buseFeatures\b/.test(featuresIndexSrc) &&
      !/\buseFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureHooks\b/.test(featuresIndexSrc),
    "features/index.ts does not re-export Provider / Context / State / Hooks / Bridge / Diagnostics",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 15 — noSideEffects                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noSideEffects";
  const src = existsSync(join(repoRoot, FEATURE_DIAGNOSTICS))
    ? stripComments(read(FEATURE_DIAGNOSTICS))
    : "";

  assertCase(
    block,
    "fx.noConsole",
    !/\bconsole\b/.test(src),
    "FeatureDiagnostics has no console usage",
  );

  assertCase(
    block,
    "fx.noLogging",
    !/\blog(?:ger|ging)?\b/i.test(src) &&
      !/\btelemetry\b/i.test(src) &&
      !/\banalytics\b/i.test(src) &&
      !/\bobserver/i.test(src),
    "FeatureDiagnostics has no logging / telemetry / analytics / observers",
  );

  assertCase(
    block,
    "fx.noMutations",
    !/\.set\s*\(/.test(src) &&
      !/\.push\s*\(/.test(src) &&
      !/\.delete\s*\(/.test(src) &&
      !/\bassign\s*\(/.test(src) &&
      !/\bdispatch\b/.test(src),
    "FeatureDiagnostics has no mutations",
  );

  const body = extractFunctionBody(src, "createFeatureDiagnosticsReport");
  const cleaned = body
    .replace(
      /return\s+Object\.freeze\s*\(\s*\{[\s\S]*?\}\s*\)\s*;?/,
      "",
    )
    .replace(/\s+/g, "")
    .trim();

  assertCase(
    block,
    "fx.factoryOnlyFreeze",
    cleaned.length === 0,
    "Factory body is only return Object.freeze(...)",
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
/* Summary                                                                    */
/* -------------------------------------------------------------------------- */

const BLOCKS: Array<{ id: BlockId; pass: number; ca: string }> = [
  { id: "priorGate", pass: 1, ca: "CA-UX-5.9.12 / CA-UX-5.9.13" },
  { id: "diagnosticsExists", pass: 2, ca: "CA-UX-5.9.2" },
  { id: "reportContract", pass: 3, ca: "CA-UX-5.9.3" },
  { id: "factoryContract", pass: 4, ca: "CA-UX-5.9.4" },
  { id: "frozenReport", pass: 5, ca: "CA-UX-5.9.5" },
  { id: "reportIsolation", pass: 6, ca: "CA-UX-5.9.6" },
  { id: "noReact", pass: 7, ca: "CA-UX-5.9.7" },
  { id: "noRuntimeDep", pass: 8, ca: "CA-UX-5.9.7" },
  { id: "noHooks", pass: 9, ca: "CA-UX-5.9.7" },
  { id: "noProductWire", pass: 10, ca: "CA-UX-5.9.10" },
  { id: "bridgeUntouched", pass: 11, ca: "CA-UX-5.9.9" },
  { id: "providerUntouched", pass: 12, ca: "CA-UX-5.9.9" },
  { id: "registryUntouched", pass: 13, ca: "CA-UX-5.9.9" },
  { id: "publicBarrelIntact", pass: 14, ca: "CA-UX-5.9.10" },
  { id: "noSideEffects", pass: 15, ca: "CA-UX-5.9.8" },
  { id: "tscCompile", pass: 16, ca: "CA-UX-5.9.11" },
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
console.log("validate:ux-5.9");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Diagnostics");
  console.log("Structural acknowledgements only · Report Isolation");
  console.log("Immutable Object.freeze report · No React · No Runtime");
  console.log("Bridge Freeze UX-5.8 intact");
  console.log("Provider Freeze UX-5.6 intact");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("validate:ux-5.8 = historical");
  console.log("No side effects · No product wire · No barrel expansion");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
