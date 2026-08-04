/**
 * UX-7.2 — Tooltip content model (projection shape).
 * Fields: id · title · description · shortcut only.
 * No category · icon · priority · placement · i18n · callbacks · React.
 */

import type { VisibilityId } from "../visibility/VisibilityTypes";

export type TooltipContent = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly description: string;
  readonly shortcut: string;
}>;

/** Input shape for createTooltipContent (normalize · validate · freeze). */
export type TooltipContentInit = Readonly<{
  id: string;
  title: string;
  description: string;
  shortcut: string;
}>;
