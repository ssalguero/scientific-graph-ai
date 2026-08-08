/**
 * PLUGINS-I5 — Public Contract Infrastructure status markers.
 * Contracts expose. They never evaluate, mutate, activate, or execute.
 */

export const PLUGINS_CONTRACTS_PHASE = "PLUGINS-I5" as const;
export const PLUGINS_CONTRACTS_STATUS =
  "PUBLIC_CONTRACT_INFRASTRUCTURE_IMPLEMENTED" as const;
export type PluginsContractsStatus = typeof PLUGINS_CONTRACTS_STATUS;

export const PLUGINS_CONTRACTS_FLAGS = {
  publicContractsImplemented: true,
  publicContractsExposeOnlyCertifiedSurface: true,
  registryInternalsExposed: false,
  activationImplemented: false,
  lifecycleImplemented: false,
  pluginExecutionImplemented: false,
} as const;
