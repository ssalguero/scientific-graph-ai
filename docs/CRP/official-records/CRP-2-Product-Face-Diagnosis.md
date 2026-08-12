# CRP-2 — Product Face Diagnosis

**Date:** 2026-08-11  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Product Face Diagnosis — **NO UI IMPLEMENTATION · NO LAYOUT REDESIGN · NO LOVABLE EXECUTION · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Evidence basis:** [`CRP-0-1-Series-Open-and-Audit.md`](./CRP-0-1-Series-Open-and-Audit.md) · SPE-1.C / SPE-1.V · live composition inspection  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-2** | **PASS** — Product Face Diagnosis complete |
| **CRP-0 / CRP-1** | PASS (prior) |
| **SPE-1** | **CERTIFIED / CLOSED** (untouched) |
| **SemVer** | **1.0.0** (untouched) |
| **Commercial Test Ready** | **NOT YET** |
| **RD-V02** | **OPEN / PARTIAL** — controlled subset diagnosed & prioritized |
| **ARCH-U** | **NOT ACTIVE** |
| **UI / src changes** | **NONE** |
| **Lovable** | Priority Plan A for later; **not executed** |
| **Next** | **CRP-3 — Layout / IA Proposal** |

```text
CRP-2 = PASS (DIAGNOSIS ONLY)
STOP — next = CRP-3 Layout / IA Proposal
```

---

## 2. Purpose and method

CRP-2 transforms CRP-1 evidence into:

1. What is wrong with the Product Face for a cold external user  
2. Why it matters commercially  
3. What must change before CTR  
4. What must stay outside CRP / wait for CRP-4  

**Method:** Reconfirm CRP-1 composition map; reassess RD-V02-01…11 with severity + CTR priority; produce Commercial Minimum, target principles, and Plan A/B/C briefs. **No solution layout.**

---

## 3. Product Face Diagnosis (dominant)

### Central diagnosis (locked)

The cold Product Face is a **dual stack**:

1. **Real product** — Spanish scientific journey (Smart Start → tabs → Reportes/Pack), SPE-certified.  
2. **Open IDE scaffold** — Explorer / Inspector / Console empty and open; PlanningMode L/R/B expanded; seed windows; dual “Scientific Graph AI” headers; empty StatusBar; AppShell Inspector null; English shell grammar (Workspace › Canvas / Explorer).

**Dominant problem class:** presentation / IA chrome / UX — **not** missing SPE scientific engines.

### Product identity

| Question | Diagnosis | Evidence | Class |
|----------|-----------|----------|-------|
| Immediately recognizable? | Partially | Brand string present; diluted by IDE chrome + “Dashboard Científico” | VISUAL / IA |
| Brand hierarchy clear? | **No** | Toolbar h1 + WorkspaceContent h1 both “Scientific Graph AI” | VISUAL |
| Duplicate brand signals? | **Yes** | Dual headers + sidebar title competition | VISUAL / IA |
| Finished product first screen? | **No** | Empty panels + seeds + static “Ready” read as unfinished | UX / VISUAL |
| App vs IDE perception? | Leans **developer workspace** | Explorer/Inspector/Console + floating demo windows | UX / IA |
| Identity contributors | Toolbar brand, tabs, Smart Start, Sidebar science groups | KEEP | — |
| Identity diluters | Dual header, IDE panels, seeds, empty StatusBar, English shell crumbs | HIDE/DEMOTE/REMOVE | — |

**Commercial impact:** A cold user may conclude the product is an incomplete IDE shell wrapped around science tools — undermining trust before they reach SPE-certified value.

---

## 4. Cold-User Experience Diagnosis

**Likely perception:** “Internal developer workspace with scientific modules,” not “finished scientific product.”

| Perception driver | Evidence | Impact |
|-------------------|----------|--------|
| Unfinished | Empty Explorer/Inspector/Console always visible | High |
| Demo residue | “Ventana Workspace A/B” | High |
| Internal tooling | SCI-59/SCI-60/ARCH-5 in Smart Start copy | Medium |
| Excessive chrome | L/R/B panels + dual headers + StatusBar | High |
| Fake capability | “New Series”, ActionButton spans, Console Warnings/Errors chips | High |
| Empty theater | StatusBar empty; workspace “Ready” static | Medium |
| Inconsistent grammar | ES product tabs + EN IDE shell | Medium |

