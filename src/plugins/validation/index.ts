/**
 * PLUGINS-I7 — Validation barrel (package-internal).
 * Validation certifies. Does not replace Compatibility. Never executes.
 */

export {
  PLUGINS_VALIDATION_PHASE,
  PLUGINS_VALIDATION_STATUS,
  PLUGINS_VALIDATION_FLAGS,
} from "./status";
export type { PluginsValidationStatus } from "./status";

export {
  PLUGINS_VALIDATION_COMPONENT_NAME,
  PLUGINS_VALIDATION_PURPOSE,
  PLUGINS_VALIDATION_IDENTITY,
} from "./identity";
export type { PluginsValidationIdentity } from "./identity";

export type {
  ValidationConcern,
  ValidationOutcome,
  ValidationFinding,
  ValidationDiagnostic,
} from "./descriptors";

export { createEmptyValidationReport } from "./report";
export type { ValidationReport } from "./report";

export { PLUGINS_VALIDATION_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { ValidationDiagnosticsMetadata } from "./diagnostics";

export { certifyCompliance } from "./certify";
export type {
  ValidationCertificationInput,
  ValidationCertificationResult,
} from "./certify";

export { composePluginsValidation } from "./wiring";
export type { PluginsValidationSnapshot } from "./wiring";
