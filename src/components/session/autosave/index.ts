/**
 * D68.1 — Session Autosave Foundation · public barrel.
 * Authority: D68.0 Architecture Freeze · API Freeze.
 * Sole public entry: `@/components/session/autosave`.
 * Not re-exported from `session/index.ts` (isolation mirror of persistence/restore).
 *
 * Allowlist (frozen — nothing else):
 *   AUTOSAVE_DEBOUNCE_MS
 *   AutosaveMutationKind · AutosaveMutationEvent
 *   SessionAutosaveController · SessionAutosaveControllerOptions
 *   createSessionAutosaveController
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
