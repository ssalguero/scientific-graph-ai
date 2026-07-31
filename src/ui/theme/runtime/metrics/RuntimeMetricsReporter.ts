/**
 * UX-3.10 — Private Runtime Metrics Reporter.
 *
 * Read/reset facade over RuntimeMetricsCollector. reset() is for internal
 * benchmarks only — not used by production.
 */

import { RuntimeMetricsCollector } from "./RuntimeMetricsCollector";
import {
  createRuntimeMetricsSnapshot,
  type RuntimeMetricsSnapshot,
} from "./RuntimeMetricsSnapshot";

function getSnapshot(): Readonly<RuntimeMetricsSnapshot> {
  return createRuntimeMetricsSnapshot(RuntimeMetricsCollector.getCounters());
}

function reset(): void {
  RuntimeMetricsCollector.resetCounters();
}

export const RuntimeMetricsReporter = Object.freeze({
  getSnapshot,
  reset,
});
