/**
 * Metadata Manager — Supporting Registry + Metadata & Lineage runtime (DATA-I4).
 *
 * Owns supporting metadata/lineage associations bound to Authoritative identities.
 * Never mints entity identity. Never replaces Authoritative Registry.
 * No transformation algorithms. No repository/publication behavior.
 *
 * @packageDocumentation
 */

import type { RegistryAuthority } from "../internal/registry/authority";
import { assertMetadataMayBind } from "../internal/registry/interaction";
import {
  SupportingRegistry,
  type SupportingAssociation,
} from "../internal/registry/supporting-registry";
import { MetadataDiagnostics } from "./diagnostics";
import { MetadataInvariantError } from "./invariants";
import {
  emptyContext,
  emptyLineage,
  emptyProvenance,
  emptyQuality,
  MetadataRecordState,
  type LineageLink,
  type LineageRecord,
  type LineageRelationship,
  type MetadataRecord,
  type ProvenanceRecord,
  type QualityDescriptors,
  type ScientificContext,
} from "./model";
import {
  assertMetadataStructure,
  validateMetadataStructure,
  type StructuralValidationResult,
} from "./structural-validation";

export class MetadataManager {
  readonly supporting: SupportingRegistry;
  readonly diagnostics = new MetadataDiagnostics();
  private readonly records = new Map<string, MetadataRecord>();
  private readonly byIdentity = new Map<string, string>();

  constructor(private readonly authority: RegistryAuthority) {
    this.supporting = new SupportingRegistry(
      "MetadataSupporting",
      (id) => {
        const identity = authority.resolveIdentity(id);
        if (identity) {
          assertMetadataMayBind(identity);
        }
        return identity;
      },
    );
  }

  /**
   * Bind a supporting association (I2 wiring) without metadata payload.
   * Prefer `attachMetadata` for full DATA-I4 records.
   */
  bindAssociation(
    authoritativeId: string,
    associationId?: string,
  ): SupportingAssociation {
    return this.supporting.bind(authoritativeId, associationId);
  }

  getAssociation(associationId: string): SupportingAssociation | undefined {
    return this.supporting.get(associationId);
  }

  listAssociationsFor(
    authoritativeId: string,
  ): readonly SupportingAssociation[] {
    return this.supporting.listFor(authoritativeId);
  }

  /**
   * Attach metadata to an existing authoritative identity.
   * Creates Supporting association + Draft→Attached metadata record.
   */
  attachMetadata(
    authoritativeId: string,
    associationId?: string,
  ): MetadataRecord {
    if (!this.authority.resolveIdentity(authoritativeId)) {
      throw new MetadataInvariantError(
        "metadata-accompanies-entity",
        `cannot attach metadata — authoritative identity not found: ${authoritativeId}`,
      );
    }
    if (this.byIdentity.has(authoritativeId)) {
      throw new MetadataInvariantError(
        "metadata-accompanies-entity",
        `metadata already attached for identity ${authoritativeId}`,
      );
    }

    const association = this.supporting.bind(authoritativeId, associationId);
    const record: MetadataRecord = {
      associationId: association.associationId,
      authoritativeIdentityId: authoritativeId,
      state: MetadataRecordState.Attached,
      provenance: emptyProvenance(),
      lineage: emptyLineage(),
      quality: emptyQuality(),
      context: emptyContext(),
    };
    this.records.set(record.associationId, record);
    this.byIdentity.set(authoritativeId, record.associationId);
    this.diagnostics.record({
      at: Date.now(),
      associationId: record.associationId,
      authoritativeIdentityId: authoritativeId,
      action: "attachMetadata",
      ok: true,
    });
    return record;
  }

  getMetadata(associationId: string): MetadataRecord | undefined {
    return this.records.get(associationId);
  }

  getMetadataForIdentity(
    authoritativeId: string,
  ): MetadataRecord | undefined {
    const associationId = this.byIdentity.get(authoritativeId);
    return associationId ? this.records.get(associationId) : undefined;
  }

  updateProvenance(
    associationId: string,
    provenance: ProvenanceRecord,
  ): MetadataRecord {
    const record = this.requireRecord(associationId);
    this.assertNotRetired(record);
    // Provenance never modifies ownership — descriptive fields only.
    record.provenance = { ...provenance };
    this.bumpToAttached(record);
    this.diag(record, "updateProvenance", true);
    return record;
  }

  updateQuality(
    associationId: string,
    quality: QualityDescriptors,
  ): MetadataRecord {
    const record = this.requireRecord(associationId);
    this.assertNotRetired(record);
    record.quality = {
      indicators: Object.freeze([...(quality.indicators ?? [])]),
      notes: quality.notes,
    };
    this.bumpToAttached(record);
    this.diag(record, "updateQuality", true);
    return record;
  }

