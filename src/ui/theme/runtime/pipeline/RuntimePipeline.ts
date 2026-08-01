/**
 * UX-3.19 — Private Theme Runtime diagnostics pipeline.
 *
 * Encapsulates the full private diagnostics sequence:
 * Snapshot → Metrics → Health → Aggregation (discarded) → Telemetry (discarded)
 * → Report → return runtimeReport (RuntimeReportSnapshot).
 *
 * Not exported from any public barrel. Aggregation, Telemetry, and Report
 * snapshots are built only via their respective Reporters — never Builders,
 * and never collector/accumulator.build() from this module.
 *
 * Sole entry point for pipeline orchestration: RuntimePipeline.run(...).
 */

import { SnapshotBuilder } from "../devtools/SnapshotBuilder";
import { RuntimeMetricsReporter } from "../metrics/RuntimeMetricsReporter";
import { RuntimeHealthReporter } from "../health/RuntimeHealthReporter";
import { RuntimeAggregationAccumulator } from "../aggregation/RuntimeAggregationAccumulator";
import { RuntimeAggregationReporter } from "../aggregation/RuntimeAggregationReporter";
import { RuntimeTelemetryCollector } from "../telemetry/RuntimeTelemetryCollector";
import { RuntimeTelemetryReporter } from "../telemetry/RuntimeTelemetryReporter";
import { RuntimeReportCollector } from "../report/RuntimeReportCollector";
import { RuntimeReportReporter } from "../report/RuntimeReportReporter";
import type { ThemeRuntime } from "../selectors/ThemeSelector";
import type { RuntimeReportSnapshot } from "../report/RuntimeReportTypes";

function run(runtime: ThemeRuntime): Readonly<RuntimeReportSnapshot> {
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

  return runtimeReport;
}

export const RuntimePipeline = Object.freeze({
  run,
});
