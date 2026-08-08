/**
 * RELEASE foundation identity constants.
 *
 * Authority: RELEASE Planning Charter · RELEASE-P0 · RELEASE-P1 · RELEASE-P2 Planning.
 * No promotion, deployment, or release shipping.
 */

export const RELEASE_DOMAIN_ID = "release" as const;

export const RELEASE_DOMAIN_NAME =
  "Consolidation / Release-Authority Layer" as const;

export const RELEASE_DOMAIN_ARCHITECTURAL_ROLE =
  "Last Authority Layer" as const;

export const RELEASE_DOMAIN_MOTTO = "Consolidate without replacing." as const;

export const RELEASE_OWNERSHIP_PRINCIPLE =
  "Peers own capabilities and domain certifications. RELEASE consolidates evidence for global readiness." as const;

export const RELEASE_CENTRAL_RULE =
  "RELEASE does not replace domain certifications; it consolidates them as evidence for global readiness." as const;

export const RELEASE_P1_PHASE = "RELEASE-P1" as const;

export const RELEASE_P1_STATUS = "CERTIFIED_FROZEN" as const;

export const RELEASE_P1_CERTIFICATION_STATUS = "CERTIFIED_FROZEN" as const;

export const RELEASE_P2_PHASE = "RELEASE-P2" as const;

/** P2 certified status markers — not global Product Release. */
export const RELEASE_P2_STATUS = "CERTIFIED_FROZEN" as const;

export const RELEASE_P2_CERTIFICATION_STATUS = "CERTIFIED_FROZEN" as const;

export type ReleaseFoundationIdentity = {
  readonly domainId: typeof RELEASE_DOMAIN_ID;
  readonly domainName: typeof RELEASE_DOMAIN_NAME;
  readonly architecturalRole: typeof RELEASE_DOMAIN_ARCHITECTURAL_ROLE;
  readonly motto: typeof RELEASE_DOMAIN_MOTTO;
  readonly ownershipPrinciple: typeof RELEASE_OWNERSHIP_PRINCIPLE;
  readonly centralRule: typeof RELEASE_CENTRAL_RULE;
};

export type ReleaseP1Status = typeof RELEASE_P1_STATUS;
export type ReleaseP2Status = typeof RELEASE_P2_STATUS;

export const RELEASE_FOUNDATION_IDENTITY: ReleaseFoundationIdentity = {
  domainId: RELEASE_DOMAIN_ID,
  domainName: RELEASE_DOMAIN_NAME,
  architecturalRole: RELEASE_DOMAIN_ARCHITECTURAL_ROLE,
  motto: RELEASE_DOMAIN_MOTTO,
  ownershipPrinciple: RELEASE_OWNERSHIP_PRINCIPLE,
  centralRule: RELEASE_CENTRAL_RULE,
};
