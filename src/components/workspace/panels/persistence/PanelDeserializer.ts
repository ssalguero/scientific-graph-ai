/** UX-2.8 — JSON / PersistedPanelState → PanelState. Never touches storage. */

import {
  DEFAULT_PANEL_STATE,
  PANEL_MIN_SIZE,
  type PanelId,
  type PanelState,
} from "../state/PanelState";

import type {
  PersistedPanelEntry,
  PersistedPanelState,
} from "./PanelSerializer";

function defaultState(): PanelState {
  return { ...DEFAULT_PANEL_STATE };
}

function clampSize(size: number): number {
  return Math.max(PANEL_MIN_SIZE, size);
}

function isPanelId(value: unknown): value is PanelId {
  return value === "left" || value === "right" || value === "bottom";
}

/** Reject non-UX / database-shaped persistence objects. */
function looksLikeForeignStorage(value: Record<string, unknown>): boolean {
  return (
    "objectStoreNames" in value ||
    "objectStores" in value ||
    "transaction" in value ||
    value["kind"] === "idb" ||
    value["storage"] === "idb"
  );
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function coerceNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function validateEntry(
  side: PanelId,
  value: unknown,
  fallbackCollapsed: boolean,
  fallbackSize: number
): PersistedPanelEntry | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const obj = value as Record<string, unknown>;
  if (!isPanelId(obj.id) || obj.id !== side) {
    return null;
  }
  return {
    id: side,
    collapsed: coerceBoolean(obj.collapsed, fallbackCollapsed),
    size: clampSize(coerceNumber(obj.size, fallbackSize)),
    visible: true,
  };
}

/** Parse raw JSON string → unknown. Invalid / empty → null. */
export function parse(raw: string | null): unknown | null {
  if (raw === null || raw === "") return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Validate unknown → PersistedPanelState.
 * Requires version === 1, required panel keys, valid ids.
 */
export function validate(parsed: unknown): PersistedPanelState | null {
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as Record<string, unknown>;
  if (looksLikeForeignStorage(obj)) return null;
  if (obj.version !== 1) return null;

  const left = validateEntry(
    "left",
    obj.left,
    DEFAULT_PANEL_STATE.leftCollapsed,
    DEFAULT_PANEL_STATE.leftWidth
  );
  const right = validateEntry(
    "right",
    obj.right,
    DEFAULT_PANEL_STATE.rightCollapsed,
    DEFAULT_PANEL_STATE.rightWidth
  );
  const bottom = validateEntry(
    "bottom",
    obj.bottom,
    DEFAULT_PANEL_STATE.bottomCollapsed,
    DEFAULT_PANEL_STATE.bottomHeight
  );
  if (!left || !right || !bottom) return null;

  let activePanel: PersistedPanelState["activePanel"] = null;
  if (obj.activePanel === null || obj.activePanel === undefined) {
    activePanel = null;
  } else if (isPanelId(obj.activePanel)) {
    activePanel = obj.activePanel;
  } else {
    return null;
  }

  return {
    version: 1,
    left,
    right,
    bottom,
    activePanel,
  };
}

/**
 * Nested persisted → flat live PanelState.
 * Clamps sizes; ignores visible; does not apply activePanel.
 */
export function toPanelState(persisted: PersistedPanelState): PanelState {
  return {
    leftCollapsed: persisted.left.collapsed,
    rightCollapsed: persisted.right.collapsed,
    bottomCollapsed: persisted.bottom.collapsed,
    leftWidth: clampSize(persisted.left.size),
    rightWidth: clampSize(persisted.right.size),
    bottomHeight: clampSize(persisted.bottom.size),
  };
}

/**
 * Public object-path entry: unknown → PanelState via validate → toPanelState.
 * Falls back to DEFAULT_PANEL_STATE on failure.
 */
export function deserialize(input: unknown): PanelState {
  const persisted = validate(input);
  if (!persisted) return defaultState();
  return toPanelState(persisted);
}

/**
 * Public string path: parse → validate → toPanelState.
 * Falls back to DEFAULT_PANEL_STATE on failure.
 */
export function fromJSON(raw: string | null): PanelState {
  const parsed = parse(raw);
  if (parsed === null) return defaultState();
  return deserialize(parsed);
}
