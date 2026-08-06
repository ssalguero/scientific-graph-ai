/**
 * DATA-I8 — Architecture Freeze + Boundary Enforcement gate.
 *
 * Authority: src/data/ARCHITECTURE.md · BOUNDARY_ENFORCEMENT.md · DATA-P3/P8/P9
 *
 * Checks:
 * 1. Package layout + enforcement artifacts
 * 2. Public barrel exports only contracts + public facades
 * 3. Outside DATA does not import DATA internals
 * 4. Outside DATA may import only `@/data` / `@/data/contracts`
 * 5. Internal forbidden dependency edges (Dependency Direction Rule)
 * 6. API Freeze: six groups, six categories, public catalog surface class
 * 7. Public API symbols present (configureData / getDataApi / catalog ids wired)
 * 8. No shadow registry claim pattern outside Authoritative managers
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  DATA_FORBIDDEN_INTERNAL_EDGES,
  DATA_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES,
  DATA_FROZEN_CAPABILITY_GROUPS,
  DATA_FROZEN_CONTRACT_CATEGORIES,
  DATA_REQUIRED_LAYOUT_DIRS,
  isAllowedDataPublicImport,
  isDataPackageImport,
  isForbiddenDataInternalImport,
} from "../src/data/internal/boundary-policy";
import { DATA_PUBLIC_CONTRACT_CATALOG } from "../src/data/contracts/catalog";
import { DataCapabilityGroup } from "../src/data/contracts/capability-groups";
import { DataContractCategory } from "../src/data/contracts/contract-categories";
import { DataSurfaceClass } from "../src/data/contracts/surface";

const repoRoot = process.cwd();
const dataDir = join(repoRoot, "src/data");
const srcDir = join(repoRoot, "src");

const results: { id: string; pass: boolean; detail: string }[] = [];
const assertCase = (id: string, pass: boolean, detail: string) => {
  results.push({ id, pass, detail });
};

const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ");

const readRel = (relPath: string): string => {
  const full = join(repoRoot, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
};

const collectTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const child = join(abs, name);
      if (statSync(child).isDirectory()) {
        walk(child);
      } else if (/\.(ts|tsx)$/.test(name)) {
        out.push(child);
      }
    }
  };
  walk(dir);
  return out;
};

const toPosix = (p: string) => p.replace(/\\/g, "/");

const relFromRepo = (abs: string) => toPosix(relative(repoRoot, abs));

const extractFromSpecifiers = (code: string): string[] => {
  const specs: string[] = [];
  const re = /from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    specs.push(m[1]!);
  }
  return specs;
};

const isUnderDataPackage = (relPosix: string): boolean =>
  relPosix.startsWith("src/data/");

/* —— 0. Package layout —— */

assertCase(
  "data.layout.root",
  existsSync(dataDir) && existsSync(join(dataDir, "index.ts")),
  "src/data/index.ts exists"
);

for (const dir of DATA_REQUIRED_LAYOUT_DIRS) {
  assertCase(
    `data.layout.${dir}`,
    existsSync(join(dataDir, dir)),
    `src/data/${dir}/ exists`
  );
}

assertCase(
  "data.layout.architectureDoc",
  existsSync(join(dataDir, "ARCHITECTURE.md")),
  "ARCHITECTURE.md present"
);

assertCase(
  "data.layout.boundaryEnforcementDoc",
  existsSync(join(dataDir, "BOUNDARY_ENFORCEMENT.md")),
  "BOUNDARY_ENFORCEMENT.md present (DATA-I8)"
);

assertCase(
  "data.layout.boundaryCleanupDoc",
  existsSync(join(dataDir, "BOUNDARY_CLEANUP.md")),
  "BOUNDARY_CLEANUP.md present (DATA-I8)"
);

assertCase(
  "data.layout.runtimeEnforcementGuarantees",
  existsSync(join(dataDir, "RUNTIME_ENFORCEMENT_GUARANTEES.md")),
  "RUNTIME_ENFORCEMENT_GUARANTEES.md present (DATA-I8)"
);

