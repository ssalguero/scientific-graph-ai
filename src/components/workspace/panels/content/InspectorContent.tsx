import { PanelContentSection } from "./PanelContentSection";
import { PanelEmptyState } from "./PanelEmptyState";

/**
 * UX-2.6 — Inspector body content.
 * Hierarchy freeze: Content → PanelContentSection → PanelEmptyState.
 * Stable IDs: properties, appearance.
 */
export function InspectorContent() {
  return (
    <div data-panel-content="inspector">
      <PanelContentSection id="properties" title="Properties">
        <PanelEmptyState message="No selection" />
      </PanelContentSection>
      <PanelContentSection id="appearance" title="Appearance">
        <PanelEmptyState message="No selection" />
      </PanelContentSection>
    </div>
  );
}
