/**
 * UX-2.9 — Pure resize math (API Freeze).
 * Exact exports: clamp, delta, applyLimits, computeNextSize, snap.
 * No UI library · No Context · No browser APIs · No events · No side effects.
 */

import type { ResizeAxis, ResizeConstraintSet } from "./ResizeTypes";

/** Bound value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Pointer travel since session start: currentClient - startClient. */
export function delta(startClient: number, currentClient: number): number {
  return currentClient - startClient;
}

/** Axis min/max from frozen constraints. */
export function applyLimits(
  value: number,
  axis: ResizeAxis,
  constraints: ResizeConstraintSet
): number {
  if (axis === "left") {
    return clamp(value, constraints.MIN_LEFT, constraints.MAX_LEFT);
  }
  if (axis === "right") {
    return clamp(value, constraints.MIN_RIGHT, constraints.MAX_RIGHT);
  }
  return clamp(value, constraints.MIN_BOTTOM, constraints.MAX_BOTTOM);
}

/**
 * Identity snap (UX-2.9). Pure hook reserved for future grid snap.
 * Always returns the input size unchanged in this phase.
 */
export function snap(size: number): number {
  return size;
}

/**
 * Single pure entry for next panel size during drag.
 * Always: startSize + signedDelta (never currentSize + delta).
 * left: drag positive client → grow; right/bottom: invert delta.
 */
export function computeNextSize(
  startSize: number,
  startClient: number,
  currentClient: number,
  axis: ResizeAxis,
  constraints: ResizeConstraintSet
): number {
  const d = delta(startClient, currentClient);
  const signed = axis === "left" ? d : -d;
  const raw = startSize + signed;
  return snap(applyLimits(raw, axis, constraints));
}
