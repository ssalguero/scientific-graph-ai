/**
 * UX-9.5 — Browser Clipboard Adapter.
 *
 * Sole Productivity Layer caller of navigator.clipboard (Clipboard Bridge
 * Authority Freeze · Clipboard Adapter Freeze).
 *
 * Desktop / Plugin adapters remain architectural slots only — no stubs.
 * Text-only transport: readText / writeText.
 */

export type BrowserClipboardAdapter = Readonly<{
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
}>;

/**
 * Creates the Browser Clipboard Adapter.
 * Clipboard Bridge Authority: only this adapter may call navigator.clipboard
 * within the Productivity Layer.
 */
export function createBrowserClipboardAdapter(): BrowserClipboardAdapter {
  return Object.freeze({
    async writeText(text: string): Promise<void> {
      await navigator.clipboard.writeText(text);
    },

    async readText(): Promise<string> {
      return await navigator.clipboard.readText();
    },
  });
}
