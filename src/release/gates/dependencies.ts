/**
 * RELEASE-P2 — Gate dependency model (D-P2-06, D-P2-07, D-P2-08).
 */

import type { ReleaseGateId } from "../readiness/vocabulary";
import { CATEGORY_GATES } from "../readiness/vocabulary";

export type GateDependencyEdge = {
  readonly from: ReleaseGateId;
  readonly to: ReleaseGateId;
  readonly kind: "REQUIRES_GATE";
};

/** Default planning graph: FINAL_CERTIFICATION requires every category gate. */
export function defaultFinalCertificationDependencies(): readonly GateDependencyEdge[] {
  return CATEGORY_GATES.map((to) => ({
    from: "FINAL_CERTIFICATION" as const,
    to,
    kind: "REQUIRES_GATE" as const,
  }));
}

export type DependencyValidation =
  | { readonly ok: true; readonly edges: readonly GateDependencyEdge[] }
  | { readonly ok: false; readonly reason: string; readonly cycle?: readonly ReleaseGateId[] };

export function detectGateDependencyCycle(
  edges: readonly GateDependencyEdge[],
): readonly ReleaseGateId[] | null {
  const adj = new Map<ReleaseGateId, ReleaseGateId[]>();
  for (const e of edges) {
    const list = adj.get(e.from) ?? [];
    list.push(e.to);
    adj.set(e.from, list);
  }

  const visiting = new Set<ReleaseGateId>();
  const visited = new Set<ReleaseGateId>();
  const stack: ReleaseGateId[] = [];

  const dfs = (node: ReleaseGateId): readonly ReleaseGateId[] | null => {
    if (visiting.has(node)) {
      const idx = stack.indexOf(node);
      return stack.slice(idx).concat(node);
    }
    if (visited.has(node)) return null;
    visiting.add(node);
    stack.push(node);
    for (const next of adj.get(node) ?? []) {
      const cycle = dfs(next);
      if (cycle) return cycle;
    }
    stack.pop();
    visiting.delete(node);
    visited.add(node);
    return null;
  };

  for (const e of edges) {
    const cycle = dfs(e.from);
    if (cycle) return cycle;
  }
  return null;
}

export function validateGateDependencies(
  edges: readonly GateDependencyEdge[],
): DependencyValidation {
  const cycle = detectGateDependencyCycle(edges);
  if (cycle) {
    return {
      ok: false,
      reason: "Circular gate dependencies are forbidden (D-P2-07)",
      cycle,
    };
  }
  return { ok: true, edges };
}

export function finalCertificationDependsOnCategories(
  edges: readonly GateDependencyEdge[] = defaultFinalCertificationDependencies(),
): boolean {
  const required = new Set(CATEGORY_GATES);
  for (const e of edges) {
    if (e.from === "FINAL_CERTIFICATION") required.delete(e.to);
  }
  return required.size === 0;
}

export function productionReleaseDependencyAllowed(): false {
  return false;
}
