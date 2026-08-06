/**
 * AI-I5 — Intelligence Capability Catalog identity (AI-P3 §7.2).
 * Conceptual catalog only — not a runtime registry of active services.
 */

export const AI_CAPABILITY_CATALOG_ID = "intelligence-capability-catalog" as const;

export const AI_CAPABILITY_CATALOG_PURPOSE =
  "Catalog of intelligence capabilities under Capability Authority" as const;

export const AI_CAPABILITY_CATALOG_RESPONSIBILITY =
  "Hold the conceptual catalog of intelligence capabilities governed exclusively by AI" as const;

export const AI_CAPABILITY_CATALOG_NEVER_OWNS = [
  "peer-domain-capability-redefinition",
  "scientific-truth-catalog-ownership",
] as const;

export type AiCapabilityCatalogId = typeof AI_CAPABILITY_CATALOG_ID;

export const AI_CAPABILITY_CATALOG_LIFECYCLE = {
  capabilityId: AI_CAPABILITY_CATALOG_ID,
  state: "inactive" as const,
  runtimeCatalog: false as const,
};
