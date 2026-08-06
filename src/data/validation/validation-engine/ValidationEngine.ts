/**
 * Validation Engine — validation outcomes authority (DATA-P6 / DATA-I3).
 *
 * Records pass/fail integrity judgments for a meaning snapshot.
 * Does not mint identity. Does not run scientific algorithms (DATA-I5+).
 * Does not implement metadata/repository/publication behavior.
 *
 * @packageDocumentation
 */

export interface ValidationOutcomeRecord {
  readonly identityId: string;
  readonly passed: boolean;
  readonly recordedAt: number;
}

/**
 * Authority of validation outcomes for a given meaning snapshot (DATA-P6).
 * Opaque pass/fail only — no scientific rule engine in DATA-I3.
 */
export class ValidationEngine {
  private readonly outcomes = new Map<string, ValidationOutcomeRecord>();

  /**
   * Record a validation outcome for an authoritative identity.
   * Scientific rule evaluation is external to this stage; I3 stores the gate result.
   */
  recordOutcome(identityId: string, passed: boolean): ValidationOutcomeRecord {
    const record: ValidationOutcomeRecord = {
      identityId,
      passed,
      recordedAt: Date.now(),
    };
    this.outcomes.set(identityId, record);
    return record;
  }

  getOutcome(identityId: string): ValidationOutcomeRecord | undefined {
    return this.outcomes.get(identityId);
  }

  hasPassed(identityId: string): boolean {
    return this.outcomes.get(identityId)?.passed === true;
  }

  /** Clear outcome when meaning changes (must re-validate before Available). */
  clearOutcome(identityId: string): void {
    this.outcomes.delete(identityId);
  }
}
