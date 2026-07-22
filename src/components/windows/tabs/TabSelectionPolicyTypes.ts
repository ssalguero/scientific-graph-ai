/**
 * D62.2 — Tabs UI Foundation · Tab Selection Policy types.
 * Authority: docs/D62.0-tabs-ui-discovery.md · API Freeze D62.2.
 * Types only — no runtime, no Policy engine, no next-tab algorithm, no UI.
 *
 * Hard Rules:
 * - HR-activeTab-ssot-only — Policy writes Selection only; never dual-write TabState
 * - No React / JSX / DOM / Series / WindowManager / scientific imports
 * - No auto-selection inside TabSelectionStore / TabRegistry.unregister
 */

import type { TabId } from "./TabId";
import type { TabRegistry } from "./TabRegistryTypes";
import type { TabSelectionBridge } from "./TabSelectionBridge";
import type { WindowId, WindowTabsBridge } from "./WindowTabsBridge";

/**
 * Arguments for post-unregister selection composition (runtime = D62.3).
 * Policy may read Registry / WindowTabsBridge for candidate order;
 * writes exclusively via `selection` (TabSelectionBridge).
 */
export type TabSelectionPolicyAfterUnregisterArgs = {
  /** TabId that was removed from the catalog. */
  removed: TabId;
  /** Optional window scope when WindowTabsBridge ordering is available. */
  windowId?: WindowId;
  /** Catalog authority — read-only for policy composition. */
  registry: TabRegistry;
  /** Sole authorized write path to activeTab. */
  selection: TabSelectionBridge;
  /** Optional Window↔Tabs mapping for attach-order candidates. */
  tabsBridge?: WindowTabsBridge;
};

/**
 * Arguments for future selection reconciliation against a candidate list.
 * Ensures `activeTab` remains valid relative to known TabIds.
 * Writes exclusively via `selection` — never mutates TabState / Definition.
 * Runtime = D62.3+ (types frozen here).
 */
export type TabSelectionPolicyEnsureActiveArgs = {
  /** Candidate TabIds in insertion / attach order (caller-supplied). */
  candidates: readonly TabId[];
  /** Sole authorized write path to activeTab. */
  selection: TabSelectionBridge;
};

/**
 * Public Selection Policy surface — contracts only (D62.2).
 * Implementation (`createTabSelectionPolicy`) = D62.3.
 *
 * Semántica congelada (D62.0 §7.4):
 * - afterUnregister: si active ≠ removed → no-op; si active === removed →
 *   next en insertion/attach order; vacío → clear()
 * - ensureActive: reconciliación futura de activeTab vs candidates (Selection only)
 * - Prohibido: dual-write TabState · auto-select en Store/Registry · React
 */
export type TabSelectionPolicy = {
  afterUnregister(args: TabSelectionPolicyAfterUnregisterArgs): void;
  ensureActive(args: TabSelectionPolicyEnsureActiveArgs): void;
};
