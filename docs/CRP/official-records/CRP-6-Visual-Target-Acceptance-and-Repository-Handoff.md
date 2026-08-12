# CRP-6 — Visual Target Acceptance & Repository Handoff

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** E0 acceptance · Visual Target Freeze · Repository mapping / handoff — **NO `src/**` IMPLEMENTATION · NO CSS · NO Product Face code · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Evidence basis:** Owner-certified Plan A / Lovable E0 composition · Proposal A (CRP-3) · APPROVED WITH FENCES (CRP-4) · CRP-5.2 Visual Corpus (before baseline) · CRP-5.3 Path Selection · live repository ownership inspection  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET** · ARCH-U **NOT ACTIVE**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-6** | **PASS** |
| **E0 decision** | **ACCEPT** |
| **Visual Target** | **FROZEN AS IMPLEMENTATION REFERENCE** |
| **Plan A** | **SELECTED / PRIORITY** — E0 success path closed for exploration |
| **Plan B** | **ACTIVE FALLBACK** (not activated) |
| **Plan C** | **ACTIVE CTR FLOOR** (not activated) |
| **`src/**` changes** | **NONE** |
| **SPE-1 / SemVer / CTR / ARCH-U** | Untouched · CLOSED / 1.0.0 / NOT YET / NOT ACTIVE |
| **Next** | **Owner-authorized Controlled Product Face Implementation — Phase 1** (foundation only; not started here) |

```text
CRP-6 = PASS
E0 = ACCEPT
E0 Visual Target = FROZEN AS IMPLEMENTATION REFERENCE
Lovable = VISUAL REFERENCE (not architectural SSOT)
src/** = NO CHANGES
STOP — await Owner authorization for implementation Phase 1
```

---

## 2. Purpose

Formally accept the successful Plan A / Lovable **E0** visual exploration as the candidate Product Face target and translate that visual target into a controlled repository implementation handoff.

CRP-6 is **not** the implementation phase.

---

## 3. Authoritative Preconditions (confirmed)

| Item | Status | Evidence |
|------|--------|----------|
| SPE-1 | **CERTIFIED / CLOSED** | SPE Official Records |
| SemVer | **1.0.0** | package / tags |
| CTR | **NOT YET** | Living status |
| CRP-0…5.3 | **PASS** | Official records |
| Proposal A | **APPROVED WITH FENCES** | CRP-4 |
| Plan A | **SELECTED / PRIORITY** | CRP-5.3 |
| Plan B / C | **ACTIVE FALLBACK / CTR FLOOR** | CRP-5.3 |
| Lovable E0 | **ACCEPTED CANDIDATE → ACCEPT** | This record §4–§6 |
| ARCH-U | **NOT ACTIVE** | CRP-4 |
| CRP-5.2 corpus | **before** baseline retained | `docs/CRP/visual-corpus/` |

---

## 4. E0 Result (accepted visual composition)

Plan A E0 produced a Product Face composition aligned with Proposal A. Frozen target characteristics:

### Header
- Single **Scientific Graph AI** brand  
- Project context secondary  
- Search / command access secondary  
- Theme / HC controls secondary  
- Expert/system functions grouped away from the primary face  
- No duplicate branding  
- No static **Ready** theater  

### Primary journey
**Inicio → Datos → Análisis → Resultados → Reportes**  
Tabs own the journey. No sixth Pack tab. No competing primary navigation.  
Pack remains under **Reportes**, with contextual cue from **Resultados**.

### Sidebar
Primary supporting sidebar **Proyecto** with groups: Científico · Análisis · Recursos · Ajustes.  
Supports the journey; does not own it; visually subordinate to the central workspace.

### Workspace
Content-forward · minimal chrome · useful whitespace · strong hierarchy · stage-specific content · reduced infrastructure noise.

### IDE scaffold
Explorer / Inspector / Console / PlanningMode / Dock / empty panels / diagnostic chrome: **collapsed / hidden / contextual / progressively disclosed**. Infrastructure retained; not deleted.

