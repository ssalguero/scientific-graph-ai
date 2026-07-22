/**
 * D62.8 — Tabs UI Foundation · TabDocumentHost presentational host.
 * Authority: docs/D62.0-tabs-ui-discovery.md · TabDocumentHostProps Freeze D62.6.
 * Sole OpaqueContentHandle → React frontier — does not invoke Document Switch.
 * Receives already-resolved `activeHandle` via props.
 * No Registry / Policy / SelectionStore / Window / Series / science.
 * No internal state · no hooks · no Context · no side-effects.
 */

"use client";

import type { TabDocumentHostProps } from "./TabUiTypes";

export function TabDocumentHost({
  activeHandle,
  renderContent,
  empty,
}: TabDocumentHostProps) {
  return (
    <div data-tab-document-host="">
      {activeHandle === undefined ? empty : renderContent(activeHandle)}
    </div>
  );
}
