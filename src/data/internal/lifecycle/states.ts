/**
 * DATA Domain — Lifecycle states (DATA-P5 / DATA-I3).
 *
 * Labels bind 1:1 to the certified State Model. No new states.
 *
 * @packageDocumentation
 */

export const LifecycleState = {
  Conceived: "Conceived",
  Registered: "Registered",
  Described: "Described",
  Validated: "Validated",
  Available: "Available",
  Transformed: "Transformed",
  Derived: "Derived",
  Retired: "Retired",
} as const;

export type LifecycleState =
  (typeof LifecycleState)[keyof typeof LifecycleState];

export const LIFECYCLE_STATES = [
  LifecycleState.Conceived,
  LifecycleState.Registered,
  LifecycleState.Described,
  LifecycleState.Validated,
  LifecycleState.Available,
  LifecycleState.Transformed,
  LifecycleState.Derived,
  LifecycleState.Retired,
] as const satisfies readonly LifecycleState[];
