/**
 * PLUGINS-I8 — Diagnostics barrel (package-internal).
 * Diagnostics observe. Never mutate. Never decide.
 */

export {
  PLUGINS_DIAGNOSTICS_PHASE,
  PLUGINS_DIAGNOSTICS_STATUS,
  PLUGINS_DIAGNOSTICS_FLAGS,
} from "./status";
export type { PluginsDiagnosticsStatus } from "./status";

export {
  PLUGINS_DIAGNOSTICS_COMPONENT_ID,
  PLUGINS_DIAGNOSTICS_NAME,
  PLUGINS_DIAGNOSTICS_PURPOSE,
  PLUGINS_DIAGNOSTICS_IDENTITY,
} from "./identity";
export type { PluginsDiagnosticsIdentity } from "./identity";

export type {
  DiagnosticSubsystem,
  DiagnosticSeverity,
  DiagnosticEntry,
  DiagnosticAdapterId,
} from "./descriptors";

export {
  createEmptyDiagnosticBundle,
  summarizeBySubsystem,
} from "./models";
export type { ComponentHealth, DiagnosticBundle } from "./models";

export { PLUGINS_DIAGNOSTICS_SERVICE_METADATA } from "./metadata";
export type { DiagnosticsServiceMetadata } from "./metadata";

export {
  adaptStructuralStatusDiagnostics,
  adaptCompatibilityReportDiagnostics,
  adaptValidationReportDiagnostics,
  adaptLifecycleRecordDiagnostics,
} from "./adapters";

export { collectDiagnostics } from "./collect";
export type { DiagnosticsCollectInput } from "./collect";

export { composePluginsDiagnostics } from "./wiring";
export type { PluginsDiagnosticsSnapshot } from "./wiring";
