/**
 * PLUGINS-I2 — Registry ownership / SSOT constants.
 * Cite P3 Registry Strategy · P4 Public Surface · Charter EP Ownership.
 */

export const PLUGINS_REGISTRY_OWNERSHIP = {
  /** C2 is SSOT for plugin registry visibility state (architectural). */
  pluginRegistrySsot: true,
  /** Capability registry remains a facet stewarded with C6 (anti-proliferation). */
  capabilityFacetOnly: true,
  /** EP registry indexes references only — peers own Extension Points. */
  ownsExtensionPoints: false,
  isPublicExtensibilitySurface: false,
  frameworkOwnedSubsystem: true,
  publicContractsOnly: true,
} as const;

export type PluginsRegistryOwnership = typeof PLUGINS_REGISTRY_OWNERSHIP;

/**
 * Registry facets (P3 anti-proliferation) — conceptual roles, not separate products.
 */
export const PLUGINS_REGISTRY_FACETS = [
  {
    id: "PluginRegistry",
    steward: "C2",
    role: "Plugin Identity visibility SSOT",
  },
  {
    id: "CapabilityRegistry",
    steward: "C6_facet",
    role: "Declared Capability visibility facet",
  },
  {
    id: "ExtensionPointRegistry",
    steward: "C10_facet",
    role: "Peer-owned EP reference index (does not own EPs)",
  },
  {
    id: "CompatibilityRegistry",
    steward: "C8_facet",
    role: "Compatibility assessment association (observational)",
  },
] as const;

export type PluginsRegistryFacet = (typeof PLUGINS_REGISTRY_FACETS)[number];
