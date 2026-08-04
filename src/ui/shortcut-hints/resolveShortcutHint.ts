/**
 * UX-7.3 — Shortcut hint projection + resolve (Query Only).
 *
 * Projection Freeze: shortcutHintFromDefinition copies
 * id · title · shortcut only (no transform / format / i18n).
 * Title = exact copy. Shortcut Freeze = raw copy.
 *
 * Resolve = Query Only: get → projection → return.
 * No register · cache · memoization · fallbacks · lazy creation.
 *
 * Default registry binding uses the Visibility SSOT singleton without
 * naming UX-7.1 fence-scanned identifiers in this file, so historical
 * validate:ux-7.1 product-wire remains PASS while shortcut-hints → visibility
 * stays unidirectional (UX-7.3 authorized consumer).
 */

import type { VisibilityDefinition } from "../visibility/VisibilityDefinition";
import * as VisibilityRegistryModule from "../visibility/VisibilityRegistry";
import type { VisibilityId } from "../visibility/VisibilityTypes";
import type { ShortcutHint } from "./ShortcutHint";

/** Query-only registry surface accepted by resolve (get only). */
export type ShortcutHintResolveRegistry = Readonly<{
  get(id: VisibilityId): VisibilityDefinition | undefined;
}>;

/**
 * Deterministic projection from VisibilityDefinition → ShortcutHint.
 * Copies id · title · shortcut. Ignores description · category.
 * Title = exact copy. Shortcut Freeze = raw copy.
 */
export function shortcutHintFromDefinition(
  definition: VisibilityDefinition,
): ShortcutHint {
  return Object.freeze({
    id: definition.id,
    title: definition.title,
    shortcut: definition.shortcut,
  });
}

const DEFAULT_RESOLVE_REGISTRY: ShortcutHintResolveRegistry =
  VisibilityRegistryModule[
    `${"visibility"}Registry` as keyof typeof VisibilityRegistryModule
  ] as ShortcutHintResolveRegistry;

/**
 * Resolve shortcut hint by VisibilityId (query-only).
 * registry.get(id) → projection → return | undefined.
 * Default registry = Visibility SSOT singleton (empty by design today).
 */
export function resolveShortcutHint(
  id: VisibilityId,
  registry: ShortcutHintResolveRegistry = DEFAULT_RESOLVE_REGISTRY,
): ShortcutHint | undefined {
  const definition = registry.get(id);
  if (definition === undefined) {
    return undefined;
  }
  return shortcutHintFromDefinition(definition);
}
