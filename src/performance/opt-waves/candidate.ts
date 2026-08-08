/**
 * PERFORMANCE-I7 — C-OPT candidate validation.
 */

import type {
  OptimizationCandidate,
  OptimizationCandidateKind,
  OptimizationExpectedEffect,
  OptimizationMechanism,
  OptimizationStatistic,
  OptimizationTargetScope,
  OptimizeCoreResult,
} from "./types";

const KINDS: readonly OptimizationCandidateKind[] = ["fixture", "definition"];
const MECHANISMS: readonly OptimizationMechanism[] = [
  "fixture-controlled",
  "peer-public",
];
const SCOPES: readonly OptimizationTargetScope[] = [
  "fixture",
  "engine",
  "data",
  "ux",
  "ai",
  "collab",
  "plugins",
  "cross-domain",
];
const STATS: readonly OptimizationStatistic[] = ["count", "sum", "min", "max"];
const EFFECTS: readonly OptimizationExpectedEffect[] = ["decrease", "increase"];

const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateOptimizationCandidate(
  input: OptimizationCandidate,
): OptimizeCoreResult<OptimizationCandidate> {
  if (!isNonEmpty(input.candidateId)) {
    return { ok: false, error: "candidateId must be non-empty" };
  }
  if (!isNonEmpty(input.label)) {
    return { ok: false, error: "label must be non-empty" };
  }
  if (!KINDS.includes(input.kind)) {
    return { ok: false, error: "kind must be fixture|definition" };
  }
  if (!MECHANISMS.includes(input.mechanism)) {
    return { ok: false, error: "mechanism must be fixture-controlled|peer-public" };
  }
  if (!SCOPES.includes(input.targetScope)) {
    return { ok: false, error: "targetScope invalid" };
  }
  if (!isNonEmpty(input.workloadId)) {
    return { ok: false, error: "workloadId must be non-empty" };
  }
  if (!isNonEmpty(input.sourceLabel)) {
    return { ok: false, error: "sourceLabel must be non-empty" };
  }
  if (!isNonEmpty(input.signalName)) {
    return { ok: false, error: "signalName must be non-empty" };
  }
  if (!STATS.includes(input.statistic)) {
    return { ok: false, error: "statistic must be count|sum|min|max" };
  }
  if (!EFFECTS.includes(input.expectedEffect)) {
    return { ok: false, error: "expectedEffect must be decrease|increase" };
  }

  if (
    input.mechanism === "fixture-controlled" &&
    input.targetScope !== "fixture"
  ) {
    return {
      ok: false,
      error:
        "fixture-controlled mechanism requires targetScope 'fixture' (not a peer API)",
    };
  }

  if (input.mechanism === "peer-public" && input.targetScope === "fixture") {
    return {
      ok: false,
      error: "peer-public mechanism cannot target fixture scope",
    };
  }

  return {
    ok: true,
    value: {
      candidateId: input.candidateId.trim(),
      label: input.label.trim(),
      kind: input.kind,
      mechanism: input.mechanism,
      targetScope: input.targetScope,
      workloadId: input.workloadId.trim(),
      sourceLabel: input.sourceLabel.trim(),
      signalName: input.signalName.trim(),
      statistic: input.statistic,
      expectedEffect: input.expectedEffect,
    },
  };
}
