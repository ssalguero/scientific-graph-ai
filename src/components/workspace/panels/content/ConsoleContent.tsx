"use client";

import { memo, useState } from "react";

import { WorkspaceGroup } from "../../composition";
import { ContentGroup } from "../../content";
import { DensityProvider } from "../../density";
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
 * UX-2.22 — ContentGroup + Description via EmptyState (existing copy only).
 * UX-2.23 — Surface presentation layer around PanelLayout regions.
 * UX-2.24 — Navigation grammar in SemanticHeader.title (static Workspace › Console).
 * UX-2.25 — DensityProvider semantic boundary (Fragment; spacing SSOT).
 * Stable ID: output.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no output branching).
 */
export const ConsoleContent = memo(function ConsoleContent() {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <DensityProvider>
    <div data-panel-content="console">
      <PanelSurface variant="console">
        <PanelAccent position="left" tone="console" />
        <Surface>
          <PanelLayout>
            <SurfaceHeader>
              <PanelHeaderRegion>
                <SemanticHeader
                  leading={<WorkspaceIcon name="console" size="lg" />}
                  title={
                    <Navigation>
                      <Breadcrumbs>
                        <BreadcrumbItem>Workspace</BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>Console</BreadcrumbItem>
                      </Breadcrumbs>
                      <PageTitle>Console</PageTitle>
                    </Navigation>
                  }
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
            </SurfaceHeader>
            <SurfaceBody>
              <PanelContentRegion>
                <WorkspaceGroup>
                  <ContentGroup>
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
    </DensityProvider>
  );
});
