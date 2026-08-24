# Official Record

# PR3 — Review Authority, Output Parity & Numeric Scientific Export

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-22  
**Implementation Series:** Product Reorganization  
**Phase:** PR3  
**Phase Status:** **IMPLEMENTED — READY FOR READ-ONLY AUDIT / CERTIFICATION**  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07, certified PR0-A, PR1 and PR2

---

## 1. Executive Summary

PR3 implements CTR-08 and CTR-10 and completes authorized consumption of the PR2 CTR-06 semantic-projection foundation for PR3-owned outputs.

Authoritative mapping:

- CTR-08 → PR3-A → Generated-text Review Authority;
- CTR-10 → PR3-B → Numeric Scientific Export;
- CTR-06 → PR2 foundation, consumed by PR3 Results, Report, PDF, Comparison and Numeric Export paths;
- CTR-09 → PR4-A → VGB Figure Lifecycle, explicitly not implemented by PR3.

No Product Decision, scientific estimator change, PR1/PR2 redesign, persistence redesign, AI runtime or CTR-09 implementation was required.

---

## 2. CTR-08 Review Authority

The versioned contract is `scientific-generated-text-review/v1`.

Authority state and validity are independent:

| Authority state | Meaning |
| --- | --- |
| `GENERATED` | System/external content exists but has no researcher review authority. |
| `RESEARCHER_REVIEWED` | A researcher explicitly reviewed the bound content and evidence. Review is not approval. |
| `RESEARCHER_APPROVED` | A researcher explicitly approved a previously reviewed record. |

| Validity | Meaning |
| --- | --- |
| `CURRENT` | Content and bound evidence still match the review identity. |
| `STALE` | Live semantic evidence or referenced artifact identity changed. |
| `INVALID` | Record/content/snapshot is malformed, unavailable or contradicted. |
| `UNKNOWN` | Current evidence cannot be compared safely. |

Effective approval requires both `RESEARCHER_APPROVED` and `CURRENT`.

---

## 3. Review Identity and History

Every review record binds:

- producer identity and generation timestamp;
- stable record and content identity;
- deterministic content fingerprint;
- live-result or immutable-snapshot artifact identity;
- result-contract identity;
- complete PR1 provenance;
- deterministic semantic-evidence fingerprint;
- researcher identity;
- review and approval timestamps;
- append-only transition history.

Records are recursively frozen after construction/revival. Historical records are preserved when content or live evidence changes.

---

## 4. Generated / Reviewed / Approved Semantics

Generated prose remains `generated-non-authoritative` even after approval: approval records a human decision about the content; it does not rewrite system output as researcher-authored prose.

Content classifications are:

- `factual`;
- `interpretive`;
- `advisory`;
- `mixed`.

Classification is explicit registry metadata, not AI or linguistic inference. Unknown report sections default conservatively to `mixed`.

Current factual system content may be exported with a generated-authority disclosure. Interpretive, advisory, mixed, or non-system content requires explicit researcher approval and current validity.

---

## 5. Approval Invalidation

Live review identity includes content and scientific evidence. A new content/evidence identity creates a new `GENERATED` record and preserves the old record as:

- `INVALID` when content changed;
- `STALE` when content is unchanged but live semantic evidence changed.

Source revision, configuration, method identity, result-facing content and provenance participate in the report evidence identity.

Immutable snapshot review remains attached to the same unchanged `snapshotId` and captured evidence. A different snapshot identity becomes `STALE`; mutation under the same immutable identity becomes `INVALID`.

---

## 6. Generated Text Safety

CTR-08 is applied to:

- deterministic scientific report summary and sections;
- generated scientific interpretation;
- generated scientific-assistant/advisory prose;
- SCI-58 cross-dataset diagnosis/recommendation through its mixed report block;
- methodology/publication summary prose through conservative report block classification.

Generated content is not automatically citable. Clipboard extraction of report, interpretation or advisory prose is guarded and includes generated-authority disclosure when allowed.

No AI runtime was added and `src/ai/**` was not changed.

---

## 7. Report / PDF Review and Inclusion

Review state, approval state and inclusion state remain separate.

