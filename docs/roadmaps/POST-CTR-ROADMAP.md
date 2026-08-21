# Post-CTR Roadmap Reorganization

**Date:** 2026-08-18  
**Historical Status:** **SUPERSEDED AS LIVING-NEXT AUTHORITY ON 2026-08-21**
**Nature when authored:** PLAN-ONLY / DOCUMENTATION-ONLY — **NO `src/**` · NO BUILD · NO new product series OPEN · NO SemVer bump · NO CRP reopen · NO CTR reopen**
**Baseline:** Scientific Graph AI **v1.0.0** / display **v1.0** · CTR checkpoint `2db7b4b`  
**Authority:** Living SSOT [`ROADMAP.md`](./ROADMAP.md)

## Supersession Notice

The `NEXT SERIES = PENDING OWNER DECISION` language below is preserved as historically correct for 2026-08-18.

On 2026-08-21 the Product Owner completed Product Reorganization, closed PD-01–PD-07, accepted the certified route and authorized:

```text
NEXT AUTHORIZED SERIES = PR0-A → PR6-A
IMPLEMENTATION ENTRY = PR0-A
```

Current authority:

- [Living Roadmap](./ROADMAP.md)
- [Product Reorganization Baseline](../PRODUCT/official-records/PRODUCT-REORGANIZATION-BASELINE.md)
- [Detailed Implementation Roadmap](./PRODUCT-REORGANIZATION-DETAILED-IMPLEMENTATION-ROADMAP.md)
- [Final Roadmap Certification](../PRODUCT/official-records/FINAL-ROADMAP-CERTIFICATION.md)

This notice does not rewrite the historical candidate analysis that follows.

```text
POST-CTR ROADMAP                   = REORGANIZED
NEXT SERIES                        = PENDING OWNER DECISION
≠ EXECUTION READY
≠ series OPEN
≠ CRP CLOSED
≠ CTR reopened
≠ SemVer 1.1
≠ D71 · CRP-6.4 implementation · Phase 3 · AIR-1 · Cloud · Auth
```

This file is the post-CTR **planning artifact**. It does **not** author living next. Living next is authored only in [`ROADMAP.md`](./ROADMAP.md).

**Trace:** CTR DECLARATION COMPLETE → this PLAN. SPE-1.C **EXTERNAL COMMERCIAL TEST** remains **operational**, not an implementation series.

---

## 1. What this plan changes

CTR closed the **1.0 Commercial Test** checkpoint. It did **not** close the product, the domain roadmap, or CRP as an index.

After CTR, the living roadmap stops treating “what is next” as a CRP Product Face continuation (`Análisis → Resultados → Avanzadas`, Phase 3, CRP-6.4). It restores two layers:

| Layer | Role |
|-------|------|
| **CERTIFIED BASELINE** | Scientific Graph AI **1.0.0** · **CTR DECLARED** · **CTR CERTIFIED WITH EXPLICIT DISCLOSURES** |
| **POST-CTR PRODUCT DEVELOPMENT** | Future work for planning only — not opened, not executed by this record |

MASTER ROADMAP V2 remains the **domain-architecture constitution** (cite-only). It is **not** the living “what is next” file and is **not** rewritten here.

---

## 2. Certified Baseline (closed — do not reopen)

| Item | State | Cite |
|------|--------|------|
| Version | **1.0.0** / tags `1.0.0` + `v1.0` | `package.json` · PP11 |
| Release | **RELEASED / VERIFIED** | PP11 |
| GRC | **CERTIFIED WITH EXPLICIT WARNINGS** | GRC-DECISION-002 **IN FORCE** |
| SPE-1 | **CERTIFIED / CLOSED** | `docs/SPE/official-records/SPE-1-Series-Closure.md` |
| Product Face / CRP execution | Records **PASS / CLOSED / FINAL** through CRP-6.3-SHELL | `docs/CRP/official-records/` |
| CTR | **DECLARED** · **CERTIFIED WITH EXPLICIT DISCLOSURES** | `CRP-CTR-Declaration.md` |
| Owner Gate | **ACCEPTED WITH DISCLOSURES** | `CRP-CTR-Owner-Certification.md` |
| Product status | **PRODUCT 1.0 — COMMERCIAL TEST READY** | Owner Gate |
| DEP-2 | **CERTIFIED / CLOSED** (disclosures) | G6 **OUT** · cloud **NOT CERTIFIED** · RLS **DEFERRED** |
| CRP program | **OPEN** as **index** only | not CLOSED; not a living execution series |

