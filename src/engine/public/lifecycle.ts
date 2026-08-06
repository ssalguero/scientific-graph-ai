/**
 * ENGINE Domain — Public Lifecycle API facades.
 * OWNERSHIP: ENGINE application lifecycle (≠ Runtime platform).
 * ENGINE-7: Facades delegate to the default composed LifecycleCoordinator.
 * Method names frozen — do not invent additional public lifecycle APIs.
 *
 * Lifecycle Product Flows (`initializeApplication`, `activateWorkspace`,
 * `activateDocument`, `shutdownApplication`) are also registered on WorkflowEngine
 * for business commands (`app.initialize`, `workspace.activate`, `document.activate`,
 * `app.shutdown`). Public LifecycleApi remains Promise<void>.
 */

import { getDefaultComposition } from "../internal/compose";

function lifecycleCoordinator() {
  return getDefaultComposition().lifecycleCoordinator;
}

/** Initialize application lifecycle (ENGINE orchestration — not Runtime infra). */
export async function initializeApplication(payload?: unknown): Promise<void> {
  return lifecycleCoordinator().initializeApplication(payload);
}

/** Activate a workspace (ENGINE orchestration — Platform owns workspace infra). */
export async function activateWorkspace(payload?: unknown): Promise<void> {
  return lifecycleCoordinator().activateWorkspace(payload);
}

/** Activate a document via Document Engine (ENGINE-owned registry). */
export async function activateDocument(payload?: unknown): Promise<void> {
  return lifecycleCoordinator().activateDocument(payload);
}

/** Shutdown application lifecycle and clear ENGINE active state. */
export async function shutdownApplication(payload?: unknown): Promise<void> {
  return lifecycleCoordinator().shutdownApplication(payload);
}
