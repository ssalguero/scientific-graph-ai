# CRP-0 + CRP-1 — Series Open and Commercial Readiness Audit

**Date:** 2026-08-11  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Series opening + controlled evidence audit — **NO UI IMPLEMENTATION · NO LAYOUT REDESIGN · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-0** | **PASS** — series open / charter sync |
| **CRP-1** | **PASS** — Commercial Readiness Audit complete (evidence only) |
| **SPE-1** | **CERTIFIED / CLOSED** (unchanged; not reopened) |
| **SemVer** | **1.0.0** (unchanged; no bump/tag) |
| **Commercial Test Ready** | **NOT YET** |
| **RD-V02** | **OPEN / PARTIAL** — controlled subset (presentation · IA chrome · discoverability); **not** expanded to layout-model redesign |
| **ARCH-U** | **NOT ACTIVE** (default) |
| **Lovable** | Priority **future** Plan A exploration path; **not** executed in CRP-0/1; **non-blocking** |
| **UI implementation** | **NONE** |

```text
CRP-0 PASS
CRP-1 PASS (AUDIT ONLY)
STOP — next = CRP-2 Product Face Diagnosis
```

---

## 2. CRP-0 Charter Sync

### Records inspected

| Record | Finding |
|--------|---------|
| [`docs/PROJECT_STATUS.md`](../../PROJECT_STATUS.md) | Already named CRP as living next; required OPEN sync |
| [`docs/roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md) | Same — CRP next, CTR NOT YET |
| [`docs/SPE/official-records/SPE-1-Series-Closure.md`](../../SPE/official-records/SPE-1-Series-Closure.md) | SPE-1 CLOSED; CTR checklist; RD-V02 OPEN |
| [`docs/SPE/official-records/SPE-1.V-Validation-Evidence.md`](../../SPE/official-records/SPE-1.V-Validation-Evidence.md) | SPE surface discoverability PASS; RD-V02 commercial UX gap |
| [`docs/SPE/official-records/README.md`](../../SPE/official-records/README.md) | SPE closed; next = CRP |
| [`docs/UX/certification/UX-10-LOVABLE-READINESS.md`](../../UX/certification/UX-10-LOVABLE-READINESS.md) | Screenshot corpus **NOT FOUND**; Lovable **NOT EXECUTED** |
| `package.json` | `"version": "1.0.0"` |
| Approved CRP PLAN (Cursor plan) | Hybrid ownership; Plan A/B/C; RD-V02 partial |

### Records changed (minimum sync)

| Record | Change |
|--------|--------|
| `docs/CRP/official-records/README.md` | **Created** — CRP Official Records index |
| `docs/CRP/official-records/CRP-0-1-Series-Open-and-Audit.md` | **Created** — this Official Record |
| `docs/PROJECT_STATUS.md` | Sync: CRP **OPEN**; CRP-0/1 PASS; next = CRP-2 |
| `docs/roadmaps/ROADMAP.md` | Sync: CRP **OPEN**; living phase CRP-0/1; next = CRP-2 |
| `docs/SPE/official-records/README.md` | Next pointer → CRP Official Records (SPE remains CLOSED) |

### Records intentionally untouched

- SPE-1 Official Records body (closure text preserved; **no SPE reopen**)
- SemVer / git tags / `package.json` version
- DEP / UXC / SDC / RELEASE / PRS / PP Official Records
- All `src/**` product UI code (**no implementation**)
- Master Map denominator percentages (cite-only; **not reinvented**)

---

## 3. Commercial Readiness Audit

### Hard rule compliance

CRP-1 performed **inspection only**. No CSS redesign, layout rewrite, sidebar/menu/button moves, AppShell rewrite, Window/Dock model changes, or functional redesign.

### Audit method

1. Trace real composition from `src/app/page.tsx` → `WorkspaceLayout` → `AppShell` → regions.  
2. Read panel contents, PlanningMode defaults, seed host, Smart Start, Reportes/Pack surfaces.  
3. Cross-check SPE-1.C CTR checklist and RD-V02 disposition.  
4. Classify issues; produce RD-V02 register + Visual Corpus Requirements.

### Top findings (evidence-based)

1. **Dual chrome** — AppShell toolbar brand **and** WorkspaceContent header both say “Scientific Graph AI”; sidebar says “Dashboard Científico”.  
2. **IDE scaffold open by default** — `PlanningMode` opens left/right/bottom panels; Explorer/Inspector/Console always render empty shells with CTAs that do not drive product series.  
3. **Demo floating windows** — `WorkspaceActivationSeed` creates “Ventana Workspace A/B” when no product windows exist.  
4. **AppShell Inspector hidden** — `<Inspector visible={false}>`; real analysis UI lives in-canvas under Análisis.  
5. **Empty StatusBar** — permanent chrome, empty zones.  
6. **Scientific journey exists** — Smart Start + tabs Inicio/Datos/Análisis/Resultados/Reportes + Pack under Reportes (SPE surface PASS); global face still requires tribal knowledge to ignore scaffold chrome.  
7. **Problem class dominant:** presentation / IA chrome / UX discoverability — **not** missing SPE scientific engines.

---

## 4. Current Product Face

### What a cold user encounters first

1. Full AppShell (toolbar + sidebar + workspace + empty status).  
2. Toolbar: **Scientific Graph AI** + workspace tabs (**Inicio / Datos / Análisis / Resultados / Reportes**) + lab profile control.  
3. Sidebar: **Dashboard Científico** with project/graph/science modules.  
4. Workspace strip: **Project / Scientific Graph AI / Current Project / Ready**.  
5. Canvas flanked by open **Explorer** (left), **Inspector** (right), **Console** (bottom) — all empty-state copy.  
6. If no product windows: floating **Ventana Workspace A/B**.  
7. On home with empty session: **SmartStartScreen** — “¿Qué desea hacer hoy?” with journey cards.

### Product Face answers (required questions)

| # | Question | Evidence answer |
|---|----------|-----------------|
| 1 | What does a cold user see first? | Dual scientific + IDE chrome; Smart Start when gated; seed windows possible |
| 2 | Dominant visual hierarchy? | Competing: toolbar brand, workspace header, sidebar title, IDE panel chrome, floating seeds |
| 3 | One clear primary composition? | **No** — nested AppShell + PlanningMode IDE + WindowManager |
| 4 | Competing headers / branding? | **Yes** — toolbar h1 + workspace h1 + sidebar “Dashboard Científico” |
| 5 | Communicates what SGA is? | Partially (tabs + Smart Start); diluted by IDE scaffold |
| 6 | Communicates next action? | Smart Start yes when shown; otherwise IDE empty panels compete with tabs |

---

## 5. Current Layout Map

```text
Home (page.tsx)
└─ ProductCompositionHost
   └─ WindowManager (+ UX-9 seeds / command hosts)
      ├─ WorkspaceActivationSeed → "Ventana Workspace A/B" (if no product windows)
      └─ SessionProvider → GraphEditor
         └─ WorkspaceLayout → AppShell
            ├─ Toolbar     → AdaptiveToolbar (brand + tabs + lab profile)
            ├─ Sidebar     → Sidebar (Dashboard Científico)
            ├─ Workspace   → WorkspaceContent
            │                 ├─ header: Project / Scientific Graph AI / Current Project / Ready
            │                 └─ WorkspaceBodyLayout (PlanningMode: L/R/B OPEN)
            │                      ├─ LeftPanel   Explorer + EmptyState
            │                      ├─ Canvas      domain tabs content (Smart Start / Datos / …)
            │                      ├─ RightPanel  Inspector + EmptyState
            │                      └─ BottomPanel Console + EmptyState
            ├─ Inspector   → <Inspector visible={false}> → null
            ├─ panels      → WorkspacePanels + empty DockPanel(inspector)
            └─ StatusBar   → empty zones
```

### Problem taxonomy (layout)

| Aspect | Classification |
|--------|----------------|
| Dual headers / density of chrome | **VISUAL** / **IA** |
| Empty IDE panels open by default | **IA** / **UX** (presentation policy; model change = ARCH if structural) |
| Seed windows | **UX** (gate/remove presentation); Window API itself = **ARCHITECTURAL** if redesigned |
| AppShell Inspector null | **IA** presentation; unfreezing dock model = **ARCHITECTURAL** |
| Missing analysis engines | **OUT** — SPE scientific floors PASS |

**Default CRP stance:** presentation/IA chrome fixes preferred; **do not** assume ARCH-U.

---

## 6. Menu / Sidebar / Button Audit

### Primary navigation (KEEP — product)

| Surface | Role |
|---------|------|
| Toolbar tabs | Inicio · Datos · Análisis · Resultados · Reportes |
| Smart Start cards | Dataset / compare / publication / math graph / recover project |
| Sidebar project actions | Nuevo gráfico · biblioteca · .sgproj flows |
| Reportes Pack / PDF | Pack Lite + PDF export (SPE certified path) |

### Secondary / confusing

| Surface | Issue | Class | Direction* |
|---------|-------|-------|------------|
| Workspace › Canvas / Explorer / Inspector breadcrumbs | Shell grammar, not routing | VISUAL / IA | DEMOTE |
| ActionButton spans (“Add”, sync) | Look interactive; are `<span>` | UX | HIDE / DEMOTE |
| Explorer “New Series” CTA | No product handler evidenced | UX / FUNCTIONAL | HIDE or POPULATE later |
| Sidebar “Reportes” vs tab Reportes | Duplicated entry (useful but dual) | IA | KEEP (note) |
| LabUsageProfile in toolbar | Expert density control | IA | KEEP |
| Internal Smart Start IDs in copy | Developer jargon | UX | DEMOTE (copy) |

\*Direction = recommendation only; **not implemented**.

### Sidebar representation

- **Is:** scientific dashboard + project/file + module toggles + analysis shortcuts + settings.  
- **Cold-user useful:** Nuevo gráfico, módulos, Reportes, Smart Start path via Inicio.  
- **Infrastructure-ish:** English IDE panels outside sidebar; not sidebar itself.  
- **Ordering:** Project/science groups understandable; does **not** alone narrate Cold Start → Pack (tabs + Smart Start do).  
- **Redundant with tabs:** Reportes / some analysis entry points.

---

## 7. Empty / False Affordance Audit

| Surface | Looks like | Reality | Classify | Direction* |
|---------|------------|---------|----------|------------|
| Explorer empty | Series/layers manager | Always EmptyState; “New Series” inert | UX | HIDE |
| Right Inspector panel | Property inspector | Always EmptyState; real inspector in Análisis | IA / UX | HIDE |
| Console | Live console | “No output” forever | UX | HIDE |
| StatusBar | Product status | Empty zones | VISUAL | HIDE or POPULATE |
| Workspace “Ready” | Live status | Static string | VISUAL | DEMOTE |
| AppShell Inspector slot | Region | `visible={false}` → null | IA | HIDE / KEEP null |
| Empty Dock inspector | Docked tool | No children | IA | HIDE |
| Ventana Workspace A/B | Product windows | Demo seed | UX | REMOVE (gate) |
| Canvas IDE hints | Working Explorer/Inspector | Misleads | UX | DEMOTE |
| Panel ActionButtons | Buttons | Non-button spans | UX | HIDE / DEMOTE |
| Warnings/Errors chips (Console) | Active diagnostics | Empty theater | VISUAL | HIDE |

---

## 8. Scientific Journey Audit

**Path:** Cold Start → Data → Analysis → Results → Reports / Pack

| Step | Entry | Next-step visibility | Tribal knowledge? |
|------|-------|----------------------|-------------------|
| Cold Start | Smart Start when session empty; else Inicio tab | Cards + “Modo experto” | Low if Smart Start shown; high if buried under IDE chrome |
| Data | Tab **Datos** / Smart Start “Analizar un dataset” | Tab bar | Medium — IDE panels distract |
| Analysis | Tab **Análisis** + in-canvas inspector categories | Categories visible on tab | Medium — “Inspector” word overloaded |
| Results | Tab **Resultados** | Tab bar | Low–medium |
| Reports / Pack | Tab **Reportes** (+ sidebar Reportes); Pack Lite CTA | **Only after Reportes** (SPE-1.V surface PASS) | Medium for cold user who never opens Reportes |

**SPE-1 continuity:** Treated as **already certified**. This audit does **not** redesign scientific workflow engines. Gap is **global Product Face / presentation**, not SPE incomplete.

---

## 9. RD-V02 Register

### Controlled subset (IN for CRP)

| ID | Current behavior | Evidence | Class | CTR | Proposed direction* | Arch risk | Phase |
|----|------------------|----------|-------|-----|---------------------|-----------|-------|
| RD-V02-01 | Dual brand headers | `AdaptiveToolbar` + `WorkspaceContent` header | VISUAL / IA | Blocks clarity | DEMOTE workspace strip | Low | CRP-2→6 |
| RD-V02-02 | PlanningMode opens L/R/B empty panels | `PlanningMode.ts` all `*Collapsed: false` | IA / UX | Blocks finished perception | HIDE/collapse default | Med if mode API change vs visibility-only | CRP-2→6; CRP-4 if model |
| RD-V02-03 | Explorer false CTAs | `ExplorerContent.tsx` EmptyState | UX | Yes | HIDE | Low | CRP-2→6 |
| RD-V02-04 | Panel Inspector empty vs Análisis inspector | `InspectorContent.tsx` vs page Análisis | IA | Yes | HIDE panel; KEEP Análisis | Low | CRP-2→6 |
| RD-V02-05 | Empty Console | `ConsoleContent.tsx` | UX | Yes | HIDE | Low | CRP-2→6 |
| RD-V02-06 | Seed windows A/B | `ProductCompositionHost.tsx` | UX | Yes | REMOVE/gate commercial face | Low if seed-only; High if Window model rewrite | CRP-2→6 |
| RD-V02-07 | Empty StatusBar | `StatusBar` default empty | VISUAL | Yes | HIDE or POPULATE minimal | Low | CRP-2→6 |
| RD-V02-08 | Competing naming (Dashboard / Workspace / Explorer) | Sidebar + BodyLayout | IA | Yes | Align product vocabulary | Low | CRP-3 |
| RD-V02-09 | Pack path only under Reportes | `page.tsx` Reportes section | IA / UX | Partial (SPE surface PASS; global OPEN) | Improve discoverability without SPE reopen | Low | CRP-7 |
| RD-V02-10 | Smart Start internal IDs in copy | Smart Start options | UX | Low–med | DEMOTE jargon | None | Polish |
| RD-V02-11 | Density: canvas squeezed by 280/280/240 panels | PlanningMode sizes | VISUAL / IA | Yes | Collapse panels default | Low–med | CRP-6 / Plan C |

### Deferred (OUT of automatic RD-V02 / needs CRP-4 if pursued)

| ID | Topic | Why deferred |
|----|-------|--------------|
| RD-V02-D01 | Window **model** redesign | ARCH-U |
| RD-V02-D02 | Dock **model** / registration redesign | ARCH-U |
| RD-V02-D03 | LayoutEngine region **model** unfreeze | ARCH-U |
| RD-V02-D04 | Session / autosave / IndexedDB / `.sgproj` | Contracts |
| RD-V02-D05 | Visibility / Command schema redesign | Contracts |
| RD-V02-D06 | Scientific engines / SPE workflow rewrite | SPE closed; OUT |
| RD-V02-D07 | AppShell five-region grid replacement | Architectural unless presentation-only slot policy |
| RD-V02-D08 | Marketplace / Lovable **publish** | Owner packaging track |
| RD-V02-D09 | RD-V01 interactive browser corpus | Optional CTR evidence |
| RD-V02-D10 | RD-V03 compare-groups copy polish | OUT / low |

**Before/after evidence needed (all controlled IDs):** baseline + post-change screenshots per Visual Corpus (§10); cold-user script notes.

---

## 10. Visual Corpus Requirements

**Purpose:** Mandatory objective baseline for design validation (CRP-5.2). Optionally supplied to Lovable if Plan A is used. Corpus exists **to design and validate**, not merely to feed Lovable.

| ID | Capture | State | Why |
|----|---------|-------|-----|
| VC-01 | Full first viewport | Cold start, empty session, Smart Start visible | First impression |
| VC-02 | Same, Smart Start dismissed / expert | Empty + IDE panels visible | Scaffold exposure |
| VC-03 | Toolbar + tabs | All five tabs | Primary nav |
| VC-04 | Sidebar expanded | Modules + Proyecto groups | Sidebar IA |
| VC-05 | Explorer / Inspector / Console | Default PlanningMode open | False affordances |
| VC-06 | Seed windows | No product windows | Demo residue |
| VC-07 | Datos tab with empty dataset | Empty product state | Journey |
| VC-08 | Análisis tab categories | Real inspector vs panel inspector | Naming collision |
| VC-09 | Resultados | Post-analysis if available; else empty Results | Journey |
| VC-10 | Reportes + Pack Lite CTA | Enabled + disabled Pack states | Publication path |
| VC-11 | StatusBar region | Empty footer | Polish |
| VC-12 | Narrow / typical laptop width | ~1280 and ~1440 | Density |
| VC-13 | Dual header close-up | Toolbar vs workspace strip | Brand hierarchy |
| VC-14 | Floating window chrome | If seeds present | Window face |

**Current corpus status:** **EVIDENCE GAP** — UX-10: post–UX-I5 screenshot corpus **Not found** in-repo (`docs/UX/certification/UX-10-LOVABLE-READINESS.md`).

---

## 11. Lovable Readiness

| Item | State |
|------|-------|
| Plan A priority | **Yes** — preferred visual exploration after corpus |
| Architectural authority | **No** — reference only |
| Screenshot corpus | **MISSING** — blocks Lovable execution per UX-10 |
| CRP-0/1 blocked by Lovable? | **No** — Lovable optional/non-blocking |
| Can Plan A be prepared? | **Partially** — after VC-01…VC-14 captured in CRP-5.2 |
| Missing for Plan A | Visual corpus; Owner authorization to run Lovable exploration; explicit “adopt face not architecture” fence |

**If Plan A fails:** retain useful ideas → Plan B (ChatGPT spec + Cursor).  
**If Plan B too risky:** Plan C Commercial Minimum Face (RD-V02-01…07/11 priority).

---

## 12. Architecture Risk Register

**Do NOT touch without CRP-4 Decision Gate:**

| Risk ID | Surface | Risk if touched casually |
|---------|---------|--------------------------|
| AR-01 | WindowManager / window contracts | Breaks UX-9 composition |
| AR-02 | Dock registry / DockLayout model | Unfreezes D51–D53 model |
| AR-03 | LayoutEngine region model | AppShell contract drift |
| AR-04 | SessionProvider / persistence / `.sgproj` | Certified floor regression |
| AR-05 | Visibility / Command schema | Continuity regressions |
| AR-06 | Scientific calculation modules | SPE certified behavior |
| AR-07 | `page.tsx` monolith “cleanup” without change control | Accidental functional diffs |
| AR-08 | Replacing AppShell five-region model | ARCH-U |

**Safe-leaning presentation levers (still need CRP-2/3/4 before code):** panel collapse defaults, seed gating, header demotion, StatusBar hide/populate, copy — **if** implemented as presentation/visibility without model unfreeze.

---

## 13. Evidence / Metrics

### Product Master Map / CTR denominators (cite-only — SPE-1.C)

| Metric | Value | Source |
|--------|-------|--------|
| Roadmap Completion (SPE spine) | **6/6 = 100%** | SPE-1 Series Closure §13 |
| Architecture Completion (CTR) | **~100%** | same |
| Scientific Capability (CTR) | **~95%** | same |
| AI Collaborator (CTR) | **100% gate-scoped** / Stage 3 runtime **0%** | same |
| Product / UX (CTR) | **~92%** | same — global Layout debt remains |
| Commercial Readiness | **~85%** | same |
| Remaining Distance | Gap Assessment: RD-V02 · first-time UX · packaging · Owner declare · optional RD-V01 | same |

**CRP-0/1 does not invent or recalculate percentages.** No new Master Map score claimed.

### CTR checklist (SPE-1.C) — audit mirror

| Item | State at CRP-1 |
|------|----------------|
| Scientific capability … Export floors | PASS (cite SPE) |
| Layout / Product Face | **OPEN** ← RD-V02 |
| Visibility | PASS / OPEN (SPE surface PASS; global OPEN) |
| External first-time UX | **OPEN** |
| Hosted deployment | PASS (DEP-2) |
| Commercial packaging | OPEN (Owner) |
| Owner declaration | OPEN |

---

## 14. Validation Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| SPE-1.V umbrella regression | `npm run validate:spe-1v-umbrella` | **PASS** (`pass: true`, exit 0) | Confirms SPE floors held; no SPE reopen |
| UI sidebar architecture | `npm run validate:ui-sidebar-architecture` | **PASS** (12/12) | Baseline |
| Workspace architecture | `npm run validate:workspace-architecture` | **FAIL** (22/26) | **Pre-existing / disclosed** — not introduced by CRP (no `src` edits). Failed: `workspace.files.exact`, `governance.workspace.singleMainOwner`, `workspace.tokens.frozen.shape`, `governance.workspace.tokensOnly`. **Do not “fix” via product redesign in CRP-1.** |
| Lint (`npm run lint`) | eslint | **FAIL / TOOLING** — Node heap OOM during eslint (process fatal); **no product code changed**. Disclosed tooling limitation — **EVIDENCE GAP** for clean lint PASS in this window |
| Typecheck (`npx tsc --noEmit`) | tsc | **PASS** (exit 0) | Baseline health |
| Build (`npm run build`) | next build | **NOT RUN in CRP-1 window** | Optional follow-up baseline; not required to close audit findings. **EVIDENCE GAP** if Owner requires build for CRP-1 close packet. |

**Deviation policy:** Workspace validator FAIL is a **governance tooling drift disclosure**, not a license to rewrite layout models under CRP. Classify under Architecture Risk / OBS peer if Owner later authorizes cleanup — **out of CRP-1 implementation**.

---

## 15. Recommended CRP-2 Input

Do **not** execute CRP-2 here. CRP-2 should consume:

1. This Official Record (full).  
2. RD-V02 controlled register **RD-V02-01…11** as diagnosis candidates.  
3. Deferred list **RD-V02-D01…D10** as non-default.  
4. Empty/false affordance table (§7) with REMOVE/HIDE/DEMOTE/POPULATE/KEEP.  
5. Layout map (§5) as “current state” SSOT for diagnosis.  
6. Visual Corpus list (§10) as capture backlog for CRP-5.2 (not CRP-2 implementation).  
7. Journey audit (§8): preserve SPE path; diagnose **chrome interference**, not workflow rewrite.  
8. Plan A/B/C policy: Lovable priority exploration **after** corpus; non-blocking.  
9. Architecture Risk Register (§12) as hard fence until CRP-4.  
10. Explicit stop: **no code** until CRP-3 proposal + CRP-4 Decision Gate + CRP-5 path select.

### Suggested CRP-2 diagnosis questions

- Which of RD-V02-01…11 are **must-fix before CTR** vs polish?  
- Can each must-fix be presentation-only (Plan C eligible)?  
- What is the single Product Face sentence a cold user should understand in 60s?  
- What chrome must disappear for that sentence to be readable?

---

## Final certification language (CRP-0 / CRP-1)

```text
CRP-0                          = PASS (Series OPEN / charter sync)
CRP-1                          = PASS (Commercial Readiness Audit — evidence only)
SPE-1                          = CERTIFIED / CLOSED (untouched)
SemVer                         = 1.0.0 (untouched)
Commercial Test Ready          = NOT YET
RD-V02                         = OPEN / PARTIAL (controlled subset registered)
ARCH-U                         = NOT ACTIVE
UI implementation              = NONE
Lovable                        = NOT EXECUTED (Plan A future; non-blocking)
Next                           = CRP-2 Product Face Diagnosis
```

**End of Official Record — CRP-0 PASS · CRP-1 PASS · STOP**
