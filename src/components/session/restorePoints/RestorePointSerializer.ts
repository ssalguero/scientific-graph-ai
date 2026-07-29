/**
 * D70.4 — Restore Points Foundation · Restore Point Serializer.
 * Authority: D70.0 Architecture Freeze · HR-rp-serdes-pure · HR-rp-schema-v1 ·
 * HR-rp-consume-d69 · HR-rp-no-storage.
 * Pure function only: RestorePoint → RestorePointRecord.
 * No I/O, IndexedDB, React, Registry, Provider, or Adapter.
 */

import { serializeSessionSnapshot } from "@/components/session/snapshots";

import type { RestorePointMetadata } from "./RestorePointMetadata";
import {
  RESTORE_POINT_SCHEMA_VERSION,
  type RestorePoint,
  type RestorePointRecord,
} from "./RestorePointTypes";

/**
 * Defensive clone of descriptive metadata — never retains input refs.
 */
function cloneMetadata(metadata: RestorePointMetadata): RestorePointMetadata {
  return {
    ...(metadata.correlationId !== undefined
      ? { correlationId: metadata.correlationId }
      : {}),
    ...(metadata.tags !== undefined ? { tags: [...metadata.tags] } : {}),
  };
}

/**
 * RestorePoint → RestorePointRecord.
 * Embeds RESTORE_POINT_SCHEMA_VERSION and serializes the encapsulated
 * SessionSnapshot exclusively via D69 serializeSessionSnapshot.
 * Never mutates the input.
 */
export function serializeRestorePoint(
  restorePoint: RestorePoint
): RestorePointRecord {
  return {
    schemaVersion: RESTORE_POINT_SCHEMA_VERSION,
    id: restorePoint.id,
    name: restorePoint.name,
    ...(restorePoint.description !== undefined
      ? { description: restorePoint.description }
      : {}),
    createdAt: restorePoint.createdAt,
    origin: restorePoint.origin,
    snapshot: serializeSessionSnapshot(restorePoint.snapshot),
    metadata: cloneMetadata(restorePoint.metadata),
  };
}
