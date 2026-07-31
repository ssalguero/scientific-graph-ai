/**
 * UX-3.10 — Private Theme Runtime metrics counters (type only).
 *
 * Unrelated to tokens/runtime/RuntimeMetrics.ts (UX-3.4.4 Benchmark aggregate).
 */

export type RuntimeMetrics = {
  readonly resolutions: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly fingerprintChanges: number;
  readonly observerNotifications: number;
  readonly snapshots: number;
};
