import { memo } from "react";

import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Inspector body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * Stable IDs: properties, appearance.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no selection branching).
 */
export const InspectorContent = memo(function InspectorContent() {
  return (
    <div data-panel-content="inspector">
      <PanelContentSection id="properties" title="Properties">
        <EmptyState
          icon="○"
          title="Nothing selected"
          description="Select an object to edit its properties."
        />
      </PanelContentSection>
      <PanelContentSection id="appearance" title="Appearance">
        <EmptyState
          icon="○"
          title="Nothing selected"
          description="Select an object to edit its appearance."
        />
      </PanelContentSection>
    </div>
  );
});
