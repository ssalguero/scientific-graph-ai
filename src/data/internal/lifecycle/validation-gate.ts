/**
 * DATA Domain — Validation Gate (DATA-P5 / DATA-I3).
 *
 * Validation precedes Availability (and precedes any Publish).
 * No availability without validation success for that meaning.
 *
 * @packageDocumentation
 */

import type { ValidationEngine } from "../../validation/validation-engine/ValidationEngine";
import {
  LifecycleInvariantError,
} from "./invariants";
import { LifecycleState, type LifecycleState as LifecycleStateId } from "./states";

export class ValidationGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationGateError";
  }
}

export class ValidationGate {
  constructor(private readonly validationEngine: ValidationEngine) {}

  /**
   * Described → Validated requires a successful recorded outcome.
   */
  assertCanEnterValidated(identityId: string): void {
    if (!this.validationEngine.hasPassed(identityId)) {
      throw new ValidationGateError(
        `Validation Gate: cannot enter Validated without successful validation for ${identityId}`,
      );
    }
  }

  /**
   * Validation-before-Available: Validated → Available requires current pass.
   */
  assertCanEnterAvailable(identityId: string): void {
    if (!this.validationEngine.hasPassed(identityId)) {
      throw new LifecycleInvariantError(
        "never-become-Available-without-successful-Validation",
        `identity ${identityId} lacks successful Validation`,
      );
    }
  }

  /**
   * Meaning-change paths invalidate prior validation.
   */
  invalidateOnMeaningChange(
    identityId: string,
    to: LifecycleStateId,
  ): void {
    if (
      to === LifecycleState.Described ||
      to === LifecycleState.Registered
    ) {
      this.validationEngine.clearOutcome(identityId);
    }
  }
}