assertCase(
  "data.layout.boundaryPolicy",
  existsSync(join(dataDir, "internal/boundary-policy.ts")),
  "internal/boundary-policy.ts present (DATA-I8)"
);

/* —— 1. Public barrel surface —— */

const publicBarrel = readRel("src/data/index.ts");
const publicBarrelCode = stripComments(publicBarrel);

const publicReexportHits = DATA_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES.filter(
  (prefix) =>
    new RegExp(
      `from\\s+["']${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
    ).test(publicBarrel)
);

assertCase(
  "data.public.noInternalReexports",
  publicReexportHits.length === 0,
  publicReexportHits.length === 0
    ? "public barrel does not re-export internals"
    : `forbidden re-exports: ${publicReexportHits.join(", ")}`
);

assertCase(
  "data.public.exportsConfigureData",
  /configureData/.test(publicBarrelCode),
  "configureData exported from @/data"
);

assertCase(
  "data.public.exportsGetDataApi",
  /getDataApi/.test(publicBarrelCode),
  "getDataApi exported from @/data"
);

assertCase(
  "data.public.noComposeDataDomain",
  !/\bcomposeDataDomain\b/.test(publicBarrelCode),
  "composeDataDomain not on public barrel"
);

assertCase(
  "data.public.noDatasetManager",
  !/\bDatasetManager\b/.test(publicBarrelCode),
  "DatasetManager not on public barrel"
);

assertCase(
  "data.public.noLifecycleTracker",
  !/\bLifecycleTracker\b/.test(publicBarrelCode),
  "LifecycleTracker not on public barrel"
);

/* —— 2–4. Import boundaries outside DATA —— */

const outsideHits: string[] = [];
const nonPublicHits: string[] = [];

for (const abs of collectTsFiles(srcDir)) {
  const rel = relFromRepo(abs);
  if (isUnderDataPackage(rel)) continue;
  // Scripts and validators may reference internals by design
  if (rel.startsWith("scripts/")) continue;

  const code = stripComments(readFileSync(abs, "utf8"));
  for (const spec of extractFromSpecifiers(code)) {
    if (!isDataPackageImport(spec)) continue;
    if (isForbiddenDataInternalImport(spec)) {
      outsideHits.push(`${rel} → ${spec}`);
    } else if (!isAllowedDataPublicImport(spec)) {
      nonPublicHits.push(`${rel} → ${spec}`);
    }
  }
}

assertCase(
  "data.imports.outsideNoInternals",
  outsideHits.length === 0,
  outsideHits.length === 0
    ? "no outside imports of DATA internals"
    : outsideHits.slice(0, 12).join("; ")
);

assertCase(
  "data.imports.outsidePublicOnly",
  nonPublicHits.length === 0,
  nonPublicHits.length === 0
    ? "outside DATA uses only @/data | @/data/contracts"
    : nonPublicHits.slice(0, 12).join("; ")
);

/* —— 5. Internal forbidden edges —— */

const edgeHits: string[] = [];
for (const abs of collectTsFiles(dataDir)) {
  const rel = relFromRepo(abs);
  const posix = toPosix(rel);
  const code = stripComments(readFileSync(abs, "utf8"));
  for (const spec of extractFromSpecifiers(code)) {
    // Resolve relative specs roughly against file path
    let target = spec;
    if (spec.startsWith(".")) {
      const dir = posix.includes("/")
        ? posix.slice(0, posix.lastIndexOf("/"))
        : posix;
      // normalize ../ segments lightly for substring checks
      const joined = toPosix(join(dir, spec));
      target = joined;
    }
    for (const edge of DATA_FORBIDDEN_INTERNAL_EDGES) {
      if (
        posix.includes(edge.fromIncludes) &&
        target.includes(edge.toIncludes)
      ) {
        edgeHits.push(`${rel}: ${edge.reason} (${spec})`);
      }
    }
  }
}

assertCase(
  "data.deps.forbiddenEdges",
  edgeHits.length === 0,
  edgeHits.length === 0
    ? "no forbidden internal dependency edges"
    : edgeHits.slice(0, 12).join("; ")
);

/* —— 6. API Freeze —— */

const capabilityValues = Object.values(DataCapabilityGroup);
const categoryValues = Object.values(DataContractCategory);

assertCase(
  "data.apiFreeze.capabilityGroupCount",
  capabilityValues.length === DATA_FROZEN_CAPABILITY_GROUPS.length,
  `capability groups: ${capabilityValues.length}`
);

assertCase(
  "data.apiFreeze.capabilityGroupSet",
  DATA_FROZEN_CAPABILITY_GROUPS.every((g) =>
    (capabilityValues as string[]).includes(g)
  ),
  "capability group names match freeze"
);

assertCase(
  "data.apiFreeze.contractCategoryCount",
  categoryValues.length === DATA_FROZEN_CONTRACT_CATEGORIES.length,
  `contract categories: ${categoryValues.length}`
);

assertCase(
  "data.apiFreeze.contractCategorySet",
  DATA_FROZEN_CONTRACT_CATEGORIES.every((c) =>
    (categoryValues as string[]).includes(c)
  ),
  "contract category names match freeze"
);

const nonPublicCatalog = DATA_PUBLIC_CONTRACT_CATALOG.filter(
  (e) => e.surfaceClass !== DataSurfaceClass.Public
);

assertCase(
  "data.apiFreeze.catalogAllPublic",
  nonPublicCatalog.length === 0,
  nonPublicCatalog.length === 0
    ? `catalog entries all Public (${DATA_PUBLIC_CONTRACT_CATALOG.length})`
    : `non-public entries: ${nonPublicCatalog.map((e) => e.id).join(", ")}`
);

/* —— 7. Public API wiring —— */

const publicApiFactory = readRel(
  "src/data/integration/public-api-factory.ts"
);
const factoryCode = stripComments(publicApiFactory);

const missingCatalogIds = DATA_PUBLIC_CONTRACT_CATALOG.map((e) => e.id).filter(
  (id) => !factoryCode.includes(id)
);

assertCase(
  "data.api.catalogIdsInFactory",
  missingCatalogIds.length === 0,
  missingCatalogIds.length === 0
    ? "all catalog ids referenced in public-api-factory"
    : `missing in factory: ${missingCatalogIds.join(", ")}`
);

assertCase(
  "data.api.engineUsesPublicSurface",
  /from\s+["']@\/data["']/.test(
    readRel("src/engine/coordination/data/index.ts")
  ),
  "ENGINE coordination/data imports @/data"
);

assertCase(
  "data.api.engineNoDeepData",
  !/@\/data\/(model|metadata|processing|validation|repository|integration|internal)\b/.test(
    readRel("src/engine/coordination/data/index.ts")
  ),
  "ENGINE coordination/data has no deep DATA imports"
);

/* —— 8. Shadow registry / authority claims —— */

const claimHits: string[] = [];
for (const abs of collectTsFiles(dataDir)) {
  const rel = relFromRepo(abs);
  const code = readFileSync(abs, "utf8");
  if (!/claimAuthoritative|registerAuthoritative/.test(code)) continue;
  const allowed =
    rel.includes("dataset-manager") ||
    rel.includes("scientific-model-manager") ||
    rel.includes("internal/registry/authority") ||
    rel.includes("authoritative-registry") ||
    rel.includes("compose-domain") ||
    rel.includes("compose-registries") ||
    rel.includes("__tests__");
  if (!allowed) {
    claimHits.push(rel);
  }
}

assertCase(
  "data.registry.authorityClaimSites",
  claimHits.length === 0,
  claimHits.length === 0
    ? "Authoritative claim sites limited to expected managers/authority"
    : `unexpected claim sites: ${claimHits.join(", ")}`
);

/* —— Report —— */

const failed = results.filter((r) => !r.pass);
const summary = {
  phase: "data-boundaries",
  pass: failed.length === 0,
  total: results.length,
  failed: failed.map((f) => ({ id: f.id, detail: f.detail })),
  results,
};

console.log(JSON.stringify(summary, null, 2));
console.log(
  summary.pass
    ? "\nPASS — data-boundaries (DATA-I8)"
    : `\nFAIL — data-boundaries (${failed.map((f) => f.id).join(", ")})`
);
process.exit(summary.pass ? 0 : 1);
