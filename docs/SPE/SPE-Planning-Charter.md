# SPE Planning Charter

**Artifact:** SPE Planning Charter (Scientific Product Expansion)  
**Status:** **IN FORCE / FROZEN**  
**Date:** 2026-08-11  
**Role:** Planning Authority for the SPE-1 Scientific Product Expansion series  
**Nature:** Post-UXC-1 product-capability constitution — does not reopen UXC-10 / UXC-1 certification, PP / Production Approval / Repository Release / PRV / RELEASE / SDC-1 / DEP-2; does not itself implement BUILD beyond SPE-1.0 documentation materialization  
**Path:** `docs/SPE/SPE-Planning-Charter.md`

**Freeze record:** [`official-records/SPE-1-Planning-Freeze.md`](./official-records/SPE-1-Planning-Freeze.md)

---

## Verdict

SPE Planning is the frozen planning authority for **SPE-1 — Scientific Product Expansion**. Strategy **Option B — Balanced** (post-UXC-1 roadmap reassessment) selected SPE-1 as the next official series.

Constitutional motto:

> **Productize existing scientific delivery — do not reopen platform architecture.**

```text
SPE-1 PLANNING FREEZE — MATERIALIZED
  ≠ SPE-1.E / SPE-1.1 / SPE-1.2 BUILD (requires separate Owner authorization)
  ≠ UXC-2 · historical PROD-3 reopen · AIR-1 · ARCH-U
  ≠ EXPORT-3 ZIP manuscript · Marketplace / Lovable · Option C / RLS / G6
  ≠ automatic v1.1 bump / retag of 1.0.0
  ≠ reopen PP / Production Approval / Repository Release / PRV / RELEASE / SDC-1 / DEP-2 / UXC-1
```

**Planning freeze (authority):** [`official-records/SPE-1-Planning-Freeze.md`](./official-records/SPE-1-Planning-Freeze.md) — **PLANNING FREEZE — MATERIALIZED**.  
**Prior Continuity tip (cite-only):** UXC-1 CERTIFIED / CLOSED — tip `605e235` (`docs(uxc): certify UXC-1 closure`).

---

## 1. Executive Summary

SPE-1 productizes the **already-shipped** scientific delivery loop into one certifiable user outcome:

```text
Import / Smart Start
  → Guided Workflow
  → Analysis / Results
  → Scientific Report
  → Publication Pack Lite
       ├── EXPORT-2 Scientific PDF
       └── EXPORT-1 Companion Figure
```

It does **not** invent new analysis engines, ZIP manuscript archives (historical EXPORT-3), AI runtime, architecture unfreeze, or another Continuity series.

**Primary gap closed by SPE-1:** scientific capabilities exist but are unevenly connected for a complete publication-ready journey (`compare-groups` stops at results; exports are separate manual actions; no pack UX).

---

## 2. Immutable inputs

| Element | Value |
|---------|--------|
| Product | Scientific Graph AI |
| Version Identity | **1.0.0** / display **v1.0** |
| Frozen release SHA | `f38cc6ff31c9ec77ae1edca79890df6f041366d2` |
| Tags | **1.0.0** + **v1.0** — **UNTOUCHED** |
| UXC-1 authority tip | `605e2356d26e3e8e9d645a90c2fda428a4473815` |
| RELEASE / PRS / PP0–PP11 | **CLOSED** / **COMPLETE** |
| Production Approval / Repository Release | **GRANTED** / **VERIFIED** · **CLOSED** |
| PRV-1 | **CLOSED · HANDOFF RECORDED** |
| SDC-1 | **CERTIFIED / CLOSED** · eligible for v1.1 (bump **NOT EXECUTED**) |
| DEP-1 / DEP-DECISION-001 / DEP-2 | **FROZEN** · Option B · **CERTIFIED / CLOSED** |
| UXC-1 | **CERTIFIED / CLOSED** |
| Post-UXC strategy | **Option B — Balanced** → SPE-1 next |

---

## 3. Current Product Capability Baseline

