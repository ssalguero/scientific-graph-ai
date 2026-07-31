/**
 * UX-3.4.4 — Private benchmark timing helpers.
 * Not exported from any barrel. Not wired to hot path by default.
 */

type TimingSample = {
  readonly label: string;
  readonly durationMs: number;
};

let enabled = false;
let activeLabel: string | null = null;
let activeStart = 0;
const samples: TimingSample[] = [];

function now(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

export const Benchmark = {
  /** Opt-in only — default disabled (zero hot-path cost when unused). */
  setEnabled(value: boolean): void {
    enabled = value;
  },

  isEnabled(): boolean {
    return enabled;
  },

  start(label = "default"): void {
    if (!enabled) return;
    activeLabel = label;
    activeStart = now();
  },

  stop(): number {
    if (!enabled || activeLabel === null) {
      return 0;
    }
    const durationMs = now() - activeStart;
    samples.push({ label: activeLabel, durationMs });
    activeLabel = null;
    activeStart = 0;
    return durationMs;
  },

  measure<T>(fn: () => T, label = "measure"): T {
    if (!enabled) {
      return fn();
    }
    Benchmark.start(label);
    try {
      return fn();
    } finally {
      Benchmark.stop();
    }
  },

  reset(): void {
    activeLabel = null;
    activeStart = 0;
    samples.length = 0;
  },

  /** Internal inspection for validators / future phases. */
  getSamples(): readonly TimingSample[] {
    return samples.slice();
  },
} as const;
