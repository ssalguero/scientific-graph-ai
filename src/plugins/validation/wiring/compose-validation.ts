/**
 * PLUGINS-I7 — Validation composition.
 */

import { certifyCompliance } from "../certify";
import { PLUGINS_VALIDATION_DIAGNOSTICS_METADATA } from "../diagnostics";
import { PLUGINS_VALIDATION_IDENTITY } from "../identity";
import { createEmptyValidationReport } from "../report";
import {
  PLUGINS_VALIDATION_FLAGS,
  PLUGINS_VALIDATION_PHASE,
  PLUGINS_VALIDATION_STATUS,
} from "../status";

export type PluginsValidationSnapshot = {
  readonly phase: typeof PLUGINS_VALIDATION_PHASE;
  readonly status: typeof PLUGINS_VALIDATION_STATUS;
  readonly identity: typeof PLUGINS_VALIDATION_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_VALIDATION_DIAGNOSTICS_METADATA;
  readonly emptyReport: ReturnType<typeof createEmptyValidationReport>;
  readonly certify: typeof certifyCompliance;
  readonly compatibilityImplemented: true;
  readonly validationImplemented: true;
  readonly compatibilityReadOnly: true;
  readonly validationReadOnly: true;
  readonly executionImplemented: false;
  readonly runtimeLoadingImplemented: false;
  readonly replacesCompatibility: false;
  readonly reEvaluatesCompatibility: false;
  readonly mutatesRegistry: false;
  readonly mutatesLifecycle: false;
};

export function composePluginsValidation(): PluginsValidationSnapshot {
  return {
    phase: PLUGINS_VALIDATION_PHASE,
    status: PLUGINS_VALIDATION_STATUS,
    identity: PLUGINS_VALIDATION_IDENTITY,
    diagnosticsMetadata: PLUGINS_VALIDATION_DIAGNOSTICS_METADATA,
    emptyReport: createEmptyValidationReport(),
    certify: certifyCompliance,
    compatibilityImplemented:
      PLUGINS_VALIDATION_FLAGS.compatibilityImplemented,
    validationImplemented: PLUGINS_VALIDATION_FLAGS.validationImplemented,
    compatibilityReadOnly: PLUGINS_VALIDATION_FLAGS.compatibilityReadOnly,
    validationReadOnly: PLUGINS_VALIDATION_FLAGS.validationReadOnly,
    executionImplemented: PLUGINS_VALIDATION_FLAGS.executionImplemented,
    runtimeLoadingImplemented:
      PLUGINS_VALIDATION_FLAGS.runtimeLoadingImplemented,
    replacesCompatibility: false,
    reEvaluatesCompatibility: false,
    mutatesRegistry: false,
    mutatesLifecycle: false,
  };
}
