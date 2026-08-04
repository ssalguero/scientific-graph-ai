/**
 * UX-7.5 — Context Help factory.
 * Normalize (trim) · validate · Object.freeze.
 * Title Freeze / Description Freeze / Category Freeze apply after trim
 * (no further transform).
 */

import type { ContextHelp, ContextHelpInit } from "./ContextHelp";
import { asVisibilityId } from "../visibility/VisibilityTypes";

/**
 * Builds an immutable ContextHelp.
 * Trims all string fields; requires non-empty id / title / category.
 * description may be "".
 */
export function createContextHelp(init: ContextHelpInit): ContextHelp {
  const id = init.id.trim();
  const title = init.title.trim();
  const description = init.description.trim();
  const category = init.category.trim();

  if (id.length === 0) {
    throw new Error("ContextHelp id must be a non-empty string");
  }
  if (title.length === 0) {
    throw new Error("ContextHelp title must be a non-empty string");
  }
  if (category.length === 0) {
    throw new Error("ContextHelp category must be a non-empty string");
  }

  return Object.freeze({
    id: asVisibilityId(id),
    title,
    description,
    category,
  });
}
