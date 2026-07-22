/**
 * D63.2 — Lifecycle + Tab ↔ Series Wiring · Content Registry.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · API Freeze D63.2.
 * Pure factory — unique SSOT for registered ContentDefinition. No UI. No tabs. No series.
 *
 * Hard Rules:
 * - HR-registry-ssot — this registry is the sole content catalog
 * - HR-registry-decoupled — ContentRegistry ≠ TabRegistry; no tab/series awareness
 * - HR-content-def-opaque — stores { id, kind, title } only
 * - HR-no-scientific — no scientific domain imports
 * - HR-no-workspace-shell — no workspace/ imports
 */

import type { ContentDefinition } from "./ContentTypes";

/**
 * Frozen registry surface — unique authority for registered content.
 * Operations: register / unregister / get / list.
 */
export type ContentRegistry = {
  register(definition: ContentDefinition): void;
  unregister(id: string): void;
  get(id: string): ContentDefinition | undefined;
  list(): readonly ContentDefinition[];
};

function cloneDefinition(definition: ContentDefinition): ContentDefinition {
  return {
    id: definition.id,
    kind: definition.kind,
    title: definition.title,
  };
}

/**
 * Creates an isolated in-memory content registry.
 * Duplicate register is a no-op. unregister is safe for missing ids.
 * get / list return copies — callers never receive live mutable refs.
 * list() preserves Map insertion order.
 */
export function createContentRegistry(): ContentRegistry {
  const entries = new Map<string, ContentDefinition>();

  return {
    register(definition: ContentDefinition): void {
      if (entries.has(definition.id)) {
        return;
      }
      entries.set(definition.id, cloneDefinition(definition));
    },

    unregister(id: string): void {
      entries.delete(id);
    },

    get(id: string): ContentDefinition | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : cloneDefinition(entry);
    },

    list(): readonly ContentDefinition[] {
      return Array.from(entries.values(), cloneDefinition);
    },
  };
}
