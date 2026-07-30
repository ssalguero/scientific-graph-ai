import { memo } from "react";

import { PanelContentSection } from "./PanelContentSection";
import { PanelEmptyState } from "./PanelEmptyState";

/**
 * UX-2.6 — Explorer body content.
 * Hierarchy freeze: Content → PanelContentSection → PanelEmptyState.
 * Stable IDs: project, layers.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 */
export const ExplorerContent = memo(function ExplorerContent() {
  return (
    <div data-panel-content="explorer">
      <PanelContentSection id="project" title="Project">
        <PanelEmptyState message="No content" />
      </PanelContentSection>
      <PanelContentSection id="layers" title="Layers">
        <PanelEmptyState message="No selection" />
      </PanelContentSection>
    </div>
  );
});
