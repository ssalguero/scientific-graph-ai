/**
 * D66.5 — Session Persistence Foundation · Session Persistence Bridge.
 * Authority: D66.0 Architecture Freeze · D66.1 API Freeze · HR-bridge-unidirectional ·
 * HR-bridge-idb-agnostic · HR-persist-registry-fidelity.
 * Write-only: Registry → Serializer → Adapter. No restore, autosave, IndexedDB, or React.
 */

import type { SessionRegistry } from "../SessionRegistry";
import type { SessionId } from "../SessionTypes";
import { serializeRegistry, serializeSession } from "./SessionSerializer";
import type {
  SessionPersistenceBridge,
  SessionStorageAdapter,
} from "./SessionPersistenceTypes";

/**
 * Factory — returns the frozen SessionPersistenceBridge surface.
 * Depends only on SessionRegistry + SessionStorageAdapter port + Serializer.
 * Does not call load/clear, does not mutate Registry, does not know IndexedDB.
 */
export function createSessionPersistenceBridge(
  registry: SessionRegistry,
  adapter: SessionStorageAdapter
): SessionPersistenceBridge {
  return {
    async persistSession(id: SessionId): Promise<boolean> {
      const entry = registry.get(id);
      if (entry === undefined) {
        return false;
      }
      const record = serializeSession(entry);
      await adapter.save(record);
      return true;
    },

    async persistRegistry(): Promise<void> {
      // serializeRegistry uses registry.list() insertion order — no sort/filter/transform.
      const records = serializeRegistry(registry);
      await adapter.save(records);
    },
  };
}