Report sections receive deterministic block identities. PDF visibility chooses inclusion but cannot grant authority. Before PDF generation:

1. the existing visibility policy selects report blocks;
2. the review manifest evaluates only included generated blocks;
3. current factual system content is allowed with disclosure;
4. non-factual content without current researcher approval blocks export.

The PDF receives and verifies the same manifest and prints its disclosure. Pack Lite uses the same decision and reports `blocked-unapproved-content` when necessary.

This is a scientific-content export boundary, not publication certification.

---

## 8. CTR-06 Output Parity Consumption

`scientific-semantic-projection/v1` remains the authoritative invariant transport. PR3 does not introduce another parity model.

For the citable SCI-58 artifact, the same immutable snapshot is projected to:

- Results;
- Report;
- PDF;
- Comparison;
- `numeric-export-foundation`.

The projections preserve artifact identity, result contract, values, units, uncertainty, source/series identity, configuration, method, provenance, approximation, warnings, limitations and freshness. Surface formatting may differ; semantic calculations do not.

---

## 9. Results

SCI-58 Results slot summaries consume the `results` projection. They expose snapshot identity, method, source, freshness, approximation, units, uncertainty, warnings and limitations.

When a valid snapshot exists, mutable duplicate profile fields are not authoritative. Legacy profiles remain readable, but no numeric export is offered without a valid citable snapshot.

---

## 10. Report

The comparison section is now wired into the main scientific report and receives per-slot freshness context. It reads authoritative snapshot projections and prints full semantic disclosure.

Generated report prose is separately governed by CTR-08 and remains non-authoritative until the applicable researcher action.

---

## 11. PDF

Comparison PDF content consumes the `pdf` projection and the same freshness context as Results/Report. The comparison section preserves snapshot identity and semantic disclosures.

PDF generation does not recompute comparison scientific values. Visibility filtering and review authority are both enforced before document creation.

---

## 12. Comparison

SCI-58 preserves:

- snapshot identity and authoritative captured profile payload;
- compatibility state and reasons;
- freshness;
- provenance;
- method/configuration identity;
- approximation, warnings and limitations;
- units and uncertainty where supplied.

Malformed snapshots make a profile incomplete rather than allowing fallback to mutable duplicate data. Legacy profiles without snapshots remain explicitly non-authoritative for projection/export.

---

## 13. CTR-10 Numeric Scientific Export

Canonical schema:

```text
schema: scientific-numeric-export/v1
kind: scientific-graph-ai.numeric-scientific-export
format: JSON
source projection: scientific-semantic-projection/v1
source surface: numeric-export-foundation
```

The payload contains:

- export identity and timestamp;
- artifact/snapshot and result-contract identity;
- source, dataset and series identity;
- semantic values, units and uncertainty;
- configuration and method identity;
- full provenance;
- approximation, warnings and limitations;
- freshness;
- schema/number compatibility metadata.

Serialization recursively orders object keys, preserves JSON number round-trip precision, rejects cycles/non-finite values/unknown fields, supports runtime validation and parse/round-trip, and returns frozen values.

Exactly one format is implemented. CSV, `.sgproj`, chart JSON, component state, pixels, coordinates and generated interpretation are excluded.

---

## 14. Numeric Export I/O

Scientific export contracts are I/O-free. `src/app/scientificNumericExportActions.ts` is the thin browser boundary for Blob creation and download.

The comparison Results surface offers one numeric JSON download per valid citable slot snapshot. Chart JSON is relabeled as graph configuration and explicitly distinguished from Numeric Scientific Export.

---

## 15. Provenance and Disclosure Parity

The implemented chain is:

```text
source
→ analysis/configuration and method
→ scientific result
→ citable snapshot
→ semantic projection
→ Results / Report / PDF / Comparison / Numeric Export
```

Projection disclosure preserves:

- approximate/numerical status;
- unsupported or unknown units;
- uncertainty kind/value/unit/confidence where present;
- freshness and reasons;
- warnings;
- scientific limitations.

No output may silently strengthen a claim or remove a material disclosure.

---

## 16. Persistence

Review authority persists only through:

```text
ScientificProjectV2.extensions[
  "scientific-graph-ai.review-authority/v1"
]
```

