/**
 * UX-3.10 — Private Runtime Metrics Collector (SSOT).
 *
 * Exactly six module-level scalars. Allocation-free O(1) increments.
 * No Map, Set, WeakMap, WeakSet, arrays, or history.
 */

import type { RuntimeMetrics } from "./RuntimeMetrics";

let resolutions = 0;
let cacheHits = 0;
let cacheMisses = 0;
let fingerprintChanges = 0;
let observerNotifications = 0;
let snapshots = 0;

function recordResolution(): void {
  resolutions += 1;
}

function recordCacheHit(): void {
  cacheHits += 1;
}

function recordCacheMiss(): void {
  cacheMisses += 1;
}

function recordFingerprintChange(): void {
  fingerprintChanges += 1;
}

function recordObserverNotifications(count: number): void {
  observerNotifications += count;
}

function recordSnapshot(): void {
  snapshots += 1;
}

/** Internal — Reporter only. */
function getCounters(): RuntimeMetrics {
  return {
    resolutions,
    cacheHits,
    cacheMisses,
    fingerprintChanges,
    observerNotifications,
    snapshots,
  };
}

/** Internal — Reporter only (benchmarks). */
function resetCounters(): void {
  resolutions = 0;
  cacheHits = 0;
  cacheMisses = 0;
  fingerprintChanges = 0;
  observerNotifications = 0;
  snapshots = 0;
}

export const RuntimeMetricsCollector = Object.freeze({
  recordResolution,
  recordCacheHit,
  recordCacheMiss,
  recordFingerprintChange,
  recordObserverNotifications,
  recordSnapshot,
  getCounters,
  resetCounters,
});
