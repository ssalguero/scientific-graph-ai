/**
 * PLUGINS-I7 — Validation diagnostics metadata.
 */

export const PLUGINS_VALIDATION_DIAGNOSTICS_METADATA = {
  __kind: "ValidationDiagnosticsMetadata" as const,
  reportsStructuralIssues: true as const,
  replacesCompatibility: false as const,
  reEvaluatesCompatibility: false as const,
  mutatesRegistry: false as const,
  mutatesLifecycle: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
} as const;

export type ValidationDiagnosticsMetadata =
  typeof PLUGINS_VALIDATION_DIAGNOSTICS_METADATA;
