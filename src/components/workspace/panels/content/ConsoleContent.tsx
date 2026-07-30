import { memo } from "react";

import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Console body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * Stable ID: output.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no output branching).
 */
export const ConsoleContent = memo(function ConsoleContent() {
  return (
    <div data-panel-content="console">
      <PanelContentSection id="output" title="Output">
        <EmptyState
          icon="○"
          title="No output"
          description="Console messages will appear here."
        />
      </PanelContentSection>
    </div>
  );
});
