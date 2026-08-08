/**
 * PLUGINS-I7 — Compatibility report model.
 * Advisory until consumed by Validation. Never implies execution.
 */

import type {
  CompatibilityDiagnostic,
  CompatibilityFinding,
  CompatibilityStatus,
} from "./descriptors";

export type CompatibilityReport = {
  readonly __kind: "CompatibilityReport";
  readonly __advisory: true;
  readonly __executionImplied: false;
  readonly __mutatesRegistry: false;
  readonly __mutatesLifecycle: false;
  readonly overall: CompatibilityStatus;
  readonly findings: readonly CompatibilityFinding[];
  readonly diagnostics: readonly CompatibilityDiagnostic[];
  readonly contractId?: string;
  readonly evaluatedAtLabel: "structural";
};

export function createEmptyCompatibilityReport(): CompatibilityReport {
  return {
    __kind: "CompatibilityReport",
    __advisory: true,
    __executionImplied: false,
    __mutatesRegistry: false,
    __mutatesLifecycle: false,
    overall: "Indeterminate",
    findings: [],
    diagnostics: [],
    evaluatedAtLabel: "structural",
  };
}
