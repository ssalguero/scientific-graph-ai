/**
 * DATA Domain — Public API factory (DATA-I7).
 *
 * Binds frozen Capability Group contracts to the composed domain kernel.
 * Does not invent capabilities. Does not export managers/registries.
 *
 * @packageDocumentation
 */

import type { DataDomainComposition } from "../internal/compose-domain";
import { TransitionRequester } from "../internal/lifecycle/authority";
import { LifecycleState } from "../internal/lifecycle/states";
import { TransformationKind } from "../processing/transformation-engine/model";
import { isTransformationKind } from "../processing/transformation-engine/model";
import type { DataPublicApi } from "../public/types";
import type { DataRequest, DataResult } from "../contracts/results";
import { DataEntityClass } from "../internal/registry/roles";
import type { IntegrationDiagnostics } from "./diagnostics";

function ok(result?: unknown): DataResult {
  return { ok: true, result };
}

function fail(message: string, code?: string): DataResult {
  return { ok: false, error: { code, message } };
}

function payloadOf(request?: DataRequest): Record<string, unknown> {
  const p = request?.payload;
  if (p != null && typeof p === "object" && !Array.isArray(p)) {
    return p as Record<string, unknown>;
  }
  return {};
}

function asId(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function createDataPublicApi(
  domain: DataDomainComposition,
  diagnostics: IntegrationDiagnostics,
): DataPublicApi {
  const trace = (group: string, action: string, result: DataResult) => {
    diagnostics.record({
      at: Date.now(),
      action: `${group}.${action}`,
      capabilityGroup: group,
      ok: result.ok,
      detail: result.error?.message,
    });
  };

  const dataset = {
    async createDataset(request?: DataRequest): Promise<DataResult> {
      try {
        const payload = payloadOf(request);
        const id = asId(payload.id);
        const identity = domain.datasetManager.registerDataset(id);
        domain.lifecycle.attachRegistered(
          identity.id,
          TransitionRequester.ENGINE,
        );
        const result = ok({ identityId: identity.id, entityClass: identity.entityClass });
        trace("Dataset", "createDataset", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Dataset", "createDataset", result);
        return result;
      }
    },

    async loadDataset(request?: DataRequest): Promise<DataResult> {
      try {
        const id = asId(payloadOf(request).id);
        if (!id) return fail("loadDataset requires payload.id", "INVALID_PAYLOAD");
        const retrieved = domain.repositoryServices.retrieveAsset(id);
        if (retrieved.ok) {
          const result = ok({
            identityId: retrieved.identity!.id,
            publication: retrieved.publication,
          });
          trace("Dataset", "loadDataset", result);
          return result;
        }
        const identity = domain.datasetManager.getDataset(id);
        if (!identity) {
          const result = fail(`dataset not found: ${id}`, "NOT_FOUND");
          trace("Dataset", "loadDataset", result);
          return result;
        }
        const result = ok({ identityId: identity.id, published: false });
        trace("Dataset", "loadDataset", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Dataset", "loadDataset", result);
        return result;
      }
    },

    async updateDataset(request?: DataRequest): Promise<DataResult> {
      try {
        const id = asId(payloadOf(request).id);
        if (!id) return fail("updateDataset requires payload.id", "INVALID_PAYLOAD");
        if (!domain.datasetManager.hasDataset(id)) {
          return fail(`dataset not found: ${id}`, "NOT_FOUND");
        }
        const state = domain.lifecycle.getState(id);
        if (state === LifecycleState.Available) {
          const t = domain.lifecycle.requestTransition(id, {
            requester: TransitionRequester.ENGINE,
            to: LifecycleState.Described,
            withdrawAndRedescribe: true,
            note: "updateDataset",
          });
          if (!t.ok) return fail(t.error ?? "update failed");
        } else if (
          state === LifecycleState.Validated ||
          state === LifecycleState.Described ||
          state === LifecycleState.Registered
        ) {
          const t = domain.lifecycle.requestTransition(id, {
            requester: TransitionRequester.ENGINE,
            to: LifecycleState.Described,
            note: "updateDataset",
          });
          if (!t.ok && state !== LifecycleState.Described) {
            return fail(t.error ?? "update failed");
          }
        }
        const result = ok({ identityId: id, state: domain.lifecycle.getState(id) });
        trace("Dataset", "updateDataset", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Dataset", "updateDataset", result);
        return result;
      }
    },

    async validateDataset(request?: DataRequest): Promise<DataResult> {
      try {
        const id = asId(payloadOf(request).id);
        if (!id) return fail("validateDataset requires payload.id", "INVALID_PAYLOAD");
        const state = domain.lifecycle.getState(id);
        if (state === LifecycleState.Registered) {
          const d = domain.lifecycle.requestTransition(id, {
            requester: TransitionRequester.ENGINE,
            to: LifecycleState.Described,
          });
          if (!d.ok) return fail(d.error ?? "describe failed");
        }
        const passed = payloadOf(request).passed !== false;
        const t = domain.lifecycle.applyValidationGate(
          id,
          Boolean(passed),
          TransitionRequester.ENGINE,
        );
        const result = t.ok
          ? ok({ identityId: id, state: t.record.state })
          : fail(t.error ?? "validation failed", "VALIDATION_FAILED");
        trace("Dataset", "validateDataset", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Dataset", "validateDataset", result);
        return result;
      }
    },

    async removeDataset(request?: DataRequest): Promise<DataResult> {
      try {
        const id = asId(payloadOf(request).id);
        if (!id) return fail("removeDataset requires payload.id", "INVALID_PAYLOAD");
        if (!domain.datasetManager.hasDataset(id)) {
          return fail(`dataset not found: ${id}`, "NOT_FOUND");
        }
        if (domain.repositoryServices.isPublished(id)) {
          domain.repositoryServices.unpublishAsset(id);
        }
        const t = domain.lifecycle.requestTransition(id, {
          requester: TransitionRequester.ENGINE,
          to: LifecycleState.Retired,
          note: "removeDataset",
        });
        const result = t.ok
          ? ok({ identityId: id, state: LifecycleState.Retired })
          : fail(t.error ?? "retire failed");
        trace("Dataset", "removeDataset", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Dataset", "removeDataset", result);
        return result;
      }
    },
  };

  const scientificModel = {
    async createScientificModel(request?: DataRequest): Promise<DataResult> {
      try {
        const id = asId(payloadOf(request).id);
        const identity = domain.scientificModelManager.registerModelEntity(id);
        domain.lifecycle.attachRegistered(
          identity.id,
          TransitionRequester.ENGINE,
        );
        const result = ok({ identityId: identity.id });
        trace("ScientificModel", "createScientificModel", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("ScientificModel", "createScientificModel", result);
        return result;
      }
    },
    async readScientificModel(request?: DataRequest): Promise<DataResult> {
      const id = asId(payloadOf(request).id);
      if (!id) return fail("readScientificModel requires payload.id");
      const identity = domain.scientificModelManager.getModelEntity(id);
      const result = identity
        ? ok({ identityId: identity.id })
        : fail(`not found: ${id}`, "NOT_FOUND");
      trace("ScientificModel", "readScientificModel", result);
      return result;
    },
    async updateScientificModel(request?: DataRequest): Promise<DataResult> {
      try {
        const id = asId(payloadOf(request).id);
        if (!id) return fail("updateScientificModel requires payload.id");
        if (!domain.scientificModelManager.hasModelEntity(id)) {
          return fail(`model not found: ${id}`, "NOT_FOUND");
        }
        const state = domain.lifecycle.getState(id);
        if (state === LifecycleState.Available) {
          const t = domain.lifecycle.requestTransition(id, {
            requester: TransitionRequester.ENGINE,
            to: LifecycleState.Described,
            withdrawAndRedescribe: true,
            note: "updateScientificModel",
          });
          if (!t.ok) return fail(t.error ?? "update failed");
        }
        const result = ok({ identityId: id, state: domain.lifecycle.getState(id) });
        trace("ScientificModel", "updateScientificModel", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("ScientificModel", "updateScientificModel", result);
        return result;
      }
    },
    async removeScientificModel(request?: DataRequest): Promise<DataResult> {
      const id = asId(payloadOf(request).id);
      if (!id) return fail("removeScientificModel requires payload.id");
      const t = domain.lifecycle.requestTransition(id, {
        requester: TransitionRequester.ENGINE,
        to: LifecycleState.Retired,
      });
      const result = t.ok ? ok({ identityId: id }) : fail(t.error ?? "retire failed");
      trace("ScientificModel", "removeScientificModel", result);
      return result;
    },
    async validateScientificModel(request?: DataRequest): Promise<DataResult> {
      return dataset.validateDataset(request);
    },
  };

  const transformation = {
    async normalize(request?: DataRequest): Promise<DataResult> {
      return runTransform(domain, diagnostics, TransformationKind.normalize, request);
    },
    async filter(request?: DataRequest): Promise<DataResult> {
      return runTransform(domain, diagnostics, TransformationKind.filter, request);
    },
    async aggregate(request?: DataRequest): Promise<DataResult> {
      return runTransform(domain, diagnostics, TransformationKind.aggregate, request);
    },
    async interpolate(request?: DataRequest): Promise<DataResult> {
      return runTransform(domain, diagnostics, TransformationKind.interpolate, request);
    },
    async transform(request?: DataRequest): Promise<DataResult> {
      const kindRaw = payloadOf(request).kind;
      const kind =
        typeof kindRaw === "string" && isTransformationKind(kindRaw)
          ? kindRaw
          : TransformationKind.transform;
      return runTransform(domain, diagnostics, kind, request);
    },
  };

  const validation = {
    async validate(request?: DataRequest): Promise<DataResult> {
      return dataset.validateDataset(request);
    },
  };

  const metadata = {
    async readMetadata(request?: DataRequest): Promise<DataResult> {
      const id = asId(payloadOf(request).id);
      if (!id) return fail("readMetadata requires payload.id");
      const record = domain.metadataManager.getMetadataForIdentity(id);
      const result = record
        ? ok(record)
        : fail(`metadata not found for ${id}`, "NOT_FOUND");
      trace("Metadata", "readMetadata", result);
      return result;
    },
    async updateMetadata(request?: DataRequest): Promise<DataResult> {
      try {
        const payload = payloadOf(request);
        const id = asId(payload.id);
        if (!id) return fail("updateMetadata requires payload.id");
        let record = domain.metadataManager.getMetadataForIdentity(id);
        if (!record) {
          record = domain.metadataManager.attachMetadata(id);
        }
        if (payload.provenance && typeof payload.provenance === "object") {
          domain.metadataManager.updateProvenance(
            record.associationId,
            payload.provenance as Record<string, string>,
          );
        }
        if (payload.context && typeof payload.context === "object") {
          domain.metadataManager.updateContext(
            record.associationId,
            payload.context as Record<string, string>,
          );
        }
        if (payload.quality && typeof payload.quality === "object") {
          const q = payload.quality as {
            indicators?: string[];
            notes?: string;
          };
          domain.metadataManager.updateQuality(record.associationId, {
            indicators: q.indicators ?? [],
            notes: q.notes,
          });
        }
        const result = ok(
          domain.metadataManager.getMetadata(record.associationId),
        );
        trace("Metadata", "updateMetadata", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Metadata", "updateMetadata", result);
        return result;
      }
    },
    async validateMetadata(request?: DataRequest): Promise<DataResult> {
      const id = asId(payloadOf(request).id);
      if (!id) return fail("validateMetadata requires payload.id");
      const record = domain.metadataManager.getMetadataForIdentity(id);
      if (!record) return fail(`metadata not found for ${id}`, "NOT_FOUND");
      const v = domain.metadataManager.validateStructure(record.associationId);
      const result = v.ok
        ? ok({ associationId: record.associationId, state: "StructurallyValid" })
        : fail(v.errors.join("; "), "STRUCTURAL_INVALID");
      trace("Metadata", "validateMetadata", result);
      return result;
    },
    async trackLineage(request?: DataRequest): Promise<DataResult> {
      try {
        const payload = payloadOf(request);
        const id = asId(payload.id);
        const parentId = asId(payload.parentId);
        if (!id || !parentId) {
          return fail("trackLineage requires payload.id and payload.parentId");
        }
        let record = domain.metadataManager.getMetadataForIdentity(id);
        if (!record) {
          record = domain.metadataManager.attachMetadata(id);
        }
        domain.metadataManager.addLineageLink(
          record.associationId,
          parentId,
          "derived-from",
        );
        const result = ok(
          domain.metadataManager.getMetadata(record.associationId)?.lineage,
        );
        trace("Metadata", "trackLineage", result);
        return result;
      } catch (e) {
        const result = fail(e instanceof Error ? e.message : String(e));
        trace("Metadata", "trackLineage", result);
        return result;
      }
    },
  };

  const repository = {
    async discoverAssets(request?: DataRequest): Promise<DataResult> {
      const payload = payloadOf(request);
      const entityClassRaw = asId(payload.entityClass);
      const entityClass =
        entityClassRaw === DataEntityClass.Dataset ||
        entityClassRaw === DataEntityClass.ScientificModelEntity
          ? entityClassRaw
          : undefined;
      const discovered = domain.repositoryServices.discoverAssets({
        identityId: asId(payload.id),
        entityClass,
      });
      const result = ok({
        hits: discovered.hits.map((h) => ({
          identityId: h.identity.id,
          entityClass: h.identity.entityClass,
          publishedAt: h.publication.publishedAt,
        })),
        hitCount: discovered.report.hitCount,
      });
      trace("Repository", "discoverAssets", result);
      return result;
    },
    async retrieveAsset(request?: DataRequest): Promise<DataResult> {
      const id = asId(payloadOf(request).id);
      if (!id) return fail("retrieveAsset requires payload.id");
      const retrieved = domain.repositoryServices.retrieveAsset(id);
      const result = retrieved.ok
        ? ok({
            identityId: retrieved.identity!.id,
            publication: retrieved.publication,
          })
        : fail(retrieved.error ?? "retrieve failed", "NOT_AVAILABLE");
      trace("Repository", "retrieveAsset", result);
      return result;
    },
    async publishAsset(request?: DataRequest): Promise<DataResult> {
      const id = asId(payloadOf(request).id);
      if (!id) return fail("publishAsset requires payload.id");
      // Ensure Available before publication eligibility (Integration coordinates;
      // does not invent lifecycle semantics — uses public Dataset validate/publish path).
      const state = domain.lifecycle.getState(id);
      if (state === LifecycleState.Validated) {
        const t = domain.lifecycle.requestTransition(id, {
          requester: TransitionRequester.ENGINE,
          to: LifecycleState.Available,
          note: "publishAsset",
        });
        if (!t.ok) {
          const result = fail(t.error ?? "cannot become Available");
          trace("Repository", "publishAsset", result);
          return result;
        }
      }
      const published = domain.repositoryServices.publishAsset(id);
      const result = published.ok
        ? ok(published.publication)
        : fail(published.error ?? "publish failed");
      trace("Repository", "publishAsset", result);
      return result;
    },
  };

  return {
    dataset,
    scientificModel,
    transformation,
    validation,
    metadata,
    repository,
  };
}

async function runTransform(
  domain: DataDomainComposition,
  diagnostics: IntegrationDiagnostics,
  kind: (typeof TransformationKind)[keyof typeof TransformationKind],
  request?: DataRequest,
): Promise<DataResult> {
  try {
    const payload = payloadOf(request);
    const sourceIdentityId = asId(payload.id) ?? asId(payload.sourceIdentityId);
    if (!sourceIdentityId) {
      return fail("transformation requires payload.id (source identity)");
    }
    const parameters =
      payload.parameters != null && typeof payload.parameters === "object"
        ? (payload.parameters as Record<string, unknown>)
        : undefined;
    const executed = domain.transformationEngine.execute({
      sourceIdentityId,
      kind,
      parameters,
      requester: TransitionRequester.ENGINE,
    });
    const result = executed.ok
      ? ok({
          sourceIdentityId: executed.sourceIdentityId,
          derivedIdentityId: executed.derivedIdentityId,
          report: executed.report,
        })
      : fail(executed.error ?? "transform failed");
    diagnostics.record({
      at: Date.now(),
      action: `Transformation.${kind}`,
      capabilityGroup: "Transformation",
      ok: result.ok,
      detail: result.error?.message,
    });
    return result;
  } catch (e) {
    const result = fail(e instanceof Error ? e.message : String(e));
    diagnostics.record({
      at: Date.now(),
      action: `Transformation.${kind}`,
      capabilityGroup: "Transformation",
      ok: false,
      detail: result.error?.message,
    });
    return result;
  }
}
