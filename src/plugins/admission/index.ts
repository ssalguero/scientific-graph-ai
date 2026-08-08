/**
 * PLUGINS-I3 — Admission layer (Discovery + Registration aggregate).
 *
 * Architectural rule:
 *   Discovery discovers → Registration requests → Registry owns.
 */

export {
  PLUGINS_DISCOVERY_PHASE,
  PLUGINS_DISCOVERY_STATUS,
} from "../discovery/status";

export {
  PLUGINS_REGISTRATION_PHASE,
  PLUGINS_REGISTRATION_STATUS,
} from "../registration/status";

export const PLUGINS_ADMISSION_PHASE = "PLUGINS-I3" as const;
export const PLUGINS_ADMISSION_STATUS =
  "DISCOVERY_AND_REGISTRATION_IMPLEMENTED" as const;
export type PluginsAdmissionStatus = typeof PLUGINS_ADMISSION_STATUS;

export const PLUGINS_ADMISSION_FLAGS = {
  discoveryImplemented: true,
  registrationImplemented: true,
  registryMutationOnlyViaRegistry: true,
  pluginLoadingImplemented: false,
  activationImplemented: false,
  lifecycleImplemented: false,
  capabilitiesImplemented: false,
} as const;
