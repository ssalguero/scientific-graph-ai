/**
 * D63.3 — Lifecycle + Tab ↔ Series Wiring · Content Slots.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · API Freeze D63.3.
 * Types only — no runtime, no storage, no registry, no bridge, no UI, no React.
 *
 * Architecture (LOCKED):
 *   ContentSlots = typed binding catalog (caller-owned)
 *   ContentRegistry = SSOT of ContentDefinition (D63.2)
 *   ContentBridge = sole resolve path (D63.5)
 *   Slots ≠ Registry ≠ Bridge
 *
 * Hard Rules:
 * - HR-registry-decoupled — no TabRegistry / SeriesRegistry / TabId / SeriesId
 * - HR-content-def-opaque — slots bind contentId only; no renderer payloads
 * - HR-no-scientific — no scientific domain imports
 * - HR-no-workspace-shell — no workspace/ imports
 */

/**
 * One content identity binding (slot).
 * Must not embed ContentDefinition, ReactNode, TabId, SeriesId, or domain payloads.
 * Lookup key aligns with OpaqueContentHandle.contentId / ContentDefinition.id.
 */
export type ContentSlot = {
  contentId: string;
};

/**
 * Map of contentId → ContentSlot (insertion/order ownership is caller-side).
 * Not a Registry — no storage authority, no mutation API, no resolve.
 * Catalog shape only for typed composition in later microfases.
 */
export type ContentSlots = ReadonlyMap<string, ContentSlot>;
