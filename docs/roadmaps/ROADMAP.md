# Scientific Graph AI — Roadmap

**Actualizado:** 2026-08-18 (this file is the **sole living SSOT** for “what is next”; CRP OPEN as index; CTR **DECLARED** · **CTR CERTIFIED WITH EXPLICIT DISCLOSURES**; `PRODUCT 1.0 — COMMERCIAL TEST READY`; **POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION**; SemVer 1.0.0)

---

## Certified authority status (live)

| Element | Value |
|---------|--------|
| Product | Scientific Graph AI |
| Version Identity | **1.0.0** / display **v1.0** |
| Current Release | **v1.0.0** — **RELEASED / VERIFIED** (PP11) |
| Release checkpoint | `f38cc6f` (release identity; tags untouched by SDC) |
| Global Release Certification | **CERTIFIED WITH EXPLICIT WARNINGS** — GRC-DECISION-002 **IN FORCE** |
| Certified baseline (GRC) | `cace2820fa2f2a24c608eedf13f827b635198a0b` |
| RELEASE Series | **CLOSED** |
| PRS | **RELEASE-CERTIFIED** · **CLOSED** |
| PRS-P0 | **NOT APPLICABLE** |
| Previous program | **Production Readiness (PP)** — **PP0…PP11 COMPLETE** |
| Post-Release (PRV-1) | **CLOSED · HANDOFF RECORDED** |
| Current PRV phase | **PRV-1.4 PASS** |
| Post-PRV program (SDC-1) | **CERTIFIED / CLOSED** |
| SDC eligibility | **eligible for v1.1** (bump **NOT EXECUTED**) |
| DEP program (DEP-1) | **FROZEN / IN FORCE** |
| DEP-2 | **CERTIFIED / CLOSED** (with disclosures) |
| DEP-DECISION-001 | **IN FORCE** (Option B) |
| Next authorized DEP step | **None** — Option C / cloud-RLS / marketplace / Lovable = separate Owner decisions |
| DEP host / revision / profile | **Vercel** · tags **`1.0.0` / `v1.0`** (`f38cc6f…`) · Option B · G6 **OUT** |
| UXC program (UXC-1) | **CERTIFIED / CLOSED** — see `docs/UXC/official-records/UXC-1-UX-Continuity-Certification.md` |
| UXC tip | `836a015` (series close; planning tip `b75fa84`; certify `605e235`) |
| UXC-1.V | **PASS** |
| Next authorized UXC step | **None** — series closed |
| Recommended version line (UXC) | **v1.1.x** (acknowledged; bump **NOT EXECUTED**) |
| SPE program (SPE-1) | **CERTIFIED / CLOSED** — see `docs/SPE/official-records/SPE-1-Series-Closure.md` |
| SPE Planning Charter | **IN FORCE / FROZEN** — `docs/SPE/SPE-Planning-Charter.md` |
| SPE-1.E | **PASS** |
| SPE-1.1 | **PASS** (compare-groups → Reports bridge) |
| SPE-1.2 | **PASS** (Publication Pack Lite) |
| SPE-1.V | **PASS** (Validation Umbrella + Evidence) |
| SPE-1.C | **PASS** (Series Certification) |
| Next authorized SPE step | **None** — series closed |
| CRP program | **OPEN** — `docs/CRP/official-records/` · CRP-0…6 **PASS** · CRP-6.2.2 Screen 2 **CLOSED** · CRP-6.3 Home **PASS** · CRP-6.3.x **FINAL** · CRP-6.3-SHELL **CLOSED** |
| CTR (Commercial Test Ready) | **CTR DECLARED** · **CTR CERTIFIED WITH EXPLICIT DISCLOSURES** — `PRODUCT 1.0 — COMMERCIAL TEST READY` — Owner Gate **ACCEPTED WITH DISCLOSURES** — `docs/CRP/official-records/CRP-CTR-Declaration.md` |
| Next program | **Living next authored only here:** **POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION**. Plan: `docs/roadmaps/POST-CTR-ROADMAP.md`. SPE-1.C **EXTERNAL COMMERCIAL TEST** = operational (not an implementation series). No product series OPEN. CRP-6.4 = PLAN ONLY / NOT AUTHORIZED FOR IMPLEMENTATION. |
| Current PP gate | **PP11 PASS · IN FORCE** · repository **RELEASE COMPLETED** / **VERIFIED** |
| Next authorized PP step | **None** — PP0…PP11 complete |
| PP10 | **PASS** — Production Approval **GRANTED** |
| PP11 | **PASS** — Repository Release Transition |
| Production Approval | **GRANTED** |
| Repository Release | **COMPLETED** / **VERIFIED** |
| Operational `package.json` | **1.0.0** |
| Git tags | **1.0.0** + **v1.0** |
| DEPLOY | **EXECUTED · EVIDENCE CLOSED** (DEP-2; with disclosures) |
| MARKETPLACE / LOVABLE PUBLISH | **NOT EXECUTED — EVIDENCE GAP** |

