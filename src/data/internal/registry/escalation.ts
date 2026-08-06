/**
 * DATA Domain — Ownership Escalation Rule (DATA-P6 §9).
 *
 * Whenever two components appear to own the same concept:
 * 1. Ownership conflict is declared.
 * 2. Implementation work stops.
 * 3. Architecture review is required.
 * 4. Ownership is resolved before development resumes.
 *
 * @packageDocumentation
 */

import type { DataOwnerComponent } from "./roles";

export class OwnershipEscalationError extends Error {
  readonly concept: string;
  readonly claimants: readonly DataOwnerComponent[];

  constructor(concept: string, claimants: readonly DataOwnerComponent[]) {
    super(
      `DATA Ownership Escalation: conflict on "${concept}" between [${claimants.join(", ")}]. Stop implementation; architecture review required.`,
    );
    this.name = "OwnershipEscalationError";
    this.concept = concept;
    this.claimants = claimants;
  }
}

/**
 * Declare an ownership conflict and stop.
 * Never “fix” dual ownership in code.
 */
export function escalateOwnershipConflict(
  concept: string,
  claimants: readonly DataOwnerComponent[],
): never {
  throw new OwnershipEscalationError(concept, claimants);
}
