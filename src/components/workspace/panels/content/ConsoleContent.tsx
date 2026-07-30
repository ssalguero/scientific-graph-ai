import { PanelContentSection } from "./PanelContentSection";
import { PanelEmptyState } from "./PanelEmptyState";

/**
 * UX-2.6 — Console body content.
 * Hierarchy freeze: Content → PanelContentSection → PanelEmptyState.
 * Stable ID: output.
 */
export function ConsoleContent() {
  return (
    <div data-panel-content="console">
      <PanelContentSection id="output" title="Output">
        <PanelEmptyState message="No output" />
      </PanelContentSection>
    </div>
  );
}
