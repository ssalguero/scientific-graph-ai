/**
 * COLLAB boundary policy (internal).
 *
 * I0–I9 baselines · I10 Domain Certification package.
 * I8 cross-domain adapters may import public `@/engine`, `@/data`, `@/ui` only.
 */

export const COLLAB_PUBLIC_IMPORT_PREFIXES = ["@/collab"] as const;

export const COLLAB_INTERNAL_FOLDER_SEGMENTS = [
  "foundation",
  "public",
  "internal",
  "infrastructure",
  "membership",
  "permissions",
  "annotation-discussion",
  "review-management",
  "supporting",
  "governance-audit",
  "cross-domain",
  "hardening-controls",
  "certification",
] as const;

export const COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES = [
  "@/collab/internal",
  "@/collab/foundation",
  "@/collab/public",
  "@/collab/infrastructure",
  "@/collab/membership",
  "@/collab/permissions",
  "@/collab/annotation-discussion",
  "@/collab/review-management",
  "@/collab/supporting",
  "@/collab/governance-audit",
  "@/collab/cross-domain",
  "@/collab/hardening-controls",
  "@/collab/certification",
] as const;

export const COLLAB_FORBIDDEN_PEER_IMPORT_PREFIXES = [
  "@/engine",
  "@/data",
  "@/ai",
  "@/ui",
  "@/plugins",
  "@/performance",
  "@/components",
  "@/app",
] as const;

/** I8 architectural peer deps (P1 · P4). AI excluded — peer only. */
export const COLLAB_ARCHITECTURAL_ALLOWED_DEPS = [
  "@/engine",
  "@/data",
  "@/ui",
] as const;

export const COLLAB_I8_ALLOWED_PEER_IMPORT_PREFIXES =
  COLLAB_ARCHITECTURAL_ALLOWED_DEPS;

export const COLLAB_ALLOWED_PUBLIC_INFRASTRUCTURE_REEXPORTS = [
  "COLLAB_INFRASTRUCTURE_PHASE",
  "COLLAB_INFRASTRUCTURE_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_SHARING_MEMBERSHIP_REEXPORTS = [
  "COLLAB_SHARING_MEMBERSHIP_PHASE",
  "COLLAB_SHARING_MEMBERSHIP_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_PERMISSIONS_REEXPORTS = [
  "COLLAB_PERMISSIONS_PHASE",
  "COLLAB_PERMISSIONS_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_ANNOTATION_DISCUSSION_REEXPORTS = [
  "COLLAB_ANNOTATION_DISCUSSION_PHASE",
  "COLLAB_ANNOTATION_DISCUSSION_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_REVIEW_MANAGEMENT_REEXPORTS = [
  "COLLAB_REVIEW_MANAGEMENT_PHASE",
  "COLLAB_REVIEW_MANAGEMENT_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_SUPPORTING_REEXPORTS = [
  "COLLAB_SUPPORTING_PHASE",
  "COLLAB_SUPPORTING_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_GOVERNANCE_AUDIT_REEXPORTS = [
  "COLLAB_GOVERNANCE_AUDIT_PHASE",
  "COLLAB_GOVERNANCE_AUDIT_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_CROSS_DOMAIN_REEXPORTS = [
  "COLLAB_CROSS_DOMAIN_PHASE",
  "COLLAB_CROSS_DOMAIN_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_HARDENING_REEXPORTS = [
  "COLLAB_HARDENING_PHASE",
  "COLLAB_HARDENING_STATUS",
] as const;

export const COLLAB_ALLOWED_PUBLIC_CERTIFICATION_REEXPORTS = [
  "COLLAB_CERTIFICATION_PHASE",
  "COLLAB_CERTIFICATION_STATUS",
  "COLLAB_DOMAIN_STATUS",
  "COLLAB_IMPLEMENTATION_SERIES_CLOSED",
] as const;

export function isAllowedCollabPublicImport(specifier: string): boolean {
  return specifier === "@/collab";
}

export function isForbiddenCollabConsumerImport(specifier: string): boolean {
  return COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
  );
}

export function isForbiddenCollabPeerImport(specifier: string): boolean {
  return COLLAB_FORBIDDEN_PEER_IMPORT_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`),
  );
}

/** True when specifier is an I8-allowed public peer barrel (`@/engine` | `@/data` | `@/ui`). */
export function isAllowedCollabI8PeerImport(specifier: string): boolean {
  return (COLLAB_I8_ALLOWED_PEER_IMPORT_PREFIXES as readonly string[]).includes(
    specifier,
  );
}
