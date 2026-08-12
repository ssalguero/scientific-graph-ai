# CRP-6.1 — Controlled Product Face Implementation — Phase 1 (Foundation)

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** GREEN Product Face foundation implementation — **NO Phase 2 YELLOW · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Authority:** CRP-6 Visual Target Freeze · CRP-4 fences · E0 freeze pointer  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · CTR **NOT YET** · ARCH-U **NOT ACTIVE**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **Phase** | Controlled Product Face Implementation — **Phase 1** |
| **Result** | **PASS** |
| **Scope** | GREEN foundation only |
| **`src/**` changed** | **YES** (presentation/composition) |
| **YELLOW / RED** | **NOT IMPLEMENTED** |
| **Next** | Owner authorization for **Phase 2** (infrastructure suppression) |

```text
CRP-6.1 Phase 1 = PASS
GREEN foundation implemented
YELLOW deferred (PlanningMode / PanelState / StatusBar / Inspector / seeds)
STOP — await Phase 2 authorization
```

---

## 2. Phase Objective

Translate the frozen E0 visual target into the **existing repository** for the first Product Face layer:

- single brand/header hierarchy;
- demote/hide dual brand + Ready theater (without breaking UX-2.3 source freeze);
- journey tabs preserved;
- Proyecto sidebar foundation;
- Smart Start copy + hierarchy;
- Results → Reportes/Pack cue;
- Reportes y Pack presentation;
- GREEN false-affordance reduction;
- expert/system demotion where already supported.

---

## 3. Scope Boundary

### Implemented (GREEN)

See §5.

### Intentionally deferred

| Item | Fence | Phase |
|------|-------|-------|
| PlanningMode default collapse | YELLOW | Phase 2 |
| PanelState / PanelProvider defaults | YELLOW | Phase 2 |
| StatusBar visibility policy | YELLOW | Phase 2 |
| Contextual Inspector behavior | YELLOW | Phase 2 |
| Full-bleed infrastructure effect | YELLOW | Phase 2 |
| Seed / profile gating | YELLOW (early-return available; deferred for coherent cold-start with Phase 2) | Phase 2 |
| Window / Dock / Layout models | RED | Not authorized |
| Session / persistence / engines | RED | Not authorized |
| ARCH-U | NOT ACTIVE | — |
| “Usar dataset de ejemplo” as named CTA | No existing capability — not invented | Deferred / N/A |

---

## 4. Mapping Confirmation

CRP-6 expected owners confirmed against live repository:

| Target | Owner | Confirmed |
|--------|-------|-----------|
| Single header | `AdaptiveToolbar` composition in `page.tsx` | YES |
| Dual brand / Ready | `WorkspaceContent.tsx` | YES (UX-2.3 freeze → visual suppress) |
| Journey tabs | `page.tsx` `WORKSPACE_TABS` / `WorkspaceTab` | YES |
| Proyecto sidebar | `Sidebar.tsx` | YES |
| Smart Start UI | `SmartStartScreen.tsx` | YES |
| Smart Start copy | `lib/smart-start/options.ts` | YES |
| Results → Pack | `page.tsx` results `WorkflowContinuityBar` | YES |
| Reportes / Pack | `page.tsx` reports section | YES |

**Discrepancy noted:** UX-2.3 validator freezes WorkspaceContent strings (`Scientific Graph AI` / `Current Project` / `Ready`) in **source**. Phase 1 keeps freeze strings and visually suppresses the theater (`display: none` + `hidden` + `aria-hidden`) while adding a quieter product-face context strip. This preserves GREEN presentation without modifying validators.

---

## 5. Implemented GREEN Scope

