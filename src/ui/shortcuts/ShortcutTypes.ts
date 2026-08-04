/**
 * UX-6.4 — Shortcut System foundation types.
 * Immutable identity only — no browser events, no React.
 */

export type ShortcutId = string & { readonly __brand: "ShortcutId" };

export type ShortcutKey = string & { readonly __brand: "ShortcutKey" };

export function asShortcutId(id: string): ShortcutId {
  return id as ShortcutId;
}

export function asShortcutKey(key: string): ShortcutKey {
  return key as ShortcutKey;
}
