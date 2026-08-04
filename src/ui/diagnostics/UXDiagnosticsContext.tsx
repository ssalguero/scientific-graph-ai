/**
 * UX-6.9 — Private UXDiagnosticsContext (report ownership surface).
 *
 * Declares UXDiagnosticsContextValue and UXDiagnosticsContext only.
 * Does not own aggregation, build reports, or expose hooks.
 */

"use client";

import { createContext } from "react";
import type { UXDiagnosticsReport } from "./UXDiagnosticsReport";

/**
 * Private context value: consolidated report only.
 * No setters · no mutators · no telemetry · no UI chrome.
 */
export type UXDiagnosticsContextValue = Readonly<{
  report: UXDiagnosticsReport;
}>;

export const UXDiagnosticsContext =
  createContext<UXDiagnosticsContextValue | null>(null);
