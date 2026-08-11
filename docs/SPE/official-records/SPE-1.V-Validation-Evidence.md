# Official Record

# SPE-1.V — Validation & Evidence

**Domain:** SPE — Scientific Product Expansion  
**Series / Phase:** SPE-1.V  
**Date:** 2026-08-11  
**Nature:** Umbrella validation / evidence consolidation — **NO PRODUCT FEATURES · NO LAYOUT REDESIGN · NO ARCHITECTURE UNFREEZE · NO SPE-1.C AUTO-START**  
**Status:** **PASS**  
**Planning Authority:** [`../SPE-Planning-Charter.md`](../SPE-Planning-Charter.md) (**IN FORCE / FROZEN**) · W4  
**Prior phases:** SPE-1.0 · SPE-1.E · SPE-1.1 · SPE-1.2 (**PASS**)  
**Prior tip (cite-only):** `af57303f670b5363426f66d60904921e2570c6c7` (SPE-1.2)

```text
SPE-1.V PASS
  ≠ SPE-1.C Series Certification (separate Owner authorization)
  ≠ Commercial Test Ready
  ≠ Layout / Product Face / ARCH-U / AIR-1 / EXPORT-3
  ≠ SemVer bump · deploy · plugins · collab
```

---

## 1. Objective

Prove the SPE-1 productization spine is coherent: SPE-1.1 continuity, SPE-1.2 Pack Lite, EXPORT-1/2 floors, External Discoverability of the SPE surface, architecture fence integrity — with evidence sufficient to decide SPE-1.C readiness.

---

## 2. Scope executed

| IN | OUT |
|----|-----|
| `validate:spe-1v-umbrella` composed gate | Product feature code |
| SPE-critical + Pack Lite units + `tsc` | Window/Dock/Layout redesign |
| Manual/static smoke A–E evidence | ARCH-U · AIR-1 · EXPORT-3 |
| External Discoverability (SPE surface) | Converting findings into SPE features |
| Architecture fence diff `aff8bff..af57303` | Auto-start SPE-1.C · SemVer bump |
| Official Record + live tip sync | Commercial Test Ready declare |

---

## 3. Automated gates — `validate:spe-1v-umbrella`

| Step | Result | Duration |
|------|--------|----------|
| workflow-unit | **PASS** | 4249 ms |
| methodology-unit | **PASS** | 20487 ms |
| comparison-unit | **PASS** | 3506 ms |
| visibility-unit | **PASS** | 2885 ms |
| export1-chart-export-unit | **PASS** | 2914 ms |
| export1-d42-2-testing | **PASS** | 2827 ms |
| export2-pdf-toggle-unit | **PASS** | 2839 ms |
| export2-d44-3-testing | **PASS** | 2811 ms |
| spe-12-pack-lite-unit | **PASS** (8/8) | 2834 ms |
| smart-start-unit | **PASS** | 7198 ms |
| prod1-gate | **PASS** | 13276 ms |
| engine-import-export-unit | **PASS** | 6883 ms |
| tsc --noEmit | **PASS** | 20570 ms |

**Umbrella aggregate:** **PASS** (`initiative: SPE-1`, `phase: spe-1v-validation-umbrella`).

**Files added (validation tooling only):**

| Path | Purpose |
|------|---------|
| `scripts/validate-spe-1v-umbrella.mjs` | Composed SPE-1.V gate |
| `package.json` | `validate:spe-1v-umbrella` |

---

## 4. Evidence matrix

| ID | Requirement | Evidence | Automated | Manual | Status |
|----|-------------|----------|-----------|--------|--------|
| EV-01 | SPE-1.1 bridge | workflow-unit SPE11.* + templates `compare-groups` → `report` | Y | Y (static) | **PASS** |
| EV-02 | evaluate-publication spine | workflow-unit + `buildEvaluatePublicationWorkflowSteps` last → reports | Y | Y (static) | **PASS** |
| EV-03 | SPE-1.2 Pack compose | spe-12-pack-lite-unit + `downloadPublicationPackLite` → PDF then PNG | Y | Y (static) | **PASS** |
| EV-04 | EXPORT-1 floor | export1-* | Y | E static | **PASS** |
| EV-05 | EXPORT-2 floor | export2-* | Y | A/E static | **PASS** |
| EV-06 | Full / partial / blocked pack | unit ready/pdf-only/blocked + messages | Y | C/D static | **PASS** |
| EV-07 | Individual exports | page PNG/SVG/JSON/PDF controls retained | Y | E static | **PASS** |
| EV-08 | Visibility / PDF policy | visibility-unit + export2 | Y | — | **PASS** |
| EV-09 | Import/delivery floors | prod1 + engine-import-export | Y | — | **PASS** |
| EV-10 | TypeScript | tsc --noEmit | Y | — | **PASS** |
| EV-11 | External Discoverability | Layer D checklist (SPE surface) | — | Y | **PASS** (see §6) |
| EV-12 | Architecture fence | diff `aff8bff..af57303` | — | Y | **PASS** |
| EV-13 | Umbrella compose | validate:spe-1v-umbrella | Y | — | **PASS** |
| EV-14 | No ZIP / no new engines | static: no JSZip; Pack composes existing handlers | — | Y | **PASS** |

