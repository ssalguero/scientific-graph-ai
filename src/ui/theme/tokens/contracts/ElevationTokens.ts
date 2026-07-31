/**
 * UX-3.2.1 — Resolved elevation token contract.
 * Typed projection of Foundation SemanticElevationTokens (leaves: string, not TokenRef).
 */

export interface ElevationTokens {
  readonly base: string;
  readonly card: string;
  readonly popover: string;
  readonly dialog: string;
  readonly floating: string;
}
