import { memo } from "react";

import { PanelContentSection } from "./PanelContentSection";
import { PanelEmptyState } from "./PanelEmptyState";

/**
 * UX-2.6 — Console body content.
 * Hierarchy freeze: Content → PanelContentSection → PanelEmptyState.
 * Stable ID: output.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 */
export const ConsoleContent = memo(function ConsoleContent() {
  return (
    <div data-panel-content="console">
      <PanelContentSection id="output" title="Output">
        <PanelEmptyState message="No output" />
      </PanelContentSection>
    </div>
  );
});
