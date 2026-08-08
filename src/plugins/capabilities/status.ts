/**
 * PLUGINS-I4 — Capability Manager status markers (C6).
 * Capabilities evaluate. They never mutate Registry or activate plugins.
 */

export const PLUGINS_CAPABILITIES_PHASE = "PLUGINS-I4" as const;
export const PLUGINS_CAPABILITIES_STATUS = "CAPABILITIES_IMPLEMENTED" as const;
export type PluginsCapabilitiesStatus = typeof PLUGINS_CAPABILITIES_STATUS;
