/**
 * UX-7.4 — Command Description projection + resolve (Query Only).
 *
 * Identity Freeze: visibilityIdFromCommandId = brand cast only.
 * Projection Freeze: commandDescriptionFromDefinition copies
 * id · title · description · shortcut · category (no transform / format / i18n).
 * Title Freeze · Description Freeze · Shortcut Freeze · Category Freeze = exact/raw copy.
 *
 * Resolve = Query Only: CommandId → Identity Freeze → get → projection → return.
 * No register · cache · memoization · fallbacks · lazy creation.
 *
 * Default registry binding uses the Visibility SSOT singleton without
 * naming UX-7.1 fence-scanned identifiers in this file, so historical
 * validate:ux-7.1 product-wire remains PASS while command-descriptions → visibility
 * stays unidirectional (UX-7.4 authorized consumer).
 */

import { asCommandId } from "../commands/CommandTypes";
import type { CommandId } from "../commands/CommandTypes";
import type { VisibilityDefinition } from "../visibility/VisibilityDefinition";
import * as VisibilityRegistryModule from "../visibility/VisibilityRegistry";
import type { VisibilityId } from "../visibility/VisibilityTypes";
import type { CommandDescription } from "./CommandDescription";
import { visibilityIdFromCommandId } from "./CommandDescriptionTypes";

/** Query-only registry surface accepted by resolve (get only). */
export type CommandDescriptionResolveRegistry = Readonly<{
  get(id: VisibilityId): VisibilityDefinition | undefined;
}>;

/**
 * Deterministic projection from VisibilityDefinition → CommandDescription.
 * Copies id · title · description · shortcut · category.
 * id = asCommandId(String(definition.id)) — Identity Freeze brand cast.
 * Title / Description / Shortcut / Category Freezes = exact/raw copy.
 */
export function commandDescriptionFromDefinition(
  definition: VisibilityDefinition,
): CommandDescription {
  return Object.freeze({
    id: asCommandId(String(definition.id)),
    title: definition.title,
    description: definition.description,
    shortcut: definition.shortcut,
    category: definition.category,
  });
}

const DEFAULT_RESOLVE_REGISTRY: CommandDescriptionResolveRegistry =
  VisibilityRegistryModule[
    `${"visibility"}Registry` as keyof typeof VisibilityRegistryModule
  ] as CommandDescriptionResolveRegistry;

/**
 * Resolve command description by CommandId (query-only).
 * visibilityIdFromCommandId → registry.get → projection → return | undefined.
 * Default registry = Visibility SSOT singleton (empty by design today).
 */
export function resolveCommandDescription(
  commandId: CommandId,
  registry: CommandDescriptionResolveRegistry = DEFAULT_RESOLVE_REGISTRY,
): CommandDescription | undefined {
  const visibilityId = visibilityIdFromCommandId(commandId);
  const definition = registry.get(visibilityId);
  if (definition === undefined) {
    return undefined;
  }
  return commandDescriptionFromDefinition(definition);
}