The existing Project v2 collect/serialize/hydrate pipeline carries the extension. Unknown extension keys are preserved. Runtime revival validates each record, freezes valid records, rejects duplicates for serialization and does not expose malformed records.

No Project schema-version change, IndexedDB store, Session persistence or second authority store was introduced.

---

## 17. Validation

Targeted commands:

- `validate:pr3-review-authority-unit` — PASS, 36 cases;
- `validate:pr3-output-parity-unit` — PASS, 23 cases;
- `validate:pr3-numeric-export-unit` — PASS, 26 cases;
- TypeScript `--noEmit` — PASS.

Targeted coverage includes explicit transitions, human approval, content/evidence/snapshot invalidation, immutable snapshot stability, stale export rejection, malformed persistence, non-citable prose, parity across all PR3 surfaces, schema validation, deterministic serialization, round-trip, precision, provenance and exclusion of UI/chart state.

The certification-correction cases additionally prove conservative malformed-snapshot revival, complete SCI-58 payload validation, explicit provenance review binding, positive snapshot evidence for `CURRENT`, and production replacement of the Report SCI-58 section with its PDF-specific projection.

---

## 18. Regression Evidence

The final implementation run includes PR1 contracts/honesty, PR2 snapshots/parity, methodology, comparison, scientific umbrella, Project v2, IndexedDB, PDF toggle, chart export, Pack Lite and VGB builder/truthfulness validation. Every named regression gate passes except the inherited VGB case `scatter.amend.api-freeze-prerequisite` (87/88 passing). Repository-wide ESLint also remains red at its existing broad baseline (260 findings); TypeScript and all PR3-owned validators pass.

Exact final pass/failure evidence is recorded in the PR3 implementation report. Existing validators were not weakened and no scientific expected value was changed.

---

## 19. Implemented in PR3

- CTR-08 contract, transitions, validity assessment and export guards;
- explicit generated-content classification;
- Project extension persistence and localized review controls;
- Report/PDF/Pack Lite review boundary;
- SCI-58 Results/Report/PDF/Comparison parity completion;
- canonical CTR-10 JSON export and app-layer download;
- targeted PR3 validators;
- official record and index update.

---

## 20. Deferred to PR4

CTR-09 remains PR4-A. PR3 does not implement:

- Working Figure review or promotion;
- Publication Figure identity;
- VGB export;
- VGB Report/PDF inclusion;
- VGB publication persistence;
- publication lifecycle.

PR4 must consume CTR-08 where generated content enters publication artifacts and must preserve CTR-06 semantics. It must not treat a PR3 report-content approval as Publication Figure approval.

---

## 21. Deferred to PR5 and PR6

PR5 retains broader Product Face, navigation, workspace and researcher-journey redesign.

PR6 retains final integration, release hardening and end-to-end product closure.

PR3 performs only localized `page.tsx` wiring.

---

## 22. Known Limitations / Technical Debt

- Numeric export UI is intentionally limited to valid citable SCI-58 snapshots; legacy profiles remain readable but cannot claim authoritative numeric export.
- Reviewer identity is an explicit project-local researcher action identity; account-backed researcher identity is not introduced.
- Snapshot-bound review is fully supported by the contract/API, while the current report UI reviews live generated report blocks.
- Existing report generation remains federated across established scientific owners; PR3 does not create a monolithic result model.
- Existing VGB inherited validation status remains outside CTR-08/CTR-10 and is not hidden by PR3.
- Repository-wide React/compiler lint debt remains outside this scoped implementation; PR3's behavioral, contract and TypeScript gates pass, but the broad ESLint baseline is not clean.
- Some page-wiring integration assertions remain source-level checks; behavioral contract tests cover the underlying guards and identity transitions.

---

## 23. Governance and Acceptance

PR3 does not:

- implement or claim CTR-09;
- modify the frozen roadmap or Product Decision Register;
- change a scientific estimator or expected scientific value;
- add AI runtime;
- make generated prose automatically citable;
- create publication lifecycle;
- redesign persistence or Project/Session ownership;
- broadly refactor `page.tsx`;
- commit or push repository history.

The implementation is ready for the required read-only scope audit and certification before one Git checkpoint.
