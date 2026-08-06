/**
 * Repository Services — availability / access mediation (DATA-P2 / P6 / DATA-I6).
 *
 * Queries Authoritative Registries; never creates identity; never modifies
 * Lifecycle or Ownership; never implements persistence engines.
 * Publication catalogs access; Discovery returns published + Available only.
 *
 * @packageDocumentation
 */

import type { RegistryAuthority } from "../../internal/registry/authority";
import type { LifecycleTracker } from "../../internal/lifecycle/lifecycle-tracker";
import type { ValidationEngine } from "../../validation/validation-engine/ValidationEngine";
import type { DataEntityClass } from "../../internal/registry/roles";
import { RepositoryDiagnostics } from "./diagnostics";
import {
  assertPublicationEligibility,
  evaluatePublicationEligibility,
  isStillAvailableForDiscovery,
} from "./eligibility";
import { RepositoryInvariantError } from "./invariants";
import type {
  DiscoverResult,
  DiscoveryHit,
  PublicationRecord,
  PublishResult,
  RepositoryQuery,
  RetrieveResult,
} from "./model";

export interface RepositoryServicesDeps {
  readonly authority: RegistryAuthority;
  readonly lifecycle: LifecycleTracker;
  readonly validationEngine: ValidationEngine;
}

export class RepositoryServices {
  readonly diagnostics = new RepositoryDiagnostics();
  /** In-memory access catalog — not a persistence engine / not identity SSOT. */
  private readonly published = new Map<string, PublicationRecord>();

  constructor(private readonly deps: RepositoryServicesDeps) {}

  /**
   * Publish an eligible identity into the Repository access catalog.
   * Does not mint identity. Does not change Lifecycle state.
   */
  publishAsset(identityId: string): PublishResult {
    try {
      assertPublicationEligibility(
        identityId,
        this.deps.authority,
        this.deps.lifecycle,
        this.deps.validationEngine,
      );
      const identity = this.deps.authority.resolveIdentity(identityId)!;
      const publication: PublicationRecord = {
        identityId,
        entityClass: identity.entityClass,
        publishedAt: Date.now(),
      };
      this.published.set(identityId, publication);
      this.diagnostics.recordPublication({
        identityId,
        ok: true,
        at: publication.publishedAt,
      });
      return { ok: true, publication };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.diagnostics.recordPublication({
        identityId,
        ok: false,
        at: Date.now(),
        detail: message,
      });
      return { ok: false, error: message };
    }
  }

  /**
   * Remove from access catalog only — does not modify Lifecycle.
   */
  unpublishAsset(identityId: string): PublishResult {
    const existing = this.published.get(identityId);
    if (!existing) {
      return {
        ok: false,
        error: `not in publication catalog: ${identityId}`,
      };
    }
    this.published.delete(identityId);
    this.diagnostics.recordPublication({
      identityId,
      ok: true,
      at: Date.now(),
      detail: "unpublished",
    });
    return { ok: true, publication: existing };
  }

  /**
   * Discover published assets with availability filtering.
   * Returns only identities that remain published AND Available in Lifecycle
   * AND present in Authoritative Registry.
   */
  discoverAssets(query: RepositoryQuery = {}): DiscoverResult {
    const hits: DiscoveryHit[] = [];
    for (const publication of this.published.values()) {
      if (query.identityId && publication.identityId !== query.identityId) {
        continue;
      }
      if (
        query.entityClass &&
        publication.entityClass !== query.entityClass
      ) {
        continue;
      }
      if (
        !isStillAvailableForDiscovery(
          publication.identityId,
          this.deps.authority,
          this.deps.lifecycle,
        )
      ) {
        continue;
      }
      const identity = this.deps.authority.resolveIdentity(
        publication.identityId,
      );
      if (!identity) continue;
      hits.push({ identity, publication });
    }

    const report = {
      query,
      hitCount: hits.length,
      at: Date.now(),
    };
    this.diagnostics.recordDiscovery(report);
    return { ok: true, hits: Object.freeze(hits), report };
  }

  /**
   * Retrieve a single published asset. Fails if not published or not Available.
   */
  retrieveAsset(identityId: string): RetrieveResult {
    const publication = this.published.get(identityId);
    if (!publication) {
      this.diagnostics.record({
        at: Date.now(),
        action: "retrieve-failed",
        identityId,
        ok: false,
        detail: "not published",
      });
      return { ok: false, error: `not published: ${identityId}` };
    }
    if (
      !isStillAvailableForDiscovery(
        identityId,
        this.deps.authority,
        this.deps.lifecycle,
      )
    ) {
      this.diagnostics.record({
        at: Date.now(),
        action: "retrieve-failed",
        identityId,
        ok: false,
        detail: "published but not Available / not in registry",
      });
      return {
        ok: false,
        error: `published but not Available for discovery: ${identityId}`,
      };
    }
    const identity = this.deps.authority.resolveIdentity(identityId);
    if (!identity) {
      throw new RepositoryInvariantError(
        "repository-never-bypasses-authoritative-registry",
        `identity disappeared from registry: ${identityId}`,
      );
    }
    this.diagnostics.record({
      at: Date.now(),
      action: "retrieve",
      identityId,
      ok: true,
    });
    return { ok: true, identity, publication };
  }

  /** Preview eligibility without publishing. */
  checkEligibility(identityId: string) {
    return evaluatePublicationEligibility(
      identityId,
      this.deps.authority,
      this.deps.lifecycle,
      this.deps.validationEngine,
    );
  }

  isPublished(identityId: string): boolean {
    return this.published.has(identityId);
  }

  listPublished(entityClass?: DataEntityClass): readonly PublicationRecord[] {
    const all = [...this.published.values()];
    const filtered = entityClass
      ? all.filter((p) => p.entityClass === entityClass)
      : all;
    return Object.freeze(filtered);
  }
}
