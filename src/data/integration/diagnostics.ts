/**
 * DATA Domain — Integration diagnostics (DATA-I7).
 *
 * Internal journal for outward coordination — not a public API capability.
 *
 * @packageDocumentation
 */

export interface IntegrationDiagnosticRecord {
  readonly at: number;
  readonly action: string;
  readonly capabilityGroup?: string;
  readonly ok: boolean;
  readonly detail?: string;
}

export class IntegrationDiagnostics {
  private readonly journal: IntegrationDiagnosticRecord[] = [];

  record(entry: IntegrationDiagnosticRecord): void {
    this.journal.push(entry);
  }

  list(): readonly IntegrationDiagnosticRecord[] {
    return Object.freeze([...this.journal]);
  }

  clear(): void {
    this.journal.length = 0;
  }
}
