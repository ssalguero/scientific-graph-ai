/**
 * PLUGINS-I4 — Capability diagnostics metadata.
 */

export const PLUGINS_CAPABILITIES_DIAGNOSTICS_METADATA = {
  __kind: "CapabilityDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesCapabilities: true as const,
  mutatesRegistry: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  resultsAdvisory: true as const,
} as const;

export type CapabilityDiagnosticsMetadata =
  typeof PLUGINS_CAPABILITIES_DIAGNOSTICS_METADATA;
