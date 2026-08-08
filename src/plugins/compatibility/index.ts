/**
 * PLUGINS-I7 — Compatibility barrel (package-internal).
 * Compatibility verifies. Never mutates. Never executes.
 */

export {
  PLUGINS_COMPATIBILITY_PHASE,
  PLUGINS_COMPATIBILITY_STATUS,
  PLUGINS_COMPATIBILITY_FLAGS,
} from "./status";
export type { PluginsCompatibilityStatus } from "./status";

export {
  PLUGINS_COMPATIBILITY_COMPONENT_ID,
  PLUGINS_COMPATIBILITY_NAME,
  PLUGINS_COMPATIBILITY_PURPOSE,
  PLUGINS_COMPATIBILITY_IDENTITY,
} from "./identity";
export type { PluginsCompatibilityIdentity } from "./identity";

export type {
  CompatibilityDimension,
  CompatibilityStatus,
  CompatibilityFinding,
  CompatibilityDiagnostic,
} from "./descriptors";

export { createEmptyCompatibilityReport } from "./report";
export type { CompatibilityReport } from "./report";

export { PLUGINS_COMPATIBILITY_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { CompatibilityDiagnosticsMetadata } from "./diagnostics";

export { evaluateCompatibility } from "./evaluate";
export type { CompatibilityEvaluationResult } from "./evaluate";

export { composePluginsCompatibility } from "./wiring";
export type { PluginsCompatibilitySnapshot } from "./wiring";
