/**
 * PLUGINS-I8 — Observability identity.
 * Owns aggregation/visibility only — never owns behavior.
 */

export const PLUGINS_OBSERVABILITY_NAME = "Observability Aggregation" as const;
export const PLUGINS_OBSERVABILITY_PURPOSE =
  "Aggregate diagnostics into unified health and status views (read-only)" as const;

export const PLUGINS_OBSERVABILITY_IDENTITY = {
  name: PLUGINS_OBSERVABILITY_NAME,
  purpose: PLUGINS_OBSERVABILITY_PURPOSE,
  phase: "PLUGINS-I8" as const,
  ownsVisibility: true as const,
  ownsBehavior: false as const,
  modifiesDiagnostics: false as const,
  modifiesLifecycle: false as const,
  modifiesRegistry: false as const,
  performsValidation: false as const,
  performsCompatibility: false as const,
  executesPlugins: false as const,
  telemetryBackend: false as const,
  loggingProvider: false as const,
  dashboard: false as const,
  monitoringService: false as const,
} as const;

export type PluginsObservabilityIdentity =
  typeof PLUGINS_OBSERVABILITY_IDENTITY;
