/**
 * UX-7.4 — Command Description model (CommandId-facing projection).
 * Fields: id · title · description · shortcut · category only.
 * No icon · priority · placement · keywords · handlers · callbacks · React · i18n · markdown · HTML.
 */

import type { CommandId } from "../commands/CommandTypes";

export type CommandDescription = Readonly<{
  readonly id: CommandId;
  readonly title: string;
  readonly description: string;
  readonly shortcut: string;
  readonly category: string;
}>;

/** Input shape for createCommandDescription (normalize · validate · freeze). */
export type CommandDescriptionInit = Readonly<{
  id: string;
  title: string;
  description: string;
  shortcut: string;
  category: string;
}>;
