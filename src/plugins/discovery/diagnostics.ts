/**
 * PLUGINS-I3 — Discovery diagnostics metadata.
 */

export const PLUGINS_DISCOVERY_DIAGNOSTICS_METADATA = {
  __kind: "DiscoveryDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesCapabilities: false as const,
  executesPlugins: false as const,
  mutatesRegistry: false as const,
} as const;

export type DiscoveryDiagnosticsMetadata =
  typeof PLUGINS_DISCOVERY_DIAGNOSTICS_METADATA;
