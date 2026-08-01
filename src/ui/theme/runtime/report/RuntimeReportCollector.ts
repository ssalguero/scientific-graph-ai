/**
 * UX-3.16 — Instance-based RuntimeReport collector (private).
 *
 * Owns mutable references to RuntimeSnapshot, RuntimeMetricsSnapshot, and
 * RuntimeHealth until reset(). Intentionally retains frozen refs for
 * composition.
 *
 * record() is atomic: all three refs overwritten together, never partial.
 * Do not expose mutable state.
 */

import type { RuntimeSnapshot } from "../devtools/RuntimeSnapshot";
import type { RuntimeMetricsSnapshot } from "../metrics/RuntimeMetricsSnapshot";
import type { RuntimeHealth } from "../health/RuntimeHealth";
import type { RuntimeReportSnapshot } from "./RuntimeReportTypes";
import { RuntimeReportBuilder } from "./RuntimeReportBuilder";

export class RuntimeReportCollector {
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

  build(): RuntimeReportSnapshot {
    if (this.runtime === null || this.metrics === null || this.health === null) {
      throw new Error(
        "RuntimeReportCollector has no recorded runtime.",
      );
    }
    return RuntimeReportBuilder.create(
      this.runtime,
      this.metrics,
      this.health,
    );
  }

  reset(): void {
    this.runtime = null;
    this.metrics = null;
    this.health = null;
  }
}
