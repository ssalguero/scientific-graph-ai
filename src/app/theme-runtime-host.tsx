"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/ui";

import { legacyAppTokenBridgeStyle } from "./legacy-app-token-bridge";

/**
 * UX-4.1 — Theme Runtime Host Integration.
 * UX-I0 — Visual Modernization Foundation (W0).
 *
 * App-owned adapter: mounts the certified ThemeProvider without modifying it.
 * Policy: adapt the host, not the Provider.
 *
 * UX-I0: applies the legacy `--app-*` → `--color-*` bridge on an inner wrapper
 * so product chrome consumes the Design System immediately without forking tokens.
 */
export function ThemeRuntimeHost({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <div
        className="flex min-h-full flex-1 flex-col bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)]"
        style={legacyAppTokenBridgeStyle}
        data-ux-i0-bridge="legacy-app-tokens"
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
