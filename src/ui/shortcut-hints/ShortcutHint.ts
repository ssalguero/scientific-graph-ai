/**
 * UX-7.3 — Shortcut hint model (projection shape).
 * Fields: id · title · shortcut only.
 * No description · category · icon · priority · placement · i18n · callbacks · React.
 */

import type { VisibilityId } from "../visibility/VisibilityTypes";

export type ShortcutHint = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly shortcut: string;
}>;

/** Input shape for createShortcutHint (normalize · validate · freeze). */
export type ShortcutHintInit = Readonly<{
  id: string;
  title: string;
  shortcut: string;
}>;
