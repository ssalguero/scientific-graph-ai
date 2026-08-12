# CRP-4 — Layout Decision Gate

**Date:** 2026-08-11  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Layout Decision Gate — **NO `src/**` IMPLEMENTATION · NO LOVABLE · NO ARCH-U ACTIVATION · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Evidence basis:** [`CRP-3-Layout-IA-Proposal.md`](./CRP-3-Layout-IA-Proposal.md) · CRP-2 · live ownership inspection  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-4** | **PASS** |
| **Proposal A overall** | **APPROVED WITH FENCES** |
| **ARCH-U** | **NOT ACTIVATED** (not required for Proposal A CTR face) |
| **Category C (arch required for CTR)** | **NONE** |
| **`src/**` changes** | **NONE** |
| **Next** | **CRP-5.2 Visual Corpus → CRP-5.3 Path Selection** |

```text
CRP-4 = PASS
Proposal A = APPROVED WITH FENCES
Window/Dock/Layout models = NO CHANGE REQUIRED
ARCH-U = NOT ACTIVE
STOP — next = CRP-5.2 / CRP-5.3
```

---

## 2. Gate Decision

### **APPROVED WITH FENCES**

**Why not “AS PROPOSED” without fences:** Several items (PlanningMode initial collapse, StatusBar hide, seed gate) need controlled implementation review against UX freezes (panel mode producer, AppShell StatusBar default, Activation Seed Freeze) — but evidence shows they are **presentation / composition / visual PanelState**, not Window/Dock/Layout **model** unfreeze.

**Why not PARTIALLY APPROVED:** No material Proposal A item must be removed for CTR. Category D holds only optional overreach (e.g. deleting AppShell status **region** from the grid, populating AppShell Inspector).

**Why not BLOCKED:** Proposal A does **not** fundamentally require unauthorized architecture. Preferred outcome achieved: **Proposal A approved without ARCH-U.**

---

## 3. Decision Principle Applied

Prefer: presentation → visibility → composition → existing wiring  
Before: model change → architecture unfreeze  

Central answer: **Yes — Proposal A can be achieved through presentation/composition while preserving certified architecture**, with YELLOW fences on panel defaults, StatusBar wiring, and seed gating.

---

## 4. Technical Evidence (key owners)

| Concern | Owner | Controlling state | Persistence | Model? |
|---------|-------|-------------------|-------------|--------|
| L/R/B panels | `PanelProvider` + `WorkspaceBodyLayout` | `PanelState` (`leftCollapsed` etc.) | **None** (comment: “no persistence”) | Visual panel state ≠ LayoutEngine/Window/Dock model |
| PlanningMode | `PlanningMode.apply()` → `initialState` | Pure producer of `PanelState` | No | Mode initial values |
| Dual header | `WorkspaceContent.tsx` header JSX | Static presentational | No | No |
| Seeds | `WorkspaceActivationSeed` in `ProductCompositionHost` | `useEffect` + `api.create` | Uses Window API but seed is temporary utility | **Gating seed ≠ Window model rewrite** |
| StatusBar | `AppShell` default `{statusBar ?? <StatusBar />}`; `WorkspaceLayout` does not forward `statusBar` | Slot / default chrome | No | AppShell composition; optional additive forward = non-breaking if done carefully |
| Tabs / Pack cue | `page.tsx` `activeWorkspaceSection` / `setActiveWorkspaceSection` | React state | No SPE contract change | No |
| Sidebar | `Sidebar.tsx` | Local UI / props | No | Presentation IA |
| AppShell Inspector | `page.tsx` `visible={false}` | Prop | No | KEEP null |
| LayoutEngine | `WorkspaceLayout` resolve only | Tree resolve | — | **Untouched** |
| Dock | empty dock panel | — | — | **Untouched** |

---

## 5. Proposal A Decision Matrix

