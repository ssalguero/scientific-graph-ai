/**
 * Transformation Engine — Processing Layer runtime (DATA-P2 / DATA-I5).
 *
 * Deterministic transformation infrastructure over Authoritative identities.
 * Always creates a Derived entity; never mutates source identity in place.
 * Integrates Lifecycle (DATA-I3) and Metadata & Lineage (DATA-I4).
 * No repository / publication / discovery / discipline-specific science.
 *
 * @packageDocumentation
 */

import { completeDerivation } from "../../internal/lifecycle/derived";
import {
  TransitionRequester,
  type TransitionRequester as TransitionRequesterId,
} from "../../internal/lifecycle/authority";
import type { LifecycleTracker } from "../../internal/lifecycle/lifecycle-tracker";
import { LifecycleState } from "../../internal/lifecycle/states";
import type { RegistryAuthority } from "../../internal/registry/authority";
import { DataEntityClass } from "../../internal/registry/roles";
import type { DatasetManager } from "../../repository/dataset-manager/DatasetManager";
import type { ScientificModelManager } from "../../model/scientific-model-manager/ScientificModelManager";
import type { MetadataManager } from "../../metadata/MetadataManager";
import { executeDeterministic } from "./deterministic";
import { TransformationDiagnostics } from "./diagnostics";
import { TransformationInvariantError } from "./invariants";
import {
  isTransformationKind,
  type TransformationReport,
  type TransformationRequest,
  type TransformationResult,
} from "./model";

let transformationSeq = 0;

function mintTransformationId(): string {
  transformationSeq += 1;
  return `xform-${transformationSeq}`;
}

export interface TransformationEngineDeps {
  readonly authority: RegistryAuthority;
  readonly datasetManager: DatasetManager;
  readonly scientificModelManager: ScientificModelManager;
  readonly lifecycle: LifecycleTracker;
  readonly metadataManager: MetadataManager;
}

export class TransformationEngine {
  readonly diagnostics = new TransformationDiagnostics();

  constructor(private readonly deps: TransformationEngineDeps) {}

