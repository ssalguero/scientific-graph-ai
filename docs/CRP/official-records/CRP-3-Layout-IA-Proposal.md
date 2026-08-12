# CRP-3 — Layout / IA Proposal

**Date:** 2026-08-11  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Layout / Information Architecture / Product Face **proposal** — **NO `src/**` IMPLEMENTATION · NO LOVABLE EXECUTION · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Evidence basis:** [`CRP-2-Product-Face-Diagnosis.md`](./CRP-2-Product-Face-Diagnosis.md) · CRP-0/1 · SPE-1.C / SPE-1.V  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-3** | **PASS** — Layout / IA Proposal complete |
| **CRP-0 / 1 / 2** | PASS (prior) |
| **SPE-1** | **CERTIFIED / CLOSED** (untouched) |
| **SemVer** | **1.0.0** (untouched) |
| **Commercial Test Ready** | **NOT YET** |
| **Recommended proposal** | **Proposal A — Recommended Product Face** |
| **UI / `src/**` changes** | **NONE** |
| **Lovable** | Plan A brief ready; **not executed** |
| **Next** | **CRP-4 — Layout Decision Gate** |

```text
CRP-3 = PASS (DESIGN / SPECIFICATION ONLY)
STOP — next = CRP-4 Layout Decision Gate
```

---

## 2. Design objective (locked from CRP-2)

Enable a cold external user to understand: what the product is · where they are · what they can do · what to do next · how to move Smart Start → Data → Analysis → Results → Reports/Pack · where results live · how to publish — **without** understanding IDE infrastructure.

**Core IA rule (preserved):** Tabs own the journey. Sidebar supports project/science.

**Ambition:** High on Product Face / menu / sidebar / CTA hierarchy. **Controlled** on architecture.

---

## 3. Recommended Product Face (Proposal A)

### One-sentence target

A single Spanish-first scientific application chrome: **one brand · journey tabs · supporting sidebar · full-bleed scientific workspace · no open empty IDE scaffold · no demo windows · truthful StatusBar policy · Reportes/Pack discoverable.**

### Composition (Top → Bottom)

```text
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (single band)                                            │
│  Brand: Scientific Graph AI                                     │
│  Context: project/session name (demoted, not second brand)      │
│  Primary nav: Inicio | Datos | Análisis | Resultados | Reportes │
│  Secondary: Lab profile · optional overflow (⋯)                 │
├──────────────┬──────────────────────────────────────────────────┤
│ SIDEBAR      │ WORKSPACE (dominant scientific content)          │
│ Project /    │                                                  │
│ Science      │  [ Smart Start OR stage content ]                │
│ support      │                                                  │
│              │  Contextual stage CTAs (next step / Pack cue)    │
│              │                                                  │
│              │  (L/R/B IDE panels NOT open by default)          │
├──────────────┴──────────────────────────────────────────────────┤
│ STATUS (optional): truthful only — else HIDDEN                  │
└─────────────────────────────────────────────────────────────────┘
```

### Composition (Left → Right)

| Region | Role |
|--------|------|
| **Left — Sidebar** | Project + modules + shortcuts; collapsed sections for expert |
| **Center — Workspace** | Full content for active tab / Smart Start; primary CTA in content |
| **Right / Bottom IDE** | **Collapsed/hidden** on commercial default |
| **Floating windows** | Product windows only; **no seeds** |
| **AppShell Inspector** | Remains `visible={false}` / unused |

---

## 4. Header Proposal

| Current | Target | Treatment |
|---------|--------|-----------|
| Toolbar h1 “Scientific Graph AI” | **Sole brand** | **KEEP** |
| WorkspaceContent strip “Scientific Graph AI” + “Current Project” + “Ready” | **Remove second brand**; optional thin context line with project name only | **REMOVE** brand duplicate · **MERGE** project into header context · **REMOVE** static “Ready” |
| Sidebar “Dashboard Científico” | Rename to product-supporting title (e.g. “Proyecto” / keep shorter label) | **DEMOTE** competing product-name feel · **KEEP** as sidebar title role |

**Rule:** Exactly **one** product brand signal in the first viewport (toolbar). Project/session is **context**, never a second H1 brand.

---

## 5. Primary Tabs / Journey Proposal

**Principle:** Tabs own the journey — **no new top-level nav system**.

