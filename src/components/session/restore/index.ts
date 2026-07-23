/**
 * D67.1–D67.5 — Session Restore Foundation · public barrel.
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
