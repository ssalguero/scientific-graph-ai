# CRP-6.2 — Layout / IA / Infrastructure Convergence (Phase 2)

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** YELLOW Product Face layout / IA / infrastructure visibility convergence — **NO Phase 3 · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE · NO Window/Dock/Layout model changes**  
**Authority:** E0 Visual Target Freeze · CRP-6 · CRP-6.1 Phase 1 PASS · CRP-6.1 Visual Fidelity PASS · CRP-4 fences  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · CTR **NOT YET** · ARCH-U **NOT ACTIVE**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **Phase** | Controlled Product Face Implementation — **Phase 2** |
| **Result** | **PASS** (pending Owner visual spot-check) |
| **Scope** | Layout · IA · infrastructure visibility · repetition consolidation |
| **Plan A** | **ACTIVE** |
| **Plan B / C** | **NOT ACTIVATED** |
| **Next** | Owner authorization for Phase 3 (workflow presentation) — **not started** |

```text
CRP-6.2 Phase 2 = PASS
E0 organization translated into repository composition
YELLOW infrastructure suppression applied (panels / seeds / StatusBar / canvas chrome)
Window/Dock/Layout models UNCHANGED
SPE-1 CLOSED · SemVer 1.0.0 · CTR NOT YET · ARCH-U NOT ACTIVE
STOP — await Owner authorization for Phase 3
```

---

## 2. Objective

Translate the frozen E0 visual organization into the existing repository by correcting:

- layout / spatial hierarchy;
- information architecture (tabs own journey; sidebar supports);
- infrastructure visibility (available, not dominant);
- repeated / competing UI surfaces.

This is **not** a redesign, Lovable import, or architecture rewrite.

---

## 3. E0 reference

| Source | Role |
|--------|------|
| `docs/CRP/visual-corpus/e0-target/E0-VISUAL-TARGET-FREEZE.md` | Frozen composition |
| `docs/CRP/official-records/CRP-6-Visual-Target-Acceptance-and-Repository-Handoff.md` | Acceptance + repository mapping |
| `docs/CRP/official-records/CRP-6-1-Visual-Fidelity-Correction.md` | Phase 1 fidelity baseline |
| CRP-5.2 visual corpus | Before baseline (not replaced) |

---

## 4. Initial IA problems (pre-Phase 2)

1. Explorer / Inspector / Console open by default (`PlanningMode` / `DEFAULT_PANEL_STATE` all expanded) — IDE scaffold dominated cold start.
2. Demo seed windows (`Ventana Workspace A/B`) auto-created on commercial cold start.
3. Empty StatusBar theater always visible (`h-8` empty zones).
4. Header information wall: Proyecto + Dataset + Biblioteca + VGB + save state.
5. Duplicate project/context strip under journey tabs + workflow step hints in header.
6. Canvas IDE chrome (Workspace › Canvas breadcrumbs, Explorer/Inspector hints, StatusChip) competed with stage content.
7. Sidebar had competing peer groups **Archivo** + **Gráficos** before E0 support groups.
8. Sidebar width expanded to 280px at `xl`, squeezing workspace.
9. Lab profile band competed with journey hierarchy.
10. Empty infrastructure panels and expand chrome read as developer UI before product UI.

---

## 5. Repeated surfaces identified → disposition

| Surface | Before | Disposition |
|---------|--------|-------------|
| Brand | Dual brand suppressed in Phase 1 | Kept single AppShell brand |
| Project name | Header wall + below-tabs strip | **Header only** (minimal name) |
| Dataset / Library / VGB / Save | Header wall | **Removed** from header |
| Workflow step hints | Header under tabs | **Removed** from header |
| Product-face context strip | Already `sr-only` (6.1) | Retained demoted |
| Journey destinations | Tabs + sidebar Reportes CTA | Tabs own journey; sidebar Reportes = contextual CTA |
| Canvas “Workspace › Canvas” | Visible IDE chrome | **Visually suppressed** (source retained) |
| Status empty zones | Permanent theater | **Visually suppressed** when empty |
| Seed windows | Default on | **Gated OFF** commercial |

---

## 6. Layout / sidebar / workspace corrections

### Header
- Minimal project identity only (name).
- Journey tabs remain dominant row.
- Lab profile further demoted (opacity / scale).
- No dataset / library / save / step-instruction wall.

### Journey
- Unchanged five tabs: Inicio → Datos → Análisis → Resultados → Reportes.
- No Pack tab; no infrastructure tabs.

### Sidebar (E0 support structure)
```text
PROYECTO
  [Proyecto / file identity]
Científico
Análisis   (graph constructor actions + assistant + reports CTA)
Recursos   (function library · graph library · history)
Ajustes
```
- Former peer **Gráficos** group folded into Análisis / Recursos (no second journey).
- Verbose group hints removed.
- Width: commercial rail stays **240px** (no `xl` expand to 280).

### Workspace
- PlanningMode / DEFAULT_PANEL_STATE: L/R/B **collapsed**.
- Canvas IDE chrome visually suppressed → stage content is protagonist.
- Expand rails retained but quieted (available when needed).

