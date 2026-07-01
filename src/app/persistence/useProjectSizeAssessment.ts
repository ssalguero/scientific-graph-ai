"use client";

import { useMemo } from "react";

import { buildProjectSizeAssessmentView } from "./persistenceViews";
import type { ProjectSizeAssessmentView } from "./types";

export type UseProjectSizeAssessmentParams = {
  byteLength: number;
  issueCodes?: string[];
};

export function useProjectSizeAssessment(
  params: UseProjectSizeAssessmentParams
): ProjectSizeAssessmentView {
  const issueCodesKey = params.issueCodes?.join("|") ?? "";

  return useMemo(
    () =>
      buildProjectSizeAssessmentView({
        byteLength: params.byteLength,
        issueCodes: params.issueCodes,
      }),
    [params.byteLength, issueCodesKey]
  );
}
