# CRP-6.2.2 — Screen 2 / Datos Ownership Follow-Up

**Date:** 2026-08-16  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Historical execution / certification record for **Screen 2 (Datos)** after F1–F5 and the accepted functional ownership audit. **NO CRP-6.3 numbering for this pass · NO extra Datos cleanup · NO Window/Tab/Layout model changes · NO CTR DECLARE**  
**Authority:** Accepted ownership audit (sections J/L) · Owner BUILD authorization for P1–P4  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · CTR **NOT YET** · ARCH-U **NOT ACTIVE**  
**Code checkpoint (later series tip):** `02ff1cc` `feat(crp): certify product shell and import implementation`

This record is **HISTORICAL**. It does not author living next work. Living next: [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md).

---

## 1. Certification

```text
CRP-6.2.2 SCREEN 2 — OWNERSHIP FOLLOW-UP PASS
Screen 2 is closed after P2 → P1/P4 → P3. No further cleanup.
```

Screen identity (unchanged):

```text
Journey tab: Datos
importDestinationActive === false
Experimental / scientific worksheet workspace
```

Importar destination (`data-crp-importar-shell`) is **not** this screen.

---

## 2. Prior Screen 2 work (cite, not reopened)

Already in tree before this follow-up (not re-certified here):

- Datos chrome de-duplication; disclosure defaults; worksheet as primary workspace
- Quieter worksheet status; redundant next-step UI removed
- `data-crp-datos-shell` presentation silence of IDE rails/panels (DOM kept)
- Compare as contextual Datos capture, not a competing stage

This follow-up implemented **only** the justified ownership items P2, P1/P4, and P3.

---

## 3. P2 — Function library destination

**Inspection:** Recursos “Biblioteca de funciones” and Datos Avanzado are the **same** researcher-facing capability (insert functions into the active curve), not two libraries. `controlPanelTab === "library"` has **no render branch**; the live UI is Datos **Avanzado**.

**Change:** `onOpenFunctionLibrary` also calls `setDataWorkspaceView("advanced")`, keeping `setControlPanelTab("library")` for persistence. Recursos and Avanzado kept.

**Validation recorded at close:** Datos → Avanzado shows Biblioteca de funciones (`Buscar función`, `sin(x)`, etc.). From Experimental, Recursos → Biblioteca de funciones selects **Avanzado** and the same surface. Insertion into an active curve was **not** retested (library UI only).

**Status:** Done.

---

## 4. P1 / P4 — Comparison capture vs review

**Copy:** Comparar datasets subtitle: *Captura Slot A y Slot B aquí. La revisión de la comparación está en Resultados.*

**CTA:** When `hasEnoughDataForMultiDatasetComparison` (`comparisonAnalysis !== null`), one button **Ver comparación en Resultados** → `selectWorkspaceSection("results")`. Constructor “Ver gráfico principal en Resultados” remains separate.

**Validation recorded at close:** Empty slots: Capturar A/B present, CTA absent. Two-slot capture → click was **not** run (no experimental files in the browser session). `validate:comparison-unit` passed.

**Status:** Implemented. Ready-state click not exercised live.

---

## 5. P3 — Recursos collapsed by default

**Change:** Datos-only Recursos `SidebarSection` `defaultOpen={false}`. `SidebarSection` internals unchanged.

**Validation recorded at close:** Fresh Datos visit: Recursos **collapsed**. Expand works. Biblioteca de funciones / gráficos / Historial still present.

**Status:** Done.

---

## 6. Functionality preserved (as recorded)

Project, Settings, Session, Series, Auxiliary, Import, Import report, Constructors (Experimental, y=f(x), Avanzado, Visual), Worksheet, comparison slots, scientific engine, persistence/`controlPanelTab`, Window/Tab/Layout unchanged.

---

## 7. Validation recorded at close

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | PASS (exit 0) |
| `validate:worksheet-import-unit` | PASS |
| `validate:worksheet-transforms-unit` | PASS |
| `validate:worksheet-lineage-unit` | PASS |
| `validate:workflow-unit` | PASS |
| `validate:spe-1v-umbrella` | PASS |
| `validate:ui-sidebar-architecture` | PASS (12/12) |
| `validate:comparison-unit` | PASS (92 cases) |

Known baseline (not run/fixed in that pass): `validate:workspace-architecture`, `validate:ui-architecture`.

Manual notes recorded: Next.js hydration overlay on reload (pre-existing; not part of this pass).

---

## 8. Remaining issues (historical, not reopened)

- Live two-slot capture → **Ver comparación en Resultados** not executed in browser at certification.
- Function insertion into an active curve not retested in that pass.
- Hydration overlay on Home/Datos reload (pre-existing).

No additional Datos cleanup was authorized after this close.

---

## 9. Files changed in that execution (cite)

- `src/app/page.tsx` — `onOpenFunctionLibrary` also sets `dataWorkspaceView` to `"advanced"`; comparison subtitle + CTA.
- `src/components/ui/sidebar/Sidebar.tsx` — Recursos `defaultOpen={false}`.