**Tribal knowledge required:** User must know to ignore IDE panels, close/ignore seed windows, use toolbar tabs (not Explorer), and open **Reportes** for Pack — despite SPE surface PASS once on Reportes.

---

## 5. Primary Journey Diagnosis

**Intended path:** Smart Start → Data → Analysis → Results → Reportes / Pack  
**Do not redesign journey engines** — diagnose presentation only.

| Transition | Start | Primary CTA | Next obvious? | State clear? | Progression visible? | Tribal knowledge? | Visual competition? |
|------------|-------|-------------|---------------|--------------|----------------------|-------------------|---------------------|
| Enter | Empty session → Smart Start | Journey cards / Modo experto | **Yes** (when Smart Start shown) | Partial | Cards only | Low if SS shown | IDE panels + seeds |
| → Data | Card or tab Datos | Import / dataset flows | Medium | Medium | Tab highlight | Medium | Empty L/R squeeze canvas |
| → Analysis | Tab Análisis | In-canvas categories | Medium | Confused by word “Inspector” | Tab only | Medium | Right empty Inspector panel |
| → Results | Tab Resultados | Results surfaces | Medium | Medium | Tab only | Low–med | Same chrome |
| → Reportes/Pack | Tab Reportes / sidebar | Pack Lite / PDF | **Weak until Reportes opened** | Clear on tab | No global progress chrome | Medium | Pack buried vs SPE PASS on surface |

**Journey verdict:** Scientific path exists and is certified; **chrome interference** and **late Pack discoverability** are the commercial presentation gaps.

---

## 6. Menu / Sidebar / Button Diagnosis

### Navigation surfaces

| Surface | Role today | Diagnostic treatment* |
|---------|------------|------------------------|
| Toolbar tabs (Inicio…Reportes) | **Primary menu** | **KEEP** — primary journey home |
| Smart Start cards | Primary cold CTAs | **KEEP**; **DEMOTE** internal IDs in copy |
| Sidebar “Dashboard Científico” | Mixed project + science + settings | **KEEP** structure; **REORDER/REGROUP** candidates for CRP-3 |
| Sidebar Reportes | Duplicate of tab | **KEEP** (useful shortcut) or **DEMOTE** if CRP-3 consolidates |
| Workspace › Canvas breadcrumbs | Shell grammar | **HIDE / DEMOTE** |
| Panel ActionButtons / “New Series” | False CTAs | **HIDE / REMOVE** from face |
| LabUsageProfile | Expert density | **KEEP** (secondary) |
| Pack / PDF under Reportes | Publication | **KEEP**; discoverability **INVESTIGATE** (P1) |

\*Diagnostic only — not implemented.

### Sidebar conceptual model

| Aspect | Diagnosis |
|--------|-----------|
| Model communicated | Hybrid: **project-oriented** + **tool/module-oriented** (not pure workflow stepper) |
| Cold-user understandable? | Partially — “Dashboard Científico” + collapsed Científico/Análisis/Recursos |
| Grouping | Coherent enough for project ops; does not narrate journey alone |
| Order / priority | “+ Nuevo gráfico” strong; journey still owned by tabs |
| Expert vs primary | Module toggles + Asistente can compete when expanded |
| Infrastructure confusion | **Not** from sidebar itself — from IDE panels **beside** content |

**Candidate CRP-3 principles (not design):** sidebar supports project/modules; **tabs own journey**; expert sections progressive disclosure.

### Button / CTA hierarchy

| Class | Examples | Diagnosis |
|-------|----------|-----------|
| Primary | Smart Start cards; tab navigation; Pack Lite when on Reportes | Should dominate — currently compete with scaffold |
| Secondary | Nuevo gráfico; biblioteca; lab profile | OK |
| Tertiary / config | Ajustes, Historial, function library | OK if collapsed |
| Export/report | Pack Lite, Exportar PDF | Important but late discoverability |
| Destructive | Restablecer proyecto | Keep demoted |
| False / static | ActionButton spans, New Series, Console chips | **HIDE** |

---