  /**
   * Execute an explicit transformation request.
   * Pipeline: validate → Available→Transformed → deterministic exec →
   * mint derived → lifecycle derivation → metadata/lineage propagation →
   * parent preserved.
   */
  execute(request: TransformationRequest): TransformationResult {
    const sourceIdentityId = request.sourceIdentityId;
    try {
      this.assertExplicitRequest(request);

      const source = this.deps.authority.resolveIdentity(sourceIdentityId);
      if (!source) {
        throw new TransformationInvariantError(
          "never-modify-source-authoritative-identity",
          `source identity not found in Authoritative Registry: ${sourceIdentityId}`,
        );
      }

      const life = this.deps.lifecycle.findByIdentity(sourceIdentityId);
      if (!life) {
        throw new Error(
          `Transformation: source ${sourceIdentityId} has no lifecycle record`,
        );
      }
      if (life.state !== LifecycleState.Available) {
        throw new TransformationInvariantError(
          "no-silent-mutation-of-Available",
          `source must be Available before transform (got ${life.state}); no implicit/silent path`,
        );
      }

      const toTransformed = this.deps.lifecycle.requestTransition(
        sourceIdentityId,
        {
          requester: request.requester,
          to: LifecycleState.Transformed,
          note: request.note ?? `transform:${request.kind}`,
        },
      );
      if (!toTransformed.ok) {
        throw new Error(toTransformed.error ?? "failed Available→Transformed");
      }

      const descriptor = executeDeterministic(request);

      const derivedIdentity = this.mintDerivedSameClass(source.entityClass);
      if (derivedIdentity.id === sourceIdentityId) {
        throw new TransformationInvariantError(
          "always-create-new-derived-entity",
          "derived identity collided with source",
        );
      }

      const derivation = completeDerivation(
        this.deps.lifecycle,
        sourceIdentityId,
        () => derivedIdentity,
        TransitionRequester.DATA,
        LifecycleState.Available,
      );
      if (!derivation.ok || !derivation.derivedIdentity) {
        // Restore parent if stuck in Transformed
        this.deps.lifecycle.requestTransition(sourceIdentityId, {
          requester: TransitionRequester.DATA,
          to: LifecycleState.Available,
          note: "transform-failed-restore-parent",
        });
        throw new Error(derivation.error ?? "derivation failed");
      }

      const metadataPropagated = this.propagateMetadataAndLineage(
        sourceIdentityId,
        derivation.derivedIdentity.id,
        request.kind,
        descriptor.resultFingerprint,
      );

      const report: TransformationReport = {
        transformationId: mintTransformationId(),
        sourceIdentityId,
        derivedIdentityId: derivation.derivedIdentity.id,
        kind: request.kind,
        descriptor,
        parentLifecycleAfter:
          this.deps.lifecycle.getState(sourceIdentityId) ?? "unknown",
        derivedLifecycleState:
          this.deps.lifecycle.getState(derivation.derivedIdentity.id) ??
          "unknown",
        metadataPropagated,
        at: Date.now(),
      };
      this.diagnostics.recordReport(report);

      return {
        ok: true,
        sourceIdentityId,
        derivedIdentityId: derivation.derivedIdentity.id,
        report,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.diagnostics.record({
        at: Date.now(),
        sourceIdentityId,
        kind: isTransformationKind(String(request.kind))
          ? request.kind
          : undefined,
        action: "transformation-failed",
        ok: false,
        detail: message,
      });
      return { ok: false, sourceIdentityId, error: message };
    }
  }

  private assertExplicitRequest(request: TransformationRequest): void {
    if (!request || !request.sourceIdentityId) {
      throw new TransformationInvariantError(
        "no-implicit-transformations",
        "transformation requires an explicit request with sourceIdentityId",
      );
    }
    if (!isTransformationKind(request.kind)) {
      throw new TransformationInvariantError(
        "no-implicit-transformations",
        `unknown transformation kind: ${String(request.kind)}`,
      );
    }
    const requester = request.requester as TransitionRequesterId;
    if (
      requester === TransitionRequester.Infrastructure ||
      requester === TransitionRequester.Consumer
    ) {
      throw new TransformationInvariantError(
        "no-implicit-transformations",
        `requester ${requester} cannot authorize transformations`,
      );
    }
  }

  private mintDerivedSameClass(
    entityClass: string,
  ): ReturnType<DatasetManager["registerDataset"]> {
    if (entityClass === DataEntityClass.Dataset) {
      return this.deps.datasetManager.registerDataset();
    }
    if (entityClass === DataEntityClass.ScientificModelEntity) {
      return this.deps.scientificModelManager.registerModelEntity();
    }
    throw new Error(
      `Transformation: unsupported entity class for derivation: ${entityClass}`,
    );
  }

  /**
   * Propagate metadata context to derived entity and record lineage.
   * Provenance/ownership of Authoritative registries unchanged.
   */
  private propagateMetadataAndLineage(
    sourceIdentityId: string,
    derivedIdentityId: string,
    kind: string,
    resultFingerprint: string,
  ): boolean {
    const sourceMeta =
      this.deps.metadataManager.getMetadataForIdentity(sourceIdentityId);

    const derivedMeta = this.deps.metadataManager.attachMetadata(
      derivedIdentityId,
    );

    if (sourceMeta) {
      this.deps.metadataManager.updateProvenance(derivedMeta.associationId, {
        ...sourceMeta.provenance,
        sourceLabel:
          sourceMeta.provenance.sourceLabel ??
          `derived-from:${sourceIdentityId}`,
      });
      this.deps.metadataManager.updateContext(
        derivedMeta.associationId,
        { ...sourceMeta.context },
      );
      this.deps.metadataManager.updateQuality(
        derivedMeta.associationId,
        {
          indicators: [...sourceMeta.quality.indicators],
          notes: sourceMeta.quality.notes,
        },
      );
    }

    this.deps.metadataManager.addLineageLink(
      derivedMeta.associationId,
      sourceIdentityId,
      "derived-from",
    );
    this.deps.metadataManager.appendProcessingHistory(
      derivedMeta.associationId,
      `${kind}:${resultFingerprint}`,
    );

    // Also append history on source metadata if present (traceability).
    if (sourceMeta) {
      this.deps.metadataManager.appendProcessingHistory(
        sourceMeta.associationId,
        `spawned-derived:${derivedIdentityId}:${kind}`,
      );
    }

    this.deps.metadataManager.validateStructure(derivedMeta.associationId);
    return true;
  }
}
