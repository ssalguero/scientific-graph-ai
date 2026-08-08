/**
 * PLUGINS-I2 — Registry diagnostics metadata (structural only).
 * No diagnostics runtime (I8). Observability markers for future C9 association.
 */

export type PluginRegistryDiagnosticsMetadata = {
  readonly __kind: "PluginRegistryDiagnosticsMetadata";
  readonly __runtimeDiagnostics: false;
  readonly infrastructureComplete: true;
  readonly emptyState: true;
  readonly notes: "Passive registry; no operational diagnostics in I2";
};

export const PLUGINS_REGISTRY_DIAGNOSTICS_METADATA: PluginRegistryDiagnosticsMetadata =
  {
    __kind: "PluginRegistryDiagnosticsMetadata",
    __runtimeDiagnostics: false,
    infrastructureComplete: true,
    emptyState: true,
    notes: "Passive registry; no operational diagnostics in I2",
  };
