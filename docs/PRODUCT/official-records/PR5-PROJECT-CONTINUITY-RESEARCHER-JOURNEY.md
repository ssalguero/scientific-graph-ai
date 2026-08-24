# Official Record

# PR5 — Project Continuity and Researcher Journey

**Product:** Scientific Graph AI  
**Record Date:** 2026-08-24  
**Implementation Series:** Product Reorganization  
**Phase:** PR5 (STAGE 5 Product Face / researcher continuity)  
**Phase Status:** **CLOSED / CERTIFIED**
**Certified implementation checkpoint:** `6a6bc92` — `fix(product): correct PR5 home responsive disclosure`
**Decision Authority:** PROJECT OWNER / PRODUCT GOVERNANCE AUTHORITY  
**Implementation Authority:** Frozen PD-01–PD-07, certified PR0-A–PR4

---

## 1. Executive Summary

PR5 is Stage 5 Product Face / researcher-journey work. It is not a new roadmap phase and does not invent a Product Decision.

**PR5 CLOSED / CERTIFIED.** Product Face scope is complete. Browser validation is complete. F-PR5-01 is closed. No further PR5 implementation is required.

This record distinguishes:

| Slice | Status | Meaning |
| --- | --- | --- |
| Wave 0 | Diagnostic closed | 22/22 PASS. Continuity evidence remains valid. No PR4 corrective debt. |
| Wave 1 | Certified | Checkpoint `620199f` — continue-edit, reopen 0/1/>1, STALE/UNKNOWN/INVALID disclosure, factual VGB publication listing, CTR-08 PDF copy. 20/20 PASS. |
| Wave 2 | Certified / closed | Honest Session/undo disposition, dataset-switch Report vs Project publication scope, PR5-B.1 journey honesty, computation-visibility disclosure, Results-centered continuity. 20/20 PASS after F-PR5-01. |
| F-PR5-01 | Closed | Responsive Home correction at `6a6bc92`. Browser **A — CORRECTED / BROWSER PASS**. |
| Session / domain undo | Deferred | Disclosed as unavailable. Not implemented. Not a PR5 failure. |

Wave 2 consumes CTR-01/02/03/06/07/08/09/10 and existing CTR-13 semantics. It does not reopen them.

---

## 2. Wave 0 — Diagnostic

Wave 0 proved Project v2 round-trip for working `figureId`, `graphSpec`, publication identity, snapshot identity, review record identity, preview rebuild, and CTR-08 CURRENT with matching evidence.

**22/22 PASS.** Diagnostic continuity evidence remains valid. No PR4 corrective debt was demonstrated. No Product Face copy, Session UI, or scientific contract was changed.

---

## 3. Wave 1 — Certified Continuity

Wave 1 certified localized Constructor continue-edit over persisted `graphSpec`, reopen selection honesty, validity disclosure without reapproval, discoverable factual publication listing, and CTR-08 PDF block copy with next action.

Certified checkpoint: `620199f` — `feat(product): certify PR5 wave1 researcher continuity`. **20/20 PASS.** Session restore remains deferred.

Browser Wave 1 recorded a Product Face follow-up: switching the active dataset can hide the live scientific report while Project-scoped VGB publication banners remain visible. Wave 2 reconciled that follow-up as honesty copy, not as a publication picker.

---

## 4. Wave 2 — Certified Product Face Continuity

Wave 2 implements only honest disposition and continuity copy:

- **PR5-A.2** Session restore is disclosed as unavailable. Project Save/Open recover the durable artifact.
- **PR5-A.3** Domain undo/redo is disclosed as not implemented / deferred.
- **PR5-B.1** START/Import/Datos/GE/Analysis/Compare/Report/gated modules receive reason + next action on existing `WorkflowContinuityBar` surfaces.
- **PR5-B.2** SCI-50→60 hidden-panel hints state that hiding a panel does not stop computation when data suffice.
- **PR5-B.3** Analysis remains computation/control; Results remains scientific review; GE and VGB remain distinct; Compare/Report/Export paths stay on existing contracts.

Wave 2 does **not** implement Session restore UI, Session persistence, autosave UI, domain undo/redo, a publication picker, dataset-scoped publication state, a wizard, a five-tab redesign, EmptyState kit migration, CRP Phase 3, Home chrome redesign, or `page.tsx` extraction.

