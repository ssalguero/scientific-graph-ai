/**
 * UX-3.17 — Private Theme Runtime reporting orchestrator.
 *
 * Coordinates the full private diagnostics pipeline:
 * Snapshot → Metrics → Health → Aggregation (discarded) → Telemetry (discarded)
 * → Report → return runtimeReport.health.
 *
 * Not exported from any public barrel. Aggregation, Telemetry, and Report
 * snapshots are built only via their respective Reporters — never Builders,
 * and never collector/accumulator.build() from this module.
 */

import { SnapshotBuilder } from "./devtools/SnapshotBuilder";
import { RuntimeMetricsReporter } from "./metrics/RuntimeMetricsReporter";
import { RuntimeHealthReporter } from "./health/RuntimeHealthReporter";
import { RuntimeAggregationAccumulator } from "./aggregation/RuntimeAggregationAccumulator";
import { RuntimeAggregationReporter } from "./aggregation/RuntimeAggregationReporter";
import { RuntimeTelemetryCollector } from "./telemetry/RuntimeTelemetryCollector";
import { RuntimeTelemetryReporter } from "./telemetry/RuntimeTelemetryReporter";
import { RuntimeReportCollector } from "./report/RuntimeReportCollector";
import { RuntimeReportReporter } from "./report/RuntimeReportReporter";
import type { ThemeRuntime } from "./selectors/ThemeSelector";
import type { RuntimeHealth } from "./health/RuntimeHealth";

function build(runtime: ThemeRuntime): Readonly<RuntimeHealth> {
  const snapshot = SnapshotBuilder.build(runtime);
  const metrics = RuntimeMetricsReporter.getSnapshot();
  const health = RuntimeHealthReporter.build(snapshot, metrics);

  const aggregation = new RuntimeAggregationAccumulator();
  aggregation.record(health);
  RuntimeAggregationReporter.build(aggregation);

  const telemetry = new RuntimeTelemetryCollector();
  telemetry.record(snapshot, metrics, health);
  RuntimeTelemetryReporter.build(telemetry);

  const report = new RuntimeReportCollector();
  report.record(snapshot, metrics, health);
  const runtimeReport = RuntimeReportReporter.build(report);

  return runtimeReport.health;
}

export const RuntimeReporter = Object.freeze({
  build,
});
