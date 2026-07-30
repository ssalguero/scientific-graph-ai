import { memo } from "react";

import { UI_TOKENS } from "@/lib/ui/tokens";

import { EmptyState } from "../empty";
import { PanelContentSection } from "./PanelContentSection";

/**
 * UX-2.6 — Explorer body content.
 * UX-2.12 — Hierarchy: Content → PanelContentSection → EmptyState.
 * Stable IDs: project, layers.
 * UX-2.9 — memo so resize geometry updates do not re-render content.
 * Always renders EmptyState this phase (no domain branching).
 */
export const ExplorerContent = memo(function ExplorerContent() {
  return (
    <div data-panel-content="explorer">
      <PanelContentSection id="project" title="Project">
        <EmptyState
          icon="○"
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
      <PanelContentSection id="layers" title="Layers">
        <EmptyState
          icon="○"
          title="No layers"
          description="Layers appear when series are added to the graph."
        />
      </PanelContentSection>
    </div>
  );
});
