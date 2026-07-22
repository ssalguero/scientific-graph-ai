/**
 * D62.6 — Tabs UI Foundation · tab-ui public props Freeze.
 * Authority: docs/D62.0-tabs-ui-discovery.md · API Freeze D62.6.
 * Types only — no components, no render, no styles, no behavior.
 *
 * Consumes tabs/** exclusively via the public barrel (`../tabs`).
 * Deep imports into tabs/Tab*.ts are prohibited (HR-tabs-barrel-only).
 *
 * Activation: callers pass `activeTab`; render derives
 * `isActive = (tab.id === activeTab)` — HR-activeTab-ssot-only.
 * Host translates OpaqueContentHandle → React (HR-switch-react-agnostic).
 */

import type { ReactNode } from "react";
import type { OpaqueContentHandle, TabId } from "../tabs";

/**
 * Presentational tab row item — props-in only.
 * No Registry / Store / Policy / Switch / Window / Series coupling.
 */
export type TabUiItem = {
  id: TabId;
  title?: string;
};

/** Declarative select callback — no imposed implementation. */
export type TabUiSelectHandler = (tabId: TabId) => void;

/** Declarative close callback — no imposed implementation. */
export type TabUiCloseHandler = (tabId: TabId) => void;

/**
 * TabStrip props — ordered list chrome.
 * `isActive` is derived in render from `activeTab`; not a prop.
 */
export type TabStripProps = {
  tabs: readonly TabUiItem[];
  activeTab: TabId | undefined;
  onSelect?: TabUiSelectHandler;
  onClose?: TabUiCloseHandler;
};

/**
 * TabBar props — strip composition shell.
 * Optional `children` for adjacent presentational slots (e.g. host below).
 */
export type TabBarProps = {
  tabs: readonly TabUiItem[];
  activeTab: TabId | undefined;
  onSelect?: TabUiSelectHandler;
  onClose?: TabUiCloseHandler;
  children?: ReactNode;
};

/**
 * TabDocumentHost props — sole OpaqueContentHandle → React frontier.
 * Does not invoke Document Switch; receives already-resolved `activeHandle`.
 */
export type TabDocumentHostProps = {
  activeHandle: OpaqueContentHandle | undefined;
  renderContent: (handle: OpaqueContentHandle) => ReactNode;
  empty?: ReactNode;
};
