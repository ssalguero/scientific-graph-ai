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
import { PanelAccent, PanelSurface, SURFACE_TOKENS } from "../../surfaces";
import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Console body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * UX-2.15 — Output disclosed; empty Advanced prepared.
 * UX-2.16 — PanelSurface + Accent (static presentation only).
 * UX-2.17 — WorkspaceSection / Stack / Group composition (layout only).
 * Stable ID: output.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no output branching).
 */
export const ConsoleContent = memo(function ConsoleContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div data-panel-content="console">
      <PanelSurface variant="console">
        <WorkspaceSection>
          <PanelAccent position="left" tone="console" />
          <WorkspaceStack>
            <WorkspaceGroup>
              <div className={SURFACE_TOKENS.contentInset}>
                <DisclosureSection title="Output" defaultExpanded>
                  <PanelContentSection id="output" title="Output">
                    <EmptyState
                      icon="○"
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
          </WorkspaceStack>
        </WorkspaceSection>
      </PanelSurface>
    </div>
  );
});
