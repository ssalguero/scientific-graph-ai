/**
 * COLLAB-I8 — ENGINE public-seam adapter (P4 §4.1 · P9 adapters).
 *
 * Observes `@/engine` public surface availability. Does not invoke workflows,
 * commands, lifecycle transitions, or composition bootstrap.
 * COLLAB extends participation conceptually; ENGINE retains execution.
 */

import {
  activateDocument,
  activateWorkspace,
  closeProject,
  configureEngine,
  createProject,
  executeCommand,
  exportProject,
  importDataset,
  initializeApplication,
  openProject,
  saveProject,
  shutdownApplication,
} from "@/engine";

export const COLLAB_ENGINE_SEAM_ID = "collab-engine" as const;

/** P4-documented ENGINE public operation labels (allowlist; not private modules). */
export const COLLAB_ENGINE_PUBLIC_OPERATION_LABELS = [
  "createProject",
  "openProject",
  "closeProject",
  "saveProject",
  "importDataset",
  "exportProject",
  "initializeApplication",
  "activateWorkspace",
  "activateDocument",
  "shutdownApplication",
  "executeCommand",
  "configureEngine",
] as const;

export type CollabEnginePublicOperationLabel =
  (typeof COLLAB_ENGINE_PUBLIC_OPERATION_LABELS)[number];

const ENGINE_PUBLIC_FNS: Record<CollabEnginePublicOperationLabel, unknown> = {
  createProject,
  openProject,
  closeProject,
  saveProject,
  importDataset,
  exportProject,
  initializeApplication,
  activateWorkspace,
  activateDocument,
  shutdownApplication,
  executeCommand,
  configureEngine,
};

export type CollabEngineSeamObservation = {
  readonly seamId: typeof COLLAB_ENGINE_SEAM_ID;
  readonly availableOperations: readonly CollabEnginePublicOperationLabel[];
  readonly missingOperations: readonly string[];
  readonly neverOwnsOrchestration: true;
  readonly replacesEngine: false;
};

/**
 * Read-only: confirm ENGINE public facade exports are functions.
 * Does not call any ENGINE API (non-bypass / non-orchestration).
 */
export function observeEnginePublicSeam(): CollabEngineSeamObservation {
  const available: CollabEnginePublicOperationLabel[] = [];
  const missing: string[] = [];
  for (const label of COLLAB_ENGINE_PUBLIC_OPERATION_LABELS) {
    if (typeof ENGINE_PUBLIC_FNS[label] === "function") {
      available.push(label);
    } else {
      missing.push(label);
    }
  }
  return {
    seamId: COLLAB_ENGINE_SEAM_ID,
    availableOperations: available,
    missingOperations: missing,
    neverOwnsOrchestration: true,
    replacesEngine: false,
  };
}
