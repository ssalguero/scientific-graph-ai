/**
 * UX-5.7 — Feature Hooks gate (read-only Context access · no product wire).
 *
 * Blocks:
 * priorGate · hooksExist · readonlyHooks · providerUsage · hookIsolation
 * errorContract · aliasContract · providerUntouched · contextUntouched
 * registryUntouched · noRuntimeDep · noProductWire · publicBarrelIntact
 * noMutators · tscCompile
 *
 * Architectural principles:
 * - Hooks = read-only access layer over FeatureContext.
 * - useFeatures() returns exactly context.states (Reference Stability).
 * - useFeature delegates to useFeatureState (alias freeze).
 * - Provider / Context / Registry untouched (UX-5.6 / UX-5.2 freezes).
 * - validate:ux-5.7 = active series gate; validate:ux-5.6 = historical.
 * - No setters · no dispatch · no product wiring · no @/ui expansion.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "hooksExist"
  | "readonlyHooks"
  | "providerUsage"
  | "hookIsolation"
  | "errorContract"
  | "aliasContract"
  | "providerUntouched"
  | "contextUntouched"
  | "registryUntouched"
  | "noRuntimeDep"
  | "noProductWire"
  | "publicBarrelIntact"
  | "noMutators"
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

const FEATURES_DIR = "src/ui/features";
const FEATURE_HOOKS = `${FEATURES_DIR}/FeatureHooks.ts`;
const FEATURE_PROVIDER = `${FEATURES_DIR}/FeatureProvider.tsx`;
const FEATURE_CONTEXT = `${FEATURES_DIR}/FeatureContext.tsx`;
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
const UX_4_10 = "docs/UX/UX-4.10.md";

const HOOKS_ERROR = "Feature hooks must be used inside FeatureProvider.";

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
    "prior.roadmap56Complete",
    /UX-5\.6\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.6 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap57Complete",
    /UX-5\.7\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.7 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext58",
    /Next\s*=\s*UX-5\.8/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.8",
  );

  assertCase(
    block,
    "prior.roadmap58to510Pending",
    /UX-5\.8\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.9\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.8–UX-5.10 remain PENDING",
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

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript56",
    /"validate:ux-5\.6"\s*:/.test(pkg),
    "package.json has validate:ux-5.6 (historical)",
  );

  assertCase(
    block,
    "prior.pkgScript57",
    /"validate:ux-5\.7"\s*:/.test(pkg),
    "package.json has validate:ux-5.7 (active gate)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — hooksExist                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hooksExist";

  assertCase(
    block,
    "hooks.fileExists",
    existsSync(join(repoRoot, FEATURE_HOOKS)),
    `${FEATURE_HOOKS} exists`,
  );

  const raw = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? read(FEATURE_HOOKS)
    : "";
  const src = stripComments(raw);

  assertCase(
    block,
    "hooks.useClient",
    /["']use client["']/.test(raw),
    'FeatureHooks declares "use client"',
  );

  assertCase(
    block,
    "hooks.exportsUseFeatures",
    /export\s+function\s+useFeatures\s*\(/.test(src),
    "useFeatures is exported",
  );

  assertCase(
    block,
    "hooks.exportsUseFeatureState",
    /export\s+function\s+useFeatureState\s*\(/.test(src),
    "useFeatureState is exported",
  );

  assertCase(
    block,
    "hooks.exportsUseFeature",
    /export\s+function\s+useFeature\s*\(/.test(src),
    "useFeature is exported",
  );

  assertCase(
    block,
    "hooks.signatures",
    /useFeatures\s*\(\s*\)\s*:\s*ReadonlyMap\s*<\s*FeatureId\s*,\s*FeatureState\s*>/.test(
      src,
    ) &&
      /useFeatureState\s*\(\s*id\s*:\s*FeatureId\s*,?\s*\)\s*:\s*FeatureState\s*\|\s*undefined/.test(
        src,
      ) &&
      /useFeature\s*\(\s*id\s*:\s*FeatureId\s*,?\s*\)\s*:\s*FeatureState\s*\|\s*undefined/.test(
        src,
      ),
    "Hook signatures match API Freeze UX-5.7",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — readonlyHooks                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "readonlyHooks";
  const src = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";
  const useFeaturesBody = extractFunctionBody(src, "useFeatures");

  assertCase(
    block,
    "readonly.returnsExactStates",
    /return\s+context\.states\s*;/.test(useFeaturesBody),
    "useFeatures returns exactly context.states",
  );

  assertCase(
    block,
    "readonly.noNewMap",
    !/new\s+Map\b/.test(src),
    "FeatureHooks does not construct new Map(...)",
  );

  assertCase(
    block,
    "readonly.noObjectFreeze",
    !/Object\.freeze\b/.test(src),
    "FeatureHooks does not call Object.freeze",
  );

  assertCase(
    block,
    "readonly.noCreateFeatureState",
    !/\bcreateFeatureState\b/.test(src),
    "FeatureHooks does not call createFeatureState",
  );

  assertCase(
    block,
    "readonly.noMapMutators",
    !/\.set\s*\(/.test(src) &&
      !/\.clear\s*\(/.test(src) &&
      !/\.delete\s*\(/.test(src),
    "FeatureHooks does not call Map mutators",
  );

  assertCase(
    block,
    "readonly.noStatesAssignment",
    !/context\.states\s*=/.test(src) && !/\.states\s*=/.test(src),
    "FeatureHooks does not assign to states",
  );

  assertCase(
    block,
    "readonly.noUseState",
    !/\buseState\b/.test(src) && !/\buseReducer\b/.test(src),
    "FeatureHooks does not use useState / useReducer",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — providerUsage                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerUsage";
  const src = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";
  const useFeaturesBody = extractFunctionBody(src, "useFeatures");
  const useFeatureStateBody = extractFunctionBody(src, "useFeatureState");
  const useFeatureBody = extractFunctionBody(src, "useFeature");

  assertCase(
    block,
    "usage.useFeaturesContext",
    /useContext\s*\(\s*FeatureContext\s*\)/.test(useFeaturesBody),
    "useFeatures uses useContext(FeatureContext)",
  );

  assertCase(
    block,
    "usage.useFeatureStateContext",
    /useContext\s*\(\s*FeatureContext\s*\)/.test(useFeatureStateBody),
    "useFeatureState uses useContext(FeatureContext)",
  );

  assertCase(
    block,
    "usage.useFeaturesReadsStates",
    /context\.states/.test(useFeaturesBody),
    "useFeatures reads context.states",
  );

  assertCase(
    block,
    "usage.useFeatureStateGet",
    /context\.states\.get\s*\(\s*id\s*\)/.test(useFeatureStateBody),
    "useFeatureState uses context.states.get(id)",
  );

  assertCase(
    block,
    "usage.useFeatureNoDirectContext",
    !/useContext\s*\(/.test(useFeatureBody),
    "useFeature does not read Context independently",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — hookIsolation                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "hookIsolation";
  const src = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";

  assertCase(
    block,
    "iso.useContext",
    /from\s+["']react["']/.test(src) && /\buseContext\b/.test(src),
    "FeatureHooks imports useContext from react",
  );

  assertCase(
    block,
    "iso.featureContext",
    /from\s+["']\.\/FeatureContext["']/.test(src) &&
      /\bFeatureContext\b/.test(src),
    "FeatureHooks imports FeatureContext",
  );

  assertCase(
    block,
    "iso.featureId",
    /from\s+["']\.\/FeatureTypes["']/.test(src) && /\bFeatureId\b/.test(src),
    "FeatureHooks imports FeatureId",
  );

  assertCase(
    block,
    "iso.featureState",
    /from\s+["']\.\/FeatureState["']/.test(src) && /\bFeatureState\b/.test(src),
    "FeatureHooks imports FeatureState",
  );

  assertCase(
    block,
    "iso.noRegistry",
    !/\bFeatureRegistry\b/.test(src) &&
      !/from\s+["']\.\/FeatureRegistry["']/.test(src),
    "FeatureHooks does not import FeatureRegistry",
  );

  assertCase(
    block,
    "iso.noDefinition",
    !/\bFeatureDefinition\b/.test(src) &&
      !/from\s+["']\.\/FeatureDefinition["']/.test(src),
    "FeatureHooks does not import FeatureDefinition",
  );

  assertCase(
    block,
    "iso.noProvider",
    !/from\s+["']\.\/FeatureProvider["']/.test(src) &&
      !/import\s*\{[^}]*\bFeatureProvider\b/.test(src),
    "FeatureHooks does not import FeatureProvider",
  );

  assertCase(
    block,
    "iso.noRuntime",
    !/theme\/runtime/.test(src) &&
      !/from\s+["'][^"']*ui\/theme\/runtime/.test(src),
    "FeatureHooks does not import Runtime",
  );

  assertCase(
    block,
    "iso.noChrome",
    !/from\s+["'][^"']*toolbar/.test(src) &&
      !/from\s+["'][^"']*sidebar/.test(src) &&
      !/from\s+["'][^"']*inspector/.test(src) &&
      !/from\s+["'][^"']*panels/.test(src) &&
      !/from\s+["'][^"']*menus?/.test(src),
    "FeatureHooks does not import product chrome",
  );

  // Only allowed local feature module imports: FeatureContext, FeatureTypes, FeatureState
  const localImports = [
    ...src.matchAll(/from\s+["'](\.\/[^"']+)["']/g),
  ].map((m) => m[1]);
  const allowedLocal = new Set([
    "./FeatureContext",
    "./FeatureTypes",
    "./FeatureState",
  ]);
  const badLocal = localImports.filter((p) => !allowedLocal.has(p));
  assertCase(
    block,
    "iso.onlyAllowedLocalImports",
    badLocal.length === 0,
    badLocal.length === 0
      ? "FeatureHooks local imports are only Context / Types / State"
      : `Unexpected local imports: ${badLocal.join(", ")}`,
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — errorContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "errorContract";
  const src = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";
  const useFeaturesBody = extractFunctionBody(src, "useFeatures");
  const useFeatureStateBody = extractFunctionBody(src, "useFeatureState");
  const errorRe = new RegExp(
    `throw\\s+new\\s+Error\\s*\\(\\s*["']${HOOKS_ERROR.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    )}["']\\s*\\)`,
  );

  assertCase(
    block,
    "error.useFeatures",
    /context\s*===\s*null/.test(useFeaturesBody) &&
      errorRe.test(useFeaturesBody),
    "useFeatures throws exact error when Context is null",
  );

  assertCase(
    block,
    "error.useFeatureState",
    /context\s*===\s*null/.test(useFeatureStateBody) &&
      errorRe.test(useFeatureStateBody),
    "useFeatureState throws exact error when Context is null",
  );

  assertCase(
    block,
    "error.exactMessage",
    src.includes(HOOKS_ERROR),
    `Error message is exactly "${HOOKS_ERROR}"`,
  );

  assertCase(
    block,
    "error.noSharedHelper",
    !/function\s+useFeatureContext\b/.test(src) &&
      !/function\s+requireFeatureContext\b/.test(src) &&
      !/function\s+getFeatureContext\b/.test(src),
    "No shared Context helper in FeatureHooks",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — aliasContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "aliasContract";
  const src = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";
  const useFeatureBody = extractFunctionBody(src, "useFeature");

  assertCase(
    block,
    "alias.delegates",
    /return\s+useFeatureState\s*\(\s*id\s*\)\s*;/.test(useFeatureBody),
    "useFeature returns useFeatureState(id)",
  );

  assertCase(
    block,
    "alias.noExtraLogic",
    !/\buseContext\b/.test(useFeatureBody) &&
      !/\bFeatureRegistry\b/.test(useFeatureBody) &&
      !/\.get\s*\(/.test(useFeatureBody) &&
      !/\bif\b/.test(useFeatureBody),
    "useFeature has no independent Context/Registry logic",
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
    "provider.noCreateFeatureState",
    !/\bcreateFeatureState\b/.test(src),
    "FeatureProvider does not call createFeatureState",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — contextUntouched                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contextUntouched";
  const src = existsSync(join(repoRoot, FEATURE_CONTEXT))
    ? stripComments(read(FEATURE_CONTEXT))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureContextValue");

  assertCase(
    block,
    "context.fileExists",
    existsSync(join(repoRoot, FEATURE_CONTEXT)),
    `${FEATURE_CONTEXT} exists`,
  );

  assertCase(
    block,
    "context.statesOnly",
    /\bstates\s*:\s*ReadonlyMap\s*<\s*FeatureId\s*,\s*FeatureState\s*>/.test(
      body,
    ) &&
      !/\bregistry\b/i.test(body) &&
      !/\bsetState\b/.test(body) &&
      !/\bdispatch\b/.test(body),
    "FeatureContextValue contains only states: ReadonlyMap<...>",
  );

  assertCase(
    block,
    "context.nullDefault",
    /createContext\s*<\s*FeatureContextValue\s*\|\s*null\s*>\s*\(\s*null\s*\)/.test(
      src,
    ),
    "FeatureContext = createContext<FeatureContextValue | null>(null)",
  );

  assertCase(
    block,
    "context.noHooks",
    !/\bfunction\s+useFeature/.test(src) &&
      !/\bconst\s+useFeature/.test(src) &&
      !/\buseContext\b/.test(src),
    "FeatureContext.tsx does not define hooks",
  );

  assertCase(
    block,
    "context.noMapCreation",
    !/\buseRef\b/.test(src) && !/new\s+Map\b/.test(src),
    "FeatureContext does not create maps or useRef",
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
    "reg.noHooks",
    !/\buseFeature\b/.test(src) &&
      !/\bFeatureContext\b/.test(src) &&
      !/\bFeatureProvider\b/.test(src),
    "Registry does not reference Hooks / Context / Provider",
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

  for (const full of allSrc) {
    if (full.startsWith(featuresAbs)) continue;
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']@\/ui\/features/.test(src) ||
      /from\s+["'][^"']*ui\/features/.test(src) ||
      /\bFeatureProvider\b/.test(src) ||
      /\bFeatureContext\b/.test(src) ||
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
      ? "No consumers of ui/features / Provider / Context / Hooks outside features/"
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

  assertCase(
    block,
    "wire.noProductPaths",
    !/from\s+["'][^"']*(components\/toolbar|components\/ui\/sidebar|components\/inspector|workspace\/panels)/.test(
      featuresSrc,
    ),
    "features/** has no product chrome path imports",
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
      !/\buseFeature\b/.test(uiSrc) &&
      !/\buseFeatures\b/.test(uiSrc) &&
      !/\buseFeatureState\b/.test(uiSrc) &&
      !/\basFeatureId\b/.test(uiSrc) &&
      !/\bcreateFeatureDefinition\b/.test(uiSrc) &&
      !/\bcreateFeatureState\b/.test(uiSrc),
    "src/ui/index.ts does not re-export features / Provider / Context / Hooks",
  );

  assertCase(
    block,
    "barrel.featuresIndexIntact",
    !/\bFeatureProvider\b/.test(featuresIndexSrc) &&
      !/\bFeatureContext\b/.test(featuresIndexSrc) &&
      !/\bFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureStatus\b/.test(featuresIndexSrc) &&
      !/\bcreateFeatureState\b/.test(featuresIndexSrc) &&
      !/\buseFeature\b/.test(featuresIndexSrc) &&
      !/\buseFeatures\b/.test(featuresIndexSrc) &&
      !/\buseFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureHooks\b/.test(featuresIndexSrc),
    "features/index.ts does not re-export Provider / Context / State / Hooks",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — noMutators                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noMutators";
  const featureFiles = walkFiles(join(repoRoot, FEATURES_DIR));
  const allFeaturesSrc = featureFiles
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");

  assertCase(
    block,
    "mut.noSetters",
    !/\bsetFeature\b/.test(allFeaturesSrc) &&
      !/\bsetState\b/.test(allFeaturesSrc) &&
      !/\bsetFeatures\b/.test(allFeaturesSrc),
    "No feature setters under features/",
  );

  assertCase(
    block,
    "mut.noDispatch",
    !/\bdispatch\b/.test(allFeaturesSrc),
    "No dispatch under features/",
  );

  assertCase(
    block,
    "mut.noWriteHooks",
    !/\bupdateFeature\b/.test(allFeaturesSrc) &&
      !/\benableFeature\b/.test(allFeaturesSrc) &&
      !/\bdisableFeature\b/.test(allFeaturesSrc) &&
      !/\buseFeatureRegistry\b/.test(allFeaturesSrc),
    "No write hooks / updateFeature / enable / disable / useFeatureRegistry",
  );

  const hooksSrc = existsSync(join(repoRoot, FEATURE_HOOKS))
    ? stripComments(read(FEATURE_HOOKS))
    : "";
  assertCase(
    block,
    "mut.hooksNoCreate",
    !/\bcreateFeatureState\b/.test(hooksSrc),
    "FeatureHooks does not call createFeatureState",
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
  { id: "priorGate", pass: 1, ca: "CA-UX-5.7.12 / CA-UX-5.7.13" },
  { id: "hooksExist", pass: 2, ca: "CA-UX-5.7.2 / CA-UX-5.7.3" },
  { id: "readonlyHooks", pass: 3, ca: "CA-UX-5.7.4 / CA-UX-5.7.8" },
  { id: "providerUsage", pass: 4, ca: "CA-UX-5.7.5" },
  { id: "hookIsolation", pass: 5, ca: "CA-UX-5.7.5" },
  { id: "errorContract", pass: 6, ca: "CA-UX-5.7.6" },
  { id: "aliasContract", pass: 7, ca: "CA-UX-5.7.7" },
  { id: "providerUntouched", pass: 8, ca: "CA-UX-5.7.9" },
  { id: "contextUntouched", pass: 9, ca: "CA-UX-5.7.9" },
  { id: "registryUntouched", pass: 10, ca: "CA-UX-5.7.9" },
  { id: "noRuntimeDep", pass: 11, ca: "CA-UX-5.7.10" },
  { id: "noProductWire", pass: 12, ca: "CA-UX-5.7.10" },
  { id: "publicBarrelIntact", pass: 13, ca: "CA-UX-5.7.10" },
  { id: "noMutators", pass: 14, ca: "CA-UX-5.7.4" },
  { id: "tscCompile", pass: 15, ca: "CA-UX-5.7.11" },
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
console.log("validate:ux-5.7");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Hooks");
  console.log("useFeatures / useFeatureState / useFeature (alias)");
  console.log("Reference Stability · Hook Isolation · Error Contract");
  console.log("Provider Freeze UX-5.6 intact");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("validate:ux-5.6 = historical");
  console.log("No setters · No dispatch · No product wire");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