## 7. Layout / Chrome Diagnosis

| Finding | Dominant region effect | Class | Presentation-first? |
|---------|------------------------|-------|---------------------|
| Canvas squeezed by 280/280/240 panels | Scientific content secondary | VISUAL / IA | **Yes** — collapse/hide defaults |
| Dual headers | No single brand anchor | VISUAL | **Yes** — demote workspace strip |
| Sidebar vs workspace | Sidebar real; workspace framed by fake IDE | IA | **Yes** |
| Toolbar vs content | Tabs good; brand duplicated below | VISUAL | **Yes** |
| Windows vs workflow | Seeds overlay primary work | UX | **Yes** — gate seed (not Window model rewrite) |
| Density | Too dense / fragmented / noisy | VISUAL | **Yes** |
| Empty StatusBar | Fake finished chrome | VISUAL | **Yes** — hide or populate |

**Default:** presentation problem first. **REQUIRES CRP-4** only if collapse/hide cannot be done without Layout/Window/Dock **model** unfreeze.

---

## 8. IDE Scaffold Diagnosis

| Surface | Real user value (default)? | False affordance? | Unfinished? | Distracts journey? | Default commercial face? | Treatment* |
|---------|----------------------------|-------------------|-------------|--------------------|--------------------------|------------|
| Explorer | No (always empty) | Yes | Yes | Yes | No | **HIDE / COLLAPSE** |
| Panel Inspector | No (empty; real UI in Análisis) | Yes | Yes | Yes | No | **HIDE / COLLAPSE** |
| Console | No | Yes | Yes | Yes | No | **HIDE / COLLAPSE** |
| PlanningMode L/R/B open | No for cold user | Yes (implies tools) | Yes | Yes | No | **COLLAPSE** default; expert optional |
| Dock empty inspector | No | Mild | Mild | Low | No | **HIDE** |
| Floating seed windows | No | Yes | Yes (demo) | Yes | No | **REMOVE** (gate) |
| Empty StatusBar | No | Mild | Yes | Mild | No | **HIDE** or **POPULATE** minimal |
| AppShell Inspector `visible={false}` | None visible | Naming debt only | — | — | Keep null | **KEEP** null; do not populate without CRP-4 |
| Workspace dual header | Low | Static “Ready” | Mild | Mild | No as-is | **DEMOTE / REMOVE** strip noise |
| EN breadcrumbs / hints | No | Misleading | Mild | Mild | No | **DEMOTE / HIDE** |

\*Diagnostic only.

---

## 9. Empty-State Diagnosis

| Empty state | Truthful? | Useful? | Misleading? | Scaffold-like? | Treatment* |
|-------------|-----------|---------|-------------|----------------|------------|
| Explorer “No series” / New Series | Partial | No (inert CTA) | Yes | Yes | HIDE |
| Panel Inspector “Nothing selected” | Partial | No | Yes (implies selection model) | Yes | HIDE |
| Console “No output” | Yes but pointless | No | Mild | Yes | HIDE |
| Smart Start (no data) | Yes | **Yes** | No | No | KEEP |
| Reportes insufficient data | Yes | Yes | No | No | KEEP |
| Dataset empty in Datos | Yes (product) | Yes if next action clear | — | No | KEEP / improve later |
| StatusBar empty | N/A | No | Mild | Yes | HIDE/POPULATE |
| Library “Sin gráficos…” | Yes | Yes | No | No | KEEP |

---

## 10. Finished-product perception

**Verdict:** Cold external user is more likely to interpret the default face as an **internal developer workspace** than as a **finished scientific product**.

Concrete evidence (not subjective alone):

1. Always-open empty Explorer/Inspector/Console (CRP-1 §7)  
2. Demo titles “Ventana Workspace A/B” (`ProductCompositionHost`)  
3. Dual brand + static “Ready” (`WorkspaceContent`)  
4. Inert “New Series” / ActionButton spans  
5. English IDE vocabulary around Spanish product tabs  
6. Empty StatusBar chrome  

SPE-certified journey is real but **visually subordinated**.

---

## 11. Density / visual priority

