/**
 * COLLAB-I0 — Foundation identity constants.
 *
 * Authority: COLLAB-P0 Identity Freeze · COLLAB Planning Charter · COLLAB-DECISION-001.
 * No sharing, membership, permissions, annotations, presence, or collaboration runtime.
 */

export const COLLAB_DOMAIN_ID = "collab" as const;

/** Canonical identity (COLLAB-P0). */
export const COLLAB_DOMAIN_NAME = "Collaborative Layer" as const;

/** Architectural / product role synonym (COLLAB-P0 / P1). */
export const COLLAB_DOMAIN_ARCHITECTURAL_ROLE = "COLLABORATION Domain" as const;

/** Domain Motto (COLLAB-P0 / Charter). */
export const COLLAB_DOMAIN_MOTTO =
  "Teamwork without compromising scientific integrity." as const;

/** Ownership principle (COLLAB-P0 / Charter). */
export const COLLAB_OWNERSHIP_PRINCIPLE =
  "COLLAB owns collaboration metadata. Peers own science, workflow, AI, and presentation." as const;

export const COLLAB_FOUNDATION_PHASE = "COLLAB-I0" as const;

export const COLLAB_FOUNDATION_STATUS = "FOUNDATION_COMPLETE" as const;

export type CollabFoundationIdentity = {
  readonly domainId: typeof COLLAB_DOMAIN_ID;
  readonly domainName: typeof COLLAB_DOMAIN_NAME;
  readonly architecturalRole: typeof COLLAB_DOMAIN_ARCHITECTURAL_ROLE;
  readonly motto: typeof COLLAB_DOMAIN_MOTTO;
  readonly ownershipPrinciple: typeof COLLAB_OWNERSHIP_PRINCIPLE;
};

export type CollabFoundationStatus = typeof COLLAB_FOUNDATION_STATUS;

export const COLLAB_FOUNDATION_IDENTITY: CollabFoundationIdentity = {
  domainId: COLLAB_DOMAIN_ID,
  domainName: COLLAB_DOMAIN_NAME,
  architecturalRole: COLLAB_DOMAIN_ARCHITECTURAL_ROLE,
  motto: COLLAB_DOMAIN_MOTTO,
  ownershipPrinciple: COLLAB_OWNERSHIP_PRINCIPLE,
};
