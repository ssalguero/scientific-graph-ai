/**
 * D63.8 — Lifecycle + Tab ↔ Series Wiring · Content Integration (library-only).
 * Authority: docs/D63.0-content-lifecycle-discovery.md · API Freeze D63.8.
 * Thin composition helper: OpaqueContentHandle → ContentBridge → ContentRegistry → ContentHost props.
 *
 * Hard Rules:
 * - HR-d63-8-library-only — never mounted by page.tsx; no product wiring
 * - HR-no-content-cache — resolve always delegates to ContentBridge → Registry.get
 * - HR-host-no-ownership — produces ContentHostProps only; does not mount or own Host
 * - HR-no-product-wiring — no WindowManager / page.tsx / FloatingWindow
 * - HR-no-scientific — no scientific renderers
 * - HR-no-workspace-shell — no workspace/ imports
 *
 * Zero UX / Zero visual change. Not a React component. Not a Context provider.
 */

import type { OpaqueContentHandle } from "../tabs";
import { createContentBridge } from "./ContentBridge";
import type { ContentRegistry } from "./ContentRegistry";
import type { ContentDefinition, ContentHostProps } from "./ContentTypes";

/**
 * Library-only resolve payload for presentational ContentHost composition.
 * Callers may pass `hostProps` into `<ContentHost {...hostProps}>` — this module never mounts.
 */
export type ContentIntegrationResolveResult = {
  definition: ContentDefinition | undefined;
  hostProps: ContentHostProps;
};

/**
 * Frozen library-only composition surface.
 * Wires Registry ↔ Bridge and prepares Host props — no UI mount, no lifecycle, no persistence.
 */
export type ContentIntegration = {
  resolve(handle: OpaqueContentHandle): ContentIntegrationResolveResult;
};

/**
 * Creates a library-only content composition helper bound to a ContentRegistry.
 * Must not be imported or mounted from page.tsx / WindowManager / product chrome.
 */
export function createContentIntegration(
  registry: ContentRegistry
): ContentIntegration {
  const bridge = createContentBridge(registry);

  return {
    resolve(handle: OpaqueContentHandle): ContentIntegrationResolveResult {
      return {
        definition: bridge.resolve(handle),
        hostProps: { contentId: handle.contentId },
      };
    },
  };
}
