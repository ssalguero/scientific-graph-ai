/**
 * AI-I4 — Workflow Guidance lifecycle (architectural only).
 * No runtime guidance. No Product Flow orchestration.
 */

export type AiWorkflowGuidanceLifecycle = {
  readonly capabilityId: "workflow-guidance";
  readonly state: "inactive";
  readonly runtimeGuidance: false;
  readonly executesWorkflows: false;
  readonly orchestratesProductFlows: false;
};

export const AI_WORKFLOW_GUIDANCE_LIFECYCLE: AiWorkflowGuidanceLifecycle = {
  capabilityId: "workflow-guidance",
  state: "inactive",
  runtimeGuidance: false,
  executesWorkflows: false,
  orchestratesProductFlows: false,
};
