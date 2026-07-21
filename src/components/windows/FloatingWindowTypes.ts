/**
 * D56.1 — Floating Windows Foundation · public type contracts (API Freeze).
 * Types only — no logic, no render, no wiring.
 */

import type { ReactNode } from "react";

/** Frozen public API — D56 Floating Window Model. */
export interface FloatingWindowModel {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  content?: ReactNode;
}

/** Frozen public API — D56 FloatingWindow props. */
export interface FloatingWindowProps {
  window: FloatingWindowModel;
}

/** Frozen public API — D56 FloatingWindowLayer props. */
export interface FloatingWindowLayerProps {
  windows: readonly FloatingWindowModel[];
}
