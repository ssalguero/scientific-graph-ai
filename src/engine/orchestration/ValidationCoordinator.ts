/**
 * ENGINE Domain — Validation Coordinator (orchestration).
 * OWNERSHIP: ENGINE owns business precondition / constraint validation pipelines.
 * ENGINE-2: Pass-through hook point (always ok) — no business rules yet.
 * ENGINE-10: Injectable rule for short-circuit / failure testing (no public API change).
 */

import type { ValidationOutcome } from "../contracts/coordination";
import type { ValidationCoordinator as ValidationCoordinatorContract } from "./interfaces";

/** Optional injectable validation rule (ENGINE-internal / tests). */
export type ValidationRule = (
  operationId: string,
  payload?: unknown,
) => ValidationOutcome | Promise<ValidationOutcome>;

/**
 * Validation Coordinator — hook point for the Business Validation pipeline stage.
 * Default: always returns `{ ok: true }` (pass-through).
 */
export class ValidationCoordinator implements ValidationCoordinatorContract {
  private readonly rule: ValidationRule | null;

  constructor(rule?: ValidationRule) {
    this.rule = rule ?? null;
  }

  async validate(
    operationId: string,
    payload?: unknown,
  ): Promise<ValidationOutcome> {
    if (this.rule) {
      return this.rule(operationId, payload);
    }
    return { ok: true };
  }
}

/**
 * Factory — constructs a Validation Coordinator.
 * Pass a rule to inject failure / short-circuit behavior (tests / composition).
 */
export function createValidationCoordinator(
  rule?: ValidationRule,
): ValidationCoordinatorContract {
  return new ValidationCoordinator(rule);
}
