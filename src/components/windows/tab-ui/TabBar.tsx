/**
 * D62.8 — Tabs UI Foundation · TabBar presentational shell.
 * Authority: docs/D62.0-tabs-ui-discovery.md · TabBarProps Freeze D62.6.
 * Composes TabStrip — forwards props; no business transforms.
 * No Registry / Policy / SelectionStore / Window / Series / science.
 * No internal state · no hooks · no Context · no side-effects.
 */

"use client";

import type { TabBarProps } from "./TabUiTypes";
import { TabStrip } from "./TabStrip";

export function TabBar({
  tabs,
  activeTab,
  onSelect,
  onClose,
  children,
}: TabBarProps) {
  return (
    <div data-tab-bar="">
      <TabStrip
        tabs={tabs}
        activeTab={activeTab}
        onSelect={onSelect}
        onClose={onClose}
      />
      {children}
    </div>
  );
}
