# Official Record

# PR2 — Snapshots, Freshness & Semantic Parity

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-21  
**Implementation Series:** Product Reorganization  
**Phase:** PR2  
**Phase Status:** **IMPLEMENTED — READY FOR CERTIFICATION**  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07, certified PR0-A and certified PR1

---

## 1. Executive Summary

PR2 implements CTR-06, CTR-07 and CTR-11 without changing scientific estimators or reopening Tier 3.

The implementation:

- distinguishes the existing ephemeral Live Derived Result from `scientific-snapshot/v1`;
- materializes SCI-58 comparison captures as immutable, citable, machine-readable snapshots;
- preserves snapshot identity and provenance through existing Project v2 persistence;
- evaluates `CURRENT`, `STALE`, `INVALID` and `UNKNOWN` without silently refreshing historical captures;
- evaluates comparison compatibility independently as `COMPATIBLE`, `INCOMPATIBLE` or `UNKNOWN`;
- establishes exact snapshot identity and scientific equivalence as separate concepts;
- establishes `scientific-semantic-projection/v1` for Results, Report, PDF, Comparison, Figure and future numeric-export consumers;
- makes Results comparison analysis prefer the captured snapshot payload;
- makes comparison Report and PDF summaries consume the same semantic projection fields;
- establishes VGB figure semantics without implementing publication or export lifecycle;
- preserves Project/Session separation and adds no persistence subsystem;
- keeps system-generated advisory text non-authoritative.

No Product Decision, persistence redesign, scientific-calculation change or broad `page.tsx` refactor was required.

---

## 2. Snapshot Architecture

The first persisted citable consumer is the existing SCI-58 comparison profile:

```text
federated scientific builders
→ current comparison profile
→ scientific-snapshot/v1
→ Project v2 comparison slot
→ Results / Report / PDF semantic projections
```

The architecture remains federated:

1. Existing domain builders own calculations.
2. `DatasetAnalysisProfile` owns the SCI-58 captured KPI profile.
3. `CitableScientificSnapshot` owns immutable identity and cross-cutting semantics.
4. Project v2 owns serialization and recovery.
5. Semantic projections own invariant transport, not formatting or calculation.

No general snapshot registry, new IndexedDB store or Session persistence path was introduced.

---

## 3. Live Result vs Citable Snapshot

| Dimension           | Live Derived Result            | Citable Scientific Snapshot               |
| ------------------- | ------------------------------ | ----------------------------------------- |
| Kind                | `live-derived-result`          | `citable-scientific-snapshot`             |
| Identity scope      | Runtime session                | Stable `snapshotId`                       |
| Lifecycle           | Ephemeral                      | Immutable                                 |
| Citable             | No                             | Yes                                       |
| Project persistence | Forbidden as scientific record | Allowed                                   |
| Recompute behavior  | May change with current inputs | Never silently changes                    |
| Provenance          | Required                       | Captured and embedded                     |
| Values              | Current owner output           | Captured machine-readable semantic values |

Recomputation may create an equivalent snapshot, but it receives a new `snapshotId`.

---

## 4. Snapshot Contract

`CitableScientificSnapshot` uses schema `scientific-snapshot/v1` and records:

- immutable identity: kind, `snapshotId`, version, capture time and lifecycle;
- status: `captured`;
- federated `ScientificResultContractId`;
- authoritative artifact kind from the PR1 result inventory;
- dataset, source and series identities;
- configuration identity and values;
- method/index identity, version and parameters;
- full `scientific-provenance/v1`;
- typed semantic values, units and uncertainty;
- approximation identity;
- structured warnings;
- explicit limitations.

The snapshot is not a screenshot, PDF or report text. Its payload is a list of machine-readable `ScientificSemanticValue` records.

No content hash is used as identity. `snapshotId` establishes identity; equivalence is evaluated separately from scientific state.

---

## 5. Immutability

Logical immutability is enforced in two places:

1. Capture clones all caller-owned provenance, values, warnings and limitations before recursively freezing the snapshot and comparison profile.
2. Project hydrate revives serialized snapshots through the authoritative constructor and recursively freezes them again.

Consequences:

