/**
 * UX-6.5 — Command Palette Index (opaque search structure).
 *
 * Public contract: branded opaque handle + factory.
 * Internals (tokens / maps / keyword derivation) stay private via WeakMap.
 * Search and Diagnostics query through helpers — never via index fields.
 * No React · no execution · no fuzzy ranking.
 */

import type { CommandId } from "../commands/CommandTypes";
import type { CommandPaletteDefinition } from "./CommandPaletteDefinition";

/**
 * Opaque public Index contract.
 * No readable fields besides the brand — storage implementation is private.
 */
export type CommandPaletteIndex = Readonly<{
  readonly __brand: "CommandPaletteIndex";
}>;

type IndexInternals = Readonly<{
  orderedIds: readonly CommandId[];
  /** Lowercased haystacks per command (id + derived keyword tokens). */
  haystacks: ReadonlyMap<CommandId, readonly string[]>;
  keywords: readonly string[];
  duplicatedKeywords: readonly string[];
}>;

const indexStore = new WeakMap<CommandPaletteIndex, IndexInternals>();

/**
 * Derives transient keyword tokens from a commandId.
 * Example: "system.catalog" → ["system", "catalog", "system.catalog"]
 * Not persisted on CommandPaletteDefinition.
 */
function deriveKeywords(commandId: CommandId): readonly string[] {
  const id = String(commandId).toLowerCase();
  const parts = id.split(".").filter((part) => part.length > 0);
  const tokens = [...parts];
  if (!tokens.includes(id)) {
    tokens.push(id);
  }
  return Object.freeze(tokens);
}

function requireInternals(index: CommandPaletteIndex): IndexInternals {
  const internals = indexStore.get(index);
  if (internals === undefined) {
    throw new Error("Invalid CommandPaletteIndex handle.");
  }
  return internals;
}

/**
 * Builds an opaque index from a palette catalog projection.
 * Keywords are derived only during construction.
 */
export function createCommandPaletteIndex(
  catalog: readonly CommandPaletteDefinition[],
): CommandPaletteIndex {
  const orderedIds: CommandId[] = [];
  const haystacks = new Map<CommandId, readonly string[]>();
  const keywordOwners = new Map<string, Set<CommandId>>();

  for (const entry of catalog) {
    const commandId = entry.commandId;
    orderedIds.push(commandId);

    const keywords = deriveKeywords(commandId);
    const haystack = Object.freeze([
      String(commandId).toLowerCase(),
      ...keywords,
    ]);
    haystacks.set(commandId, haystack);

    for (const keyword of keywords) {
      let owners = keywordOwners.get(keyword);
      if (owners === undefined) {
        owners = new Set();
        keywordOwners.set(keyword, owners);
      }
      owners.add(commandId);
    }
  }

  const allKeywords = Object.freeze([...keywordOwners.keys()].sort());
  const duplicatedKeywords = Object.freeze(
    [...keywordOwners.entries()]
      .filter(([, owners]) => owners.size > 1)
      .map(([keyword]) => keyword)
      .sort(),
  );

  const handle: CommandPaletteIndex = Object.freeze({
    __brand: "CommandPaletteIndex" as const,
  });

  indexStore.set(
    handle,
    Object.freeze({
      orderedIds: Object.freeze(orderedIds),
      haystacks,
      keywords: allKeywords,
      duplicatedKeywords,
    }),
  );

  return handle;
}

/**
 * Returns indexed CommandIds in catalog order.
 * Public helper for Search / Diagnostics — does not expose storage shape.
 */
export function getCommandPaletteIndexEntries(
  index: CommandPaletteIndex,
): readonly CommandId[] {
  return requireInternals(index).orderedIds;
}

/**
 * Structural match over opaque index internals.
 * Expects already-trimmed, lowercased query text (non-empty).
 */
export function matchCommandPaletteIndex(
  index: CommandPaletteIndex,
  normalizedQuery: string,
): readonly CommandId[] {
  const { orderedIds, haystacks } = requireInternals(index);
  const matches: CommandId[] = [];

  for (const commandId of orderedIds) {
    const haystack = haystacks.get(commandId);
    if (haystack === undefined) continue;
    const hit = haystack.some((token) => token.includes(normalizedQuery));
    if (hit) {
      matches.push(commandId);
    }
  }

  return Object.freeze(matches);
}

/**
 * Keyword stats for diagnostics — no internal maps exported.
 */
export function getCommandPaletteIndexKeywordReport(
  index: CommandPaletteIndex,
): Readonly<{
  keywords: readonly string[];
  duplicatedKeywords: readonly string[];
}> {
  const internals = requireInternals(index);
  return Object.freeze({
    keywords: internals.keywords,
    duplicatedKeywords: internals.duplicatedKeywords,
  });
}