### Seeds
Demo seed windows (Workspace A / B) **absent** from commercial cold start. Window architecture intact.

### Smart Start
Prominent on Inicio; scientific, understandable, user-facing; free of SCI-* / ARCH-* / implementation terminology. Primary cold-start action obvious.

### Análisis
Central graph · contextual toolbar · Properties / curve-fitting · **Ver resultados** · contextual Inspector on the right (not always-open IDE).

### Resultados
Model · R² · fitted parameters · statistical metrics · residuals · degrees of freedom · report transition.  
Primary action: **Generar reporte**. Contextual Pack cue: **Ir a Reportes · Pack**.

### Reportes / Pack
Home of report configuration · Pack · PDF export · report preview · reproducible scientific output.  
Target label: **Reportes y Pack** with clear primary export action. No sixth Pack tab.

**Architecture rule (locked):** Lovable is **VISUAL REFERENCE** only. Do not adopt Lovable routes, component hierarchy, state model, stage state, persistence, data model, or window system.

---

## 5. E0 Acceptance Decision

### **E0 = ACCEPT**

| Gate | Result |
|------|--------|
| All mandatory A1–A10 | **PASS** (matrix §6) |
| Recommended A11–A16 | **≥4 PASS** (majority) — A11–A13/A15–A16 PASS; A14 PARTIAL |
| F1–F10 failure criteria | **None confirmed** |
| Translatable under CRP-4 fences | **YES** — GREEN/YELLOW only; no mandatory RED |
| Suitable as repository visual target | **YES** |

**REFINE / REJECT not selected.** Minor polish (empty-state honesty, CTA density) remains for implementation Phase 4 — not a material E0 blocker.

**E1–E3:** Not required. E0 strong → freeze without further Lovable iteration (CRP-5.3 §10).

---

## 6. Visual Acceptance Matrix

### Mandatory

| ID | Criterion | Result | Evidence |
|----|-----------|--------|----------|
| **A1** | Product identity | **PASS** | Single Scientific Graph AI brand; finished scientific-product reading vs IDE |
| **A2** | Hierarchy | **PASS** | One dominant face: header → tabs → workspace; chrome demoted |
| **A3** | Journey | **PASS** | Inicio → Datos → Análisis → Resultados → Reportes as primary nav |
| **A4** | Sidebar | **PASS** | Proyecto support groups; subordinate to workspace |
| **A5** | IDE suppression | **PASS** | Scaffold collapsed/hidden/contextual; not dominant |
| **A6** | Seeds | **PASS** | No demo Workspace A/B on commercial cold face |
| **A7** | Smart Start | **PASS** | User-facing language; no SCI-*/ARCH-* on primary cards |
| **A8** | Reports / Pack | **PASS** | Reportes home + Resultados cue; no sixth tab |
| **A9** | Professional perception | **PASS** | External-user appropriate composition |
| **A10** | Visual coherence | **PASS** | Header, tabs, sidebar, workspace, CTAs read as one system |

### Recommended

| ID | Criterion | Result | Evidence |
|----|-----------|--------|----------|
| **A11** | Content-forward density | **PASS** | Workspace protagonist; useful whitespace |
| **A12** | CTA hierarchy | **PASS** | Smart Start / Generar reporte / Pack export hierarchy clear |
| **A13** | Menu clarity | **PASS** | Primary journey vs secondary/expert separation |
| **A14** | Empty-state honesty | **PARTIAL** | Direction correct (hide false affordances); residual polish expected in Phase 4 |
| **A15** | Visual polish | **PASS** | Commercially credible composition |
| **A16** | Scalability | **PASS** | Maps onto existing SPE journey / Pack without requiring model rewrite |

---

## 7. Visual Target Freeze

### Declaration

> **E0 Visual Target = FROZEN AS IMPLEMENTATION REFERENCE**

### Freeze pointer

- Compositional authority: this record §4 + CRP-3 Proposal A wireframe  
- Before baseline (unchanged): CRP-5.2 corpus `docs/CRP/visual-corpus/`  
- Desired reference index: [`../visual-corpus/e0-target/E0-VISUAL-TARGET-FREEZE.md`](../visual-corpus/e0-target/E0-VISUAL-TARGET-FREEZE.md)

