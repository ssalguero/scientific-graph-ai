/**
 * DATA-I8 — Boundary enforcement policy (DATA-internal).
 *
 * OWNERSHIP: Single source of allowlists / forbidden surfaces used by
 * `scripts/validate-data-boundaries.ts` and boundary unit tests.
 *
 * Not part of the consumer Scientific Data API — do not import from ENGINE/UX.
 *
 * @packageDocumentation
 */

/** Consumer-allowed DATA import prefixes (public surface only). */
export const DATA_PUBLIC_IMPORT_PREFIXES = [
  "@/data",
  "@/data/contracts",
] as const;

/**
 * Path segments under `src/data/` that are DATA-internal.
 * Outside `src/data/**`, importing these (via `@/data/...` or relative) is forbidden.
 */
export const DATA_INTERNAL_FOLDER_SEGMENTS = [
  "model",
  "metadata",
  "processing",
  "validation",
  "repository",
  "integration",
  "internal",
] as const;

/** Public barrel must never re-export these package-relative roots. */
export const DATA_FORBIDDEN_PUBLIC_REEXPORT_PREFIXES = [
  "./internal",
  "./integration",
  "./model",
  "./metadata",
  "./processing",
  "./validation",
  "./repository",
] as const;

/**
 * Frozen Capability Groups (DATA-P9) — must remain exactly these six.
 */
export const DATA_FROZEN_CAPABILITY_GROUPS = [
  "Dataset",
  "ScientificModel",
  "Transformation",
  "Validation",
  "Metadata",
  "Repository",
] as const;

/**
 * Frozen Contract Categories (DATA-P9) — must remain exactly these six.
 */
export const DATA_FROZEN_CONTRACT_CATEGORIES = [
  "Lifecycle",
  "Discovery",
  "Transformation",
  "Validation",
  "Metadata",
  "Publication",
] as const;

/**
 * Required layout folders for DATA package foundation (DATA-I0+).
 */
export const DATA_REQUIRED_LAYOUT_DIRS = [
  "contracts",
  "public",
  "model",
  "metadata",
  "processing",
  "validation",
  "repository",
  "integration",
  "internal",
  "__tests__",
] as const;

/**
 * Transitional ENGINE feedstock adapters still allowed to import `@/lib/*`
 * (Platform / import science). Not DATA scientific authority.
 * Documented for I8 cleanup inventory — not removed in I8.
 */
export const DATA_TRANSITIONAL_ENGINE_LIB_ALLOWLIST = [
  "src/engine/coordination/import/lib-import-adapter.ts",
  "src/engine/coordination/project/LocalProjectAdapter.ts",
  "src/engine/coordination/export/lib-project-export-adapter.ts",
] as const;

/**
 * Within DATA, forbidden import edges (Dependency Direction Rule / P2).
 * From-folder must not import to-folder (posix path contains).
 */
export const DATA_FORBIDDEN_INTERNAL_EDGES = [
  {
    fromIncludes: "/model/",
    toIncludes: "/processing/",
    reason: "Scientific Model must not depend on Processing",
  },
  {
    fromIncludes: "/model/",
    toIncludes: "/repository/repository-services",
    reason: "Scientific Model must not depend on Repository Services",
  },
  {
    fromIncludes: "/repository/repository-services/",
    toIncludes: "/processing/",
    reason: "Repository must not depend on Transformation",
  },
] as const;

export function isAllowedDataPublicImport(spec: string): boolean {
  if (spec === "@/data" || spec === "@/data/contracts") return true;
  if (spec.startsWith("@/data/contracts/")) return true;
  return false;
}

export function isDataPackageImport(spec: string): boolean {
  return (
    spec === "@/data" ||
    spec.startsWith("@/data/") ||
    /(?:^|\/)src\/data(?:\/|$)/.test(spec)
  );
}

export function isForbiddenDataInternalImport(spec: string): boolean {
  if (!isDataPackageImport(spec)) return false;
  if (isAllowedDataPublicImport(spec)) return false;
  // @/data/public, @/data/model, etc.
  if (spec === "@/data/public" || spec.startsWith("@/data/public/")) {
    return true;
  }
  for (const segment of DATA_INTERNAL_FOLDER_SEGMENTS) {
    if (
      spec === `@/data/${segment}` ||
      spec.startsWith(`@/data/${segment}/`)
    ) {
      return true;
    }
  }
  return false;
}
