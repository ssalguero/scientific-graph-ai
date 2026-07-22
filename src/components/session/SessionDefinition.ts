/**
 * D65.1 — Session Foundation · SessionDefinition (type target for SessionEntry).
 * Authority: D65.0 API Freeze · HR-def-state-split.
 * Types only — no factories, no runtime, no React.
 * Full Definition microfase ownership remains D65.2 (factories / helpers).
 *
 * Note: `id` is structurally SessionId; `metadata` is structurally SessionMetadata.
 * No import from SessionTypes (avoids cycle). D65.2 may tighten aliases.
 */

/**
 * Practically immutable session identity / catalog metadata.
 * Must not embed windowIds, tabIds, activeTabId, layoutId, or updatedAt.
 */
export type SessionDefinition = {
  readonly id: string;
  readonly title?: string;
  readonly metadata?: { readonly [key: string]: unknown };
  readonly createdAt: number;
};
