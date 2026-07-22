"use client";

/**
 * D65.6 — Session Foundation · Session Provider.
 * Sole owner of SessionRegistry (useRef). Exposes live value through SessionContext.
 * Creates exactly one default session on first mount — id never recreated on re-render.
 * Authority: D65.0 API Freeze · HR-default-session-once · mirrors WindowManager ownership.
 * Bridge = D65.7. page.tsx integration = D65.8.
 */

import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SessionContext,
  type SessionAPI,
  type SessionContextValue,
} from "./SessionContext";
import { createSessionDefinition } from "./SessionDefinition";
import { createSessionRegistry } from "./SessionRegistry";
import { createEmptySessionState } from "./SessionState";
import type { SessionEntry, SessionId } from "./SessionTypes";

export type SessionProviderProps = {
  children?: ReactNode;
};

/**
 * Owns registry + active session state. Renders children with no visual chrome.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const registryRef = useRef(createSessionRegistry());
  const registry = registryRef.current;

  /** One-shot default session — created exactly once for this Provider instance. */
  const defaultSessionRef = useRef<SessionEntry | null>(null);
  if (defaultSessionRef.current === null) {
    const definition = createSessionDefinition();
    const state = createEmptySessionState();
    const entry: SessionEntry = { definition, state };
    registry.register(entry);
    defaultSessionRef.current = entry;
  }

  const defaultSessionId = defaultSessionRef.current.definition.id;

  const [activeSessionId, setActiveSessionId] = useState<
    SessionId | undefined
  >(defaultSessionId);
  const [activeSession, setActiveSession] = useState<
    SessionEntry | undefined
  >(() => registry.get(defaultSessionId) ?? defaultSessionRef.current!);

  const api = useMemo<SessionAPI>(
    () => ({
      register(entry: SessionEntry) {
        return registry.register(entry);
      },

      unregister(id: SessionId) {
        const ok = registry.unregister(id);
        if (!ok) {
          return false;
        }
        setActiveSessionId((prev) => (prev === id ? undefined : prev));
        setActiveSession((prev) =>
          prev?.definition.id === id ? undefined : prev
        );
        return true;
      },

      get(id: SessionId) {
        return registry.get(id);
      },

      list() {
        return registry.list();
      },

      updateState(id: SessionId, patch: Partial<SessionEntry["state"]>) {
        const ok = registry.updateState(id, patch);
        if (!ok) {
          return false;
        }
        setActiveSession((prev) => {
          if (prev?.definition.id !== id) {
            return prev;
          }
          return registry.get(id);
        });
        return true;
      },

      setActiveSession(id: SessionId | undefined) {
        if (id === undefined) {
          setActiveSessionId(undefined);
          setActiveSession(undefined);
          return;
        }
        const entry = registry.get(id);
        if (entry === undefined) {
          return;
        }
        setActiveSessionId(id);
        setActiveSession(entry);
      },
    }),
    [registry]
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      activeSessionId,
      activeSession,
      registry,
      api,
    }),
    [activeSessionId, activeSession, registry, api]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
