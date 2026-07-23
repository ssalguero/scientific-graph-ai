/**
 * D68.1–D68.3 — Session Autosave Foundation · public barrel.
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Sole public entry: `@/components/session/autosave`.
 * Not re-exported from `session/index.ts` (isolation mirror of persistence/restore).
 *
 * Allowlist (frozen — nothing else):
 *   AUTOSAVE_DEBOUNCE_MS
 *   AutosaveMutationKind · AutosaveMutationEvent
 *   SessionAutosaveController · SessionAutosaveControllerOptions
 *   createSessionAutosaveController
 *   DirtyTracker · DirtyTrackerSnapshot · createDirtyTracker (D68.2)
 *   AutosaveScheduler · AutosaveSchedulerOptions · createAutosaveScheduler (D68.3)
 */

export {
  AUTOSAVE_DEBOUNCE_MS,
  createSessionAutosaveController,
} from "./AutosaveTypes";

export type {
  AutosaveMutationKind,
  AutosaveMutationEvent,
  SessionAutosaveController,
  SessionAutosaveControllerOptions,
} from "./AutosaveTypes";

export { createDirtyTracker } from "./DirtyTracker";

export type { DirtyTracker, DirtyTrackerSnapshot } from "./DirtyTracker";

export { createAutosaveScheduler } from "./AutosaveScheduler";

export type {
  AutosaveScheduler,
  AutosaveSchedulerOptions,
} from "./AutosaveScheduler";
