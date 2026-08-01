/**
 * UX-3.15 — Private Theme Runtime reporting orchestrator.
 *
 * Coordinates Snapshot → Metrics → Health → Telemetry (discarded) → Health.
 * Not exported from any public barrel. Aggregation is outside this pipeline.
 *
 * Telemetry may ONLY be produced via RuntimeTelemetryReporter.build(collector).
 * Never call collector.build() or RuntimeTelemetryBuilder from this module.
 */

import { SnapshotBuilder } from "./devtools/SnapshotBuilder";
import { RuntimeMetricsReporter } from "./metrics/RuntimeMetricsReporter";
import { RuntimeHealthReporter } from "./health/RuntimeHealthReporter";
import { RuntimeTelemetryCollector } from "./telemetry/RuntimeTelemetryCollector";
import { RuntimeTelemetryReporter } from "./telemetry/RuntimeTelemetryReporter";
import type { ThemeRuntime } from "./selectors/ThemeSelector";
import type { RuntimeHealth } from "./health/RuntimeHealth";

function build(runtime: ThemeRuntime): Readonly<RuntimeHealth> {
  const snapshot = SnapshotBuilder.build(runtime);
  const metrics = RuntimeMetricsReporter.getSnapshot();
  const health = RuntimeHealthReporter.build(snapshot, metrics);

  const collector = new RuntimeTelemetryCollector();
  collector.record(snapshot, metrics, health);
  RuntimeTelemetryReporter.build(collector);

  return health;
}

export const RuntimeReporter = Object.freeze({
  build,
});
