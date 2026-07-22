/**
 * D62.5 — Tabs UI Foundation · Tab Document Switch Engine.
 * Authority: docs/D62.0-tabs-ui-discovery.md · API Freeze D62.4 / D62.5.
 * Pure resolve — TabId → OpaqueContentHandle. No React. No side-effects.
 *
 * Hard Rules:
 * - HR-switch-react-agnostic — no React / JSX / DOM / ReactNode
 * - HR-activeTab-ssot-only — reads `active` from args; does not own Selection
 * - HR-tabs-no-react — pure TS runtime
 * - HR-no-series-wiring — no Series
 * - HR-no-scientific — no scientific domain
 */

import type {
  TabDocumentSwitch,
  TabDocumentSwitchResolveArgs,
  TabDocumentSwitchResolveResult,
} from "./TabDocumentSwitchTypes";

/**
 * Creates a pure TabDocumentSwitch.
 * resolve: undefined active → undefined; miss → undefined; hit → handle.
 * Never mutates slots, Registry, Selection, or content.
 */
export function createTabDocumentSwitch(): TabDocumentSwitch {
  return {
    resolve(args: TabDocumentSwitchResolveArgs): TabDocumentSwitchResolveResult {
      const { active, slots } = args;
      if (active === undefined) {
        return undefined;
      }
      return slots.get(active);
    },
  };
}