Authority cites: `docs/RELEASE/official-records/`; `docs/PRS/`; `docs/PRODUCTION/`; `docs/PRV/`; `docs/SDC/`; `docs/DEP/`; `docs/UXC/`; `docs/SPE/`. PP11 historical certificate remains cite-only. Live DEPLOY evidence closed under **DEP-2** (G6 OUT · cloud NOT CERTIFIED · RLS DEFERRED). Historical PRS certification status is unchanged (**CLOSED**). Post-Release continuity = **PRV-1** (≠ reopen PRS). SDC-1 certifies scientific delivery continuity without version bump. DEP-1 freezes planning; DEP-2 certifies hosted execution of frozen **1.0.0**. **UXC-1 CERTIFIED / CLOSED** (non-arch Continuity; ≠ UX-10 reopen; bump **NOT EXECUTED**). **SPE-1 CERTIFIED / CLOSED**. Commercial Test Ready ≠ SPE-1 CERTIFIED / CLOSED.

**High-level bridge:**

```text
v1.0.0
   ↓
POST-RELEASE
   ↓
PRV-1 CLOSED
   ↓
SDC-1 CERTIFIED / CLOSED
   ↓
DEP-1 FROZEN / IN FORCE
   ↓
DEP-2 CERTIFIED / CLOSED (DEPLOY evidence closed with disclosures)
   ↓
UXC-1 CERTIFIED / CLOSED
   ↓
SPE-1.0 PLANNING FREEZE — MATERIALIZED
   ↓
SPE-1.E PASS
   ↓
SPE-1.1 PASS (compare-groups → Reports bridge)
   ↓
SPE-1.2 PASS (Publication Pack Lite)
   ↓
SPE-1.V PASS (Validation Umbrella)
   ↓
SPE-1.C PASS → SPE-1 CERTIFIED / CLOSED
   ↓
Commercial Readiness Preparation OPEN (records closed through CRP-6.3-SHELL as indexed · CTR DECLARED · CTR CERTIFIED WITH EXPLICIT DISCLOSURES)
   ↓
POST-CTR ROADMAP REORGANIZED / NEXT SERIES PENDING OWNER DECISION
```

---

## POST-CTR LIVING ROADMAP

```text
POST-CTR LIVING ROADMAP
THIS FILE = SOLE LIVING SSOT FOR “WHAT IS NEXT”
PLAN ARTIFACT: docs/roadmaps/POST-CTR-ROADMAP.md

CERTIFIED BASELINE
    Scientific Graph AI 1.0.0
    CTR DECLARED
    CTR CERTIFIED WITH EXPLICIT DISCLOSURES
    PRODUCT 1.0 — COMMERCIAL TEST READY
    SPE-1 CERTIFIED / CLOSED
    Product Face / CRP execution closed through CRP-6.3-SHELL
    DEP-2 CERTIFIED / CLOSED (G6 OUT · cloud NOT CERTIFIED · RLS DEFERRED)

POST-CTR
    Roadmap reorganized (this file + POST-CTR-ROADMAP.md)
    EXTERNAL COMMERCIAL TEST = operational (SPE-1.C; not a series)
    Product development = planning only until Owner selects a series

DEFERRED (protected — not debt by listing)
    AIR-1 · Cloud · RLS · G6 · Auth implementation
    ARCH-U · D71 · Phase 3 · CRP-6.4 implementation
    COLLAB realtime · PLUGINS loading · EXPORT-3
    marketplace / Lovable · v1.1 bump

CANDIDATES (not OPEN · not EXECUTION READY)
    Scientific productization successor (needs new charter; ≠ SPE-1 reopen)
    DATA / Import destination (CRP-6.4 remains PLAN ONLY)
    ENGINE evolution · PERFORMANCE hardening · RELEASE/1.0.x packaging
    ≠ Análisis / Resultados / Avanzadas as series names

NEXT SERIES
    PENDING OWNER DECISION
    ≠ OPEN · ≠ EXECUTION READY

CRP: docs/CRP/official-records/ (OPEN — index/history only)
Phase 3 = OPTIONAL / BLOCKED / NOT DEBT
CRP-6.4 Importar architecture = PLAN ONLY / NOT AUTHORIZED FOR IMPLEMENTATION
ENGINE · DATA · AI · COLLAB · PLUGINS · PERFORMANCE · RELEASE = restored as domain vision; not ranked for execution
NEXT: POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION
```

