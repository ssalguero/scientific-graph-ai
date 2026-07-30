"use client";

import { memo, useState } from "react";

import { WorkspaceGroup } from "../../composition";
import {
  AdvancedSection,
  ContextDivider,
  DisclosureSection,
} from "../../disclosure";
import { WorkspaceIcon } from "../../iconography";
import {
  PanelContentRegion,
  PanelFooterRegion,
  PanelHeaderRegion,
  PanelLayout,
} from "../../layout";
import {
  SemanticFooter,
  SemanticHeader,
  SemanticInfoBlock,
  SemanticSectionLabel,
  SemanticStatus,
} from "../../semantics";
import { PanelAccent, PanelSurface, SURFACE_TOKENS } from "../../surfaces";
import { ActionButton, ActionGroup, PanelToolbar } from "../../toolbar";
import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Inspector body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * UX-2.15 — Properties primary; Appearance behind Advanced.
 * UX-2.16 — PanelSurface + Accent + ContextDivider (UX-2.21: single divider rhythm).
 * UX-2.17 — WorkspaceGroup affinity inside content (layout only).
 * UX-2.18 — PanelLayout + ContentRegion semantic shell.
 * UX-2.18b — SemanticHeader/Status/SectionLabel/InfoBlock/Footer identity grammar.
 * UX-2.19 — PanelToolbar + ActionGroup shell in SemanticHeader.trailing.
 * UX-2.20 — WorkspaceIcon in leading / ActionButton.icon / EmptyState.icon.
 * UX-2.21 — Icon sizes aligned to ACTION/ICON slots; divider parity with Explorer/Console.
 * Stable IDs: properties, appearance.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no selection branching).
 */
export const InspectorContent = memo(function InspectorContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div data-panel-content="inspector">
      <PanelSurface variant="inspector">
        <PanelAccent position="left" tone="inspector" />
        <PanelLayout>
          <PanelHeaderRegion>
            <SemanticHeader
              leading={<WorkspaceIcon name="inspector" size="lg" />}
              trailing={
                <PanelToolbar>
                  <ActionGroup>
                    <ActionButton
                      icon={<WorkspaceIcon name="search" size="lg" />}
                      appearance="muted"
                    />
                  </ActionGroup>
                </PanelToolbar>
              }
            />
            <SemanticStatus />
          </PanelHeaderRegion>
          <PanelContentRegion>
            <div className={SURFACE_TOKENS.contentInset}>
              <ContextDivider />
              <WorkspaceGroup>
                <SemanticSectionLabel>Properties</SemanticSectionLabel>
                <DisclosureSection title="Properties" defaultExpanded>
                  <PanelContentSection id="properties" title="Properties">
                    <EmptyState
                      icon={<WorkspaceIcon name="inspector" size="lg" />}
                      title="Nothing selected"
                      description="Select an object to edit its properties."
                    />
                  </PanelContentSection>
                </DisclosureSection>
                <ContextDivider />
                <SemanticSectionLabel>Appearance</SemanticSectionLabel>
                <AdvancedSection
                  label="Appearance"
                  expanded={advancedOpen}
                  onToggle={() => setAdvancedOpen((open) => !open)}
                >
                  <PanelContentSection id="appearance" title="Appearance">
                    <EmptyState
                      icon={<WorkspaceIcon name="sparkles" size="lg" />}
                      title="Nothing selected"
                      description="Select an object to edit its appearance."
                    />
                  </PanelContentSection>
                </AdvancedSection>
                <SemanticInfoBlock />
              </WorkspaceGroup>
            </div>
          </PanelContentRegion>
          <PanelFooterRegion>
            <SemanticFooter />
          </PanelFooterRegion>
        </PanelLayout>
      </PanelSurface>
    </div>
  );
});