| Tab | Order | Role | Notes |
|-----|-------|------|-------|
| **Inicio** | 1 | Home / Smart Start host | Smart Start is **entry content on Inicio**, not a separate top-level IA |
| **Datos** | 2 | Data stage | KEEP |
| **Análisis** | 3 | Analysis stage | KEEP; in-canvas analysis UI stays here |
| **Resultados** | 4 | Results stage | KEEP |
| **Reportes** | 5 | Reports + Pack/PDF | KEEP; Pack **belongs here** functionally; add **cue** from Resultados |

- **Active state (conceptual):** clear selected tab; optional subtle stage progress (Inicio→…→Reportes) without new engine.  
- **Renames:** not required for CTR; Spanish names KEEP.  
- **Remove tabs:** none.  
- **Pack:** not a sixth tab — lives under Reportes + contextual CTA after Resultados.

---

## 6. Sidebar Proposal

### Purpose

**Project / science support** — not journey owner.

### Target grouping (order)

1. **Proyecto** (always visible): + Nuevo gráfico · Biblioteca · project file actions  
2. **Flujo** (optional shortcuts, demoted): deep-links to Datos / Análisis / Reportes if useful — must not replace tabs  
3. **Científico** (collapsible): module toggles  
4. **Análisis** (collapsible): Asistente (when enabled) · Reportes shortcut  
5. **Recursos** (collapsible): function library · historial  
6. **Ajustes** (collapsible / footer): configuración  

### Visibility

| Always | Contextual | Progressive |
|--------|------------|-------------|
| Proyecto core actions | Module-dependent items | Expert modules, Asistente, dense settings |

**Title:** Prefer **“Proyecto”** (or equivalent) over “Dashboard Científico” to reduce brand competition (P1 vocabulary).

---

## 7. Menu Proposal

| Action class | Examples | Treatment |
|--------------|----------|-----------|
| **Primary** | Journey tabs; Smart Start cards; Pack when on Reportes | KEEP / emphasize |
| **Secondary** | Nuevo gráfico; Biblioteca; Results actions | KEEP |
| **Expert / config** | Lab profile; Ajustes; Historial; function library | DEMOTE / collapsible |
| **System** | Theme / diagnostics / recovery | HIDE from default face or overflow |
| **Export / report** | Pack Lite · Exportar PDF | KEEP under Reportes; CONTEXTUAL cue from Resultados |
| Shell breadcrumbs / ActionButton spans | Workspace › Canvas; inert Add | **HIDE / REMOVE** from face |
| Sidebar Reportes vs tab | Duplicate | **KEEP** shortcut (useful) |

---

## 8. Button / CTA Proposal

| Tier | Target | Placement |
|------|--------|-----------|
| **Primary CTA (cold)** | Smart Start card selection / “Modo experto” | Inicio workspace |
| **Workflow CTA** | Stage-specific next (e.g. toward Análisis / Resultados / Reportes) | In-content, per stage |
| **Secondary** | Nuevo gráfico; import; save project | Sidebar / stage tools |
| **Report/Pack CTA** | “Descargar Pack Lite” / “Exportar PDF” | Reportes; **cue** on Resultados when reportable |
| **Configuration** | Lab profile; Ajustes | Header secondary / sidebar footer |
| **Destructive** | Restablecer proyecto | Separated, confirmed | 

**False ActionButtons:** do not invent handlers — **HIDE** from commercial face.

---

## 9. Smart Start Proposal

| Aspect | Target |
|--------|--------|
| Prominence | Dominant content when Inicio + empty/cold session |
| Placement | Center workspace (Inicio), not a competing chrome region |
| Relation to tabs | Entry **into** journey; selecting a card advances to appropriate tab/flow |
| Wording | User goals only — **remove visible SCI-59 / SCI-60 / ARCH-5 jargon** (P2) |
| Cold user sees | “¿Qué desea hacer hoy?” + clear cards (dataset, compare, publication, math, recover) |
| Expert | “Entrar al laboratorio completo” remains secondary |

**KEEP** Smart Start; **DEMOTE** internal IDs.

---

## 10. Scientific Journey Composition

