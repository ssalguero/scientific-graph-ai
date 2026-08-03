/**
 * UX-5.5 — Feature State gate (runtime state contract · snapshot only).
 *
 * Blocks:
 * priorGate · stateContract · initContract · helperContract
 * frozenState · stateIsolation · definitionUntouched · registryUntouched
 * noRuntimeLogic · noReact · noRuntimeDep · noProductWire
 * publicBarrelIntact · tscCompile
 *
 * Architectural principles:
 * - FeatureState = immutable snapshot of conceptually mutable status.
 * - Runtime State separated from FeatureDefinition.
 * - Registry API Freeze UX-5.2 unchanged (enabled() → getAll()).
 * - FeatureDefinition API Freeze v2 unchanged.
 * - validate:ux-5.5 = active series gate; validate:ux-5.4 = historical.
 * - No Store · no Provider · no React · no product wiring.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "stateContract"
  | "initContract"
  | "helperContract"
  | "frozenState"
  | "stateIsolation"
  | "definitionUntouched"
  | "registryUntouched"
  | "noRuntimeLogic"
  | "noReact"
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
const UX_4_10 = "docs/UX/UX-4.10.md";

const STATUS_VALUES = ["enabled", "disabled", "loading", "error"] as const;

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
    "prior.roadmap54Complete",
    /UX-5\.4\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.4 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap55Complete",
    /UX-5\.5\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.5 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext56",
    /Next\s*=\s*UX-5\.6/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.6",
  );

  assertCase(
    block,
    "prior.roadmap56to510Pending",
    /UX-5\.6\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.7\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.8\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.9\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.6–UX-5.10 remain PENDING",
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

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript54",
    /"validate:ux-5\.4"\s*:/.test(pkg),
    "package.json has validate:ux-5.4 (historical)",
  );

  assertCase(
    block,
    "prior.pkgScript55",
    /"validate:ux-5\.5"\s*:/.test(pkg),
    "package.json has validate:ux-5.5 (active gate)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — stateContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "stateContract";
  const src = existsSync(join(repoRoot, FEATURE_STATE))
    ? stripComments(read(FEATURE_STATE))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureState");

  assertCase(
    block,
    "state.typeExported",
    /export\s+type\s+FeatureStatus\s*=/.test(src),
    "FeatureStatus type exported",
  );

  for (const value of STATUS_VALUES) {
    assertCase(
      block,
      `state.value.${value}`,
      new RegExp(`["']${value}["']`).test(src),
      `FeatureStatus includes "${value}"`,
    );
  }

  assertCase(
    block,
    "state.exactFourLiterals",
    (() => {
      const m = /export\s+type\s+FeatureStatus\s*=([\s\S]*?);/.exec(src);
      if (!m) return false;
      const statusBody = m[1];
      const literals = [...statusBody.matchAll(/["']([a-z]+)["']/g)].map(
        (x) => x[1],
      );
      return (
        literals.length === 4 &&
        STATUS_VALUES.every((v) => literals.includes(v))
      );
    })(),
    "FeatureStatus has exactly four allowed values",
  );

  assertCase(
    block,
    "state.featureStateExported",
    /export\s+type\s+FeatureState\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureState is Readonly object type",
  );

  assertCase(
    block,
    "state.idField",
    /readonly\s+id\s*:\s*FeatureId/.test(body),
    "FeatureState has readonly id: FeatureId",
  );

  assertCase(
    block,
    "state.statusField",
    /readonly\s+status\s*:\s*FeatureStatus/.test(body),
    "FeatureState has readonly status: FeatureStatus",
  );

  assertCase(
    block,
    "state.onlyIdAndStatus",
    (() => {
      const fields = [...body.matchAll(/(?:readonly\s+)?(\w+)\s*:/g)].map(
        (x) => x[1],
      );
      return (
        fields.length === 2 &&
        fields.includes("id") &&
        fields.includes("status")
      );
    })(),
    "FeatureState contains only id + status",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — initContract                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "initContract";
  const src = existsSync(join(repoRoot, FEATURE_STATE))
    ? stripComments(read(FEATURE_STATE))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureStateInit");

  assertCase(
    block,
    "init.typeExported",
    /export\s+type\s+FeatureStateInit\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureStateInit exported",
  );

  assertCase(
    block,
    "init.idField",
    /\bid\s*:\s*FeatureId/.test(body),
    "FeatureStateInit has id: FeatureId",
  );

  assertCase(
    block,
    "init.statusField",
    /\bstatus\s*:\s*FeatureStatus/.test(body),
    "FeatureStateInit has status: FeatureStatus",
  );

  assertCase(
    block,
    "init.onlyIdAndStatus",
    (() => {
      const fields = [...body.matchAll(/(?:readonly\s+)?(\w+)\s*:/g)].map(
        (x) => x[1],
      );
      return (
        fields.length === 2 &&
        fields.includes("id") &&
        fields.includes("status")
      );
    })(),
    "FeatureStateInit contains only id + status",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — helperContract                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "helperContract";
  const src = existsSync(join(repoRoot, FEATURE_STATE))
    ? stripComments(read(FEATURE_STATE))
    : "";

  assertCase(
    block,
    "helper.signature",
    /export\s+function\s+createFeatureState\s*\(\s*init\s*:\s*FeatureStateInit\s*,?\s*\)\s*:\s*FeatureState/.test(
      src,
    ),
    "createFeatureState(init: FeatureStateInit): FeatureState",
  );

  assertCase(
    block,
    "helper.onlyFeatureIdImport",
    /import\s+type\s+\{\s*FeatureId\s*\}\s+from\s+["']\.\/FeatureTypes["']/.test(
      src,
    ) &&
      !/FeatureDefinition/.test(src) &&
      !/FeatureRegistry/.test(src),
    "FeatureState.ts imports only FeatureId from FeatureTypes",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — frozenState                                                      */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenState";
  const src = existsSync(join(repoRoot, FEATURE_STATE))
    ? stripComments(read(FEATURE_STATE))
    : "";

  assertCase(
    block,
    "freeze.returnsObjectFreeze",
    /return\s+Object\.freeze\s*\(\s*\{[\s\S]*?\.\.\.init[\s\S]*?\}\s*\)/.test(
      src,
    ),
    "createFeatureState returns Object.freeze({ ...init })",
  );

  assertCase(
    block,
    "freeze.noArrayCopies",
    !/\[\s*\.\.\./.test(src) && !/\.slice\s*\(/.test(src) && !/\.map\s*\(/.test(src),
    "No array copies in FeatureState.ts",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — stateIsolation                                                   */
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

  assertCase(
    block,
    "iso.defNoFeatureState",
    !/FeatureState/.test(defSrc) &&
      !/FeatureStatus/.test(defSrc) &&
      !/createFeatureState/.test(defSrc) &&
      !/from\s+["']\.\/FeatureState["']/.test(defSrc),
    "FeatureDefinition.ts does not import or reference FeatureState",
  );

  assertCase(
    block,
    "iso.regNoFeatureState",
    !/FeatureState/.test(regSrc) &&
      !/FeatureStatus/.test(regSrc) &&
      !/createFeatureState/.test(regSrc) &&
      !/from\s+["']\.\/FeatureState["']/.test(regSrc),
    "FeatureRegistry.ts does not import or reference FeatureState",
  );

  assertCase(
    block,
    "iso.stateNoDefinition",
    !/FeatureDefinition/.test(stateSrc) &&
      !/from\s+["']\.\/FeatureDefinition["']/.test(stateSrc),
    "FeatureState.ts does not import FeatureDefinition",
  );

  assertCase(
    block,
    "iso.stateNoRegistry",
    !/FeatureRegistry/.test(stateSrc) &&
      !/createFeatureRegistry/.test(stateSrc) &&
      !/from\s+["']\.\/FeatureRegistry["']/.test(stateSrc),
    "FeatureState.ts does not import FeatureRegistry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — definitionUntouched                                              */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "definitionUntouched";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureDefinition");

  assertCase(
    block,
    "def.exists",
    existsSync(join(repoRoot, FEATURE_DEFINITION)),
    `${FEATURE_DEFINITION} exists`,
  );

  assertCase(
    block,
    "def.visibilityField",
    /readonly\s+visibility\s*:\s*FeatureVisibility/.test(body),
    "FeatureDefinition retains visibility (API Freeze v2)",
  );

  assertCase(
    block,
    "def.retainedMetadata",
    /readonly\s+id\s*:\s*FeatureId/.test(body) &&
      /readonly\s+category\s*:\s*FeatureCategory/.test(body) &&
      /readonly\s+icon\s*:\s*string/.test(body) &&
      /readonly\s+title\s*:\s*string/.test(body) &&
      /readonly\s+description\s*:\s*string/.test(body) &&
      /readonly\s+tags\s*:\s*readonly\s+string\s*\[\]/.test(body) &&
      /readonly\s+keywords\s*:\s*readonly\s+string\s*\[\]/.test(body),
    "FeatureDefinition retains approved metadata fields",
  );

  assertCase(
    block,
    "def.noRuntimeStatusField",
    !/\bstatus\s*:/.test(body),
    "FeatureDefinition has no status field",
  );

  assertCase(
    block,
    "def.createHelperIntact",
    /export\s+function\s+createFeatureDefinition\s*\(\s*init\s*:\s*FeatureDefinitionInit\s*,?\s*\)\s*:\s*FeatureDefinition/.test(
      src,
    ),
    "createFeatureDefinition remains intact",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — registryUntouched                                                */
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
/* PASS 09 — noRuntimeLogic                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noRuntimeLogic";
  const regSrc = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";
  const indexSrc = existsSync(join(repoRoot, FEATURES_INDEX))
    ? stripComments(read(FEATURES_INDEX))
    : "";
  const featureFiles = walkFiles(join(repoRoot, FEATURES_DIR));
  const allFeaturesSrc = featureFiles
    .map((f) => stripComments(readFileSync(f, "utf8")))
    .join("\n");

  assertCase(
    block,
    "logic.regNoStateRefs",
    !/\bFeatureState\b/.test(regSrc) &&
      !/\bFeatureStatus\b/.test(regSrc) &&
      !/\bcreateFeatureState\b/.test(regSrc),
    "Registry does not reference FeatureState / FeatureStatus / createFeatureState",
  );

  assertCase(
    block,
    "logic.barrelNoState",
    !/\bFeatureState\b/.test(indexSrc) &&
      !/\bFeatureStatus\b/.test(indexSrc) &&
      !/\bFeatureStateInit\b/.test(indexSrc) &&
      !/\bcreateFeatureState\b/.test(indexSrc),
    "features/index.ts does not re-export FeatureState surface",
  );

  assertCase(
    block,
    "logic.noStore",
    !/\bFeatureStateRegistry\b/.test(allFeaturesSrc) &&
      !/\bFeatureStore\b/.test(allFeaturesSrc) &&
      !/\bcreateFeatureStore\b/.test(allFeaturesSrc),
    "No FeatureStateRegistry / Store under features/",
  );

  assertCase(
    block,
    "logic.noProviderContextHooks",
    !/\bFeatureProvider\b/.test(allFeaturesSrc) &&
      !/\bFeatureContext\b/.test(allFeaturesSrc) &&
      !/\buseFeature\b/.test(allFeaturesSrc) &&
      !/\buseFeatures\b/.test(allFeaturesSrc) &&
      !/\buseFeatureState\b/.test(allFeaturesSrc),
    "No Provider / Context / Hooks under features/",
  );

  assertCase(
    block,
    "logic.noSyncPersistenceObservers",
    !/\bpersist\b/i.test(allFeaturesSrc) &&
      !/\bobserver\b/i.test(allFeaturesSrc) &&
      !/\bsynchroniz/i.test(allFeaturesSrc) &&
      !/\bsubscribe\b/.test(allFeaturesSrc),
    "No sync / persistence / observers under features/",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — noReact                                                          */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noReact";
  const featureFiles = walkFiles(join(repoRoot, FEATURES_DIR));
  let reactImport = false;
  for (const full of featureFiles) {
    const src = stripComments(readFileSync(full, "utf8"));
    if (
      /from\s+["']react["']/.test(src) ||
      /from\s+["']react-dom["']/.test(src) ||
      /require\s*\(\s*["']react["']\s*\)/.test(src)
    ) {
      reactImport = true;
      break;
    }
  }

  assertCase(
    block,
    "noReact.imports",
    featureFiles.length > 0 && !reactImport,
    "src/ui/features/** has no React imports",
  );

  assertCase(
    block,
    "noReact.tsx",
    featureFiles.every((f) => !f.endsWith(".tsx")),
    "src/ui/features/** has no .tsx files",
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
      /from\s+["'][^"']*ui\/features/.test(src)
    ) {
      offenders.push(relative(repoRoot, full).replace(/\\/g, "/"));
    }
  }

  assertCase(
    block,
    "wire.noExternalConsumers",
    offenders.length === 0,
    offenders.length === 0
      ? "No consumers of ui/features outside features/"
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
  const src = existsSync(join(repoRoot, UI_INDEX))
    ? stripComments(read(UI_INDEX))
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
    !/features/.test(src) &&
      !/\bFeatureRegistry\b/.test(src) &&
      !/\bFeatureDefinition\b/.test(src) &&
      !/\bFeatureState\b/.test(src) &&
      !/\bFeatureStatus\b/.test(src) &&
      !/\bFeatureVisibility\b/.test(src) &&
      !/\basFeatureId\b/.test(src) &&
      !/\bcreateFeatureDefinition\b/.test(src) &&
      !/\bcreateFeatureState\b/.test(src),
    "src/ui/index.ts does not re-export features",
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
  { id: "priorGate", pass: 1, ca: "CA-UX-5.5.12 / CA-UX-5.5.13" },
  { id: "stateContract", pass: 2, ca: "CA-UX-5.5.2 / CA-UX-5.5.3" },
  { id: "initContract", pass: 3, ca: "CA-UX-5.5.4" },
  { id: "helperContract", pass: 4, ca: "CA-UX-5.5.5" },
  { id: "frozenState", pass: 5, ca: "CA-UX-5.5.6" },
  { id: "stateIsolation", pass: 6, ca: "CA-UX-5.5.7 / CA-UX-5.5.8" },
  { id: "definitionUntouched", pass: 7, ca: "CA-UX-5.5.7" },
  { id: "registryUntouched", pass: 8, ca: "CA-UX-5.5.8" },
  { id: "noRuntimeLogic", pass: 9, ca: "CA-UX-5.5.9" },
  { id: "noReact", pass: 10, ca: "CA-UX-5.5.10" },
  { id: "noRuntimeDep", pass: 11, ca: "CA-UX-5.5.10" },
  { id: "noProductWire", pass: 12, ca: "CA-UX-5.5.10" },
  { id: "publicBarrelIntact", pass: 13, ca: "CA-UX-5.5.10" },
  { id: "tscCompile", pass: 14, ca: "CA-UX-5.5.11" },
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
console.log("validate:ux-5.5");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature State");
  console.log("FeatureState = immutable snapshot");
  console.log("Runtime State separated from FeatureDefinition");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("FeatureDefinition API Freeze v2 intact");
  console.log("validate:ux-5.4 = historical");
  console.log("No Store · No Provider · No React");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
