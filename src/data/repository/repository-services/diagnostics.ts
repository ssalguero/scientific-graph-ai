/**
 * DATA Domain — Repository diagnostics (DATA-I6).
 *
 * Internal journal / publication & discovery reports — not a public API.
 *
 * @packageDocumentation
 */

import type {
  DiscoveryReport,
  PublicationReport,
  RepositoryQuery,
} from "./model";

export interface RepositoryDiagnosticRecord {
  readonly at: number;
  readonly action: string;
  readonly identityId?: string;
  readonly ok: boolean;
  readonly detail?: string;
}

export class RepositoryDiagnostics {
  private readonly journal: RepositoryDiagnosticRecord[] = [];
  private readonly publications: PublicationReport[] = [];
  private readonly discoveries: DiscoveryReport[] = [];

  record(entry: RepositoryDiagnosticRecord): void {
    this.journal.push(entry);
  }

  recordPublication(report: PublicationReport): void {
    this.publications.push(report);
    this.record({
      at: report.at,
      action: report.ok ? "publish" : "publish-failed",
      identityId: report.identityId,
      ok: report.ok,
      detail: report.detail,
    });
  }

  recordDiscovery(report: DiscoveryReport): void {
    this.discoveries.push(report);
    this.record({
      at: report.at,
      action: "discover",
      ok: true,
      detail: `hits=${report.hitCount}`,
    });
  }

  list(): readonly RepositoryDiagnosticRecord[] {
    return Object.freeze([...this.journal]);
  }

  listPublicationReports(): readonly PublicationReport[] {
    return Object.freeze([...this.publications]);
  }

  listDiscoveryReports(): readonly DiscoveryReport[] {
    return Object.freeze([...this.discoveries]);
  }

  clear(): void {
    this.journal.length = 0;
    this.publications.length = 0;
    this.discoveries.length = 0;
  }
}

export type { RepositoryQuery };
