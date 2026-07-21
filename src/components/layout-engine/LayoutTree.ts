/**
 * D54.2 — Layout tree helpers (pure, immutable).
 * Traverse / validate / normalize. Never mutates input trees.
 */
import { createLayoutNode, normalizeLayoutNode, validateLayoutNode } from "./LayoutNode";
import { LayoutRegion } from "./LayoutRegions";
import { LayoutVisibility } from "./LayoutVisibility";
import type { LayoutNode, LayoutNodeId, LayoutTree } from "./types";
import { isPlainObject, mapRecord } from "./LayoutUtils";

/** Stable node ids for the canonical default shell tree (D54.1 discovery). */
export const DEFAULT_LAYOUT_NODE_IDS = {
  root: "root",
  sidebar: "sidebar",
  workspace: "workspace",
  toolbar: "toolbar",
  dock: "dock",
  inspector: "inspector",
  floatingLayers: "floating-layers",
  overlays: "overlays",
} as const;

/**
 * Canonical default LayoutTree mirroring the current shell model sizes
 * (sidebar 280, dock/inspector 320) as model data — not CSS.
 * Returns a fresh tree every call (no singleton / shared mutable state).
 */
export function createDefaultLayoutTree(): LayoutTree {
  const ids = DEFAULT_LAYOUT_NODE_IDS;

  const root = createLayoutNode({
    id: ids.root,
    type: "ROOT",
    parent: null,
    children: [
      ids.sidebar,
      ids.workspace,
      ids.dock,
      ids.floatingLayers,
      ids.overlays,
    ],
    region: LayoutRegion.CENTER,
    visibility: LayoutVisibility.VISIBLE,
  });

  const sidebar = createLayoutNode({
    id: ids.sidebar,
    type: "SIDEBAR",
    parent: ids.root,
    region: LayoutRegion.LEFT,
    size: { width: 280 },
    constraints: { minWidth: 64, maxWidth: 280 },
  });

  const workspace = createLayoutNode({
    id: ids.workspace,
    type: "WORKSPACE",
    parent: ids.root,
    children: [ids.toolbar],
    region: LayoutRegion.CENTER,
  });

  const toolbar = createLayoutNode({
    id: ids.toolbar,
    type: "TOOLBAR",
    parent: ids.workspace,
    region: LayoutRegion.TOP,
  });

  const dock = createLayoutNode({
    id: ids.dock,
    type: "DOCK",
    parent: ids.root,
    children: [ids.inspector],
    region: LayoutRegion.RIGHT,
    size: { width: 320 },
    constraints: { minWidth: 240, maxWidth: 480 },
  });

  const inspector = createLayoutNode({
    id: ids.inspector,
    type: "INSPECTOR",
    parent: ids.dock,
    region: LayoutRegion.RIGHT,
    size: { width: 320 },
    constraints: { minWidth: 240, maxWidth: 480 },
  });

  const floatingLayers = createLayoutNode({
    id: ids.floatingLayers,
    type: "FLOATING_LAYERS",
    parent: ids.root,
    region: LayoutRegion.FLOATING,
  });

  const overlays = createLayoutNode({
    id: ids.overlays,
    type: "OVERLAYS",
    parent: ids.root,
    region: LayoutRegion.FLOATING,
  });

  return {
    rootId: ids.root,
    nodes: {
      [ids.root]: root,
      [ids.sidebar]: sidebar,
      [ids.workspace]: workspace,
      [ids.toolbar]: toolbar,
      [ids.dock]: dock,
      [ids.inspector]: inspector,
      [ids.floatingLayers]: floatingLayers,
      [ids.overlays]: overlays,
    },
  };
}

export function getLayoutNode(
  tree: LayoutTree,
  id: LayoutNodeId
): LayoutNode | undefined {
  return tree.nodes[id];
}

export function getLayoutChildren(
  tree: LayoutTree,
  id: LayoutNodeId
): readonly LayoutNode[] {
  const node = tree.nodes[id];
  if (!node) {
    return [];
  }

  const children: LayoutNode[] = [];
  for (const childId of node.children) {
    const child = tree.nodes[childId];
    if (child) {
      children.push(child);
    }
  }
  return children;
}

/**
 * Validates tree structure: root exists, parent/child links consistent,
 * all referenced ids present, no unknown nodes required beyond map.
 * Does not mutate input.
 */
export function validateLayoutTree(tree: unknown): tree is LayoutTree {
  if (!isPlainObject(tree)) {
    return false;
  }

  if (typeof tree.rootId !== "string" || tree.rootId.length === 0) {
    return false;
  }

  if (!isPlainObject(tree.nodes)) {
    return false;
  }

  const nodes = tree.nodes as Record<string, unknown>;
  const root = nodes[tree.rootId as string];
  if (!validateLayoutNode(root)) {
    return false;
  }

  if (root.parent !== null) {
    return false;
  }

  for (const key of Object.keys(nodes)) {
    const node = nodes[key];
    if (!validateLayoutNode(node)) {
      return false;
    }
    if (node.id !== key) {
      return false;
    }

    if (node.parent !== null) {
      const parent = nodes[node.parent];
      if (!validateLayoutNode(parent)) {
        return false;
      }
      if (!parent.children.includes(node.id)) {
        return false;
      }
    }

    for (const childId of node.children) {
      const child = nodes[childId];
      if (!validateLayoutNode(child)) {
        return false;
      }
      if (child.parent !== node.id) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Returns a normalized deep copy of the tree. Never mutates the input.
 */
export function normalizeLayoutTree(tree: LayoutTree): LayoutTree {
  return {
    rootId: tree.rootId,
    nodes: mapRecord(tree.nodes, (node) => normalizeLayoutNode(node)),
  };
}
