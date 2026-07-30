import { PanelProvider, WorkspaceBodyLayout } from "./panels";
import { WORKSPACE_TOKENS } from "./WorkspaceTokens";
import type { WorkspaceContentProps } from "./types";

/**
 * D47.2 — Main column + inner padding. Hosts toolbar and scientific workspace slots.
 * UX-2.3 — Presentational header (DOM-stable).
 * UX-2.4 — Body regions via WorkspaceBodyLayout (canvas + side/bottom panels).
 * UX-2.5 — Panels use shared Panel shell (BodyLayout owns wrappers).
 * UX-2.7 — PanelProvider wraps BodyLayout only (no hooks in this file).
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function WorkspaceContent({
  toolbar,
  workspace,
}: WorkspaceContentProps) {
  return (
    <div className={WORKSPACE_TOKENS.mainColumn}>
      <div className={WORKSPACE_TOKENS.inner}>
        {toolbar}
        <header
          data-workspace-header
          className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--app-border)] pb-3"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--app-text-muted)]">
              Project
            </p>
            <h1 className="truncate text-sm font-semibold tracking-tight text-[var(--app-heading)] sm:text-base">
              Scientific Graph AI
            </h1>
            <p className="truncate text-xs text-[var(--app-text-muted)] sm:text-sm">
              Current Project
            </p>
          </div>
          <p
            className="shrink-0 text-xs font-medium text-[var(--app-text-muted)] sm:text-sm"
            aria-label="Workspace status"
          >
            Ready
          </p>
        </header>
        <PanelProvider>
          <WorkspaceBodyLayout>{workspace}</WorkspaceBodyLayout>
        </PanelProvider>
      </div>
    </div>
  );
}
