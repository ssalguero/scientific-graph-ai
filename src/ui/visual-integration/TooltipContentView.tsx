/**
 * UX-7.8 — TooltipContent slot presenter (representation only).
 *
 * Visual Integration Freeze · Component Purity Freeze · Rendering Rules.
 * undefined ⇒ no render. Fields shown as-is. No transform / enrich / infer.
 */

import type { ReactElement } from "react";
import type { TooltipContentViewProps } from "./VisualIntegrationTypes";

export function TooltipContentView(
  props: TooltipContentViewProps,
): ReactElement | null {
  const content = props.content;
  if (content === undefined) {
    return null;
  }

  return (
    <span data-disc-slot="tooltip">
      <span data-disc-field="title">{content.title}</span>
      <span data-disc-field="description">{content.description}</span>
      <span data-disc-field="shortcut">{content.shortcut}</span>
    </span>
  );
}
