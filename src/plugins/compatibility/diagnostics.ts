/**
 * PLUGINS-I7 — Compatibility diagnostics metadata.
 */

export const PLUGINS_COMPATIBILITY_DIAGNOSTICS_METADATA = {
  __kind: "CompatibilityDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  mutatesRegistry: false as const,
  mutatesLifecycle: false as const,
  executesPlugins: false as const,
  resultsAdvisory: true as const,
} as const;

export type CompatibilityDiagnosticsMetadata =
  typeof PLUGINS_COMPATIBILITY_DIAGNOSTICS_METADATA;
