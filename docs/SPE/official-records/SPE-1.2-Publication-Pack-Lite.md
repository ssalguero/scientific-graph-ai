# Official Record

# SPE-1.2 — Publication Pack Lite

**Domain:** SPE — Scientific Product Expansion  
**Series / Phase:** SPE-1.2  
**Date:** 2026-08-11  
**Nature:** Thin productization of EXPORT-2 PDF + EXPORT-1 companion PNG as Pack Lite — **NO ZIP · NO NEW ENGINES · NO LAYOUT/PRODUCT FACE REDESIGN · NO ARCHITECTURE UNFREEZE**  
**Status:** **PASS**  
**Planning Authority:** [`../SPE-Planning-Charter.md`](../SPE-Planning-Charter.md) (**IN FORCE / FROZEN**)  
**Prior phases:** SPE-1.0 freeze · [`SPE-1-E-Entry-Hygiene.md`](./SPE-1-E-Entry-Hygiene.md) (**PASS**) · [`SPE-1.1-Analysis-Workflow-Productization.md`](./SPE-1.1-Analysis-Workflow-Productization.md) (**PASS**)  
**Prior tip (cite-only):** `b352705ce96847e83b0d9179c541aae7f36a7504`

```text
SPE-1.2 PASS
  ≠ EXPORT-3 ZIP · AIR-1 · ARCH-U · OBS-1
  ≠ global Layout / Visibility / Product Face redesign
  ≠ new scientific engines / algorithms
  ≠ Session / Window / Dock / Layout / schema changes
  ≠ Commercial Test Ready (Layout debt preserved — Commercial Gate dependency)
```

---

## 1. Objective

Deliver a discoverable **Publication Pack Lite** path from Reports: scientific PDF (EXPORT-2) + companion figure PNG (EXPORT-1), with documented pack semantics and local discoverability — without ZIP or shell redesign.

---

## 2. Implementation summary

### Before

```text
Reports → Exportaciones
  ├── PNG / SVG / JSON (individual)
  └── PDF (individual)
```

No pack CTA; guided completion named generic “exportación”.

### After

```text
Reports → Exportaciones (open when scientific report present)
  ├── Pack de publicación (Lite)  → PDF + companion PNG
  ├── Exportaciones individuales · gráfico
  └── Exportaciones individuales · documento (PDF)
```

Partial pack disclosed when chart content is absent (PDF-only).

### Productization (thin)

- `publication-pack-lite.ts` — pack title, semantics (no ZIP), status resolver
- `downloadPublicationPackLite` composes existing PDF + PNG handlers
- Pack CTA primary on Reports; individual exports retained
- Guided completion names Pack Lite
- Pack unit validator + EXPORT-1/2 floors

---

## 3. Files changed

| Path | Purpose |
|------|---------|
| `src/lib/scientific/report/publication-pack-lite.ts` | Pack semantics / status |
| `src/lib/scientific/report/__tests__/publication-pack-lite.cases.ts` | Unit cases |
| `scripts/validate-spe-12-pack-lite-unit.ts` | Pack unit gate |
| `package.json` | `validate:spe-12-pack-lite-unit` |
| `src/app/page.tsx` | Pack CTA + compose download |
| `src/components/workflow/GuidedWorkflowPanel.tsx` | Completion copy → Pack Lite |
| `docs/SPE/official-records/SPE-1.2-Publication-Pack-Lite.md` | This record |
| `docs/SPE/official-records/README.md` | Index tip |
| `docs/PROJECT_STATUS.md` · `docs/roadmaps/ROADMAP.md` | Live tip sync |

---

## 4. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| AC-1 | Discoverable Pack Lite path from Reports | **PASS** |
| AC-2 | Pack produces EXPORT-2 PDF (toggle-aware path) | **PASS** |
| AC-3 | Pack produces EXPORT-1 PNG when chart has content | **PASS** |
| AC-4 | Partial pack disclosed when companion unavailable | **PASS** |
| AC-5 | Individual EXPORT-1/2 controls remain | **PASS** |
| AC-6 | No ZIP / manuscript archive | **PASS** |
| AC-7 | Guided completion names Pack Lite | **PASS** |
| AC-8 | export1/export2 + pack unit + tsc PASS; fence PASS | **PASS** |
| AC-9 | Official Record + status/roadmap tip updated | **PASS** |

