/**
 * UX-3.16 — Sole constructor for RuntimeReportSnapshot (private).
 *
 * API: create(...) only.
 * Pure — no Date.now(), no validation, no normalization, no branching.
 * Every create() returns a newly frozen instance.
 * Builder owns no state.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../health/RuntimeHealth";
import type { RuntimeReportSnapshot } from "./RuntimeReportTypes";

function create(
  runtime: RuntimeSnapshot,
  metrics: RuntimeMetricsSnapshot,
  health: RuntimeHealth,
): RuntimeReportSnapshot {
  const result: RuntimeReportSnapshot = {
    runtime,
    metrics,
    health,
  };
  return Object.freeze(result);
}

export const RuntimeReportBuilder = Object.freeze({
  create,
});
