/** UX state for the local autosave indicator (presentation derives labels). */
export type AutosaveIndicatorState =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "error";

/** Size classification relative to a soft warning threshold. */
export type ProjectSizeWarningTier = "none" | "approaching" | "exceeded";

/** Result of assessing serialized project size against a threshold. */
export type ProjectSizeAssessment = {
  tier: ProjectSizeWarningTier;
  byteLength: number;
  thresholdBytes: number;
  issueCodes: string[];
};
