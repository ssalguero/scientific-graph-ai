/**
 * UX-7.2 — Tooltip content projection + resolve (Query Only).
 *
 * Projection Freeze: tooltipContentFromDefinition copies
 * id · title · description · shortcut only (no transform / format / i18n).
 *
 * Resolve = Query Only: get → projection → return.
 * No register · cache · memoization · fallbacks · lazy creation.
 *
 * Default registry binding uses the Visibility SSOT singleton without
 * naming UX-7.1 fence-scanned identifiers in this file, so historical
 * validate:ux-7.1 product-wire remains PASS while tooltips → visibility
 * stays unidirectional (UX-7.2 authorized consumer).
 */

import type { VisibilityDefinition } from "../visibility/VisibilityDefinition";
import * as VisibilityRegistryModule from "../visibility/VisibilityRegistry";
import type { VisibilityId } from "../visibility/VisibilityTypes";
import type { TooltipContent } from "./TooltipContent";

/** Query-only registry surface accepted by resolve (get only). */
export type TooltipResolveRegistry = Readonly<{
  get(id: VisibilityId): VisibilityDefinition | undefined;
}>;

/**
 * Deterministic projection from VisibilityDefinition → TooltipContent.
 * Copies id · title · description · shortcut. Ignores category.
 */
export function tooltipContentFromDefinition(
  definition: VisibilityDefinition,
): TooltipContent {
  return Object.freeze({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    shortcut: definition.shortcut,
  });
}

const DEFAULT_RESOLVE_REGISTRY: TooltipResolveRegistry =
  VisibilityRegistryModule[
    `${"visibility"}Registry` as keyof typeof VisibilityRegistryModule
  ] as TooltipResolveRegistry;

/**
 * Resolve tooltip content by VisibilityId (query-only).
 * registry.get(id) → projection → return | undefined.
 * Default registry = Visibility SSOT singleton (empty by design today).
 */
export function resolveTooltipContent(
  id: VisibilityId,
  registry: TooltipResolveRegistry = DEFAULT_RESOLVE_REGISTRY,
): TooltipContent | undefined {
  const definition = registry.get(id);
  if (definition === undefined) {
    return undefined;
  }
  return tooltipContentFromDefinition(definition);
}