| # | Decision | Proposal A | Existing owner | Safe presentation? | Contract impact? | Model impact? | Category | Implementation fence |
|---|----------|------------|----------------|--------------------|------------------|---------------|----------|----------------------|
| 1 | Single brand header | Sole brand in toolbar | `AdaptiveToolbar` / page toolbar | Yes | No | No | **A** | GREEN |
| 2 | Project context | Demoted context (not second H1) | `WorkspaceContent` / sidebar | Yes | No | No | **A** | GREEN |
| 3 | Primary tabs | KEEP 5 tabs | `page.tsx` WORKSPACE_TABS | Yes | No | No | **A** | GREEN |
| 4 | Tab ordering | Inicio…Reportes | Same | Yes | No | No | **A** | GREEN |
| 5 | Smart Start placement | Dominant on Inicio | `SmartStartScreen` + home section | Yes | No | No | **A** | GREEN |
| 6 | Smart Start vocabulary | Remove SCI-*/ARCH-* | `src/lib/smart-start/options.ts` | Yes | No | No | **A** | GREEN |
| 7 | Sidebar grouping | Proyecto→…→Ajustes | `Sidebar.tsx` sections | Yes | No | No | **A/B** | YELLOW (composition review) |
| 8 | Sidebar ordering | Proyecto first | `Sidebar.tsx` | Yes | No | No | **A** | GREEN |
| 9 | Sidebar collapse | Existing collapsible sections | `SidebarSection` | Yes | No | No | **A** | GREEN |
| 10 | Menu grouping | Tier primary/secondary/expert | Toolbar + sidebar + content | Yes | No | No | **A** | GREEN |
| 11 | False ActionButtons | Hide from commercial face | Panel content toolbars | Yes (conditional render) | No | No | **A** | GREEN |
| 12 | Pack cue from Resultados | Soft CTA → reports | `setActiveWorkspaceSection("reports")` (exists) | Yes | No new engine | No | **A** | GREEN |
| 13 | Reportes as Pack home | KEEP | Reportes section | Yes | No SPE change | No | **A** | GREEN |
| 14 | Explorer default | Collapse/hide | `PanelState.leftCollapsed` via PlanningMode | Yes — set initial `true` | Mode producer values only | **No** Layout/Window/Dock model | **B** | YELLOW |
| 15 | Inspector panel default | Collapse/hide | `rightCollapsed` | Same | Same | No | **B** | YELLOW |
| 16 | Console default | Collapse/hide | `bottomCollapsed` | Same | Same | No | **B** | YELLOW |
| 17 | PlanningMode default | Collapsed commercial initial | `PlanningMode.apply()` / `DEFAULT_PANEL_STATE` sync | Yes — visual initial state | UX-2.10 producer; not persistence | **No model unfreeze** | **B** | YELLOW |
| 18 | Seed window policy | Gate off commercial | `WorkspaceActivationSeed` | Yes — early return / env / profile | Seed Freeze already says temporary | No Window model rewrite | **A/B** | GREEN→YELLOW if profile wiring |
| 19 | StatusBar policy | Hide until meaningful | `AppShell` / `StatusBar` | Prefer StatusBar null-when-empty **or** additive `statusBar` forward | D47 WorkspaceLayout API frozen against **breaking** change; additive optional OK with review | Do **not** remove status **grid region** (that would be shell layout) | **B** | YELLOW |
| 20 | Full-bleed workspace | Content-forward | Consequence of collapsed panels + header demotion | Yes | No | No | **A** (result of 14–17 + header) | GREEN via YELLOW deps |
| 21 | Empty-state treatment | Hide misleading panel empties | Explorer/Inspector/Console content | Yes if panels collapsed; else hide CTAs | No | No | **A** | GREEN |
| 22 | Expert/secondary controls | Progressive disclosure | Lab profile + sidebar | Yes | No | No | **A** | GREEN |
| 23 | Dual header demotion | Remove workspace brand H1 | `WorkspaceContent` | Yes | No | No | **A** | GREEN |
| 24 | Static Ready removal | Remove | `WorkspaceContent` | Yes | No | No | **A** | GREEN |
| 25 | Density/hierarchy | Content-first | Composition + CSS tokens | Yes within existing tokens | No theme rewrite required | No | **A** | GREEN |

