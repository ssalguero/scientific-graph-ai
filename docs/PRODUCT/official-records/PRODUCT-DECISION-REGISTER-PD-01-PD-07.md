# Official Record

# Authoritative Product Decision Register — PD-01–PD-07

**Product:** Scientific Graph AI
**Decision Date:** 2026-08-21
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
**Register Status:** **FROZEN / IN FORCE**
**Decision Status:** **PD-01–PD-07 CLOSED**
**Implementation Authorization:** Governed separately by the Detailed Implementation Roadmap

---

## 1. Authority

The Product Owner explicitly approved PD-01 through PD-07 during Product Reorganization Phase 5. These decisions close product semantics only. Their technical implementations remain open and are governed by:

- [Product Reorganization Baseline](./PRODUCT-REORGANIZATION-BASELINE.md)
- [Detailed Implementation Roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md)
- [Final Roadmap Certification](./FINAL-ROADMAP-CERTIFICATION.md)

Primary evidence:

- [Final Product Gap Inventory](../FINAL-PRODUCT-GAP-INVENTORY.md), checkpoint `0c6a40c`;
- explicit Product Owner approval dated 2026-08-21;
- Product Reorganization authoritative reconciliation and decision-closure process;
- current repository evidence referenced by the inventory and roadmap.

No decision in this register authorizes Tier 3 reopening, new estimators, runtime AI or an implementation outside PR0-A through PR6-A.

---

## PD-01 — Explorer Identity

| Field | Authoritative value |
|---|---|
| **ID** | PD-01 |
| **Title** | Explorer Identity |
| **Decision** | Functional renaming |
| **Status** | **CLOSED** |

### Approved Product Rule

Explorers use functionally accurate identities. Historical scientific method names may exist only as migration/search aliases. No historical scientific method name may remain the primary scientific identity when that method was not executed.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- FINAL-PG-001 and FINAL-PG-002.
- Repository evidence that historical labels reach Results, Report, PDF and composite methodology surfaces.

### Implementation Implications

- Establish authoritative functional identities and compatible aliases.
- Apply the same primary identity across Results, Report, PDF, methodology and export metadata.
- Preserve stable internal/persisted identifiers where compatibility requires it.

### Explicitly Forbidden

- Presenting MANOVA, LDA, CCA, PCR, PLS, Bootstrap, Sensitivity, t-SNE or UMAP as the primary identity when those methods were not executed.
- Implementing real methods merely to preserve historical names.
- Treating a disclaimer as permission to retain a false primary identity.

### Implementation-Open Items

- Final names and copy.
- Localization.
- Alias and migration mechanism.
- Stable identifier representation.

---

## PD-02 — SCI-50–60 Semantics

| Field | Authoritative value |
|---|---|
| **ID** | PD-02 |
| **Title** | SCI-50–60 Semantics |
| **Decision** | Composite methodology decision-support indicators |
| **Status** | **CLOSED** |

### Approved Product Rule

SCI-50–60 outputs are composite methodology decision-support indicators with explicit contributing factors, coverage, defaults/fallbacks and provenance. They are not independent estimators.

They must not claim scientific validation, reproducibility, evidence strength, journal suitability or independent estimator execution.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- FINAL-PG-002.
- Repository evidence from methodology consistency builders and report/PDF projections.

### Implementation Implications

- Disclose factors, coverage, missing/partial coverage, defaults/fallbacks and provenance.
- Ensure upstream labels cannot be laundered into stronger methodology claims.
- Preserve the composite identity across all output projections.

### Explicitly Forbidden

- Claims of scientific validation.
- Claims of demonstrated reproducibility or independent evidence strength.
- Claims of journal suitability.
- Claims that upstream methods/estimators ran when they did not.
- Using contributing module names as proof of independent scientific evidence.

### Implementation-Open Items

- Labels and presentation.
- Provenance representation.
- Partial-coverage handling.
- Formula changes, which require separate scientific governance.

---

## PD-03 — VGB Publication Role

| Field | Authoritative value |
|---|---|
| **ID** | PD-03 |
| **Title** | VGB Publication Role |
| **Decision** | Staged promotion |
| **Status** | **CLOSED** |

### Approved Product Rule

```text
Working Figure → Researcher Review → Publication Figure
```

VGB remains separate from Graph Editor and does not automatically feed Analysis.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- FINAL-PG-003, FINAL-PG-005–009 and FINAL-PG-014.
- Existing VGB builder, Results gallery and project persistence behavior.

### Implementation Implications

- Represent working, reviewed and publication figure lifecycle states.
- Require visual truth and explicit researcher review before publication promotion.
- Integrate publication-eligible figures deliberately with Report/PDF/figure export.
- Resolve `displaySeries` without creating an automatic Analysis feed.

### Explicitly Forbidden

- Automatic publication status.
- Automatic VGB-to-Analysis feed.
- GE/VGB fusion.
- Publication based only on a styling preset.
- Publication of misleading error-bar, box or violin output.

### Implementation-Open Items

- Review mechanism.
- Promotion-state storage.
- Publication presets.
- Export formats.
- Report/PDF selection.
- Provenance representation.
- Final `displaySeries` retention/removal mechanics.

---

## PD-04 — Cross-Output Scientific Invariants

| Field | Authoritative value |
|---|---|
| **ID** | PD-04 |
| **Title** | Cross-Output Scientific Invariants |
| **Decision** | Semantic parity, not structural parity |
| **Status** | **CLOSED** |

