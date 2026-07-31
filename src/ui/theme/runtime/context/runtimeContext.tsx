"use client";

/**
 * UX-3.7 — Private ThemeRuntime context layer (not exported from barrels).
 *
 * ThemeContext público remains { theme, setTheme, cssVars }.
 * This layer only propagates a stabilized ThemeRuntime reference.
 */

import { createContext, type ReactNode } from "react";
import type { ThemeRuntime } from "../selectors/ThemeSelector";

export const InternalRuntimeContext = createContext<ThemeRuntime | null>(
  null,
);

export type InternalRuntimeProviderProps = {
  value: ThemeRuntime;
  children: ReactNode;
};

/** Private provider — no public hooks (useRuntime forbidden). */
export function InternalRuntimeProvider({
  value,
  children,
}: InternalRuntimeProviderProps) {
  return (
    <InternalRuntimeContext.Provider value={value}>
      {children}
    </InternalRuntimeContext.Provider>
  );
}