| Layer | Exists today | Key locations |
|-------|--------------|---------------|
| Smart Start intents | analyze / compare / evaluate-publication / math / open-project | `src/lib/smart-start/options.ts` |
| Import + ImportReport | csv/xlsx/xls/ods/txt + report UI | `src/lib/import/**`, `ImportReportPanel` |
| Worksheet + VGB | edit series; build figures | `ScientificWorksheetPanel`, `VisualGraphBuilder` |
| Guided workflows | `compare-groups`, `explore-structure`, `evaluate-publication` | `src/lib/scientific/workflow/` |
| Inference / normality | t-test, ANOVA, nonparametric, effect size, canonical normality | `src/lib/scientific/inference/**`, `normality/**` |
| Methodology SCI-50→56, SCI-60 | engines + dashboards | `src/lib/scientific/methodology/**` |
| Comparison SCI-58 | A/B profiles + dashboard + PDF section | `src/lib/scientific/comparison/**` |
| Visibility → PDF policy | toggle-aware sections | `src/lib/scientific/visibility/**`, `report/pdf-section-filter.ts` |
| EXPORT-1 | chart PNG/SVG (+ JSON UI) | `src/app/chartExport.ts` |
| EXPORT-2 | scientific PDF (jsPDF, toggle-aware) | `page.tsx` `exportScientificReportPdf` + report helpers |
| EXPORT-3 ZIP manuscript | **Absent** · historical proposal only | Archive MASTER_ROADMAP_V1; SDC OUT |
| Shell tabs | home · data · analysis · results · reports | `src/app/page.tsx` (orchestration hub) |

**Certified floors reused:** SDC-1 delivery loop (import → ImportReport → EXPORT-1/2); UXC Continuity preserved; DEP hosted local-primary unchanged.

---

## 4. Scientific Workflow Opportunity

### Frozen spine

```text
START: Smart Start → "Evaluar publicación" (or Expert + guided template)
  OR:  Smart Start → "Analizar un dataset" → Guided "Comparar grupos" then bridge to report

STEPS:
  1. Data present (import / project open) — ImportReport available when importing
  2. Guided toggles apply analysis/methodology surfaces (existing engines only)
  3. Results review (interpretation / SCI-56 / SCI-60 as template dictates)
  4. Reports tab with scientific report enabled
  5. Publication Pack Lite: Export PDF (EXPORT-2) + companion figure PNG/SVG (EXPORT-1)

RESULT: Publication-ready scientific deliverables from one guided product journey
```

| Included capability | Role in spine |
|---------------------|---------------|
| `evaluate-publication` template | Primary spine — already ends at Reports + `showScientificReport` |
| `compare-groups` template | Analysis spine — productize bridge from results → report/export |
| Methodology SCI-50→55, 56, 57, 60 | Publication readiness path |
| Inference + normality + effect size | Via `compare-groups` / conditional toggles |
| Visibility + PDF section filter | Correct EXPORT-2 semantics |
| EXPORT-1 + EXPORT-2 | Publication Pack Lite outputs |

| Explicitly not the SPE spine | Why |
|------------------------------|-----|
| `explore-structure` / SCI-40 multivariate | Valid existing path; **regression-only**, not SPE DoD spine |
| Math-graph constructor | Graph product, not analysis→publication spine |
| SCI-58 multi-dataset comparison | Optional enrichment; **not mandatory** SPE DoD |
| New stats / new engines | Invention — forbidden |
| Full EXPORT-3 ZIP | Historical proposal; unjustified for SPE-1 |

**Productization targets:** workflow continuity into Reports/export for `compare-groups`; discoverable pack completion (PDF + companion figure); composed validation of the end-to-end spine; minimal report/pack UX clarity **without** Session/Window/Dock redesign.

---

## 5. Charter

### Purpose

Deliver a certifiable **Scientific Product Expansion** increment that turns existing scientific + export foundations into one coherent publication-ready user workflow.

### Strategic rationale

Post-UXC-1, architecture and Continuity are closed. Highest value is **scientific-user depth via productization**, not UXC-2, PROD-3 reopen, AIR-1, or ARCH-U.

### Objective

