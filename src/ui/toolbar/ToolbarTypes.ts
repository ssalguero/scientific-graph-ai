/**
 * UX-6.7 — Toolbar System foundation types.
 * Immutable identity only — no React, no execution.
 */

export type ToolbarId = string & { readonly __brand: "ToolbarId" };

export function asToolbarId(id: string): ToolbarId {
  return id as ToolbarId;
}
