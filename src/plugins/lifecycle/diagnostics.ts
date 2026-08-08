/**
 * PLUGINS-I6 — Lifecycle diagnostics metadata.
 */

export const PLUGINS_LIFECYCLE_DIAGNOSTICS_METADATA = {
  __kind: "LifecycleDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  mutatesRegistry: false as const,
  executesPlugins: false as const,
  consumesPublicContractsOnly: true as const,
  activeMeansExecution: false as const,
} as const;

export type LifecycleDiagnosticsMetadata =
  typeof PLUGINS_LIFECYCLE_DIAGNOSTICS_METADATA;
