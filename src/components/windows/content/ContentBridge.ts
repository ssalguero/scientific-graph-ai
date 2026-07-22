/**
 * D63.5 — Lifecycle + Tab ↔ Series Wiring · Content Bridge.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · API Freeze D63.5.
 * Authorized resolve path OpaqueContentHandle → ContentDefinition | undefined.
 * No owned storage. No cache. No Registry mutation. No UI.
 *
 * Hard Rules:
 * - HR-no-content-cache — resolve always calls ContentRegistry.get
 * - HR-registry-ssot — Registry remains sole catalog; Bridge does not duplicate state
 * - HR-registry-decoupled — no TabRegistry / SeriesRegistry / WindowManager awareness
 * - HR-opaque-handle-ssot — lookup key = handle.contentId ≡ ContentDefinition.id
 * - HR-no-scientific — no scientific domain imports
 * - HR-no-workspace-shell — no workspace/ imports
 * - Consume OpaqueContentHandle via tabs barrel only
 */

import type { OpaqueContentHandle } from "../tabs";
import type { ContentDefinition } from "./ContentTypes";
import type { ContentRegistry } from "./ContentRegistry";

/**
 * Frozen content resolve surface — sole authorized path handle → definition.
 */
export type ContentBridge = {
  resolve(handle: OpaqueContentHandle): ContentDefinition | undefined;
};

/**
 * Creates a ContentBridge bound to a ContentRegistry.
 * Every resolve delegates to registry.get(handle.contentId) — never caches.
 * Does not register, unregister, or otherwise mutate the Registry.
 */
export function createContentBridge(registry: ContentRegistry): ContentBridge {
  return {
    resolve(handle: OpaqueContentHandle): ContentDefinition | undefined {
      return registry.get(handle.contentId);
    },
  };
}
