import type { ProjectSizeAssessment } from "../../domain/persistence-status";

export type AssessProjectSizeWarningInput = {
  byteLength: number;
  thresholdBytes: number;
  issueCodes?: string[];
};

/** Ratio of threshold at which size is classified as approaching (80%). */
export const PROJECT_SIZE_APPROACHING_RATIO = 0.8;

const SIZE_ISSUE_CODES = new Set(["S-SIZE", "P-SIZE"]);

export const assessProjectSizeWarning = (
  input: AssessProjectSizeWarningInput
): ProjectSizeAssessment => {
  const issueCodes = [...new Set(input.issueCodes ?? [])].filter((code) =>
    SIZE_ISSUE_CODES.has(code)
  );
  const approachingThreshold = Math.floor(
    input.thresholdBytes * PROJECT_SIZE_APPROACHING_RATIO
  );

  let tier: ProjectSizeAssessment["tier"] = "none";
  if (
    input.byteLength > input.thresholdBytes ||
    issueCodes.some((code) => SIZE_ISSUE_CODES.has(code))
  ) {
    tier = "exceeded";
  } else if (input.byteLength >= approachingThreshold) {
    tier = "approaching";
  }

  return {
    tier,
    byteLength: input.byteLength,
    thresholdBytes: input.thresholdBytes,
    issueCodes,
  };
};