CTR chain (complete — **do not reopen**):

```text
PLAN CTR READINESS ASSESSMENT
  → BUILD CTR ENTRY CERTIFICATION
  → PRODUCT FACE REVIEW
  → OWNER ACCEPTANCE WITH DISCLOSURES
  → CTR DECLARATION
```

Historical PROD-2B/2C/2D/2E, SCI, RELEASE, PRV, SDC, DEP, UXC remain **CLOSED / CERTIFIED** as already recorded. This plan does **not** convert those closures into future work.

---

## 3. CTR is a boundary

CTR certifies **Commercial Test readiness of 1.0**. It does **not** mean:

- the product is finished;
- the roadmap is finished;
- every domain is complete as a product capability;
- every commercial capability is implemented;
- Cloud, AIR-1, COLLAB realtime, PLUGINS loading, or v1.1 are certified.

Disclosures **IN FORCE** (unchanged):

| Item | Status |
|------|--------|
| Auth CTAs | Authentication entry only · not cloud certification |
| Cloud copy (`biblioteca en nube`) | Accepted with **DEP-2 disclosures** · Cloud **NOT CERTIFIED** |
| Scientific Assistant | **Beta** only · AIR-1 **DEFERRED / NOT CERTIFIED** |
| RLS | **DEFERRED** |
| G6 | **OUT** |

---

## 4. Commercial Test context

| Mode | Meaning | This plan |
|------|---------|-----------|
| **Commercial Test readiness** | Already certified (CTR) | Preserve |
| **Commercial Test learning** | Observe real use under SPE-1.C **EXTERNAL COMMERCIAL TEST** | Operational; not a BUILD series |
| **Product development** | Possible later series, after Owner decision and/or test learning | Candidates only |

Hypothetical feedback is **not** implementation scope.

---

## 5. Product Surface Status

Surfaces are **user-visible**. Certified presentation ≠ remaining domain work. Visible Home tiles do **not** auto-authorize a series.

| Surface | Current state | Certified as | Partial / remaining | Classification | Post-CTR priority |
|---------|---------------|--------------|---------------------|----------------|-------------------|
| **Inicio / Home** | Icon launcher + objective · CRP-6.3 / 6.3.x | Product Face **PASS / FINAL** | Typography deferred (CRP-6.3); brand-mark identity deferred (6.3.x) | Certified baseline; residual presentation **not** a series | **Low** as series |
| **Datos** | Screen 2 worksheet workspace · CRP-6.2.2 **CLOSED** | Screen 2 ownership **PASS** | Importar destination is **not** this screen | Certified baseline | **Not** next by visibility |
| **Importar** | Import + ImportReport exist (SDC/SPE spine: csv/xlsx/xls/ods/txt) | Delivery loop floor **certified** | CRP-6.4 destination architecture = **PLAN ONLY / NOT AUTHORIZED** | Capability exists; architecture audit **deferred as execution** | Candidate **track**, not OPEN |
| **Comparar** | Home discovers → Datos capture; review in Resultados | CRP-6.2.2 P1/P4 + SPE-1.1 `compare-groups` | Live two-slot click was not re-run at 6.2.2 close (not CTR debt) | Certified path; not a new series | Observe in Commercial Test |
| **Crear gráfico** | Home → Datos/curvas · VGB / PROD-2E **CLOSED** | GRAPH/DATA-3B certified | Not a missing 1.0 tab | Certified baseline | **Low** as series |
| **Analizar** | Home → Análisis workspace | SPE-1.1 + CRP-6.3-SHELL Phase 1 | Phase 3 sidebar chrome = **OPTIONAL / BLOCKED / NOT DEBT** | Certified journey; Phase 3 **not** debt | **Do not** open Phase 3 |
| **Análisis** (tab) | Stage-aware shell; engines SCI/inference present | Shell Phase 1 **CLOSED** · SPE analysis spine **PASS** | Deeper workflows beyond SPE-1 IN-scope = future productization | Surface certified; engine **depth** is domain work | Candidate only if chartered |
| **Resultados** | Chart + **Ir a Reportes** | SHELL Phase 2 **CLOSED** | Pack lives in Reportes (by design) | Certified continuity | **Not** a standalone series |
| **Reportes** | Pack Lite · EXPORT-1/2 | SPE-1.2 **PASS** | EXPORT-3 ZIP **DEFERRED** | Certified Pack Lite | EXPORT-3 stays deferred |
| **Evaluar / Publicar** | Home → Análisis/Reportes · `evaluate-publication` | SPE-1 spine **PASS** | Packaging/marketplace **Owner optional** | Certified journey | Marketplace ≠ this surface |
| **Avanzadas** | Home gateway, sixth entry, lower weight | CRP-6.3 navigation freeze | Must **not** become inventory of AI/Engine/Plugins | Gateway only | **Do not** promote to series |

