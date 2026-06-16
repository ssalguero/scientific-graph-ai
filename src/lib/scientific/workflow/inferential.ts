import type { GuidedWorkflowContext } from "./context";
import type { GuidedWorkflowToggleKey } from "./toggles";

export const resolveInferentialWorkflowToggles = (
  ctx: GuidedWorkflowContext
): GuidedWorkflowToggleKey[] => {
  const assessments = ctx.canonicalNormalityAssessment.seriesAssessments;
  const allNormal =
    assessments.length > 0 &&
    assessments.every(
      (item) =>
        item.conclusion === "normal" || item.conclusion === "probably-normal"
    );
  const anyNonNormal = assessments.some(
    (item) =>
      item.conclusion === "non-normal" ||
      item.conclusion === "questionable" ||
      item.conclusion === "contradictory"
  );

  if (allNormal && !anyNonNormal) {
    if (ctx.seriesCount === 2) return ["showTTest"];
    if (ctx.seriesCount >= 3) return ["showAnova", "showPostHoc"];
    return [];
  }

  if (ctx.seriesCount >= 2) return ["showNonParametric"];
  return [];
};