- source edits do not mutate historical values;
- live recomputation does not replace snapshot content;
- re-capture creates a new identity;
- Project JSON round-trip preserves `snapshotId`;
- report, PDF and figure changes cannot mutate the scientific snapshot.

---

## 6. Freshness Model

`assessScientificSnapshotFreshness` returns:

| State     | Meaning                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------- |
| `CURRENT` | Available current source, series, configuration, method and approximation match the capture.    |
| `STALE`   | A supported comparison proves source, series, configuration, method or approximation drift.     |
| `INVALID` | Snapshot contract is invalid, result contract conflicts, or the required source is unavailable. |
| `UNKNOWN` | Current evidence is insufficient; the implementation does not claim `CURRENT`.                  |

The assessment also reports `recomputable: true | false | "unknown"` and structured reason codes.

Dataset checksum is used when both sides provide it. Active datasets also carry a monotonic `sourceRevision`, incremented when series, column-registry or auxiliary-column content changes, including repeated edits after a worksheet is already marked modified. The revision is persisted through Project v2 without forcing legacy records from absent to zero. Missing current checksum evidence yields `UNKNOWN` rather than a false `CURRENT`.

---

## 7. Invalidation / Recomputation

Implemented transitions:

```text
source changed          → STALE
series changed          → STALE
configuration changed   → STALE
method/index changed    → STALE
approximation changed   → STALE
source removed          → INVALID
context unavailable     → UNKNOWN
matching recomputation  → CURRENT live context; existing snapshot unchanged
new capture             → new snapshotId
```

PR2 does not add automatic recomputation or silent snapshot upgrades.

---

## 8. Comparison Freshness

Freshness moved from UI-only filename checks to `src/lib/scientific/comparison/freshness.ts`.

Each comparison slot now receives:

- a domain freshness state;
- explicit reasons;
- source availability;
- current provenance only when the owning dataset is active and can be evaluated safely.

Inactive multi-dataset slots return `UNKNOWN` rather than being compared against the wrong active dataset.

Compatibility is orthogonal to freshness:

| Compatibility  | Meaning                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `COMPATIBLE`   | Snapshots share a result contract and comparable factual fields with compatible units, value shapes and uncertainty kinds. |
| `INCOMPATIBLE` | Contract, unit, value-shape, uncertainty or comparable-field requirements conflict.                                        |
| `UNKNOWN`      | A legacy or incomplete profile lacks citable snapshot evidence.                                                            |

An incompatible comparison emits a comparability warning instead of proceeding silently.

---

## 9. Semantic Parity Contract

`ScientificSemanticProjection` uses schema `scientific-semantic-projection/v1`.

Every projection carries:

- artifact identity;
- result contract and artifact kind;
- semantic values;
- units and uncertainty;
- source and series identity;
- configuration;
- method/index identity;
- approximation;
- warnings and limitations;
- full provenance;
- freshness state.

Projection surfaces are:

- `results`;
- `report`;
- `pdf`;
- `comparison`;
- `figure`;
- `numeric-export-foundation`.

Surface formatting is intentionally outside the contract. Parity compares scientific invariants while allowing different visual/document structures.

---

## 10. Results Projection

SCI-58 Results now consume authoritative snapshot semantics:

- comparison analysis calls `getAuthoritativeDatasetAnalysisProfile`;
- when a citable snapshot exists, the captured profile payload wins over mutable duplicate top-level data;
- slot summary cards obtain source identity, series count, observation count and capture identity from the Results semantic projection;
- compatibility is shown explicitly.

Legacy profiles without `scientific-snapshot/v1` remain readable and are classified honestly as freshness/compatibility `UNKNOWN` where necessary.

No calculation was moved into Results.

---

## 11. Report / PDF Foundation

Comparison Report and PDF summaries now call `projectDatasetAnalysisProfile` and read shared semantic fields.

The implementation preserves:

- existing Report/PDF structures;
- existing PDF-safe text formatting;
- existing visibility and graph-math exclusion policies;
- existing comparison calculations and section eligibility.

Full report publication lifecycle, generated-text review and full PDF parity remain deferred.

---

## 12. Figure / VGB Foundation

