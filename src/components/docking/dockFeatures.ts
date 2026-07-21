/**
 * D52.2 — Internal dock feature flags.
 * Default: all false. Not wired to UI (Zero UX).
 */
export const DOCK_FEATURES = {
  registration: false,
  visibility: false,
  layout: false,
  slots: false,
} as const;
