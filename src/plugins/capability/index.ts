/**
 * PLUGINS-I4 — Capability layer aggregate (Capabilities + Permissions).
 *
 * Architectural rule:
 *   Capabilities evaluate. Registration admits. Registry stores. Lifecycle governs execution.
 */

export {
  PLUGINS_CAPABILITIES_PHASE,
  PLUGINS_CAPABILITIES_STATUS,
} from "../capabilities/status";

export {
  PLUGINS_PERMISSIONS_PHASE,
  PLUGINS_PERMISSIONS_STATUS,
} from "../permissions/status";

export const PLUGINS_CAPABILITY_PHASE = "PLUGINS-I4" as const;
export const PLUGINS_CAPABILITY_STATUS =
  "CAPABILITY_AND_PERMISSION_SYSTEM_IMPLEMENTED" as const;
export type PluginsCapabilityLayerStatus = typeof PLUGINS_CAPABILITY_STATUS;

export const PLUGINS_CAPABILITY_FLAGS = {
  capabilitiesImplemented: true,
  permissionsImplemented: true,
  capabilitiesReadOnly: true,
  permissionsReadOnly: true,
  registryMutationOnlyViaRegistry: true,
  activationImplemented: false,
  lifecycleImplemented: false,
  pluginExecutionImplemented: false,
} as const;