1. **Header hierarchy** — Sole visible brand in AppShell toolbar; project context secondary via `workspaceSessionContext`; dual workspace brand + Ready theater visually suppressed.
2. **Product-face context strip** — Quiet “Proyecto / Contexto del espacio de trabajo” strip in `WorkspaceContent`.
3. **Journey tabs** — Preserved Inicio → Datos → Análisis → Resultados → Reportes; step hints updated for Results/Reports Pack language.
4. **Sidebar foundation** — Title **Proyecto**; groups reordered/relabeled: Archivo → Gráficos → Científico → Análisis → Recursos → Ajustes.
5. **Smart Start** — Primary **Importar datos**; cleaned user-facing copy (no SCI-*/ARCH-*); prominence hierarchy; expert demoted.
6. **PublicationEntryBanner** — Removed SCI-* jargon from user-facing banner.
7. **Results → Pack cue** — **Generar reporte** + **Ir a Reportes · Pack** via existing `selectWorkspaceSection("reports")`.
8. **Reportes y Pack** — Section title + subtitle emphasizing Pack / PDF / reproducible output.
9. **False affordances** — Removed inert New Series empty CTA; emptied Explorer panel inert actions; emptied LeftPanel inert New/Import; Console Ready/Warnings/Errors theater demoted to Empty.
10. **Expert demotion** — Lab profile selector opacity demotion; Smart Start expert card dashed/secondary.

---

## 6. Files Changed

### Modified

- `src/components/workspace/WorkspaceContent.tsx`
- `src/app/page.tsx`
- `src/components/ui/sidebar/Sidebar.tsx`
- `src/lib/smart-start/options.ts`
- `src/components/home/SmartStartScreen.tsx`
- `src/components/home/PublicationEntryBanner.tsx`
- `src/components/workspace/panels/content/ExplorerContent.tsx`
- `src/components/workspace/panels/LeftPanel.tsx`
- `src/components/workspace/panels/BottomPanel.tsx`
- Living docs: CRP README · PROJECT_STATUS · ROADMAP · SPE README (next-pointer)

### Added

- `docs/CRP/official-records/CRP-6-1-Product-Face-Foundation.md` (this file)

### Removed

- None (no component deletions; infrastructure retained)

---

## 7. Behavior Changed (user-visible)

- Dual brand + Ready no longer visible in workspace header (frozen source retained).
- Sidebar titled Proyecto; Archivo/Gráficos ordering.
- Smart Start cards use commercial language and primary Importar datos emphasis.
- Resultados shows Pack/report next-step CTAs.
- Reportes section reads **Reportes y Pack**.
- Inert Explorer/Console false CTAs reduced.

## 8. Behavior Preserved

- SPE journey tabs and section state;
- Smart Start option IDs / handlers / engines;
- Pack Lite / PDF export internals;
- Session / persistence / Window / Dock / Layout models;
- PlanningMode / PanelState defaults (still open IDE scaffold — Phase 2);
- Seed windows (still present — Phase 2);
- Scientific engines and SPE contracts.

---

## 9. Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm run validate:spe-1v-umbrella` | **PASS** |
| `npm run validate:ui-sidebar-architecture` | **PASS** (12/12) |
| `validate-smart-start-config-unit` | **PASS** |
| `validate-ux-2.3` `ux23.header.copy.project` | **PASS** (freeze retained) |
| `validate-ux-2.3` overall | **FAIL** on pre-existing file-set / delegate cases — **not introduced by Phase 1** |
| `validate:workspace-architecture` | Known **FAIL 22/26** — pre-existing; not “fixed” |

---

## 10. Visual Validation

| Stage | Result |
|-------|--------|
| Cold Start / Inicio | Single toolbar brand · Proyecto sidebar · Smart Start Importar datos · Ready theater not displayed · IDE still open (expected) |
| Datos | Tab functional; section reachable |
| Análisis | Tab functional |
| Resultados | Pack cues present (**Generar reporte**, **Ir a Reportes · Pack**) |
| Reportes | **Reportes y Pack** · Pack Lite / PDF surfaces visible |

Journey Inicio → … → Reportes exercised; Results → Reports navigation via cue confirmed.

---

## 11. Architecture Protection

| Guard | Status |
|-------|--------|
| SPE-1 | **CLOSED** |
| ARCH-U | **NOT ACTIVE** |
| Window / Dock / Layout | **UNCHANGED** |
| Session / persistence | **UNCHANGED** |
| Engines / SPE contracts | **UNCHANGED** |
| SemVer | **1.0.0** |
| CTR | **NOT YET** |

---

## 12. Phase Gate

### **Controlled Product Face Implementation — Phase 1 = PASS**

**STOP.** Do not start Phase 2 without explicit Owner authorization.