**CERTIFIED / CLOSED.** After F-PR5-01: Wave 2 unit **20/20 PASS**; PR5 composite **PASS**; TypeScript **PASS**. Wave 0 (22/22) and Wave 1 (20/20) remain intact. No scientific contracts changed. No Session restore implementation. No domain undo/redo implementation. No PR6 leakage.

Parent Wave 2 checkpoint: `3781831` — `feat(product): certify PR5 wave2 researcher journey`.

---

## 5. Dataset-Switch Report Honesty

When the live report is unavailable and Project-scoped VGB publications exist, Reportes discloses:

1. the live Report is generated from the active dataset;
2. VGB publication figures belong to the Project;
3. the listing does not imply that the current dataset's live Report contains that figure;
4. the banner is not CURRENT/STALE/approved merely because it exists.

Existing publication listing copy remains factual. Publications are not filtered by dataset. This resolved the Wave 1 Browser product follow-up.

---

## 6. F-PR5-01 — Responsive Home Correction

Wave 2 Browser E2E initially failed at 1024×480 (P2 Product Face only). No scientific-safety or PR1–PR4 regression was observed.

**Root cause:** the PR5 Session/Project/undo disclosure was absolutely positioned over the short Home viewport; SmartStart used a `nowrap` / `w-max` six-card row that overflowed horizontally.

**Correction:** disclosure moved into normal document flow; Home reserves vertical space for it; SmartStart cards wrap. Existing card order, callbacks, and workflow semantics are preserved. This is Product Face responsive layout only, not a scientific or architectural change.

**Checkpoint:** `6a6bc92` — `fix(product): correct PR5 home responsive disclosure`

**Browser recheck** (`https://scientific-graph-ai.vercel.app/`, checkpoint `6a6bc92`):

**A — F-PR5-01 CORRECTED / BROWSER PASS**

| Viewport | Result |
| --- | --- |
| 1024×480 | PASS — overlap = 0; horizontal clipping = 0; all cards accessible; disclosure readable after scroll |
| 1366×768 | PASS — six cards in one coherent row; no clipping; desktop hierarchy preserved |

Smoke also passed: Home continuity; Analysis / Results; GE vs VGB; Reportes gating; VGB publication / numeric-export path presence.

F-PR5-01 is **closed**. No further PR5 implementation is required.

---

## 7. Explicit Deferred Session / Undo

These are **deferred dispositions**, not PR5 failures.

Project recovery exists (Save/Open) as durable artifact recovery. Session restore (windows, tabs, ephemeral content) is not implemented. Domain undo/redo is not implemented and remains deferred.

`src/components/session/**` is unmodified. No new persistence store was introduced.

---

## 8. Inherited VGB Debt

The inherited VGB gate remains **87/88**. Failure: `scatter.amend.api-freeze-prerequisite`. Cause: missing `PROJECT_DISCOVERY_PROD_3.md` / “Decisión J”.

This remains inherited and unsuppressed. It is **not** a PR5 blocker. PR5 does not repair or hide it.

---

## 9. PR6 Boundary

PR6 is the next product series. PR6 planning follows PR5 closure.

PR5 does not include:

- performance implementation;
- release hardening;
- release infrastructure;
- Session restore implementation;
- domain undo/redo implementation unless the PR6 roadmap later assigns it;
- unrelated Product Face redesign.

PR5 invents no PR6 scope.

---

## 10. Scientific and PR4 Boundaries

No estimators, formulas, p-values, PCA, methodology, thresholds, uncertainty, units, provenance generation, snapshot semantics, CTR-08 review authority, CTR-09 publication lifecycle, or CTR-10 numeric export semantics were modified.

Working → Review → Publication, publication identity/immutability, figure review authority, eligibility, publication persistence, numeric export publication-only, and VGB report/PDF lifecycle remain as certified in PR4.

---

## 11. Validation

- Wave 0 diagnostic: **22/22 PASS** (`minCaseCount: 16` unchanged)
- Wave 1 unit: **20/20 PASS** (`minCaseCount: 14` unchanged)
- Wave 2 unit: **20/20 PASS** after F-PR5-01 (`minCaseCount: 18` unchanged)
- `validate:pr5-gate`: Wave 0 + Wave 1 + Wave 2 + TypeScript — **PASS**
- TypeScript `--noEmit`: **PASS**

---

## 12. Final Certification

```text
PR5 CLOSED / CERTIFIED
Checkpoint: 6a6bc92
Browser: F-PR5-01 A — CORRECTED / BROWSER PASS
```

PR5 Product Face / researcher continuity is complete. Next activity is PR6 planning, not additional PR5 implementation.
