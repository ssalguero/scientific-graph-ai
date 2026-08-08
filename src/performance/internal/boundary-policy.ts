/**
 * PERFORMANCE boundary policy (internal).
 *
 * Consumers outside PERFORMANCE may import ONLY `@/performance`.
 * I2 adapters may import `@/engine`, `@/data`, `@/ui` public barrels only
 * (from instrumentation/). Deep peer paths and other peers remain forbidden.
 */

/** Consumer-allowed PERFORMANCE import prefixes (public surface only). */
export const PERFORMANCE_PUBLIC_IMPORT_PREFIXES = ["@/performance"] as const;

export const PERFORMANCE_INTERNAL_FOLDER_SEGMENTS = [
  "foundation",
  "public",
  "internal",
  "measurement",
  "instrumentation",
  "budgets",
  "workloads",
  "domain-waves",
  "cross-domain",
  "opt-waves",
  "gates",
  "integrity",
] as const;

export const PERFORMANCE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES = [
  "@/performance/internal",
  "@/performance/foundation",
  "@/performance/public",
  "@/performance/measurement",
  "@/performance/instrumentation",
  "@/performance/budgets",
  "@/performance/workloads",
  "@/performance/domain-waves",
  "@/performance/cross-domain",
  "@/performance/opt-waves",
  "@/performance/gates",
  "@/performance/integrity",
] as const;

/** Peers forbidden everywhere in PERFORMANCE except allowlisted I2 public barrels. */
export const PERFORMANCE_FORBIDDEN_PEER_IMPORT_PREFIXES = [
  "@/ai",
  "@/plugins",
  "@/collab",
  "@/components",
  "@/app",
] as const;

/** I2-only allowlisted public peer barrels (exact package roots). */
export const PERFORMANCE_I2_ALLOWED_PEER_IMPORTS = [
  "@/engine",
  "@/data",
  "@/ui",
] as const;

/** Deep peer paths never allowed (private coupling). */
export const PERFORMANCE_FORBIDDEN_PEER_DEEP_PREFIXES = [
  "@/engine/",
  "@/data/",
  "@/ui/",
] as const;

export function isAllowedPerformancePublicImport(specifier: string): boolean {
  return specifier === "@/performance";
}

export function isForbiddenPerformanceConsumerImport(specifier: string): boolean {
  return PERFORMANCE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
  );
}

export function isForbiddenPerformancePeerImport(specifier: string): boolean {
  if (
    (PERFORMANCE_I2_ALLOWED_PEER_IMPORTS as readonly string[]).includes(specifier)
  ) {
    return false;
  }
  if (
    PERFORMANCE_FORBIDDEN_PEER_DEEP_PREFIXES.some((prefix) =>
      specifier.startsWith(prefix),
    )
  ) {
    return true;
  }
  return PERFORMANCE_FORBIDDEN_PEER_IMPORT_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
  );
}

/** True if specifier is an allowed I2 peer public barrel import. */
export function isAllowedPerformanceI2PeerImport(specifier: string): boolean {
  return (PERFORMANCE_I2_ALLOWED_PEER_IMPORTS as readonly string[]).includes(
    specifier,
  );
}
