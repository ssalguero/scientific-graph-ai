/**
 * DATA Domain — Publication eligibility (DATA-I6).
 *
 * Eligibility requires Authoritative identity + Available lifecycle +
 * Validation Gate pass. Repository does not mutate lifecycle.
 *
 * @packageDocumentation
 */

import type { RegistryAuthority } from "../../internal/registry/authority";
import type { LifecycleTracker } from "../../internal/lifecycle/lifecycle-tracker";
import { LifecycleState } from "../../internal/lifecycle/states";
import type { ValidationEngine } from "../../validation/validation-engine/ValidationEngine";
import { RepositoryInvariantError } from "./invariants";

export interface EligibilityResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export function evaluatePublicationEligibility(
  identityId: string,
  authority: RegistryAuthority,
  lifecycle: LifecycleTracker,
  validationEngine: ValidationEngine,
): EligibilityResult {
  const errors: string[] = [];

  const identity = authority.resolveIdentity(identityId);
  if (!identity) {
    errors.push(`not in Authoritative Registry: ${identityId}`);
  }

  const state = lifecycle.getState(identityId);
  if (state !== LifecycleState.Available) {
    errors.push(
      `lifecycle must be Available for publication (got ${state ?? "missing"})`,
    );
  }

  if (!validationEngine.hasPassed(identityId)) {
    errors.push("Validation Gate has not passed for this identity");
  }

  return { ok: errors.length === 0, errors: Object.freeze(errors) };
}

export function assertPublicationEligibility(
  identityId: string,
  authority: RegistryAuthority,
  lifecycle: LifecycleTracker,
  validationEngine: ValidationEngine,
): void {
  const result = evaluatePublicationEligibility(
    identityId,
    authority,
    lifecycle,
    validationEngine,
  );
  if (!result.ok) {
    const missingRegistry = result.errors.some((e) =>
      e.includes("Authoritative Registry"),
    );
    const missingValidation = result.errors.some((e) =>
      e.includes("Validation Gate"),
    );
    throw new RepositoryInvariantError(
      missingRegistry
        ? "repository-never-bypasses-authoritative-registry"
        : missingValidation
          ? "publication-never-bypasses-validation-gate"
          : "publish-only-eligible-entities",
      result.errors.join("; "),
    );
  }
}

/** Still visible to Discovery: published AND currently Available + in registry. */
export function isStillAvailableForDiscovery(
  identityId: string,
  authority: RegistryAuthority,
  lifecycle: LifecycleTracker,
): boolean {
  if (!authority.resolveIdentity(identityId)) return false;
  return lifecycle.getState(identityId) === LifecycleState.Available;
}
