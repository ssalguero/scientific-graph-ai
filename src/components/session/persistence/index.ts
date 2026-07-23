/**
 * D66.6 — Session Persistence Foundation · public barrel.
 * Authority: D66.0 Architecture Freeze · D66.1 API Freeze.
 * Sole public entry: `@/components/session/persistence`.
 * Not re-exported from `session/index.ts` (D65 barrel remains intact).
 */

export type {
  SessionPersistenceRecord,
  SessionStorageAdapter,
  SessionPersistenceBridge,
  SerializeSession,
  SerializeRegistry,
  DeserializeSession,
  DeserializeRegistry,
} from "./SessionPersistenceTypes";

export { createSessionStorageAdapter } from "./SessionStorageAdapter";

export { createSessionPersistenceBridge } from "./SessionPersistenceBridge";

export { serializeSession, serializeRegistry } from "./SessionSerializer";

export {
  deserializeSession,
  deserializeRegistry,
} from "./SessionDeserializer";
