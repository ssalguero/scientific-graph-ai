/**
 * PLUGINS-I4 — Capability evaluation state (not Registry SSOT).
 */

import type {
  CapabilityDiagnostic,
  CapabilityEvaluationRecord,
} from "./descriptors";

export type CapabilityEvaluationState = {
  readonly __kind: "CapabilityEvaluationState";
  readonly __ownsRegistry: false;
  readonly __ownsLifecycle: false;
  readonly records: readonly CapabilityEvaluationRecord[];
  readonly diagnostics: readonly CapabilityDiagnostic[];
  readonly evaluatedCount: number;
  readonly declaredCount: number;
};

export function createEmptyCapabilityEvaluationState(): CapabilityEvaluationState {
  return {
    __kind: "CapabilityEvaluationState",
    __ownsRegistry: false,
    __ownsLifecycle: false,
    records: [],
    diagnostics: [],
    evaluatedCount: 0,
    declaredCount: 0,
  };
}