| Stage | Where | User sees | Next step cue | Return |
|-------|-------|-----------|---------------|--------|
| Smart Start / Inicio | Center | Cards | Card → Datos/Análisis/etc. | Tab Inicio |
| Datos | Center | Data/import UI | Cue toward Análisis when data ready | Tab |
| Análisis | Center | In-canvas analysis categories | Cue toward Resultados | Tab |
| Resultados | Center | Results | **Pack/Reportes cue** when applicable | Tab |
| Reportes | Center | Report + Pack/PDF | Complete journey | Tab |

Active stage = selected tab (+ optional non-engine progress hint). **No SPE workflow contract change.**

---

## 11. Reports / Pack Visibility

| Decision | Proposal |
|----------|----------|
| Functional home | **Reportes** tab (KEEP SPE surface) |
| Global cue | Soft: Results stage CTA “Ir a Reportes / Pack” when scientific report exists |
| Smart Start | Keep “Evaluar publicación” card (copy cleaned) |
| Sidebar | KEEP Reportes shortcut |
| New tab for Pack | **No** |

Goal: cold user understands workflow **can end** in publication output without SPE reopen.

---

## 12. IDE Scaffold Target Policy (DEFAULT COMMERCIAL FACE)

| Surface | Policy | Why | CRP-4? |
|---------|--------|-----|--------|
| Explorer | **COLLAPSE / HIDE** | Empty false affordance (P0) | Review if initial PanelState change contested |
| Panel Inspector | **COLLAPSE / HIDE** | Empty; real inspector in Análisis (P0) | same |
| Console | **COLLAPSE / HIDE** | Empty theater (P0) | same |
| PlanningMode L/R/B | **Default collapsed** (or commercial mode initial state) | Canvas density (P0) | **CRP-4** if treated as frozen mode contract |
| Dock empty | **HIDE** | No value | Low |
| Floating product windows | **KEEP** when real | Product feature | No |
| WorkspaceActivationSeed | **REMOVE** from commercial face | Demo residue (P0) | Low if seed gate only |
| StatusBar | **HIDE until meaningful** OR **POPULATE** truthful | Empty theater (P1) | Low |
| AppShell Inspector | **KEEP** null (`visible={false}`) | Do not populate without need | Populate = CRP-4 |
| EN breadcrumbs / hints | **HIDE / DEMOTE** | Misleading shell grammar | Low |

---

## 13. Seed Window Policy

| Item | Target |
|------|--------|
| Ventana Workspace A/B | **Must not appear** on default commercial face |
| WorkspaceActivationSeed | **Disabled / gated** (dev / non-commercial / diagnostics only) |
| Testing | May remain behind explicit non-commercial profile |

**No demo residue dominates commercial face.** Implementation later = seed policy, not Window model rewrite.

---

## 14. StatusBar Policy

**Recommended:** **HIDE until meaningful** (preferred for CTR minimum).  
**Alternative:** **POPULATE** with truthful project/tab/status only — never empty chrome.

Empty StatusBar **must not** remain solely because the component exists.

---

## 15. False Affordance Treatment

| Affordance | Treatment |
|------------|-----------|
| Empty Explorer | HIDE/COLLAPSE |
| Empty panel Inspector | HIDE/COLLAPSE |
| Empty Console | HIDE/COLLAPSE |
| Inert New Series | HIDE |
| ActionButton spans | HIDE |
| Console chips | HIDE |
| Static Ready | REMOVE |
| Seed windows | REMOVE/gate |
| Empty StatusBar | HIDE or POPULATE |

---

## 16. Visual Hierarchy (ranked)

1. Product identity (single brand)  
2. Primary scientific journey (tabs)  
3. Current workspace/content (Smart Start or stage)  
4. Primary CTA (card / next / Pack)  
5. Secondary tools (sidebar project actions)  
6. Context / configuration (lab profile, ajustes)  
7. Infrastructure / diagnostics (collapsed; expert only)

---

## 17. Density Model

- **Chrome budget:** minimal — header + sidebar + content; no open empty L/R/B.  
- **Workspace majority:** scientific content owns most of the viewport.  
- **Collapse:** IDE panels, expert sidebar sections, StatusBar if empty.  
- **Disappear from default:** seeds, false CTAs, dual brand, EN shell theater.  
- **Contextual disclosure:** panels/tools only when they have real content or expert mode.

No arbitrary new pixel SSOT; existing PlanningMode sizes irrelevant if collapsed by default.

---

## 18. Responsive / Window Behavior (conceptual)

