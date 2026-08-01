/**
 * UX-3.13 — Instance-based RuntimeHealth aggregation accumulator (private).
 *
 * Unlike RuntimeMetricsCollector (module singleton), this is a class so
 * multiple independent aggregation windows are possible with no shared global
 * state. Internal scalars only — never retains RuntimeHealth or nested refs.
 *
 * Official mapping on record(health):
 *   resolutions              → sumResolutions
 *   cacheMisses              → sumFallbacks
 *   observerNotifications    → sumObservers
 *   diagnostics.length       → sumDiagnostics
 *   status OK|WARNING|ERROR  → okCount|warningCount|errorCount
 */

import type { RuntimeHealth } from "../health/RuntimeHealth";
import { RuntimeHealthStatus } from "../health/RuntimeHealthStatus";
import type { RuntimeAggregation } from "./RuntimeAggregation";
import { RuntimeAggregationBuilder } from "./RuntimeAggregationBuilder";

export class RuntimeAggregationAccumulator {
  private totalSamples = 0;
  private okCount = 0;
  private warningCount = 0;
  private errorCount = 0;
  private sumResolutions = 0;
  private sumFallbacks = 0;
  private sumObservers = 0;
  private sumDiagnostics = 0;

  record(health: RuntimeHealth): void {
    this.totalSamples += 1;

    if (health.status === RuntimeHealthStatus.OK) {
      this.okCount += 1;
    } else if (health.status === RuntimeHealthStatus.WARNING) {
      this.warningCount += 1;
    } else if (health.status === RuntimeHealthStatus.ERROR) {
      this.errorCount += 1;
    }

    this.sumResolutions += health.metrics.resolutions;
    this.sumFallbacks += health.metrics.cacheMisses;
    this.sumObservers += health.metrics.observerNotifications;
    this.sumDiagnostics += health.diagnostics.length;
  }

  build(): RuntimeAggregation {
    const n = this.totalSamples;
    const avg = (sum: number): number => (n === 0 ? 0 : sum / n);

    return RuntimeAggregationBuilder.create(
      this.totalSamples,
      this.okCount,
      this.warningCount,
      this.errorCount,
      avg(this.sumResolutions),
      avg(this.sumFallbacks),
      avg(this.sumObservers),
      avg(this.sumDiagnostics),
    );
  }

  reset(): void {
    this.totalSamples = 0;
    this.okCount = 0;
    this.warningCount = 0;
    this.errorCount = 0;
    this.sumResolutions = 0;
    this.sumFallbacks = 0;
    this.sumObservers = 0;
    this.sumDiagnostics = 0;
  }
}