`buildVisualGraphSemanticProjection` establishes figure semantics for current VGB working figures.

It preserves:

- `vgb.preview-values` versus `vgb.pca` contract identity;
- graph/spec identity;
- source and worksheet provenance supplied by the caller;
- x/y/group labels as display context, without claiming they are normalized units;
- explicit units only where the current VGB payload authoritatively supplies them; otherwise unit status is `unknown`;
- full graph configuration;
- machine-readable preview values independent of rendering;
- bar uncertainty mode and values;
- PCA variance units;
- approximation and warnings.

The projection explicitly remains a Live Derived Result and a working figure. PR2 does not add VGB export, publication state, Report/PDF inclusion or GE/VGB fusion.

---

## 13. Numeric Export Foundation

`ScientificSemanticValue` provides a future export-neutral representation:

- field identity;
- machine-readable value;
- unit;
- uncertainty;
- approximation;
- status;
- semantic authority;
- warnings;
- equivalence policy.

No file formatter, download flow or Numeric Scientific Export feature was implemented.

---

## 14. Artifact Equivalence

`assessScientificArtifactEquivalence` returns:

| State            | Meaning                                                           |
| ---------------- | ----------------------------------------------------------------- |
| `IDENTICAL`      | Same `snapshotId` and same immutable content.                     |
| `EQUIVALENT`     | Different identities with the same comparable scientific state.   |
| `NON_EQUIVALENT` | Contract or comparable scientific state differs.                  |
| `UNKNOWN`        | Snapshot contract or required comparable values are insufficient. |

Equivalence evaluates contract, source identity, series, configuration, method, approximation, factual payload, warnings and limitations.

System advisory fields are marked `non-comparable`; they do not become researcher-approved claims and do not determine scientific equivalence.

Visual similarity and serialized UI state are never equivalence criteria.

---

## 15. Persistence Impact

Minimum persistence only:

- the citable snapshot is additive under `DatasetAnalysisProfile.captureMetadata.snapshot`;
- existing `ScientificProjectV2.comparison.slots` persists it without schema version change;
- existing `.sgproj` and IndexedDB paths remain authoritative;
- hydrate revives immutable snapshots;
- malformed nested snapshot state is rejected by the runtime guard instead of being dereferenced;
- source removal preserves the snapshot and marks its profile source unavailable;
- `sourceRevision` is additive and optional for legacy Project records;
- no Project migration redesign is required;
- no Session persistence or Session UI is changed;
- VGB remains configuration-only persistence and rebuilds preview values.

Project continuity and Session continuity remain separate.

---

## 16. Files Created

### Contract and projection foundation

- `src/lib/scientific/contracts/citable-snapshot.ts`
- `src/lib/scientific/contracts/equivalence.ts`
- `src/lib/scientific/contracts/freshness.ts`
- `src/lib/scientific/contracts/semantic-parity.ts`
- `src/lib/scientific/contracts/semantic-values.ts`
- `src/lib/scientific/comparison/freshness.ts`
- `src/lib/scientific/comparison/projection.ts`
- `src/lib/scientific/comparison/snapshot.ts`
- `src/lib/scientific/projection/index.ts`
- `src/lib/scientific/projection/visual-graph.ts`

### Validation

- `src/lib/scientific/contracts/__tests__/pr2-lifecycle.cases.ts`
- `src/lib/scientific/comparison/__tests__/pr2-snapshot-freshness.cases.ts`
- `src/lib/scientific/projection/__tests__/visual-graph-semantic.cases.ts`
- `scripts/validate-pr2-snapshot-parity-unit.ts`

### Official record

- `docs/PRODUCT/official-records/PR2-SNAPSHOTS-FRESHNESS-SEMANTIC-PARITY.md`

---

## 17. Files Modified