| Context | Behavior |
|---------|----------|
| Normal desktop | Proposal A composition |
| Reduced width | Collapse sidebar to rail; keep tabs; keep content dominant |
| Collapsed sidebar | Journey still via tabs |
| Contextual panels | Appear only when needed (not default) |
| Floating windows | Product-only; no seeds |

Window/Dock **model** unchanged. Structural panel API unfreeze → **CRP-4**.

---

## 19. Visual Design Direction (for Lovable later)

| Aspect | Direction |
|--------|-----------|
| Tone | Professional scientific product; calm; Spanish-first |
| Hierarchy | Brand → tabs → content → sidebar support |
| Density | Content-forward; low scaffold noise |
| Whitespace | Prefer clear content breathing room over chrome strips |
| Grouping | Journey in header; project in sidebar; stage tools in content |
| Emphasis | Primary CTAs; Pack when relevant |
| Panels | Absent/collapsed by default |
| Typography | Existing theme tokens; one display brand; quieter context |
| Buttons | Clear primary / secondary / destructive tiers |
| Navigation | Tab journey spine highly legible |
| Feel | Finished lab product — not VS Code clone |

**Preserve** existing theme/token architecture unless CRP-4 says otherwise.

---

## 20. Alternative Proposals

### Proposal A — Recommended (preferred)

Full Product Face reorganization of chrome: single header, collapsed IDE, gated seeds, sidebar “Proyecto”, Pack cue from Resultados, Smart Start copy clean, StatusBar hide-until-meaningful.

| Dimension | Score |
|-----------|-------|
| Clarity | Highest |
| Visual impact | High |
| Implementation complexity | Medium (presentation + visibility) |
| Architectural risk | Low–med (PlanningMode initial state may need CRP-4 note) |
| CTR suitability | Best |
| Lovable suitability | Best visual exploration target |

### Proposal B — Conservative

Keep more current structure: collapse L/R/B + gate seeds + demote workspace brand strip only; keep “Dashboard Científico”; minimal Pack cue; StatusBar hide; less sidebar rename/reorder.

| Dimension | Score |
|-----------|-------|
| Clarity | Good |
| Visual impact | Medium |
| Complexity | Lower |
| Arch risk | Lower |
| CTR suitability | Adequate if P0 closed |
| Lovable | Weaker aspiration |

### Proposal C — Minimum Commercial Face

Exact CRP-2 Commercial Minimum: collapse empty IDE · gate seeds · demote dual header · StatusBar policy · preserve Smart Start/tabs/Pack · optional Pack cue.

| Dimension | Score |
|-----------|-------|
| Clarity | Sufficient for CTR floor |
| Visual impact | Lowest |
| Complexity | Lowest |
| Arch risk | Lowest |
| CTR suitability | Floor |
| Lovable | Fallback if A too broad |

### Recommendation

**Proposal A** — evidence from CRP-2 P0/P1 shows dual stack + density + demo residue require more than cosmetic hide; A still stays presentation-first and preserves tabs-own-journey.  
**CRP-4** may approve A fully, or approve C as first ship with A as visual target via Lovable.

---

## 21. Decision Matrix

| Decision | Current | Proposed (A) | Reason | Evidence | Risk | CRP-4? |
|----------|---------|--------------|--------|----------|------|--------|
| Header | Dual brand | Single brand + context | Hierarchy | RD-V02-01 | Low | No |
| Primary tabs | 5 ES tabs | KEEP order/roles | Journey ownership | CRP-2 | Low | No |
| Sidebar | Dashboard Científico | Proyecto support IA | Vocabulary + role | RD-V02-08 | Low | No |
| Toolbar | Brand+tabs+profile | KEEP; sole brand home | Identity | CRP-2 | Low | No |
| Menu | Mixed + false CTAs | Tiered; hide false | Honesty | CRP-2 §7 | Low | No |
| Smart Start | Strong + jargon | KEEP; clean copy | Cold entry | RD-V02-10 | None | No |
| Pack | Reportes only | Reportes + Results cue | Discoverability | RD-V02-09 | Low | No |
| Explorer | Open empty | HIDE/COLLAPSE | False affordance | RD-V02-03 | Low–med | Review / maybe |
| Inspector panel | Open empty | HIDE/COLLAPSE | vs Análisis | RD-V02-04 | Low–med | Review / maybe |
| Console | Open empty | HIDE/COLLAPSE | Theater | RD-V02-05 | Low–med | Review / maybe |
| PlanningMode | L/R/B open | Default collapsed | Density | RD-V02-02/11 | Med | **If contract freeze** |
| Seed windows | A/B auto | Gate off commercial | Demo | RD-V02-06 | Low | No (seed policy) |
| StatusBar | Empty | Hide until meaningful | Theater | RD-V02-07 | Low | No |
| False ActionButtons | Visible | HIDE | Fake CTA | CRP-2 | Low | No |
| Canvas/workspace | Squeezed | Full-bleed content | Hierarchy | RD-V02-11 | Low if panels collapsed | Tied to PlanningMode |
| AppShell Inspector | null | KEEP null | Fence | CRP-2 | — | Populate = Yes |
| Window/Dock models | Infra present | Unchanged | Fence | D01–D02 | High if touched | **Yes if rewrite** |

