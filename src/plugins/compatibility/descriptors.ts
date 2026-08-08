/**
 * PLUGINS-I7 — Compatibility descriptors (P4 Compatibility Strategy).
 *
 * Conceptual dimensions only — no package manager, dependency resolver, or runtime loading.
 */

export type CompatibilityDimension =
  | "PublicPluginContract"
  | "Version"
  | "Contract"
  | "Platform"
  | "DependencyConceptual";

export type CompatibilityStatus =
  | "Compatible"
  | "Incompatible"
  | "Indeterminate";

export type CompatibilityFinding = {
  readonly __kind: "CompatibilityFinding";
  readonly __advisory: true;
  readonly dimension: CompatibilityDimension;
  readonly status: CompatibilityStatus;
  readonly subject?: string;
  readonly message: string;
};

export type CompatibilityDiagnostic =
  | { readonly code: "COMPAT_EVALUATED"; readonly message: string }
  | { readonly code: "INCOMPATIBLE_CONTRACT"; readonly message: string }
  | { readonly code: "MISSING_CONTRACT_SURFACE"; readonly message: string }
  | { readonly code: "VERSION_INDETERMINATE"; readonly message: string }
  | { readonly code: "DEPENDENCY_CONCEPTUAL_ONLY"; readonly message: string };
