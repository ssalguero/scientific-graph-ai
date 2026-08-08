/**
 * PLUGINS-I6 — Lifecycle transition model (P5 allowed transitions).
 *
 * Platform-controlled only. No plugin self-transition.
 * No Discovered → Active. No Removed → any. No Invalid → Active without revalidation path.
 */

import type { PluginLifecycleState } from "../types";

export type LifecycleTransition = {
  readonly from: PluginLifecycleState;
  readonly to: PluginLifecycleState;
};

/** Certified allowed edges (structural; no algorithms beyond membership). */
export const PLUGINS_ALLOWED_LIFECYCLE_TRANSITIONS: readonly LifecycleTransition[] =
  [
    { from: "Discovered", to: "Validated" },
    { from: "Discovered", to: "Invalid" },
    { from: "Validated", to: "Registered" },
    { from: "Validated", to: "Invalid" },
    { from: "Registered", to: "Inactive" },
    { from: "Registered", to: "Active" },
    { from: "Registered", to: "Invalid" },
    { from: "Inactive", to: "Active" },
    { from: "Inactive", to: "Invalid" },
    { from: "Inactive", to: "Updating" },
    { from: "Inactive", to: "Suspended" },
    { from: "Inactive", to: "Removed" },
    { from: "Active", to: "Suspended" },
    { from: "Active", to: "Updating" },
    { from: "Active", to: "Inactive" },
    { from: "Active", to: "Invalid" },
    { from: "Active", to: "Removed" },
    { from: "Suspended", to: "Active" },
    { from: "Suspended", to: "Inactive" },
    { from: "Suspended", to: "Updating" },
    { from: "Suspended", to: "Invalid" },
    { from: "Suspended", to: "Removed" },
    { from: "Updating", to: "Active" },
    { from: "Updating", to: "Inactive" },
    { from: "Updating", to: "Invalid" },
    { from: "Invalid", to: "Validated" },
    { from: "Invalid", to: "Registered" },
    { from: "Invalid", to: "Inactive" },
    { from: "Invalid", to: "Removed" },
  ] as const;

export function isAllowedLifecycleTransition(
  from: PluginLifecycleState,
  to: PluginLifecycleState,
): boolean {
  if (from === "Removed") return false;
  return PLUGINS_ALLOWED_LIFECYCLE_TRANSITIONS.some(
    (t) => t.from === from && t.to === to,
  );
}
