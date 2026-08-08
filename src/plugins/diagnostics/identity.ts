/**
 * PLUGINS-I8 — Diagnostics Service identity (C9).
 */

export const PLUGINS_DIAGNOSTICS_COMPONENT_ID =
  "C9_DiagnosticsService" as const;
export const PLUGINS_DIAGNOSTICS_NAME = "Diagnostics Service" as const;
export const PLUGINS_DIAGNOSTICS_PURPOSE =
  "Expose structural / lifecycle / compatibility / validation diagnostics (read-only)" as const;

export const PLUGINS_DIAGNOSTICS_IDENTITY = {
  componentId: PLUGINS_DIAGNOSTICS_COMPONENT_ID,
  name: PLUGINS_DIAGNOSTICS_NAME,
  purpose: PLUGINS_DIAGNOSTICS_PURPOSE,
  mutatesRegistry: false as const,
  mutatesLifecycle: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  ownsReporting: true as const,
  ownsBehavior: false as const,
} as const;

export type PluginsDiagnosticsIdentity = typeof PLUGINS_DIAGNOSTICS_IDENTITY;
