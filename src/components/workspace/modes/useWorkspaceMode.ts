"use client";

import { useContext } from "react";

import {
  WorkspaceModeContext,
  type WorkspaceModeContextValue,
} from "./WorkspaceModeContext";

/**
 * UX-2.10 — Public hook for workspace mode API.
 * Must be used under WorkspaceModeProvider.
 */
export function useWorkspaceMode(): WorkspaceModeContextValue {
  const value = useContext(WorkspaceModeContext);
  if (value == null) {
    throw new Error(
      "useWorkspaceMode must be used within a WorkspaceModeProvider"
    );
  }
  return value;
}
