/**
 * UX-9.5 — Clipboard Integration Bridge.
 *
 * Product talks to the Bridge; Bridge selects BrowserClipboardAdapter.
 * Logical state remains in ClipboardRegistry (UX-8.6).
 *
 * Clipboard Entry Canonical Freeze: createClipboardEntry() is the sole
 * ClipboardEntry construction point before Registry.set().
 *
 * Clipboard Success Freeze: Registry.set + feedback only after Adapter SUCCESS.
 *
 * Clipboard Feedback Lifetime Freeze: copy/paste feedback is ephemeral UI only.
 */

import type { ClipboardEntry, ClipboardRegistryApi } from "@/ui/clipboard";
import {
  createBrowserClipboardAdapter,
  type BrowserClipboardAdapter,
} from "./BrowserClipboardAdapter";

export type ClipboardFeedbackKind = "copy" | "paste";

export type ClipboardFeedbackSnapshot = Readonly<{
  kind: ClipboardFeedbackKind;
  token: number;
}>;

let feedbackSnapshot: ClipboardFeedbackSnapshot | null = null;
const feedbackListeners = new Set<() => void>();
const FEEDBACK_MS = 900;

function notifyFeedbackListeners(): void {
  for (const listener of feedbackListeners) {
    listener();
  }
}

function emitEphemeralFeedback(kind: ClipboardFeedbackKind): void {
  const token = Date.now();
  feedbackSnapshot = Object.freeze({ kind, token });
  notifyFeedbackListeners();
  globalThis.setTimeout(() => {
    if (feedbackSnapshot?.token === token) {
      feedbackSnapshot = null;
      notifyFeedbackListeners();
    }
  }, FEEDBACK_MS);
}

/** Observe-only ephemeral feedback for FloatingWindow chrome. */
export function subscribeClipboardFeedback(listener: () => void): () => void {
  feedbackListeners.add(listener);
  return () => {
    feedbackListeners.delete(listener);
  };
}

export function getClipboardFeedback(): ClipboardFeedbackSnapshot | null {
  return feedbackSnapshot;
}

export type ClipboardIntegrationBridge = Readonly<{
  createClipboardEntry(text: string): ClipboardEntry;
  copy(text: string, registry: ClipboardRegistryApi): Promise<void>;
  paste(registry: ClipboardRegistryApi): Promise<void>;
}>;

/**
 * Creates the Clipboard Integration Bridge bound to the Browser adapter.
 */
export function createClipboardIntegrationBridge(
  adapter: BrowserClipboardAdapter = createBrowserClipboardAdapter(),
): ClipboardIntegrationBridge {
  function createClipboardEntry(text: string): ClipboardEntry {
    // Clipboard Entry Canonical Freeze — sole construction site
    return Object.freeze({
      id: `ux-9.5-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      kind: "text",
      payload: text,
    });
  }

  return Object.freeze({
    createClipboardEntry,

    async copy(text: string, registry: ClipboardRegistryApi): Promise<void> {
      // Clipboard Success Freeze — write first; set only on SUCCESS
      await adapter.writeText(text);
      registry.set(createClipboardEntry(text));
      emitEphemeralFeedback("copy");
    },

    async paste(registry: ClipboardRegistryApi): Promise<void> {
      // Clipboard Success Freeze — read first; set only on SUCCESS
      const text = await adapter.readText();
      registry.set(createClipboardEntry(text));
      emitEphemeralFeedback("paste");
    },
  });
}

/** Shared Productivity Layer bridge instance (not ClipboardRegistry singleton). */
export const clipboardIntegrationBridge: ClipboardIntegrationBridge =
  createClipboardIntegrationBridge();