| Track | Status |
|-------|--------|
| **SPE-1** | **CERTIFIED / CLOSED** |
| **CTR** | **DECLARED** · **CERTIFIED WITH EXPLICIT DISCLOSURES** — `docs/CRP/official-records/CRP-CTR-Declaration.md` |
| **CRP** | **OPEN** as index — historical CRP-0…6 PASS; Screen 2 / Home / 6.3.x / 6.3-SHELL **closed**; **not** Phase 3; **not** CRP-6.4 implementation |
| **Post-CTR roadmap** | **REORGANIZED** — `docs/roadmaps/POST-CTR-ROADMAP.md` · **NEXT SERIES PENDING OWNER DECISION** |
| **EXTERNAL COMMERCIAL TEST** | Operational (SPE-1.C) — **not** an implementation series |
| ENGINE · DATA · AI · COLLAB · PLUGINS · PERFORMANCE · RELEASE | Certified 1.0 baseline restored as **domain vision**; not ranked for execution |
| OBS-1 residual | Queued peer (not SPE main scope; not absorbed by SPE-1.E) |
| AIR-1 | **DEFERRED / NOT CERTIFIED** |
| ARCH-U | Deferred · **NOT ACTIVE** |
| Full EXPORT-3 ZIP | Deferred beyond Pack Lite |
| COLLAB realtime / PLUGINS loading | OUT / Future Work |
| Marketplace / Lovable / Option C / RLS / G6 | Owner decisions · Cloud **NOT CERTIFIED** |
| v1.1.x bump | Separate Owner decision (not automatic) |
| Historical PROD-3 as living next epic | **RETIRED** (archive / historical only; SDC Continuity superseded living reopen) |
| UXC-2 | **Not invented** — UXC-1 closed |

**Future Work Boundary (pointers only):** FR-06 historically **DEFERRED** in PP body — UXC-1 closed applicable non-arch Continuity items under UXC Official Record (not all FR-06 items); PLUGINS execution/loading deferred · COLLAB realtime/CRDT deferred — classified **DEFERRED** / **OUT OF SCOPE** in the PP Issues Registry; OBS-1 residual · ARCH-U deferred · AIR-1 / full EXPORT-3 = **NOT AUTHORIZED BY SDC-1** / **NOT AUTHORIZED BY UXC-1** / **NOT STARTED BY SPE-1.0**; Cloud-enabled / Supabase RLS = future separately governed gate.

---

## Current Project Status (historical domain snapshot)

Scientific Graph AI has RELEASE CERTIFIED the ENGINE Domain, RELEASE CERTIFIED the DATA Domain, and RELEASE CERTIFIED the AI Domain (Planning AI-P0…AI-P11 + Implementation AI-I0…AI-I10). AI Implementation Series is CLOSED. Live Global Release Certification for baseline `cace282…` is GRC-DECISION-002 (see certified authority status above). PRS is **CLOSED**. Production Readiness (PP) is **COMPLETE** at **PP11 PASS** (repository RELEASE VERIFIED). Post-Release **PRV-1** is **CLOSED · HANDOFF RECORDED**. Post-PRV **SDC-1** is **CERTIFIED / CLOSED** (Continuity; eligible for v1.1 — bump deferred). **DEP-1** is **FROZEN / IN FORCE**; **DEP-2** is **CERTIFIED / CLOSED**; DEPLOY evidence **CLOSED** (with disclosures). **UXC-1** is **CERTIFIED / CLOSED** (tip `836a015`; certify `605e235`; bump **NOT EXECUTED**). **SPE-1** is **CERTIFIED / CLOSED**.