  updateContext(
    associationId: string,
    context: ScientificContext,
  ): MetadataRecord {
    const record = this.requireRecord(associationId);
    this.assertNotRetired(record);
    record.context = {
      units: context.units,
      definitions: context.definitions,
      notes: context.notes,
      extras: context.extras
        ? Object.freeze({ ...context.extras })
        : undefined,
    };
    this.bumpToAttached(record);
    this.diag(record, "updateContext", true);
    return record;
  }

  /**
   * Replace lineage record (links + opaque processing history labels).
   * Parent identities must exist in Authoritative Registries.
   */
  updateLineage(
    associationId: string,
    lineage: LineageRecord,
  ): MetadataRecord {
    const record = this.requireRecord(associationId);
    this.assertNotRetired(record);
    this.assertLineagePreservesParents(record, lineage.links);
    record.lineage = {
      links: Object.freeze(lineage.links.map((l) => ({ ...l }))),
      processingHistory: Object.freeze([...(lineage.processingHistory ?? [])]),
    };
    this.bumpToAttached(record);
    this.diag(record, "updateLineage", true);
    return record;
  }

  /**
   * Append a lineage link to a parent authoritative identity.
   * Derived entities preserve parent identity — never replace it.
   */
  addLineageLink(
    associationId: string,
    parentIdentityId: string,
    relationship: LineageRelationship = "derived-from",
  ): MetadataRecord {
    const record = this.requireRecord(associationId);
    this.assertNotRetired(record);
    const link: LineageLink = { parentIdentityId, relationship };
    this.assertLineagePreservesParents(record, [link]);
    record.lineage = {
      links: Object.freeze([...record.lineage.links, link]),
      processingHistory: record.lineage.processingHistory,
    };
    this.bumpToAttached(record);
    this.diag(record, "addLineageLink", true, parentIdentityId);
    return record;
  }

  appendProcessingHistory(
    associationId: string,
    stepLabel: string,
  ): MetadataRecord {
    const record = this.requireRecord(associationId);
    this.assertNotRetired(record);
    record.lineage = {
      links: record.lineage.links,
      processingHistory: Object.freeze([
        ...record.lineage.processingHistory,
        stepLabel,
      ]),
    };
    this.bumpToAttached(record);
    this.diag(record, "appendProcessingHistory", true, stepLabel);
    return record;
  }

  /**
   * Structural validation only — not scientific correctness.
   * On success → StructurallyValid.
   */
  validateStructure(associationId: string): StructuralValidationResult {
    const record = this.requireRecord(associationId);
    const result = validateMetadataStructure(record, this.authority);
    if (result.ok) {
      record.state = MetadataRecordState.StructurallyValid;
      this.diag(record, "validateStructure", true);
    } else {
      this.diag(record, "validateStructure", false, result.errors.join("; "));
    }
    return result;
  }

  /** Assert structural validity (throws on failure). */
  assertStructure(associationId: string): void {
    const record = this.requireRecord(associationId);
    assertMetadataStructure(record, this.authority);
    record.state = MetadataRecordState.StructurallyValid;
  }

  retireMetadata(associationId: string): MetadataRecord {
    const record = this.requireRecord(associationId);
    record.state = MetadataRecordState.Retired;
    this.diag(record, "retireMetadata", true);
    return record;
  }

  private requireRecord(associationId: string): MetadataRecord {
    const record = this.records.get(associationId);
    if (!record) {
      throw new Error(`MetadataManager: unknown association ${associationId}`);
    }
    return record;
  }

  private assertNotRetired(record: MetadataRecord): void {
    if (record.state === MetadataRecordState.Retired) {
      throw new MetadataInvariantError(
        "metadata-accompanies-entity",
        `metadata association ${record.associationId} is Retired`,
      );
    }
  }

  private bumpToAttached(record: MetadataRecord): void {
    if (record.state === MetadataRecordState.StructurallyValid) {
      // Field changes require re-validation.
      record.state = MetadataRecordState.Attached;
    }
  }

  private assertLineagePreservesParents(
    record: MetadataRecord,
    links: readonly LineageLink[],
  ): void {
    for (const link of links) {
      if (link.parentIdentityId === record.authoritativeIdentityId) {
        throw new MetadataInvariantError(
          "lineage-preserves-parent-identity",
          "lineage must not treat the entity as its own parent",
        );
      }
      if (!this.authority.resolveIdentity(link.parentIdentityId)) {
        throw new MetadataInvariantError(
          "lineage-preserves-parent-identity",
          `parent identity not in Authoritative Registry: ${link.parentIdentityId}`,
        );
      }
    }
  }

  private diag(
    record: MetadataRecord,
    action: string,
    ok: boolean,
    detail?: string,
  ): void {
    this.diagnostics.record({
      at: Date.now(),
      associationId: record.associationId,
      authoritativeIdentityId: record.authoritativeIdentityId,
      action,
      ok,
      detail,
    });
  }
}
