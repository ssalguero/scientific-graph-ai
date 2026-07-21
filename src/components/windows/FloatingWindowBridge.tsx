"use client";

/**
 * D56.3 — Floating Windows Foundation · FloatingWindowBridge.
 * D57.4 — Bridge Mapping: WindowState + WindowPositionStore → FloatingWindowModel[].
 * Sole Floating* consumer of useWindowContext.
 * Layer props unchanged: windows: readonly FloatingWindowModel[].
 * Authority: D56 presentational + bridge architecture · D57.0 Discovery.
 */

import { useWindowContext } from "./WindowContext";
import { FloatingWindowLayer } from "./FloatingWindowLayer";
import type { FloatingWindowModel } from "./FloatingWindowTypes";
import { useWindowPosition } from "./WindowPositionContext";
import type { WindowPosition } from "./WindowPositionStore";
import type { WindowState } from "./WindowTypes";

/** Presentational defaults — size/zIndex are not owned by Position Store (D57). */
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 240;

/**
 * Certified pipeline:
 * PositionStore + WindowState → FloatingWindowModel[] → Layer
 */
function mapToFloatingWindowModels(
  state: WindowState,
  positions: ReadonlyMap<string, WindowPosition>
): FloatingWindowModel[] {
  const models: FloatingWindowModel[] = [];
  let zIndex = 1;

  for (const definition of state.windows.values()) {
    if (state.minimizedIds.has(definition.id)) {
      continue;
    }

    const position = positions.get(definition.id) ?? { x: 0, y: 0 };

    models.push({
      id: definition.id,
      title: definition.title,
      x: position.x,
      y: position.y,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      zIndex,
      visible: definition.visible,
    });

    zIndex += 1;
  }

  return models;
}

export function FloatingWindowBridge() {
  const { state } = useWindowContext();
  const { store, revision } = useWindowPosition();

  // revision tick forces re-read of Position Store after updateDrag mutations
  void revision;

  const windows = mapToFloatingWindowModels(state, store.getAll());

  return <FloatingWindowLayer windows={windows} />;
}
