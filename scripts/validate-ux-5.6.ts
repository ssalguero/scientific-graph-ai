/**
 * UX-5.6 — Feature Provider gate (React infrastructure · no consumers).
 *
 * Blocks:
 * priorGate · providerExists · contextExists · providerContract
 * contextContract · noMutableState · providerOwnership · stateIsolation
 * registryUntouched · noHooks · noRuntimeDep · noProductWire
 * publicBarrelIntact · tscCompile
 *
 * Architectural principles:
 * - FeatureProvider = sole owner of ReadonlyMap via useRef.
 * - FeatureContext = type + context only (null default).
 * - FeatureState remains immutable snapshot (refs only · no create/replace).
 * - Registry API Freeze UX-5.2 unchanged (enabled() → getAll()).
 * - validate:ux-5.6 = active series gate; validate:ux-5.5 = historical.
 * - No hooks · no setters · no product wiring · no @/ui expansion.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "providerExists"
  | "contextExists"
  | "providerContract"
  | "contextContract"
  | "noMutableState"
  | "providerOwnership"
  | "stateIsolation"
  | "registryUntouched"
  | "noHooks"
  | "noRuntimeDep"
  | "noProductWire"
  | "publicBarrelIntact"
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

const FEATURES_DIR = "src/ui/features";
const FEATURE_PROVIDER = `${FEATURES_DIR}/FeatureProvider.tsx`;
const FEATURE_CONTEXT = `${FEATURES_DIR}/FeatureContext.tsx`;
const FEATURE_STATE = `${FEATURES_DIR}/FeatureState.ts`;
const FEATURE_DEFINITION = `${FEATURES_DIR}/FeatureDefinition.ts`;
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
    "prior.roadmap55Complete",
    /UX-5\.5\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.5 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap56Complete",
    /UX-5\.6\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.6 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext57",
    /Next\s*=\s*UX-5\.7/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.7",
  );

  assertCase(
    block,
    "prior.roadmap57to510Pending",
    /UX-5\.7\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.8\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.9\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.7–UX-5.10 remain PENDING",
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

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript55",
    /"validate:ux-5\.5"\s*:/.test(pkg),
    "package.json has validate:ux-5.5 (historical)",
  );

  assertCase(
    block,
    "prior.pkgScript56",
    /"validate:ux-5\.6"\s*:/.test(pkg),
    "package.json has validate:ux-5.6 (active gate)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — providerExists                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerExists";

  assertCase(
    block,
    "provider.fileExists",
    existsSync(join(repoRoot, FEATURE_PROVIDER)),
    `${FEATURE_PROVIDER} exists`,
  );

  const src = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";

  assertCase(
    block,
    "provider.exportsFn",
    /export\s+function\s+FeatureProvider\s*\(/.test(src),
    "FeatureProvider function is exported",
  );

  assertCase(
    block,
    "provider.useClient",
    /["']use client["']/.test(read(FEATURE_PROVIDER)),
    'FeatureProvider declares "use client"',
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — contextExists                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contextExists";

  assertCase(
    block,
    "context.fileExists",
    existsSync(join(repoRoot, FEATURE_CONTEXT)),
    `${FEATURE_CONTEXT} exists`,
  );

  const src = existsSync(join(repoRoot, FEATURE_CONTEXT))
    ? stripComments(read(FEATURE_CONTEXT))
    : "";

  assertCase(
    block,
    "context.exportsContext",
    /export\s+const\s+FeatureContext\s*=/.test(src),
    "FeatureContext is exported",
  );

  assertCase(
    block,
    "context.useClient",
    /["']use client["']/.test(read(FEATURE_CONTEXT)),
    'FeatureContext declares "use client"',
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — providerContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerContract";
  const src = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";

  assertCase(
    block,
    "provider.useRef",
    /\buseRef\s*</.test(src) || /\buseRef\s*\(/.test(src),
    "FeatureProvider uses useRef",
  );

  assertCase(
    block,
    "provider.readonlyMap",
    /ReadonlyMap\s*<\s*FeatureId\s*,\s*FeatureState\s*>/.test(src),
    "FeatureProvider types ReadonlyMap<FeatureId, FeatureState>",
  );

  assertCase(
    block,
    "provider.emptyMap",
    /new\s+Map\s*<\s*FeatureId\s*,\s*FeatureState\s*>\s*\(\s*\)/.test(src),
    "FeatureProvider creates empty Map<FeatureId, FeatureState>",
  );

  assertCase(
    block,
    "provider.freezeValue",
    /Object\.freeze\s*\(\s*\{\s*states\s*:\s*statesRef\.current\s*,?\s*\}\s*\)/.test(
      src,
    ),
    "value = Object.freeze({ states: statesRef.current })",
  );

  assertCase(
    block,
    "provider.contextProvider",
    /FeatureContext\.Provider/.test(src),
    "FeatureProvider renders FeatureContext.Provider",
  );

  assertCase(
    block,
    "provider.childrenOnly",
    /children/.test(src) &&
      !/\bregistry\b/i.test(src) &&
      !/\binitialStates\b/.test(src),
    "FeatureProvider props are children-only (no Registry / initialStates)",
  );

  assertCase(
    block,
    "provider.noCreateFeatureState",
    !/\bcreateFeatureState\b/.test(src),
    "FeatureProvider does not call createFeatureState",
  );

  assertCase(
    block,
    "provider.noRegistryImport",
    !/from\s+["']\.\/FeatureRegistry["']/.test(src) &&
      !/\bFeatureRegistry\b/.test(src),
    "FeatureProvider does not import FeatureRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — contextContract                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "contextContract";
  const src = existsSync(join(repoRoot, FEATURE_CONTEXT))
    ? stripComments(read(FEATURE_CONTEXT))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureContextValue");

  assertCase(
    block,
    "context.valueType",
    /export\s+type\s+FeatureContextValue\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureContextValue is Readonly<{...}>",
  );

  assertCase(
    block,
    "context.statesOnly",
    /\bstates\s*:\s*ReadonlyMap\s*<\s*FeatureId\s*,\s*FeatureState\s*>/.test(
      body,
    ) &&
      !/\bregistry\b/i.test(body) &&
      !/\bsetState\b/.test(body) &&
      !/\bsetters?\b/.test(body) &&
      !/\bdispatch\b/.test(body) &&
      !/\bupdate\b/.test(body),
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
/* PASS 06 — noMutableState                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noMutableState";
  const providerSrc = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";
  const contextSrc = existsSync(join(repoRoot, FEATURE_CONTEXT))
    ? stripComments(read(FEATURE_CONTEXT))
    : "";
  const combined = `${providerSrc}\n${contextSrc}`;

  assertCase(
    block,
    "mutable.noUseState",
    !/\buseState\b/.test(combined),
    "No useState in Provider/Context",
  );

  assertCase(
    block,
    "mutable.noUseReducer",
    !/\buseReducer\b/.test(combined),
    "No useReducer in Provider/Context",
  );

  assertCase(
    block,
    "mutable.noDispatch",
    !/\bdispatch\b/.test(combined),
    "No dispatch in Provider/Context",
  );

  assertCase(
    block,
    "mutable.noSetState",
    !/\bsetState\b/.test(combined) && !/\bsetStates\b/.test(combined),
    "No setState / setStates in Provider/Context",
  );

  assertCase(
    block,
    "mutable.noMutators",
    !/\bupdateState\b/.test(combined) &&
      !/\b\.set\s*\(/.test(combined) &&
      !/\b\.delete\s*\(/.test(combined) &&
      !/\b\.clear\s*\(/.test(combined),
    "No map mutators / updateState in Provider/Context",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — providerOwnership                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "providerOwnership";
  const featureFiles = walkFiles(join(repoRoot, FEATURES_DIR));
  const mapOwners: string[] = [];

  for (const full of featureFiles) {
    const rel = relative(repoRoot, full).replace(/\\/g, "/");
    const src = stripComments(readFileSync(full, "utf8"));
    const createsMapViaRef =
      /\buseRef\s*<\s*ReadonlyMap\s*<\s*FeatureId\s*,\s*FeatureState\s*>/.test(
        src,
      ) ||
      (/\buseRef\b/.test(src) &&
        /new\s+Map\s*<\s*FeatureId\s*,\s*FeatureState\s*>/.test(src));
    if (createsMapViaRef) {
      mapOwners.push(rel);
    }
  }

  assertCase(
    block,
    "ownership.soleProvider",
    mapOwners.length === 1 &&
      mapOwners[0] === FEATURE_PROVIDER.replace(/\\/g, "/"),
    mapOwners.length === 1
      ? `Sole map owner: ${mapOwners[0]}`
      : `Map owners (expected only FeatureProvider): ${mapOwners.join(", ") || "(none)"}`,
  );

  const contextSrc = existsSync(join(repoRoot, FEATURE_CONTEXT))
    ? stripComments(read(FEATURE_CONTEXT))
    : "";

  assertCase(
    block,
    "ownership.contextNoMap",
    !/\buseRef\b/.test(contextSrc) && !/new\s+Map\b/.test(contextSrc),
    "FeatureContext only declares type + context (no map)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — stateIsolation                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "stateIsolation";
  const defSrc = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";
  const regSrc = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";
  const stateSrc = existsSync(join(repoRoot, FEATURE_STATE))
    ? stripComments(read(FEATURE_STATE))
    : "";
  const providerSrc = existsSync(join(repoRoot, FEATURE_PROVIDER))
    ? stripComments(read(FEATURE_PROVIDER))
    : "";

  assertCase(
    block,
    "iso.defNoStateProvider",
    !/\bFeatureState\b/.test(defSrc) &&
      !/\bFeatureProvider\b/.test(defSrc) &&
      !/\bFeatureContext\b/.test(defSrc) &&
      !/from\s+["']react["']/.test(defSrc),
    "FeatureDefinition ignores State / Provider / Context / React",
  );

  assertCase(
    block,
    "iso.regNoStateProvider",
    !/\bFeatureState\b/.test(regSrc) &&
      !/\bFeatureStatus\b/.test(regSrc) &&
      !/\bFeatureProvider\b/.test(regSrc) &&
      !/\bFeatureContext\b/.test(regSrc) &&
      !/from\s+["']react["']/.test(regSrc),
    "FeatureRegistry ignores State / Provider / Context / React",
  );

  assertCase(
    block,
    "iso.stateNoProvider",
    !/\bFeatureProvider\b/.test(stateSrc) &&
      !/\bFeatureContext\b/.test(stateSrc) &&
      !/from\s+["']react["']/.test(stateSrc) &&
      !/\bFeatureDefinition\b/.test(stateSrc) &&
      !/\bFeatureRegistry\b/.test(stateSrc),
    "FeatureState ignores Provider / Context / React / Definition / Registry",
  );

  assertCase(
    block,
    "iso.providerNoSnapshotCreate",
    !/\bcreateFeatureState\b/.test(providerSrc) &&
      !/\bObject\.assign\b/.test(providerSrc),
    "Provider does not create or mutate FeatureState snapshots",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — registryUntouched                                                */
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
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — noHooks                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noHooks";
  const featureFiles = walkFiles(join(repoRoot, FEATURES_DIR));
  const allFeaturesSrc = featureFiles
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");

  assertCase(
    block,
    "hooks.noUseFeature",
    !/\buseFeature\b/.test(allFeaturesSrc) &&
      !/\buseFeatures\b/.test(allFeaturesSrc) &&
      !/\buseFeatureState\b/.test(allFeaturesSrc),
    "No useFeature / useFeatures / useFeatureState under features/",
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
      /\bFeatureContext\b/.test(src)
    ) {
      offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
  }

  assertCase(
    block,
    "wire.noExternalConsumers",
    offenders.length === 0,
    offenders.length === 0
      ? "No consumers of ui/features / Provider / Context outside features/"
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
      !/\basFeatureId\b/.test(uiSrc) &&
      !/\bcreateFeatureDefinition\b/.test(uiSrc) &&
      !/\bcreateFeatureState\b/.test(uiSrc),
    "src/ui/index.ts does not re-export features / Provider / Context",
  );

  assertCase(
    block,
    "barrel.featuresIndexIntact",
    !/\bFeatureProvider\b/.test(featuresIndexSrc) &&
      !/\bFeatureContext\b/.test(featuresIndexSrc) &&
      !/\bFeatureState\b/.test(featuresIndexSrc) &&
      !/\bFeatureStatus\b/.test(featuresIndexSrc) &&
      !/\bcreateFeatureState\b/.test(featuresIndexSrc),
    "features/index.ts does not re-export Provider / Context / State",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 14 — tscCompile                                                       */
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
  { id: "priorGate", pass: 1, ca: "CA-UX-5.6.12 / CA-UX-5.6.13" },
  { id: "providerExists", pass: 2, ca: "CA-UX-5.6.3" },
  { id: "contextExists", pass: 3, ca: "CA-UX-5.6.2" },
  { id: "providerContract", pass: 4, ca: "CA-UX-5.6.5" },
  { id: "contextContract", pass: 5, ca: "CA-UX-5.6.4" },
  { id: "noMutableState", pass: 6, ca: "CA-UX-5.6.5 / CA-UX-5.6.9" },
  { id: "providerOwnership", pass: 7, ca: "CA-UX-5.6.6" },
  { id: "stateIsolation", pass: 8, ca: "CA-UX-5.6.8" },
  { id: "registryUntouched", pass: 9, ca: "CA-UX-5.6.8" },
  { id: "noHooks", pass: 10, ca: "CA-UX-5.6.9" },
  { id: "noRuntimeDep", pass: 11, ca: "CA-UX-5.6.10" },
  { id: "noProductWire", pass: 12, ca: "CA-UX-5.6.10" },
  { id: "publicBarrelIntact", pass: 13, ca: "CA-UX-5.6.10" },
  { id: "tscCompile", pass: 14, ca: "CA-UX-5.6.11" },
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
console.log("validate:ux-5.6");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Provider");
  console.log("FeatureProvider = sole ReadonlyMap owner via useRef");
  console.log("FeatureContext = null default · states only");
  console.log("Snapshot Philosophy · ReadonlyMap Contract");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("FeatureDefinition API Freeze v2 intact");
  console.log("validate:ux-5.5 = historical");
  console.log("No hooks · No setters · No product wire");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
