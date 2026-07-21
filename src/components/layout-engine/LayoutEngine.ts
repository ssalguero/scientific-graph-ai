/**
 * D54.2 — Layout Engine (pure API).
 *
 * Tree → Normalize → Validate → Resolved Tree
 * No React. No hooks. No DOM. No side effects. No caches. No singleton.
 */
import { isLayoutRegion } from "./LayoutRegions";
import {
  createDefaultLayoutTree,
  getLayoutChildren,
  getLayoutNode,
  normalizeLayoutTree,
  validateLayoutTree,
} from "./LayoutTree";
import { validateConstraints } from "./LayoutConstraints";
import type {
  LayoutConstraints,
  LayoutEngineProps,
  LayoutNode,
  LayoutNodeId,
  LayoutRegion,
  LayoutTree,
} from "./types";

function resolveTree(tree: LayoutTree): LayoutTree {
  const normalized = normalizeLayoutTree(tree);
  if (!validateLayoutTree(normalized)) {
    throw new Error("LayoutEngine.resolve: invalid LayoutTree");
  }
  return normalized;
}

export const LayoutEngine = {
  /**
   * Normalize + validate a LayoutTree. Returns a new resolved tree.
   * Never mutates the input.
   */
  resolve(tree: LayoutTree): LayoutTree {
    return resolveTree(tree);
  },

  /**
   * Resolve from LayoutEngineProps. Uses the canonical default tree when
   * `props.tree` is omitted.
   */
  resolveFromProps(props: LayoutEngineProps = {}): LayoutTree {
    const input = props.tree ?? createDefaultLayoutTree();
    return resolveTree(input);
  },

  getNode(tree: LayoutTree, id: LayoutNodeId): LayoutNode | undefined {
    return getLayoutNode(tree, id);
  },

  getChildren(tree: LayoutTree, id: LayoutNodeId): readonly LayoutNode[] {
    return getLayoutChildren(tree, id);
  },

  validateRegion(region: unknown): region is LayoutRegion {
    return isLayoutRegion(region);
  },

  validateConstraints(
    constraints: unknown
  ): constraints is LayoutConstraints {
    return validateConstraints(constraints);
  },

  validateTree(tree: unknown): tree is LayoutTree {
    return validateLayoutTree(tree);
  },
} as const;
