/**
 * UX-3.2.1 — Resolved motion token contract.
 * Typed projection of Foundation SemanticMotionTokens (leaves: string, not TokenRef).
 */

export interface MotionTokens {
  readonly feedback: {
    readonly duration: string;
    readonly easing: string;
  };
  readonly enter: {
    readonly duration: string;
    readonly easing: string;
  };
  readonly exit: {
    readonly duration: string;
    readonly easing: string;
  };
}