---

## 5. Validation

| Command | Result |
|---------|--------|
| `npm run validate:spe-12-pack-lite-unit` | **PASS** (8/8) |
| `npm run validate:export1-chart-export-unit` | **PASS** |
| `npm run validate:export1-d42-2-testing` | **PASS** |
| `npm run validate:export2-pdf-toggle-unit` | **PASS** |
| `npm run validate:export2-d44-3-testing` | **PASS** |
| `npm run validate:workflow-unit` | **PASS** |
| `npm run validate:visibility-unit` | **PASS** |
| `npm run validate-prod1-gate` | **PASS** |
| `npx tsc --noEmit` | **PASS** |

---

## 6. Manual smoke / discoverability

| Smoke | Path | Result |
|-------|------|--------|
| **A** | Reports → Pack Lite CTA → PDF (+ PNG if chart) | **PASS** (static wiring + unit semantics) |
| **B** | Partial pack when no chart content | **PASS** (status `pdf-only` + message) |
| **C** | Individual PNG/SVG/JSON/PDF remain | **PASS** |
| **D** | Local discoverability: Pack CTA + semantics on Exportaciones; guided completion points at Pack Lite | **PASS** (copy/UI review) |

**Disclosure:** Interactive browser Continuity smoke **NOT RUN** (environment). SPE-1.V **External Discoverability Check** remains for umbrella phase (Pack Lite surface only).

---

## 7. Architecture fence

**PASS.** No changes to Session, Window/Dock/Layout model, IndexedDB / `.sgproj` schema, Recharts interior, AI runtime, plugins, collab realtime, scientific calculation modules, or EXPORT-3 ZIP.

---

## 8. Residuals / dependencies

| Item | Disposition |
|------|-------------|
| SPE-1.V Validation Umbrella + External Discoverability Check | Next phase — not started |
| SPE-1.C Series Certification | After SPE-1.V |
| Full EXPORT-3 ZIP | Deferred |
| OBS-1 residual validators | Outside SPE-1.2 |
| **Commercial UX / Layout / Product Face** | **Preserved debt** — SPE-1.2 does **not** redesign Layout/Visibility. **Commercial Test Ready MUST NOT** be declared solely from SPE-1 functional certification if a first-time external user cannot discover the primary scientific journey. Layout / Visibility / Product Face work is required **before** the Commercial Readiness Gate. |
| Interactive browser smoke corpus | Optional Owner follow-up / SPE-1.V |

---

## 9. Execution boundary

```text
SPE-1.2 PASS / READY FOR SPE-1.V
SPE-1.V BUILD NOT STARTED
SPE-1.V requires separate Owner authorization / execution step.
Commercial Test Ready ≠ SPE-1.2 PASS
```

---

## 10. Certification gates — SPE-1.2

```text
GATE SPE-1.2  PACK LITE CTA                         PASS
GATE SPE-1.2  EXPORT-2 + EXPORT-1 COMPOSE           PASS
GATE SPE-1.2  PARTIAL PACK DISCLOSED                PASS
GATE SPE-1.2  VALIDATION FLOOR                      PASS
GATE SPE-1.2  ARCHITECTURE FENCE                    PASS
GATE SPE-1.2  LOCAL DISCOVERABILITY                 PASS
GATE SPE-1.2  COMMERCIAL LAYOUT BOUNDARY            PASS (not implemented; debt preserved)
SERIES PHASE  SPE-1.2                               PASS
```

---

## 11. Authority cites

- [`../SPE-Planning-Charter.md`](../SPE-Planning-Charter.md)
- [`SPE-1-Planning-Freeze.md`](./SPE-1-Planning-Freeze.md)
- [`SPE-1-E-Entry-Hygiene.md`](./SPE-1-E-Entry-Hygiene.md)
- [`SPE-1.1-Analysis-Workflow-Productization.md`](./SPE-1.1-Analysis-Workflow-Productization.md)
- [`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md) · [`../../roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md)

**End of Official Record — SPE-1.2 PASS**
