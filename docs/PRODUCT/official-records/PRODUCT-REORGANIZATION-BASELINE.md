# Official Record

# Product Reorganization Baseline

**Product:** Scientific Graph AI
**Record Date:** 2026-08-21
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY
**Baseline Status:** **FROZEN**
**Implementation Status:** **NOT STARTED**
**Implementation Entry Point:** **PR0-A — Contract, Ownership, and Regression Baseline**

---

## 1. Authority and Scope

This record freezes the authoritative Product Reorganization Baseline produced after:

- Tier 3 Scientific Validation closure;
- the Final Product Gap Inventory;
- independent red-team review and authoritative reconciliation;
- explicit Product Owner approval of PD-01 through PD-07;
- Implementation Roadmap Architecture;
- Detailed Implementation Roadmap;
- Researcher Journey and Workflow Reconciliation;
- Final Roadmap Certification.

Authority chain:

```text
FINAL-PRODUCT-GAP-INVENTORY
        ↓
PRODUCT REORGANIZATION BASELINE
        ↓
PD-01–PD-07
        ↓
DETAILED IMPLEMENTATION ROADMAP
        ↓
FINAL ROADMAP CERTIFICATION
        ↓
PR0-A
```

Repository records:

- [Final Product Gap Inventory](../FINAL-PRODUCT-GAP-INVENTORY.md)
- [Product Decision Register PD-01–PD-07](./PRODUCT-DECISION-REGISTER-PD-01-PD-07.md)
- [Inventory Decision Supersession](./PRODUCT-INVENTORY-DECISION-SUPERSESSION.md)
- [Detailed Implementation Roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md)
- [Final Roadmap Certification](./FINAL-ROADMAP-CERTIFICATION.md)
- [Living Roadmap](../../roadmaps/ROADMAP.md)

This baseline authorizes the documented implementation route after the documentation freeze. It does not assert that implementation has occurred.

---

## 2. Certified Scientific Boundary

```text
TIER 3 SCIENTIFIC VALIDATION = CLOSED
CHECKPOINT = f0730a2
T3-022+ = NOT AUTHORIZED
SCIENTIFIC ESTIMATOR REOPENING = NOT AUTHORIZED
```

Product completion work may improve product identity, disclosure, provenance, output parity, artifact lifecycle, workflow continuity and validation. It must not reopen certified scientific estimators under product, UX or publication work.

---

## 3. Relationship to the Final Product Gap Inventory

The [Final Product Gap Inventory](../FINAL-PRODUCT-GAP-INVENTORY.md), checkpoint `0c6a40c`, remains the authoritative historical audit record for FINAL-PG-001 through FINAL-PG-024.

The inventory was correct when created. Its sections O–P identify decisions that were open at that time. Product Reorganization subsequently closed or explicitly dispositioned those questions. Historical wording is preserved and superseded prospectively by:

- this frozen baseline;
- the [Product Decision Register](./PRODUCT-DECISION-REGISTER-PD-01-PD-07.md);
- the [Inventory Decision Supersession](./PRODUCT-INVENTORY-DECISION-SUPERSESSION.md);
- the [Detailed Implementation Roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md).

No new Product Gap is created by this record.

---

## 4. Product Identity

Scientific Graph AI is a researcher-controlled environment for:

- scientific data preparation;
- certified analysis;
- mathematical and dataset-driven visualization;
- scientific review and comparison;
- human-reviewed reporting and publication support;
- non-authoritative guidance.

It is not an autonomous scientific author, interpreter or decision-maker.

---

## 5. Capability Baseline

The frozen capability map is:

1. **PC-01** — Data ingestion.
2. **PC-02** — Worksheet preparation and lineage.
3. **PC-03** — Experimental series management.
4. **PC-04** — Mathematical graph authoring.
5. **PC-05** — Worksheet-driven VGB figure authoring.
6. **PC-06** — Descriptive/distribution diagnostics.
7. **PC-07** — Statistical inference/effect size/power.
8. **PC-08** — Multivariate structure analysis.
9. **PC-09** — Composite methodology decision support.
10. **PC-10** — Multi-dataset comparison.
11. **PC-11** — Scientific review and guidance.
12. **PC-12** — Scientific Report assembly.
13. **PC-13** — Publication and export.
14. **PC-14** — Project continuity and recovery.
15. **PC-15** — Guided entry and workflows.

Runtime infrastructure, governance and deferred AI/COLLAB/PLUGINS capabilities are not additional current product capabilities.

---

## 6. Artifact Baseline

The frozen conceptual artifacts are:

- Dataset;
- Worksheet;
- Experimental Series;
- Analysis Configuration;
- Live Derived Result;
- Composite Methodology Result;
- Immutable Citable Snapshot;
- Comparison Snapshot;
- Working Figure;
- Publication Figure;
- Scientific Report Draft;
- Reviewed Publication Report;
- PDF;
- Numeric Scientific Export;
- Project;
- Session.

Mandatory identity rule:

```text
LIVE DERIVED RESULT ≠ IMMUTABLE CITABLE SNAPSHOT
```

Recomputation may establish equivalence but does not silently reuse the identity of an existing citable snapshot.

---