1. Productize analysis → results → report continuity (SPE-1.1).  
2. Deliver scoped Publication Pack Lite on EXPORT-1/2 (SPE-1.2).  
3. Certify with measurable validators + smoke.  
4. Absorb only SPE-blocking hygiene (SPE-1.E).

### Scope (IN — scope freeze)

- Guided workflow productization for **`evaluate-publication`** and **`compare-groups` → report/export bridge**
- Existing scientific surfaces required by those templates (descriptive, normality, inference, effect size, advisor/interpretation, SCI-50→57, SCI-56, SCI-60, scientific report)
- Visibility/PDF policy correctness for included sections
- Publication Pack Lite: coherent UX/path to **scientific PDF + companion chart PNG/SVG** (and documented pack semantics)
- SPE-critical validator floor + composed SPE umbrella
- Docs: Charter, Freeze record, Official Record at close; live status/roadmap next-program sync at planning materialization

### Non-goals (OUT — scope freeze)

- AIR-1 · ARCH-U · Window/Dock/Layout redesign · Session contract mutation  
- COLLAB CRDT/realtime · PLUGINS loading · Marketplace/Lovable · Option C · RLS/G6  
- Historical PROD-3 reopen · UXC-2 · retag 1.0.0 · automatic v1.1 bump  
- Full historical **EXPORT-3 ZIP manuscript package**  
- New analysis engines, SCI-40 spine as SPE DoD, mandatory SCI-58  
- Full OBS-1 campaign (UX validator noise, VGB unit scatter debt unless SPE-blocking)  
- Recharts interior redesign · D47 unfreeze · IndexedDB / `.sgproj` schema changes  

### Entry criteria

- UXC-1 CERTIFIED / CLOSED on tip `605e235` (or successor Owner-approved tip)  
- Working tree clean; Owner authorizes SPE-1 planning materialization then later BUILD  
- This Charter + Planning Freeze **IN FORCE**  
- Architecture / governance fences accepted  

### Exit criteria

- SPE-1.0…SPE-1.C all PASS  
- Frozen DoD met; validators PASS; architecture fence held  
- Official Record **SPE-1 CERTIFIED / CLOSED**  
- Residuals disclosed; handoffs recorded  
- Version recommendation recorded; bump **NOT** auto-executed  

---

## 6. Workstreams

### W0 — Plan Freeze / Charter (SPE-1.0)

- **Objective:** Lock purpose, IN/OUT, phases, gates.  
- **Included:** This charter + freeze record + status pointer sync (docs-only).  
- **Excluded:** Any product BUILD.  
- **Dependencies:** Post-UXC reassessment Option B.  
- **Deliverable:** `docs/SPE/` Charter + Planning Freeze Official Record.  
- **Validation:** GATE SPE-1.0 — documents present, fences explicit, IN/OUT frozen.

### W1 — Entry Hygiene Lite (SPE-1.E)

- **Objective:** Ensure SPE-critical validators are green **before** productization BUILD; do not become OBS-1.  
- **Included:** Inventory + fix **only** failures among SPE-critical set (below).  
- **Excluded:** `validate:ux-2.*`, `validate:ux-9.*`, `validate:workspace-architecture`, non-blocking `validate:visual-graph-builder-unit` scatter/API-freeze debt → **OBS-1 residual**.  
- **Dependencies:** SPE-1.0 frozen.  
- **Deliverable:** SPE-critical floor PASS evidence (or empty gap list).  
- **Validation:** SPE-1.E checklist — only SPE-critical commands.

**SPE-critical validator set (frozen):**

- `validate:workflow-unit`
- `validate:methodology-unit` (or f5a–f5e)
- `validate:comparison-unit` (regression; SCI-58 not mandatory DoD)
- `validate:visibility-unit`
- `validate:export1-chart-export-unit` · `validate:export1-d42-2-testing`
- `validate:export2-pdf-toggle-unit` · `validate:export2-d44-3-testing`
- `validate:smart-start-unit`
- `validate-prod1-gate`
- `validate:engine-import-export-unit`
- `npx tsc --noEmit`

### W2 — Analysis Workflow Productization (SPE-1.1)

