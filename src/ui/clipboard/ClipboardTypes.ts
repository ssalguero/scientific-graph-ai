/**
 * UX-8.6 — Clipboard foundation types.
 * ClipboardEntry represents a logical payload only.
 * It is NOT the browser or OS clipboard.
 *
 * Clipboard Contract Freeze: logical payload only — not Clipboard API · MIME ·
 * files · images · copied text.
 *
 * Clipboard Identity Freeze: id is opaque — Registry never generates, modifies,
 * validates uniqueness, or interprets it.
 *
 * Payload Opaqueness Freeze: payload is unknown and opaque.
 * No React · no navigator.clipboard · no ClipboardEvent · no window · no document.
 */

export type ClipboardEntry = Readonly<{
  readonly id: string;
  readonly kind: string;
  readonly payload: unknown;
}>;
