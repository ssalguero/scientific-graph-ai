/**
 * PLUGINS-I4 — Permission composition.
 */

import { PLUGINS_PERMISSIONS_DIAGNOSTICS_METADATA } from "../diagnostics";
import { evaluatePermissionIntents } from "../evaluate";
import { PLUGINS_PERMISSIONS_IDENTITY } from "../identity";
import { createEmptyPermissionEvaluationState } from "../state";
import {
  PLUGINS_PERMISSIONS_PHASE,
  PLUGINS_PERMISSIONS_STATUS,
} from "../status";

export type PluginsPermissionsSnapshot = {
  readonly phase: typeof PLUGINS_PERMISSIONS_PHASE;
  readonly status: typeof PLUGINS_PERMISSIONS_STATUS;
  readonly componentId: typeof PLUGINS_PERMISSIONS_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_PERMISSIONS_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_PERMISSIONS_DIAGNOSTICS_METADATA;
  readonly emptyState: ReturnType<typeof createEmptyPermissionEvaluationState>;
  readonly evaluateIntents: typeof evaluatePermissionIntents;
  readonly capabilitiesImplemented: true;
  readonly permissionsImplemented: true;
  readonly permissionsReadOnly: true;
  readonly capabilitiesReadOnly: true;
  readonly registryMutationOnlyViaRegistry: true;
  readonly activationImplemented: false;
  readonly lifecycleImplemented: false;
  readonly pluginExecutionImplemented: false;
  readonly mutatesRegistry: false;
};

export function composePluginsPermissions(): PluginsPermissionsSnapshot {
  return {
    phase: PLUGINS_PERMISSIONS_PHASE,
    status: PLUGINS_PERMISSIONS_STATUS,
    componentId: PLUGINS_PERMISSIONS_IDENTITY.componentId,
    identity: PLUGINS_PERMISSIONS_IDENTITY,
    diagnosticsMetadata: PLUGINS_PERMISSIONS_DIAGNOSTICS_METADATA,
    emptyState: createEmptyPermissionEvaluationState(),
    evaluateIntents: evaluatePermissionIntents,
    capabilitiesImplemented: true,
    permissionsImplemented: true,
    permissionsReadOnly: true,
    capabilitiesReadOnly: true,
    registryMutationOnlyViaRegistry: true,
    activationImplemented: false,
    lifecycleImplemented: false,
    pluginExecutionImplemented: false,
    mutatesRegistry: false,
  };
}
