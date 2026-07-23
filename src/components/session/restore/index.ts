/**
 * D67.1–D67.2 — Session Restore Foundation · public barrel.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Sole public entry: `@/components/session/restore`.
 * Not re-exported from `session/index.ts` (D65 barrel remains intact).
 */

export type {
  RestoreStatus,
  RestoreRequest,
  RestoreStatistics,
  RestoreResult,
  SessionRestoreEngine,
} from "./RestoreTypes";

export { createSessionRestoreEngine } from "./RestoreTypes";

export type {
  RestoreError,
  MissingSnapshot,
  CorruptedSnapshot,
  UnsupportedVersion,
  RegistryFailure,
  ValidationFailure,
} from "./RestoreErrors";
