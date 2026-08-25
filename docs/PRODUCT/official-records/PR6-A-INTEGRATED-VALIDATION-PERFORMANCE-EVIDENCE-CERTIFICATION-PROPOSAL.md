# Official Record

# PR6-A — Integrated Validation, Performance Evidence, and Product V1 Certification Proposal

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-24  
**Implementation Series:** Product Reorganization  
**Phase:** PR6-A (STAGE 6 — hardening / integrated certification)  
**Phase Status:** **CHARTER APPROVED / NOT CERTIFIED / IMPLEMENTATION NOT STARTED**  
**Wave 0 Status:** **SSOT DOCUMENTATION RECONCILIATION ONLY**  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07; certified PR0-A through PR5  
**Living SSOT:** [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md)

**Live pointer (does not rewrite the freeze-time Wave 0 body below):**

```text
CP-7 = ISSUED / CLOSED — docs/PRODUCT/official-records/CP-7-PRODUCT-REORGANIZATION-CERTIFICATION.md
PR6-A OVERALL = CERTIFIED WITH EXPLICIT DISCLOSURES / CLOSED
WAVES 0–3 = CLOSED AS HISTORICAL EVIDENCE (bodies not rewritten)
ROADMAP = FINISHED
NEXT = NONE
```

```text
PR6-A WAVE 0 IMPLEMENTED — NOT CERTIFIED
PR6-A IMPLEMENTATION (WAVES 1–3) = NOT STARTED
CP-7 = NOT ISSUED
PRODUCT V1 / 1.0.0 = EXISTING BASELINE (NOT REOPENED)
```

This record does **not** certify PR6-A, CP-7, or Product V1. Wave 0 records the Owner-approved charter and restores living SSOT. It performs no product implementation. Live overall closeout is the CP-7 official record, not this freeze-time Wave 0 body.

---

## 1. Authority and position in the route

Certified Product Reorganization implementation baseline:

```text
PR0-A → PR1 → PR2 → PR3 → PR4 → PR5 CLOSED / CERTIFIED
```

- PR5 documentation checkpoint: `3e2edb5` — `docs(product): close PR5 researcher journey`
- PR5 implementation / browser checkpoint (PR5 official record): `6a6bc92`

**Next authorized series:** PR6-A  
**This record:** charter + Wave 0 SSOT only.

Historical freeze records remain historical, including [FINAL-ROADMAP-CERTIFICATION.md](./FINAL-ROADMAP-CERTIFICATION.md), [PRODUCT-REORGANIZATION-BASELINE.md](./PRODUCT-REORGANIZATION-BASELINE.md), and [the detailed implementation roadmap](../../roadmaps/PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md). Freeze-time sentences such as “implementation not started” in those documents are **not rewritten** here. This record is the live pointer for PR6-A charter status.

---

## 2. Charter (Owner-approved)

```text
PR6 = PR6-A — Integrated Validation, Performance Evidence,
and Product V1 Certification Proposal
```

PR6-A certifies the implemented Product Reorganization baseline after PR5. It is not a new product domain, not a PERFORMANCE or RELEASE series reopen, and not the later global Product Face / information-architecture / visual-PWA reorganization.

---

## 3. Approved Owner Decisions

### Decision 1 — Inherited VGB 87/88

**APPROVED:** keep visible; accept as a non-blocking CP-7 exception.

Case id: `scatter.amend.api-freeze-prerequisite`  
Owner-approved alias: `scatter.amend.api-freeze-prerequisite`

This failure remains visible inherited debt. It is formally accepted as a **non-blocking exception** for PR6 / CP-7.

Do **not**:

- restore `PROJECT_DISCOVERY_PROD_3.md` (or `PROJECT_DISCOVERY_PROD_3.md`) to repository root;
- duplicate or move the archived document;
- modify the VGB test;
- suppress the failure;
- lower validator thresholds;
- reinterpret it as a PR5 defect.

The archived discovery document may remain where it already is. The exception must remain visible and traceable.

### Decision 2 — CP-7 vs RELEASE 1.0.0

**APPROVED:** CP-7 is the Product Reorganization **certification proposal** against the already established Product V1 / **1.0.0** baseline.

CP-7 is **not**:

