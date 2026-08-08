/**
 * PLUGINS-I1 — Extension Framework phase markers.
 * Structural framework only. No plugin runtime.
 */

export const PLUGINS_FRAMEWORK_PHASE = "PLUGINS-I1" as const;

export const PLUGINS_FRAMEWORK_STATUS = "FRAMEWORK_COMPLETE" as const;

export type PluginsFrameworkStatus = typeof PLUGINS_FRAMEWORK_STATUS;
