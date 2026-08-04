/**
 * UX-6.9 — UX Diagnostics Integration Bridge (pass-through).
 *
 * useUXDiagnostics() = Availability assertion only (Provider presence).
 * Does not own state, mutate, execute commands, or wire chrome.
 * No production mount in UX-6.9.
 */

"use client";

import type { ReactNode } from "react";
import { useUXDiagnostics } from "./useUXDiagnostics";

export type UXDiagnosticsBridgeProps = Readonly<{
  children: ReactNode;
}>;

/**
 * Decoupled integration point between UX Diagnostics and future certification.
 * Availability assertion only — no render chrome, no conditional render.
 */
export function UXDiagnosticsBridge({ children }: UXDiagnosticsBridgeProps) {
  useUXDiagnostics();
  return <>{children}</>;
}
