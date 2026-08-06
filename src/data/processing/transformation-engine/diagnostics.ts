/**
 * DATA Domain — Transformation diagnostics (DATA-I5).
 *
 * Internal journal / reports — not a public API.
 *
 * @packageDocumentation
 */

import type { TransformationReport, TransformationKind } from "./model";

export interface TransformationDiagnosticRecord {
  readonly at: number;
  readonly transformationId?: string;
  readonly sourceIdentityId: string;
  readonly derivedIdentityId?: string;
  readonly kind?: TransformationKind;
  readonly action: string;
  readonly ok: boolean;
  readonly detail?: string;
}

export class TransformationDiagnostics {
  private readonly journal: TransformationDiagnosticRecord[] = [];
  private readonly reports: TransformationReport[] = [];

  record(entry: TransformationDiagnosticRecord): void {
    this.journal.push(entry);
  }

  recordReport(report: TransformationReport): void {
    this.reports.push(report);
    this.record({
      at: report.at,
      transformationId: report.transformationId,
      sourceIdentityId: report.sourceIdentityId,
      derivedIdentityId: report.derivedIdentityId,
      kind: report.kind,
      action: "transformation-complete",
      ok: true,
    });
  }

  list(): readonly TransformationDiagnosticRecord[] {
    return Object.freeze([...this.journal]);
  }

  listReports(): readonly TransformationReport[] {
    return Object.freeze([...this.reports]);
  }

  clear(): void {
    this.journal.length = 0;
    this.reports.length = 0;
  }
}
