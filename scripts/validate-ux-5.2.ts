/**
 * UX-5.2 — Feature Discovery gate.
 *
 * Blocks:
 * priorGate · discoveryContract · getAllExists · byCategoryExists
 * findExists · enabledExists · readonlyResults · registryQueryOnly
 * registryFrozen · noReact · noRuntimeDep · noProductWire
 * publicBarrelIntact · tscCompile
 *
 * Architectural principles:
 * - Registry = único SSOT de features.
 * - Discovery query-only on frozen definitions.
 * - enabled() delegates to getAll() (API placeholder).
 * - No React · no Context · no hooks · no product wiring.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type BlockId =
  | "priorGate"
  | "discoveryContract"
  | "getAllExists"
  | "byCategoryExists"
  | "findExists"
  | "enabledExists"
  | "readonlyResults"
  | "registryQueryOnly"
  | "registryFrozen"
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
const FEATURE_REGISTRY = `${FEATURES_DIR}/FeatureRegistry.ts`;
const UI_INDEX = "src/ui/index.ts";
const ROADMAP_5 = "docs/UX/UX-5.0-roadmap.md";
const DOC_5_1 = "docs/UX/UX-5.1.md";
const DOC_5_2 = "docs/UX/UX-5.2.md";
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
    "prior.roadmap51Complete",
    /UX-5\.1\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.1 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmap52Complete",
    /UX-5\.2\s*=\s*COMPLETE/.test(roadmap),
    "UX-5.0 roadmap marks UX-5.2 = COMPLETE",
  );

  assertCase(
    block,
    "prior.roadmapNext53",
    /Next\s*=\s*UX-5\.3/.test(roadmap),
    "UX-5.0 roadmap Next = UX-5.3",
  );

  assertCase(
    block,
    "prior.roadmap53to510Pending",
    /UX-5\.3\s*=\s*PENDING/.test(roadmap) &&
      /UX-5\.10\s*=\s*PENDING/.test(roadmap),
    "UX-5.3–UX-5.10 remain PENDING",
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

  const pkg = read("package.json");
  assertCase(
    block,
    "prior.pkgScript51",
    /"validate:ux-5\.1"\s*:/.test(pkg),
    "package.json has validate:ux-5.1",
  );

  assertCase(
    block,
    "prior.pkgScript52",
    /"validate:ux-5\.2"\s*:/.test(pkg),
    "package.json has validate:ux-5.2",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 02 — discoveryContract                                                */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "discoveryContract";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "disc.typeReadonly",
    /export\s+type\s+FeatureRegistry\s*=\s*Readonly\s*<\s*\{/.test(src),
    "FeatureRegistry is Readonly object type",
  );

  assertCase(
    block,
    "disc.foundationMethods",
    /\bget\s*\(\s*id\s*:\s*FeatureId\s*\)/.test(src) &&
      /\bhas\s*\(\s*id\s*:\s*FeatureId\s*\)/.test(src) &&
      /\bsize\s*\(\s*\)/.test(src),
    "FeatureRegistry retains get / has / size",
  );

  assertCase(
    block,
    "disc.discoverySignatures",
    /getAll\s*\(\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(src) &&
      /byCategory\s*\(\s*category\s*:\s*FeatureCategory\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(
        src,
      ) &&
      /find\s*\(\s*predicate\s*:\s*\(\s*feature\s*:\s*FeatureDefinition\s*\)\s*=>\s*boolean\s*,?\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(
        src,
      ) &&
      /enabled\s*\(\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(src),
    "Discovery methods have frozen signatures",
  );

  assertCase(
    block,
    "disc.importsFeatureCategory",
    /import\s+type\s*\{[^}]*FeatureCategory[^}]*\}\s*from\s*["']\.\/FeatureTypes["']/.test(
      src,
    ),
    "FeatureRegistry imports FeatureCategory",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 03 — getAllExists                                                     */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "getAllExists";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "getAll.onType",
    /getAll\s*\(\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(src),
    "getAll() declared on FeatureRegistry type",
  );

  assertCase(
    block,
    "getAll.snapshotOnce",
    /const\s+allDefinitions\s*:\s*readonly\s+FeatureDefinition\s*\[\s*\]\s*=\s*Object\.freeze\s*\(/.test(
      src,
    ),
    "allDefinitions once-built with Object.freeze",
  );

  assertCase(
    block,
    "getAll.returnsSnapshot",
    /getAll\s*\(\s*\)\s*(?::\s*readonly\s+FeatureDefinition\s*\[\s*\])?\s*\{\s*return\s+allDefinitions\s*;/.test(
      src,
    ),
    "getAll() returns allDefinitions (no per-call rebuild)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 04 — byCategoryExists                                                 */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "byCategoryExists";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "byCategory.onType",
    /byCategory\s*\(\s*category\s*:\s*FeatureCategory\s*\)/.test(src),
    "byCategory(category: FeatureCategory) declared",
  );

  assertCase(
    block,
    "byCategory.filtersAllDefinitions",
    /byCategory[\s\S]*?allDefinitions\.filter/.test(src),
    "byCategory filters over allDefinitions",
  );

  assertCase(
    block,
    "byCategory.freezesResult",
    /byCategory[\s\S]*?Object\.freeze\s*\(\s*allDefinitions\.filter/.test(src),
    "byCategory returns Object.freeze(filtered)",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 05 — findExists                                                       */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "findExists";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "find.predicateOnly",
    /find\s*\(\s*predicate\s*:\s*\(\s*feature\s*:\s*FeatureDefinition\s*\)\s*=>\s*boolean\s*,?\s*\)/.test(
      src,
    ),
    "find accepts predicate only",
  );

  assertCase(
    block,
    "find.noStringOverload",
    !/find\s*\(\s*(id|query|name|text)\s*:/.test(src),
    "find has no string/ID overloads",
  );

  assertCase(
    block,
    "find.filtersAllDefinitions",
    /find[\s\S]*?allDefinitions\.filter\s*\(\s*predicate\s*\)/.test(src),
    "find filters allDefinitions with predicate",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 06 — enabledExists                                                    */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "enabledExists";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "enabled.onType",
    /enabled\s*\(\s*\)\s*:\s*readonly\s+FeatureDefinition\s*\[\]/.test(src),
    "enabled() declared on FeatureRegistry type",
  );

  assertCase(
    block,
    "enabled.delegatesGetAll",
    /enabled\s*\(\s*\)\s*(?::\s*readonly\s+FeatureDefinition\s*\[\s*\])?\s*\{\s*return\s+(?:this|registry)\.getAll\s*\(\s*\)\s*;/.test(
      src,
    ),
    "enabled() literally delegates to getAll()",
  );

  assertCase(
    block,
    "enabled.noParallelRebuild",
    !/enabled\s*\(\s*\)\s*(?::\s*[^{]+)?\s*\{[^}]*Array\.from/.test(src) &&
      !/enabled\s*\(\s*\)\s*(?::\s*[^{]+)?\s*\{[^}]*map\.values/.test(src),
    "enabled() does not rebuild from map in parallel",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 07 — readonlyResults                                                  */
/* -------------------------------------------------------------------------- */

{
  const block: BlockId = "readonlyResults";
  const src = existsSync(join(repoRoot, FEATURE_REGISTRY))
    ? stripComments(read(FEATURE_REGISTRY))
    : "";

  assertCase(
    block,
    "ro.allDefinitionsFrozen",
    /allDefinitions[\s\S]*?Object\.freeze/.test(src),
    "allDefinitions uses Object.freeze",
  );

  assertCase(
    block,
    "ro.byCategoryFrozen",
    /byCategory[\s\S]*?return\s+Object\.freeze/.test(src),
    "byCategory freezes filtered array",
  );

  assertCase(
    block,
    "ro.findFrozen",
    /find[\s\S]*?return\s+Object\.freeze/.test(src),
    "find freezes filtered array",
  );

  assertCase(
    block,
    "ro.signaturesReadonly",
    (src.match(/:\s*readonly\s+FeatureDefinition\s*\[\]/g) || []).length >= 4,
    "Discovery signatures use readonly FeatureDefinition[]",
  );
}

/* -------------------------------------------------------------------------- */
/* PASS 08 — registryQueryOnly                                                */
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
    "reg.hasDiscovery",
    /\bgetAll\s*\(/.test(src) &&
      /\bbyCategory\s*\(/.test(src) &&
      /\bfind\s*\(/.test(src) &&
      /\benabled\s*\(/.test(src),
    "Discovery methods present (UX-5.2)",
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
}

/* -------------------------------------------------------------------------- */
/* PASS 09 — registryFrozen                                                   */
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
      !/\basFeatureId\b/.test(src),
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
  { id: "priorGate", pass: 1, ca: "CA-UX-5.2.10 / CA-UX-5.2.11" },
  { id: "discoveryContract", pass: 2, ca: "CA-UX-5.2.2" },
  { id: "getAllExists", pass: 3, ca: "CA-UX-5.2.5" },
  { id: "byCategoryExists", pass: 4, ca: "CA-UX-5.2.2" },
  { id: "findExists", pass: 5, ca: "CA-UX-5.2.2" },
  { id: "enabledExists", pass: 6, ca: "CA-UX-5.2.4" },
  { id: "readonlyResults", pass: 7, ca: "CA-UX-5.2.3" },
  { id: "registryQueryOnly", pass: 8, ca: "CA-UX-5.2.6" },
  { id: "registryFrozen", pass: 9, ca: "CA-UX-5.2.3" },
  { id: "noReact", pass: 10, ca: "CA-UX-5.2.7" },
  { id: "noRuntimeDep", pass: 11, ca: "CA-UX-5.2.7" },
  { id: "noProductWire", pass: 12, ca: "CA-UX-5.2.7" },
  { id: "publicBarrelIntact", pass: 13, ca: "CA-UX-5.2.8" },
  { id: "tscCompile", pass: 14, ca: "CA-UX-5.2.9" },
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
console.log("validate:ux-5.2");
console.log(allPass ? "PASS" : "FAIL");
if (allPass) {
  console.log("Feature Discovery");
  console.log("Registry = immutable query-only SSOT + discovery");
  console.log("enabled() → getAll() · allDefinitions snapshot");
  console.log("No React · No product wiring");
  console.log("Public @/ui barrel intact");
}
console.log(`${passCount}/${BLOCKS.length}`);

process.exit(allPass ? 0 : 1);
