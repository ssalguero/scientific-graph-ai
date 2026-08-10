/**
 * COLLAB-I8 — Cross-Domain Integration status markers.
 */

export const COLLAB_CROSS_DOMAIN_PHASE = "COLLAB-I8" as const;

export const COLLAB_CROSS_DOMAIN_STATUS = "CROSS_DOMAIN_COMPLETE" as const;

export type CollabCrossDomainStatus = typeof COLLAB_CROSS_DOMAIN_STATUS;