### Freeze does **not** mean

- Lovable code is authoritative  
- Lovable architecture is adopted  
- Lovable components are copied  
- The repository is replaced  

### Freeze means

The accepted visual composition (hierarchy, layout, navigation organization, grouping, visual treatment, interaction intent) is the reference for **repository** implementation under CRP-4 fences.

---

## 8. Product Master Map Alignment

Product Master Map / CTR denominators are cited from **SPE-1.C Series Closure §13** (Decision 1A). **CRP-6 does not invent or recalculate percentages.**

| Metric | Value (cite-only) | Relevance to CRP-6 |
|--------|-------------------|--------------------|
| Roadmap Completion (SPE spine) | **6/6 = 100%** | SPE closed; Product Face is post-SPE |
| Architecture Completion (CTR) | **~100%** | No CTR-required arch gap inside SPE fence; ARCH-U not opened |
| Scientific Capability (CTR) | **~95%** | Engines/Pack preserved; face consumes existing capability |
| AI Collaborator (CTR) | **100% gate-scoped** / Stage 3 runtime **0%** | Out of CRP-6 scope |
| Product / UX (CTR) | **~92%** | **Remaining distance = Layout / Product Face (RD-V02)** — this handoff |
| Commercial Readiness | **~85%** | CTR still Owner-declared later; packaging gaps remain |

**Denominator note:** The Master Map does **not** provide a separate numeric “Product Face % complete” for Proposal A implementation items. Ownership/denominator authority for face work remains the cited CTR Product/UX and Commercial Readiness lines plus the CRP-4 GREEN/YELLOW/RED fence matrix — **not** a new invented percentage.

CTR checklist mirror (unchanged): Layout / Product Face **OPEN** ← RD-V02; Owner CTR declare **OPEN**.

---

## 9. Repository Mapping

Inspected owners (live paths). Lovable file names are **not** used as repository owners.

| Visual Target | Existing Repository Owner | Change Type | Risk | Fence |
|---------------|---------------------------|-------------|------|-------|
| Single header / sole brand | `src/components/toolbar/AdaptiveToolbar.tsx` + `src/app/page.tsx` toolbar composition | composition | low | **GREEN** |
| Dual header / Ready demotion | `src/components/workspace/WorkspaceContent.tsx` (brand H1 + “Current Project” + “Ready”) | composition / remove theater | low | **GREEN** |
| Journey tabs | `src/app/page.tsx` — `WORKSPACE_TABS` / `activeWorkspaceSection` | presentation KEEP | low | **GREEN** |
| Proyecto sidebar | `src/components/ui/sidebar/Sidebar.tsx` (“Dashboard Científico” + groups) | regroup / relabel | low–medium | **GREEN / YELLOW** |
| Smart Start presentation | `src/components/home/SmartStartScreen.tsx` + `src/app/useSmartStart.ts` | composition | low | **GREEN** |
| Smart Start copy (no SCI-*/ARCH-*) | `src/lib/smart-start/options.ts` | copy | low | **GREEN** |
| IDE collapse (L/R/B) | `src/components/workspace/modes/PlanningMode.ts` → `PanelProvider` initialState; `DEFAULT_PANEL_STATE` in `PanelState.ts` | default visual state | medium | **YELLOW** |
| Full-bleed workspace | Consequence of collapsed panels + header demotion via `WorkspaceBodyLayout` / `WorkspaceLayout` | presentation effect | medium | **YELLOW** (deps) |
| Seeds off | `WorkspaceActivationSeed` in `src/components/windows/ProductCompositionHost.tsx` | early-return / commercial gate | low–medium | **GREEN → YELLOW** if profile wiring |
| StatusBar policy | `src/components/status-bar/StatusBar.tsx` · default slot in `AppShell` / `WorkspaceLayout` | visibility policy | medium | **YELLOW** |
| Contextual Inspector | Panel right region (`rightCollapsed`) + analysis stage UI in `page.tsx` / workspace panels | conditional visibility | medium | **YELLOW** |
| AppShell Inspector unused | `page.tsx` `visible={false}` | KEEP null | none | **GREEN** (no-op) |
| False affordances / empty CTAs | Panel toolbars / Explorer-Inspector-Console content in workspace panels | hide conditional | low | **GREEN** |
| Análisis content-forward | Analysis section in `src/app/page.tsx` (in-canvas graph / tools) | composition | low | **GREEN** |
| Resultados → Pack cue | Results section in `src/app/page.tsx` (`onOpenReports` → `setActiveWorkspaceSection("reports")` exists) | composition CTA | low | **GREEN** |
| Reportes / Pack | `src/components/reports/ScientificPublicationDashboard.tsx` + reports section / Pack Lite actions in `page.tsx` | composition / labeling | low | **GREEN** |
| Theme / HC / expert overflow | Toolbar secondary + Lab profile / Ajustes paths | progressive disclosure | low | **GREEN** |
| Window / Dock / Layout models | LayoutEngine / Window registry / Dock | **no change** | — | **RED if changed** (deferred; not required) |
| Session / persistence / engines | Session · `.sgproj` · scientific engines · SPE contracts | **no change** | — | **RED if changed** (deferred; not required) |

