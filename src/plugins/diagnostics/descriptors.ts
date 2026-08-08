/**
 * PLUGINS-I8 — Diagnostic descriptors (descriptive only).
 */

export type DiagnosticSubsystem =
  | "Foundation"
  | "Framework"
  | "Registry"
  | "Discovery"
  | "Registration"
  | "Capabilities"
  | "Permissions"
  | "PublicContracts"
  | "Lifecycle"
  | "Compatibility"
  | "Validation";

export type DiagnosticSeverity = "Info" | "Warning" | "Error" | "Status";

export type DiagnosticEntry = {
  readonly __kind: "DiagnosticEntry";
  readonly __descriptive: true;
  readonly __mutable: false;
  readonly subsystem: DiagnosticSubsystem;
  readonly code: string;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
};

export type DiagnosticAdapterId =
  | "structural-status"
  | "compatibility-report"
  | "validation-report"
  | "lifecycle-records";
