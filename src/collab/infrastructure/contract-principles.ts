/**
 * COLLAB-I1 — Public contract principles skeleton (P4 §3).
 *
 * Markers only — not APIs, DTOs, schemas, or runtime enforcement.
 */

export const COLLAB_CONTRACT_PRINCIPLES = [
  "cite-only-constitution",
  "peer-identity",
  "metadata-boundary",
  "non-bypass",
  "optional-layer",
  "auditability",
  "extension-points-only",
] as const;

export type CollabContractPrinciple = (typeof COLLAB_CONTRACT_PRINCIPLES)[number];

export const COLLAB_CONTRACT_PRINCIPLE_MEANING = {
  "cite-only-constitution":
    "Identity · Ownership Matrix · Metadata · Audit · Async Freeze · Non-blocking — cite Charter; do not redefine",
  "peer-identity":
    "Contracts reference certified peer identities; never duplicate them",
  "metadata-boundary":
    "All COLLAB contract payloads are collaboration metadata; never mutate scientific data",
  "non-bypass": "COLLAB never bypasses ENGINE Product Flows",
  "optional-layer":
    "COLLAB failure MUST NOT block ENGINE, DATA, or AI",
  auditability:
    "Collaboration actions remain auditable (actor, timestamp, operation, target references)",
  "extension-points-only":
    "Realtime collaboration protocols and Collaborative AI excluded from v1 contracts",
} as const satisfies Record<CollabContractPrinciple, string>;
