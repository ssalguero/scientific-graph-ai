/**
 * UX-7.1 — Visibility Foundation types.
 * Immutable identity only — no runtime behavior, no React.
 */

export type VisibilityId = string & { readonly __brand: "VisibilityId" };

export function asVisibilityId(id: string): VisibilityId {
  return id as VisibilityId;
}
