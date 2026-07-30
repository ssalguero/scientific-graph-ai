/**
 * UX-2.14 — Panel visual status contract (not UI).
 * Shared later by Inspector, Toolbar, Status Bar, Notifications, etc.
 */
export type PanelVisualState =
  | "idle"
  | "active"
  | "loading"
  | "busy"
  | "empty"
  | "warning"
  | "error"
  | "success";