**Rule:** do not open a series because a tile or tab is visible.

---

## 6. Domain Status

Peer certifications below are the **1.0 baseline**. They are **not** a ranking of post-CTR execution.

| Domain | 1.0 baseline | Product remaining (not opened) |
|--------|----------------|--------------------------------|
| **UX / Product Face** | CRP-6.1…6.3-SHELL **closed as indexed** · CTR face **PASS WITH OBSERVATIONS** | Phase 3 **NOT DEBT**; ARCH-U **NOT ACTIVE**; typography deferred |
| **ENGINE** | **RELEASE CERTIFIED** (FR-01 **CLOSED**) · PROD-2E GRAPH **CLOSED** · SCI engines validated | New engines **OUT** of SPE-1; evolution needs a future charter |
| **DATA** | **RELEASE CERTIFIED** · PROD-2B/2C persistence **COMPLETED** · DATA-3A/3B **CLOSED** | Import destination architecture (CRP-6.4) PLAN ONLY; schema unfreeze = ARCH-U |
| **AI** | **RELEASE CERTIFIED** · AI-I0…I10 **CLOSED** · skeletons in `src/ai/` | Runtime intelligence **NOT IMPLEMENTED** · AIR-1 **DEFERRED / NOT CERTIFIED** |
| **COLLAB** | Peer-certified · realtime/CRDT **DEFERRED / OUT** (PP Issues Registry) | Not a CTR residual |
| **PLUGINS** | Peer-certified · loading/execution **DEFERRED** | Not a CTR residual |
| **PERFORMANCE** | **RELEASE CERTIFIED** (conditionality disclosed · FR-09 **CLOSED**) | Hardening optional; not forced by CTR |
| **RELEASE** | Series **CLOSED** · PP11 **VERIFIED** · DEP-2 hosted **CLOSED** with disclosures | Marketplace/Lovable **NOT EXECUTED — EVIDENCE GAP** · v1.1 **NOT EXECUTED** |

Sessions / Windows / Tabs: D65–D70 are **historical infrastructure RELEASED**. Auto-restore UI and **D71** (history / undo / versioning) remain **not authorized**. Do **not** open D71 from this plan.

---

## 7. Deferred / Protected Scope

These stay deferred. Listing them is **not** creating debt.

| Item | Why protected |
|------|----------------|
| Cloud / Option C / RLS / G6 | DEP-2 disclosures · Owner Gate |
| AIR-1 / AI runtime | Owner Beta disclosure · SPE/SDC **NOT AUTHORIZED** |
| Auth implementation | CTAs = entry only |
| ARCH-U / Window-Dock-Layout **model** | CRP-4 fences · SPE OUT |
| Session contract mutation / D71 | Infra complete through D70; product restore UI OUT of CTR |
| COLLAB realtime / CRDT | PP **OUT OF SCOPE** / **DEFERRED** |
| PLUGINS loading | PP **DEFERRED** |
| EXPORT-3 ZIP | Beyond Pack Lite · SPE/SDC OUT |
| Marketplace / Lovable publish | **EVIDENCE GAP** · Owner optional |
| Phase 3 (sidebar Análisis / Nuevo gráfico / Vaciar curvas) | **OPTIONAL / BLOCKED / NOT DEBT** |
| CRP-6.4 implementation | **PLAN ONLY / NOT AUTHORIZED** |
| v1.1 SemVer bump | Eligible (SDC/UXC) · **NOT EXECUTED** · not automatic |
| OBS-1 full campaign | Peer queue · not absorbed by SPE-1.E |
| Historical PROD-3 reopen | **RETIRED** as living next |
| UXC-2 | **Not invented** |

