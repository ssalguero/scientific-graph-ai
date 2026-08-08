/**
 * PLUGINS-I4 — Capabilities barrel (package-internal).
 * Capabilities evaluate. Never mutate Registry. Never activate.
 */

export {
  PLUGINS_CAPABILITIES_PHASE,
  PLUGINS_CAPABILITIES_STATUS,
} from "./status";
export type { PluginsCapabilitiesStatus } from "./status";

export {
  PLUGINS_CAPABILITIES_COMPONENT_ID,
  PLUGINS_CAPABILITIES_NAME,
  PLUGINS_CAPABILITIES_PURPOSE,
  PLUGINS_CAPABILITIES_IDENTITY,
} from "./identity";
export type { PluginsCapabilitiesIdentity } from "./identity";

export type {
  CapabilityAvailability,
  CapabilityDescriptor,
  CapabilityEvaluationRecord,
  CapabilityDiagnostic,
} from "./descriptors";

export { createEmptyCapabilityEvaluationState } from "./state";
export type { CapabilityEvaluationState } from "./state";

export { PLUGINS_CAPABILITIES_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { CapabilityDiagnosticsMetadata } from "./diagnostics";

export {
  evaluateRegisteredCapabilities,
  evaluateCapabilityQuery,
} from "./evaluate";
export type { CapabilityEvaluationResult } from "./evaluate";

export { composePluginsCapabilities } from "./wiring";
export type { PluginsCapabilitiesSnapshot } from "./wiring";
