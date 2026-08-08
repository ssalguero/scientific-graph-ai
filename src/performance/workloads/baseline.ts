/**
 * PERFORMANCE-I4 — C-BASE baseline registry (in-memory).
 *
 * Baselines are reference observations — never budgets.
 * Persistence scope: process-local Map only (not product DB / Supabase).
 */

import type { AggregationView } from "../measurement/types";
import { createBaselineEvidence } from "./evidence";
import type {
  PerformanceBaseline,
  WorkloadCoreResult,
  WorkloadRunResult,
} from "./types";

export type BaselineRegistry = {
  createFromRun(
    baselineId: string,
    run: WorkloadRunResult,
    options?: { reproducible?: boolean; notes?: string },
  ): WorkloadCoreResult<PerformanceBaseline>;
  get(baselineId: string): PerformanceBaseline | undefined;
  listByWorkload(workloadId: string): readonly PerformanceBaseline[];
  list(): readonly PerformanceBaseline[];
  remove(baselineId: string): boolean;
  clear(): void;
  size(): number;
};

export function createBaselineRegistry(): BaselineRegistry {
  const store = new Map<string, PerformanceBaseline>();

  return {
    createFromRun(baselineId, run, options) {
      if (!baselineId.trim()) {
        return { ok: false, error: "baselineId must be non-empty" };
      }
      if (store.has(baselineId.trim())) {
        return { ok: false, error: `duplicate baselineId: ${baselineId.trim()}` };
      }
      if (run.aggregation.observationCount <= 0) {
        return {
          ok: false,
          error: "incomplete measurement cannot become a baseline",
        };
      }

      // I9: unsupported reproducibility claims never PASS — require explicit true.
      if (options?.reproducible !== true) {
        return {
          ok: false,
          error:
            "reproducible must be explicitly true — unverified reproducibility cannot produce a valid baseline",
        };
      }

      const evidence = createBaselineEvidence({
        evidenceId: `evd-${baselineId.trim()}`,
        workloadId: run.workloadId,
        baselineId: baselineId.trim(),
        aggregation: run.aggregation,
        createdAtMs: run.collectedAtMs,
        reproducible: true,
        notes: options?.notes,
      });
      if (!evidence.ok) return evidence;

      if (!evidence.value.reproducible) {
        return {
          ok: false,
          error: "unverified reproducibility cannot produce a valid baseline",
        };
      }

      const baseline: PerformanceBaseline = {
        baselineId: baselineId.trim(),
        workloadId: run.workloadId,
        aggregation: run.aggregation as AggregationView,
        evidence: evidence.value,
        isBudget: false,
      };
      store.set(baseline.baselineId, baseline);
      return { ok: true, value: baseline };
    },

    get(baselineId) {
      return store.get(baselineId);
    },

    listByWorkload(workloadId) {
      return [...store.values()]
        .filter((b) => b.workloadId === workloadId)
        .sort((a, b) =>
          a.baselineId < b.baselineId ? -1 : a.baselineId > b.baselineId ? 1 : 0,
        );
    },

    list() {
      return [...store.values()].sort((a, b) =>
        a.baselineId < b.baselineId ? -1 : a.baselineId > b.baselineId ? 1 : 0,
      );
    },

    remove(baselineId) {
      return store.delete(baselineId);
    },

    clear() {
      store.clear();
    },

    size() {
      return store.size;
    },
  };
}
