"use client";

import { memo, useState } from "react";

import {
  WorkspaceGroup,
  WorkspaceSection,
  WorkspaceStack,
} from "../../composition";
import {
  AdvancedSection,
  ContextDivider,
  DisclosureSection,
} from "../../disclosure";
import {
  PanelAccent,
  PanelDivider,
  PanelSurface,
  SURFACE_TOKENS,
} from "../../surfaces";
import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Inspector body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * UX-2.15 — Properties primary; Appearance behind Advanced.
 * UX-2.16 — PanelSurface + Accent + PanelDivider before ContextDivider.
 * UX-2.17 — WorkspaceSection / Stack / Group composition (layout only).
 * Stable IDs: properties, appearance.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no selection branching).
 */
export const InspectorContent = memo(function InspectorContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div data-panel-content="inspector">
      <PanelSurface variant="inspector">
        <WorkspaceSection>
          <PanelAccent position="left" tone="inspector" />
          <WorkspaceStack>
            <div className={SURFACE_TOKENS.contentInset}>
              <PanelDivider spacing="sm" muted />
              <ContextDivider />
              <WorkspaceGroup>
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
              </WorkspaceGroup>
            </div>
          </WorkspaceStack>
        </WorkspaceSection>
      </PanelSurface>
    </div>
  );
});