- a RELEASE 1.0.0 reopen;
- a RELEASE-P reopen;
- a GRC-1 / GRC-2 reopen;
- a version bump to v1.1;
- production authorization;
- Lovable authorization.

Unless a future explicit Owner Decision separately authorizes such reopening, those series remain closed.

### Decision 3 — Living SSOT

**APPROVED:** Wave 0 may update living planning indexes.

Historical freeze / certification records remain historical. Do not rewrite freeze-time statements merely to make them look current. Use live pointers where necessary.

Objective: **historical record integrity + current SSOT correctness**.

---

## 4. Wave structure

| Wave | Name | Status after this record |
| --- | --- | --- |
| **Wave 0** | Planning / SSOT documentation reconciliation | **This record** — documentation only; does **not** certify PR6-A, CP-7, or Product V1 |
| **Wave 1** | PR6-A.1 Integrated contract and regression certification | **NOT STARTED** |
| **Wave 2** | PR6-A.2 Evidence-driven performance validation | **NOT STARTED** |
| **Wave 3** | PR6-A.3 Product-gap, journey, governance certification + CP-7 proposal | **NOT STARTED** |

**Wave 2 performance rule:** consume the already-certified PERFORMANCE I0–I10 implementation layer. Do **not** reopen PERFORMANCE I0–I10. Optimize only demonstrated regressions. Planning-index freeze language in [PERFORMANCE official-records README](../../PERFORMANCE/official-records/README.md) is historical; live implementation certification is [PERFORMANCE implementation README](../../PERFORMANCE/implementation/README.md).

Waves 1–3 must execute in order after Wave 0.

---

## 5. Frozen non-scope

Keep outside PR6-A unless a later explicit Owner Decision amends this charter:

- Session restore, Session UI, Session autosave
- Domain undo/redo
- Publication picker; dataset-scoped publication state; new persistence store
- CTR-08 / CTR-09 / CTR-10 redesign
- Runtime AI / AIR-1; COLLAB runtime; PLUGINS runtime; EXPORT-3
- CRP Phase 3 / CRP-6.4
- Cloud / Auth / RLS / marketplace / Lovable
- Speculative performance optimization
- New scientific estimators; formula / p-value / PCA / methodology / threshold changes
- Broad navigation rewrite; five-tab redesign; broad `page.tsx` extraction
- Automatic version bump
- Reopening RELEASE 1.0.0 / GRC-1 / GRC-2
- Restoring, duplicating, or suppressing inherited VGB `scatter.amend.api-freeze-prerequisite`

---

## 6. Product V1 / 1.0.0 boundary

Version identity remains **1.0.0** / display **v1.0**. PR6-A does not bump the version.

CP-7, when later issued by Wave 3, is a Product Reorganization completion **proposal** against that existing baseline. It is not production approval and not a new Global Release Certification.

---

## 7. Later global Product Reorganization is not PR6-A

PR6-A is **not** the final global visual / product / information-architecture / app / PWA reorganization.

Intended long-term sequence (future series number **not invented** here):

```text
capability completion
  → integrated certification          ← PR6-A
  → global functional audit
  → researcher-journey / product reorganization
  → information architecture
  → final visual / app / PWA organization
  → performance / release hardening
  → final product closure
```

---

## 8. Wave 0 documentation performed by this record

Wave 0 updates living indexes only:

- [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md) — living next = PR6-A
- [`docs/PRODUCT/official-records/README.md`](./README.md) — PR5 CLOSED / CERTIFIED; PR6-A next / not certified
- this charter record
- live pointer on [`docs/PERFORMANCE/official-records/README.md`](../../PERFORMANCE/official-records/README.md) for I0–I10 current state

No `src/**`, `scripts/**`, validators, tests, or `package.json` changes are authorized or performed by Wave 0.

---

## 9. Certification boundary

```text
WAVE 0 ≠ PR6-A CERTIFIED
WAVE 0 ≠ CP-7 ISSUED
WAVE 0 ≠ PRODUCT V1 RE-CERTIFIED
WAVE 0 ≠ RELEASE 1.0.0 REOPENED
```

PR6-A remains **NOT CERTIFIED** until Waves 1–3 complete and CP-7 is proposed under this charter.
