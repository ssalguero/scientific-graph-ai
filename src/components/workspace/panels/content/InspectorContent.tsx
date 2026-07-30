"use client";

import { memo, useState } from "react";

import {
  AdvancedSection,
  ContextDivider,
  DisclosureSection,
} from "../../disclosure";
import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Inspector body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * UX-2.15 — Properties primary; Appearance behind Advanced.
 * Stable IDs: properties, appearance.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no selection branching).
 */
export const InspectorContent = memo(function InspectorContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div data-panel-content="inspector">
      <DisclosureSection title="Properties" defaultExpanded>
        <PanelContentSection id="properties" title="Properties">
          <EmptyState
            icon="○"
            title="Nothing selected"
            description="Select an object to edit its properties."
          />
        </PanelContentSection>
      </DisclosureSection>
      <ContextDivider />
      <AdvancedSection
        label="Appearance"
        expanded={advancedOpen}
        onToggle={() => setAdvancedOpen((open) => !open)}
      >
        <PanelContentSection id="appearance" title="Appearance">
          <EmptyState
            icon="○"
            title="Nothing selected"
            description="Select an object to edit its appearance."
          />
        </PanelContentSection>
      </AdvancedSection>
    </div>
  );
});
