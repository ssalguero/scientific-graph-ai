/**
 * PLUGINS-I3 — Discovery Service identity (C3).
 */

export const PLUGINS_DISCOVERY_COMPONENT_ID = "C3_DiscoveryService" as const;
export const PLUGINS_DISCOVERY_NAME = "Discovery Service" as const;
export const PLUGINS_DISCOVERY_PURPOSE =
  "Identify plugin candidates and produce inert discovery descriptors" as const;

export const PLUGINS_DISCOVERY_IDENTITY = {
  componentId: PLUGINS_DISCOVERY_COMPONENT_ID,
  name: PLUGINS_DISCOVERY_NAME,
  purpose: PLUGINS_DISCOVERY_PURPOSE,
  mutatesRegistry: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  evaluatesCapabilities: false as const,
} as const;

export type PluginsDiscoveryIdentity = typeof PLUGINS_DISCOVERY_IDENTITY;