| Cause | Commercial impact rank |
|-------|------------------------|
| Open L/R/B empty panels (RD-V02-02/11) | **1 — highest** |
| Seed floating windows (RD-V02-06) | **2** |
| Dual headers (RD-V02-01) | **3** |
| False CTAs / empty theater (03–05, 07) | **4** |
| Naming clash Dashboard/Workspace/Explorer (08) | **5** |
| Pack late discoverability (09) | **6** |
| Smart Start jargon (10) | **7** |

Interface is **too dense, fragmented, and visually noisy** for first impression — not too sparse.

---

## 12. Information Architecture Diagnosis (principles only — not final IA)

### Current IA problems

- Scientific journey and IDE infrastructure share primary visual status  
- “Inspector” means three things (AppShell null / RightPanel empty / Análisis categories)  
- Tabs own journey; sidebar owns project — relationship unclear to cold user  
- Pack is correctly under Reportes but not previewed earlier  
- Shell breadcrumbs nest under product without adding navigation meaning  
- Duplicate Reportes entry (acceptable) vs duplicate brand (harmful)

### Candidate IA principles for CRP-3 (not implementation)

1. **Primary scientific journey must dominate** the first viewport.  
2. **Expert / infrastructure tooling** → progressive disclosure (not default open).  
3. **Infrastructure must not masquerade** as product capability.  
4. **Report / publication path** remains discoverable without SPE reopen.  
5. **Primary actions have one obvious home** (tabs + Smart Start).  
6. **One brand hierarchy** — single product identity signal.  
7. **Truthful empty states only** where they advance the journey.  
8. **Spanish product vocabulary** leads; EN shell grammar demoted or removed from face.

---

## 13. RD-V02-01 … RD-V02-11 Assessment

| ID | Confirmed? | Class | Severity | CTR | User impact | Disposition | Treatment* | Arch risk |
|----|------------|-------|----------|-----|-------------|-------------|------------|-----------|
| RD-V02-01 Dual headers | Yes | VISUAL/IA | **P0** | Required before CTR | First impression / hierarchy | Required | DEMOTE workspace strip | Low |
| RD-V02-02 PlanningMode L/R/B open | Yes | IA/UX | **P0** | Required | Finished perception / density | Required | COLLAPSE/HIDE default | Med → CRP-4 if model |
| RD-V02-03 Explorer false CTAs | Yes | UX | **P0** | Required | Fake capability | Required | HIDE | Low |
| RD-V02-04 Panel Inspector empty | Yes | IA/UX | **P0** | Required | Confusion vs Análisis | Required | HIDE panel | Low |
| RD-V02-05 Empty Console | Yes | UX | **P0** | Required | Scaffold perception | Required | HIDE | Low |
| RD-V02-06 Seed windows | Yes | UX | **P0** | Required | Demo residue | Required | REMOVE/gate | Low if seed-only |
| RD-V02-07 Empty StatusBar | Yes | VISUAL | **P1** | Strongly recommended | Unfinished chrome | Strongly recommended | HIDE or POPULATE | Low |
| RD-V02-08 Naming clash | Yes | IA | **P1** | Strongly recommended | Comprehension | Strongly recommended | Align vocabulary | Low |
| RD-V02-09 Pack only under Reportes | Yes | IA/UX | **P1** | Strongly recommended* | Discoverability | Strongly recommended | Improve cues (no SPE reopen) | Low |
| RD-V02-10 Smart Start jargon | Yes | UX | **P2** | Optional polish | Trust / clarity | Optional polish | DEMOTE IDs | None |
| RD-V02-11 Canvas density squeeze | Yes | VISUAL/IA | **P0** | Required (coupled to 02) | Hierarchy / content | Required | Collapse panels | Low–med |

\*SPE-1.V surface PASS remains; global first-time discoverability still OPEN per SPE-1.C.

**Reclassification:** None of 01–11 incorrectly classified. No new RD-V02 ID required; Inspector triad is covered by 04 + AppShell null (fence).

**Deferred D01…D10:** unchanged — OUT of automatic CRP / CRP-4 if pursued.

---

## 14. Priority Matrix

### P0 — CTR blockers (must-fix Product Face)

- RD-V02-02, 03, 04, 05, 11 — remove empty IDE scaffold from default face  
- RD-V02-06 — remove/gate seed windows  
- RD-V02-01 — single brand hierarchy  

