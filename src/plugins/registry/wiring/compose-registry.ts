/**
 * PLUGINS-I2/I3 — Registry composition.
 *
 * I2: infrastructure snapshot. I3: includes Registration Service reference.
 * Discovery never appears here. No plugin loading / activation.
 */

import {
  PLUGINS_REGISTRY_DESCRIPTOR_DISCOVERABLE_IN_I2,
  PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_IN_I2,
  PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_VIA_SERVICE,
} from "../descriptors";
import { PLUGINS_PLUGIN_REGISTRY_IDENTITY } from "../identity";
import { PLUGINS_REGISTRY_DIAGNOSTICS_METADATA } from "../metadata";
import { PLUGINS_REGISTRY_NAMESPACES } from "../namespaces";
import {
  PLUGINS_REGISTRY_FACETS,
  PLUGINS_REGISTRY_OWNERSHIP,
} from "../ownership";
import {
  createPluginRegistryRegistrationService,
  type PluginRegistryRegistrationService,
} from "../registration-service";
import { registryStoreGetState } from "../store";
import {
  PLUGINS_REGISTRY_MUTATION_ONLY_VIA_REGISTRY,
  PLUGINS_REGISTRY_PHASE,
  PLUGINS_REGISTRY_STATUS,
} from "../status";

export type PluginsRegistryInfrastructureSnapshot = {
  readonly phase: typeof PLUGINS_REGISTRY_PHASE;
  readonly status: typeof PLUGINS_REGISTRY_STATUS;
  readonly componentId: typeof PLUGINS_PLUGIN_REGISTRY_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_PLUGIN_REGISTRY_IDENTITY;
  readonly ownership: typeof PLUGINS_REGISTRY_OWNERSHIP;
  readonly facets: typeof PLUGINS_REGISTRY_FACETS;
  readonly namespaces: typeof PLUGINS_REGISTRY_NAMESPACES;
  readonly state: ReturnType<typeof registryStoreGetState>;
  readonly diagnosticsMetadata: typeof PLUGINS_REGISTRY_DIAGNOSTICS_METADATA;
  readonly registrationService: PluginRegistryRegistrationService;
  readonly registryInfrastructureComplete: true;
  /** Registry does not discover — Discovery subsystem owns that. */
  readonly discoveryImplemented: false;
  /** Registration subsystem requests; this service accepts incorporation. */
  readonly registrationServiceImplemented: true;
  /** Full Registration subsystem lives under registration/ (I3). */
  readonly registrationImplemented: false;
  readonly pluginLoadingImplemented: false;
  readonly activationImplemented: false;
  readonly lifecycleImplemented: false;
  readonly capabilitiesImplemented: false;
  /** No activate/load/execute ops — registration-via-service only. */
  readonly executableRegistryOperations: false;
  readonly runtimeBehavior: false;
  readonly registryMutationOnlyViaRegistry: typeof PLUGINS_REGISTRY_MUTATION_ONLY_VIA_REGISTRY;
  readonly descriptorRegistrable: typeof PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_IN_I2;
  readonly descriptorDiscoverable: typeof PLUGINS_REGISTRY_DESCRIPTOR_DISCOVERABLE_IN_I2;
  readonly descriptorRegistrableViaService: typeof PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_VIA_SERVICE;
};

/**
 * Compose Registry Infrastructure snapshot.
 * Deterministic structure. State reflects Registry-owned store.
 * No Discovery. No activation. No plugin execution.
 */
export function composePluginsRegistryInfrastructure(): PluginsRegistryInfrastructureSnapshot {
  return {
    phase: PLUGINS_REGISTRY_PHASE,
    status: PLUGINS_REGISTRY_STATUS,
    componentId: PLUGINS_PLUGIN_REGISTRY_IDENTITY.componentId,
    identity: PLUGINS_PLUGIN_REGISTRY_IDENTITY,
    ownership: PLUGINS_REGISTRY_OWNERSHIP,
    facets: PLUGINS_REGISTRY_FACETS,
    namespaces: PLUGINS_REGISTRY_NAMESPACES,
    state: registryStoreGetState(),
    diagnosticsMetadata: PLUGINS_REGISTRY_DIAGNOSTICS_METADATA,
    registrationService: createPluginRegistryRegistrationService(),
    registryInfrastructureComplete: true,
    discoveryImplemented: false,
    registrationServiceImplemented: true,
    registrationImplemented: false,
    pluginLoadingImplemented: false,
    activationImplemented: false,
    lifecycleImplemented: false,
    capabilitiesImplemented: false,
    executableRegistryOperations: false,
    runtimeBehavior: false,
    registryMutationOnlyViaRegistry: PLUGINS_REGISTRY_MUTATION_ONLY_VIA_REGISTRY,
    descriptorRegistrable: PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_IN_I2,
    descriptorDiscoverable: PLUGINS_REGISTRY_DESCRIPTOR_DISCOVERABLE_IN_I2,
    descriptorRegistrableViaService: PLUGINS_REGISTRY_DESCRIPTOR_REGISTRABLE_VIA_SERVICE,
  };
}
