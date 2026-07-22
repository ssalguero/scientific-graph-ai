/**
 * D65.4 — Session Foundation · Session Registry.
 * Authority: D65.0 API Freeze · HR-factory-registry · HR-def-state-split.
 * Pattern: WindowRegistry / SeriesRegistry — factory → private Map → pure API → clone-on-read/write.
 * No React. No persistence. No singleton. No static storage.
 */

import { createSessionDefinition } from "./SessionDefinition";
import type { SessionDefinition } from "./SessionDefinition";
import { cloneSessionState } from "./SessionState";
import type { SessionState } from "./SessionState";
import type { SessionEntry, SessionId } from "./SessionTypes";

/** Frozen registry surface — D65.4 Session API Freeze. */
export type SessionRegistry = {
  register(entry: SessionEntry): boolean;
  unregister(id: SessionId): boolean;
  get(id: SessionId): SessionEntry | undefined;
  list(): readonly SessionEntry[];
  updateState(id: SessionId, patch: Partial<SessionState>): boolean;
};

function cloneDefinition(definition: SessionDefinition): SessionDefinition {
  return createSessionDefinition({
    id: definition.id,
    createdAt: definition.createdAt,
    ...(definition.title !== undefined ? { title: definition.title } : {}),
    ...(definition.metadata !== undefined
      ? { metadata: definition.metadata }
      : {}),
  });
}

function cloneEntry(entry: SessionEntry): SessionEntry {
  return {
    definition: cloneDefinition(entry.definition),
    state: cloneSessionState(entry.state),
  };
}

function mergeState(
  current: SessionState,
  patch: Partial<SessionState>
): SessionState {
  const activeTabId =
    patch.activeTabId !== undefined ? patch.activeTabId : current.activeTabId;
  const layoutId =
    patch.layoutId !== undefined ? patch.layoutId : current.layoutId;

  return {
    windowIds:
      patch.windowIds !== undefined
        ? patch.windowIds.slice()
        : current.windowIds.slice(),
    tabIds:
      patch.tabIds !== undefined
        ? patch.tabIds.slice()
        : current.tabIds.slice(),
    updatedAt:
      patch.updatedAt !== undefined ? patch.updatedAt : Date.now(),
    ...(activeTabId !== undefined ? { activeTabId } : {}),
    ...(layoutId !== undefined ? { layoutId } : {}),
  };
}

/**
 * Creates an isolated in-memory session registry.
 * - Private Map storage (insertion order preserved)
 * - Duplicate register returns false
 * - get / list return defensive clones (no live mutable refs)
 * - updateState patches SessionState only; definition preserved
 */
export function createSessionRegistry(): SessionRegistry {
  const entries = new Map<SessionId, SessionEntry>();

  return {
    register(entry: SessionEntry): boolean {
      const id = entry.definition.id;
      if (entries.has(id)) {
        return false;
      }
      entries.set(id, cloneEntry(entry));
      return true;
    },

    unregister(id: SessionId): boolean {
      return entries.delete(id);
    },

    get(id: SessionId): SessionEntry | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : cloneEntry(entry);
    },

    list(): readonly SessionEntry[] {
      return Array.from(entries.values(), cloneEntry);
    },

    updateState(id: SessionId, patch: Partial<SessionState>): boolean {
      const existing = entries.get(id);
      if (existing === undefined) {
        return false;
      }

      entries.set(id, {
        definition: cloneDefinition(existing.definition),
        state: mergeState(existing.state, patch),
      });
      return true;
    },
  };
}
