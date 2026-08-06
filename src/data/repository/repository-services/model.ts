/**
 * DATA Domain — Repository / Publication / Discovery models (DATA-P2 / P4 / DATA-I6).
 *
 * Access semantics only — not identity SSOT, not persistence engines.
 *
 * @packageDocumentation
 */

import type { DataEntityClass } from "../../internal/registry/roles";
import type { DataEntityIdentity } from "../../internal/registry/identity";

/** Explicit publication entry in Repository access catalog. */
export interface PublicationRecord {
  readonly identityId: string;
  readonly entityClass: DataEntityClass;
  readonly publishedAt: number;
}

/** Discovery / repository query (no persistence, no search engine). */
export interface RepositoryQuery {
  readonly identityId?: string;
  readonly entityClass?: DataEntityClass;
}

export interface DiscoveryHit {
  readonly identity: DataEntityIdentity;
  readonly publication: PublicationRecord;
}

export interface PublicationReport {
  readonly identityId: string;
  readonly ok: boolean;
  readonly at: number;
  readonly detail?: string;
}

export interface DiscoveryReport {
  readonly query: RepositoryQuery;
  readonly hitCount: number;
  readonly at: number;
}

export interface RetrieveResult {
  readonly ok: boolean;
  readonly identity?: DataEntityIdentity;
  readonly publication?: PublicationRecord;
  readonly error?: string;
}

export interface PublishResult {
  readonly ok: boolean;
  readonly publication?: PublicationRecord;
  readonly error?: string;
}

export interface DiscoverResult {
  readonly ok: boolean;
  readonly hits: readonly DiscoveryHit[];
  readonly report: DiscoveryReport;
}
