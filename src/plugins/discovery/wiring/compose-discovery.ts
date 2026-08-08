/**
 * PLUGINS-I3 — Discovery composition (structural + operational flags).
 */

import { PLUGINS_DISCOVERY_DIAGNOSTICS_METADATA } from "../diagnostics";
import { discoverPluginCandidates } from "../discover";
import { PLUGINS_DISCOVERY_IDENTITY } from "../identity";
import { createEmptyDiscoveryState } from "../state";
import {
  PLUGINS_DISCOVERY_PHASE,
  PLUGINS_DISCOVERY_STATUS,
} from "../status";

export type PluginsDiscoverySnapshot = {
  readonly phase: typeof PLUGINS_DISCOVERY_PHASE;
  readonly status: typeof PLUGINS_DISCOVERY_STATUS;
  readonly componentId: typeof PLUGINS_DISCOVERY_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_DISCOVERY_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_DISCOVERY_DIAGNOSTICS_METADATA;
  readonly emptyState: ReturnType<typeof createEmptyDiscoveryState>;
  readonly discover: typeof discoverPluginCandidates;
  readonly discoveryImplemented: true;
  readonly registrationImplemented: false;
  readonly registryMutationOnlyViaRegistry: true;
  readonly pluginLoadingImplemented: false;
  readonly activationImplemented: false;
  readonly lifecycleImplemented: false;
  readonly capabilitiesImplemented: false;
  readonly mutatesRegistryDirectly: false;
};

export function composePluginsDiscovery(): PluginsDiscoverySnapshot {
  return {
    phase: PLUGINS_DISCOVERY_PHASE,
    status: PLUGINS_DISCOVERY_STATUS,
    componentId: PLUGINS_DISCOVERY_IDENTITY.componentId,
    identity: PLUGINS_DISCOVERY_IDENTITY,
    diagnosticsMetadata: PLUGINS_DISCOVERY_DIAGNOSTICS_METADATA,
    emptyState: createEmptyDiscoveryState(),
    discover: discoverPluginCandidates,
    discoveryImplemented: true,
    registrationImplemented: false,
    registryMutationOnlyViaRegistry: true,
    pluginLoadingImplemented: false,
    activationImplemented: false,
    lifecycleImplemented: false,
    capabilitiesImplemented: false,
    mutatesRegistryDirectly: false,
  };
}
