/**
 * PLUGINS-I6 — Lifecycle composition.
 */

import {
  applyLifecycleTransition,
  decideFromPublicContract,
  getLifecycleState,
} from "../controller";
import { PLUGINS_LIFECYCLE_DIAGNOSTICS_METADATA } from "../diagnostics";
import { PLUGINS_LIFECYCLE_IDENTITY } from "../identity";
import { createEmptyLifecycleEngineState, PLUGINS_LIFECYCLE_STATES } from "../state";
import {
  PLUGINS_LIFECYCLE_FLAGS,
  PLUGINS_LIFECYCLE_PHASE,
  PLUGINS_LIFECYCLE_STATUS,
} from "../status";
import { PLUGINS_ALLOWED_LIFECYCLE_TRANSITIONS } from "../transitions";

export type PluginsLifecycleSnapshot = {
  readonly phase: typeof PLUGINS_LIFECYCLE_PHASE;
  readonly status: typeof PLUGINS_LIFECYCLE_STATUS;
  readonly componentId: typeof PLUGINS_LIFECYCLE_IDENTITY.componentId;
  readonly identity: typeof PLUGINS_LIFECYCLE_IDENTITY;
  readonly diagnosticsMetadata: typeof PLUGINS_LIFECYCLE_DIAGNOSTICS_METADATA;
  readonly states: typeof PLUGINS_LIFECYCLE_STATES;
  readonly allowedTransitions: typeof PLUGINS_ALLOWED_LIFECYCLE_TRANSITIONS;
  readonly emptyState: ReturnType<typeof createEmptyLifecycleEngineState>;
  readonly decideFromContract: typeof decideFromPublicContract;
  readonly applyTransition: typeof applyLifecycleTransition;
  readonly getState: typeof getLifecycleState;
  readonly lifecycleImplemented: typeof PLUGINS_LIFECYCLE_FLAGS.lifecycleImplemented;
  readonly activationEligibilityImplemented: typeof PLUGINS_LIFECYCLE_FLAGS.activationEligibilityImplemented;
  readonly lifecycleConsumesContractsOnly: typeof PLUGINS_LIFECYCLE_FLAGS.lifecycleConsumesContractsOnly;
  readonly executionImplemented: typeof PLUGINS_LIFECYCLE_FLAGS.executionImplemented;
  readonly runtimeLoadingImplemented: typeof PLUGINS_LIFECYCLE_FLAGS.runtimeLoadingImplemented;
  readonly dynamicLoadingImplemented: typeof PLUGINS_LIFECYCLE_FLAGS.dynamicLoadingImplemented;
  readonly activeMeansExecution: false;
};

export function composePluginsLifecycle(): PluginsLifecycleSnapshot {
  return {
    phase: PLUGINS_LIFECYCLE_PHASE,
    status: PLUGINS_LIFECYCLE_STATUS,
    componentId: PLUGINS_LIFECYCLE_IDENTITY.componentId,
    identity: PLUGINS_LIFECYCLE_IDENTITY,
    diagnosticsMetadata: PLUGINS_LIFECYCLE_DIAGNOSTICS_METADATA,
    states: PLUGINS_LIFECYCLE_STATES,
    allowedTransitions: PLUGINS_ALLOWED_LIFECYCLE_TRANSITIONS,
    emptyState: createEmptyLifecycleEngineState(),
    decideFromContract: decideFromPublicContract,
    applyTransition: applyLifecycleTransition,
    getState: getLifecycleState,
    lifecycleImplemented: PLUGINS_LIFECYCLE_FLAGS.lifecycleImplemented,
    activationEligibilityImplemented:
      PLUGINS_LIFECYCLE_FLAGS.activationEligibilityImplemented,
    lifecycleConsumesContractsOnly:
      PLUGINS_LIFECYCLE_FLAGS.lifecycleConsumesContractsOnly,
    executionImplemented: PLUGINS_LIFECYCLE_FLAGS.executionImplemented,
    runtimeLoadingImplemented:
      PLUGINS_LIFECYCLE_FLAGS.runtimeLoadingImplemented,
    dynamicLoadingImplemented:
      PLUGINS_LIFECYCLE_FLAGS.dynamicLoadingImplemented,
    activeMeansExecution: false,
  };
}
