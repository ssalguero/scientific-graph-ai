import { createCitableScientificSnapshot } from "../../contracts/citable-snapshot";
import { composeScientificProvenance } from "../../contracts/provenance";
import { createScientificSemanticValue } from "../../contracts/semantic-values";
import {
  isGeneratedTextReviewRecord,
  type GeneratedTextReviewRecord,
  type GeneratedTextReviewTransition,
} from "../../contracts/generated-text-review";
import type { AssertCase } from "../../comparison/__tests__/run-assertions";
import {
  approveGeneratedTextReview,
  applyGeneratedTextValidityAssessment,
  assessGeneratedTextReviewValidity,
  createLiveGeneratedTextReview,
  createSnapshotGeneratedTextReview,
  invalidateGeneratedTextForContentChange,
  markGeneratedTextResearcherReviewed,
  refreshGeneratedTextForEvidence,
} from "../review-authority";
import {
  guardGeneratedTextExport,
  guardGeneratedTextExportManifest,
} from "../review-export-guard";
import {
  getReviewAuthorityRecordsFromProject,
  REVIEW_AUTHORITY_PROJECT_EXTENSION_KEY,
  reconcileGeneratedTextReviewRecords,
  resolveCurrentGeneratedTextReviewBinding,
  setReviewAuthorityRecordsOnProject,
  serializeReviewAuthorityRecords,
} from "../review-persistence";

const generatedAt = "2026-08-22T10:00:00.000Z";
const reviewedAt = "2026-08-22T10:01:00.000Z";
const approvedAt = "2026-08-22T10:02:00.000Z";
const changedAt = "2026-08-22T10:03:00.000Z";

const researcher = {
  kind: "researcher",
  id: "researcher-1",
  name: "Researcher",
} as const;

const producer = {
  kind: "system",
  id: "scientific-report",
  version: "1",
} as const;

const provenance = (alpha = 0.05) =>
  composeScientificProvenance({
    dataset: {
      id: "dataset-1",
      checksum: "dataset-v1",
    },
    source: {
      kind: "worksheet",
      id: "worksheet-1",
    },
    series: [{ id: "series-1", role: "input" }],
    config: {
      id: "config-1",
      values: { alpha },
    },
    method: {
      id: "t-test",
      label: "T test",
      version: "1",
      parameters: { alpha },
    },
    approximation: {
      kind: "numerical",
      details: "Behavioral fixture.",
    },
    warnings: [],
  });

const snapshot = () =>
  createCitableScientificSnapshot({
    snapshotId: "snapshot-1",
    capturedAt: "2026-08-22T09:00:00.000Z",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticValues: [
      createScientificSemanticValue({
        field: "pValue",
        value: 0.04,
        status: "known",
        authority: "system-factual",
        approximation: "numerical",
        equivalencePolicy: "exact",
      }),
    ],
  });

