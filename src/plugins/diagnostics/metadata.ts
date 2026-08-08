/**
 * PLUGINS-I8 — Diagnostics metadata.
 */

export const PLUGINS_DIAGNOSTICS_SERVICE_METADATA = {
  __kind: "DiagnosticsServiceMetadata" as const,
  descriptiveOnly: true as const,
  mutatesRegistry: false as const,
  mutatesLifecycle: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  telemetryBackend: false as const,
  loggingProvider: false as const,
  dashboard: false as const,
} as const;

export type DiagnosticsServiceMetadata =
  typeof PLUGINS_DIAGNOSTICS_SERVICE_METADATA;
