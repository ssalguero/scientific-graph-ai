/**
 * PERFORMANCE-I8 — Gate definition validation (C-GRD).
 */

import type {
  GateCoreResult,
  GateDefinition,
  GateDefinitionKind,
} from "./types";

const KINDS: readonly GateDefinitionKind[] = ["fixture", "definition"];

const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateGateDefinition(
  input: GateDefinition,
): GateCoreResult<GateDefinition> {
  if (!isNonEmpty(input.gateId)) {
    return { ok: false, error: "gateId must be non-empty" };
  }
  if (!isNonEmpty(input.label)) {
    return { ok: false, error: "label must be non-empty" };
  }
  if (!KINDS.includes(input.kind)) {
    return { ok: false, error: "kind must be fixture|definition" };
  }
  if (typeof input.requireComparison !== "boolean") {
    return { ok: false, error: "requireComparison must be boolean" };
  }
  if (typeof input.requireBudget !== "boolean") {
    return { ok: false, error: "requireBudget must be boolean" };
  }
  if (typeof input.requireBaseline !== "boolean") {
    return { ok: false, error: "requireBaseline must be boolean" };
  }
  if (typeof input.requireWorkloadId !== "boolean") {
    return { ok: false, error: "requireWorkloadId must be boolean" };
  }
  if (
    !input.requireComparison &&
    !input.requireBudget &&
    !input.requireBaseline
  ) {
    return {
      ok: false,
      error: "gate must require at least one of comparison|budget|baseline",
    };
  }

  return {
    ok: true,
    value: {
      gateId: input.gateId.trim(),
      label: input.label.trim(),
      kind: input.kind,
      requireComparison: input.requireComparison,
      requireBudget: input.requireBudget,
      requireBaseline: input.requireBaseline,
      requireWorkloadId: input.requireWorkloadId,
    },
  };
}
