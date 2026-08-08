/**
 * PLUGINS-I7 — Compatibility composition.
 */

import { PLUGINS_COMPATIBILITY_DIAGNOSTICS_METADATA } from "../diagnostics";
import { evaluateCompatibility } from "../evaluate";
import { PLUGINS_COMPATIBILITY_IDENTITY } from "../identity";
import { createEmptyCompatibilityReport } from "../report";
import {
  PLUGINS_COMPATIBILITY_FLAGS,
  PLUGINS_COMPATIBILITY_PHASE,
  PLUGINS_COMPATIBILITY_STATUS,
} from "../status";

export type PluginsCompatibilitySnapshot = {
  readonly phase: typeof PLUGINS_COMPATIBILITY_PHASE;
  readonly status: typeof PLUGINS_COMPATIBILITY_STATUS;
  readonly componentId: typeof PLUGINS_COMPATIBILITY_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_COMPATIBILITY_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_COMPATIBILITY_DIAGNOSTICS_METADATA;
  readonly emptyReport: ReturnType<typeof createEmptyCompatibilityReport>;
  readonly evaluate: typeof evaluateCompatibility;
  readonly compatibilityImplemented: true;
  readonly compatibilityReadOnly: true;
  readonly validationImplemented: false;
  readonly executionImplemented: false;
  readonly runtimeLoadingImplemented: false;
  readonly mutatesRegistry: false;
  readonly mutatesLifecycle: false;
};

export function composePluginsCompatibility(): PluginsCompatibilitySnapshot {
  return {
    phase: PLUGINS_COMPATIBILITY_PHASE,
    status: PLUGINS_COMPATIBILITY_STATUS,
    componentId: PLUGINS_COMPATIBILITY_IDENTITY.componentId,
    identity: PLUGINS_COMPATIBILITY_IDENTITY,
    diagnosticsMetadata: PLUGINS_COMPATIBILITY_DIAGNOSTICS_METADATA,
    emptyReport: createEmptyCompatibilityReport(),
    evaluate: evaluateCompatibility,
    compatibilityImplemented:
      PLUGINS_COMPATIBILITY_FLAGS.compatibilityImplemented,
    compatibilityReadOnly: PLUGINS_COMPATIBILITY_FLAGS.compatibilityReadOnly,
    validationImplemented: false,
    executionImplemented: PLUGINS_COMPATIBILITY_FLAGS.executionImplemented,
    runtimeLoadingImplemented:
      PLUGINS_COMPATIBILITY_FLAGS.runtimeLoadingImplemented,
    mutatesRegistry: false,
    mutatesLifecycle: false,
  };
}
