"use client";

/**
 * D65.7 — Session Foundation · Session Bridge.
 * Unidirectional in-memory sync: WindowContext → SessionRegistry (windowIds only).
 * Never mutates WindowContext. Never restores. Never persists.
 * Authority: D65.0 API Freeze · HR-bridge-unidirectional · HR-bridge-windows-only.
 * page.tsx integration = D65.8.
 */

import { useEffect } from "react";
import { useWindowContext } from "../windows/WindowContext";
import { useSessionContext } from "./SessionContext";

function sameWindowIds(
  previous: readonly string[],
  next: readonly string[]
): boolean {
  if (previous.length !== next.length) {
    return false;
  }
  for (let i = 0; i < previous.length; i += 1) {
    if (previous[i] !== next[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Silent bridge — renders null. Syncs Window state keys into active Session.windowIds.
 */
export function SessionBridge() {
  const { state } = useWindowContext();
  const { activeSessionId, activeSession, api } = useSessionContext();

  useEffect(() => {
    if (activeSessionId === undefined) {
      return;
    }

    const windowIds = Array.from(state.windows.keys());
    const previous = activeSession?.state.windowIds ?? [];

    if (sameWindowIds(previous, windowIds)) {
      return;
    }

    api.updateState(activeSessionId, { windowIds });
  }, [state.windows, activeSessionId, activeSession, api]);

  return null;
}
