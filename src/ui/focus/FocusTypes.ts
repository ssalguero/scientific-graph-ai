/**
 * UX-8.1 — Focus System foundation types.
 * Branded focus target identity — no React · no WindowRegistry.
 *
 * Window references use windowId: string via asFocusTargetId(windowId).
 */

export type FocusTargetId = string & { readonly __brand: "FocusTargetId" };

export function asFocusTargetId(id: string): FocusTargetId {
  return id as FocusTargetId;
}
