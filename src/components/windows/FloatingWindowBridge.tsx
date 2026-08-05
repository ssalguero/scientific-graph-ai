"use client";

/**
 * D56.3 — Floating Windows Foundation · FloatingWindowBridge.
 * D57.4 — Bridge Mapping introduced.
 * D58.1 — Maps WindowGeometryState → FloatingWindowModel[] (no hardcoded sizes).
 * UX-9.1 — Workspace activation: pointerdown → WindowAPI.activate (chrome only).
 *   Does not change z-order · geometry · docking · drag · resize.
 * Sole Floating* consumer of useWindowContext.
 * Authority: D56 presentational + bridge · D58.1 GeometryState · UX-9.1.
 */

import { useWindowContext } from "./WindowContext";
import { FloatingWindow } from "./FloatingWindow";
import type { FloatingWindowModel } from "./FloatingWindowTypes";
import { useWindowGeometry } from "./WindowGeometryContext";
import type { WindowGeometry } from "./WindowGeometryState";
import type { WindowState } from "./WindowTypes";

/**
 * Certified pipeline tail:
 * GeometryState + WindowState → FloatingWindowModel[] → Layer
 */
function mapToFloatingWindowModels(
  state: WindowState,
  geometries: ReadonlyMap<string, WindowGeometry>,
): FloatingWindowModel[] {
  const models: FloatingWindowModel[] = [];
  let zIndex = 1;

  for (const definition of state.windows.values()) {
    if (state.minimizedIds.has(definition.id)) {
      continue;
    }

    const geometry = geometries.get(definition.id) ?? {
      x: 0,
      y: 0,
      width: 320,
      height: 240,
    };

    models.push({
      id: definition.id,
      title: definition.title,
      x: geometry.x,
      y: geometry.y,
      width: geometry.width,
      height: geometry.height,
      zIndex,
      visible: definition.visible,
    });

    zIndex += 1;
  }

  return models;
}

export function FloatingWindowBridge() {
  const { state, api } = useWindowContext();
  const { geometryState, revision } = useWindowGeometry();

  // revision tick forces re-read after GeometryState mutations
  void revision;

  const windows = mapToFloatingWindowModels(state, geometryState.getAll());

  return (
    <>
      {windows
        .filter((window) => window.visible)
        .map((window) => (
          <div
            key={window.id}
            onPointerDownCapture={() => {
              api.activate(window.id);
            }}
          >
            <FloatingWindow window={window} />
          </div>
        ))}
    </>
  );
}
