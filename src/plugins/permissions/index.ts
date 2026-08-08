/**
 * PLUGINS-I4 — Permissions barrel (package-internal).
 * Permissions evaluate. Never mutate Registry. Never activate.
 */

export {
  PLUGINS_PERMISSIONS_PHASE,
  PLUGINS_PERMISSIONS_STATUS,
} from "./status";
export type { PluginsPermissionsStatus } from "./status";

export {
  PLUGINS_PERMISSIONS_COMPONENT_ID,
  PLUGINS_PERMISSIONS_NAME,
  PLUGINS_PERMISSIONS_PURPOSE,
  PLUGINS_PERMISSIONS_IDENTITY,
} from "./identity";
export type { PluginsPermissionsIdentity } from "./identity";

export type {
  PermissionStatus,
  PermissionIntentDescriptor,
  PermissionDescriptor,
  PermissionEvaluationRecord,
  PermissionDiagnostic,
} from "./descriptors";

export { createEmptyPermissionEvaluationState } from "./state";
export type { PermissionEvaluationState } from "./state";

export { PLUGINS_PERMISSIONS_DIAGNOSTICS_METADATA } from "./diagnostics";
export type { PermissionDiagnosticsMetadata } from "./diagnostics";

export { evaluatePermissionIntents } from "./evaluate";
export type { PermissionEvaluationResult } from "./evaluate";

export { composePluginsPermissions } from "./wiring";
export type { PluginsPermissionsSnapshot } from "./wiring";
