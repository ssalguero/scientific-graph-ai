/**
 * UX-3.14 — Runtime telemetry composition types (private).
 *
 * RuntimeTelemetrySnapshot is an immutable composition snapshot.
 * It is NOT a historical log — no history, no retention of past builds.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../health/RuntimeHealth";

export type RuntimeTelemetrySnapshot = Readonly<{
  runtime: RuntimeSnapshot;
  metrics: RuntimeMetricsSnapshot;
  health: RuntimeHealth;
  timestamp: number;
}>;
