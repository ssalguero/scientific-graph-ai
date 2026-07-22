/**
 * D63.6 — Lifecycle + Tab ↔ Series Wiring · ContentHost presentational host.
 * Authority: docs/D63.0-content-lifecycle-discovery.md · ContentHostProps Freeze D63.1.
 * Sole React frontier for windows/content — does not invoke ContentBridge or Registry.
 * Receives `contentId` (+ optional children) via props.
 * No Registry / Bridge / Selection / Window / Series / science.
 * No internal state · no hooks · no Context · no side-effects.
 *
 * Hard Rules:
 * - HR-host-no-ownership — does not create/register/destroy/mutate content or Registry
 * - HR-no-scientific — no scientific renderers
 * - HR-no-workspace-shell — no workspace/ imports
 */

"use client";

import type { ReactNode } from "react";
import type { ContentHostProps } from "./ContentTypes";

type ContentHostComponentProps = ContentHostProps & {
  children?: ReactNode;
};

/**
 * Presentational content host — props-only.
 * Renders children when provided; otherwise returns null.
 * Does not resolve, register, or own content.
 */
export function ContentHost({ contentId, children }: ContentHostComponentProps) {
  if (children === undefined || children === null) {
    return null;
  }

  return <div data-content-host="" data-content-id={contentId}>{children}</div>;
}