---

## 8. Product Surface vs Domain Roadmap

```text
PRODUCT SURFACE (what the user sees)
  Home · Datos · Importar · Comparar · Crear gráfico
  Analizar · Análisis · Resultados · Reportes · Avanzadas

DOMAIN ROADMAP (what makes surfaces true)
  UX        → presentation / navigation (certified 1.0 face)
  DATA      → datasets, import, worksheet, persistence
  ENGINE    → workflows, graph, scientific orchestration
  AI        → runtime intelligence (not certified; Beta chrome only)
  COLLAB    → shared workflows (realtime deferred)
  PLUGINS   → extensibility (loading deferred)
  PERFORMANCE → scale / diagnostics
  RELEASE   → version, deploy, packaging
```

Relations (planning, not execution):

- **Datos / Importar / Comparar / Crear gráfico** consume **DATA** + **ENGINE** (worksheet, VGB, comparison capture).
- **Análisis / Resultados / Evaluar** consume **ENGINE** scientific workflows already productized by **SPE-1** for the publication spine.
- **Reportes** consume **ENGINE** export floors (EXPORT-1/2) certified by **SPE-1.2**.
- **Avanzadas** is a **UX gateway**, not a domain.
- **AI / COLLAB / PLUGINS** must not be scheduled from Home tiles.

Developing a screen before its domain foundation is forbidden. The 1.0 surfaces above already have certified foundations for the Commercial Test journey. Remaining gaps are **depth**, **deferred architecture**, or **uncertified domains** — not missing tabs.

---

## 9. Dependency Map

```text
                    ┌──────────── RELEASE / DEP-2 (closed, disclosures) ────────────┐
                    │ packaging / marketplace / v1.1 = Owner-optional, independent │
                    └──────────────────────────────────────────────────────────────┘

DATA (certified floor)
  ├── Import pipeline (exists) ──┐
  ├── Worksheet / VGB            ├── ENGINE workflows (certified spine)
  └── Comparison capture         │     ├── Análisis surface
                                 │     ├── Resultados surface
                                 │     └── Reportes / Pack Lite
                                 └── CRP-6.4 import *destination* (PLAN ONLY)

ENGINE (certified)
  ├── existing SCI / GRAPH / inference   → no new engines without charter
  └── SPE-1 spine                        → do not reopen SPE-1

UX / Product Face (certified)
  └── Phase 3 / ARCH-U / D71             → protected; independent of Commercial Test

Sessions (D65–D70 infra RELEASED)
  └── D71 / auto-restore UI              → DEFERRED; not a product-surface prerequisite

AI skeletons (certified) ──✗── AIR-1 runtime     DEFERRED
COLLAB peer ──────────────✗── realtime           DEFERRED
PLUGINS peer ─────────────✗── loading            DEFERRED
PERFORMANCE (certified) ───   hardening          independent / optional
```

**Independent of a new product series:** EXTERNAL COMMERCIAL TEST (operational); marketplace/Lovable (Owner); 1.0.x hygiene/OBS-1 (Owner); SemVer bump (Owner).

---

## 10. Versioning (no bump)

```text
SemVer = 1.0.0 (unchanged)
```

Post-CTR structure:

| Pattern | Use now? |
|---------|----------|
| **Domain series** (new charter when Owner picks) | Yes — planning shape |
| **Post-CTR iteration** on 1.0 baseline | Yes — default until Owner picks series **and** bump |
| **1.0.x hardening** | Candidate track, not automatic |
| **1.1 planning** | Eligible historically (SDC/UXC) · **not** opened · requires Owner |

This PLAN does **not** create 1.1.0 and does **not** treat CTR as a release identity change (`≠ CTR RELEASED`).

---

## 11. Candidate Next Series

None of the following is **OPEN** or **EXECUTION READY**. Comparison only.

