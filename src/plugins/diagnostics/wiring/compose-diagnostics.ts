/**
 * PLUGINS-I8 — Diagnostics composition.
 */

import { collectDiagnostics } from "../collect";
import { PLUGINS_DIAGNOSTICS_IDENTITY } from "../identity";
import { PLUGINS_DIAGNOSTICS_SERVICE_METADATA } from "../metadata";
import { createEmptyDiagnosticBundle } from "../models";
import {
  PLUGINS_DIAGNOSTICS_FLAGS,
  PLUGINS_DIAGNOSTICS_PHASE,
  PLUGINS_DIAGNOSTICS_STATUS,
} from "../status";

export type PluginsDiagnosticsSnapshot = {
  readonly phase: typeof PLUGINS_DIAGNOSTICS_PHASE;
  readonly status: typeof PLUGINS_DIAGNOSTICS_STATUS;
  readonly componentId: typeof PLUGINS_DIAGNOSTICS_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_DIAGNOSTICS_IDENTITY;
  readonly metadata: typeof PLUGINS_DIAGNOSTICS_SERVICE_METADATA;
  readonly emptyBundle: ReturnType<typeof createEmptyDiagnosticBundle>;
  readonly collect: typeof collectDiagnostics;
  readonly diagnosticsImplemented: true;
  readonly observabilityImplemented: false;
  readonly executionImplemented: false;
  readonly runtimeLoadingImplemented: false;
  readonly mutatesState: false;
};

export function composePluginsDiagnostics(): PluginsDiagnosticsSnapshot {
  return {
    phase: PLUGINS_DIAGNOSTICS_PHASE,
    status: PLUGINS_DIAGNOSTICS_STATUS,
    componentId: PLUGINS_DIAGNOSTICS_IDENTITY.componentId,
    identity: PLUGINS_DIAGNOSTICS_IDENTITY,
    metadata: PLUGINS_DIAGNOSTICS_SERVICE_METADATA,
    emptyBundle: createEmptyDiagnosticBundle(),
    collect: collectDiagnostics,
    diagnosticsImplemented: PLUGINS_DIAGNOSTICS_FLAGS.diagnosticsImplemented,
    observabilityImplemented: false,
    executionImplemented: PLUGINS_DIAGNOSTICS_FLAGS.executionImplemented,
    runtimeLoadingImplemented:
      PLUGINS_DIAGNOSTICS_FLAGS.runtimeLoadingImplemented,
    mutatesState: false,
  };
}
