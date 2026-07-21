/**
 * D55.2 — Multi-Window Foundation · Window Registry.
 * Autocontained Map store. No React. No UI. No external module imports.
 * Authority: docs/D55.1-multi-window-discovery.md
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

/**
 * Creates an isolated in-memory window registry.
 * Public mutators: register / unregister. Queries: has / get / getAll.
 */
export function createWindowRegistry(): WindowRegistry {
  const entries = new Map<string, WindowDefinition>();

  return {
    register(definition: WindowDefinition): void {
      entries.set(definition.id, definition);
    },
    unregister(id: string): void {
      entries.delete(id);
    },
    has(id: string): boolean {
      return entries.has(id);
    },
    get(id: string): WindowDefinition | undefined {
      return entries.get(id);
    },
    getAll(): readonly WindowDefinition[] {
      return Array.from(entries.values());
    },
  };
}
