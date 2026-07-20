import { WORKSPACE_TOKENS } from "./WorkspaceTokens";
import type { WorkspaceContentProps } from "./types";

/**
 * D47.2 — Main column + inner padding. Hosts toolbar and scientific workspace slots.
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
        {workspace}
      </div>
    </div>
  );
}
