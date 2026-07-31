/**
 * UX-3.4.4 — Private aggregate runtime metrics snapshot.
 * Not exported from any barrel. Not wired to hot path by default.
 */

import { Benchmark } from "./Benchmark";
import { PerformanceCounters } from "./PerformanceCounters";

export type RuntimeMetricsSnapshot = {
  readonly counters: ReadonlyArray<readonly [string, number]>;
  readonly samples: ReadonlyArray<{
    readonly label: string;
    readonly durationMs: number;
  }>;
  readonly benchmarkEnabled: boolean;
  readonly countersEnabled: boolean;
};

export const RuntimeMetrics = {
  snapshot(): RuntimeMetricsSnapshot {
    return {
      counters: PerformanceCounters.entries(),
      samples: Benchmark.getSamples(),
      benchmarkEnabled: Benchmark.isEnabled(),
      countersEnabled: PerformanceCounters.isEnabled(),
    };
  },

  reset(): void {
    Benchmark.reset();
    PerformanceCounters.reset();
  },
} as const;
