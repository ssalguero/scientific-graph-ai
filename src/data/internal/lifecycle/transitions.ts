/**
 * DATA Domain — Allowed lifecycle transitions (DATA-P5 §4 / DATA-I3).
 *
 * Only listed edges are valid. No implicit transitions.
 *
 * @packageDocumentation
 */

import { LifecycleState, type LifecycleState as LifecycleStateId } from "./states";

/** Frozen allowed edges (from → to[]). */
export const ALLOWED_LIFECYCLE_TRANSITIONS: Record<
  LifecycleStateId,
  readonly LifecycleStateId[]
> = {
  [LifecycleState.Conceived]: [LifecycleState.Registered],
  [LifecycleState.Registered]: [
    LifecycleState.Described,
    LifecycleState.Retired,
  ],
  [LifecycleState.Described]: [
    LifecycleState.Validated,
    LifecycleState.Registered,
    LifecycleState.Retired,
  ],
  [LifecycleState.Validated]: [
    LifecycleState.Available,
    LifecycleState.Described,
    LifecycleState.Retired,
  ],
  [LifecycleState.Available]: [
    LifecycleState.Retired,
    LifecycleState.Transformed,
    // Explicit withdraw-and-redescribe only (never silent mutate) — DATA-P5 note.
    LifecycleState.Described,
  ],
  [LifecycleState.Transformed]: [
    LifecycleState.Derived,
    LifecycleState.Available,
    LifecycleState.Validated,
  ],
  [LifecycleState.Derived]: [
    // Treated as Registered/Described entry into the same lifecycle (P5).
    LifecycleState.Registered,
    LifecycleState.Described,
    LifecycleState.Retired,
  ],
  [LifecycleState.Retired]: [],
};

export function isTransitionAllowed(
  from: LifecycleStateId,
  to: LifecycleStateId,
): boolean {
  return ALLOWED_LIFECYCLE_TRANSITIONS[from].includes(to);
}
