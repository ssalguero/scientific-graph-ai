/**
 * PLUGINS-I4 — Permission Manager status markers (C7).
 * Permissions evaluate. They never mutate Registry or activate plugins.
 */

export const PLUGINS_PERMISSIONS_PHASE = "PLUGINS-I4" as const;
export const PLUGINS_PERMISSIONS_STATUS = "PERMISSIONS_IMPLEMENTED" as const;
export type PluginsPermissionsStatus = typeof PLUGINS_PERMISSIONS_STATUS;
