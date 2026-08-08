/**
 * PLUGINS-I4 — Permission diagnostics metadata.
 */

export const PLUGINS_PERMISSIONS_DIAGNOSTICS_METADATA = {
  __kind: "PermissionDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesPermissions: true as const,
  mutatesRegistry: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  leastPrivilege: true as const,
  resultsAdvisory: true as const,
} as const;

export type PermissionDiagnosticsMetadata =
  typeof PLUGINS_PERMISSIONS_DIAGNOSTICS_METADATA;