---

## 22. Implementation Fence

### SAFE PRESENTATION CHANGES

- Demote/remove workspace dual brand strip / Ready  
- Hide EN breadcrumbs / panel ActionButtons / New Series from face  
- Smart Start copy without SCI-* IDs  
- StatusBar hide or truthful populate  
- Seed gate / disable WorkspaceActivationSeed on commercial face  
- Pack cue copy/CTA on Resultados (existing navigation)  
- Sidebar label “Proyecto”; section order tweaks  

### REVIEW REQUIRED

- Default PanelState / PlanningMode collapsed for commercial face  
- Lab profile interaction with panel defaults  
- Ensuring Análisis in-canvas inspector remains primary after panel hide  

### CRP-4 DECISION REQUIRED

- Any change treated as Layout / Window / Dock **model** unfreeze  
- Replacing AppShell five-region model  
- Populating AppShell Inspector / Dock with new domain model  
- Session / persistence / schema / Visibility-Command redesign  
- If PlanningMode initial state is ruled architectural (not presentation)

### OUT OF CRP

- Marketplace / Lovable publish  
- SemVer bump  
- SPE reopen / new analysis engines  
- EXPORT-3 ZIP · AIR-1 · ARCH-U as program  
- RD-V03 polish unless bundled later  

---

## 23. Lovable Plan A Exploration Brief

**Purpose:** Visual exploration / reference for Product Face — **not** architectural authority.

### Show us
- New Product Face matching Proposal A composition  
- Clear single header brand + journey tabs  
- Sidebar as Proyecto support (ordered groups)  
- Button/CTA hierarchy (primary Smart Start → stage next → Pack)  
- Clean full workspace without empty IDE panels  
- Obvious Smart Start → Datos → Análisis → Resultados → Reportes/Pack  
- Visible Reports/Pack path and Results→Reportes cue  
- Finished professional scientific product perception  

### Preserve
- Scientific functionality and SPE workflow  
- Smart Start, Datos, Análisis, Resultados, Reportes/Pack  
- Existing token/theme language (reinterpret, don’t invent rogue system)  
- Architectural boundaries (Session, Window, Dock, Layout models, engines)

### Remove / demote visually
- IDE scaffold dominance  
- Empty Explorer/Inspector/Console  
- Seed windows  
- Duplicate branding  
- False affordances  
- Developer / SCI-* residue  

### Do not assume
- Window / Dock / Layout model rewrite  
- Session / persistence / engine / governance changes  

**Adopt the visual/product-face result, not Lovable’s architecture.**

---

## 24. Plan B Translation (if Lovable fails)

| Visual concept | Repository lever (conceptual) |
|----------------|-------------------------------|
| Single brand header | `AdaptiveToolbar` brand KEEP; omit/demote `WorkspaceContent` header brand |
| Project context | Thin context in header or sidebar; not second H1 |
| Tabs journey | Existing `visibleWorkspaceTabs` / page tab wiring KEEP |
| Sidebar Proyecto | `Sidebar.tsx` title + section order/labels |
| Hide IDE panels | PlanningMode / PanelProvider initial collapsed **or** commercial face visibility wiring |
| Hide false CTAs | Stop rendering ActionButton/New Series in empty panel contents for commercial face |
| Gate seeds | `WorkspaceActivationSeed` no-op / env / profile gate |
| StatusBar | Omit slot or pass empty→hidden policy in AppShell wiring |
| Pack cue | Resultados section CTA → `setActiveWorkspaceSection("reports")` |
| Smart Start copy | `src/lib/smart-start/options.ts` user-facing strings |
| AppShell Inspector | Leave `visible={false}` |

