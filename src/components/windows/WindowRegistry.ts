/**
 * D55.3 — Multi-Window Foundation · Window Registry.
 * Autocontained Map store. No React. No UI. No external module imports.
 * Authority: docs/D55.1-multi-window-discovery.md · D55.2 API Freeze (unchanged).
 */

import type { WindowDefinition } from "./WindowTypes";

/** Frozen registry surface — D55.1 Multi-Window API Freeze. */
export type WindowRegistry = {
  register(definition: WindowDefinition): void;
  unregister(id: string): void;
  has(id: string): boolean;
  get(id: string): WindowDefinition | undefined;
  getAll(): readonly WindowDefinition[];
};

function cloneDefinition(definition: WindowDefinition): WindowDefinition {
  const next: WindowDefinition = {
    id: definition.id,
    title: definition.title,
    visible: definition.visible,
  };
  if (definition.dockId !== undefined) {
    next.dockId = definition.dockId;
  }
  if (definition.metadata !== undefined) {
    next.metadata = { ...definition.metadata };
  }
  return next;
}

/**
 * Creates an isolated in-memory window registry.
 * - Map storage (insertion order preserved)
 * - Duplicate register is a no-op
 * - unregister is safe for missing ids
 * - get / getAll return defensive copies (no live mutable refs)
 */
export function createWindowRegistry(): WindowRegistry {
  const entries = new Map<string, WindowDefinition>();

  return {
    register(definition: WindowDefinition): void {
      if (entries.has(definition.id)) {
        return;
      }
      entries.set(definition.id, cloneDefinition(definition));
    },

    unregister(id: string): void {
      entries.delete(id);
    },

    has(id: string): boolean {
      return entries.has(id);
    },

    get(id: string): WindowDefinition | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : cloneDefinition(entry);
    },

    getAll(): readonly WindowDefinition[] {
      return Array.from(entries.values(), cloneDefinition);
    },
  };
}