Domain snapshot (peer certifications; not a next-series plan):

| Domain | Status |
|---------|--------|
| ENGINE | ✅ CERTIFIED (FR-01 cert-path **CLOSED** — PP9) |
| DATA | ✅ CERTIFIED |
| AI | ✅ RELEASE CERTIFIED · Implementation Series CLOSED |
| COLLAB | Peer-certified / realtime deferred (Future Work Boundary) |
| PLUGINS | Peer-certified / loading deferred (Future Work Boundary) |
| PERFORMANCE | ✅ RELEASE CERTIFIED (I10 cited; conditionality disclosed; FR-09 CLOSED) |
| PRODUCTION (PP) | **COMPLETE** · **PP11 PASS** · repository **RELEASE VERIFIED** |
| PRV (Post-Release) | **PRV-1 CLOSED · HANDOFF RECORDED** |
| SDC (Delivery Continuity) | **SDC-1 CERTIFIED / CLOSED** |
| DEP (Deployment Execution) | **DEP-1 FROZEN / IN FORCE** · **DEP-2 CERTIFIED / CLOSED** · DEPLOY **EXECUTED · EVIDENCE CLOSED** (disclosures) |
| UXC (UX Continuity) | **UXC-1 CERTIFIED / CLOSED** |
| SPE (Scientific Product Expansion) | **SPE-1 CERTIFIED / CLOSED** |

The AI Domain is certified under `src/ai/` as structural Intelligence Domain skeletons. No runtime intelligence, assistants, or prediction is implemented.

**Next authorized PP step:** **None**. Marketplace / Lovable publish remain **NOT EXECUTED — EVIDENCE GAP**.
**SDC-1:** **CERTIFIED / CLOSED** — see `docs/SDC/official-records/SDC-1-Scientific-Delivery-Continuity.md`.
**DEP-2:** **CERTIFIED / CLOSED** — see `docs/DEP/official-records/DEP-2-Hosted-Deployment-Execution.md`.
**UXC-1:** **CERTIFIED / CLOSED** — see `docs/UXC/official-records/UXC-1-UX-Continuity-Certification.md`.
**SPE-1:** **CERTIFIED / CLOSED** — see `docs/SPE/official-records/SPE-1-Series-Closure.md`.
**Living next (this file only):** **POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION**. Plan artifact: `docs/roadmaps/POST-CTR-ROADMAP.md`. CTR **DECLARED** · **CTR CERTIFIED WITH EXPLICIT DISCLOSURES**. `PRODUCT 1.0 — COMMERCIAL TEST READY`. SPE-1.C **EXTERNAL COMMERCIAL TEST** is operational (not an implementation series). No product series OPEN. Phase 3 = OPTIONAL / BLOCKED / NOT DEBT. CRP-6.4 = PLAN ONLY / NOT AUTHORIZED FOR IMPLEMENTATION. E0 FROZEN. ARCH-U NOT ACTIVE. Plan B = ACTIVE FALLBACK. Plan C = ACTIVE CTR FLOOR (not activated). Lovable = **VISUAL REFERENCE**. Official CRP index: `docs/CRP/official-records/`.

---

## Estado actual (histórico pre-v1 — cite only)

| Bloque | Estado |
|--------|--------|
| Núcleo científico SCI-1 → SCI-60 | **Validado** (QA-1 + gates automatizados) |
| ARCH-5 Fases 1–4 | **COMPLETED** |
| ARCH-5 F5 (metodología SCI-50→60) | **CLOSED** (PROD-2D D9–D17) |
| ARCH-6 (visibility / toggles) | **CLOSED** (PROD-2D D4–D8) |
| PROD-1A / PROD-2A | **COMPLETED** |
| DATA-3A / HOTFIX-DATA-3A | **COMPLETED** |
| UX-1A.1 LITE | **COMPLETED** |
| Sprint QA-1 (Validación Manual) | **CERRADO** |
| **SCI-58 v2** (A1 + A2 + A3 + HOTFIX PDF-1/2/3) | **COMPLETED** |
| **PROD-2B** — Persistencia de proyectos científicos (B1–B6) | **COMPLETED** |
| **PROD-2C** — Worksheet + Visual Graph Builder persistence | **COMPLETED** |
| **PROD-2D** — UX profesional + arquitectura transversal | **CLOSED** (2026-07-09) |
| **PROD-2E** — Motor gráfico profesional | **CLOSED** (2026-07-16) |
| **Living next series (post-UXC)** | **POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION**; CRP remains **OPEN** as index; CTR **DECLARED** |
| Historical PROD-3 pointer | **RETIRED as living next** — archive / SDC Continuity; not SPE-1 reopen of PROD-3 |

