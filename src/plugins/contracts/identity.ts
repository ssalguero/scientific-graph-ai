/**
 * PLUGINS-I5 — Public Contract Infrastructure identity.
 * Authority: PLUGINS-P4 Contract Freeze · PLUGINS-P6 I5.
 */

export const PLUGINS_CONTRACTS_COMPONENT_NAME =
  "Public Contract Infrastructure" as const;
export const PLUGINS_CONTRACTS_PURPOSE =
  "Expose certified Public Plugin Contract surfaces via adapters; never leak internals" as const;

export const PLUGINS_CONTRACTS_IDENTITY = {
  name: PLUGINS_CONTRACTS_COMPONENT_NAME,
  purpose: PLUGINS_CONTRACTS_PURPOSE,
  phase: "PLUGINS-I5" as const,
  evaluatesCapabilities: false as const,
  evaluatesPermissions: false as const,
  mutatesRegistry: false as const,
  activatesPlugins: false as const,
  executesPlugins: false as const,
  exposesRegistryInternals: false as const,
  exposesFrameworkInternals: false as const,
  exposesStoreImplementations: false as const,
  resultsAdvisoryOnly: true as const,
  lifecycleIsFirstConsumer: true as const,
} as const;

export type PluginsContractsIdentity = typeof PLUGINS_CONTRACTS_IDENTITY;