---

## 7. Infrastructure suppression (defaults)

| Surface | Default commercial behavior | Retained |
|---------|----------------------------|----------|
| **Explorer** (left) | Collapsed | Expand rail + panel infra |
| **Console** (bottom) | Collapsed | Expand rail + panel infra |
| **Inspector** (right workspace panel) | Collapsed (contextual expand) | Expand rail + panel infra |
| **AppShell Inspector** | `visible={false}` (Phase 1) | Component + region |
| **PlanningMode** | Produces collapsed commercial initial | Mode producer |
| **StatusBar** | Hidden when empty (no theater) | Component + grid track |
| **Seeds** | OFF unless `NEXT_PUBLIC_WORKSPACE_SEEDS=1` | `WorkspaceActivationSeed` utility |
| **Floating windows** | No demo A/B on commercial face | WindowManager / registry |

---

## 8. Seed gating

Implemented in `ProductCompositionHost` → `WorkspaceActivationSeed`:

- Commercial / default: early-return (no `api.create` for A/B).
- Opt-in: `NEXT_PUBLIC_WORKSPACE_SEEDS=1`.
- Window / Dock models untouched.
- Dependent visual seeds already NO-OP when `windows.size === 0`.

---

## 9. StatusBar / Inspector

- **StatusBar:** empty default renders suppressed footer (`hidden` / `h-0` / `aria-hidden`); meaningful `children` still show normal chrome.
- **Inspector:** workspace right panel collapsed by default; analysis stage keeps in-canvas scientific inspector UI; AppShell Inspector remains unused/`visible={false}`.

---

## 10. Files changed

### Modified

- `src/components/workspace/modes/PlanningMode.ts`
- `src/components/workspace/panels/state/PanelState.ts`
- `src/components/windows/ProductCompositionHost.tsx`
- `src/components/status-bar/StatusBarLayout.tsx`
- `src/components/status-bar/StatusBar.tsx`
- `src/components/workspace/WorkspaceContent.tsx`
- `src/components/workspace/panels/WorkspaceBodyLayout.tsx`
- `src/components/workspace/panels/PanelExpandRail.tsx`
- `src/app/page.tsx`
- `src/components/ui/sidebar/Sidebar.tsx`
- `src/lib/ui/tokens.ts`
- Living docs: CRP official README · PROJECT_STATUS · ROADMAP · SPE README next-pointer

### Added

- `docs/CRP/official-records/CRP-6-2-Layout-IA-Infrastructure-Convergence.md` (this file)

### Removed

- None (infrastructure retained; no model deletions)

---

## 11. Architecture protection

| Guard | Status |
|-------|--------|
| SPE-1 | **CLOSED** |
| ARCH-U | **NOT ACTIVE** |
| Window / Dock / Layout models | **UNCHANGED** |
| Session / persistence | **UNCHANGED** |
| Scientific engines / SPE contracts | **UNCHANGED** |
| SemVer | **1.0.0** |
| CTR | **NOT YET** |

**Known validator tension (documented, not “fixed”):** `validate-ux-2.10` freezes historical `*Collapsed: false` in PlanningMode. Phase 2 intentionally sets commercial `*Collapsed: true` per CRP-4/CRP-6 YELLOW authorization. Sizes remain 280/280/240. Do not modify validators to obtain PASS.

---

## 12. Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** (exit 0) |
| `npm run validate:spe-1v-umbrella` | **PASS** (exit 0) |
| `npm run validate:ui-sidebar-architecture` | **PASS** (12/12) |
| `validate:workspace-architecture` | Known **FAIL 22/26** — pre-existing; out of scope |
| `validate-ux-2.10` collapse flags | **Expected tension** — historical freeze vs commercial `*Collapsed: true` (documented; validators not modified) |

---

## 13. Visual validation (composition vs E0)

| Check | Expected |
|-------|----------|
| Cold Start | No seeds · IDE panels collapsed · Smart Start clear |
| Inicio | E0 hierarchy: brand → tabs → Proyecto sidebar → workspace |
| Datos / Análisis / Resultados / Reportes | Journey owns stage; sidebar support-only |
| Análisis | Graph/workspace area dominant (scaffold collapsed) |
| 1280 / 1440 | Workspace usable; sidebar subordinate |

---

## 14. Remaining gaps (not Phase 2 blockers)

- Phase 3 workflow presentation polish (stage-local density / CTA refinement).
- Owner visual spot-check vs optional E0 PNG corpus (none attached in freeze dir).
- Expand rails still expose expert panel affordances (intentional availability).
- `validate-ux-2.10` historical collapse-flag freeze vs commercial defaults (documented).

---

## 15. Phase gate

### **Controlled Product Face Implementation — Phase 2 = PASS**

Product Face is materially closer to frozen E0 organization: journey ownership clear, sidebar support-only, workspace protagonist, infrastructure non-dominant, seeds off, repetition demoted.

**STOP.** Do not start Phase 3 · do not declare CTR · do not bump SemVer · do not reopen SPE-1 · do not activate ARCH-U without explicit Owner authorization.
