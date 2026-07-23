/**
 * D67.8 — Session Restore Foundation · public barrel (final).
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Sole public entry: `@/components/session/restore`.
 * Not re-exported from `session/index.ts` (isolation mirror of persistence/).
 *
 * Allowlist (frozen — nothing else):
 *   Types:    RestoreStatus · RestoreRequest · RestoreStatistics ·
 *             RestoreResult · SessionRestoreEngine
 *   Engine:   createSessionRestoreEngine
 *   Errors:   RestoreError · MissingSnapshot · CorruptedSnapshot ·
 *             UnsupportedVersion · RegistryFailure · ValidationFailure
 *   Validator: RestoreValidator · createRestoreValidator
 *   Report:   RestoreReport · createRestoreReport
 */

export type {
  RestoreStatus,
  RestoreRequest,
  RestoreStatistics,
  RestoreResult,
  SessionRestoreEngine,
} from "./RestoreTypes";

export { createSessionRestoreEngine } from "./SessionRestoreEngine";

export type {
  RestoreError,
  MissingSnapshot,
  CorruptedSnapshot,
  UnsupportedVersion,
  RegistryFailure,
  ValidationFailure,
} from "./RestoreErrors";

export type { RestoreValidator } from "./RestoreValidator";
export { createRestoreValidator } from "./RestoreValidator";

export type { RestoreReport } from "./RestoreReport";
export { createRestoreReport } from "./RestoreReport";
