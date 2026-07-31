"use client";

import { memo, useState } from "react";

import { WorkspaceGroup } from "../../composition";
import { ContentGroup, Notice } from "../../content";
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
 * UX-2.22 — ContentGroup + Notice (info ≡ SemanticInfoBlock chrome; pixel-identical).
 * UX-2.23 — Surface presentation layer around PanelLayout regions.
 * UX-2.24 — Navigation grammar in SemanticHeader.title (static Workspace › Inspector).
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
        <Surface>
          <PanelLayout>
            <SurfaceHeader>
              <PanelHeaderRegion>
                <SemanticHeader
                  leading={<WorkspaceIcon name="inspector" size="lg" />}
                  title={
                    <Navigation>
                      <Breadcrumbs>
                        <BreadcrumbItem>Workspace</BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>Inspector</BreadcrumbItem>
                      </Breadcrumbs>
                      <PageTitle>Inspector</PageTitle>
                    </Navigation>
                  }
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
            </SurfaceHeader>
            <SurfaceBody>
              <PanelContentRegion>
                <div className={SURFACE_TOKENS.contentInset}>
                  <ContextDivider />
                  <WorkspaceGroup>
                    <ContentGroup>
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
                      <Notice variant="info" />
                    </ContentGroup>
                  </WorkspaceGroup>
                </div>
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
