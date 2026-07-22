/**
 * D65.1 — Session Foundation · SessionState (type target for SessionEntry).
 * Authority: D65.0 API Freeze · HR-def-state-split.
 * Types only — no factories, no runtime, no React.
 * Full State microfase ownership remains D65.3 (factories / helpers).
 */

/**
 * Operational session state — mutable refs only.
 * Must not embed id, title, metadata, or createdAt (those live on SessionDefinition).
 */
export type SessionState = {
  readonly windowIds: readonly string[];
  readonly tabIds: readonly string[];
  readonly activeTabId?: string;
  readonly layoutId?: string;
  readonly updatedAt: number;
};
