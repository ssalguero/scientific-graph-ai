/**
 * D70.5 — Restore Points Foundation · public barrel (audited).
 * Authority: D70.0 Architecture Freeze · HR-rp-barrel-isolation · HR-rp-allowlist ·
 * HR-rp-no-reexport.
 * Sole public entry: `@/components/session/restorePoints`.
 * Not re-exported from `session/index.ts` nor `snapshots/index.ts`
 * (isolation mirror of persistence/restore/autosave/snapshots).
 *
 * Allowlist (frozen — nothing else):
 *   RestorePointOrigin · RestorePointMetadata
 *   RestorePointId · RESTORE_POINT_SCHEMA_VERSION · RestorePointSchemaVersion
 *   RestorePoint · RestorePointRecord
 *   CreateRestorePointOptions · createRestorePoint
 *   RestorePointRegistry · createRestorePointRegistry
 *   serializeRestorePoint
 *   deserializeRestorePoint
 *
 * Prohibido: wildcards · re-exports desde session/ · snapshots/ · Persistence ·
 * Restore · Autosave · SessionProvider · SessionContext · SessionRegistry
 */

/** Const + type merge — single re-export exposes both under isolatedModules. */
export { RestorePointOrigin } from "./RestorePointMetadata";
export type { RestorePointMetadata } from "./RestorePointMetadata";

export { RESTORE_POINT_SCHEMA_VERSION } from "./RestorePointTypes";
export type {
  RestorePointId,
  RestorePointSchemaVersion,
  RestorePoint,
  RestorePointRecord,
} from "./RestorePointTypes";

export { createRestorePoint } from "./RestorePointFactory";
export type { CreateRestorePointOptions } from "./RestorePointFactory";

export { createRestorePointRegistry } from "./RestorePointRegistry";
export type { RestorePointRegistry } from "./RestorePointRegistry";

export { serializeRestorePoint } from "./RestorePointSerializer";

export { deserializeRestorePoint } from "./RestorePointDeserializer";
