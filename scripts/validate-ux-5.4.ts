/**
 * UX-5.4 — Feature Visibility gate (FeatureDefinition API Freeze v2).
 *
 * Blocks:
 * priorGate · visibilityContract · definitionContract · initContract
 * helperUpdated · frozenCollections · legacyFlagsRemoved · registryUntouched
 * noVisibilityLogic · noReact · noRuntimeDep · noProductWire
 * publicBarrelIntact · tscCompile
 *
 * Architectural principles:
 * - Registry = único SSOT de features.
 * - Visibility = metadata only (no Registry filters).
 * - FeatureDefinition API Freeze v2 substitutes UX-5.3 boolean flags.
 * - Registry API Freeze UX-5.2 unchanged.
 * - validate:ux-5.4 = active series gate; validate:ux-5.3 = historical.
 * - No React · no Context · no hooks · no product wiring.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "visibilityContract"
  | "definitionContract"
  | "initContract"
  | "helperUpdated"
  | "frozenCollections"
  | "legacyFlagsRemoved"
  | "registryUntouched"
  | "noVisibilityLogic"
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
const FEATURE_DEFINITION = `${FEATURES_DIR}/FeatureDefinition.ts`;
const FEATURE_REGISTRY = `${FEATURES_DIR}/FeatureRegistry.ts`;
const FEATURES_INDEX = `${FEATURES_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_5 = "docs/UX/UX-5.0-roadmap.md";
const DOC_5_1 = "docs/UX/UX-5.1.md";
const DOC_5_2 = "docs/UX/UX-5.2.md";
const DOC_5_3 = "docs/UX/UX-5.3.md";
const DOC_5_4 = "docs/UX/UX-5.4.md";
const UX_4_10 = "docs/UX/UX-4.10.md";

const VISIBILITY_VALUES = [
  "visible",
  "hidden",
  "experimental",
  "beta",
  "internal",
] as const;

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
    "prior.roadmap53Complete",
    /UX-5\.3\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.3 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap54Complete",
    /UX-5\.4\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.4 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext55",
    /Next\s*=\s*UX-5\.5/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.5",
  );

  assertCase(
    block,
    "prior.roadmap55to510Pending",
    /UX-5\.5\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.6\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.7\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.8\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.9\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.5–UX-5.10 remain PENDING",
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

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript53",
    /"validate:ux-5\.3"\s*:/.test(pkg),
    "package.json has validate:ux-5.3 (historical)",
  );

  assertCase(
    block,
    "prior.pkgScript54",
    /"validate:ux-5\.4"\s*:/.test(pkg),
    "package.json has validate:ux-5.4 (active gate)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — visibilityContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "visibilityContract";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";

  assertCase(
    block,
    "vis.typeExported",
    /export\s+type\s+FeatureVisibility\s*=/.test(src),
    "FeatureVisibility type exported",
  );

  for (const value of VISIBILITY_VALUES) {
    assertCase(
      block,
      `vis.value.${value}`,
      new RegExp(`["']${value}["']`).test(src),
      `FeatureVisibility includes "${value}"`,
    );
  }

  assertCase(
    block,
    "vis.exactFiveLiterals",
    (() => {
      const m = /export\s+type\s+FeatureVisibility\s*=([\s\S]*?);/.exec(src);
      if (!m) return false;
      const body = m[1];
      const literals = [...body.matchAll(/["']([a-z]+)["']/g)].map((x) => x[1]);
      return (
        literals.length === 5 &&
        VISIBILITY_VALUES.every((v) => literals.includes(v))
      );
    })(),
    "FeatureVisibility has exactly five allowed values",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — definitionContract                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "definitionContract";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureDefinition");

  assertCase(
    block,
    "def.typeExported",
    /export\s+type\s+FeatureDefinition\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureDefinition is Readonly object type",
  );

  assertCase(
    block,
    "def.visibilityField",
    /readonly\s+visibility\s*:\s*FeatureVisibility/.test(body),
    "FeatureDefinition has readonly visibility: FeatureVisibility",
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
    "def.noStateFields",
    !/\benabled\b/.test(body) &&
      !/\bdisabled\b/.test(body) &&
      !/\bloading\b/.test(body) &&
      !/\berror\b/.test(body) &&
      !/\bstate\b/.test(body),
    "FeatureDefinition has no runtime state fields",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — initContract                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "initContract";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";
  const body = extractReadonlyTypeBody(src, "FeatureDefinitionInit");

  assertCase(
    block,
    "init.typeExported",
    /export\s+type\s+FeatureDefinitionInit\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureDefinitionInit exported",
  );

  assertCase(
    block,
    "init.visibilityField",
    /(?<!readonly\s)visibility\s*:\s*FeatureVisibility/.test(body) ||
      /visibility\s*:\s*FeatureVisibility/.test(body),
    "FeatureDefinitionInit has visibility: FeatureVisibility",
  );

  assertCase(
    block,
    "init.retainedFields",
    /\bid\s*:\s*FeatureId/.test(body) &&
      /\bcategory\s*:\s*FeatureCategory/.test(body) &&
      /\bicon\s*:\s*string/.test(body) &&
      /\btitle\s*:\s*string/.test(body) &&
      /\bdescription\s*:\s*string/.test(body) &&
      /\btags\s*:\s*readonly\s+string\s*\[\]/.test(body) &&
      /\bkeywords\s*:\s*readonly\s+string\s*\[\]/.test(body),
    "FeatureDefinitionInit retains approved init fields",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — helperUpdated                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "helperUpdated";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";

  assertCase(
    block,
    "helper.signature",
    /export\s+function\s+createFeatureDefinition\s*\(\s*init\s*:\s*FeatureDefinitionInit\s*,?\s*\)\s*:\s*FeatureDefinition/.test(
      src,
    ),
    "createFeatureDefinition(init: FeatureDefinitionInit): FeatureDefinition",
  );

  assertCase(
    block,
    "helper.spreadsInit",
    /Object\.freeze\s*\(\s*\{[\s\S]*?\.\.\.init[\s\S]*?\}\s*\)/.test(src),
    "createFeatureDefinition spreads init (includes visibility)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — frozenCollections                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "frozenCollections";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";

  assertCase(
    block,
    "freeze.tagsCopy",
    /Object\.freeze\s*\(\s*\[\s*\.\.\.init\.tags\s*\]\s*\)/.test(src),
    "tags = Object.freeze([...init.tags])",
  );

  assertCase(
    block,
    "freeze.keywordsCopy",
    /Object\.freeze\s*\(\s*\[\s*\.\.\.init\.keywords\s*\]\s*\)/.test(src),
    "keywords = Object.freeze([...init.keywords])",
  );

  assertCase(
    block,
    "freeze.definition",
    /return\s+Object\.freeze\s*\(\s*\{[\s\S]*?\.\.\.init[\s\S]*?tags[\s\S]*?keywords[\s\S]*?\}\s*\)/.test(
      src,
    ),
    "createFeatureDefinition returns Object.freeze({ ...init, tags, keywords })",
  );

  assertCase(
    block,
    "freeze.orderTagsBeforeDef",
    (() => {
      const tagsIdx = src.search(
        /Object\.freeze\s*\(\s*\[\s*\.\.\.init\.tags\s*\]\s*\)/,
      );
      const kwIdx = src.search(
        /Object\.freeze\s*\(\s*\[\s*\.\.\.init\.keywords\s*\]\s*\)/,
      );
      const defIdx = src.search(/return\s+Object\.freeze\s*\(/);
      return (
        tagsIdx >= 0 &&
        kwIdx >= 0 &&
        defIdx >= 0 &&
        tagsIdx < defIdx &&
        kwIdx < defIdx
      );
    })(),
    "tags and keywords are frozen before the definition",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — legacyFlagsRemoved                                               */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "legacyFlagsRemoved";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";
  const defBody = extractReadonlyTypeBody(src, "FeatureDefinition");
  const initBody = extractReadonlyTypeBody(src, "FeatureDefinitionInit");

  assertCase(
    block,
    "legacy.noExperimentalOnDefinition",
    !/\bexperimental\s*:/.test(defBody),
    "FeatureDefinition has no experimental property",
  );

  assertCase(
    block,
    "legacy.noHiddenOnDefinition",
    !/\bhidden\s*:/.test(defBody),
    "FeatureDefinition has no hidden property",
  );

  assertCase(
    block,
    "legacy.noExperimentalOnInit",
    !/\bexperimental\s*:/.test(initBody),
    "FeatureDefinitionInit has no experimental property",
  );

  assertCase(
    block,
    "legacy.noHiddenOnInit",
    !/\bhidden\s*:/.test(initBody),
    "FeatureDefinitionInit has no hidden property",
  );

  assertCase(
    block,
    "legacy.noBooleanFlags",
    !/\bexperimental\s*:\s*boolean/.test(src) &&
      !/\bhidden\s*:\s*boolean/.test(src),
    "No experimental:boolean or hidden:boolean remain in FeatureDefinition.ts",
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
/* PASS 09 — noVisibilityLogic                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noVisibilityLogic";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "logic.noVisibilityField",
    !/\.visibility\b/.test(src) && !/\bvisibility\b/.test(src),
    "Registry does not reference visibility",
  );

  assertCase(
    block,
    "logic.noByVisibility",
    !/\bbyVisibility\s*\(/.test(src),
    "Registry has no byVisibility()",
  );

  assertCase(
    block,
    "logic.noVisibleMethod",
    !/\bvisible\s*\(/.test(src),
    "Registry has no visible()",
  );

  assertCase(
    block,
    "logic.noHiddenMethod",
    !/\bhidden\s*\(/.test(src),
    "Registry has no hidden()",
  );

  assertCase(
    block,
    "logic.noExperimentalMethod",
    !/\bexperimental\s*\(/.test(src),
    "Registry has no experimental()",
  );

  assertCase(
    block,
    "logic.byCategoryOnlyCategory",
    /byCategory[\s\S]*?feature\.category\s*===\s*category/.test(src),
    "byCategory filters only by category",
  );

  const indexSrc = existsSync(join(repoRoot, FEATURES_INDEX))
    ? stripComments(read(FEATURES_INDEX))
    : "";

  assertCase(
    block,
    "logic.barrelNoHelper",
    !/\bcreateFeatureDefinition\b/.test(indexSrc) &&
      !/\bFeatureDefinitionInit\b/.test(indexSrc) &&
      !/\bFeatureVisibility\b/.test(indexSrc),
    "features/index.ts does not re-export createFeatureDefinition / Init / Visibility",
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
      !/\bFeatureVisibility\b/.test(src) &&
      !/\basFeatureId\b/.test(src) &&
      !/\bcreateFeatureDefinition\b/.test(src),
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
  { id: "priorGate", pass: 1, ca: "CA-UX-5.4.11 / CA-UX-5.4.12" },
  { id: "visibilityContract", pass: 2, ca: "CA-UX-5.4.2" },
  { id: "definitionContract", pass: 3, ca: "CA-UX-5.4.3" },
  { id: "initContract", pass: 4, ca: "CA-UX-5.4.4" },
  { id: "helperUpdated", pass: 5, ca: "CA-UX-5.4.5" },
  { id: "frozenCollections", pass: 6, ca: "CA-UX-5.4.5" },
  { id: "legacyFlagsRemoved", pass: 7, ca: "CA-UX-5.4.4 / CA-UX-5.4.13" },
  { id: "registryUntouched", pass: 8, ca: "CA-UX-5.4.6" },
  { id: "noVisibilityLogic", pass: 9, ca: "CA-UX-5.4.7" },
  { id: "noReact", pass: 10, ca: "CA-UX-5.4.8" },
  { id: "noRuntimeDep", pass: 11, ca: "CA-UX-5.4.8" },
  { id: "noProductWire", pass: 12, ca: "CA-UX-5.4.8" },
  { id: "publicBarrelIntact", pass: 13, ca: "CA-UX-5.4.9" },
  { id: "tscCompile", pass: 14, ca: "CA-UX-5.4.10" },
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
console.log("validate:ux-5.4");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Visibility");
  console.log("FeatureDefinition API Freeze v2");
  console.log("FeatureVisibility = metadata only");
  console.log("createFeatureDefinition = copy-before-freeze");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("validate:ux-5.3 = historical");
  console.log("No React · No product wiring");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
