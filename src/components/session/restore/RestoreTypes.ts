/**
 * D67.1 / D67.5 — Session Restore Foundation · Restore type contracts.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Types only — factory implementation lives in SessionRestoreEngine.ts.
 */

import type { SessionRegistry } from "../SessionRegistry";
import type { SessionId } from "../SessionTypes";
import type { SessionPersistenceRecord } from "../persistence/SessionPersistenceTypes";
import type { RestoreReport } from "./RestoreReport";

/** API Freeze — restore outcome classification. */
export type RestoreStatus = "success" | "partial" | "failed";

/**
 * API Freeze — sync restore input.
 * `registry` travels on the request; engine remains stateless.
 * Input is SessionPersistenceRecord[] (D66) — not SessionSnapshot (D69).
 */
export interface RestoreRequest {
  readonly records: readonly SessionPersistenceRecord[];
  readonly registry: SessionRegistry;
}

/** API Freeze — restore counters. */
export interface RestoreStatistics {
  readonly requested: number;
  readonly restored: number;
  readonly skipped: number;
  readonly failed: number;
}

/** API Freeze — restore outcome payload. */
export interface RestoreResult {
  readonly status: RestoreStatus;
  readonly report: RestoreReport;
  readonly statistics: RestoreStatistics;
  readonly restoredIds: readonly SessionId[];
}

/**
 * API Freeze — Session Restore Engine surface.
 * Sync only. No overloads. No Promise. IO happens before the engine.
 */
export interface SessionRestoreEngine {
  restore(request: RestoreRequest): RestoreResult;
}
