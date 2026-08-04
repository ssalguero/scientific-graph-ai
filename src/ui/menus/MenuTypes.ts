/**
 * UX-6.6 — Menu System foundation types.
 * Immutable identity only — no React, no execution.
 */

export type MenuId = string & { readonly __brand: "MenuId" };

export function asMenuId(id: string): MenuId {
  return id as MenuId;
}
