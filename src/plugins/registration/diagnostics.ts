/**
 * PLUGINS-I3 — Registration diagnostics metadata.
 */

export const PLUGINS_REGISTRATION_DIAGNOSTICS_METADATA = {
  __kind: "RegistrationDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  evaluatesCapabilities: false as const,
  executesPlugins: false as const,
  ownsRegistryState: false as const,
  requestsRegistryIncorporation: true as const,
} as const;

export type RegistrationDiagnosticsMetadata =
  typeof PLUGINS_REGISTRATION_DIAGNOSTICS_METADATA;
