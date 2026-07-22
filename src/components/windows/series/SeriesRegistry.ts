/**
 * D60.2 — Series Alignment Foundation · Series Registry.
 * Authority: docs/D60.0-series-discovery.md · API Freeze D60.
 * Pure factory — unique authority for registered series. No UI. No wiring.
 */

import type { SeriesMetadata } from "./SeriesMetadata";
import type { SeriesDefinition, SeriesRegistry } from "./SeriesRegistryTypes";

function cloneMetadata(metadata: SeriesMetadata): SeriesMetadata {
  const next: SeriesMetadata = {};
  if (metadata.title !== undefined) {
    next.title = metadata.title;
  }
  if (metadata.description !== undefined) {
    next.description = metadata.description;
  }
  if (metadata.kind !== undefined) {
    next.kind = metadata.kind;
  }
  if (metadata.attributes !== undefined) {
    next.attributes = { ...metadata.attributes };
  }
  return next;
}

function cloneDefinition(definition: SeriesDefinition): SeriesDefinition {
  const next: SeriesDefinition = {
    id: definition.id,
    kind: definition.kind,
    state: definition.state,
  };
  if (definition.metadata !== undefined) {
    next.metadata = cloneMetadata(definition.metadata);
  }
  return next;
}

/**
 * Creates an isolated in-memory series registry.
 * Duplicate register is a no-op. unregister is safe for missing ids.
 * get / getAll return copies — callers never receive live mutable refs.
 */
export function createSeriesRegistry(): SeriesRegistry {
  const entries = new Map<string, SeriesDefinition>();

  return {
    register(definition: SeriesDefinition): void {
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

    get(id: string): SeriesDefinition | undefined {
      const entry = entries.get(id);
      return entry === undefined ? undefined : cloneDefinition(entry);
    },

    getAll(): readonly SeriesDefinition[] {
      return Array.from(entries.values(), cloneDefinition);
    },
  };
}
