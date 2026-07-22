/**
 * D62.3 — Tabs UI Foundation · Tab Selection Policy Engine.
 * Authority: docs/D62.0-tabs-ui-discovery.md · API Freeze D62.2 / D62.3.
 * Pure selection composition — writes only via TabSelectionBridge.
 *
 * Hard Rules:
 * - HR-activeTab-ssot-only — never dual-write TabState / setState
 * - HR-no-auto-select-in-store — Store unchanged; Policy is external
 * - HR-tabs-no-react — no React / JSX / DOM / UI / Series / WindowManager
 */

import type { TabId } from "./TabId";
import type {
  TabSelectionPolicy,
  TabSelectionPolicyAfterUnregisterArgs,
  TabSelectionPolicyEnsureActiveArgs,
} from "./TabSelectionPolicyTypes";

/**
 * Ordered candidate TabIds for afterUnregister.
 * Prefer WindowTabsBridge attach order when window-scoped; else Registry insertion order.
 * Does not mutate Registry or Bridge.
 */
function resolveOrderedCandidates(
  args: TabSelectionPolicyAfterUnregisterArgs
): readonly TabId[] {
  if (args.tabsBridge !== undefined && args.windowId !== undefined) {
    return args.tabsBridge.listTabs(args.windowId);
  }
  return args.registry.list().map((entry) => entry.definition.id);
}

/**
 * Next tab after `removed` in insertion/attach order.
 * Prefer the following id; else the preceding; else undefined.
 */
function pickNextAfterRemoved(
  ordered: readonly TabId[],
  removed: TabId
): TabId | undefined {
  const index = ordered.indexOf(removed);
  if (index >= 0) {
    for (let i = index + 1; i < ordered.length; i += 1) {
      const id = ordered[i];
      if (id !== removed) {
        return id;
      }
    }
    for (let i = index - 1; i >= 0; i -= 1) {
      const id = ordered[i];
      if (id !== removed) {
        return id;
      }
    }
    return undefined;
  }

  for (const id of ordered) {
    if (id !== removed) {
      return id;
    }
  }
  return undefined;
}

/**
 * Creates a pure TabSelectionPolicy.
 * Callers invoke afterUnregister after catalog/bridge mutations — Policy never unregister/detach.
 */
export function createTabSelectionPolicy(): TabSelectionPolicy {
  return {
    afterUnregister(args: TabSelectionPolicyAfterUnregisterArgs): void {
      const active = args.selection.get();
      if (active !== args.removed) {
        return;
      }

      const next = pickNextAfterRemoved(
        resolveOrderedCandidates(args),
        args.removed
      );

      if (next === undefined) {
        args.selection.clear();
        return;
      }

      args.selection.setActive(next);
    },

    ensureActive(args: TabSelectionPolicyEnsureActiveArgs): void {
      const active = args.selection.get();
      const { candidates } = args;

      if (active !== undefined && candidates.includes(active)) {
        return;
      }

      if (candidates.length === 0) {
        args.selection.clear();
        return;
      }

      args.selection.setActive(candidates[0]);
    },
  };
}
