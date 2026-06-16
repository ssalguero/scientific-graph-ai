import type { GuidedWorkflowContext } from "./context";
import type { GuidedWorkflowToggleKey } from "./toggles";

export type GuidedWorkflowWorkspaceTab =
  | "data"
  | "analysis"
  | "results"
  | "reports";

export type GuidedWorkflowInspectorSection =
  | "visualization"
  | "statistics"
  | "inference"
  | "advisor";

export type GuidedWorkflowTemplateId =
  | "compare-groups"
  | "explore-structure"
  | "evaluate-publication";

export type GuidedWorkflowStatus =
  | "idle"
  | "active"
  | "completed"
  | "cancelled";

export type GuidedWorkflowStep = {
  id: string;
  title: string;
  explanation: string;
  workspaceTab: GuidedWorkflowWorkspaceTab;
  inspectorSection?: GuidedWorkflowInspectorSection;
  toggles: GuidedWorkflowToggleKey[];
  conditionalToggles?: (
    ctx: GuidedWorkflowContext
  ) => GuidedWorkflowToggleKey[];
  navigateAfterApply?: boolean;
};

export type GuidedWorkflowPlan = {
  templateId: GuidedWorkflowTemplateId;
  templateTitle: string;
  templateDescription: string;
  steps: GuidedWorkflowStep[];
  estimatedSteps: number;
};

export type GuidedWorkflowSession = {
  status: GuidedWorkflowStatus;
  templateId: GuidedWorkflowTemplateId | null;
  currentStepIndex: number;
  completedStepIds: string[];
  skippedStepIds: string[];
  startedAt: string | null;
  completedAt: string | null;
};

export type { GuidedWorkflowContext } from "./context";
export type {
  GuidedWorkflowToggleKey,
  GuidedWorkflowToggleSetters,
} from "./toggles";
