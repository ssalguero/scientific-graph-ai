/**
 * UX-8.5 — Keyboard Navigation foundation types.
 * Navigation intent directions only — no React · no DOM · no KeyboardEvent ·
 * no Focus · no Selection.
 *
 * Navigation Semantics Freeze: members represent intent, not physical keys.
 * NEXT ≠ Tab · UP ≠ ArrowUp · ESCAPE ≠ KeyboardEvent Escape.
 */

export enum KeyboardNavigationDirection {
  NEXT = "NEXT",
  PREVIOUS = "PREVIOUS",
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  ESCAPE = "ESCAPE",
}
