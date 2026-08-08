/**
 * PERFORMANCE-I0 — Foundation identity constants.
 *
 * Authority: PERFORMANCE Planning Charter · PERFORMANCE-P0 Identity & Boundary Freeze.
 * No measurement, instrumentation, budgets, workloads, optimization, or runtime seams.
 */

export const PERFORMANCE_DOMAIN_ID = "performance" as const;

/** Canonical identity (Charter / P0). */
export const PERFORMANCE_DOMAIN_NAME = "Optimization Layer" as const;

/** Architectural role synonym. */
export const PERFORMANCE_DOMAIN_ARCHITECTURAL_ROLE = "Optimization Layer" as const;

/** Domain Motto (Charter / P0). */
export const PERFORMANCE_DOMAIN_MOTTO = "Optimize without owning." as const;

/** Ownership principle (Charter / P0). */
export const PERFORMANCE_OWNERSHIP_PRINCIPLE =
  "Peers Own. PERFORMANCE Observes and Optimizes." as const;

export const PERFORMANCE_FOUNDATION_PHASE = "PERFORMANCE-I0" as const;

export const PERFORMANCE_FOUNDATION_STATUS = "FOUNDATION_COMPLETE" as const;

export type PerformanceFoundationIdentity = {
  readonly domainId: typeof PERFORMANCE_DOMAIN_ID;
  readonly domainName: typeof PERFORMANCE_DOMAIN_NAME;
  readonly architecturalRole: typeof PERFORMANCE_DOMAIN_ARCHITECTURAL_ROLE;
  readonly motto: typeof PERFORMANCE_DOMAIN_MOTTO;
  readonly ownershipPrinciple: typeof PERFORMANCE_OWNERSHIP_PRINCIPLE;
};

export type PerformanceFoundationStatus = typeof PERFORMANCE_FOUNDATION_STATUS;

export const PERFORMANCE_FOUNDATION_IDENTITY: PerformanceFoundationIdentity = {
  domainId: PERFORMANCE_DOMAIN_ID,
  domainName: PERFORMANCE_DOMAIN_NAME,
  architecturalRole: PERFORMANCE_DOMAIN_ARCHITECTURAL_ROLE,
  motto: PERFORMANCE_DOMAIN_MOTTO,
  ownershipPrinciple: PERFORMANCE_OWNERSHIP_PRINCIPLE,
};
