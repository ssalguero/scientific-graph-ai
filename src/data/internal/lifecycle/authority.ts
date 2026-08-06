/**
 * DATA Domain — Transition Authority (DATA-P5 §7 / DATA-I3).
 *
 * ENGINE may request lifecycle progression.
 * Only DATA determines whether a transition is scientifically valid.
 * Infrastructure never authorizes scientific transitions.
 * Consumers never modify lifecycle state directly.
 *
 * @packageDocumentation
 */

export const TransitionRequester = {
  ENGINE: "ENGINE",
  DATA: "DATA",
  Infrastructure: "Infrastructure",
  Consumer: "Consumer",
} as const;

export type TransitionRequester =
  (typeof TransitionRequester)[keyof typeof TransitionRequester];

export class TransitionAuthorityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransitionAuthorityError";
  }
}

/**
 * Assert the requester may ask for a transition.
 * DATA always evaluates validity; Infrastructure/Consumer cannot authorize.
 */
export function assertMayRequestTransition(
  requester: TransitionRequester,
): void {
  if (
    requester === TransitionRequester.Infrastructure ||
    requester === TransitionRequester.Consumer
  ) {
    throw new TransitionAuthorityError(
      `Transition Authority: ${requester} must never modify or authorize lifecycle state. ENGINE may request; only DATA determines validity.`,
    );
  }
}