---

## 6. Category A — Presentation Safe (GREEN)

- Single brand in toolbar; demote/remove workspace dual brand + Ready  
- Project context as non-brand text  
- Tabs KEEP (names/order/roles); Smart Start on Inicio  
- Smart Start copy without SCI-*/ARCH-*  
- Sidebar title/order tweaks (Proyecto first); collapsible expert sections  
- Menu/CTA hierarchy presentation; hide false ActionButtons / New Series / Console chips when panels visible  
- Pack cue CTA on Resultados using existing `setActiveWorkspaceSection("reports")`  
- Reportes remains Pack home; no sixth tab  
- Empty-state honesty via hide/collapse of misleading panel chrome  
- Lab profile / Ajustes as secondary  
- Density via existing tokens (no design-system rewrite)  
- Seed commercial-face early-return / env gate (preferred simple form)

---

## 7. Category B — Controlled Implementation (YELLOW)

| Item | Constraint |
|------|------------|
| **PlanningMode / PanelState defaults** | Collapse L/R/B by setting `leftCollapsed/rightCollapsed/bottomCollapsed: true` in commercial initial state. Sync `DEFAULT_PANEL_STATE` if required. **Do not** change LayoutEngine, Dock registry, or Window contracts. Verify `WorkspaceBodyLayout` collapsed chrome (handles) acceptable for commercial face. Prefer commercial profile / mode initial over deleting panel components. |
| **Sidebar regroup** | Reorder/relabel within `Sidebar.tsx`; do not invent new navigation architecture or routes. |
| **StatusBar hide-until-meaningful** | Prefer: StatusBar renders null/minimal when no truthful content **or** non-breaking additive `statusBar` slot forward from page→WorkspaceLayout→AppShell. **Do not** remove AppShell status **grid region** / LayoutEngine status track. UX-4.7 “permanent default” = composition default, not license to invent status content. |
| **Seed gate (if profile-based)** | Gate in `WorkspaceActivationSeed` only; no WindowRegistry schema change. |
| **Full-bleed** | Achieved as effect of collapsed panels + header demotion; no Layout model change. |

---

## 8. Category C — Architectural Decision Required

### **NONE required for Proposal A CTR Product Face.**

Documented non-goals (would be Category C / Owner if pursued later — **deferred, not approved**):

| Hypothetical | Why C | CTR necessity |
|--------------|-------|---------------|
| Remove StatusBar **region** from AppShell grid / LayoutEngine | Shell layout model | **No** — hide content suffices |
| Populate AppShell Inspector / Dock with domain model | Dock/Inspector contracts | **No** — Análisis in-canvas KEEP |
| Window/Dock/Layout **model** redesign to mimic Lovable | Model unfreeze | **No** — adopt face not architecture |
| Session / persistence / Visibility-Command schema | Contracts | **No** |

**ARCH-U:** **NOT OPENED.**

---

## 9. Category D — Rejected / Deferred

| Item | Disposition |
|------|-------------|
| Sixth top-level Pack tab | **Reject** (CRP-3) |
| Theme/token system rewrite | **Defer / Out** — existing tokens suffice |
| Marketplace / Lovable publish | **Owner track** — Out of CRP-4 impl |
| Fix `validate:workspace-architecture` FAIL 22/26 | **Defer** — pre-existing; not Product Face dependency |
| Delete panel infrastructure components | **Reject** — prefer collapse/hide commercial face |
| SCI workflow / SPE engine changes | **Reject** |

---

## 10. PlanningMode Decision (mandatory)

### Current implementation

