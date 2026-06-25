/**
 * Frozen regression baseline for ÉPICA B — Trusted Data Ingress.
 * Used by validation gates; do not change without explicit baseline revision.
 */
export const EPIC_B_BASELINE = {
  dataset5: {
    evidence: 82.7,
    readiness: 77.0,
    overall: 77.0,
  },
  dataset6: {
    evidence: 73.3,
    readiness: 67.5,
    overall: 67.5,
  },
  rwCases: ["RW-01", "RW-02", "RW-03", "RW-04"] as const,
} as const;

export type EpicBRegressionCase = (typeof EPIC_B_BASELINE.rwCases)[number];
