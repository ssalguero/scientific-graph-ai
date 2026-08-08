/**
 * PERFORMANCE-I7 — PERFORMANCE-owned fixture optimization mechanism.
 *
 * Explicitly NOT a peer API. Used only to exercise C-OPT/C-CMP lifecycle
 * when no authorized peer public optimization surface exists.
 */

import { collectThenAggregate } from "../measurement/pipeline";
import type { AggregationView, MeasurementCoreResult } from "../measurement/types";

export type FixtureOptimizationStore = {
  /** Current fixture numeric samples (PERFORMANCE-owned). */
  getValues(): readonly number[];
  setValues(values: readonly number[]): void;
  /**
   * Apply a fixture "optimization" by shifting all values.
   * decrease → subtract amount; increase → add amount.
   */
  applyFixtureAdjustment(
    effect: "decrease" | "increase",
    amount: number,
  ): { readonly ok: true } | { readonly ok: false; readonly error: string };
  measure(input: {
    batchId: string;
    sourceLabel: string;
    signalName: string;
    collectedAtMs: number;
  }): MeasurementCoreResult<AggregationView>;
};

/**
 * Create an in-memory fixture store for I7 tests / controlled demos.
 * Label: fixture mechanism — not production peer optimization.
 */
export function createFixtureOptimizationStore(
  initialValues: readonly number[] = [10, 12, 14],
): FixtureOptimizationStore {
  let values = [...initialValues];

  return {
    getValues() {
      return [...values];
    },

    setValues(next) {
      values = [...next];
    },

    applyFixtureAdjustment(effect, amount) {
      if (!Number.isFinite(amount) || amount < 0) {
        return { ok: false, error: "amount must be a non-negative finite number" };
      }
      if (effect === "decrease") {
        values = values.map((v) => v - amount);
      } else {
        values = values.map((v) => v + amount);
      }
      return { ok: true };
    },

    measure(input) {
      if (!input.batchId.trim()) {
        return { ok: false, error: "batchId must be non-empty" };
      }
      if (values.length === 0) {
        return { ok: false, error: "fixture store has no values to measure" };
      }
      const observations = values.map((numericValue, index) => ({
        observationId: `fixture.opt.${index}`,
        sourceLabel: input.sourceLabel,
        signalName: input.signalName,
        numericValue,
        collectedAtMs: input.collectedAtMs + index,
      }));
      return collectThenAggregate(input.batchId.trim(), observations);
    },
  };
}
