/**
 * UX-7.1 — Visibility definition (metadata only).
 * No callbacks · no React · no runtime flags · no icon/priority/i18n.
 */

import type { VisibilityId } from "./VisibilityTypes";

export type VisibilityDefinition = Readonly<{
  readonly id: VisibilityId;
  readonly title: string;
  readonly description: string;
  readonly shortcut: string;
  readonly category: string;
}>;

/** Input shape for createVisibilityDefinition (normalize · validate · freeze). */
export type VisibilityDefinitionInit = Readonly<{
  id: string;
  title: string;
  description: string;
  shortcut: string;
  category: string;
}>;
