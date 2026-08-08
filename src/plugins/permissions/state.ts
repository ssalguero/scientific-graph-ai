/**
 * PLUGINS-I4 — Permission evaluation state (not Registry SSOT).
 */

import type {
  PermissionDiagnostic,
  PermissionEvaluationRecord,
} from "./descriptors";

export type PermissionEvaluationState = {
  readonly __kind: "PermissionEvaluationState";
  readonly __ownsRegistry: false;
  readonly __ownsLifecycle: false;
  readonly records: readonly PermissionEvaluationRecord[];
  readonly diagnostics: readonly PermissionDiagnostic[];
  readonly evaluatedCount: number;
  readonly grantedCount: number;
  readonly deniedCount: number;
};

export function createEmptyPermissionEvaluationState(): PermissionEvaluationState {
  return {
    __kind: "PermissionEvaluationState",
    __ownsRegistry: false,
    __ownsLifecycle: false,
    records: [],
    diagnostics: [],
    evaluatedCount: 0,
    grantedCount: 0,
    deniedCount: 0,
  };
}
