/**
 * UX-8.7 — Interaction Command foundation type.
 *
 * Shape Validation Freeze: structural fields only — id / type / payload.
 * Command Opaqueness Freeze: type and payload are opaque beyond shape checks.
 * Command Identity Freeze: id is opaque — Dispatcher never generates, modifies,
 * uniqueness-validates, or interprets it.
 *
 * No callbacks · handlers · execute · promises · metadata · timestamps.
 * No React · no UX-6 Commands · no Runtime.
 */

export type InteractionCommand = Readonly<{
  id: string;
  type: string;
  payload: unknown;
}>;
