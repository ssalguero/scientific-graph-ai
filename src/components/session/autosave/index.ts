/**
 * D68.7 — Session Autosave Foundation · public barrel (audited).
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Sole public entry: `@/components/session/autosave`.
 * Not re-exported from `session/index.ts` (isolation mirror of persistence/restore).
 *
 * Allowlist (frozen — nothing else):
 *   AUTOSAVE_DEBOUNCE_MS
 *   AutosaveMutationKind · AutosaveMutationEvent
 *   SessionAutosaveController · SessionAutosaveControllerOptions
 *   createSessionAutosaveController
 *   DirtyTracker · DirtyTrackerSnapshot · createDirtyTracker
 *   AutosaveScheduler · AutosaveSchedulerOptions · createAutosaveScheduler
 *   AutosaveFlushOperation · AutosaveFlushPolicy · createAutosaveFlushPolicy
 *
 * Prohibido: timers internos · helpers privados · Bridge · Adapter · Persistence ·
 * Restore · SessionProvider · SessionContext · re-export desde session/index.ts
 */

export { AUTOSAVE_DEBOUNCE_MS } from "./AutosaveTypes";

export type {
  AutosaveMutationKind,
  AutosaveMutationEvent,
  SessionAutosaveController,
  SessionAutosaveControllerOptions,
} from "./AutosaveTypes";

export { createSessionAutosaveController } from "./SessionAutosaveController";

export { createDirtyTracker } from "./DirtyTracker";

export type { DirtyTracker, DirtyTrackerSnapshot } from "./DirtyTracker";

export { createAutosaveScheduler } from "./AutosaveScheduler";

export type {
  AutosaveScheduler,
  AutosaveSchedulerOptions,
} from "./AutosaveScheduler";

export { createAutosaveFlushPolicy } from "./AutosaveFlushPolicy";

export type {
  AutosaveFlushOperation,
  AutosaveFlushPolicy,
} from "./AutosaveFlushPolicy";
