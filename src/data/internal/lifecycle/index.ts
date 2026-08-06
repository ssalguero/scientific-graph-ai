/**
 * DATA Domain — Internal lifecycle barrel (DATA-I3).
 *
 * DATA-internal only. Never part of the public contract surface.
 *
 * @packageDocumentation
 */

export {
  LifecycleState,
  LIFECYCLE_STATES,
  type LifecycleState as LifecycleStateId,
} from "./states";

export {
  ALLOWED_LIFECYCLE_TRANSITIONS,
  isTransitionAllowed,
} from "./transitions";

export {
  TransitionRequester,
  TransitionAuthorityError,
  assertMayRequestTransition,
  type TransitionRequester as TransitionRequesterId,
} from "./authority";

export {
  LIFECYCLE_INVARIANTS,
  LifecycleInvariantError,
  type LifecycleInvariant,
} from "./invariants";

export {
  LifecycleDiagnostics,
  type LifecycleTransitionRecord,
} from "./diagnostics";

export {
  ValidationGate,
  ValidationGateError,
} from "./validation-gate";

export {
  LifecycleTracker,
  type LifecycleRecord,
  type TransitionRequest,
  type TransitionResult,
} from "./lifecycle-tracker";

export {
  completeDerivation,
  type DerivationResult,
  type DerivedIdentityMint,
} from "./derived";