- `package.json`
- `docs/PRODUCT/official-records/README.md`
- `src/app/page.tsx`
- `src/components/comparison/ComparisonFreshnessBadge.tsx`
- `src/components/comparison/ComparisonSlotSummaryCard.tsx`
- `src/components/comparison/ScientificMultiDatasetComparisonDashboard.tsx`
- `src/components/comparison/comparisonSlotFreshness.ts`
- `src/lib/project/apply-hydrate-project-v2-patch.ts`
- `src/lib/project/adapters/sgproj/map-session-dataset.ts`
- `src/lib/project/collect-project-snapshot-v2.ts`
- `src/lib/project/domain/types-v2.ts`
- `src/lib/project/sanitize-project-v2.ts`
- `src/lib/graph/series/builders.ts`
- `src/lib/scientific/comparison/analysis.ts`
- `src/lib/scientific/comparison/index.ts`
- `src/lib/scientific/comparison/profile.ts`
- `src/lib/scientific/comparison/report.ts`
- `src/lib/scientific/comparison/types.ts`
- `src/lib/scientific/contracts/artifacts.ts`
- `src/lib/scientific/contracts/index.ts`
- `src/lib/sessionDatasetRegistry.ts`

`page.tsx` changes are limited to one reusable provenance builder and per-slot freshness wiring.

---

## 18. Validation Results

| Gate                                        | Result                                     |
| ------------------------------------------- | ------------------------------------------ |
| `npx tsc --noEmit`                          | **PASS**                                   |
| Targeted ESLint for all new PR2 modules     | **PASS**                                   |
| `validate:pr2-snapshot-parity-unit`         | **PASS — 59/59**                           |
| `validate:pr1-contract-foundation-unit`     | **PASS — 39/39**                           |
| `validate:pr1-scientific-honesty-unit`      | **PASS — 30/30**                           |
| `validate:comparison-unit`                  | **PASS — 101/101**                         |
| `validate:methodology-unit`                 | **PASS — 388/388**                         |
| `validate:spe-1v-umbrella`                  | **PASS — all 13 steps**                    |
| `validate:persistence-unit`                 | **PASS — 23/23**                           |
| `validate:prod2b-b2-gate`                   | **PASS — all 17 persistence/type gates**   |
| `validate:prod2b-indexeddb`                 | **PASS — 25/25**                           |
| `validate:prod2c-c8-regression-gate`        | **PASS — all 5 VGB persistence gates**     |
| `validate:export2-pdf-toggle-unit`          | **PASS — 7/7**                             |
| `validate:export2-d44-3-testing`            | **PASS — 27/27**                           |
| `validate:visual-graph-builder-render-unit` | **PASS**                                   |
| `validate:visual-graph-builder-unit`        | **87/88; expected inherited failure only** |

The inherited VGB failure remains:

```text
scatter.amend.api-freeze-prerequisite
```

It is the certified PR1 baseline debt assigned to PR4. All PR1 truthfulness cases and the PR2 figure semantic cases pass; the validator was not weakened.

`validate:prod2a-gate` also completed its unit, F6, TypeScript, build and PROD-1 steps successfully. Its aggregate result remains environment-blocked because the baseline browser check requires a server at `localhost:3000` and its E2E step requires an external `Dataset5.csv` path that is absent in this workspace. These are external preconditions, not PR2 contract failures.

Repository-wide `npm run lint` remains non-green because of inherited errors across legacy application, test and UI files. The new PR2 contract, comparison, projection and validation modules pass targeted ESLint; PR2 did not weaken lint rules or expand scope into the legacy backlog.

---

## 19. Regression Results

Current targeted evidence confirms:

- no scientific estimator or numeric formula changed;
- PR1 live identity remains ephemeral and non-citable;
- PR1 provenance remains `scientific-provenance/v1`;
- comparison calculations retain all 101 certified cases;
- approximation and VGB truthfulness contracts remain intact;
- Report/PDF formatting remains downstream of semantic truth;
- snapshot capture isolates caller mutation.
- Project v2 collect/serialize/hydrate/sanitize and VGB spec-only persistence remain regression-safe;
- the scientific umbrella passes all 13 product-critical steps.
- repeated source edits advance freshness identity, while unchanged payloads do not;
- source deletion preserves immutable citable history and transitions freshness to `INVALID`;
- advisory text and comparison slot labels do not determine factual equivalence;
- unit/type/uncertainty conflicts produce explicit comparison incompatibility.

---

## 20. Out-of-Scope Work Avoided

