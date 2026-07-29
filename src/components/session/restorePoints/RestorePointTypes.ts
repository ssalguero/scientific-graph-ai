/**
 * D70.1 — Restore Points Foundation · RestorePoint type contracts.
 * Authority: D70.0 Architecture Freeze · HR-rp-on-snapshot · HR-rp-immutable ·
 * HR-rp-snapshot-identity · HR-rp-consume-only.
 * Types only — no runtime logic, factories, registry, serializer, React, or I/O.
 */

import type {
  SessionSnapshot,
  SessionSnapshotRecord,
} from "@/components/session/snapshots";

import type {
  RestorePointMetadata,
  RestorePointOrigin,
} from "./RestorePointMetadata";

/** Opaque restore-point identity — plain string alias (repo pattern). */
export type RestorePointId = string;

/** Wire / schema version for RestorePointRecord. */
export const RESTORE_POINT_SCHEMA_VERSION = 1 as const;

/** Alias of the frozen schema version literal. */
export type RestorePointSchemaVersion = typeof RESTORE_POINT_SCHEMA_VERSION;

/**
 * Immutable in-memory restore point.
 * Encapsulates a complete SessionSnapshot (D69) — never owns SessionState directly.
 * Once created, the encapsulated snapshot identity must never be replaced.
 */
export interface RestorePoint {
  readonly id: RestorePointId;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: number;
  readonly origin: RestorePointOrigin;
  readonly snapshot: SessionSnapshot;
  readonly metadata: RestorePointMetadata;
}

/**
 * Serializable restore-point payload (schema-versioned).
 * Embeds SessionSnapshotRecord — serialize/deserialize only; no I/O here.
 */
export interface RestorePointRecord {
  readonly schemaVersion: RestorePointSchemaVersion;
  readonly id: RestorePointId;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: number;
  readonly origin: RestorePointOrigin;
  readonly snapshot: SessionSnapshotRecord;
  readonly metadata: RestorePointMetadata;
}
