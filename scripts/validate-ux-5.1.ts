/**
 * UX-5.1 — Feature Registry Foundation gate.
 *
 * Blocks:
 * featuresExists · typesContract · definitionContract · registryQueryOnly
 * registryFrozen · noReact · noRuntimeDep · noProductWire
 * publicBarrelIntact · priorGate · tscCompile
 *
 * Architectural principles:
 * - Registry = único SSOT de features.
 * - Metadata completely immutable.
 * - No React · no Context · no hooks · no product wiring.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "featuresExists"
  | "typesContract"
  | "definitionContract"
  | "registryQueryOnly"
  | "registryFrozen"
  | "noReact"
  | "noRuntimeDep"
  | "noProductWire"
  | "publicBarrelIntact"
  | "priorGate"
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
const FEATURE_TYPES = `${FEATURES_DIR}/FeatureTypes.ts`;
const FEATURE_DEFINITION = `${FEATURES_DIR}/FeatureDefinition.ts`;
const FEATURE_REGISTRY = `${FEATURES_DIR}/FeatureRegistry.ts`;
const FEATURES_INDEX = `${FEATURES_DIR}/index.ts`;
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_5 = "docs/UX/UX-5.0-roadmap.md";
const DOC_5_1 = "docs/UX/UX-5.1.md";
const UX_4_10 = "docs/UX/UX-4.10.md";

const CATEGORIES = [
  "toolbar",
  "sidebar",
  "inspector",
  "panel",
  "menu",
  "workspace",
  "system",
] as const;

/* -------------------------------------------------------------------------- */
/* PASS 01 — featuresExists                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "featuresExists";

  assertCase(
    block,
    "exists.dir",
    existsSync(join(repoRoot, FEATURES_DIR)),
    "src/ui/features/ exists",
  );

  for (const [id, rel] of [
    ["exists.FeatureTypes", FEATURE_TYPES],
    ["exists.FeatureDefinition", FEATURE_DEFINITION],
    ["exists.FeatureRegistry", FEATURE_REGISTRY],
    ["exists.index", FEATURES_INDEX],
  ] as const) {
    assertCase(block, id, existsSync(join(repoRoot, rel)), `${rel} exists`);
  }
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — typesContract                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "typesContract";
  const src = existsSync(join(repoRoot, FEATURE_TYPES))
    ? stripComments(read(FEATURE_TYPES))
    : "";

  assertCase(
    block,
    "types.FeatureIdBranded",
    /export\s+type\s+FeatureId\s*=\s*string\s*&\s*\{\s*readonly\s+__brand:\s*["']FeatureId["']\s*\}/.test(
      src,
    ),
    "FeatureId is branded string",
  );

  assertCase(
    block,
    "types.asFeatureId",
    /export\s+function\s+asFeatureId\s*\(/.test(src),
    "asFeatureId() helper exported",
  );

  assertCase(
    block,
    "types.FEATURE_CATEGORIES",
    /export\s+const\s+FEATURE_CATEGORIES\s*=\s*Object\.freeze\(/.test(src),
    "FEATURE_CATEGORIES uses Object.freeze",
  );

  assertCase(
    block,
    "types.FeatureCategory",
    /export\s+type\s+FeatureCategory\s*=/.test(src),
    "FeatureCategory type exported",
  );

  let allCats = true;
  for (const cat of CATEGORIES) {
    if (!new RegExp(`${cat}:\\s*["']${cat}["']`).test(src)) {
      allCats = false;
      break;
    }
  }
  assertCase(
    block,
    "types.categoriesClosed",
    allCats,
    "FEATURE_CATEGORIES includes closed union members",
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

  assertCase(
    block,
    "def.FeatureDefinition",
    /export\s+type\s+FeatureDefinition\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureDefinition is Readonly object type",
  );

  assertCase(
    block,
    "def.hasIdAndCategory",
    /\bid\s*:\s*FeatureId\b/.test(src) && /\bcategory\s*:\s*FeatureCategory\b/.test(src),
    "FeatureDefinition has id + category",
  );

  assertCase(
    block,
    "def.noMetadata",
    !/\b(icon|title|description|tags|keywords|experimental|hidden)\b/.test(src),
    "FeatureDefinition has no metadata fields (UX-5.3)",
  );

  assertCase(
    block,
    "def.noVisibilityOrState",
    !/\b(visible|beta|internal|enabled|disabled|loading|error)\b/.test(src),
    "FeatureDefinition has no visibility/state fields",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — registryQueryOnly                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryQueryOnly";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "reg.typeExported",
    /export\s+type\s+FeatureRegistry\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureRegistry type exported before factory",
  );

  assertCase(
    block,
    "reg.getHasSize",
    /\bget\s*\(\s*id\s*:\s*FeatureId\s*\)/.test(src) &&
      /\bhas\s*\(\s*id\s*:\s*FeatureId\s*\)/.test(src) &&
      /\bsize\s*\(\s*\)/.test(src),
    "FeatureRegistry exposes get / has / size",
  );

  assertCase(
    block,
    "reg.createFactory",
    /export\s+function\s+createFeatureRegistry\s*\(/.test(src) &&
      /:\s*FeatureRegistry\s*\{/.test(src),
    "createFeatureRegistry returns FeatureRegistry",
  );

  assertCase(
    block,
    "reg.singleton",
    /export\s+const\s+featureRegistry\s*:\s*FeatureRegistry\s*=\s*createFeatureRegistry\s*\(\s*\)/.test(
      src,
    ),
    "featureRegistry empty singleton exported",
  );

  assertCase(
    block,
    "reg.noDiscovery",
    !/\bgetAll\s*\(/.test(src) &&
      !/\bbyCategory\s*\(/.test(src) &&
      !/\bfind\s*\(/.test(src) &&
      !/\benabled\s*\(/.test(src),
    "No discovery methods (deferred UX-5.2)",
  );

  assertCase(
    block,
    "reg.noIterators",
    !/\bvalues\s*\(/.test(src) &&
      !/\bentries\s*\(/.test(src) &&
      !/\bkeys\s*\(/.test(src) &&
      !/\bforEach\s*\(/.test(src) &&
      !/Symbol\.iterator/.test(src),
    "No iterators (deferred UX-5.2)",
  );

  assertCase(
    block,
    "reg.noMutators",
    !/\bregister\s*\(/.test(src) &&
      !/\bput\s*\(/.test(src) &&
      !/\b\.set\s*\(/.test(src) &&
      !/\bdelete\s*\(/.test(src) &&
      !/\bremove\s*\(/.test(src),
    "No public mutators",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — registryFrozen                                                   */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "registryFrozen";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "freeze.emptySeed",
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
    "freeze.perDefinition",
    /definitions\.map\s*\(\s*\(?\s*def\s*\)?\s*=>\s*Object\.freeze/.test(src) ||
      /Object\.freeze\s*\(\s*\{\s*\.\.\.def\s*\}\s*\)/.test(src),
    "Factory freezes each FeatureDefinition",
  );

  assertCase(
    block,
    "freeze.registryObject",
    /return\s+Object\.freeze\s*\(/.test(src),
    "createFeatureRegistry returns Object.freeze registry",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — noReact                                                          */
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
/* PASS 07 — noRuntimeDep                                                     */
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
/* PASS 08 — noProductWire                                                    */
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
    !/toolbar/i.test(featuresSrc) ||
      (!/from\s+["'][^"']*toolbar/.test(featuresSrc) &&
        !/from\s+["'][^"']*sidebar/.test(featuresSrc) &&
        !/from\s+["'][^"']*inspector/.test(featuresSrc) &&
        !/from\s+["'][^"']*panels/.test(featuresSrc) &&
        !/from\s+["'][^"']*menus?/.test(featuresSrc)),
    "features/** does not import Toolbar/Sidebar/Inspector/Panels/Menus",
  );

  // Stronger explicit import fence
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
/* PASS 09 — publicBarrelIntact                                               */
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
      !/\basFeatureId\b/.test(src),
    "src/ui/index.ts does not re-export features",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 10 — priorGate                                                        */
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
    "prior.roadmap51Complete",
    /UX-5\.1\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.1 = COMPLETE",
  );

  assertCase(
    block,
    "prior.doc51",
    existsSync(join(repoRoot, DOC_5_1)),
    `${DOC_5_1} exists`,
  );

  assertCase(
    block,
    "prior.pkgScript",
    /"validate:ux-5\.1"\s*:/.test(read("package.json")),
    "package.json has validate:ux-5.1",
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
  { id: "featuresExists", pass: 1, ca: "CA-UX-5.1.1" },
  { id: "typesContract", pass: 2, ca: "CA-UX-5.1.2" },
  { id: "definitionContract", pass: 3, ca: "CA-UX-5.1.2" },
  { id: "registryQueryOnly", pass: 4, ca: "CA-UX-5.1.3 / CA-UX-5.1.8" },
  { id: "registryFrozen", pass: 5, ca: "CA-UX-5.1.4" },
  { id: "noReact", pass: 6, ca: "CA-UX-5.1.5" },
  { id: "noRuntimeDep", pass: 7, ca: "CA-UX-5.1.5" },
  { id: "noProductWire", pass: 8, ca: "CA-UX-5.1.6" },
  { id: "publicBarrelIntact", pass: 9, ca: "CA-UX-5.1.7" },
  { id: "priorGate", pass: 10, ca: "CA-UX-5.1.10" },
  { id: "tscCompile", pass: 11, ca: "CA-UX-5.1.9" },
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
console.log("validate:ux-5.1");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Registry Foundation");
  console.log("Registry = immutable query-only SSOT");
  console.log("No React · No product wiring");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
