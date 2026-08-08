/**
 * PLUGINS-I7 — Validation / certification report model.
 * Reports only — never activates or executes.
 */

import type {
  ValidationDiagnostic,
  ValidationFinding,
  ValidationOutcome,
} from "./descriptors";

export type ValidationReport = {
  readonly __kind: "ValidationReport";
  readonly __certification: true;
  readonly __executionImplied: false;
  readonly __mutatesRegistry: false;
  readonly __mutatesLifecycle: false;
  readonly __reEvaluatedCompatibility: false;
  readonly overall: ValidationOutcome;
  readonly findings: readonly ValidationFinding[];
  readonly diagnostics: readonly ValidationDiagnostic[];
  readonly compatibilityOverall?: string;
};

export function createEmptyValidationReport(): ValidationReport {
  return {
    __kind: "ValidationReport",
    __certification: true,
    __executionImplied: false,
    __mutatesRegistry: false,
    __mutatesLifecycle: false,
    __reEvaluatedCompatibility: false,
    overall: "NotApplicable",
    findings: [],
    diagnostics: [],
  };
}
