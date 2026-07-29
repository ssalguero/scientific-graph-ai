/**
 * D70.4 — Restore Points Foundation · Restore Point Deserializer.
 * Authority: D70.0 Architecture Freeze · HR-rp-serdes-pure · HR-rp-schema-v1 ·
 * HR-rp-consume-d69 · HR-rp-no-storage.
 * Pure function only: RestorePointRecord → RestorePoint.
 * No I/O, IndexedDB, React, Registry, Provider, or Adapter.
 */

import { deserializeSessionSnapshot } from "@/components/session/snapshots";

import {
  RestorePointOrigin,
  type RestorePointMetadata,
  type RestorePointOrigin as RestorePointOriginType,
} from "./RestorePointMetadata";
import {
  RESTORE_POINT_SCHEMA_VERSION,
  type RestorePoint,
  type RestorePointRecord,
} from "./RestorePointTypes";

const RESTORE_POINT_ORIGINS: ReadonlySet<string> = new Set(
  Object.values(RestorePointOrigin)
);

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

function assertRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid RestorePointRecord: missing or empty "${field}"`);
  }
  return value;
}

function assertRequiredNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid RestorePointRecord: missing or invalid "${field}"`);
  }
  return value;
}

function assertOrigin(value: unknown): RestorePointOriginType {
  if (typeof value !== "string" || !RESTORE_POINT_ORIGINS.has(value)) {
    throw new Error(
      `Invalid RestorePointRecord: unsupported origin "${String(value)}"`
    );
  }
  return value as RestorePointOriginType;
}

function assertMetadata(value: unknown): RestorePointMetadata {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid RestorePointRecord: missing or invalid "metadata"`);
  }

  const raw = value as {
    readonly correlationId?: unknown;
    readonly tags?: unknown;
  };

  if (
    raw.correlationId !== undefined &&
    typeof raw.correlationId !== "string"
  ) {
    throw new Error(
      `Invalid RestorePointRecord: metadata.correlationId must be a string`
    );
  }

  if (raw.tags !== undefined) {
    if (
      !Array.isArray(raw.tags) ||
      !raw.tags.every((tag) => typeof tag === "string")
    ) {
      throw new Error(
        `Invalid RestorePointRecord: metadata.tags must be readonly string[]`
      );
    }
  }

  return cloneMetadata({
    ...(raw.correlationId !== undefined
      ? { correlationId: raw.correlationId }
      : {}),
    ...(raw.tags !== undefined ? { tags: raw.tags as readonly string[] } : {}),
  });
}

/**
 * RestorePointRecord → RestorePoint.
 * Gates RESTORE_POINT_SCHEMA_VERSION (D69 schema-gate pattern), validates
 * required fields, and rehydrates the encapsulated SessionSnapshot exclusively
 * via D69 deserializeSessionSnapshot.
 * Never returns input references.
 */
export function deserializeRestorePoint(
  record: RestorePointRecord
): RestorePoint {
  if (record.schemaVersion !== RESTORE_POINT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported RestorePoint schemaVersion: ${record.schemaVersion} (expected ${RESTORE_POINT_SCHEMA_VERSION})`
    );
  }

  if (record.snapshot === null || typeof record.snapshot !== "object") {
    throw new Error(
      `Invalid RestorePointRecord: missing or invalid embedded SessionSnapshot`
    );
  }

  const id = assertRequiredString(record.id, "id");
  const name = assertRequiredString(record.name, "name");
  const createdAt = assertRequiredNumber(record.createdAt, "createdAt");
  const origin = assertOrigin(record.origin);
  const metadata = assertMetadata(record.metadata);

  if (
    record.description !== undefined &&
    typeof record.description !== "string"
  ) {
    throw new Error(
      `Invalid RestorePointRecord: "description" must be a string when present`
    );
  }

  const snapshot = deserializeSessionSnapshot(record.snapshot);

  return {
    id,
    name,
    ...(record.description !== undefined
      ? { description: record.description }
      : {}),
    createdAt,
    origin,
    snapshot,
    metadata,
  };
}
