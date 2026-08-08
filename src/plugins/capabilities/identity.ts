/**
 * PLUGINS-I4 — Capability Manager identity (C6).
 */

export const PLUGINS_CAPABILITIES_COMPONENT_ID =
  "C6_CapabilityManager" as const;
export const PLUGINS_CAPABILITIES_NAME = "Capability Manager" as const;
export const PLUGINS_CAPABILITIES_PURPOSE =
  "Evaluate declared capabilities and classify availability (advisory; never inferred)" as const;

export const PLUGINS_CAPABILITIES_IDENTITY = {
  componentId: PLUGINS_CAPABILITIES_COMPONENT_ID,
  name: PLUGINS_CAPABILITIES_NAME,
  purpose: PLUGINS_CAPABILITIES_PURPOSE,
  mutatesRegistry: false as const,
  ownsRegistryState: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  controlsLifecycle: false as const,
  capabilitiesInferred: false as const,
  resultsAdvisoryUntilLifecycle: true as const,
} as const;

export type PluginsCapabilitiesIdentity = typeof PLUGINS_CAPABILITIES_IDENTITY;
