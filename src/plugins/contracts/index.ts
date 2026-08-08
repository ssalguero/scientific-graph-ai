/**
 * PLUGINS-I5 — Public Contract Infrastructure barrel (package-internal).
 *
 * Exposes adapters, views, and status. Does not re-export Registry Store,
 * Registration Service, Framework wiring, or evaluation engines.
 *
 * Consumers outside PLUGINS must not import this module — use `@/plugins`
 * status markers only until Lifecycle (I6) is authorized as first consumer.
 */

export {
  PLUGINS_CONTRACTS_PHASE,
  PLUGINS_CONTRACTS_STATUS,
  PLUGINS_CONTRACTS_FLAGS,
} from "./status";
export type { PluginsContractsStatus } from "./status";

export {
  PLUGINS_CONTRACTS_COMPONENT_NAME,
  PLUGINS_CONTRACTS_PURPOSE,
  PLUGINS_CONTRACTS_IDENTITY,
} from "./identity";
export type { PluginsContractsIdentity } from "./identity";

export {
  PLUGINS_PUBLIC_CONTRACT_CATEGORIES,
  PLUGINS_PUBLIC_PLUGIN_CONTRACT_ID,
  PLUGINS_PUBLIC_CONTRACT_V1_SELECTION_DEFERRED,
} from "./catalog";
export type { PublicPluginContractCategory } from "./catalog";

export type {
  PublicContractDescriptor,
  PublicContractMetadata,
  PublicContractDiagnostic,
} from "./descriptors";

export type {
  PublicRegisteredPluginView,
  PublicCapabilityAdvisoryView,
  PublicPermissionAdvisoryView,
  PublicPluginContractView,
} from "./views";

export { PLUGINS_CONTRACTS_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { PublicContractDiagnosticsMetadata } from "./diagnostics";

export {
  projectRegistryReadView,
  projectCapabilityAdvisories,
  projectPermissionAdvisories,
  adaptToPublicPluginContract,
} from "./adapter";
export type { PublicContractAdapterOptions } from "./adapter";

export { composePluginsPublicContracts } from "./wiring";
export type { PluginsContractsSnapshot } from "./wiring";
