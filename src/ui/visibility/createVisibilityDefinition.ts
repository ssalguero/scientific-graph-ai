/**
 * UX-7.1 — Visibility definition factory.
 * Normalize (trim) · validate · Object.freeze.
 */

import type {
  VisibilityDefinition,
  VisibilityDefinitionInit,
} from "./VisibilityDefinition";
import { asVisibilityId } from "./VisibilityTypes";

/**
 * Builds an immutable VisibilityDefinition.
 * Trims all string fields; requires non-empty id / title / category.
 * description and shortcut may be "".
 */
export function createVisibilityDefinition(
  init: VisibilityDefinitionInit,
): VisibilityDefinition {
  const id = init.id.trim();
  const title = init.title.trim();
  const description = init.description.trim();
  const shortcut = init.shortcut.trim();
  const category = init.category.trim();

  if (id.length === 0) {
    throw new Error("VisibilityDefinition id must be a non-empty string");
  }
  if (title.length === 0) {
    throw new Error("VisibilityDefinition title must be a non-empty string");
  }
  if (category.length === 0) {
    throw new Error("VisibilityDefinition category must be a non-empty string");
  }

  return Object.freeze({
    id: asVisibilityId(id),
    title,
    description,
    shortcut,
    category,
  });
}
