/**
 * D62.7 — Tabs UI Foundation · TabStrip presentational UI.
 * Authority: docs/D62.0-tabs-ui-discovery.md · TabStripProps Freeze D62.6.
 * Props-in only — no Registry / Policy / Switch / Window / Series / science.
 * No internal state · no hooks · no Context · no side-effects.
 * isActive = (tab.id === activeTab) — HR-activeTab-ssot-only.
 */

"use client";

import type { TabStripProps } from "./TabUiTypes";

export function TabStrip({
  tabs,
  activeTab,
  onSelect,
  onClose,
}: TabStripProps) {
  return (
    <div role="tablist" data-tab-strip="">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <div
            key={tab.id}
            role="tab"
            data-tab-id={tab.id}
            data-tab-active={isActive ? "true" : "false"}
            aria-selected={isActive}
          >
            <button
              type="button"
              data-tab-select={tab.id}
              onClick={() => {
                onSelect?.(tab.id);
              }}
            >
              {tab.title ?? tab.id}
            </button>
            {onClose !== undefined ? (
              <button
                type="button"
                data-tab-close={tab.id}
                aria-label="Close tab"
                onClick={() => {
                  onClose(tab.id);
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