- `PlanningMode.apply()` returns `PanelState` with all `*Collapsed: false` and widths 280/280/240.  
- `WorkspaceContent` mounts `<PanelProvider initialState={PlanningMode.apply()}>`.  
- `PanelState` documented as **visual state (no persistence)**.  
- `WorkspaceBodyLayout` already branches on `leftCollapsed` / etc.  
- Independent of WindowManager, Dock registry, and LayoutEngine region **models**.

### Dependency

Commercial collapse depends on **initial visual PanelState**, not Layout/Window/Dock model unfreeze.

### Presentation-safe?

**Yes.** Option 1 from gate brief: collapse/hide via existing presentation/state controls (`initialState` / mode producer / optional commercial mode values).

### Model unfreeze required?

**No** for CTR Proposal A.

### Final classification

**CATEGORY B — Controlled Implementation**  
Fence: change initial collapsed flags; keep panel infrastructure; do not touch LayoutEngine/Dock/Window models; regression-check resize handles when collapsed.

---

## 11. Window / Dock / Layout Decision

| Model | Proposal A requires change? |
|-------|----------------------------|
| WindowDefinition / WindowState / Registry | **No** (seed gate only) |
| Dock system | **No** (remain empty/unused) |
| LayoutEngine / AppShell regions | **No** (do not remove status track) |
| Snap / window tabs | **No** |

**Result: No model changes required.**

---

## 12. Sidebar / Menu Decision

**Approved:** Sidebar = Proyecto support IA (Proyecto → Científico → Análisis → Recursos → Ajustes). Tabs own journey. Presentation/grouping only — **Category A/B**. No architectural navigation change.

---

## 13. Tabs / Scientific Journey Decision

**Confirmed:** Inicio → Datos → Análisis → Resultados → Reportes within existing `WorkspaceSection` / SPE continuity.  
Smart Start remains inside Inicio. Pack under Reportes. Resultados cue = existing action wiring.  
**No SPE workflow change.**

---

## 14. Header / Product Face Decision

**Confirmed Category A:** single Scientific Graph AI brand in toolbar; remove/demote workspace duplicate brand; remove static Ready; project as context.

---

## 15. False Affordance / Seed / Status Decisions

| Item | Gate |
|------|------|
| Empty Explorer/Inspector/Console | Collapse via PanelState (**B**); hide false CTAs (**A**) |
| Inert New Series / ActionButtons / chips | Hide (**A**) |
| Static Ready | Remove (**A**) |
| Seeds A/B | Gate off commercial (**A/B**); no Window model rewrite |
| Empty StatusBar | Hide until meaningful (**B**); no status region deletion |

---

## 16. Design System / Tokens

Existing theme tokens support Proposal A. **No** token/theme rewrite approved. Category **A**. Broad design-system work = **D / Out**.

---

## 17. Lovable Plan A Approval

**APPROVED** as visual exploration target for later CRP-5/Plan A:

- Single header, tabs, Proyecto sidebar, content-forward workspace, collapsed IDE, no seeds, Smart Start, Reports/Pack, CTA hierarchy  

**Fence:** visual target only — **not** architectural migration. Lovable must not assume Window/Dock/Layout model rewrite.

---

## 18. Plan B Approval

**APPROVED.** Same Proposal A target implementable via controlled repository work (GREEN+YELLOW fences) if Lovable fails. ChatGPT specs tickets; Cursor implements under this gate. Non-blocking if Lovable fails.

---

## 19. Plan C Approval

**APPROVED** as CTR floor fallback (still inside fences):

1. Collapse L/R/B (**B**)  
2. Gate seeds (**A/B**)  
3. Demote dual header + Ready (**A**)  
4. StatusBar hide-until-meaningful (**B**)  
5. Preserve Smart Start / tabs / Pack (**A**)  
6. Optional Pack cue (**A**)  

---

## 20. Implementation Fence (CRP-5/6)

### GREEN — safe to implement (after path selection)

Brand demotion · Ready removal · Smart Start copy · false CTA hide · Pack cue · tab/sidebar label-order (non-structural) · seed early-return gate · token-consistent density polish  