---

## 5. Manual smoke (A–E)

**Method:** Static wiring + unit semantics review (operator: SPE-1.V BUILD).  
**Disclosure:** Interactive browser Continuity / download smoke **NOT RUN** (environment) — same residual class as SPE-1.1 / SPE-1.2 RD-06 absorb. Objective proof via umbrella units + orchestration review.

| ID | Path | Result |
|----|------|--------|
| **A** | evaluate-publication → Reports → Pack Lite → PDF + PNG path | **PASS** (static + units) |
| **B** | compare-groups → report bridge → Pack Lite | **PASS** (SPE11.* + templates) |
| **C** | Partial pack (report, no chart) | **PASS** (`pdf-only` + disclosure message) |
| **D** | Blocked (no report) | **PASS** (`blocked-no-report`; CTA disabled without report) |
| **E** | Individual PNG / SVG / JSON / PDF | **PASS** (Exportaciones individuales present) |

---

## 6. External Discoverability Check (SPE surface)

| # | Check | Result |
|---|-------|--------|
| 1 | Workflow start identifiable (Smart Start / Guided) | **PASS** — Smart Start options + Guided panel |
| 2 | Analysis/results state identifiable | **PASS** — workspace tabs + workflow progress |
| 3 | Reports location recognizable | **PASS** — `reports` tab; workflow navigates Informes |
| 4 | Pack Lite action recognizable | **PASS** — primary CTA “Descargar Pack Lite” |
| 5 | Pack semantics without internal lore | **PASS** — `PUBLICATION_PACK_LITE_SEMANTICS` visible |
| 6 | Pack vs individual exports distinguishable | **PASS** — labeled sections |
| 7 | Completion message → same destination | **PASS** — GuidedWorkflowPanel names Pack Lite / Informes |
| 8 | No Window/Dock internals required | **PASS** — shell tabs only |

**SPE-surface External Discoverability:** **PASS** (static UI/copy + unit).  
**Interactive first-time external walkthrough:** **NOT RUN** — residual for Owner optional follow-up / CTR.

**Commercial UX Gap (preserved, not SPE-1.V FAIL):** Global Layout / Product Face / Visibility presentation may still impede a cold external user before Commercial Test Ready. Classified **COMMERCIAL UX GAP** — Commercial Gate dependency; **not** absorbed into SPE-1.V as redesign.

---

## 7. Architecture fence

**Diff reviewed:** `aff8bff` (SPE-1.0) → `af57303` (SPE-1.2).

**Changed paths (EXPECTED productization / docs / validation):**  
`src/app/page.tsx` · `GuidedWorkflowPanel` · `workflow/*` · `smart-start/options` · `publication-pack-lite*` · SPE docs · `package.json` (validator scripts) · workflow validator minCaseCount.

**Forbidden areas:** No Session contract · Window/Dock/Layout model · IndexedDB / `.sgproj` · Recharts interiors · Visibility/Command schema · AI runtime · plugins · collab · PDF engine rewrite · EXPORT-3 · SemVer/deploy config changes.

| Classification | Finding |
|----------------|---------|
| EXPECTED | Thin Pack glue + workflow bridge + docs |
| OUT-OF-SCOPE | None opened |
| DRIFT | **None** |
| DEVIATION | **None** |
| BLOCKER | **None** |

**Fence:** **PASS**.

---

## 8. Deviations / findings log

| ID | Finding | Affected Phase | CTR Impact | Severity | Recommendation | Decision |
|----|---------|----------------|------------|----------|----------------|----------|
| RD-V01 | Interactive browser smoke NOT RUN | SPE-1.V residual / CTR evidence | Partial CTR evidence | Low | Optional Owner browser corpus | **OUT-OF-SCOPE FINDING** / residual disclosed |
| RD-V02 | Global Layout / Product Face debt | Commercial Readiness | Blocks CTR declare | Medium | Separate presentation/UX workstream before CTR | **COMMERCIAL UX GAP** — not SPE-1.V FAIL |
| RD-V03 | compare-groups report step copy still says “exportación (PDF / figura)” | SPE surface polish | None for SPE-1.V DoD | Low | Optional copy align in future hygiene | **OUT-OF-SCOPE FINDING** (Pack CTA + completion copy already Pack Lite) |

---

