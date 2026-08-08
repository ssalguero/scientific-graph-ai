/**
 * PERFORMANCE-I4 — C-EVD baseline evidence / provenance.
 */

import type { AggregationView } from "../measurement/types";
import type { BaselineEvidence, WorkloadCoreResult } from "./types";

export function createBaselineEvidence(input: {
  evidenceId: string;
  workloadId: string;
  baselineId: string;
  aggregation: AggregationView;
  createdAtMs: number;
  reproducible: boolean;
  notes?: string;
}): WorkloadCoreResult<BaselineEvidence> {
  if (!input.evidenceId.trim()) {
    return { ok: false, error: "evidenceId must be non-empty" };
  }
  if (!input.workloadId.trim()) {
    return { ok: false, error: "workloadId must be non-empty" };
  }
  if (!input.baselineId.trim()) {
    return { ok: false, error: "baselineId must be non-empty" };
  }
  if (!Number.isFinite(input.createdAtMs)) {
    return { ok: false, error: "createdAtMs must be finite" };
  }
  if (!input.aggregation.batchId.trim()) {
    return { ok: false, error: "aggregation batchId required for evidence" };
  }
  if (input.aggregation.observationCount <= 0) {
    return {
      ok: false,
      error: "cannot create evidence for empty aggregation — never a valid baseline",
    };
  }

  if (!Array.isArray(input.aggregation.signals)) {
    return { ok: false, error: "aggregation signals must be an array" };
  }

  const signalCount = input.aggregation.signals.reduce((acc, s) => {
    if (
      !s ||
      !s.sourceLabel?.trim() ||
      !s.signalName?.trim() ||
      !Number.isFinite(s.count) ||
      !Number.isFinite(s.sum) ||
      !Number.isFinite(s.min) ||
      !Number.isFinite(s.max)
    ) {
      return Number.NaN;
    }
    return acc + s.count;
  }, 0);

  if (!Number.isFinite(signalCount)) {
    return {
      ok: false,
      error: "aggregation signals have invalid statistics — evidence rejected",
    };
  }

  if (signalCount !== input.aggregation.observationCount) {
    return {
      ok: false,
      error:
        "aggregation observationCount inconsistent with signal counts — evidence rejected",
    };
  }

  if (input.aggregation.observationCount > 0 && input.aggregation.signals.length === 0) {
    return {
      ok: false,
      error: "aggregation claims observations without signals — evidence rejected",
    };
  }

  return {
    ok: true,
    value: {
      evidenceId: input.evidenceId.trim(),
      workloadId: input.workloadId.trim(),
      baselineId: input.baselineId.trim(),
      batchId: input.aggregation.batchId,
      observationCount: input.aggregation.observationCount,
      createdAtMs: input.createdAtMs,
      reproducible: input.reproducible,
      notes: (input.notes ?? "").trim() || "baseline provenance",
    },
  };
}
