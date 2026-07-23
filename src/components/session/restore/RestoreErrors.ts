/**
 * D67.2 — Session Restore Foundation · Restore error models.
 * Authority: D67.0 Architecture Freeze · API Freeze.
 * Data-only discriminated unions — no throw, no functions, no React, no IO.
 */

import type { SessionId } from "../SessionTypes";

/**
 * Missing restore payload (empty / absent `records`).
 * Freeze name `MissingSnapshot` preserved — not D69 SessionSnapshot.
 */
export interface MissingSnapshot {
  readonly kind: "MissingSnapshot";
  readonly message: string;
}

/**
 * Corrupted / unreadable SessionPersistenceRecord or restore payload.
 * Freeze name `CorruptedSnapshot` preserved — maps to record corruption.
 */
export interface CorruptedSnapshot {
  readonly kind: "CorruptedSnapshot";
  readonly message: string;
  readonly index?: number;
  readonly sessionId?: SessionId;
}

/**
 * Unsupported / invalid payload shape.
 * Reserved for future compatibility — D67 does not validate schemaVersion.
 */
export interface UnsupportedVersion {
  readonly kind: "UnsupportedVersion";
  readonly message: string;
}

/**
 * SessionRegistry.register rejected (e.g. duplicate id → false).
 */
export interface RegistryFailure {
  readonly kind: "RegistryFailure";
  readonly sessionId: SessionId;
  readonly message: string;
}

/**
 * RestoreValidator rejected structure / ids / required / metadata / duplicates.
 */
export interface ValidationFailure {
  readonly kind: "ValidationFailure";
  readonly message: string;
  readonly index?: number;
  readonly sessionId?: SessionId;
  readonly field?: string;
}

/** API Freeze — union of all restore error models. */
export type RestoreError =
  | MissingSnapshot
  | CorruptedSnapshot
  | UnsupportedVersion
  | RegistryFailure
  | ValidationFailure;
