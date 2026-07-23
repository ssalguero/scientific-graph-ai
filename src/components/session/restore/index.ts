/**
 * D67.1 — Session Restore Foundation · public barrel.
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