ChatGPT specifies tickets from this table; Cursor implements under CRP-4/5 fences.

---

## 25. Plan C Minimum Face (impact rank)

| Rank | Change | Maps to |
|------|--------|---------|
| 1 | Collapse/hide Explorer, panel Inspector, Console | P0 RD-V02-02/03/04/05/11 |
| 2 | Gate seed windows | P0 RD-V02-06 |
| 3 | Demote/remove dual brand + Ready | P0 RD-V02-01 |
| 4 | StatusBar hide-until-meaningful | P1 RD-V02-07 |
| 5 | Preserve Smart Start + tabs + Pack/PDF | Journey |
| 6 | Optional Results→Reportes cue | P1 RD-V02-09 |

---

## 26. Architecture Risk

| Item | Risk | Disposition |
|------|------|-------------|
| PlanningMode default collapse | Med if frozen contract | **CRP-4 DECISION REQUIRED** to classify presentation vs model |
| Window/Dock/Layout model rewrite | High | **OUT** / deferred |
| AppShell Inspector populate | Med–High | **CRP-4** if proposed |
| Session/persistence/engines | High | **FORBIDDEN** |
| Theme token rewrite | Med | **OUT** unless CRP-4 |

Silent architectural assumption = **FAIL** of CRP-3 fence. None assumed as approved.

---

## 27. Acceptance Criteria (CRP-3 self-check)

| Criterion | Met? |
|-----------|------|
| Product clarity | Yes — single brand + scientific app face |
| Journey clarity | Yes — tabs + Smart Start + Pack cue |
| Navigation clarity | Yes — tabs own journey; sidebar supports |
| Visual hierarchy | Yes — ranked §16 |
| Scaffold honesty | Yes — IDE policy §12 |
| Finished perception | Yes — no seeds/dual brand/empty theater in target |
| Discoverability | Yes — Reportes + Results cue |
| Architectural safety | Yes — fence §22/26 |
| Lovable readiness | Yes — §23 brief |
| Plan B readiness | Yes — §24 translation |

---

## 28. Validation Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) | No `src` changes |
| SPE-1.V umbrella | `npm run validate:spe-1v-umbrella` | **PASS** (`pass: true`, exit 0) | SPE remains CLOSED |
| Lint / Build | — | Not required for CRP-3 gate; prior OOM / NOT RUN disclosed | Tooling ≠ product |

---

## 29. Documentation / Git

### Created
- `docs/CRP/official-records/CRP-3-Layout-IA-Proposal.md`

### Updated
- `docs/CRP/official-records/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/SPE/official-records/README.md` (next pointer only)

### Untouched
- SPE-1 Official Record bodies  
- **`src/**`**  
- SemVer / tags  

---

## 30. CRP-3 Gate

| Criterion | Result |
|-----------|--------|
| Concrete target composition | **PASS** |
| Header / tabs / sidebar / CTA / Smart Start / Pack defined | **PASS** |
| IDE / seed / StatusBar / false affordance policies | **PASS** |
| Alternatives A/B/C + recommendation | **PASS** |
| Decision matrix + implementation fence | **PASS** |
| Lovable brief + Plan B/C translations | **PASS** |
| Architecture fence explicit | **PASS** |
| SPE closed / SemVer 1.0.0 / CTR NOT YET / no src | **PASS** |

```text
CRP-3 = PASS
```

Proposal is concrete enough for **CRP-4 Layout Decision Gate** to approve presentation scope and classify any PlanningMode/panel default as presentation vs CRP-4 architectural dependency.

---

## Final certification language

```text
CRP-3                          = PASS (Layout / IA Proposal)
Recommended                    = Proposal A
Fallback                       = Proposal C (Commercial Minimum)
Lovable                        = Plan A brief READY (not executed)
Plan B                         = Translation READY
src/**                         = NO CHANGES
SPE-1                          = CERTIFIED / CLOSED
SemVer                         = 1.0.0
Commercial Test Ready          = NOT YET
ARCH-U                         = NOT ACTIVE
Next                           = CRP-4 Layout Decision Gate
```

**End of Official Record — CRP-3 PASS · STOP**
