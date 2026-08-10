/**
 * COLLAB boundary policy (internal).
 *
 * Consumers outside COLLAB may import ONLY `@/collab`.
 * I0 establishes the boundary-enforcement skeleton only (P0 · P1 · P6 I0).
 * Peer imports (ENGINE / DATA / UX) remain deferred to authorized later phases.
 * AI is never an allowed COLLAB dependency edge (P1).
 */

/** Consumer-allowed COLLAB import prefixes (public surface only). */
export const COLLAB_PUBLIC_IMPORT_PREFIXES = ["@/collab"] as const;

/** I0 folder segments present in the foundation package. */
export const COLLAB_INTERNAL_FOLDER_SEGMENTS = [
  "foundation",
  "public",
  "internal",
] as const;

export const COLLAB_FORBIDDEN_CONSUMER_IMPORT_PREFIXES = [
  "@/collab/internal",
  "@/collab/foundation",
  "@/collab/public",
] as const;

/**
 * Peers forbidden in COLLAB-I0 source.
 * Allowed deps UX / ENGINE / DATA are architectural (P1) but not imported in I0.
 * AI remains a peer-only relationship — never a COLLAB dependency edge.
 */
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

/** Architectural allowed dependency roots (P1) — documentation only for I0. */
export const COLLAB_ARCHITECTURAL_ALLOWED_DEPS = [
  "@/engine",
  "@/data",
  "@/ui",
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
