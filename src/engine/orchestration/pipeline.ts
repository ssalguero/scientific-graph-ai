/**
 * ENGINE Domain — Workflow Engine pipeline stages (ENGINE-internal).
 * OWNERSHIP: ENGINE owns Product Flow stage sequencing.
 * Canonical pipeline (SoT / MASTER ROADMAP):
 *   User Request → Business Validation → Workflow Planning → Service Coordination
 *     → Execution → Verification → Completion
 * ENGINE-2: Stage identifiers + ordered skeleton (stages may be no-ops).
 */

/** Ordered pipeline stage identifiers. */
export type WorkflowPipelineStage =
  | "userRequest"
  | "businessValidation"
  | "workflowPlanning"
  | "serviceCoordination"
  | "execution"
  | "verification"
  | "completion";

/** Canonical stage order — do not reorder without architecture revision. */
export const WORKFLOW_PIPELINE_STAGES: readonly WorkflowPipelineStage[] = [
  "userRequest",
  "businessValidation",
  "workflowPlanning",
  "serviceCoordination",
  "execution",
  "verification",
  "completion",
] as const;
