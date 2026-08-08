/**
 * PLUGINS-I3 — Discovery status markers (C3).
 * Discovery discovers. It never mutates the Registry.
 */

export const PLUGINS_DISCOVERY_PHASE = "PLUGINS-I3" as const;
export const PLUGINS_DISCOVERY_STATUS = "DISCOVERY_IMPLEMENTED" as const;
export type PluginsDiscoveryStatus = typeof PLUGINS_DISCOVERY_STATUS;