export const runReviewAuthorityCases = (assertCase: AssertCase): void => {
  const liveEvidence = { pValue: 0.04, significant: true };
  const generated = createLiveGeneratedTextReview({
    recordId: "review-live-1",
    artifactId: "live-result-1",
    producer,
    generatedAt,
    content: "The p-value is 0.04.",
    classification: "factual",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticEvidence: liveEvidence,
  });

  assertCase(
    "pr3a.generated.non-authoritative",
    generated.authority === "generated-non-authoritative" &&
      generated.state === "GENERATED",
  );
  const reviewed = markGeneratedTextResearcherReviewed(generated, {
    reviewer: researcher,
    at: reviewedAt,
  });
  const approved = approveGeneratedTextReview(reviewed, {
    reviewer: researcher,
    at: approvedAt,
  });
  assertCase(
    "pr3a.transitions.explicit",
    generated.state === "GENERATED" &&
      reviewed.state === "RESEARCHER_REVIEWED" &&
      approved.state === "RESEARCHER_APPROVED" &&
      approved.transitions.length === 3,
  );
  assertCase(
    "pr3a.transitions.immutable-history",
    Object.isFrozen(approved) &&
      generated.transitions.length === 1 &&
      reviewed.transitions.length === 2,
  );
  const unchangedExisting = [approved] as const;
  const unchangedReconciliation = reconcileGeneratedTextReviewRecords(
    unchangedExisting,
    [generated],
    changedAt
  );
  assertCase(
    "pr3a.reconcile.unchanged-approval-preserved",
    unchangedReconciliation === unchangedExisting &&
      unchangedReconciliation.length === 1 &&
      resolveCurrentGeneratedTextReviewBinding(
        generated,
        unchangedReconciliation
      )?.state === "RESEARCHER_APPROVED"
  );
  assertCase(
    "pr3a.correction.provenance.same-binding-preserves-review",
    resolveCurrentGeneratedTextReviewBinding(
      createLiveGeneratedTextReview({
        recordId: "review-live-same-provenance",
        artifactId: "live-result-1",
        producer,
        generatedAt,
        content: generated.content,
        classification: generated.classification,
        resultContractId: "inference.parametric",
        provenance: provenance(),
        semanticEvidence: liveEvidence,
      }),
      unchangedReconciliation
    )?.state === "RESEARCHER_APPROVED"
  );
  const changedProvenanceDraft = createLiveGeneratedTextReview({
    recordId: "review-live-changed-provenance",
    artifactId: "live-result-1",
    producer,
    generatedAt,
    content: generated.content,
    classification: generated.classification,
    resultContractId: "inference.parametric",
    provenance: provenance(0.01),
    semanticEvidence: liveEvidence,
  });
  const changedProvenanceCycle = reconcileGeneratedTextReviewRecords(
    [approved],
    [changedProvenanceDraft],
    changedAt
  );
  const currentChangedProvenance =
    resolveCurrentGeneratedTextReviewBinding(
      changedProvenanceDraft,
      changedProvenanceCycle
    );
  assertCase(
    "pr3a.correction.provenance.change-requires-new-review",
    generated.evidenceIdentity.fingerprint ===
      changedProvenanceDraft.evidenceIdentity.fingerprint &&
      currentChangedProvenance?.state === "GENERATED" &&
      changedProvenanceCycle.some(
        (record) =>
          record.recordId === approved.recordId &&
          record.validity === "STALE"
      )
  );
  assertCase(
    "pr3a.correction.provenance.evidence-equality-cannot-bypass-binding",
    generated.contentIdentity.fingerprint ===
      changedProvenanceDraft.contentIdentity.fingerprint &&
      generated.evidenceIdentity.fingerprint ===
        changedProvenanceDraft.evidenceIdentity.fingerprint &&
      resolveCurrentGeneratedTextReviewBinding(
        changedProvenanceDraft,
        [approved]
      ) === null
  );
  const missingProvenanceDraft = structuredClone(generated) as Partial<
    GeneratedTextReviewRecord
  >;
  delete missingProvenanceDraft.provenance;
  let omittedProvenanceRejected = false;
  try {
    reconcileGeneratedTextReviewRecords(
      [approved],
      [missingProvenanceDraft as GeneratedTextReviewRecord],
      changedAt
    );
  } catch {
    omittedProvenanceRejected = true;
  }
  assertCase(
    "pr3a.correction.provenance.omission-fails-conservatively",
    !isGeneratedTextReviewRecord(missingProvenanceDraft) &&
      omittedProvenanceRejected
  );
  const advisoryDraft = createLiveGeneratedTextReview({
    recordId: "review-live-advisory",
    artifactId: "live-result-1",
    producer,
    generatedAt,
    content: generated.content,
    classification: "advisory",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticEvidence: liveEvidence,
  });
  const reclassifiedCycle = reconcileGeneratedTextReviewRecords(
    [approved],
    [advisoryDraft],
    changedAt
  );
  assertCase(
    "pr3a.reconcile.classification-change-requires-new-approval",
    resolveCurrentGeneratedTextReviewBinding(
      advisoryDraft,
      reclassifiedCycle
    )?.state === "GENERATED" &&
      guardGeneratedTextExport({
        included: true,
        record: resolveCurrentGeneratedTextReviewBinding(
          advisoryDraft,
          reclassifiedCycle
        ),
      }).decision === "BLOCK_RESEARCHER_APPROVAL_REQUIRED"
  );
  const replacementProducerDraft = createLiveGeneratedTextReview({
    recordId: "review-live-new-producer",
    artifactId: "live-result-1",
    producer: { ...producer, id: "replacement-report-generator" },
    generatedAt,
    content: generated.content,
    classification: generated.classification,
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticEvidence: liveEvidence,
  });
  const replacementProducerCycle = reconcileGeneratedTextReviewRecords(
    [approved],
    [replacementProducerDraft],
    changedAt
  );
  assertCase(
    "pr3a.reconcile.producer-change-requires-new-approval",
    resolveCurrentGeneratedTextReviewBinding(
      replacementProducerDraft,
      replacementProducerCycle
    )?.state === "GENERATED"
  );

  const stale = refreshGeneratedTextForEvidence(
    approved,
    { pValue: 0.2, significant: false },
    changedAt,
  );
  assertCase(
    "pr3a.live-evidence.drift-stales",
    stale.validity === "STALE" &&
      stale.state === "RESEARCHER_APPROVED" &&
      approved.validity === "CURRENT",
  );
  assertCase(
    "pr3a.export.stale-approval-rejected",
    guardGeneratedTextExport({ included: true, record: stale }).decision ===
      "BLOCK_NOT_CURRENT"
  );
  let validityReactivationRejected = false;
  try {
    applyGeneratedTextValidityAssessment(
      stale,
      {
        validity: "CURRENT",
        reason: "EVIDENCE_MATCHES",
        message: "Attempted historical reactivation.",
      },
      "2026-08-22T10:04:00.000Z"
    );
  } catch {
    validityReactivationRejected = true;
  }
  assertCase(
    "pr3a.validity.reactivation-rejected",
    validityReactivationRejected
  );
  const forgedReactivation = structuredClone(stale) as Omit<
    GeneratedTextReviewRecord,
    "transitions"
  > & {
    transitions: GeneratedTextReviewTransition[];
  };
  forgedReactivation.transitions.push({
    kind: "VALIDITY_CHANGED",
    at: "2026-08-22T10:04:00.000Z",
    fromState: "RESEARCHER_APPROVED",
    toState: "RESEARCHER_APPROVED",
    fromValidity: "STALE",
    toValidity: "CURRENT",
    reason: "Forged reactivation.",
  });
  forgedReactivation.validity = "CURRENT";
  assertCase(
    "pr3a.validity.forged-reactivation-rejected",
    !isGeneratedTextReviewRecord(forgedReactivation)
  );
  const edited = invalidateGeneratedTextForContentChange(
    approved,
    "The p-value is 0.05.",
    changedAt
  );
  assertCase(
    "pr3a.content-edit.invalidates",
    edited.validity === "INVALID" &&
      edited.state === "RESEARCHER_APPROVED"
  );
  const changedDraft = createLiveGeneratedTextReview({
    recordId: "review-live-changed",
    artifactId: "live-result-1",
    producer,
    generatedAt,
    content: "The p-value is 0.20.",
    classification: "factual",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticEvidence: { pValue: 0.2, significant: false },
  });
  const changedCycle = reconcileGeneratedTextReviewRecords(
    [approved],
    [changedDraft],
    changedAt
  );
  const revertedCycle = reconcileGeneratedTextReviewRecords(
    changedCycle,
    [generated],
    "2026-08-22T10:04:00.000Z"
  );
  const revertedCurrent = resolveCurrentGeneratedTextReviewBinding(
    generated,
    revertedCycle
  );
  assertCase(
    "pr3a.reconcile.reverted-identity-new-review-cycle",
    revertedCurrent?.state === "GENERATED" &&
      revertedCurrent.validity === "CURRENT" &&
      revertedCurrent.recordId !== generated.recordId &&
      revertedCycle.some(
        (record) =>
          record.recordId === approved.recordId &&
          record.validity === "INVALID"
      )
  );
  const invalidContent = invalidateGeneratedTextForContentChange(
    approved,
    "The p-value is 0.20.",
    changedAt,
  );
  assertCase(
    "pr3a.content-change.invalidates-with-history",
    invalidContent.validity === "INVALID" &&
      invalidContent.state === "RESEARCHER_APPROVED" &&
      approved.validity === "CURRENT" &&
      invalidContent.transitions.length === 4,
  );
  assertCase(
    "pr3a.export.factual-with-disclosure",
    guardGeneratedTextExport({ included: true, record: generated })
      .decision === "ALLOW_FACTUAL_WITH_DISCLOSURE",
  );
  assertCase(
    "pr3a.export.inclusion-separate",
    guardGeneratedTextExport({ included: false, record: stale }).allowed &&
      !guardGeneratedTextExport({ included: false, record: stale })
        .shouldExport,
  );

  const captured = snapshot();
  const snapshotReview = approveGeneratedTextReview(
    markGeneratedTextResearcherReviewed(
      createSnapshotGeneratedTextReview({
        recordId: "review-snapshot-1",
        producer,
        generatedAt,
        content: "Interpretation for captured evidence.",
        classification: "interpretive",
        snapshot: captured,
      }),
      { reviewer: researcher, at: reviewedAt },
    ),
    { reviewer: researcher, at: approvedAt },
  );
  const verifiedSnapshotAssessment = assessGeneratedTextReviewValidity({
    record: snapshotReview,
    capturedSnapshot: captured,
  });
  const stillCurrent = applyGeneratedTextValidityAssessment(
    snapshotReview,
    verifiedSnapshotAssessment,
    changedAt
  );
  assertCase(
    "pr3a.snapshot.approval-stable",
    stillCurrent === snapshotReview &&
      verifiedSnapshotAssessment.reason === "SNAPSHOT_STABLE" &&
      stillCurrent.validity === "CURRENT" &&
      stillCurrent.state === "RESEARCHER_APPROVED",
  );
  const missingSnapshotAssessment = assessGeneratedTextReviewValidity({
    record: snapshotReview,
  });
  const unknownSnapshotReview = applyGeneratedTextValidityAssessment(
    snapshotReview,
    missingSnapshotAssessment,
    changedAt
  );
  assertCase(
    "pr3a.correction.snapshot.missing-evidence-not-current",
    missingSnapshotAssessment.validity === "UNKNOWN" &&
      missingSnapshotAssessment.reason === "SNAPSHOT_CONTEXT_UNKNOWN" &&
      unknownSnapshotReview.validity === "UNKNOWN" &&
      guardGeneratedTextExport({
        included: true,
        record: unknownSnapshotReview,
      }).decision === "BLOCK_NOT_CURRENT"
  );
  assertCase(
    "pr3a.correction.snapshot.no-positive-evidence-never-current",
    assessGeneratedTextReviewValidity({
      record: snapshotReview,
      currentSemanticEvidence: captured.semanticValues,
      evidenceAvailable: true,
    }).validity !== "CURRENT"
  );
  assertCase(
    "pr3a.export.non-factual-approved-current",
    guardGeneratedTextExport({
      included: true,
      record: snapshotReview,
    }).decision === "ALLOW_APPROVED_WITH_DISCLOSURE",
  );
  const changedSnapshot = createCitableScientificSnapshot({
    snapshotId: "snapshot-2",
    capturedAt: "2026-08-22T09:30:00.000Z",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticValues: captured.semanticValues,
  });
  assertCase(
    "pr3a.snapshot.identity-change-stales",
    assessGeneratedTextReviewValidity({
      record: snapshotReview,
      capturedSnapshot: changedSnapshot,
    }).validity === "STALE"
  );
  assertCase(
    "pr3a.correction.snapshot.invalid-evidence-invalidates",
    assessGeneratedTextReviewValidity({
      record: snapshotReview,
      capturedSnapshot: { schema: "malformed" },
    }).validity === "INVALID"
  );

  let directApprovalRejected = false;
  try {
    approveGeneratedTextReview(generated, {
      reviewer: researcher,
      at: approvedAt,
    });
  } catch {
    directApprovalRejected = true;
  }
  assertCase(
    "pr3a.approval.requires-explicit-review",
    directApprovalRejected
  );
  const advisoryGenerated = createLiveGeneratedTextReview({
    recordId: "review-advisory-1",
    artifactId: "live-result-advisory",
    producer,
    generatedAt,
    content: "Consider collecting additional observations.",
    classification: "advisory",
    resultContractId: "inference.parametric",
    provenance: provenance(),
    semanticEvidence: liveEvidence,
  });
  assertCase(
    "pr3a.export.generated-advisory-rejected",
    guardGeneratedTextExport({
      included: true,
      record: advisoryGenerated,
    }).decision === "BLOCK_RESEARCHER_APPROVAL_REQUIRED"
  );
  assertCase(
    "pr3a.export.missing-review-record-fails-closed",
    !guardGeneratedTextExportManifest([
      { included: true, record: null },
    ]).allowed
  );

  const project = setReviewAuthorityRecordsOnProject(
    { metadata: { name: "fixture" }, extensions: { unrelated: true } },
    [approved, snapshotReview],
  );
  const revived = getReviewAuthorityRecordsFromProject(project);
  assertCase(
    "pr3a.persistence.namespaced-safe-revival",
    project.extensions?.unrelated === true &&
      REVIEW_AUTHORITY_PROJECT_EXTENSION_KEY in project.extensions! &&
      revived.length === 2 &&
      Object.isFrozen(revived[0]),
  );
  assertCase(
    "pr3a.persistence.malformed-rejected",
    getReviewAuthorityRecordsFromProject({
      extensions: {
        [REVIEW_AUTHORITY_PROJECT_EXTENSION_KEY]: {
          schema: "scientific-generated-text-review-store/v1",
          records: [{ schema: "malformed" }],
        },
      },
    }).length === 0
  );
  let duplicatePersistenceRejected = false;
  try {
    serializeReviewAuthorityRecords([approved, approved]);
  } catch {
    duplicatePersistenceRejected = true;
  }
  assertCase(
    "pr3a.persistence.duplicate-records-rejected",
    duplicatePersistenceRejected
  );
};
