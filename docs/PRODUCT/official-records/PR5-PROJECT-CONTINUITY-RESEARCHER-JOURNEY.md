# Official Record

# PR5 — Project Continuity and Researcher Journey

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-24  
**Implementation Series:** Product Reorganization  
**Phase:** PR5 (STAGE 5 Product Face / researcher continuity)  
**Phase Status:** **WAVE 2 IMPLEMENTED — READY FOR READ-ONLY AUDIT / NOT CERTIFIED**  
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07, certified PR0-A–PR4, certified PR5 Wave 0 diagnostic and PR5 Wave 1

---

## 1. Executive Summary

PR5 is Stage 5 Product Face / researcher-journey work. It is not a new roadmap phase and does not invent a Product Decision.

This record distinguishes four states:

| Slice | Status | Meaning |
| --- | --- | --- |
| Wave 0 | Diagnostic closed | 22/22 PASS. No product behavior change. Continuity evidence only. |
| Wave 1 | Certified | Checkpoint `620199f` — continue-edit, reopen 0/1/>1, STALE/UNKNOWN/INVALID disclosure, factual VGB publication listing, CTR-08 PDF copy. |
| Wave 2 | Implemented, not certified | Honest Session/undo disposition, dataset-switch Report vs Project publication scope, remaining PR5-B.1 journey honesty, computation-visibility disclosure, Results-centered continuity remainder. |
| Session / domain undo | Deferred | Disclosed as unavailable. Not implemented. |

Wave 2 consumes CTR-01/02/03/06/07/08/09/10 and existing CTR-13 semantics. It does not reopen them.

---

## 2. Wave 0 — Diagnostic

Wave 0 proved Project v2 round-trip for working `figureId`, `graphSpec`, publication identity, snapshot identity, review record identity, preview rebuild, and CTR-08 CURRENT with matching evidence.

No Product Face copy, Session UI, or scientific contract was changed.

---

## 3. Wave 1 — Certified Continuity

Wave 1 certified localized Constructor continue-edit over persisted `graphSpec`, reopen selection honesty, validity disclosure without reapproval, discoverable factual publication listing, and CTR-08 PDF block copy with next action.

Browser follow-up remaining after Wave 1 certification: switching the active dataset can hide the live scientific report while Project-scoped VGB publication banners remain visible. That follow-up is Product Face honesty, not a publication picker.

---

## 4. Wave 2 — Remaining Stage 5 Product Face Work

Wave 2 implements only honest disposition and continuity copy:

- **PR5-A.2** Session restore is disclosed as unavailable. Project Save/Open recover the durable artifact.
- **PR5-A.3** Domain undo/redo is disclosed as not implemented / deferred.
- **PR5-B.1** START/Import/Datos/GE/Analysis/Compare/Report/gated modules receive reason + next action on existing `WorkflowContinuityBar` surfaces.
- **PR5-B.2** SCI-50→60 hidden-panel hints state that hiding a panel does not stop computation when data suffice.
- **PR5-B.3** Analysis remains computation/control; Results remains scientific review; GE and VGB remain distinct; Compare/Report/Export paths stay on existing contracts.

Wave 2 does **not** implement Session restore UI, Session persistence, autosave UI, domain undo/redo, a publication picker, dataset-scoped publication state, a wizard, a five-tab redesign, EmptyState kit migration, CRP Phase 3, Home chrome redesign, or `page.tsx` extraction.

---

## 5. Browser Follow-Up Resolution

When the live report is unavailable and Project-scoped VGB publications exist, Reportes now discloses:

1. the live Report is generated from the active dataset;
2. VGB publication figures belong to the Project;
3. the listing does not imply that the current dataset's live Report contains that figure;
4. the banner is not CURRENT/STALE/approved merely because it exists.

Existing publication listing copy remains factual. Publications are not filtered by dataset.

---

## 6. Explicit Deferred Session / Undo

Project recovery exists (Save/Open). Session restore (windows, tabs, ephemeral content) is not available. Domain undo/redo is not implemented and remains deferred.

`src/components/session/**` is unmodified. No new persistence store was introduced.

---

## 7. Inherited VGB Debt

`scatter.amend.api-freeze-prerequisite` remains the inherited VGB baseline miss (`PROJECT_DISCOVERY_PROD_3.md` / Decisión J). Wave 2 does not suppress or reassign it.

---

## 8. PR6 Boundary

PR6 performance, release hardening, and end-to-end product closure remain out of scope. Wave 2 implements none of them.

---

## 9. Scientific and PR4 Boundaries

No estimators, formulas, p-values, PCA, methodology, thresholds, uncertainty, units, provenance generation, snapshot semantics, CTR-08 review authority, CTR-09 publication lifecycle, or CTR-10 numeric export semantics were modified.

Working → Review → Publication, publication identity/immutability, figure review authority, eligibility, publication persistence, numeric export publication-only, and VGB report/PDF lifecycle remain as certified in PR4.

---

## 10. Validation Owned by Wave 2

- `validate:pr5-wave2-unit`
- `validate:pr5-gate` now runs Wave 0 + Wave 1 + Wave 2 + TypeScript

Inherited Wave 0 (`minCaseCount: 16`) and Wave 1 (`minCaseCount: 14`) thresholds are unchanged.

This record does **not** certify Wave 2.
