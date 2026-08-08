/**
 * PLUGINS-I3 — Registration composition.
 */

import { createPluginRegistryRegistrationService } from "../../registry/registration-service";
import { PLUGINS_REGISTRATION_DIAGNOSTICS_METADATA } from "../diagnostics";
import { PLUGINS_REGISTRATION_IDENTITY } from "../identity";
import { requestPluginRegistration } from "../register";
import { createEmptyRegistrationState } from "../state";
import {
  PLUGINS_REGISTRATION_PHASE,
  PLUGINS_REGISTRATION_STATUS,
} from "../status";

export type PluginsRegistrationSnapshot = {
  readonly phase: typeof PLUGINS_REGISTRATION_PHASE;
  readonly status: typeof PLUGINS_REGISTRATION_STATUS;
  readonly componentId: typeof PLUGINS_REGISTRATION_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_REGISTRATION_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_REGISTRATION_DIAGNOSTICS_METADATA;
  readonly emptyState: ReturnType<typeof createEmptyRegistrationState>;
  readonly requestRegistration: typeof requestPluginRegistration;
  readonly createRegistryService: typeof createPluginRegistryRegistrationService;
  readonly discoveryImplemented: true;
  readonly registrationImplemented: true;
  readonly registryMutationOnlyViaRegistry: true;
  readonly pluginLoadingImplemented: false;
  readonly activationImplemented: false;
  readonly lifecycleImplemented: false;
  readonly capabilitiesImplemented: false;
  readonly ownsRegistryState: false;
};

export function composePluginsRegistration(): PluginsRegistrationSnapshot {
  return {
    phase: PLUGINS_REGISTRATION_PHASE,
    status: PLUGINS_REGISTRATION_STATUS,
    componentId: PLUGINS_REGISTRATION_IDENTITY.componentId,
    identity: PLUGINS_REGISTRATION_IDENTITY,
    diagnosticsMetadata: PLUGINS_REGISTRATION_DIAGNOSTICS_METADATA,
    emptyState: createEmptyRegistrationState(),
    requestRegistration: requestPluginRegistration,
    createRegistryService: createPluginRegistryRegistrationService,
    discoveryImplemented: true,
    registrationImplemented: true,
    registryMutationOnlyViaRegistry: true,
    pluginLoadingImplemented: false,
    activationImplemented: false,
    lifecycleImplemented: false,
    capabilitiesImplemented: false,
    ownsRegistryState: false,
  };
}
