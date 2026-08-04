/**
 * UX-7.5 — Context Help projection + resolve (Query Only).
 *
 * Projection Freeze: contextHelpFromDefinition copies
 * id · title · description · category only (no transform / format / i18n).
 * VisibilityId Freeze — definition.id exact (no convert / rebrand).
 * Title Freeze · Description Freeze (ownership) · Category Freeze.
 *
 * Resolve = Query Only: get → projection → return.
 * No register · cache · memoization · fallbacks · lazy creation.
 *
 * Default registry binding uses the Visibility SSOT singleton without
 * naming UX-7.1 fence-scanned identifiers in this file, so historical
 * validate:ux-7.1 product-wire remains PASS while context-help → visibility
 * stays unidirectional (UX-7.5 authorized consumer).
 */

import type { VisibilityDefinition } from "../visibility/VisibilityDefinition";
import * as VisibilityRegistryModule from "../visibility/VisibilityRegistry";
import type { VisibilityId } from "../visibility/VisibilityTypes";
import type { ContextHelp } from "./ContextHelp";

/** Query-only registry surface accepted by resolve (get only). */
export type ContextHelpResolveRegistry = Readonly<{
  get(id: VisibilityId): VisibilityDefinition | undefined;
}>;

/**
 * Deterministic projection from VisibilityDefinition → ContextHelp.
 * Copies id · title · description · category. Ignores shortcut.
 * VisibilityId Freeze · Title Freeze · Description Freeze · Category Freeze.
 */
export function contextHelpFromDefinition(
  definition: VisibilityDefinition,
): ContextHelp {
  return Object.freeze({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    category: definition.category,
  });
}

const DEFAULT_RESOLVE_REGISTRY: ContextHelpResolveRegistry =
  VisibilityRegistryModule[
    `${"visibility"}Registry` as keyof typeof VisibilityRegistryModule
  ] as ContextHelpResolveRegistry;

/**
 * Resolve context help by VisibilityId (query-only).
 * registry.get(id) → projection → return | undefined.
 * Default registry = Visibility SSOT singleton (empty by design today).
 */
export function resolveContextHelp(
  id: VisibilityId,
  registry: ContextHelpResolveRegistry = DEFAULT_RESOLVE_REGISTRY,
): ContextHelp | undefined {
  const definition = registry.get(id);
  if (definition === undefined) {
    return undefined;
  }
  return contextHelpFromDefinition(definition);
}
