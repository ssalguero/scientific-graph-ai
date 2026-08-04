/**
 * UX-6.8 — Context Menu System foundation types.
 * Immutable identity only — no React, no execution.
 */

export type ContextMenuId = string & { readonly __brand: "ContextMenuId" };

export function asContextMenuId(id: string): ContextMenuId {
  return id as ContextMenuId;
}
