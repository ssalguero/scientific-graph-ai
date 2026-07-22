/**
 * D65.3 — Session Foundation · SessionState domain.
 * Authority: D65.0 API Freeze · HR-def-state-split · HR-session-serializable.
 * Operational refs only — no Registry, Definition logic, persistence, or React.
 */

/**
 * Operational session state — mutable workspace references.
 * Must not embed id, title, metadata, or createdAt (those live on SessionDefinition).
 */
export type SessionState = {
  readonly windowIds: readonly string[];
  readonly tabIds: readonly string[];
  readonly activeTabId?: string;
  readonly layoutId?: string;
  readonly updatedAt: number;
};

export type CreateEmptySessionStateOptions = {
  windowIds?: readonly string[];
  tabIds?: readonly string[];
  activeTabId?: string;
  layoutId?: string;
  updatedAt?: number;
};

function cloneStringArray(ids: readonly string[]): string[] {
  return ids.slice();
}

/**
 * Pure factory — returns a plain SessionState with cloned arrays.
 * Does not register, persist, or touch SessionDefinition.
 */
export function createEmptySessionState(
  options?: CreateEmptySessionStateOptions
): SessionState {
  return {
    windowIds: cloneStringArray(options?.windowIds ?? []),
    tabIds: cloneStringArray(options?.tabIds ?? []),
    updatedAt:
      options?.updatedAt !== undefined ? options.updatedAt : Date.now(),
    ...(options?.activeTabId !== undefined
      ? { activeTabId: options.activeTabId }
      : {}),
    ...(options?.layoutId !== undefined ? { layoutId: options.layoutId } : {}),
  };
}

/**
 * Deep clone of the SessionState surface — every array copied; plain object returned.
 */
export function cloneSessionState(state: SessionState): SessionState {
  return {
    windowIds: cloneStringArray(state.windowIds),
    tabIds: cloneStringArray(state.tabIds),
    updatedAt: state.updatedAt,
    ...(state.activeTabId !== undefined
      ? { activeTabId: state.activeTabId }
      : {}),
    ...(state.layoutId !== undefined ? { layoutId: state.layoutId } : {}),
  };
}
