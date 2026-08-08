/**
 * PLUGINS-I5 — Public Contract diagnostics metadata.
 */

export const PLUGINS_CONTRACTS_DIAGNOSTICS_METADATA = {
  __kind: "PublicContractDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  mutatesRegistry: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  exposesRegistryInternals: false as const,
  advisoryExposureOnly: true as const,
} as const;

export type PublicContractDiagnosticsMetadata =
  typeof PLUGINS_CONTRACTS_DIAGNOSTICS_METADATA;
