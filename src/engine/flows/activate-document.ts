/**
 * Product Flow — Activate Document.
 * OWNERSHIP: ENGINE
 * Orchestrates LifecycleCoordinator.activateDocument → DocumentEngine via WorkflowEngine.
 */

import type { LifecycleCoordinator } from "../orchestration/LifecycleCoordinator";
import type { WorkflowDefinition } from "../orchestration/definition";
import type { WorkflowExecutionContext } from "../orchestration/context";

export const FLOW_ID = "activateDocument" as const;

export const DOCUMENT_ACTIVATE_COMMAND_ID = "document.activate" as const;

/** Build a WorkflowDefinition bound to a LifecycleCoordinator instance. */
export function createActivateDocumentFlow(
  lifecycleCoordinator: LifecycleCoordinator,
): WorkflowDefinition {
  return {
    id: FLOW_ID,
    execute: async (ctx: WorkflowExecutionContext) => {
      ctx.diagnostics.record({
        operationId: ctx.operationId,
        workflowId: FLOW_ID,
        state: ctx.state,
        stage: "execution",
        message: "activateDocument",
      });
      await lifecycleCoordinator.activateDocument(ctx.payload);
      const documentEngine = lifecycleCoordinator.getDocumentEngine();
      ctx.result = {
        phase: lifecycleCoordinator.getPhase(),
        documentId: documentEngine.getActiveDocumentId(),
        document: documentEngine.getActiveDocumentId()
          ? documentEngine.getDocument(documentEngine.getActiveDocumentId()!)
          : undefined,
      };
    },
  };
}