Referencia de estado detallado (histórico):

- [`PROJECT_STATUS_PROD_2D.md`](./PROJECT_STATUS_PROD_2D.md) — cierre oficial PROD-2D (D0–D24)
- [`PROJECT_STATUS_PROD_2E.md`](./PROJECT_STATUS_PROD_2E.md) — cierre oficial PROD-2E (D25–D36)
- [`PROJECT_PLAN_PROD_2E.md`](./PROJECT_PLAN_PROD_2E.md) — plan operativo PROD-2E (congelado)
- [`MASTER_ROADMAP_V1.md`](./MASTER_ROADMAP_V1.md) — SSOT estratégico histórico
- [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) — cierre oficial PROD-2B (B1–B6.5)
- [`PROJECT_STATUS_PROD_2B_B5.md`](./PROJECT_STATUS_PROD_2B_B5.md) — cierre IndexedDB autosave (B5)
- [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md) — cierre worksheet + VGB (documento congelado)
- [`src/lib/project/README.md`](./src/lib/project/README.md) — arquitectura técnica persistencia V2
- [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md) — cierre SCI-58 v2
- [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md) — snapshot histórico cierre QA-1
- [`../SPE/SPE-Planning-Charter.md`](../SPE/SPE-Planning-Charter.md) — living SPE planning authority
- [`../SPE/official-records/SPE-1-Planning-Freeze.md`](../SPE/official-records/SPE-1-Planning-Freeze.md) — SPE-1.0 freeze

---

## PROD-2D — UX profesional + arquitectura transversal

**Estado:** **CLOSED** (2026-07-09)

Épica que profesionaliza UX (branding, Smart Start, Config, Historial, Actividad), cierra ARCH-6 (visibility/toggles) y ARCH-5 F5 (metodología SCI-50→60 modularizada), y certifica el gate umbrella `validate:prod2d-gate`.

| Bloque | Microfases | Estado |
|--------|------------|--------|
| UX-2A | D1–D3 | **CLOSED** |
| ARCH-6 | D4–D8 | **CLOSED** |
| ARCH-5 F5 | D9–D17 | **CLOSED** |
| UX-2B | D18–D21 | **CLOSED** |
| Actividad proyecto (D22) | D22 | **CLOSED** (microfase; ≠ épica UX-2C independiente) |
| Gate umbrella | D23 | **CLOSED** |
| Cierre documental | D24 | **CLOSED** |

Gate oficial: `npm run validate:prod2d-gate`  
Documentación de cierre: [`PROJECT_STATUS_PROD_2D.md`](./PROJECT_STATUS_PROD_2D.md)

**Handoff histórico (cite-only):** PROD-3 was the post-PROD-2D pointer; SPE-1 then became the living series and is now **CERTIFIED / CLOSED**. Current living next: **POST-CTR LIVING ROADMAP**. Historical PROD-3 is not reopened as a living epic.

---

## PROD-2E — Motor gráfico profesional

**Estado:** **CLOSED** (2026-07-16)

Épica que eleva VGB y motor gráfico a calidad de publicación: DATA-3B (heatmap, bubble, pca), GRAPH-1 (auto-fit Y, presets), GRAPH-2 (curves, series, axes, interaction, rendering), consolidación D36 con gate épica `validate:prod2e-gate`.

| Bloque | Microfases | Estado |
|--------|------------|--------|
| DATA-3B | D26–D28 | **CLOSED** |
| GRAPH-1 | D29–D30 | **CLOSED** |
| GRAPH-2 | D31–D35 (2a–2e) | **CLOSED** |
| CONSOLIDATION-2E | D36.1–D36.6 | **CLOSED** |

Gate oficial: `npm run validate:prod2e-gate`  
Documentación de cierre: [`PROJECT_STATUS_PROD_2E.md`](./PROJECT_STATUS_PROD_2E.md)

