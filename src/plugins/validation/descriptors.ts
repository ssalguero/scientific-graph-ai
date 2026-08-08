/**
 * PLUGINS-I7 — Validation descriptors (compliance concerns).
 */

export type ValidationConcern =
  | "PlanningCompliance"
  | "ArchitecturalCompliance"
  | "OwnershipCompliance"
  | "RegistryIsolation"
  | "PublicContractIntegrity"
  | "LifecycleIntegrity"
  | "CompatibilityReportIntegrity";

export type ValidationOutcome = "Pass" | "Fail" | "NotApplicable";

export type ValidationFinding = {
  readonly __kind: "ValidationFinding";
  readonly concern: ValidationConcern;
  readonly outcome: ValidationOutcome;
  readonly message: string;
};

export type ValidationDiagnostic =
  | { readonly code: "VALIDATION_CERTIFIED"; readonly message: string }
  | { readonly code: "COMPATIBILITY_REPORT_CONSUMED"; readonly message: string }
  | { readonly code: "COMPATIBILITY_REPORT_INVALID"; readonly message: string }
  | { readonly code: "COMPLIANCE_FAILURE"; readonly message: string; readonly concern: ValidationConcern };