- **Objective:** One coherent guided scientific journey ending ready for publication output.  
- **Included:** Smart Start → `evaluate-publication` continuity; `compare-groups` bridge **results → Reports / scientific report / export affordance**; existing toggles/engines only.  
- **Excluded:** `explore-structure` as DoD; new inference methods; SessionRestore chrome; Window model; AIR.  
- **Dependencies:** SPE-1.E floor green (or documented empty).  
- **Expected deliverable:** Productized workflow continuity + unit/smoke evidence for spine.  
- **Validation:** workflow-unit · methodology-unit · smart-start-unit · composed SPE smoke for guided path.

**User contract (SPE-1.1):**

- **Starts with:** dataset imported or project open + guided template start.  
- **Transforms:** existing visibility/toggle applications per template.  
- **Produces:** visible analysis/results + scientific report enabled (or one-step affordance to enable + navigate).  
- **UI surfaces:** Smart Start, Guided Workflow, Analysis/Results/Reports tabs — **no shell redesign**.  
- **Architecture reused:** `src/lib/scientific/workflow|methodology|inference|normality|visibility`, existing page orchestration.  
- **New code (allowed types only):** thin productization glue — **not** new engines.

### W3 — Publication Pack Lite (SPE-1.2)

- **Objective:** Scoped **Publication Pack Lite** — not historical EXPORT-3 ZIP.  
- **Included:** EXPORT-2 scientific PDF + EXPORT-1 companion figure (PNG and/or SVG); discoverable pack path from Reports; toggle-aware PDF semantics; pack semantics documented.  
- **Excluded:** ZIP/manuscript multi-artifact archive; marketplace publish; new PDF engines; Recharts contract changes; mandatory JSON chart export as pack core.  
- **Dependencies:** SPE-1.1 spine reaches Reports with scientific report.  
- **Expected deliverable:** Pack UX/path + EXPORT-1/2 regression intact + pack smoke.  
- **Validation:** export1-* · export2-* · visibility/PDF filter · SPE pack smoke.

### W4 — Validation Umbrella (SPE-1.V)

- **Objective:** Objective answer: workflow works · outputs preserve semantics · no arch drift · SDC/UXC floors intact.  
- **Deliverable:** SPE umbrella script or documented composed gate + evidence table.  
- **Validation:** All SPE-critical + SPE-specific smoke PASS; OBS residuals classified.

### W5 — Series Certification (SPE-1.C)

- **Objective:** Official Record close.  
- **Deliverable:** `docs/SPE/official-records/SPE-1-Scientific-Product-Expansion.md` · handoffs · version recommendation.  
- **Validation:** GATE SPE-1.C checklist complete.

---

## 7. Phase structure

```text
SPE-1 — Scientific Product Expansion
  ├── SPE-1.0  Plan Freeze / Charter
  ├── SPE-1.E  Entry Hygiene Lite (SPE-critical only)
  ├── SPE-1.1  Analysis Workflow Productization
  ├── SPE-1.2  Publication Pack Lite (EXPORT-1 + EXPORT-2)
  ├── SPE-1.V  Validation Umbrella + Smoke
  └── SPE-1.C  Series Certification
```

No additional microphases. Build order: `0 → E → 1.1 → 1.2 → V → C`.

---

## 8. Architecture Boundaries

| May change (within SPE) | Frozen / forbidden |
|-------------------------|-------------------|
| Guided workflow step continuity / navigation affordances | D47 / Session dirty-autosave contracts |
| Reports pack entry UX (presentation, copy, affordances) | Window/Dock/Layout model redesign |
| Thin glue to compose existing export handlers | Recharts interior plot contracts |
| Docs under `docs/SPE/`, live status/roadmap next-program pointers | Visibility/Command **schema** redesign |
| Optional extract of report-pack helpers **only if** no domain boundary break | AI runtime · plugins loader · collab realtime |
| | IndexedDB / `.sgproj` schemaVersion floor changes |
| | Retag / amend 1.0.0 history · force-push |
| | ARCH-U · historical PROD-3 reopen · UXC-2 |

**Fence motto:** Productize existing scientific delivery — do not reopen platform architecture.

---

## 9. Validation Strategy

