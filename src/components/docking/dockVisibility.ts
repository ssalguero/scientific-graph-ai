/**
 * D52.2 — Dock visibility API (model only).
 * Operates exclusively on DockState.activePanelIds as a logical set.
 * No DOM, styles, or animations.
 */
import type { DockState, DockVisibilityApi } from "./types";

export function createDockVisibilityApi(
  getState: () => DockState,
  setActivePanelIds: (activePanelIds: string[]) => void
): DockVisibilityApi {
  return {
    show(panelId: string): void {
      const { activePanelIds } = getState();
      if (activePanelIds.includes(panelId)) {
        return;
      }
      setActivePanelIds([...activePanelIds, panelId]);
    },
    hide(panelId: string): void {
      const { activePanelIds } = getState();
      if (!activePanelIds.includes(panelId)) {
        return;
      }
      setActivePanelIds(activePanelIds.filter((id) => id !== panelId));
    },
    isVisible(panelId: string): boolean {
      return getState().activePanelIds.includes(panelId);
    },
  };
}
