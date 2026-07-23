/**
 * D66.1 — Session Persistence Foundation · Persistence type contracts.
 * Authority: D66.0 Architecture Freeze · API Freeze.
 * Types only — no runtime logic, no factories, no IndexedDB, no React, no UI.
 */

import type { SessionDefinition } from "../SessionDefinition";
import type { SessionState } from "../SessionState";
import type { SessionEntry, SessionId } from "../SessionTypes";

/**
 * Persistable session payload — isomorphic to SessionEntry.
 * API Freeze: definition + state only.
 * Forbidden: metadata · version · timestamps · snapshot · autosave ·
 * restore · flags · cache · checksum.
 */
export interface SessionPersistenceRecord {
  definition: SessionDefinition;
  state: SessionState;
}

/**
 * Abstract storage port — sole I/O boundary for Session persistence.
 * API Freeze: save / load / clear only.
 * Forbidden: load(id) · delete · update · merge · exists · count.
 * Implementations must not merge on save (replace only).
 * This port does not know IndexedDB, React, or UI.
 */
export interface SessionStorageAdapter {
  save(
    record: SessionPersistenceRecord | SessionPersistenceRecord[]
  ): Promise<void>;

  load(): Promise<SessionPersistenceRecord[]>;

  clear(): Promise<void>;
}

/**
 * Unidirectional write bridge contract (Registry → Storage).
 * API Freeze: persistSession / persistRegistry only.
 * Forbidden: restore · autosave · snapshot · history.
 */
export interface SessionPersistenceBridge {
  persistSession(id: SessionId): Promise<boolean>;

  persistRegistry(): Promise<void>;
}

/** D66.2 — Serializer function contract (pure; not implemented here). */
export type SerializeSession = (
  entry: SessionEntry
) => SessionPersistenceRecord;

/** D66.2 — Registry serializer contract (pure; preserves caller order). */
export type SerializeRegistry = (
  entries: readonly SessionEntry[]
) => SessionPersistenceRecord[];

/** D66.3 — Deserializer function contract (pure; no Registry side effects). */
export type DeserializeSession = (
  record: SessionPersistenceRecord
) => SessionEntry;

/**
 * D66.3 — Registry deserializer contract (pure).
 * Returns SessionEntry[] only — never registers, creates, or mutates Registry.
 */
export type DeserializeRegistry = (
  records: readonly SessionPersistenceRecord[]
) => SessionEntry[];
