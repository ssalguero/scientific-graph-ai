import { GUIDED_WORKFLOW_TEMPLATE_CATALOG } from "./catalog";
import type { GuidedWorkflowContext } from "./context";
import {
  buildCompareGroupsWorkflowSteps,
  buildEvaluatePublicationWorkflowSteps,
  buildExploreStructureWorkflowSteps,
} from "./templates";
import type {
  GuidedWorkflowPlan,
  GuidedWorkflowStep,
  GuidedWorkflowTemplateId,
} from "./types";
import type { GuidedWorkflowToggleKey } from "./toggles";

export const resolveGuidedWorkflowStepToggles = (
  step: GuidedWorkflowStep,
  ctx: GuidedWorkflowContext
): GuidedWorkflowToggleKey[] => {
  const resolved = [...step.toggles];
  if (step.conditionalToggles) {
    resolved.push(...step.conditionalToggles(ctx));
  }
  return [...new Set(resolved)];
};

export const buildGuidedWorkflowPlan = (
  templateId: GuidedWorkflowTemplateId,
  ctx: GuidedWorkflowContext
): GuidedWorkflowPlan | null => {
  if (ctx.seriesCount < 2 || ctx.totalObservations === 0) {
    return null;
  }

  const catalogEntry = GUIDED_WORKFLOW_TEMPLATE_CATALOG.find(
    (entry) => entry.id === templateId
  );
  if (!catalogEntry) return null;

  let steps: GuidedWorkflowStep[];
  switch (templateId) {
    case "compare-groups":
      steps = buildCompareGroupsWorkflowSteps();
      break;
    case "explore-structure":
      steps = buildExploreStructureWorkflowSteps();
      break;
    case "evaluate-publication":
      steps = buildEvaluatePublicationWorkflowSteps();
      break;
    default:
      return null;
  }

  return {
    templateId,
    templateTitle: catalogEntry.title,
    templateDescription: catalogEntry.description,
    steps,
    estimatedSteps: steps.length,
  };
};
