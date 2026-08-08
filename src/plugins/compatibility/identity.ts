/**
 * PLUGINS-I7 — Compatibility Validator identity (C8).
 */

export const PLUGINS_COMPATIBILITY_COMPONENT_ID =
  "C8_CompatibilityValidator" as const;
export const PLUGINS_COMPATIBILITY_NAME = "Compatibility Validator" as const;
export const PLUGINS_COMPATIBILITY_PURPOSE =
  "Evaluate structural / version / contract / platform compatibility (advisory)" as const;

export const PLUGINS_COMPATIBILITY_IDENTITY = {
  componentId: PLUGINS_COMPATIBILITY_COMPONENT_ID,
  name: PLUGINS_COMPATIBILITY_NAME,
  purpose: PLUGINS_COMPATIBILITY_PURPOSE,
  mutatesRegistry: false as const,
  mutatesLifecycle: false as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  resultsAdvisoryUntilValidation: true as const,
} as const;

export type PluginsCompatibilityIdentity =
  typeof PLUGINS_COMPATIBILITY_IDENTITY;
