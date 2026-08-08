/**
 * PLUGINS-I8 — Observability composition.
 */

import { aggregateObservability } from "../aggregate";
import { PLUGINS_OBSERVABILITY_IDENTITY } from "../identity";
import {
  PLUGINS_OBSERVABILITY_FLAGS,
  PLUGINS_OBSERVABILITY_PHASE,
  PLUGINS_OBSERVABILITY_STATUS,
} from "../status";

export type PluginsObservabilitySnapshot = {
  readonly phase: typeof PLUGINS_OBSERVABILITY_PHASE;
  readonly status: typeof PLUGINS_OBSERVABILITY_STATUS;
  readonly identity: typeof PLUGINS_OBSERVABILITY_IDENTITY;
  readonly aggregate: typeof aggregateObservability;
  readonly diagnosticsImplemented: true;
  readonly observabilityImplemented: true;
  readonly observabilityReadOnly: true;
  readonly healthAggregationImplemented: true;
  readonly executionImplemented: false;
  readonly runtimeLoadingImplemented: false;
  readonly decisionAuthority: false;
};

export function composePluginsObservability(): PluginsObservabilitySnapshot {
  return {
    phase: PLUGINS_OBSERVABILITY_PHASE,
    status: PLUGINS_OBSERVABILITY_STATUS,
    identity: PLUGINS_OBSERVABILITY_IDENTITY,
    aggregate: aggregateObservability,
    diagnosticsImplemented:
      PLUGINS_OBSERVABILITY_FLAGS.diagnosticsImplemented,
    observabilityImplemented:
      PLUGINS_OBSERVABILITY_FLAGS.observabilityImplemented,
    observabilityReadOnly: PLUGINS_OBSERVABILITY_FLAGS.observabilityReadOnly,
    healthAggregationImplemented:
      PLUGINS_OBSERVABILITY_FLAGS.healthAggregationImplemented,
    executionImplemented: PLUGINS_OBSERVABILITY_FLAGS.executionImplemented,
    runtimeLoadingImplemented:
      PLUGINS_OBSERVABILITY_FLAGS.runtimeLoadingImplemented,
    decisionAuthority: false,
  };
}
