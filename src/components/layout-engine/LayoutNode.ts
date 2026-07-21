/**
 * D54.2 — Layout node helpers (pure).
 * No React. No DOM. No state. No mutations of input.
 */
import { createDefaultConstraints, validateConstraints } from "./LayoutConstraints";
import { isLayoutRegion } from "./LayoutRegions";
import { LayoutVisibility, isLayoutVisibility } from "./LayoutVisibility";
import type {
  LayoutConstraints,
  LayoutNode,
  LayoutNodeId,
  LayoutNodeType,
  LayoutRegion,
} from "./types";
import { isFiniteNumber, isPlainObject } from "./LayoutUtils";

const LAYOUT_NODE_TYPES: readonly LayoutNodeType[] = [
  "ROOT",
  "SIDEBAR",
  "WORKSPACE",
  "TOOLBAR",
  "DOCK",
  "INSPECTOR",
  "FLOATING_LAYERS",
  "OVERLAYS",
];

export function isLayoutNodeType(value: unknown): value is LayoutNodeType {
  return (
    typeof value === "string" &&
    (LAYOUT_NODE_TYPES as readonly string[]).includes(value)
  );
}

export function isLayoutNodeId(value: unknown): value is LayoutNodeId {
  return typeof value === "string" && value.length > 0;
}

/**
 * Structural validation of a single node. Does not mutate input.
 */
export function validateLayoutNode(node: unknown): node is LayoutNode {
  if (!isPlainObject(node)) {
    return false;
  }

  if (!isLayoutNodeId(node.id) || !isLayoutNodeType(node.type)) {
    return false;
  }

  if (node.parent !== null && !isLayoutNodeId(node.parent)) {
    return false;
  }

  if (!Array.isArray(node.children)) {
    return false;
  }

  for (const childId of node.children) {
    if (!isLayoutNodeId(childId)) {
      return false;
    }
  }

  if (!isLayoutVisibility(node.visibility) || !isLayoutRegion(node.region)) {
    return false;
  }

  if (!validateConstraints(node.constraints)) {
    return false;
  }

  if (!isPlainObject(node.size)) {
    return false;
  }

  const size = node.size as Record<string, unknown>;
  if (size.width !== undefined && !isFiniteNumber(size.width)) {
    return false;
  }
  if (size.height !== undefined && !isFiniteNumber(size.height)) {
    return false;
  }

  return true;
}

/**
 * Returns a normalized copy of a node. Never mutates the input.
 */
export function normalizeLayoutNode(node: LayoutNode): LayoutNode {
  const size: LayoutNode["size"] = {};
  if (isFiniteNumber(node.size.width)) {
    size.width = node.size.width;
  }
  if (isFiniteNumber(node.size.height)) {
    size.height = node.size.height;
  }

  return {
    id: node.id,
    type: node.type,
    parent: node.parent,
    children: [...node.children],
    visibility: node.visibility,
    size,
    constraints: {
      collapsed: node.constraints.collapsed === true,
      locked: node.constraints.locked === true,
      ...(isFiniteNumber(node.constraints.minWidth)
        ? { minWidth: node.constraints.minWidth }
        : {}),
      ...(isFiniteNumber(node.constraints.maxWidth)
        ? { maxWidth: node.constraints.maxWidth }
        : {}),
      ...(isFiniteNumber(node.constraints.minHeight)
        ? { minHeight: node.constraints.minHeight }
        : {}),
      ...(isFiniteNumber(node.constraints.maxHeight)
        ? { maxHeight: node.constraints.maxHeight }
        : {}),
    },
    region: node.region,
  };
}

export function createLayoutNode(input: {
  id: LayoutNodeId;
  type: LayoutNodeType;
  parent: LayoutNodeId | null;
  children?: LayoutNodeId[];
  visibility?: LayoutVisibility;
  size?: LayoutNode["size"];
  constraints?: Partial<LayoutConstraints>;
  region: LayoutRegion;
}): LayoutNode {
  return normalizeLayoutNode({
    id: input.id,
    type: input.type,
    parent: input.parent,
    children: input.children ? [...input.children] : [],
    visibility: input.visibility ?? LayoutVisibility.VISIBLE,
    size: {
      ...(isFiniteNumber(input.size?.width) ? { width: input.size.width } : {}),
      ...(isFiniteNumber(input.size?.height)
        ? { height: input.size.height }
        : {}),
    },
    constraints: createDefaultConstraints(input.constraints),
    region: input.region,
  });
}

export function getNodeChildIds(node: LayoutNode): readonly LayoutNodeId[] {
  return node.children;
}
