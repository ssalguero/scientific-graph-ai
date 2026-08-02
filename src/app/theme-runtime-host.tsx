"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/ui";

/**
 * UX-4.1 — Theme Runtime Host Integration.
 *
 * App-owned adapter: mounts the certified ThemeProvider without modifying it.
 * Policy: adapt the host, not the Provider.
 *
 * Architectural principle: Integrate the certified runtime into the application
 * without modifying certified runtime components.
 */
export function ThemeRuntimeHost({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex min-h-full flex-1 flex-col">{children}</div>
    </ThemeProvider>
  );
}