### P1 — major commercial / UX

- RD-V02-07 StatusBar policy  
- RD-V02-08 vocabulary coherence  
- RD-V02-09 Pack/journey discoverability cues  

### P2 — meaningful improvement

- RD-V02-10 Smart Start copy hygiene  
- Breadcrumb / hint demotion  
- Sidebar REORDER/REGROUP refinements (non-blocking if P0 done)  

### P3 — polish / optional

- RD-V03 copy; cosmetic density after P0; marketplace packaging (Owner track)

### Impact dimensions covered

First impression · cold comprehension · discoverability · workflow clarity · finished perception · visual hierarchy · regression risk (prefer visibility/seed/header — low regression vs model unfreeze).

---

## 15. Change Boundary (P0/P1)

| Finding | Solvable by presentation? | Requires architecture? |
|---------|---------------------------|------------------------|
| Collapse/hide L/R/B | Visibility / mode initial state / progressive disclosure | **CRP-4** only if PanelState/PlanningMode contract treated as frozen against presentation change |
| Seed gate | Feature-flag / no-op seed in commercial face | Window **model** rewrite = CRP-4 |
| Dual header | CSS/composition demotion or omit strip | AppShell model replace = CRP-4 |
| StatusBar | Hide slot or minimal populate | Status model redesign = CRP-4 |
| Pack cues | Copy/CTA placement in existing Reportes/Results | New export engine = OUT |
| Naming | Labels/copy | Schema rename = CRP-4 |

**Prefer presentation.** Anything model-level: **REQUIRES CRP-4 DECISION GATE**.

---

## 16. Commercial Minimum (diagnostic Plan C preview)

Smallest set to make the product externally testable:

1. **Collapse/hide** Explorer, panel Inspector, Console by default (or non-commercial face).  
2. **Disable/gate** WorkspaceActivationSeed windows on commercial face.  
3. **Demote/remove** duplicate workspace brand strip / static “Ready”.  
4. **Hide or minimally populate** StatusBar.  
5. **Preserve** Smart Start + tabs + Sidebar project actions + Reportes Pack/PDF.  
6. **Optional minimum discoverability:** one clear cue from Results or Smart Start toward Reportes/Pack (copy/CTA only).  

Does **not** include: AppShell rewrite, Dock/Window model, SPE workflow redesign, Lovable publish, SemVer bump.

---

## 17. Target Product Face Principles (CRP-3 acceptance)

CRP-3 proposal **must** satisfy:

1. One dominant product hierarchy  
2. Obvious primary journey (Smart Start → … → Reportes/Pack)  
3. Clean navigation ↔ workspace relationship  
4. Minimal developer / demo residue on default face  
5. Truthful empty states only  
6. Obvious primary CTAs  
7. Coherent menu grouping  
8. Coherent sidebar ordering (support, not compete with journey)  
9. Clear Reports/Pack path  
10. Professional finished-product perception  
11. Architectural fence respected (adopt face, not Lovable architecture)

---

## 18. Lovable Plan A Brief (diagnostic input — not implementation prompt)

### Problem
Default face presents a certified scientific journey inside an open, empty IDE scaffold with demo windows and dual branding — reads unfinished/developer-facing.

### Desired perception
Finished Spanish-first scientific graphing / analysis / publication product; clear what to do next in under ~60 seconds.

### Required hierarchy
Brand once → primary journey tabs / Smart Start → scientific canvas → secondary project sidebar → expert tools disclosed later.

### Required journey
Smart Start → Datos → Análisis → Resultados → Reportes/Pack must be visually obvious without tribal knowledge to ignore chrome.

### Required navigation improvements
Resolve competing IDE vs product navigation; demote false CTAs; keep tabs as journey spine; sidebar as project/modules support; improve Pack discoverability cues.

### Elements to remove/demote from dominance
Empty Explorer/Inspector/Console; seed windows; dual headers; empty StatusBar theater; EN shell breadcrumbs; inert ActionButtons.

### Elements to preserve
Smart Start; toolbar tabs; Sidebar project/science capabilities; Análisis in-canvas tools; Reportes Pack Lite / PDF; SPE-certified workflows.

