/**
 * PLUGINS-I2/I3 — Registry Infrastructure phase markers.
 * I2: infrastructure complete. I3: registration service owns mutation.
 */

export const PLUGINS_REGISTRY_PHASE = "PLUGINS-I2" as const;

export const PLUGINS_REGISTRY_STATUS = "REGISTRY_INFRASTRUCTURE_COMPLETE" as const;

export type PluginsRegistryStatus = typeof PLUGINS_REGISTRY_STATUS;

/** I3 — registration service available; Discovery never mutates registry. */
export const PLUGINS_REGISTRY_MUTATION_ONLY_VIA_REGISTRY = true as const;
