/**
 * UX-3.4.4 — Private named performance counters.
 * Not exported from any barrel. Not wired to hot path by default.
 */

const counters = new Map<string, number>();
let enabled = false;

export const PerformanceCounters = {
  /** Opt-in only — default disabled. */
  setEnabled(value: boolean): void {
    enabled = value;
  },

  isEnabled(): boolean {
    return enabled;
  },

  inc(name: string, by = 1): number {
    if (!enabled) {
      return counters.get(name) ?? 0;
    }
    const next = (counters.get(name) ?? 0) + by;
    counters.set(name, next);
    return next;
  },

  get(name: string): number {
    return counters.get(name) ?? 0;
  },

  reset(name?: string): void {
    if (name === undefined) {
      counters.clear();
      return;
    }
    counters.delete(name);
  },

  /** Internal inspection for validators / future phases. */
  entries(): ReadonlyArray<readonly [string, number]> {
    return [...counters.entries()];
  },
} as const;
