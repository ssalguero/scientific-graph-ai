/**
 * D63.1 — Lifecycle + Tab ↔ Series Wiring · Content Types.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · API Freeze D63.1.
 * Types only — no runtime, no registry, no bridge, no host, no UI, no React.
 *
 * Architecture (LOCKED):
 *   OpaqueContentHandle.contentId ≡ ContentDefinition.id
 *   ContentDefinition is deliberately opaque — no renderer fields in D63.
 *
 * Hard Rules:
 * - HR-content-def-opaque — { id, kind, title } only
 * - HR-no-scientific — no scientific domain imports
 * - HR-no-workspace-shell — no workspace/ imports
 * - HR-host-no-ownership — ContentHostProps is props contract only (Host = D63.6)
 */

/**
 * Opaque registered content record — infrastructure identity only.
 * Must not include component, factory, renderer, props, or metadata in D63.
 * Lookup key `id` equals OpaqueContentHandle.contentId (D62).
 */
export type ContentDefinition = {
  id: string;
  kind: string;
  title: string;
};

/**
 * Presentational host props contract (Host implementation = D63.6).
 * Host consumes `contentId` only — does not create, register, or destroy content.
 */
export type ContentHostProps = {
  contentId: string;
};
