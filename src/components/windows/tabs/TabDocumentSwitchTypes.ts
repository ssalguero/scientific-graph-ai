/**
 * D62.4 — Tabs UI Foundation · Tab Document Switch types.
 * Authority: docs/D62.0-tabs-ui-discovery.md · API Freeze D62.4.
 * Types only — no runtime, no controller, no UI, no React.
 *
 * Architecture (LOCKED):
 *   TabId → Opaque Content Handle → Host (tab-ui/**)
 *
 * Hard Rules:
 * - HR-switch-react-agnostic — no React / JSX / DOM / ReactNode
 * - HR-activeTab-ssot-only — switch reads active TabId; does not own Selection
 * - HR-tabs-no-react — this file stays pure TS types
 * - HR-no-series-wiring — no SeriesId
 * - HR-no-scientific — no scientific domain imports
 */

import type { TabId } from "./TabId";

/**
 * Opaque content identity — React-agnostic handle for document content.
 * Host (`tab-ui/**`) is the sole layer that may translate this to React.
 * Must not embed ReactNode, SeriesId, WindowId, or domain payloads.
 */
export type OpaqueContentHandle = {
  contentId: string;
};

/**
 * One TabId ↔ OpaqueContentHandle binding (document slot).
 * Catalog of slots is typically expressed as TabDocumentSlots.
 */
export type TabDocumentSlot = {
  tabId: TabId;
  handle: OpaqueContentHandle;
};

/**
 * Map of TabId → OpaqueContentHandle (insertion/order ownership is caller-side).
 */
export type TabDocumentSlots = ReadonlyMap<TabId, OpaqueContentHandle>;

/**
 * Arguments for Document Switch resolve (runtime = D62.5).
 * `active` is supplied by the caller from Selection SSOT — switch does not read Store.
 */
export type TabDocumentSwitchResolveArgs = {
  active: TabId | undefined;
  slots: TabDocumentSlots;
};

/**
 * Resolve result — visible opaque handle, or undefined when empty / miss.
 */
export type TabDocumentSwitchResolveResult = OpaqueContentHandle | undefined;

/**
 * Public Document Switch surface — contracts only (D62.4).
 * Implementation (`createTabDocumentSwitch`) = D62.5.
 *
 * Semántica congelada (D62.0 §7.5):
 * - resolve: active undefined → undefined; miss slot → undefined; hit → handle
 * - Núcleo cero React; frontera React = Host en tab-ui/**
 */
export type TabDocumentSwitch = {
  resolve(args: TabDocumentSwitchResolveArgs): TabDocumentSwitchResolveResult;
};
