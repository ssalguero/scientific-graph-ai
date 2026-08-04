/**
 * UX-6.1 — Command System foundation types.
 * Immutable identity only — no runtime behavior, no React.
 */

export type CommandId = string & { readonly __brand: "CommandId" };

export function asCommandId(id: string): CommandId {
  return id as CommandId;
}
