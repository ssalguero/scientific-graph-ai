"use client";

/**
 * D65.5 — Session Foundation · Session Context (shell).
 * Exposes `{ activeSessionId, activeSession, registry, api }` via useSessionContext().
 * No presentation. No ownership. No wiring.
 * Default values remain safe no-ops when Provider is absent.
 * Authority: D65.0 API Freeze · mirrors WindowContext philosophy.
 * Provider ownership = D65.6. Bridge = D65.7.
 */

import { createContext, useContext } from "react";
import type { SessionRegistry } from "./SessionRegistry";
import type { SessionEntry, SessionId } from "./SessionTypes";

/** Thin session API — declared now; live wiring arrives with SessionProvider (D65.6). */
export type SessionAPI = {
  register(entry: SessionEntry): boolean;
  unregister(id: SessionId): boolean;
  get(id: SessionId): SessionEntry | undefined;
  list(): readonly SessionEntry[];
  updateState(
    id: SessionId,
    patch: Partial<SessionEntry["state"]>
  ): boolean;
  setActiveSession(id: SessionId | undefined): void;
};

/** Context value — active session + registry + API. */
export type SessionContextValue = {
  activeSessionId?: SessionId;
  activeSession?: SessionEntry;
  registry: SessionRegistry;
  api: SessionAPI;
};

const NOOP_SESSION_REGISTRY: SessionRegistry = {
  register() {
    return false;
  },
  unregister() {
    return false;
  },
  get() {
    return undefined;
  },
  list() {
    return [];
  },
  updateState() {
    return false;
  },
};

const NOOP_SESSION_API: SessionAPI = {
  register() {
    return false;
  },
  unregister() {
    return false;
  },
  get() {
    return undefined;
  },
  list() {
    return [];
  },
  updateState() {
    return false;
  },
  setActiveSession() {
    /* no-op outside provider */
  },
};

export const DEFAULT_SESSION_CONTEXT: SessionContextValue = Object.freeze({
  registry: NOOP_SESSION_REGISTRY,
  api: NOOP_SESSION_API,
});

export const SessionContext =
  createContext<SessionContextValue>(DEFAULT_SESSION_CONTEXT);

export function useSessionContext(): SessionContextValue {
  return useContext(SessionContext);
}
