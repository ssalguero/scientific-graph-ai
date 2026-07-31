"use client";

import { memo, useState } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

import { WorkspaceGroup } from "../../composition";
import { ContentGroup } from "../../content";
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
  BreadcrumbItem,
  BreadcrumbSeparator,
  Breadcrumbs,
  Navigation,
  PageTitle,
} from "../../navigation";
import {
  SemanticFooter,
  SemanticHeader,
  SemanticSectionLabel,
  SemanticStatus,
} from "../../semantics";
import {
  Surface,
  SurfaceBody,
  SurfaceFooter,
  SurfaceHeader,
} from "../../surface";
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
 * UX-2.21 — Icon sizes aligned to ACTION/ICON slots; tokens for empty polish.
 * UX-2.22 — ContentGroup structure only (pixel-identical; no new visible UI).
 * UX-2.23 — Surface presentation layer around PanelLayout regions.
 * UX-2.24 — Navigation grammar in SemanticHeader.title (static Workspace › Explorer).
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
        <Surface>
          <PanelLayout>
            <SurfaceHeader>
              <PanelHeaderRegion>
                <SemanticHeader
                  leading={<WorkspaceIcon name="project" size="lg" />}
                  title={
                    <Navigation>
                      <Breadcrumbs>
                        <BreadcrumbItem>Workspace</BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>Explorer</BreadcrumbItem>
                      </Breadcrumbs>
                      <PageTitle>Explorer</PageTitle>
                    </Navigation>
                  }
                  trailing={
                    <PanelToolbar>
                      <ActionGroup>
                        <ActionButton
                          icon={<WorkspaceIcon name="add" size="lg" />}
                          appearance="muted"
                        >
                          Add
                        </ActionButton>
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
            </SurfaceHeader>
            <SurfaceBody>
              <PanelContentRegion>
                <WorkspaceGroup>
                  <ContentGroup>
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
                  </ContentGroup>
                </WorkspaceGroup>
              </PanelContentRegion>
            </SurfaceBody>
            <SurfaceFooter>
              <PanelFooterRegion>
                <SemanticFooter />
              </PanelFooterRegion>
            </SurfaceFooter>
          </PanelLayout>
        </Surface>
      </PanelSurface>
    </div>
  );
});
