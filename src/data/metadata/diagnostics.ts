/**
 * DATA Domain — Metadata diagnostics (DATA-I4).
 *
 * Internal journal only — not a public API.
 *
 * @packageDocumentation
 */

export interface MetadataDiagnosticRecord {
  readonly at: number;
  readonly associationId: string;
  readonly authoritativeIdentityId: string;
  readonly action: string;
  readonly ok: boolean;
  readonly detail?: string;
}

export class MetadataDiagnostics {
  private readonly journal: MetadataDiagnosticRecord[] = [];

  record(entry: MetadataDiagnosticRecord): void {
    this.journal.push(entry);
  }

  list(): readonly MetadataDiagnosticRecord[] {
    return Object.freeze([...this.journal]);
  }

  listFor(authoritativeIdentityId: string): readonly MetadataDiagnosticRecord[] {
    return Object.freeze(
      this.journal.filter(
        (e) => e.authoritativeIdentityId === authoritativeIdentityId,
      ),
    );
  }

  clear(): void {
    this.journal.length = 0;
  }
}
