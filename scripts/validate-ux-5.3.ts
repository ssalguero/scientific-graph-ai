/**
 * UX-5.3 — Feature Metadata gate.
 *
 * Blocks:
 * priorGate · metadataContract · readonlyMetadata · frozenCollections
 * registryUntouched · noMetadataLogic · noReact · noRuntimeDep
 * noProductWire · publicBarrelIntact · tscCompile
 *
 * Architectural principles:
 * - Registry = único SSOT de features.
 * - Metadata completely immutable (copy-before-freeze).
 * - Registry API Freeze UX-5.2 unchanged.
 * - No React · no Context · no hooks · no product wiring.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "metadataContract"
  | "readonlyMetadata"
  | "frozenCollections"
  | "registryUntouched"
  | "noMetadataLogic"
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

const FEATURES_DIR = "src/ui/features";
const FEATURE_DEFINITION = `${FEATURES_DIR}/FeatureDefinition.ts`;
const FEATURE_REGISTRY = `${FEATURES_DIR}/FeatureRegistry.ts`;
const FEATURES_INDEX = `${FEATURES_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_5 = "docs/UX/UX-5.0-roadmap.md";
const DOC_5_1 = "docs/UX/UX-5.1.md";
const DOC_5_2 = "docs/UX/UX-5.2.md";
const DOC_5_3 = "docs/UX/UX-5.3.md";
const UX_4_10 = "docs/UX/UX-4.10.md";

const META_FIELDS = [
  "id",
  "category",
  "icon",
  "title",
  "description",
  "tags",
  "keywords",
  "experimental",
  "hidden",
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
    "prior.roadmap52Complete",
    /UX-5\.2\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.2 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap53Complete",
    /UX-5\.3\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.3 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext54",
    /Next\s*=\s*UX-5\.4/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.4",
  );

  assertCase(
    block,
    "prior.roadmap54to510Pending",
    /UX-5\.4\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.4–UX-5.10 remain PENDING",
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

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript52",
    /"validate:ux-5\.2"\s*:/.test(pkg),
    "package.json has validate:ux-5.2",
  );

  assertCase(
    block,
    "prior.pkgScript53",
    /"validate:ux-5\.3"\s*:/.test(pkg),
    "package.json has validate:ux-5.3",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — metadataContract                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "metadataContract";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";

  assertCase(
    block,
    "meta.typeExported",
    /export\s+type\s+FeatureDefinition\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureDefinition is Readonly object type",
  );

  for (const field of META_FIELDS) {
    assertCase(
      block,
      `meta.field.${field}`,
      new RegExp(`\\b${field}\\b`).test(src),
      `FeatureDefinition includes ${field}`,
    );
  }

  assertCase(
    block,
    "meta.exactFields",
    /readonly\s+id\s*:\s*FeatureId/.test(src) &&
      /readonly\s+category\s*:\s*FeatureCategory/.test(src) &&
      /readonly\s+icon\s*:\s*string/.test(src) &&
      /readonly\s+title\s*:\s*string/.test(src) &&
      /readonly\s+description\s*:\s*string/.test(src) &&
      /readonly\s+tags\s*:\s*readonly\s+string\s*\[\]/.test(src) &&
      /readonly\s+keywords\s*:\s*readonly\s+string\s*\[\]/.test(src) &&
      /readonly\s+experimental\s*:\s*boolean/.test(src) &&
      /readonly\s+hidden\s*:\s*boolean/.test(src),
    "FeatureDefinition has exact approved metadata field types",
  );

  assertCase(
    block,
    "meta.noExtraVisibilityState",
    !/\bvisible\b/.test(src) &&
      !/\bbeta\b/.test(src) &&
      !/\binternal\b/.test(src) &&
      !/\benabled\b/.test(src) &&
      !/\bdisabled\b/.test(src) &&
      !/\bstate\b/.test(src),
    "FeatureDefinition has no visibility/state fields beyond metadata",
  );

  assertCase(
    block,
    "meta.initType",
    /export\s+type\s+FeatureDefinitionInit\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureDefinitionInit exported",
  );

  assertCase(
    block,
    "meta.createHelper",
    /export\s+function\s+createFeatureDefinition\s*\(\s*init\s*:\s*FeatureDefinitionInit\s*,?\s*\)\s*:\s*FeatureDefinition/.test(
      src,
    ),
    "createFeatureDefinition(init: FeatureDefinitionInit): FeatureDefinition",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — readonlyMetadata                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "readonlyMetadata";
  const src = existsSync(join(repoRoot, FEATURE_DEFINITION))
    ? stripComments(read(FEATURE_DEFINITION))
    : "";

  assertCase(
    block,
    "ro.definitionReadonly",
    /export\s+type\s+FeatureDefinition\s*=\s*Readonly\s*</.test(src),
    "FeatureDefinition wrapped in Readonly<>",
  );

  assertCase(
    block,
    "ro.fieldsReadonly",
    (src.match(/readonly\s+\w+\s*:/g) || []).length >= 9,
    "FeatureDefinition fields use readonly",
  );

  assertCase(
    block,
    "ro.tagsReadonlyArray",
    /readonly\s+tags\s*:\s*readonly\s+string\s*\[\]/.test(src),
    "tags is readonly string[]",
  );

  assertCase(
    block,
    "ro.keywordsReadonlyArray",
    /readonly\s+keywords\s*:\s*readonly\s+string\s*\[\]/.test(src),
    "keywords is readonly string[]",
  );

  assertCase(
    block,
    "ro.initReadonly",
    /export\s+type\s+FeatureDefinitionInit\s*=\s*Readonly\s*</.test(src),
    "FeatureDefinitionInit wrapped in Readonly<>",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — frozenCollections                                                */
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
      return tagsIdx >= 0 && kwIdx >= 0 && defIdx >= 0 && tagsIdx < defIdx && kwIdx < defIdx;
    })(),
    "tags and keywords are frozen before the definition",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — registryUntouched                                                */
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
/* PASS 06 — noMetadataLogic                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "noMetadataLogic";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "logic.noTagFilter",
    !/\.tags\b/.test(src) && !/\btags\s*[.=(]/.test(src),
    "Registry does not reference tags",
  );

  assertCase(
    block,
    "logic.noKeywordFilter",
    !/\.keywords\b/.test(src) && !/\bkeywords\s*[.=(]/.test(src),
    "Registry does not reference keywords",
  );

  assertCase(
    block,
    "logic.noExperimentalFilter",
    !/\.experimental\b/.test(src) && !/\bexperimental\b/.test(src),
    "Registry does not reference experimental",
  );

  assertCase(
    block,
    "logic.noHiddenFilter",
    !/\.hidden\b/.test(src) && !/\bhidden\b/.test(src),
    "Registry does not reference hidden",
  );

  assertCase(
    block,
    "logic.noIconTitleDesc",
    !/\.icon\b/.test(src) &&
      !/\.title\b/.test(src) &&
      !/\.description\b/.test(src) &&
      !/\bicon\b/.test(src) &&
      !/\btitle\b/.test(src) &&
      !/\bdescription\b/.test(src),
    "Registry does not reference icon/title/description",
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
      !/\bFeatureDefinitionInit\b/.test(indexSrc),
    "features/index.ts does not re-export createFeatureDefinition / Init",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — noReact                                                          */
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
/* PASS 08 — noRuntimeDep                                                     */
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
/* PASS 09 — noProductWire                                                    */
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
/* PASS 10 — publicBarrelIntact                                               */
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
      !/\basFeatureId\b/.test(src) &&
      !/\bcreateFeatureDefinition\b/.test(src),
    "src/ui/index.ts does not re-export features",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 11 — tscCompile                                                       */
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
  { id: "priorGate", pass: 1, ca: "CA-UX-5.3.9 / CA-UX-5.3.10" },
  { id: "metadataContract", pass: 2, ca: "CA-UX-5.3.2" },
  { id: "readonlyMetadata", pass: 3, ca: "CA-UX-5.3.2" },
  { id: "frozenCollections", pass: 4, ca: "CA-UX-5.3.3" },
  { id: "registryUntouched", pass: 5, ca: "CA-UX-5.3.4" },
  { id: "noMetadataLogic", pass: 6, ca: "CA-UX-5.3.5" },
  { id: "noReact", pass: 7, ca: "CA-UX-5.3.6" },
  { id: "noRuntimeDep", pass: 8, ca: "CA-UX-5.3.6" },
  { id: "noProductWire", pass: 9, ca: "CA-UX-5.3.6" },
  { id: "publicBarrelIntact", pass: 10, ca: "CA-UX-5.3.7" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-5.3.8" },
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
console.log("validate:ux-5.3");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Metadata");
  console.log("FeatureDefinition = immutable descriptive metadata");
  console.log("createFeatureDefinition = copy-before-freeze");
  console.log("Registry API Freeze UX-5.2 intact");
  console.log("No React · No product wiring");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
