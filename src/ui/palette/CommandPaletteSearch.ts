/**
 * UX-6.5 — Command Palette Search (structural query only).
 *
 * search(index, text) → readonly CommandId[]
 * Never inspects Index internals (no .tokens / .map / .lookup).
 * No fuzzy · no ranking · no score · no history · no execution · no React.
 */

import type { CommandId } from "../commands/CommandTypes";
import {
  getCommandPaletteIndexEntries,
  matchCommandPaletteIndex,
  type CommandPaletteIndex,
} from "./CommandPaletteIndex";

/**
 * Structural palette search over an opaque index.
 *
 * - trim(); empty → all CommandIds in catalog order
 * - case-insensitive substring / token match
 * - preserves catalog order; one appearance per CommandId
 */
export function search(
  index: CommandPaletteIndex,
  text: string,
): readonly CommandId[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return getCommandPaletteIndexEntries(index);
  }
  return matchCommandPaletteIndex(index, trimmed.toLowerCase());
}
