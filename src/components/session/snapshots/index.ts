/**
 * D69.6 — Session Snapshots Foundation · public barrel (audited).
 * Authority: D69 API Freeze.
 * Sole public entry: `@/components/session/snapshots`.
 * Not re-exported from `session/index.ts` (isolation mirror of persistence/restore/autosave).
 *
 * Allowlist (frozen — nothing else):
 *   SnapshotReason
 *   SnapshotId · SNAPSHOT_SCHEMA_VERSION · SessionSnapshot · SessionSnapshotRecord
 *   CreateSessionSnapshotOptions · createSessionSnapshot
 *   SessionSnapshotStore · createSessionSnapshotStore
 *   serializeSessionSnapshot
 *   deserializeSessionSnapshot
 *
 * Prohibido: wildcards · re-exports desde session/ · Persistence · Restore ·
 * Autosave · SessionProvider · SessionContext · Registry
 */

/** Const + type merge — single re-export exposes both under isolatedModules. */
export { SnapshotReason } from "./SnapshotReason";

export { SNAPSHOT_SCHEMA_VERSION } from "./SessionSnapshotTypes";
export type {
  SnapshotId,
  SessionSnapshot,
  SessionSnapshotRecord,
} from "./SessionSnapshotTypes";

export { createSessionSnapshot } from "./SessionSnapshotFactory";
export type { CreateSessionSnapshotOptions } from "./SessionSnapshotFactory";

export { createSessionSnapshotStore } from "./SessionSnapshotStore";
export type { SessionSnapshotStore } from "./SessionSnapshotStore";

export { serializeSessionSnapshot } from "./SessionSnapshotSerializer";

export { deserializeSessionSnapshot } from "./SessionSnapshotDeserializer";
