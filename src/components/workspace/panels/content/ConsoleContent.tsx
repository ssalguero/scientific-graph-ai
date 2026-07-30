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
  SemanticSectionLabel,
  SemanticStatus,
} from "../../semantics";
import { PanelAccent, PanelSurface, SURFACE_TOKENS } from "../../surfaces";
import { ActionButton, ActionGroup, PanelToolbar } from "../../toolbar";
import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Console body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * UX-2.15 — Output disclosed; empty Advanced prepared.
 * UX-2.16 — PanelSurface + Accent (static presentation only).
 * UX-2.17 — WorkspaceGroup affinity inside content (layout only).
 * UX-2.18 — PanelLayout + ContentRegion semantic shell.
 * UX-2.18b — SemanticHeader/Status/SectionLabel/Footer identity grammar.
 * UX-2.19 — PanelToolbar + ActionGroup shell in SemanticHeader.trailing.
 * UX-2.20 — WorkspaceIcon in leading / ActionButton.icon / EmptyState.icon.
 * UX-2.21 — Icon sizes aligned to ACTION/ICON slots.
 * Stable ID: output.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no output branching).
 */
export const ConsoleContent = memo(function ConsoleContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div data-panel-content="console">
      <PanelSurface variant="console">
        <PanelAccent position="left" tone="console" />
        <PanelLayout>
          <PanelHeaderRegion>
            <SemanticHeader
              leading={<WorkspaceIcon name="console" size="lg" />}
              trailing={
                <PanelToolbar>
                  <ActionGroup>
                    <ActionButton
                      icon={<WorkspaceIcon name="info" size="lg" />}
                      appearance="muted"
                    />
                  </ActionGroup>
                </PanelToolbar>
              }
            />
            <SemanticStatus />
          </PanelHeaderRegion>
          <PanelContentRegion>
            <WorkspaceGroup>
              <div className={SURFACE_TOKENS.contentInset}>
                <SemanticSectionLabel>Output</SemanticSectionLabel>
                <DisclosureSection title="Output" defaultExpanded>
                  <PanelContentSection id="output" title="Output">
                    <EmptyState
                      icon={<WorkspaceIcon name="console" size="lg" />}
                      title="No output"
                      description="Console messages will appear here."
                    />
                  </PanelContentSection>
                </DisclosureSection>
                <ContextDivider />
                <AdvancedSection
                  label="Advanced"
                  expanded={advancedOpen}
                  onToggle={() => setAdvancedOpen((open) => !open)}
                />
              </div>
            </WorkspaceGroup>
          </PanelContentRegion>
          <PanelFooterRegion>
            <SemanticFooter />
          </PanelFooterRegion>
        </PanelLayout>
      </PanelSurface>
    </div>
  );
});
