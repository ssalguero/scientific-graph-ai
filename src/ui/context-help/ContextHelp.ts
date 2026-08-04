/**
 * UX-7.5 — Context Help model (projection shape).
 * Fields: id · title · description · category only.
 * No shortcut · icon · priority · placement · keywords · handlers · callbacks · React · i18n · markdown · HTML.
 */

import type { VisibilityId } from "../visibility/VisibilityTypes";

export type ContextHelp = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly description: string;
  readonly category: string;
}>;

/** Input shape for createContextHelp (normalize · validate · freeze). */
export type ContextHelpInit = Readonly<{
  id: string;
  title: string;
  description: string;
  category: string;
}>;
