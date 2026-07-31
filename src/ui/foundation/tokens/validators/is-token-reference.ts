import { isTokenRef, type TokenRef } from "../types/references";

/** Type guard: value is a branded TokenRef. */
export function isTokenReference(value: unknown): value is TokenRef {
  return isTokenRef(value);
}
