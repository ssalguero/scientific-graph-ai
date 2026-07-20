import type { WorkspacePanelsProps } from "./types";

/**
 * D47.2 — Thin overlay host.
 *
 * Today: toast / ephemeral children only.
 *
 * Future:
 * - Inspector
 * - Properties
 * - Notifications
 * - Drawers
 * - AI Assist
 * - Export Queue
 *
 * Move-only infrastructure: no state, hooks, or domain logic.
 */
export function WorkspacePanels({ children }: WorkspacePanelsProps) {
  return <>{children}</>;
}
