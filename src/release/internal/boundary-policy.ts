/**
 * RELEASE boundary policy (internal).
 *
 * Consumers outside RELEASE may import ONLY `@/release`.
 * RELEASE must not import peer domain packages (fan-in only via evidence paths as data).
 */

export const RELEASE_PUBLIC_IMPORT_PREFIXES = ["@/release"] as const;

export const RELEASE_INTERNAL_FOLDER_SEGMENTS = [
  "foundation",
  "types",
  "baseline",
  "governance",
  "evidence",
  "readiness",
  "gates",
  "public",
  "internal",
] as const;

export const RELEASE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES = [
  "@/release/internal",
  "@/release/foundation",
  "@/release/types",
  "@/release/baseline",
  "@/release/governance",
  "@/release/evidence",
  "@/release/readiness",
  "@/release/gates",
  "@/release/public",
] as const;

/** Peers must not be imported by RELEASE (no circular deps; evidence paths are strings). */
export const RELEASE_FORBIDDEN_PEER_IMPORT_PREFIXES = [
  "@/engine",
  "@/data",
  "@/ai",
  "@/ui",
  "@/plugins",
  "@/performance",
  "@/collab",
  "@/components",
  "@/app",
] as const;

export function isAllowedReleasePublicImport(specifier: string): boolean {
  return specifier === "@/release";
}

export function isForbiddenReleaseConsumerImport(specifier: string): boolean {
  return RELEASE_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
  );
}

export function isForbiddenReleasePeerImport(specifier: string): boolean {
  return RELEASE_FORBIDDEN_PEER_IMPORT_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
  );
}
