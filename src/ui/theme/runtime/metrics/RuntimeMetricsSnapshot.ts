/**
 * UX-3.10 — Immutable Runtime Metrics Snapshot (private).
 *
 * Allocations are allowed only here — never inside record* methods.
 */

import type { RuntimeMetrics } from "./RuntimeMetrics";

export type RuntimeMetricsSnapshot = RuntimeMetrics;

export function createRuntimeMetricsSnapshot(
  metrics: RuntimeMetrics,
): Readonly<RuntimeMetricsSnapshot> {
  return Object.freeze({
    resolutions: metrics.resolutions,
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses,
    fingerprintChanges: metrics.fingerprintChanges,
    observerNotifications: metrics.observerNotifications,
    snapshots: metrics.snapshots,
  });
}
