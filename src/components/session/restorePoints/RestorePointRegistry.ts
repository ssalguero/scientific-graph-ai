/**
 * D70.3 — Restore Points Foundation · Restore Point Registry.
 * Authority: D70.0 Architecture Freeze · HR-rp-map-ssot · HR-rp-clone-on-read ·
 * HR-rp-immutable · HR-rp-snapshot-identity · HR-rp-surface-freeze.
 * In-memory Map SSOT only — no persistence, React, SessionRegistry, snapshots
 * barrel, serializer, or singleton.
 */

import type { RestorePointMetadata } from "./RestorePointMetadata";
import type { RestorePoint, RestorePointId } from "./RestorePointTypes";

/** Frozen registry surface — D70.3 Restore Point Registry API Freeze. */
export type RestorePointRegistry = {
  create(restorePoint: RestorePoint): boolean;
  get(id: RestorePointId): RestorePoint | undefined;
  remove(id: RestorePointId): boolean;
  clear(): void;
  list(): readonly RestorePoint[];
  count(): number;
};

type EncapsulatedSnapshot = RestorePoint["snapshot"];
type EncapsulatedState = EncapsulatedSnapshot["state"];

/**
 * Defensive clone of encapsulated SessionState — structural only.
 * Does not import SessionState / snapshots (HR-rp consume via types only).
 */
function cloneEncapsulatedState(state: EncapsulatedState): EncapsulatedState {
  return {
    windowIds: [...state.windowIds],
    tabIds: [...state.tabIds],
    ...(state.activeTabId !== undefined
      ? { activeTabId: state.activeTabId }
      : {}),
    ...(state.layoutId !== undefined ? { layoutId: state.layoutId } : {}),
    updatedAt: state.updatedAt,
  };
}

/**
 * Defensive clone of the encapsulated SessionSnapshot.
 * Preserves snapshot identity (id / sessionId / createdAt / reason) —
 * never replaces identity (HR-rp-snapshot-identity).
 */
function cloneEncapsulatedSnapshot(
  snapshot: EncapsulatedSnapshot
): EncapsulatedSnapshot {
  return {
    id: snapshot.id,
    sessionId: snapshot.sessionId,
    createdAt: snapshot.createdAt,
    reason: snapshot.reason,
    state: cloneEncapsulatedState(snapshot.state),
  };
}

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
 * Defensive clone of a RestorePoint (clone-on-read / clone-on-write).
 * Does not mutate the source; does not replace snapshot identity.
 */
function cloneRestorePoint(restorePoint: RestorePoint): RestorePoint {
  return {
    id: restorePoint.id,
    name: restorePoint.name,
    ...(restorePoint.description !== undefined
      ? { description: restorePoint.description }
      : {}),
    createdAt: restorePoint.createdAt,
    origin: restorePoint.origin,
    snapshot: cloneEncapsulatedSnapshot(restorePoint.snapshot),
    metadata: cloneMetadata(restorePoint.metadata),
  };
}

/**
 * Creates an isolated in-memory restore-point registry.
 * - Private Map storage (insertion order preserved) — Map SSOT
 * - Duplicate create returns false
 * - get / list return defensive clones (no live mutable refs)
 * - No update / replace / rename / mutate
 */
export function createRestorePointRegistry(): RestorePointRegistry {
  const restorePoints = new Map<RestorePointId, RestorePoint>();

  return {
    create(restorePoint: RestorePoint): boolean {
      const id = restorePoint.id;
      if (restorePoints.has(id)) {
        return false;
      }
      restorePoints.set(id, cloneRestorePoint(restorePoint));
      return true;
    },

    get(id: RestorePointId): RestorePoint | undefined {
      const existing = restorePoints.get(id);
      return existing === undefined ? undefined : cloneRestorePoint(existing);
    },

    remove(id: RestorePointId): boolean {
      return restorePoints.delete(id);
    },

    clear(): void {
      restorePoints.clear();
    },

    list(): readonly RestorePoint[] {
      return Array.from(restorePoints.values(), cloneRestorePoint);
    },

    count(): number {
      return restorePoints.size;
    },
  };
}
