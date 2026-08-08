/**
 * PLUGINS-I5 — Public Plugin Contract category catalog (P4).
 *
 * Taxonomy prepared; V1 selection deferred (Charter / P4).
 * Categories designate conceptual contract families — not V1 lock.
 */

export const PLUGINS_PUBLIC_CONTRACT_CATEGORIES = [
  "ExtensionPointContracts",
  "CapabilityContracts",
  "RegistrationContracts",
  "ValidationContracts",
  "DiagnosticsContracts",
  "CompatibilityContracts",
  "FutureSdkContracts",
] as const;

export type PublicPluginContractCategory =
  (typeof PLUGINS_PUBLIC_CONTRACT_CATEGORIES)[number];

/** Designated infrastructure contract id for the PLUGINS public exposure surface (I5). */
export const PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID =
  "plugins.public-plugin-contract.v0" as const;

export const PLUGINS_PUBLIC_CONTRACT_V1_SELECTION_DEFERRED = true as const;