| Gate | Evidence required |
|------|-------------------|
| SPE-1.0 | Charter + Freeze IN FORCE; IN/OUT explicit |
| SPE-1.E | SPE-critical set PASS (or empty remediation list) |
| SPE-1.1 | workflow + methodology + smart-start + spine smoke (guided path → Reports/report on) |
| SPE-1.2 | export1 + export2 + pack smoke (PDF + companion figure path) |
| SPE-1.V | Composed umbrella; `tsc --noEmit`; SDC-relevant floors (`validate-prod1-gate`, engine-import-export); no SPE regression vs UXC Continuity surfaces used |
| Arch fence | Diff review: no forbidden contract areas |
| Manual smoke | Guided evaluate-publication → PDF; compare-groups → report/export bridge; pack files produced |

**Measurable questions:**

- Does the scientific workflow complete? → spine smoke PASS  
- Are scientific outputs correct? → methodology/workflow/comparison unit PASS  
- Does publication pack preserve semantics? → export2 toggle filter + export1 unit PASS  
- Graph/export contracts preserved? → export floors + no Recharts/engine contract edits  
- UXC/SDC floors? → selected Continuity/delivery validators PASS  
- Architectural drift? → fence checklist PASS  

---

## 10. Certification Strategy

SPE-1 is **CERTIFIED / CLOSED** only when all hold:

1. Scope freeze unchanged (IN/OUT)  
2. Implementation DoD: SPE-1.1 spine + SPE-1.2 Pack Lite delivered  
3. SPE-1.V umbrella PASS  
4. Architecture fence compliance documented  
5. Docs: Charter preserved · Official Record published · PROJECT_STATUS/ROADMAP live tip updated  
6. Residual debt disclosed (OBS residual, optional SCI-58, explore-structure, full EXPORT-3 ZIP)  
7. Handoffs recorded (§11)  
8. Version recommendation recorded; bump/tag/deploy **not** performed by SPE-1 unless separate Owner decision  

**≠** reopen UXC/SDC/DEP/PP/RELEASE bodies.

---

## 11. Deferred / Handoff Items

| Item | Disposition |
|------|-------------|
| OBS-1 residual (UX validators, VGB unit scatter debt, etc.) | Queued peer — **not** SPE main scope |
| AIR-1 | Later |
| ARCH-U | Deferred |
| COLLAB realtime / CRDT | OUT / Future Work (FR-08) |
| PLUGINS loading | OUT / Future Work (FR-07) |
| Full EXPORT-3 ZIP manuscript | Deferred deeper export — **beyond** Pack Lite |
| Marketplace / Lovable / Option C / RLS / G6 | Owner decisions |
| v1.1.x bump / tag / deploy | Owner decision after SPE-1 close (recommendation only) |
| SCI-40 explore-structure productization | Future SPE or separate series |
| Mandatory SCI-58 pack inclusion | Optional future enrichment |

---

## 12. Versioning

```text
SPE-1 does NOT automatically bump or retag v1.0.0.
package.json / tags 1.0.0 + v1.0 remain untouched by SPE planning and by SPE BUILD unless a separate Owner decision authorizes a v1.1.x line.
Any v1.1.x bump / tag / deploy is a separate Owner decision after SPE-1 certification.
```

Recommended version line at SPE-1 close (acknowledgment only): **v1.1.x** if the delivered capability justifies an additive product increment — **execution NOT part of SPE-1 by default**.

---

## 13. Authority cites

- [`official-records/SPE-1-Planning-Freeze.md`](./official-records/SPE-1-Planning-Freeze.md)
- [`../UXC/official-records/UXC-1-UX-Continuity-Certification.md`](../UXC/official-records/UXC-1-UX-Continuity-Certification.md)
- [`../SDC/official-records/SDC-1-Scientific-Delivery-Continuity.md`](../SDC/official-records/SDC-1-Scientific-Delivery-Continuity.md)
- [`../DEP/official-records/DEP-2-Hosted-Deployment-Execution.md`](../DEP/official-records/DEP-2-Hosted-Deployment-Execution.md)
- [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../roadmaps/ROADMAP.md`](../roadmaps/ROADMAP.md)

**End of SPE Planning Charter — IN FORCE / FROZEN**
