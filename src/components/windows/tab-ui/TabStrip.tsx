/**
 * D62.7 — Tabs UI Foundation · TabStrip presentational UI.
 * Authority: docs/D62.0-tabs-ui-discovery.md · TabStripProps Freeze D62.6.
 * Props-in only — no Registry / Policy / Switch / Window / Series / science.
 * No internal state · no hooks · no Context · no side-effects.
 * isActive = (tab.id === activeTab) — HR-activeTab-ssot-only.
 * UX-I4 — Presentation only (active / hover / focus) via InteractionChromeTokens.
 */

"use client";

import type { TabStripProps } from "./TabUiTypes";
import {
  INTERACTION_FOCUS_RING,
  INTERACTION_MOTION,
  INTERACTION_STATE,
} from "../InteractionChromeTokens";

const TAB_CHROME = {
  list: [
    "flex items-center gap-0.5 border-b border-[var(--color-border-default)]",
    "bg-[var(--color-surface-canvas)] px-1",
  ].join(" "),
  tab: [
    "inline-flex max-w-[12rem] items-center gap-1 rounded-t-[var(--radius-container)]",
    "border border-transparent border-b-0 px-2 py-1.5",
    INTERACTION_MOTION.feedback,
  ].join(" "),
  tabActive: [
    "border-[var(--color-border-default)] bg-[var(--color-surface-default)]",
    "text-[var(--color-text-primary)]",
    "shadow-[var(--elevation-card)]",
  ].join(" "),
  tabInactive: [
    "text-[var(--color-text-muted)]",
    INTERACTION_STATE.hoverSurface,
  ].join(" "),
  select: [
    "min-w-0 truncate text-[length:var(--typography-label-sm-font-size)] font-medium",
    INTERACTION_FOCUS_RING,
  ].join(" "),
  close: [
    "inline-flex h-4 w-4 shrink-0 items-center justify-center",
    "rounded-[var(--radius-container)] text-[var(--color-text-muted)]",
    INTERACTION_STATE.hoverSurface,
    INTERACTION_FOCUS_RING,
    INTERACTION_MOTION.enter,
  ].join(" "),
} as const;

export function TabStrip({
  tabs,
  activeTab,
  onSelect,
  onClose,
}: TabStripProps) {
  return (
    <div role="tablist" data-tab-strip="" className={TAB_CHROME.list}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <div
            key={tab.id}
            role="tab"
            data-tab-id={tab.id}
            data-tab-active={isActive ? "true" : "false"}
            aria-selected={isActive}
            className={[
              TAB_CHROME.tab,
              isActive ? TAB_CHROME.tabActive : TAB_CHROME.tabInactive,
            ].join(" ")}
          >
            <button
              type="button"
              data-tab-select={tab.id}
              className={TAB_CHROME.select}
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
                className={TAB_CHROME.close}
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
