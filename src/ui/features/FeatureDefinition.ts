/**
 * UX-5.4 — Feature definition with immutable metadata + visibility model.
 * FeatureDefinition API Freeze v2 · Runtime State → UX-5.5.
 */

import type { FeatureCategory, FeatureId } from "./FeatureTypes";

export type FeatureVisibility =
  | "visible"
  | "hidden"
  | "experimental"
  | "beta"
  | "internal";

export type FeatureDefinition = Readonly<{
  readonly id: FeatureId;
  readonly category: FeatureCategory;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly keywords: readonly string[];
  readonly visibility: FeatureVisibility;
}>;

/** Input shape for createFeatureDefinition (copy-before-freeze). */
export type FeatureDefinitionInit = Readonly<{
  id: FeatureId;
  category: FeatureCategory;
  icon: string;
  title: string;
  description: string;
  tags: readonly string[];
  keywords: readonly string[];
  visibility: FeatureVisibility;
}>;

/**
 * Builds an immutable FeatureDefinition.
 * Copies tags/keywords before freezing so caller arrays stay independent.
 */
export function createFeatureDefinition(
  init: FeatureDefinitionInit,
): FeatureDefinition {
  const tags = Object.freeze([...init.tags]);
  const keywords = Object.freeze([...init.keywords]);
  return Object.freeze({
    ...init,
    tags,
    keywords,
  });
}
