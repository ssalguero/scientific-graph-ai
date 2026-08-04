/**
 * UX-6.9 — UX Diagnostics Hooks (read-only Context access layer).
 *
 * Consumes UXDiagnosticsContext only. Does not own, create, or mutate state.
 * No execution · no UI chrome · no telemetry.
 */

"use client";

import { useContext } from "react";
import {
  UXDiagnosticsContext,
  type UXDiagnosticsContextValue,
} from "./UXDiagnosticsContext";

/**
 * Returns the exact Provider-owned UXDiagnosticsContextValue reference.
 * Reference identity of report is part of the UX-6.9 API Freeze.
 */
export function useUXDiagnostics(): UXDiagnosticsContextValue {
  const context = useContext(UXDiagnosticsContext);
  if (context === null) {
    throw new Error(
      "UX diagnostics hooks must be used inside UXDiagnosticsProvider.",
    );
  }
  return context;
}
