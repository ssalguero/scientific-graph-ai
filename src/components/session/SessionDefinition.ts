/**
 * D65.2 — Session Foundation · SessionDefinition domain.
 * Authority: D65.0 API Freeze · HR-def-state-split · HR-session-serializable.
 * Immutable identity only — no Registry, State logic, persistence, or React.
 */

import type { SessionId, SessionMetadata } from "./SessionTypes";

/**
 * Practically immutable session identity / catalog metadata.
 * Must not embed windowIds, tabIds, activeTabId, layoutId, or updatedAt.
 */
export type SessionDefinition = {
  readonly id: SessionId;
  readonly title?: string;
  readonly metadata?: SessionMetadata;
  readonly createdAt: number;
};

export type CreateSessionDefinitionOptions = {
  id?: SessionId;
  title?: string;
  metadata?: SessionMetadata;
  createdAt?: number;
};

let sessionIdFallbackSeq = 0;

/**
 * Generates a SessionId — prefers crypto.randomUUID(); falls back to a
 * prefix + monotonic sequence when crypto UUID is unavailable.
 */
function createSessionId(): SessionId {
  const cryptoApi =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
      : undefined;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  sessionIdFallbackSeq += 1;
  return `session:${sessionIdFallbackSeq}`;
}

function cloneMetadata(metadata: SessionMetadata): SessionMetadata {
  return { ...metadata };
}

/**
 * Pure factory — returns a plain immutable SessionDefinition.
 * Does not register, persist, or touch SessionState.
 */
export function createSessionDefinition(
  options?: CreateSessionDefinitionOptions
): SessionDefinition {
  const definition: SessionDefinition = {
    id: options?.id !== undefined ? options.id : createSessionId(),
    createdAt:
      options?.createdAt !== undefined ? options.createdAt : Date.now(),
    ...(options?.title !== undefined ? { title: options.title } : {}),
    ...(options?.metadata !== undefined
      ? { metadata: cloneMetadata(options.metadata) }
      : {}),
  };

  return definition;
}
