import { PanelContentSection } from "./PanelContentSection";
import { PanelEmptyState } from "./PanelEmptyState";

/**
 * UX-2.6 — Explorer body content.
 * Hierarchy freeze: Content → PanelContentSection → PanelEmptyState.
 * Stable IDs: project, layers.
 */
export function ExplorerContent() {
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
}
