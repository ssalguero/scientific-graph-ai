import type { PersistenceConflict } from "@/lib/project/domain/persistence-conflict";
import type {
  AutosaveIndicatorState,
  ProjectSizeAssessment,
} from "@/lib/project/domain/persistence-status";
import type { ProjectFileFeedbackKind } from "@/lib/project/userMessages";

export type PersistenceConflictUiState = "none" | "warning" | "blocking";

export type ProjectSizeUiState = "normal" | "warning" | "critical";

export type PersistenceConflictView = {
  uiState: PersistenceConflictUiState;
  conflict: PersistenceConflict | null;
  shouldBlock: boolean;
  prompt: string | null;
};

export type AutosaveIndicatorView = {
  state: AutosaveIndicatorState;
  label: string;
  className: string;
};

export type ProjectSizeAssessmentView = {
  assessment: ProjectSizeAssessment;
  uiState: ProjectSizeUiState;
  message: string | null;
  feedbackKind: ProjectFileFeedbackKind | null;
};