### Detailed mapping notes (required fields)

| Visual requirement | Current owner / file | Desired change | Mechanism | Risk | Validation |
|--------------------|----------------------|----------------|-----------|------|------------|
| Sole brand | AdaptiveToolbar + page toolbar | KEEP sole brand | presentation | GREEN | cold-start visual vs E0 + VC-01/13 |
| Remove dual brand + Ready | WorkspaceContent | Remove/demote H1 + Ready | JSX composition | GREEN | VC-13 regression |
| Tabs KEEP | page.tsx WORKSPACE_TABS | Preserve 5 tabs/order | state already owns journey | GREEN | journey review |
| Sidebar Proyecto | Sidebar.tsx | Title/groups order Científico→…→Ajustes | SidebarSection regroup | YELLOW composition | `validate:ui-sidebar-architecture` |
| Smart Start copy | options.ts | Strip SCI-*/ARCH-* from card descriptions | string edit | GREEN | VC-02 comparison |
| Panel defaults | PlanningMode.apply / DEFAULT_PANEL_STATE | commercial initial `*Collapsed: true` | mode producer values only | YELLOW | panel collapse chrome review |
| Seed gate | WorkspaceActivationSeed | early return on commercial face | gate before `api.create` | GREEN/YELLOW | cold-start no A/B windows |
| StatusBar hide | StatusBar / AppShell slot | null/minimal until truthful | composition; **do not** delete grid region | YELLOW | VC-11 + architecture validators |
| Pack cue | page results → `setActiveWorkspaceSection("reports")` | visible “Ir a Reportes · Pack” / Generar reporte | CTA composition | GREEN | Results→Reports review |
| Reportes y Pack | reports section + ScientificPublicationDashboard | label + primary export emphasis | composition | GREEN | VC-10 + Pack path |

---

## 10. GREEN Items (confirmed)

Implementable without architectural ambiguity (Category A / CRP-4):

1. Sole brand in AdaptiveToolbar; demote/remove WorkspaceContent dual brand  
2. Remove static Ready theater  
3. Project context as secondary (non-H1) text  
4. KEEP journey tabs names/order/roles  
5. Smart Start dominant on Inicio (composition)  
6. Smart Start copy cleanup in `options.ts` (remove SCI-*/ARCH-*)  
7. Sidebar title toward **Proyecto**; ordering tweaks that do not invent nav architecture  
8. Hide false ActionButtons / New Series / empty Console chips when present  
9. Resultados Pack / Reportes cue using existing `setActiveWorkspaceSection("reports")`  
10. Reportes remains Pack home; **Reportes y Pack** labeling; primary export CTA emphasis  
11. Empty-state honesty via hide of misleading panel chrome (when panels visible)  
12. Expert/system controls progressive disclosure (Lab profile / Ajustes / overflow)  
13. Seed commercial-face **early-return** inside `WorkspaceActivationSeed` (preferred simple form)  
14. Density/hierarchy within existing UI tokens (no theme rewrite)

