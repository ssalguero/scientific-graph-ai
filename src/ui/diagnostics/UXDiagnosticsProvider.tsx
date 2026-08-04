/**
 * UX-6.9 — UXDiagnosticsProvider (sole owner of consolidated report via useRef).
 *
 * Receives UXDiagnosticsInput, aggregates once, holds report in useRef.
 * Context exposes `{ report }` only.
 * No production mount in UX-6.9.
 */

"use client";

import { useRef, type ReactNode } from "react";
import { UXDiagnosticsContext } from "./UXDiagnosticsContext";
import { createUXDiagnosticsReport } from "./UXDiagnosticsAggregator";
import type { UXDiagnosticsInput } from "./UXDiagnosticsTypes";

export type UXDiagnosticsProviderProps = Readonly<{
  children: ReactNode;
  input: UXDiagnosticsInput;
}>;

/**
 * Private owner of the consolidated UX diagnostics report.
 * No useState · no useReducer · no setters · no product wiring · no UI.
 */
export function UXDiagnosticsProvider({
  children,
  input,
}: UXDiagnosticsProviderProps) {
  const reportRef = useRef(createUXDiagnosticsReport(input));

  const value = Object.freeze({
    report: reportRef.current,
  });

  return (
    <UXDiagnosticsContext.Provider value={value}>
      {children}
    </UXDiagnosticsContext.Provider>
  );
}
