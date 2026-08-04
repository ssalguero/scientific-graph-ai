/**
 * UX-7.2 — Tooltip Foundation local barrel.
 * Not re-exported from @/ui (src/ui/index.ts) in this phase.
 */

export type { VisibilityId } from "./TooltipTypes";

export type { TooltipContent, TooltipContentInit } from "./TooltipContent";

export { createTooltipContent } from "./createTooltipContent";

export {
  tooltipContentFromDefinition,
  resolveTooltipContent,
} from "./resolveTooltipContent";