## 7. Researcher Journey Baseline

The product journey is a graph with multiple valid entry points, not a forced linear wizard:

```text
START
  → DATA / IMPORT
  → PREPARE
  → EXPLORE
  → ANALYZE
  → RESULTS
  → VISUALIZE
  → COMPARE
  → REPORT
  → REVIEW
  → EXPORT
  → SAVE / REOPEN / CONTINUE
```

Stages may be optional, revisited or entered through valid alternate paths.

Frozen journey rules:

- Results is the scientific review and convergence center, not an independent scientific SSOT.
- Analysis is the configuration/control plane.
- Graph Editor and VGB remain separate products: **GE ≠ VGB**.
- VGB does not automatically feed Analysis.
- Project continuity is active product scope.
- full Session UI/restore remains deferred.
- AI is transversal, non-authoritative assistance and is not a product journey stage.
- every implemented entry/stage must expose context, prerequisites, next actions, blocked actions, completion and return paths where applicable.

---

## 8. Closed Product Decisions

The following product decisions are **CLOSED** and **FROZEN**:

- **PD-01** — Explorer Identity.
- **PD-02** — SCI-50–60 Semantics.
- **PD-03** — VGB Publication Role.
- **PD-04** — Cross-Output Scientific Invariants.
- **PD-05** — Machine-Readable Scientific Export.
- **PD-06** — Artifact Identity and Provenance.
- **PD-07** — Generated Text Authority.

Their authoritative wording is preserved in the [Product Decision Register](./PRODUCT-DECISION-REGISTER-PD-01-PD-07.md). Implementation may not reinterpret them.

---

## 9. Product Decision vs Implementation Decision

### Product decisions — frozen

Product decisions define:

- what a capability or artifact means;
- which scientific claims are permitted;
- who holds scientific authority;
- what must remain semantically invariant;
- which lifecycle distinctions are mandatory;
- which current/deferred boundaries are product rules.

Only explicit Product Owner governance may amend a frozen Product Decision.

### Implementation decisions — open

Implementation decisions include:

- file and module placement;
- TypeScript types and schemas;
- identifier and fingerprint formats;
- provenance storage and transport;
- snapshot persistence mechanics;
- comparison freshness implementation;
- numeric export representation;
- projection architecture;
- review-state storage and UX;
- VGB promotion representation;
- technical validation strategy;
- narrow contract-driven extraction from existing files.

These items are decided inside PR0-A through PR6-A under the frozen product rules. They are not new Product Decisions.

No monolithic `ResultModel` is mandated.

---

## 10. Ownership Boundary

- **Scientific domain:** authoritative estimators, values, assumptions, uncertainty and warnings.
- **Product governance:** capability identity, workflow meaning, artifact semantics and authority rules.
- **Composite methodology:** calculation plus product-governed communication semantics.
- **Results:** derived review/convergence surface.
- **Report:** composition and review lifecycle.
- **PDF/export:** projections governed by semantic parity.
- **Figure authoring:** figure specifications and visual provenance.
- **Project:** durable researcher work.
- **Session:** transient runtime continuity.
- **Presentation:** interaction and rendering, not scientific authority.
- **AI:** future non-authoritative assistance only.

Exact technical owners and implementation locations are PR0-A outputs where not already authoritative.

---

## 11. Human and AI Authority

```text
HUMAN = SCIENTIFIC AUTHORITY
AI = NON-AUTHORITATIVE ASSISTANCE
```

Factual system text may be generated automatically. Interpretive, advisory, evidentiary and publication-oriented generated text remains draft until researcher review, editing or acceptance.

AI never owns scientific claims. AIR-1 remains deferred.

---

## 12. Deferred and Protected Domains

The current Product V1 implementation route excludes:

- AIR-1 and runtime AI;
- COLLAB realtime/CRDT;
- PLUGINS loading/execution;
- Cloud/RLS/Auth implementation;
- ARCH-U and full Session UI/restore;
- domain undo/redo;
- EXPORT-3;
- CRP Phase 3;
- CRP-6.4 implementation;
- marketplace/Lovable publication;
- speculative performance optimization;
- new scientific estimators;
- broad size-driven `page.tsx` refactoring.

Listing a deferred domain does not create current implementation debt or authorize it.

---

## 13. Effective Roadmap Boundary

The authorized implementation series is:

```text
PR0-A
  → PR1
  → PR2
  → PR3
  → PR4
  → PR5
  → PR6
```

The full route, dependencies, contracts, gaps, gates, researcher journey and non-goals are defined in the [Detailed Implementation Roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md).

Implementation begins only at:

```text
PR0-A — Contract, Ownership, and Regression Baseline
```

No later phase may bypass its declared prerequisites or merge gate.

---

## 14. Freeze Statement

```text
PRODUCT REORGANIZATION = COMPLETE
PRODUCT REORGANIZATION BASELINE = FROZEN
PD-01–PD-07 = CLOSED
TIER 3 = CLOSED
DETAILED ROADMAP = AUTHORITATIVE
FIRST IMPLEMENTATION PHASE = PR0-A
```

This is a documentation/governance record. It contains no source implementation, no new Product Gap, no new Product Decision and no new implementation phase.
