/**
 * PERFORMANCE-I4 — C-WL workload definition validation.
 */

import type {
  WorkloadClass,
  WorkloadCoreResult,
  WorkloadDefinition,
  WorkloadKind,
} from "./types";

const KINDS: readonly WorkloadKind[] = ["fixture", "definition"];
const CLASSES: readonly WorkloadClass[] = ["isolated", "baseline", "cross-domain"];
const CONDITIONAL_SOURCES = new Set(["ai", "collab", "plugins"]);

const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function isConditionalWorkloadSource(sourceLabel: string): boolean {
  return CONDITIONAL_SOURCES.has(sourceLabel.trim());
}

export function validateWorkloadDefinition(
  input: WorkloadDefinition,
): WorkloadCoreResult<WorkloadDefinition> {
  if (!isNonEmpty(input.workloadId)) {
    return { ok: false, error: "workloadId must be a non-empty string" };
  }
  if (!isNonEmpty(input.label)) {
    return { ok: false, error: "label must be a non-empty string" };
  }
  if (!KINDS.includes(input.kind)) {
    return { ok: false, error: "kind must be fixture|definition" };
  }
  if (!CLASSES.includes(input.workloadClass)) {
    return {
      ok: false,
      error: "workloadClass must be isolated|baseline|cross-domain",
    };
  }
  if (!isNonEmpty(input.sourceLabel)) {
    return { ok: false, error: "sourceLabel must be a non-empty string" };
  }
  if (!isNonEmpty(input.signalName)) {
    return { ok: false, error: "signalName must be a non-empty string" };
  }

  return {
    ok: true,
    value: {
      workloadId: input.workloadId.trim(),
      label: input.label.trim(),
      kind: input.kind,
      workloadClass: input.workloadClass,
      sourceLabel: input.sourceLabel.trim(),
      signalName: input.signalName.trim(),
    },
  };
}