---

## 11. YELLOW Items (confirmed)

Controlled implementation — Category B:

| Item | Current owner | Why YELLOW | Safe boundary | Validator / test |
|------|---------------|------------|---------------|------------------|
| PlanningMode / PanelState commercial defaults | `PlanningMode.ts`, `PanelState.ts`, `PanelProvider`, mount in WorkspaceContent | UX freezes on mode producer / default sync; must not touch LayoutEngine/Dock/Window | Set `leftCollapsed/rightCollapsed/bottomCollapsed: true` for commercial initial only; keep panel components | Visual cold-start; collapsed handle chrome review; no persistence claims |
| Full-bleed effect | WorkspaceBodyLayout / WorkspaceLayout | Emergent from panel collapse + header demotion | Presentation consequence only; no region model change | Compare to E0 + VC-05/18 |
| Sidebar regroup (structural group rename/order) | `Sidebar.tsx` | Composition review vs `validate:ui-sidebar-architecture` | Relabel/reorder within existing Sidebar IA; no new routes / journey ownership | `npm run validate:ui-sidebar-architecture` |
| StatusBar hide-until-meaningful | `StatusBar.tsx`, AppShell default slot, WorkspaceLayout | D47 frozen against **breaking** WorkspaceLayout API; must not remove status **grid region** | Prefer StatusBar null/minimal **or** additive optional `statusBar` forward | Visual VC-11; architecture validators; no LayoutEngine track deletion |
| Seed gate if profile/env-based | `WorkspaceActivationSeed` | Crosses Activation Seed Freeze / profile wiring | Gate in seed utility only; no WindowRegistry schema change | Cold-start seed absence |
| Contextual Inspector (Análisis) | right panel collapse + analysis UI | Must not recreate always-open IDE; expand only contextually | Use existing `rightCollapsed` / stage-local UI; AppShell Inspector stays unused | Análisis stage review vs E0 |

---

## 12. RED / Deferred Items

**No RED item is mandatory for Proposal A CTR Product Face.**

| Item | Disposition |
|------|-------------|
| Window / Dock / Layout **model** rewrite | **RED / deferred** — not authorized; not required |
| Delete panel infrastructure | **Reject** — collapse/hide only |
| Session / persistence / IndexedDB / `.sgproj` schema | **RED / deferred** |
| Scientific engines / SPE workflow contracts | **RED / deferred** |
| Visibility / Command schema redesign | **RED / deferred** |
| Populate AppShell Inspector / Dock with domain model | **RED / deferred** |
| Theme/token system rewrite | **Defer / Out** |
| Fix `validate:workspace-architecture` FAIL **22/26** | **Defer** — pre-existing; **not** a CRP regression; not Product Face dependency |
| Marketplace / Lovable publish | **Owner packaging track** |
| Sixth Pack tab | **Reject** |

**ARCH-U remains NOT ACTIVE.** Any item that appears to require model change → document as RED/deferred and **stop that item** (do not resolve in Product Face phases without new authorization).

---

## 13. Architecture Protection

| Guard | Status |
|-------|--------|
| SPE-1 | **CERTIFIED / CLOSED** (not reopened) |
| ARCH-U | **NOT ACTIVE** |
| Window / Dock / Layout models | **UNCHANGED** (CRP-6) |
| Session | **UNCHANGED** |
| Persistence | **UNCHANGED** |
| Scientific engines / SPE contracts | **UNCHANGED** |
| SemVer | **1.0.0** |
| CTR | **NOT YET** |

Window / Dock / Layout fence: accepted visual target must be translated through existing composition/presentation mechanisms. If a repository constraint later contradicts this, document the constraint — do not solve via silent model unfreeze.

---

## 14. Implementation Order (handoff plan — NOT EXECUTED)