**Handoff histórico (cite-only):** PROD-3 pointer superseded for living roadmap by **SPE-1**.

---

## Sprint QA-1 — CERRADO

Validación manual end-to-end completada sobre la arquitectura actual (progressive disclosure, toggles default OFF, workflow SCI-59). Gate `npm run validate:full` — **PASS**.

Protocolo: [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md)

---

## SCI-58 v2 — COMPLETADO

**Estado:** **COMPLETADO** (2026-06-27)

Comparación científica ampliada sobre la base SCI-58 v1 (ARCH-5 F4). Entregables: modelo enriquecido (A1), dashboard ampliado (A2), exportación PDF condicional (A3), hotfixes PDF-1/2/3.

Documentación completa: [`PROJECT_STATUS_SCI_58.md`](./PROJECT_STATUS_SCI_58.md)

---

## PROD-2B — Persistencia de Proyectos Científicos

**Estado:** **COMPLETED** (2026-07-01)

Épica que evoluciona `.sgproj` de schema v1 a v2: dominio multi-dataset, worksheet, Visual Graph Builder, biblioteca local IndexedDB, autosave, conflict detection, UX hardening, migrador, validadores y adaptadores de archivo.

Documentación de cierre: [`PROJECT_STATUS_PROD_2B.md`](./PROJECT_STATUS_PROD_2B.md) · [`PROJECT_PLAN_PROD_2B.md`](./PROJECT_PLAN_PROD_2B.md)

---

## PROD-2C — Worksheet + Visual Graph Persistence

**Estado:** **COMPLETED** (2026-06-30)

Épica de implementación que cierra el alcance original PROD-2B B3 + B4 sobre schema V2.

Documentación de cierre (congelada): [`PROJECT_STATUS_PROD_2C.md`](./PROJECT_STATUS_PROD_2C.md)

---

## ARCH-6-DOC — Alineación documental

**Estado:** **COMPLETED** (2026-06-30)

Sincronización de README, ROADMAP, README técnico y referencias de estado con la arquitectura real post-PROD-2C. Sin cambios funcionales.

---

## Próxima etapa (living)

**THIS FILE is the sole living SSOT for “what is next.”** PROJECT_STATUS and CRP official records may cite this section; they must not author a competing next.

| Series | Descripción |
|--------|-------------|
| **Living next** | **POST-CTR ROADMAP — REORGANIZED / NEXT SERIES PENDING OWNER DECISION** — `docs/roadmaps/POST-CTR-ROADMAP.md`; no product series OPEN |
| **Commercial Readiness Preparation** | **OPEN** (index) — historical records closed through CRP-6.3-SHELL; Phase 3 OPTIONAL / BLOCKED / NOT DEBT; CRP-6.4 PLAN ONLY / NOT AUTHORIZED FOR IMPLEMENTATION |
| **SPE-1** (closed) | Scientific Product Expansion — **CERTIFIED / CLOSED** — `docs/SPE/official-records/SPE-1-Series-Closure.md` |
| ENGINE · DATA · AI · COLLAB · PLUGINS · PERFORMANCE · RELEASE | **Domain vision restored** — certified 1.0 baseline; **not** ranked for execution until Owner selects a series |

| Historical (not living next) | Descripción |
|------------------------------|-------------|
| **PROD-3** | Historical export/import epic pointer — **retired as living next**; SDC Continuity / EXPORT-1/2 floors certified; full EXPORT-3 ZIP remains Future Work beyond SPE Pack Lite |

---

## Histórico de hitos cerrados

SCI-55 → SCI-60 · SCI-58 v1 · **SCI-58 v2** · SCI-59 · ARCH-5 F1–F4 · PROD-1A · PROD-2A · **PROD-2B** (B1–B6) · **PROD-2C C1–C9** · **ARCH-6-DOC** · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 · UX-1A.1 LITE · DATA-3A · **QA-1** · **HOTFIX PDF-1/2/3** · **PROD-2D** (D0–D24) · **PROD-2E** (D25–D36) · **RELEASE / PP / PRV / SDC / DEP / UXC-1** · **SPE-1.0 Planning Freeze** · **SPE-1.E Entry Hygiene PASS** · **SPE-1.1 Analysis Workflow Productization PASS**
