import type { ReactNode } from "react";

import { StatusBarLayout } from "./StatusBarLayout";

/**
 * UX-4.7 — Permanent application chrome Status Bar.
 *
 * Documentary principle (FROZEN):
 * Status Bar Integration introduces the permanent application chrome container.
 * Product status, runtime telemetry and feature indicators remain out of scope.
 *
 * Architectural principles (FROZEN):
 * - StatusBar is the permanent default chrome of the AppShell.
 *   Placeholder mode ends in UX-4.7.
 * - StatusBar is a chrome component, not a feature component.
 * - Layout-only: no hooks, providers, stores, effects, or Runtime.
 * - The StatusBar public API is intentionally minimal.
 *   Additional props require a future additive API change.
 *
 * CRP-6.2 — Empty StatusBar presentation is visually suppressed (no status theater).
 * Infrastructure and AppShell status region remain; do not delete.
 *
 * Public API (FROZEN):
 *   children?: ReactNode
 *   className?: string
 */

export type StatusBarProps = {
  children?: ReactNode;
  className?: string;
};

export function StatusBar({ children, className }: StatusBarProps) {
  return (
    <StatusBarLayout className={className}>{children}</StatusBarLayout>
  );
}
