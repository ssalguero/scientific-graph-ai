/**
 * D66.3 — Session Persistence Foundation · Session Deserializer.
 * Authority: D66.0 Architecture Freeze · D66.1 API Freeze · HR-deserialize-pure ·
 * HR-deserialize-no-register · HR-serialize-identity.
 * Pure functions only — no I/O, no async, no React, no IndexedDB, no Registry mutation.
 */

import type { SessionDefinition } from "../SessionDefinition";
import { cloneSessionState } from "../SessionState";
import type { SessionEntry } from "../SessionTypes";
import type {
  DeserializeRegistry,
  DeserializeSession,
  SessionPersistenceRecord,
} from "./SessionPersistenceTypes";

/**
 * Deterministic deep clone shared strategy with D66.2 Serializer.
 * Prefer structuredClone; fall back to field-wise JSON-safe copies so the
 * result is independent of the incoming payload references.
 */
function clonePersistenceRecord(
  record: SessionPersistenceRecord
): SessionPersistenceRecord {
  if (typeof structuredClone === "function") {
    return structuredClone(record);
  }

  const definition: SessionDefinition = {
    id: record.definition.id,
    createdAt: record.definition.createdAt,
    ...(record.definition.title !== undefined
      ? { title: record.definition.title }
      : {}),
    ...(record.definition.metadata !== undefined
      ? { metadata: { ...record.definition.metadata } }
      : {}),
  };

  return {
    definition,
    state: cloneSessionState(record.state),
  };
}

/**
 * SessionPersistenceRecord → SessionEntry.
 * Reconstructs only definition + state. No register, no Registry access,
 * no extra metadata / version / timestamps / snapshot / flags / cache.
 */
export const deserializeSession: DeserializeSession = (
  record: SessionPersistenceRecord
): SessionEntry => {
  const cloned = clonePersistenceRecord(record);
  return {
    definition: cloned.definition,
    state: cloned.state,
  };
};

/**
 * SessionPersistenceRecord[] → SessionEntry[].
 * Preserves input order exactly — no sort, filter, transform, or drop.
 * Never registers sessions or mutates SessionRegistry.
 */
export const deserializeRegistry: DeserializeRegistry = (
  records: readonly SessionPersistenceRecord[]
): SessionEntry[] => {
  const entries: SessionEntry[] = [];
  for (const record of records) {
    entries.push(deserializeSession(record));
  }
  return entries;
};