| Candidate | Product value | Dependencies | Risk | Maturity | Commercial Test impact | Architecture impact | Continuity | Effort | Verdict |
|-----------|---------------|--------------|------|----------|------------------------|---------------------|------------|--------|---------|
| **EXTERNAL COMMERCIAL TEST** | Learn from certified 1.0 | None (operational) | Low | SPE-1.C already names it | Direct | None | Highest | Low (ops) | **Operational successor** — not a series |
| **Scientific productization successor** (unnamed; not SPE-1 reopen) | Deepen remaining workflows beyond SPE-1 IN-scope | ENGINE/DATA floors exist; needs **new charter** | Medium (scope creep into new engines) | High floors; **no charter** | Indirect | Must keep ARCH-U frozen | Continues SPE motto | Medium–high | **Candidate** — not declared |
| **DATA / Import destination (CRP-6.4)** | Clearer Importar vs Datos | Import already exists | Medium (false “next” from a visible tile) | PLAN ONLY, no execution record | Low for CTR (already ready) | Destination architecture only | CRP leftover, not domain vision | Medium | Remain **PLAN ONLY** until Owner |
| **ANALYSIS / RESULTS / ADVANCED as series names** | Looks like product | Surfaces already certified | High (planning-by-tab) | High as **surface**, low as **new series** | None required | Collapses domain roadmap | Breaks §7.E | — | **Reject as next series names** |
| **ENGINE evolution / new engines** | Capability growth | Charter + scientific design | High | Baseline certified | Indirect | High | Valid later | High | **Later candidate** |
| **AIR-1** | Runtime AI | Explicitly deferred | High (violates Owner disclosure) | Skeletons only | Would over-claim Beta | High | Forbidden now | High | **DEFERRED** |
| **COLLAB / PLUGINS** | Platform | Deferred in PP | High / premature | Peer only | None | High | Future Work | High | **DEFERRED** |
| **PERFORMANCE hardening** | Quality | Independent | Low | Certified with conditionality | Weak | Low | Optional | Medium | **Candidate track** |
| **RELEASE / 1.0.x / marketplace** | Distribution | Owner packaging decisions | Medium (evidence gap) | DEP-2 closed | Indirect | Low–med | Orthogonal | Medium | Owner-optional; **≠** product series |
| **OBS-1 / D71** | Hygiene / session UX | Infra exists | Medium (reopen historical Dxx) | Residuals known | None | Session/validator | Not product vision | Medium | **DEFERRED** as living next |
| **v1.1 series** | Version line | Owner bump | Premature without test learning | Eligible, not executed | None until bump | Release identity | SDC/UXC noted eligibility | — | **Not automatic** |

**Why no single series is declared:** several tracks are valid; SPE-1.C forbids inventing Stage 4 content at SPE close and points to **external test after CTR**; CRP leftovers (Phase 3, CRP-6.4) are explicitly **not** living next; choosing Análisis/Resultados/Avanzadas would violate domain coherence and “no series because a screen is visible.”

---

## 12. Recommended Next Series

**None declared.**

```text
RECOMMENDED NEXT SERIES = NOT DECLARED
POST-CTR ROADMAP        = REORGANIZED
NEXT SERIES             = PENDING OWNER DECISION
```

If the Owner must rank without waiting:

1. Keep **EXTERNAL COMMERCIAL TEST** as the operational activity (SPE-1.C).
2. Do **not** open Phase 3, CRP-6.4 implementation, D71, AIR-1, Cloud, Auth, COLLAB, PLUGINS, or v1.1 by default.
3. If a **product** series is required, first authorize a **planning charter / freeze** (not BUILD) for one domain-coherent program — not a tab name. The only candidate with both certified floors and SPE continuity is a **new** scientific productization charter (name TBD). That charter does **not** exist yet → it stays a **candidate**.

---

## 13. Living next (this PLAN’s output)

Authored in [`ROADMAP.md`](./ROADMAP.md) only:

```text
POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION
OPERATIONAL: EXTERNAL COMMERCIAL TEST (SPE-1.C; not an implementation series)
```

Not authorized by this PLAN: series OPEN · EXECUTION READY · D71 · CRP-6.4 implementation · Phase 3 · AIR-1 · Cloud · Auth · COLLAB · PLUGINS · EXPORT-3 · v1.1 bump.

---

## 14. Freeze

- `src/**` — not modified
- validators / `package.json` / SemVer **1.0.0** — not modified
- SPE-1.C / DEP-2 / CTR Declaration / CRP-6.x bodies — not rewritten
- No commit in this PLAN
