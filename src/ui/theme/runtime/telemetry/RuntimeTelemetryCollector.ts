/**
 * UX-3.14 — Instance-based RuntimeTelemetry collector (private).
 *
 * Owns mutable references to RuntimeSnapshot, RuntimeMetricsSnapshot, and
 * RuntimeHealth until reset(). Intentionally retains frozen refs for
 * composition — opposite of aggregation's "never retain Health".
 *
 * record() is atomic: all three refs overwritten together, never partial.
 * Do not expose mutable state.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../health/RuntimeHealth";
import type { RuntimeTelemetrySnapshot } from "./TelemetryTypes";
import { RuntimeTelemetryBuilder } from "./RuntimeTelemetryBuilder";

export class RuntimeTelemetryCollector {
  private runtime: RuntimeSnapshot | null = null;
  private metrics: RuntimeMetricsSnapshot | null = null;
  private health: RuntimeHealth | null = null;

  record(
    runtime: RuntimeSnapshot,
    metrics: RuntimeMetricsSnapshot,
    health: RuntimeHealth,
  ): void {
    this.runtime = runtime;
    this.metrics = metrics;
    this.health = health;
  }

  build(): RuntimeTelemetrySnapshot {
    if (this.runtime === null || this.metrics === null || this.health === null) {
      throw new Error(
        "RuntimeTelemetryCollector has no recorded runtime.",
      );
    }
    const timestamp = Date.now();
    return RuntimeTelemetryBuilder.create(
      this.runtime,
      this.metrics,
      this.health,
      timestamp,
    );
  }

  reset(): void {
    this.runtime = null;
    this.metrics = null;
    this.health = null;
  }
}
