/**
 * UX-7.4 — Command Description factory.
 * Normalize (trim) · validate · Object.freeze.
 * Title Freeze / Description Freeze / Shortcut Freeze / Category Freeze
 * apply after trim (no further transform).
 */

import type {
  CommandDescription,
  CommandDescriptionInit,
} from "./CommandDescription";
import { asCommandId } from "../commands/CommandTypes";

/**
 * Builds an immutable CommandDescription.
 * Trims all string fields; requires non-empty id / title / category.
 * description and shortcut may be "".
 */
export function createCommandDescription(
  init: CommandDescriptionInit,
): CommandDescription {
  const id = init.id.trim();
  const title = init.title.trim();
  const description = init.description.trim();
  const shortcut = init.shortcut.trim();
  const category = init.category.trim();

  if (id.length === 0) {
    throw new Error("CommandDescription id must be a non-empty string");
  }
  if (title.length === 0) {
    throw new Error("CommandDescription title must be a non-empty string");
  }
  if (category.length === 0) {
    throw new Error("CommandDescription category must be a non-empty string");
  }

  return Object.freeze({
    id: asCommandId(id),
    title,
    description,
    shortcut,
    category,
  });
}
