# CRP-6.3-SHELL — Workspace Shell (Análisis / Resultados / Reportes)

**Date:** 2026-08-16  
**Series:** Commercial Readiness Preparation (CRP)  
**Id:** **CRP-6.3-SHELL** — Workspace Shell (this record)  
**Distinct from:** **CRP-6.3** Home / Product Face (2026-08-12) — [`CRP-6-3-Workspace-First-Navigation.md`](./CRP-6-3-Workspace-First-Navigation.md) — **not renamed, not overwritten**  
**Nature:** Historical execution / certification record for Phase 1 + Phase 2 only. **NO Phase 3 · NO CRP-6.4 implementation · NO extra cleanup · NO Window/Tab/Layout model changes · NO CTR DECLARE**  
**Authority:** Owner BUILD authorization for CRP-6.3 Workspace-First Navigation & Progressive Disclosure, Phase 1 + Phase 2 ONLY  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · CTR **NOT YET** · ARCH-U **NOT ACTIVE**  
**Code checkpoint (later series tip):** `02ff1cc` `feat(crp): certify product shell and import implementation`

This record is **HISTORICAL**. It does not author living next work. Living next: [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md).

---

## 1. Certification

Conversation certification at close (preserved):

```text
CRP-6.3 — IMPLEMENTATION PASS / CLOSED
Phase 1 + Phase 2 only. Phase 3 no se tocó.
```

Official-records distinction (Owner Option 1):

```text
CRP-6.3-SHELL — Workspace Shell
≠ CRP-6.3 Home / Product Face (2026-08-12)
≠ CRP-6.3.x Home Visual Refinement (FINAL)
```

---

## 2. Scope executed

**Phase 1 — Stage-aware IDE silence** on Análisis, Resultados, and Reportes: same presentation pattern as Datos (`data-crp-datos-shell`). Attributes:

- `data-crp-analysis-shell`
- `data-crp-results-shell`
- `data-crp-reports-shell`

Matching CSS blocks in `src/app/globals.css` are **separate per-stage blocks**. Grouping those panel/canvas rules with Datos caused the CSS pipeline (Tailwind / lightningcss) to drop selectors; separate blocks are the effective contract.

Sidebar is **not** hidden. Panels stay **mounted**; `display: none`. **No IDE recovery UI.** Window/Tab/Session/LayoutEngine unchanged.

**Phase 2 — Resultados → Reportes continuity:** Resultados ContinuityBar: `← Análisis` + primary **Ir a Reportes** only (removed `Generar reporte` and `Reportes · Pack`). Reportes: `WorkflowContinuityBar` secondary **← Resultados**. Pack/PDF/export remain in Reportes. **Ir a Reportes** only navigates (`selectWorkspaceSection("reports")`).

---

## 3. Phase 3

```text
Phase 3 = OPTIONAL / BLOCKED / NOT DEBT
```

Phase 3 was **not** implemented. It is **not** recorded as remaining product debt. Do not treat sidebar “Análisis” / Nuevo gráfico / Vaciar curvas as an authorized next CRP step.

---

## 4. Phase 1 recorded outcome

- **Análisis:** Controles (Visualización, Matemática, Estadística, Inferencia, Advisor) and CTA `Ver gráfico / Resultados →` intact. Panels `display:none`; rails absent. Product sidebar visible.
- **Resultados:** Main chart dominant; one report CTA; rails absent.
- **Reportes:** Pack Lite, PNG/SVG/JSON, PDF, copy; rails absent (`data-crp-reports-shell`).
- **Home / Datos:** No composition change in this pass. Datos Screen 2 and Home launcher remain as previously closed.

Infrastructure: panels remain in the DOM (`querySelectorAll` finds left/right/bottom).

---

## 5. Phase 2 recorded outcome

- Removed `Generar reporte` and `Reportes · Pack` from Resultados continuity.
- Single CTA: **Ir a Reportes**.
- Reportes: **← Resultados** (secondary).
- Navigation exercised: Análisis → Resultados → Reportes → Resultados.

---

## 6. Functionality preserved (as recorded)

Project, Resources, Settings, Worksheet, Import, Import report, Auxiliary, Session, Series, Constructors, Comparison (capture not touched in this pass), Analysis, Results, Reports, Scientific Report, Pack, PDF, PNG/SVG/JSON, persistence, workflow. Sidebar “Análisis” / Nuevo gráfico / Vaciar curvas unchanged.

---

## 7. Validation recorded at close

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | PASS |
| `validate:worksheet-import-unit` | PASS |
| `validate:worksheet-transforms-unit` | PASS |
| `validate:worksheet-lineage-unit` | PASS |
| `validate:workflow-unit` | PASS |
| `validate:spe-1v-umbrella` | PASS |
| `validate:ui-sidebar-architecture` | PASS (12/12) |
| `validate:comparison-unit` | PASS (92) |

**PRE-EXISTING (not run to “fix”):** `validate:workspace-architecture`, `validate:ui-architecture`.  
**NEW REGRESSION** on that validator list: none.

Manual browser (as recorded): Home (launcher), Datos (Screen 2), Análisis (no rails), Resultados (**Ir a Reportes**), Reportes (Pack/PDF/← Resultados), round-trip Reportes↔Resultados. Desktop viewport (~1640px canvas). **Not** separately resized to 1440px. Full comparison with filled slots **not** executed (no datasets). Next.js hydration overlay (pre-existing).

---

## 8. Remaining issues (historical)

- Phase 3 remains OPTIONAL / BLOCKED / NOT DEBT.
- Hydration overlay on reload (not this CRP).
- Combined CSS selectors with Datos do not survive the pipeline; separate blocks are required.

No CRP-6.4 implementation and no additional cleanup were authorized after this close.

---

## 9. Files changed in that execution (cite)

- `src/app/page.tsx` — `data-crp-analysis-shell` / `results` / `reports`; Resultados CTA; ContinuityBar on Reportes.
- `src/app/globals.css` — per-stage presentation blocks.

`Sidebar.tsx` was **not** modified in this pass.
