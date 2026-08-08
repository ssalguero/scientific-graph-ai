/**
 * PLUGINS-I3 — Registration barrel (package-internal).
 * Registration requests. Registry owns.
 */

export {
  PLUGINS_REGISTRATION_PHASE,
  PLUGINS_REGISTRATION_STATUS,
} from "./status";
export type { PluginsRegistrationStatus } from "./status";

export {
  PLUGINS_REGISTRATION_COMPONENT_ID,
  PLUGINS_REGISTRATION_NAME,
  PLUGINS_REGISTRATION_PURPOSE,
  PLUGINS_REGISTRATION_IDENTITY,
} from "./identity";
export type { PluginsRegistrationIdentity } from "./identity";

export type {
  PluginRegistrationDescriptor,
  RegistrationDiagnostic,
  RegistrationResult,
  RegistrationSuccess,
  RegistrationFailure,
} from "./descriptors";

export { createEmptyRegistrationState } from "./state";
export type { RegistrationState } from "./state";

export { PLUGINS_REGISTRATION_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { RegistrationDiagnosticsMetadata } from "./diagnostics";

export { requestPluginRegistration } from "./register";

export { composePluginsRegistration } from "./wiring";
export type { PluginsRegistrationSnapshot } from "./wiring";