## 9. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| V-AC1 | Scientific journey validated | **PASS** |
| V-AC2 | SPE-1.1 continuity intact | **PASS** |
| V-AC3 | SPE-1.2 Pack Lite intact | **PASS** |
| V-AC4 | EXPORT-1 floor PASS | **PASS** |
| V-AC5 | EXPORT-2 floor PASS | **PASS** |
| V-AC6 | Full Pack validated | **PASS** |
| V-AC7 | Partial Pack validated | **PASS** |
| V-AC8 | Blocked Pack validated | **PASS** |
| V-AC9 | Individual exports remain | **PASS** |
| V-AC10 | External Discoverability PASS or classified | **PASS** (SPE surface); Commercial UX Gap tracked |
| V-AC11 | Architecture fence PASS | **PASS** |
| V-AC12 | tsc + validators / umbrella PASS | **PASS** |
| V-AC13 | Manual smoke evidence captured | **PASS** (static; browser NOT RUN disclosed) |
| V-AC14 | Findings classified | **PASS** |
| V-AC15 | Evidence sufficient for SPE-1.C readiness | **PASS** |
| V-AC16 | Official Record + tip after PASS | **PASS** (this record) |

---

## 10. SPE-1.C readiness

```text
SPE-1.C ENTRY CRITERIA
  SPE-1.1 PASS                         ✓
  SPE-1.2 PASS                         ✓
  Mandatory SPE-1.V evidence PASS      ✓
  No unresolved SPE regression         ✓
  No critical fence violation          ✓
  Deviations classified                ✓
  Commercial UX gaps tracked           ✓ (RD-V02)
  Evidence package complete            ✓

SPE-1.C = READY FOR OWNER AUTHORIZATION
SPE-1.C BUILD = NOT STARTED
```

---

## 11. Commercial Readiness relationship

```text
SPE-1.V STATUS: PASS

SPE-1 functional evidence: PASS (umbrella + Pack Lite + floors)
External Discoverability (SPE surface): PASS (static)
Architecture Fence: PASS
Commercial UX Gap: OPEN (Layout / Product Face before CTR)
Remaining blockers to SPE-1.C: Owner authorization only
Remaining blockers to Commercial Test Ready:
  - SPE-1.C CERTIFIED / CLOSED
  - Layout / Product Face / first-time-user journey (RD-V02)
  - Owner declare PRODUCT 1.0 — COMMERCIAL TEST READY
  - Optional: interactive external walkthrough evidence (RD-V01)
```

**SPE-1.V PASS ≠ Commercial Test Ready.**

---

## 12. Product Master Map percentage update (CTR denominators 1A)

Same denominators as Product Master Map audit (Decision 1A). Prior scored snapshot (pre-1.2): Roadmap 50% (3/6). Post-1.2 mechanical: 4/6 ≈ 67%.

| Metric | After SPE-1.V PASS | Explanation |
|--------|-------------------|-------------|
| Roadmap Completion (SPE spine) | **5/6 ≈ 83%** | SPE-1.V phase unit PASS; SPE-1.C open |
| Architecture Completion (CTR) | **~100%** | Pack glue validated; no CTR-required arch gap inside SPE fence |
| Scientific Capability (CTR) | **~95%** | Pack composition evidenced; no new engines in denominator |
| AI Collaborator (CTR) | **100% gate-scoped** / Stage 3 runtime **0%** | Unchanged |
| Product / UX (CTR) | **~92%** | Pack UX path on SPE surface PASS; global Layout OUT of SPE / still CTR debt |
| Commercial Readiness | **~80%** | SPE-1.V checklist item closed; SPE-1.C + Owner CTR + Layout still open |
| Remaining Distance | **SPE-1.C** (+ Owner CTR declare; Layout dependency) | |

---

## 13. Execution boundary

```text
SPE-1.V PASS / READY FOR SPE-1.C
SPE-1.C BUILD NOT STARTED
SPE-1.C requires separate Owner authorization.
Commercial Test Ready ≠ SPE-1.V PASS
```

---

## 14. Certification gates — SPE-1.V

```text
GATE SPE-1.V  UMBRELLA AUTOMATED                 PASS
GATE SPE-1.V  EXPORT FLOORS                      PASS
GATE SPE-1.V  PACK LITE CONTRACT                 PASS
GATE SPE-1.V  EXTERNAL DISCOVERABILITY (SPE)     PASS
GATE SPE-1.V  ARCHITECTURE FENCE                 PASS
GATE SPE-1.V  EVIDENCE MATRIX COMPLETE           PASS
GATE SPE-1.V  SPE-1.C ENTRY CRITERIA MET         PASS (auth pending)
GATE SPE-1.V  CTR SEPARATION PRESERVED           PASS
SERIES PHASE  SPE-1.V                            PASS
```

---

## 15. Authority cites

- [`../SPE-Planning-Charter.md`](../SPE-Planning-Charter.md)
- [`SPE-1-Planning-Freeze.md`](./SPE-1-Planning-Freeze.md)
- [`SPE-1-E-Entry-Hygiene.md`](./SPE-1-E-Entry-Hygiene.md)
- [`SPE-1.1-Analysis-Workflow-Productization.md`](./SPE-1.1-Analysis-Workflow-Productization.md)
- [`SPE-1.2-Publication-Pack-Lite.md`](./SPE-1.2-Publication-Pack-Lite.md)
- [`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md) · [`../../roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md)

**End of Official Record — SPE-1.V PASS**