PR2 does not implement:

- new estimators or Tier 3 work;
- generated-text review/approval;
- full Report publication lifecycle;
- full PDF parity;
- numeric scientific export;
- VGB publication lifecycle or export;
- GE/VGB merge;
- Session UI or Session restore;
- AI runtime;
- COLLAB or PLUGINS;
- speculative optimization;
- broad `page.tsx` refactor;
- a new persistence architecture;
- a new Product Decision.

---

## 21. Remaining Technical Debt

1. Citable snapshot materialization is integrated first for SCI-58; other result families use the generic contract but need phase-owned capture adapters.
2. Inactive comparison datasets cannot safely reconstruct current scientific configuration; freshness is intentionally `UNKNOWN` until activated.
3. Dataset checksums remain optional; current active datasets use `sourceRevision`, while legacy records without sufficient current evidence remain `UNKNOWN`.
4. GE result types local to `page.tsx` still limit broad snapshot adapter coverage.
5. Full cross-output warning/provenance presentation remains a downstream consumer task.
6. The inherited VGB `scatter.amend.api-freeze-prerequisite` remains assigned to PR4.

---

## 22. PR3 Blockers

No blocker prevents PR2 certification.

PR3 entry dependencies now available:

- stable citable snapshot identity;
- machine-readable semantic values;
- provenance and approximation transport;
- cross-surface projection contract;
- freshness and equivalence semantics.

PR3 still owns:

- generated-text review authority and export guards;
- complete Report publication lifecycle;
- Numeric Scientific Export format and delivery.

Those are deferred work, not PR2 defects.

---

## 23. Acceptance Criteria

| Criterion                                            | Status  |
| ---------------------------------------------------- | ------- |
| Live result and citable snapshot explicitly distinct | **MET** |
| Authoritative snapshot contract                      | **MET** |
| Logical immutability                                 | **MET** |
| Snapshot provenance preserved                        | **MET** |
| Stable snapshot identity                             | **MET** |
| Explicit freshness states                            | **MET** |
| Source/config/method invalidation                    | **MET** |
| Explicit comparison freshness and compatibility      | **MET** |
| Semantic parity contract                             | **MET** |
| Results consumes snapshot semantics                  | **MET** |
| Report/PDF shared foundation                         | **MET** |
| Figure/VGB semantic foundation                       | **MET** |
| Numeric export foundation without feature            | **MET** |
| Artifact equivalence semantics                       | **MET** |
| Project/Session boundary preserved                   | **MET** |
| AI non-authoritative and unimplemented               | **MET** |
| PR1 behavior regression-safe                         | **MET** |
| No downstream phase implemented                      | **MET** |
| Validation evidence                                  | **MET** |
| PR3 dependencies explicit                            | **MET** |

---

## 24. Implemented / Deferred / Unknown

### IMPLEMENTED IN PR2

- CTR-07 snapshot contract, identity, immutability and SCI-58 persistence.
- CTR-11 generic and comparison freshness.
- CTR-06 semantic projection contract and initial consumers.
- Artifact equivalence.
- VGB figure semantic projection foundation.
- Numeric semantic-value foundation.

### DEFERRED TO PR3

- Generated-text review lifecycle.
- Complete Report/PDF authority workflow.
- Numeric Scientific Export feature.

### DEFERRED TO PR4

- VGB review/publication lifecycle.
- VGB export and Report/PDF figure inclusion.
- Inherited scatter amend/API-freeze prerequisite.

### DEFERRED TO PR5

- Session UI, full Session restore and broader lifecycle recovery.

### DEFERRED TO PR6

- Integrated product certification and journey-level closure.

### UNKNOWN

- Future external numeric export format.
- Future researcher-review state representation.
- Freshness of inactive datasets whose current configuration cannot be reconstructed safely.

---

## 25. Git Checkpoint Recommendation

Do not create a checkpoint before scope audit, validation review and certification.

Recommended sequence:

```text
PR2 implementation
→ PR2 scope audit
→ validation evidence review
→ PR2 certification
→ one Git checkpoint
```

No commit or push was created during implementation.

**PR2 COMPLETE — READY FOR CERTIFICATION**
