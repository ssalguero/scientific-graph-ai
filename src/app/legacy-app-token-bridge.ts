import type { CSSProperties } from "react";

/**
 * UX-I0 — Legacy `--app-*` → certified `--color-*` bridge (app-owned).
 *
 * Consumes Design System CSS variables already applied by ThemeProvider.
 * Does not redefine tokens, invent themes, or import `@/ui`.
 *
 * Transitional dual-stack: product surfaces may still reference `--app-*`;
 * values resolve to the certified Theme Runtime. Collapse call sites wave-by-wave.
 *
 * Frozen UX-4.9 core mapping extended for full chrome parity.
 */
export const LEGACY_APP_TOKEN_BRIDGE = {
  /* Surfaces */
  "--app-surface": "var(--color-surface-default)",
  "--app-surface-muted": "var(--color-surface-canvas)",
  /* Borders & text */
  "--app-border": "var(--color-border-default)",
  "--app-text": "var(--color-text-primary)",
  "--app-text-muted": "var(--color-text-muted)",
  "--app-heading": "var(--color-text-primary)",
  /* Brand / feedback */
  "--app-accent": "var(--color-brand-primary)",
  "--app-success": "var(--color-feedback-success)",
  "--app-warning": "var(--color-feedback-warning)",
  "--app-danger": "var(--color-feedback-danger)",
  /* Soft feedback (consume DS via color-mix — no new token SSOT) */
  "--app-success-bg":
    "color-mix(in srgb, var(--color-feedback-success) 16%, var(--color-surface-default))",
  "--app-success-text": "var(--color-feedback-success)",
  "--app-info-bg":
    "color-mix(in srgb, var(--color-feedback-info) 14%, var(--color-surface-default))",
  "--app-info-text": "var(--color-feedback-info)",
  "--app-danger-bg":
    "color-mix(in srgb, var(--color-feedback-danger) 14%, var(--color-surface-default))",
  "--app-danger-border":
    "color-mix(in srgb, var(--color-feedback-danger) 35%, var(--color-border-default))",
  "--app-danger-text": "var(--color-feedback-danger)",
  "--app-warning-bg":
    "color-mix(in srgb, var(--color-feedback-warning) 16%, var(--color-surface-default))",
  "--app-warning-border":
    "color-mix(in srgb, var(--color-feedback-warning) 35%, var(--color-border-default))",
  "--app-warning-text": "var(--color-feedback-warning)",
  /* Controls */
  "--app-toggle-track": "var(--color-border-muted)",
  "--app-toggle-thumb": "var(--color-surface-default)",
} as const satisfies Record<string, string>;

export const legacyAppTokenBridgeStyle =
  LEGACY_APP_TOKEN_BRIDGE as unknown as CSSProperties;
