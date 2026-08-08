/**
 * PLUGINS-I4 — Capability composition.
 */

import { PLUGINS_CAPABILITIES_DIAGNOSTICS_METADATA } from "../diagnostics";
import {
  evaluateCapabilityQuery,
  evaluateRegisteredCapabilities,
} from "../evaluate";
import { PLUGINS_CAPABILITIES_IDENTITY } from "../identity";
import { createEmptyCapabilityEvaluationState } from "../state";
import {
  PLUGINS_CAPABILITIES_PHASE,
  PLUGINS_CAPABILITIES_STATUS,
} from "../status";

export type PluginsCapabilitiesSnapshot = {
  readonly phase: typeof PLUGINS_CAPABILITIES_PHASE;
  readonly status: typeof PLUGINS_CAPABILITIES_STATUS;
  readonly componentId: typeof PLUGINS_CAPABILITIES_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_CAPABILITIES_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_CAPABILITIES_DIAGNOSTICS_METADATA;
  readonly emptyState: ReturnType<typeof createEmptyCapabilityEvaluationState>;
  readonly evaluateRegistered: typeof evaluateRegisteredCapabilities;
  readonly evaluateQuery: typeof evaluateCapabilityQuery;
  readonly capabilitiesImplemented: true;
  readonly permissionsImplemented: false;
  readonly capabilitiesReadOnly: true;
  readonly registryMutationOnlyViaRegistry: true;
  readonly activationImplemented: false;
  readonly lifecycleImplemented: false;
  readonly pluginExecutionImplemented: false;
  readonly mutatesRegistry: false;
};

export function composePluginsCapabilities(): PluginsCapabilitiesSnapshot {
  return {
    phase: PLUGINS_CAPABILITIES_PHASE,
    status: PLUGINS_CAPABILITIES_STATUS,
    componentId: PLUGINS_CAPABILITIES_IDENTITY.componentId,
    identity: PLUGINS_CAPABILITIES_IDENTITY,
    diagnosticsMetadata: PLUGINS_CAPABILITIES_DIAGNOSTICS_METADATA,
    emptyState: createEmptyCapabilityEvaluationState(),
    evaluateRegistered: evaluateRegisteredCapabilities,
    evaluateQuery: evaluateCapabilityQuery,
    capabilitiesImplemented: true,
    permissionsImplemented: false,
    capabilitiesReadOnly: true,
    registryMutationOnlyViaRegistry: true,
    activationImplemented: false,
    lifecycleImplemented: false,
    pluginExecutionImplemented: false,
    mutatesRegistry: false,
  };
}
