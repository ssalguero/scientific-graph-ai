/**
 * PLUGINS-I4 — Permission Manager identity (C7).
 */

export const PLUGINS_PERMISSIONS_COMPONENT_ID =
  "C7_PermissionManager" as const;
export const PLUGINS_PERMISSIONS_NAME = "Permission Manager" as const;
export const PLUGINS_PERMISSIONS_PURPOSE =
  "Evaluate declared permission intent under least privilege (advisory)" as const;

export const PLUGINS_PERMISSIONS_IDENTITY = {
  componentId: PLUGINS_PERMISSIONS_COMPONENT_ID,
  name: PLUGINS_PERMISSIONS_NAME,
  purpose: PLUGINS_PERMISSIONS_PURPOSE,
  mutatesRegistry: false as const,
  ownsRegistryState: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  controlsLifecycle: false as const,
  leastPrivilege: true as const,
  resultsAdvisoryUntilLifecycle: true as const,
} as const;

export type PluginsPermissionsIdentity = typeof PLUGINS_PERMISSIONS_IDENTITY;
