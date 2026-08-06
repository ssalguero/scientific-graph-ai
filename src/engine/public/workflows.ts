/**
 * ENGINE Domain — Public Workflow API facades.
 * OWNERSHIP: ENGINE Application API (thin entry; orchestration lives under orchestration/).
 * ENGINE-4: Facades delegate to the default composed WorkflowEngine with Project Product Flows registered.
 * ENGINE-6: importDataset / exportProject are registered on the default composition.
 * Method names frozen — do not invent additional public workflow APIs.
 */

import type { WorkflowResponse } from "../contracts/workflow";
import { getDefaultComposition } from "../internal/compose";

function workflowEngine() {
  return getDefaultComposition().workflowEngine;
}

/** Create Project Product Flow. */
export async function createProject(
  payload?: unknown,
): Promise<WorkflowResponse> {
  return workflowEngine().run({ workflowId: "createProject", payload });
}

/** Open Project Product Flow. */
export async function openProject(
  payload?: unknown,
): Promise<WorkflowResponse> {
  return workflowEngine().run({ workflowId: "openProject", payload });
}

/** Close Project Product Flow. */
export async function closeProject(
  payload?: unknown,
): Promise<WorkflowResponse> {
  return workflowEngine().run({ workflowId: "closeProject", payload });
}

/** Save Project Product Flow. */
export async function saveProject(
  payload?: unknown,
): Promise<WorkflowResponse> {
  return workflowEngine().run({ workflowId: "saveProject", payload });
}

/** Import Dataset Product Flow (ENGINE-6). */
export async function importDataset(
  payload?: unknown,
): Promise<WorkflowResponse> {
  return workflowEngine().run({ workflowId: "importDataset", payload });
}

/**
 * Export Results Product Flow (ENGINE-6).
 * Frozen public name: `exportProject` (Product Flow name: Export Results).
 */
export async function exportProject(
  payload?: unknown,
): Promise<WorkflowResponse> {
  return workflowEngine().run({ workflowId: "exportProject", payload });
}
