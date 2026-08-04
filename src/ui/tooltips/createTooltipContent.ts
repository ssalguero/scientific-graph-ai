/**
 * UX-7.2 — Tooltip content factory.
 * Normalize (trim) · validate · Object.freeze.
 */

import type { TooltipContent, TooltipContentInit } from "./TooltipContent";
import { asVisibilityId } from "../visibility/VisibilityTypes";

/**
 * Builds an immutable TooltipContent.
 * Trims all string fields; requires non-empty id / title.
 * description and shortcut may be "".
 */
export function createTooltipContent(
  init: TooltipContentInit,
): TooltipContent {
  const id = init.id.trim();
  const title = init.title.trim();
  const description = init.description.trim();
  const shortcut = init.shortcut.trim();

  if (id.length === 0) {
    throw new Error("TooltipContent id must be a non-empty string");
  }
  if (title.length === 0) {
    throw new Error("TooltipContent title must be a non-empty string");
  }

  return Object.freeze({
    id: asVisibilityId(id),
    title,
    description,
    shortcut,
  });
}
