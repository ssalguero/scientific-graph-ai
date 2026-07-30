/** UX-2.10 — Frozen Workspace Mode contract (pure PanelState producer). */

import type { PanelState } from "../panels/state/PanelState";

export type WorkspaceModeId = "planning";

export interface WorkspaceMode {
  id: WorkspaceModeId;
  title: string;
  apply(): PanelState;
}
