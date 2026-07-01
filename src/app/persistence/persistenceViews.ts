import {
  detectPersistenceConflict,
  shouldBlockHydrate,
  type DetectPersistenceConflictInput,
} from "@/lib/project/application/persistence-conflict";
import {
  deriveAutosaveIndicatorState,
  type DeriveAutosaveIndicatorInput,
} from "@/lib/project/application/persistence-status";
import {
  assessProjectSizeWarning,
  type AssessProjectSizeWarningInput,
} from "@/lib/project/application/persistence-size";
import { PROJECT_SIZE_WARN_BYTES } from "@/lib/project/constants";
import {
  formatAutosaveIndicatorState,
  formatPersistenceConflictPrompt,
  formatProjectSizeWarning,
  getProjectSizeWarningFeedbackKind,
  type FormatPersistenceConflictPromptOptions,
} from "@/lib/project/userMessages";

import type {
  AutosaveIndicatorView,
  PersistenceConflictView,
  ProjectSizeAssessmentView,
  ProjectSizeUiState,
} from "./types";

const AUTOSAVE_INDICATOR_CLASS: Record<
  AutosaveIndicatorView["state"],
  string
> = {
  idle: "text-[var(--app-text-muted)]",
  pending: "text-amber-700",
  saving: "text-[var(--app-accent)]",
  saved: "text-emerald-700",
  error: "text-[var(--app-danger-text)]",
};

const mapSizeTierToUiState = (
  tier: ProjectSizeAssessmentView["assessment"]["tier"]
): ProjectSizeUiState => {
  if (tier === "exceeded") return "critical";
  if (tier === "approaching") return "warning";
  return "normal";
};

export const buildPersistenceConflictView = (
  input: DetectPersistenceConflictInput,
  promptOptions?: FormatPersistenceConflictPromptOptions
): PersistenceConflictView => {
  const { conflict } = detectPersistenceConflict(input);

  if (!conflict) {
    return {
      uiState: "none",
      conflict: null,
      shouldBlock: false,
      prompt: null,
    };
  }

  return {
    uiState: conflict.severity === "blocking" ? "blocking" : "warning",
    conflict,
    shouldBlock: shouldBlockHydrate(conflict),
    prompt: formatPersistenceConflictPrompt(conflict, promptOptions),
  };
};

export const buildAutosaveIndicatorView = (
  input: DeriveAutosaveIndicatorInput
): AutosaveIndicatorView => {
  const { state } = deriveAutosaveIndicatorState(input);
  return {
    state,
    label: formatAutosaveIndicatorState(state),
    className: AUTOSAVE_INDICATOR_CLASS[state],
  };
};

export const buildProjectSizeAssessmentView = (
  input: Pick<AssessProjectSizeWarningInput, "byteLength" | "issueCodes">
): ProjectSizeAssessmentView => {
  const assessment = assessProjectSizeWarning({
    byteLength: input.byteLength,
    thresholdBytes: PROJECT_SIZE_WARN_BYTES,
    issueCodes: input.issueCodes,
  });

  return {
    assessment,
    uiState: mapSizeTierToUiState(assessment.tier),
    message: formatProjectSizeWarning(assessment),
    feedbackKind: getProjectSizeWarningFeedbackKind(assessment.tier),
  };
};
