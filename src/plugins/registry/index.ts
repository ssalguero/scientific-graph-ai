/**
 * PLUGINS-I2/I3 — Registry Infrastructure barrel (package-internal).
 *
 * Consumers outside PLUGINS must not import this module.
 * Mutation of registry state: Registration Service only.
 */

export {
  PLUGINS_REGISTRY_PHASE,
  PLUGINS_REGISTRY_STATUS,
  PLUGINS_REGISTRY_MUTATION_ONLY_VIA_REGISTRY,
} from "./status";
export type { PluginsRegistryStatus } from "./status";

export {
  PLUGINS_PLUGIN_REGISTRY_COMPONENT_ID,
  PLUGINS_PLUGIN_REGISTRY_NAME,
  PLUGINS_PLUGIN_REGISTRY_PURPOSE,
  PLUGINS_PLUGIN_REGISTRY_PRIMARY_RESPONSIBILITY,
  PLUGINS_PLUGIN_REGISTRY_IS_PUBLIC_EXTENSIBILITY_SURFACE,
  PLUGINS_PLUGIN_REGISTRY_OWNS_EXTENSION_POINTS,
  PLUGINS_PLUGIN_REGISTRY_IDENTITY,
} from "./identity";
export type { PluginsPluginRegistryIdentity } from "./identity";

export {
  PLUGINS_REGISTRY_OWNERSHIP,
  PLUGINS_REGISTRY_FACETS,
} from "./ownership";
export type {
  PluginsRegistryOwnership,
  PluginsRegistryFacet,
} from "./ownership";

export { PLUGINS_REGISTRY_NAMESPACES } from "./namespaces";
export type { PluginsRegistryNamespace } from "./namespaces";

export {
  PLUGINS_EMPTY_PLUGIN_REGISTRY_STATE,
  createPluginRegistryState,
} from "./state";
export type { PluginRegistryState, PluginRegistryEntry } from "./state";

export type {
  PluginRegistryDescriptor,
  ExtensionPointReferenceDescriptor,
} from "./descriptors";
export {
  PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_IN_I2,
  PLUGINS_REGISTRY_DESCRIPTOR_DISCOVERABLE_IN_I2,
  PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_VIA_SERVICE,
} from "./descriptors";

export { PLUGINS_REGISTRY_DIAGNOSTICS_METADATA } from "./metadata";
export type { PluginRegistryDiagnosticsMetadata } from "./metadata";

export {
  createPluginRegistryRegistrationService,
} from "./registration-service";
export type {
  PluginRegistryRegistrationService,
  RegistryRegistrationRequest,
  RegistryRegistrationResult,
} from "./registration-service";

export { createPluginRegistryReadView } from "./read-view";
export type { PluginRegistryReadView } from "./read-view";

export { composePluginsRegistryInfrastructure } from "./wiring";
export type { PluginsRegistryInfrastructureSnapshot } from "./wiring";
