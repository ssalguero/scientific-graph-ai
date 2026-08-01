/**
 * UX-3.14 — Pure RuntimeTelemetry reporter facade (private).
 *
 * API: build(collector) only.
 * Delegates to collector.build() (→ Builder.create). No state or cache.
 * Reporter owns no state.
 */

import type { RuntimeTelemetrySnapshot } from "./TelemetryTypes";
import type { RuntimeTelemetryCollector } from "./RuntimeTelemetryCollector";

function build(
  collector: RuntimeTelemetryCollector,
): RuntimeTelemetrySnapshot {
  return collector.build();
}

export const RuntimeTelemetryReporter = Object.freeze({
  build,
});