### Phase 1 — Product Face foundation
- Single header  
- Journey tabs presentation  
- Sidebar composition (Proyecto)  
- Smart Start presentation + copy  

### Phase 2 — Infrastructure suppression
- Panel defaults (PlanningMode / PanelState)  
- Seed gate  
- StatusBar policy  
- Contextual Inspector behavior  

### Phase 3 — Workflow presentation
- Datos  
- Análisis  
- Resultados (+ Pack cue / Generar reporte)  
- Reportes / Pack  

### Phase 4 — Visual polish
- Spacing / hierarchy  
- CTA treatment  
- Empty states (close A14 PARTIAL)  
- Copy polish  

**Authorization required** before any phase begins. CRP-6 does **not** authorize Phase 1 start.

---

## 15. Validation Plan (for future implementation)

### Commands (minimum)

| Check | Command | Notes |
|-------|---------|-------|
| Typecheck | `npx tsc --noEmit` | Required |
| SPE umbrella | `npm run validate:spe-1v-umbrella` | Must remain PASS |
| UI sidebar architecture | `npm run validate:ui-sidebar-architecture` | Especially after sidebar regroup |
| Workspace architecture | `npm run validate:workspace-architecture` | Known **FAIL 22/26** pre-existing — do **not** classify as CRP regression |
| Relevant UI/governance validators | as touched by YELLOW items | Per change set |

### Visual validation

| Check | Against |
|-------|---------|
| Before | CRP-5.2 corpus (VC-01…18) |
| Desired | Frozen E0 visual target (this record + e0-target pointer) |
| Cold-start review | No dual brand · no Ready · no seeds · Smart Start clean · IDE not dominant |
| Journey review | Inicio → Datos → Análisis → Resultados → Reportes |
| Results → Reports/Pack | Generar reporte / Ir a Reportes · Pack / Reportes y Pack export |

**Do not replace** the CRP-5.2 baseline corpus.

---

## 16. Plan B / Plan C Status

| Path | Status |
|------|--------|
| **Plan A** | **SUCCESS at E0** — visual target frozen; implementation remains repository-controlled |
| **Plan B** | **ACTIVE FALLBACK** — not activated (E0 ACCEPT) |
| **Plan C** | **ACTIVE CTR FLOOR** — not activated |

Activation rules unchanged from CRP-5.3 §§13–14.

---

## 17. Documentation / Source / Git

### Files expected from CRP-6 (docs only)

- `docs/CRP/official-records/CRP-6-Visual-Target-Acceptance-and-Repository-Handoff.md` (this file)  
- `docs/CRP/visual-corpus/e0-target/E0-VISUAL-TARGET-FREEZE.md`  
- Living updates: CRP README · PROJECT_STATUS · ROADMAP · SPE README next-pointer · Lovable package status note  

### Source

`src/**` = **NO CHANGES**  

### Git

No Product Face implementation commit in CRP-6. Documentation checkpoint only if Owner requests commit separately.

---

## 18. Next Authorized Phase

**Next:** Owner review of this handoff, then explicit authorization for:

> **Controlled Product Face Implementation — Phase 1 (foundation)**

Not authorized here: Phases 2–4 · ARCH-U · SemVer bump · CTR declare · SPE reopen · Lovable architecture import.

---

## 19. CRP-6 Gate

| Criterion | Result |
|-----------|--------|
| E0 accepted | **PASS** |
| Visual target frozen | **PASS** |
| Repository mapping complete | **PASS** |
| GREEN/YELLOW/RED classified | **PASS** |
| Architecture fences intact | **PASS** |
| Implementation order defined | **PASS** |
| Validation plan defined | **PASS** |
| `src/**` untouched | **PASS** |
| Plan B/C status confirmed | **PASS** |

### **CRP-6 = PASS**

```text
STOP
Do NOT implement Product Face
Do NOT modify src/**
Do NOT modify CSS / sidebar / PlanningMode / seeds / StatusBar / Window-Dock-Layout
Do NOT activate ARCH-U
Do NOT reopen SPE-1
Do NOT bump SemVer
Do NOT declare CTR
```
