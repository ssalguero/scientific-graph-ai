/**
 * UX-3.14 — Sole constructor for RuntimeTelemetrySnapshot (private).
 *
 * API: create(...) only.
 * Pure — no Date.now(), no validation, no normalization, no branching.
 * timestamp parameter is trusted.
 * Every create() returns a newly frozen instance.
 * Builder owns no state.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../health/RuntimeHealth";
import type { RuntimeTelemetrySnapshot } from "./TelemetryTypes";

function create(
  runtime: RuntimeSnapshot,
  metrics: RuntimeMetricsSnapshot,
  health: RuntimeHealth,
  timestamp: number,
): RuntimeTelemetrySnapshot {
  const result: RuntimeTelemetrySnapshot = {
    runtime,
    metrics,
    health,
    timestamp,
  };
  return Object.freeze(result);
}

export const RuntimeTelemetryBuilder = Object.freeze({
  create,
});
