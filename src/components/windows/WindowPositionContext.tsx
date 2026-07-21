"use client";

/**
 * D57.4 — Window Position context (historical).
 * D58.1 — SUPERSEDED by WindowGeometryContext / useWindowGeometry.
 * Compatibility aliases keep D57 naming resolvable; prefer Geometry APIs.
 */

export {
  WindowGeometryProvider as WindowPositionProvider,
  useWindowGeometry as useWindowPosition,
  DEFAULT_WINDOW_GEOMETRY_CONTEXT as DEFAULT_WINDOW_POSITION_CONTEXT,
  WindowGeometryContext as WindowPositionContext,
  type WindowGeometryContextValue as WindowPositionContextValue,
  type WindowGeometryProviderProps as WindowPositionProviderProps,
} from "./WindowGeometryContext";