### Architectural fence
Do **not** assume redesign of Window/Dock/Layout **models**, Session, persistence, engines, schemas, or AppShell region contracts. Visual exploration proposes **face/composition**; repository governance decides implementability.

---

## 19. Plan A / B / C Readiness

| Path | CRP-2 establishes |
|------|-------------------|
| **Plan A — Lovable** | Brief §18 + VC-01…14 from CRP-1; priority visual exploration after corpus; adopt face not architecture |
| **Plan B — Repo redesign** | P0/P1 register + IA principles §12 + change boundaries §15; ChatGPT specifies; Cursor implements presentation-first |
| **Plan C — Minimum Face** | §16 Commercial Minimum; if A/B too broad/risky |

**None executed in CRP-2.**

---

## 20. Architecture Fence (untouched)

| Fence | Status |
|-------|--------|
| SPE-1 reopen | FORBIDDEN |
| SemVer / tags | FORBIDDEN |
| CTR declare | FORBIDDEN |
| ARCH-U | NOT ACTIVE |
| Window / Dock / Layout **models** | DEFERRED / CRP-4 |
| Session / IndexedDB / `.sgproj` | FORBIDDEN |
| Engines / SPE workflow contracts | FORBIDDEN |
| Visibility / Command schema redesign | FORBIDDEN |
| Lovable as architectural SSOT | FORBIDDEN |
| `src/**` product changes in CRP-2 | **NONE** |

---

## 21. Validation Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) | No product code changed |
| SPE-1.V umbrella | `npm run validate:spe-1v-umbrella` | **PASS** (`pass: true`, exit 0) | SPE floors held; SPE remains CLOSED |
| Lint | `npm run lint` | **Not re-run as blocker** | Prior CRP-1: Node heap OOM tooling disclosure |
| Build | `npm run build` | **NOT RUN** | EVIDENCE GAP (optional); not CRP-2 gate item |
| Workspace architecture | cite CRP-1 | **FAIL 22/26 pre-existing** | Not a CRP-2 product finding; do not “fix” via redesign |

CRP-2 documentation-only; no code altered to chase green validators.

---

## 22. Documentation / Git

### Created

- `docs/CRP/official-records/CRP-2-Product-Face-Diagnosis.md` (this record)

### Updated (charter sync)

- `docs/CRP/official-records/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/ROADMAP.md`

### Untouched

- SPE-1 Official Record bodies  
- `src/**`  
- `package.json` version  

---

## 23. CRP-2 Gate

| Criterion | Result |
|-----------|--------|
| Current Product Face documented | **PASS** |
| Primary commercial problems evidenced | **PASS** |
| RD-V02-01…11 assessed | **PASS** |
| Problems classified + prioritized | **PASS** |
| Commercial impact explicit | **PASS** |
| False affordances identified | **PASS** |
| Presentation vs architecture separated | **PASS** |
| Architectural candidates → CRP-4 | **PASS** |
| Target principles defined | **PASS** |
| Commercial Minimum defined | **PASS** |
| Plan A/B/C inputs identified | **PASS** |
| SPE-1 CLOSED / SemVer 1.0.0 / CTR NOT YET / no arch changes | **PASS** |

```text
CRP-2 = PASS
```

---

## 24. Recommended CRP-3 Input

CRP-3 must consume:

1. This diagnosis (full)  
2. P0 set as mandatory proposal constraints  
3. Commercial Minimum as Plan C floor  
4. Target principles as acceptance criteria  
5. Lovable brief as Plan A exploration input  
6. Architecture fence as hard non-goals  
7. Explicit stop: **proposal only** — no implementation until CRP-4 + CRP-5 path select  

---

## Final certification language

```text
CRP-2                          = PASS (Product Face Diagnosis)
UI implementation              = NONE
SPE-1                          = CERTIFIED / CLOSED
SemVer                         = 1.0.0
Commercial Test Ready          = NOT YET
RD-V02                         = OPEN / PARTIAL (P0/P1 prioritized)
ARCH-U                         = NOT ACTIVE
Lovable                        = NOT EXECUTED (Plan A priority later)
Next                           = CRP-3 Layout / IA Proposal
```

**End of Official Record — CRP-2 PASS · STOP**
