"use client";

import { memo, useState } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

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
 * UX-2.6 — Explorer body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * UX-2.15 — Progressive disclosure: Project primary; Layers in Advanced.
 * UX-2.16 — PanelSurface + Accent + IconSlot + static Metadata.
 * UX-2.17 — WorkspaceGroup affinity inside content (layout only).
 * UX-2.18 — PanelLayout + HeaderRegion + ContentRegion semantic shell.
 * UX-2.18b — SemanticHeader/Status/SectionLabel/Footer identity grammar.
 * UX-2.19 — PanelToolbar + ActionGroup shell in SemanticHeader.trailing.
 * UX-2.20 — WorkspaceIcon in leading / ActionButton.icon / EmptyState.icon.
 * Stable IDs: project, layers.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no domain branching).
 */
export const ExplorerContent = memo(function ExplorerContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div data-panel-content="explorer">
      <PanelSurface variant="explorer">
        <PanelAccent position="left" tone="explorer" />
        <PanelLayout>
          <PanelHeaderRegion>
            <SemanticHeader
              title="Project"
              leading={<WorkspaceIcon name="project" size="sm" />}
              trailing={
                <PanelToolbar>
                  <ActionGroup>
                    <ActionButton
                      icon={<WorkspaceIcon name="add" size="sm" />}
                      appearance="muted"
                    >
                      Add
                    </ActionButton>
                    <ActionButton
                      icon={<WorkspaceIcon name="search" size="sm" />}
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
                <SemanticSectionLabel>Project</SemanticSectionLabel>
                <DisclosureSection title="Project" defaultExpanded>
                  <PanelContentSection id="project" title="Project">
                    <EmptyState
                      icon={<WorkspaceIcon name="project" size="lg" />}
                      title="No series"
                      description="Create your first data series."
                      action={
                        <button
                          type="button"
                          className={`${UI_TOKENS.button.outlineSm} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]/30`}
                          aria-label="New series"
                        >
                          New Series
                        </button>
                      }
                    />
                  </PanelContentSection>
                </DisclosureSection>
                <ContextDivider />
                <SemanticSectionLabel>Layers</SemanticSectionLabel>
                <AdvancedSection
                  label="Layers"
                  expanded={advancedOpen}
                  onToggle={() => setAdvancedOpen((open) => !open)}
                >
                  <PanelContentSection id="layers" title="Layers">
                    <EmptyState
                      icon={<WorkspaceIcon name="layers" size="lg" />}
                      title="No layers"
                      description="Layers appear when series are added to the graph."
                    />
                  </PanelContentSection>
                </AdvancedSection>
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
