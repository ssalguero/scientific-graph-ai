/**
 * AI-I4 — Workflow Guidance capability identity.
 *
 * Authority: AI-P3 §6.7 · AI-P1 Ownership Model · ENGINE execution ownership
 * Guides workflows. Never executes. ENGINE remains sole execution authority.
 */

export const AI_WORKFLOW_GUIDANCE_ID = "workflow-guidance" as const;

export const AI_WORKFLOW_GUIDANCE_PURPOSE =
  "Guide workflows; never execute (ENGINE owns execution)" as const;

export const AI_WORKFLOW_GUIDANCE_RESPONSIBILITY =
  "Guide users through complex operations without owning or executing Product Flows" as const;

export const AI_WORKFLOW_GUIDANCE_NEVER_OWNS = [
  "product-flows",
  "workflow-execution",
  "engine-coordination-authority",
] as const;

/** Sole workflow execution authority (ENGINE). */
export const AI_WORKFLOW_EXECUTION_OWNER = "ENGINE" as const;

/** Guidance never executes Product Flows. */
export const AI_WORKFLOW_GUIDANCE_EXECUTES = false as const;

export type AiWorkflowGuidanceId = typeof AI_WORKFLOW_GUIDANCE_ID;