### YELLOW — controlled implementation

PlanningMode / `PanelState` commercial defaults · StatusBar hide policy without removing grid region · sidebar regroup composition · verify full-bleed after collapse · lab-profile interaction with panels  

### RED — no implementation until separately authorized

LayoutEngine / AppShell region model changes · Window model redesign · Dock model redesign · Session/persistence/schema · Visibility/Command schema · AppShell Inspector populate · SPE/engine changes · ARCH-U  

**RED items for Proposal A CTR: none mandatory.**

---

## 21. Plan A / B / C Path Impact

| Path | CRP-4 modification? |
|------|---------------------|
| Plan A Lovable | Remains **PRIORITY**; brief = Proposal A visual; arch fence restated |
| Plan B repo | Remains viable under GREEN+YELLOW |
| Plan C minimum | Remains viable; subset of A |

No path cancelled by CRP-4.

---

## 22. CRP-5 Readiness

| Ready | Item |
|-------|------|
| Yes | Approved target = Proposal A with fences |
| Yes | Implementation fences GREEN/YELLOW/RED |
| Yes | Unresolved arch questions for CTR = **none** (deferred C non-goals documented) |
| Yes | Lovable brief readiness |
| Yes | Plan B / Plan C readiness |
| Next | **CRP-5.2** capture Visual Corpus (VC-01…14 from CRP-1) |
| Next | **CRP-5.3** Path Selection (A priority → B → C) |

Do **not** execute CRP-5 in this phase.

---

## 23. Validation Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) | No `src` changes |
| SPE-1.V umbrella | `npm run validate:spe-1v-umbrella` | **PASS** | SPE CLOSED preserved |
| Workspace architecture | cite CRP-1 | **FAIL 22/26 pre-existing** | Disclosed; **not** CRP-4 Product Face blocker; **not fixed** |
| Lint / Build | — | Not CRP-4 gate; prior OOM / NOT RUN | Tooling ≠ decision |

---

## 24. Documentation / Git

### Created
- `docs/CRP/official-records/CRP-4-Layout-Decision-Gate.md`

### Updated
- `docs/CRP/official-records/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/SPE/official-records/README.md` (next pointer)

### Untouched
- SPE-1 Official Record bodies  
- **`src/**`**  
- SemVer / tags  

---

## 25. Architectural Decision Rule Outcome

```text
Proposal A approved without ARCH-U.
Category C for CTR = NONE.
Prefer collapse/hide/gate over model unfreeze.
```

---

## 26. CRP-4 Gate

| Criterion | Result |
|-----------|--------|
| Controlled classification of Proposal A | **PASS** |
| Presentation vs architecture separated with evidence | **PASS** |
| PlanningMode decided (B, not C) | **PASS** |
| Window/Dock/Layout = no model change | **PASS** |
| Implementation fence for CRP-5/6 | **PASS** |
| Lovable / Plan B / Plan C readiness | **PASS** |
| SPE CLOSED / SemVer 1.0.0 / CTR NOT YET / no src | **PASS** |
| No blocker preventing CRP-5 | **PASS** |

```text
CRP-4 = PASS
```

---

## Final certification language

```text
CRP-4                          = PASS (Layout Decision Gate)
Proposal A                     = APPROVED WITH FENCES
ARCH-U                         = NOT ACTIVE
Category C (CTR-required)      = NONE
PlanningMode collapse          = CATEGORY B (visual PanelState)
Window/Dock/Layout models      = UNCHANGED
src/**                         = NO CHANGES
SPE-1                          = CERTIFIED / CLOSED
SemVer                         = 1.0.0
Commercial Test Ready          = NOT YET
Next                           = CRP-5.2 Visual Corpus → CRP-5.3 Path Selection
Plan A Lovable                 = PRIORITY (visual only; after corpus)
```

**End of Official Record — CRP-4 PASS · STOP**
