/** UX-2.10 — Planning mode: pure initial PanelState producer (never consumes PanelState). */

import type { PanelState } from "../panels/state/PanelState";

import type { WorkspaceMode } from "./WorkspaceMode";

/** Frozen reference shell for percentage → pixel resolution. */
const REF_WIDTH = 1120;
const REF_HEIGHT = 1200;

/** left/right = 25% of REF_WIDTH → 280; bottom = 20% of REF_HEIGHT → 240 */
const LEFT_WIDTH = Math.round(REF_WIDTH * 0.25);
const RIGHT_WIDTH = Math.round(REF_WIDTH * 0.25);
const BOTTOM_HEIGHT = Math.round(REF_HEIGHT * 0.2);

export const PlanningMode: WorkspaceMode = {
  id: "planning",
  title: "Planning",
  apply(): PanelState {
    return {
      leftCollapsed: false,
      rightCollapsed: false,
      bottomCollapsed: false,
      leftWidth: LEFT_WIDTH,
      rightWidth: RIGHT_WIDTH,
      bottomHeight: BOTTOM_HEIGHT,
    };
  },
};
