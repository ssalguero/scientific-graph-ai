/**
 * D66.2 — Session Persistence Foundation · Session Serializer.
 * Authority: D66.0 Architecture Freeze · D66.1 API Freeze · HR-serialize-pure · HR-serialize-identity.
 * Pure functions only — no I/O, no async, no React, no IndexedDB, no Registry mutation.
 */

import type { SessionDefinition } from "../SessionDefinition";
import type { SessionRegistry } from "../SessionRegistry";
import { cloneSessionState } from "../SessionState";
import type { SessionEntry } from "../SessionTypes";
import type {
  SerializeSession,
  SessionPersistenceRecord,
} from "./SessionPersistenceTypes";

/**
 * Deterministic deep clone of a persistence record.
 * Prefer structuredClone; fall back to field-wise JSON-safe copies so the
 * result is independent of Registry-owned references.
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
 * SessionEntry → SessionPersistenceRecord.
 * Copies only definition + state. No extra metadata, version, timestamps,
 * snapshot, flags, cache, or restore info.
 */
export const serializeSession: SerializeSession = (
  entry: SessionEntry
): SessionPersistenceRecord =>
  clonePersistenceRecord({
    definition: entry.definition,
    state: entry.state,
  });

/**
 * SessionRegistry → SessionPersistenceRecord[].
 * Uses registry.list() insertion order exactly — no sort, filter, transform,
 * or drop. Each entry is serialized via serializeSession.
 */
export function serializeRegistry(
  registry: SessionRegistry
): SessionPersistenceRecord[] {
  const entries = registry.list();
  const records: SessionPersistenceRecord[] = [];
  for (const entry of entries) {
    records.push(serializeSession(entry));
  }
  return records;
}
