/**
 * UX-3.2.1 — Resolved color token contract.
 * Typed projection of Foundation SemanticColorTokens (leaves: string, not TokenRef).
 */

export interface ColorTokens {
  readonly surface: {
    readonly canvas: string;
    readonly default: string;
    readonly raised: string;
    readonly overlay: string;
    readonly floating: string;
    readonly inverse: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly muted: string;
    readonly disabled: string;
    readonly inverse: string;
  };
  readonly border: {
    readonly default: string;
    readonly subtle: string;
    readonly muted: string;
    readonly danger: string;
  };
  readonly brand: {
    readonly primary: string;
    readonly secondary: string;
    readonly hover: string;
    readonly active: string;
  };
  readonly feedback: {
    readonly success: string;
    readonly warning: string;
    readonly danger: string;
    readonly info: string;
  };
}