### Approved Product Rule

For the same artifact, Results, Report, PDF, Numeric Export, Figure Export and Comparison preserve:

- scientific meaning;
- values;
- units;
- uncertainty;
- method/index identity;
- source identity;
- relevant configuration;
- approximation status;
- material warnings;
- provenance.

Structures and layouts may differ.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- Final Product Gap Inventory output-parity analysis.
- Current Results/Report/PDF/comparison/export repository evidence.

### Implementation Implications

- Define invariant-preserving projections.
- Validate parity per capability/artifact rather than requiring identical document structures.
- Keep approximation, warnings and provenance attached to their scientific values.

### Explicitly Forbidden

- Silent scientific drift between surfaces.
- Stronger downstream claims.
- Dropped material warnings or approximation qualifiers.
- Undisclosed recomputation.
- Method/index relabeling.
- Treating structural identity as the parity requirement.

### Implementation-Open Items

- Projection architecture.
- Formatting and rounding policy.
- Registries.
- Validation strategy.
- Document layouts.

---

## PD-05 — Machine-Readable Scientific Export

| Field | Authoritative value |
|---|---|
| **ID** | PD-05 |
| **Title** | Machine-Readable Scientific Export |
| **Decision** | First-class scientific numeric export |
| **Status** | **CLOSED** |

### Approved Product Rule

Selected scientific results, composite indicators and comparison snapshots can be exported as structured scientific artifacts, distinct from chart configuration export.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- FINAL-PG-010.
- Inventory evidence that existing JSON export represents chart configuration rather than certified statistics.

### Implementation Implications

- Define a versioned scientific export contract.
- Include authoritative identity, values, units, uncertainty, warnings, approximation, relevant configuration and provenance.
- Label chart-configuration export unambiguously as a separate artifact.

### Explicitly Forbidden

- Presenting chart JSON as scientific-result export.
- Limiting scientific-result portability to PDF prose.
- Exporting numeric values without required identity/provenance.

### Implementation-Open Items

- Format and file extension.
- Schema and serialization.
- Selection UX.
- Compatibility behavior.
- Versioning mechanism.

---

## PD-06 — Artifact Identity and Provenance

| Field | Authoritative value |
|---|---|
| **ID** | PD-06 |
| **Title** | Artifact Identity and Provenance |
| **Decision** | Dual lifecycle |
| **Status** | **CLOSED** |

### Approved Product Rule

Scientific Graph AI distinguishes:

- **Live Derived Result**
- **Immutable Citable Snapshot**

Recomputation may establish equivalence but never silently reuses an existing snapshot identity. No monolithic `ResultModel` is mandated.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- FINAL-PG-007, FINAL-PG-010 and FINAL-PG-017.
- Existing project/checksum/comparison snapshot evidence.

### Implementation Implications

- Establish artifact kind, identity, revision/lifecycle and provenance boundaries.
- Preserve snapshot identity through persistence.
- Distinguish recomputation equivalence from artifact identity.
- Support comparison freshness and publication provenance.

### Explicitly Forbidden

- Treating filename/timestamp alone as sufficient scientific identity.
- Silently replacing cited results.
- Conflating recomputation with artifact identity.
- Requiring a monolithic result object.
- Persisting every live intermediate result indiscriminately.

### Implementation-Open Items

- Identifier format.
- Fingerprints/checksums.
- Storage architecture.
- Snapshot composition.
- Equivalence algorithm.
- Version representation.
- Persistence integration.

---

## PD-07 — Generated Text Authority

| Field | Authoritative value |
|---|---|
| **ID** | PD-07 |
| **Title** | Generated Text Authority |
| **Decision** | Human-reviewed authority model |
| **Status** | **CLOSED** |

### Approved Product Rule

Factual system-generated text may be generated automatically. Interpretive, advisory, evidentiary and publication-oriented generated text remains draft until researcher review, editing or acceptance.

Human remains scientific authority. AI never owns scientific claims.

### Evidence / Source

- Product Owner approval, 2026-08-21.
- Current SCI-19, Advisor, Assistant, Report and PDF text surfaces.
- Existing AI non-authoritative governance.

### Implementation Implications

- Classify generated text by authority type.
- Represent draft/reviewed/accepted/excluded states where required.
- Prevent publication output from silently converting generated interpretation into researcher-approved claims.
- Keep future AI behind the same authority boundary.

### Explicitly Forbidden

- Autonomous scientific claims.
- Silent acceptance of interpretive text.
- AI authorship or ownership of claims.
- Automatic conversion of generated interpretation into researcher-owned publication text.
- Runtime AI implementation without AIR-1.

### Implementation-Open Items

- Editing and acceptance UX.
- Review granularity.
- Attribution.
- Audit history.
- Draft indicators.
- Export acknowledgements.

---

## 2. Decision Dependency Summary

```text
PD-01 → PD-02
PD-06 → PD-03 / PD-04 / PD-05 / PD-07
PD-04 → PD-03 / PD-05 / PD-07
PD-07 → Report and publication authority
```

Dependencies order implementation contracts; they do not make any closed Product Decision provisional.

---

## 3. Register Closure

```text
PD-01 = CLOSED
PD-02 = CLOSED
PD-03 = CLOSED
PD-04 = CLOSED
PD-05 = CLOSED
PD-06 = CLOSED
PD-07 = CLOSED
```

Changing technical implementation details within the approved rules is not a Product Decision change. Changing any approved product rule requires explicit Product Owner amendment and a new governance record.
