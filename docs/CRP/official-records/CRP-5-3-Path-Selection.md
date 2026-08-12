# CRP-5.3 — Path Selection

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Path Selection / Execution Gate — **NO `src/**` IMPLEMENTATION · NO LOVABLE EXECUTION · NO PROPOSAL A IMPLEMENTATION · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Evidence basis:** CRP-2 · CRP-3 · CRP-4 · CRP-5.2 Visual Corpus · Lovable Input Package  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-5.3** | **PASS** |
| **Selected path** | **PLAN A — Lovable-assisted visual exploration** |
| **Fallback** | **PLAN B — Controlled repository redesign** (pre-authorized) |
| **CTR floor** | **PLAN C — Commercial Minimum Face** (pre-authorized) |
| **Lovable** | **AUTHORIZED for next phase · NOT EXECUTED in CRP-5.3** |
| **`src/**` changes** | **NONE** |
| **SPE-1 / SemVer / CTR / ARCH-U** | Untouched · CLOSED / 1.0.0 / NOT YET / NOT ACTIVE |
| **Next** | **Plan A — Lovable Visual Exploration** (bounded) |

```text
CRP-5.3 = PASS
PLAN A = SELECTED / PRIORITY
PLAN B = ACTIVE FALLBACK (pre-authorized; not executing)
PLAN C = ACTIVE CTR FLOOR (pre-authorized; not executing)
Lovable = NOT YET EXECUTED
STOP — next = Lovable Visual Exploration
```

---

## 2. Purpose

Make the formal execution-path decision for Commercial Readiness Product Face work after CRP-5.2 corpus readiness.

CRP-5.3 does **not** explore visually, implement Proposal A, or modify the repository Product Face. It selects the path, defines success/failure gates, fences Lovable, and defines repository handoff.

---

## 3. Authoritative Preconditions (confirmed)

| Item | Status | Evidence |
|------|--------|----------|
| CRP-0…4 | **PASS** | Official records |
| CRP-5.2 | **PASS** | [`CRP-5-2-Visual-Corpus.md`](./CRP-5-2-Visual-Corpus.md) |
| Proposal A | **APPROVED WITH FENCES** | [`CRP-4-Layout-Decision-Gate.md`](./CRP-4-Layout-Decision-Gate.md) |
| Category C (CTR-required) | **NONE** | CRP-4 |
| Visual Corpus | **20 PNG** · VC-01…18 + VC-01b · CORP-01…12 | [`../visual-corpus/`](../visual-corpus/) |
| Lovable Input Package | **READY** | [`../visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md`](../visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md) |
| Critical evidence gap blocking path selection | **NONE** | CRP-5.2 §10 |
| SPE-1 | **CERTIFIED / CLOSED** | SPE Official Record |
| SemVer | **1.0.0** | package / tags |
| CTR | **NOT YET** | Living status |
| ARCH-U | **NOT ACTIVE** | CRP-4 |

---

## 4. Formal Path Selection

### Selected

**PLAN A = SELECTED / PRIORITY**

### Fallback

**PLAN B = ACTIVE FALLBACK** (pre-authorized; activates only on Plan A failure)

### Final fallback / CTR floor

**PLAN C = ACTIVE CTR FLOOR** (pre-authorized; activates only on scope/risk escalation)

### Ordering (locked)

1. Plan A  
2. Plan B  
3. Plan C  

No reverse of this ordering without new Owner/CRP gate evidence.

---

## 5. Path Selection Matrix (repository-specific)

| Path | Purpose | Strength | Risk | Readiness | Trigger |
|------|---------|----------|------|-----------|---------|
| **Plan A** | Lovable-assisted visual exploration of Proposal A using real corpus | Highest visual potential; fast Product Face target discovery | Low–medium (visual drift / non-translatable mock risk — mitigated by fences + criteria) | **READY** — corpus PASS · package READY · Proposal A APPROVED WITH FENCES · no Category C | **SELECTED FIRST** |
| **Plan B** | Controlled repository redesign from Proposal A + corpus (ChatGPT spec → Cursor) | High architectural control; same Product Face acceptance bar | Medium (slower visual iteration; still GREEN/YELLOW bounded) | **READY** — CRP-4 Plan B APPROVED | Plan A failure criteria met |
| **Plan C** | Commercial Minimum Face subset for CTR | Lowest risk / smallest surface | Low (incomplete preferred face) | **READY** — CRP-4 Plan C APPROVED | Scope/risk threatens CTR; full A unsafe |

### Repository-specific evidence supporting Plan A first

| Evidence | Implication |
|----------|-------------|
| CRP-2: dominant issue = presentation / IA chrome / UX (dual stack IDE over scientific journey) | Visual exploration is the right first instrument |
| CRP-3 Proposal A: single brand · journey tabs · Proyecto sidebar · content-forward · IDE collapsed · seeds off · Pack home | Clear visual target already specified |
| CRP-4: no CTR-required Category C; Window/Dock/Layout **no model change**; PlanningMode = Category B | Architecture allows face-first exploration without ARCH-U |
| CRP-5.2: 20 baseline PNGs + Gap Register + READY Lovable package | Plan A has real current-state truth and a usable brief |
| CRP-4 §§17–19: Plan A / B / C all previously APPROVED | Fallbacks are pre-authorized, not invented here |

---

## 6. Plan A Rationale

Plan A is the correct first path because:

1. **Problem class matches tool.** Cold Product Face failures are visual/IA/chrome (CRP-2 P0), not scientific-engine or Window/Dock/Layout model defects.
2. **Target is approved.** Proposal A is APPROVED WITH FENCES (CRP-4); Lovable explores that face, not a new product.
3. **Corpus is ready.** CRP-5.2 PASS supplies objective current-state PNGs and a READY input package — no critical gap blocks selection.
4. **Architecture is protected.** CRP-4 proves Proposal A needs presentation/composition + YELLOW PanelState/StatusBar/seed gates — not ARCH-U.
5. **Failure is bounded.** Plan B remains READY with the same acceptance criteria; Plan A failure does not reset the roadmap.
6. **Priority was pre-established** and is confirmed here from evidence, not assumed without corpus.

Plan A is **not** “let Lovable rewrite the application.”  
Plan A is **use Lovable to explore the visual Product Face of Proposal A, using the baseline corpus as evidence.**

---

## 7. Plan A Objective (visual target)

Produce a visually convincing representation of:

| Face element | Requirement |
|--------------|-------------|
| Product Face | Single brand · clear project context · journey tabs · Proyecto sidebar · content-forward workspace · minimal chrome |
| Journey | **Inicio → Datos → Análisis → Resultados → Reportes** |
| Smart Start | Prominent · understandable · no SCI-*/ARCH-* jargon |
| Reports / Pack | Reportes = Pack home · Pack visible · contextual cue from Resultados |
| IDE scaffold | Collapsed/hidden · not dominant · no developer residue |
| Seeds | Absent from default commercial face |
| Status | Hidden until meaningful |

**Deliverable on Plan A success:** a **VISUAL TARGET** usable as repository implementation reference. Lovable source is **not** automatically adopted.

---

## 8. Plan A Success Criteria

Result is **SUCCESSFUL** only if **all mandatory** criteria pass **and** a **strong majority (≥4 of 6)** of recommended criteria pass.

### Mandatory

| ID | Criterion |
|----|-----------|
| **A1** | Product identity — Scientific Graph AI looks like a finished scientific product |
| **A2** | Hierarchy — one dominant Product Face hierarchy |
| **A3** | Journey — user can visually understand Inicio → Datos → Análisis → Resultados → Reportes |
| **A4** | Sidebar — clearly supports project/scientific context (Proyecto-first) |
| **A5** | IDE suppression — Explorer / Inspector / Console / PlanningMode no longer visually dominate |
| **A6** | Seeds — no demo seed windows dominate the commercial face |
| **A7** | Smart Start — understandable without internal architecture jargon |
| **A8** | Reports / Pack — Pack visibly connected to Reportes and journey end |
| **A9** | Professional perception — no longer reads primarily as an internal developer IDE |
| **A10** | Visual coherence — header, tabs, sidebar, workspace, buttons, content form one composition |

### Recommended

| ID | Criterion |
|----|-----------|
| **A11** | Density — workspace feels content-forward |
| **A12** | CTA hierarchy — primary actions visually obvious |
| **A13** | Menu clarity — primary vs secondary clearly separated |
| **A14** | Empty-state honesty — empty states do not create false capability |
| **A15** | Visual polish — commercially credible composition |
| **A16** | Scalability — concept accommodates existing scientific workflow without visual collapse |

### Evaluation rule

Do **not** judge on “pretty screenshot” alone.  
Judge: **Does the screenshot communicate the product we actually have, as Proposal A intends, while remaining translatable to the repository under CRP-4 fences?**

Visual excellence is necessary. Product coherence is mandatory. Architectural compatibility is required for implementation.

---

## 9. Plan A Failure Criteria

Plan A is **FAILED / NOT USABLE** if **one or more** of the following occur:

| ID | Failure condition |
|----|-------------------|
| **F1** | Lovable produces a generic redesign unrelated to Proposal A |
| **F2** | Scientific journey becomes less clear |
| **F3** | Result requires replacing certified scientific functionality |
| **F4** | Result assumes a Window/Dock/Layout rewrite |
| **F5** | Result removes or obscures Reports/Pack |
| **F6** | Result creates a navigation model conflicting with **Tabs own the journey** |
| **F7** | Visually good but not translatable to the repository without disproportionate reconstruction |
| **F8** | Output remains materially worse than the existing Proposal A specification |
| **F9** | Repeated unstable/inconsistent layouts after controlled attempts |
| **F10** | Exploration consumes disproportionate effort without a credible Product Face target |

On any F1–F10 confirmed after the bounded attempt policy → **activate Plan B**.

---

## 10. Bounded Exploration Policy

Unlimited Lovable iteration is **forbidden**.

| Stage | Allowance | Stop rule |
|-------|-----------|-----------|
| **E0 — Initial exploration** | **1** primary exploration pass using corpus + Proposal A principles + CRP-4 fence | If strong (all A1–A10 + ≥4 recommended) → **ACCEPT** · freeze visual target · no unnecessary iteration |
| **E1 — Controlled refinement** | Up to **2** refinement passes total | Only if E0 is weak but salvageable (misses polish/density/CTA clarity, not F1–F6 structural failures) |
| **E2 — Evaluation gate** | Formal review vs A1–A16 / F1–F10 against corpus + CRP-2/3/4 | Record ACCEPT or REJECT |
| **E3 — Final decision** | Accept → Visual Target Freeze · Reject → Plan B | Do not start E1+ if F1–F6 already clear at E0 |

**Maximum:** 1 initial + 2 refinements = **3 controlled attempts**.  
After that without SUCCESS → **Plan A FAILED** → **Plan B**.

Goal is a **sufficiently strong visual target**, not perfection in Lovable.

---

## 11. Lovable Execution Fence

### Authorized (next phase only)

Lovable may explore:

- Product Face composition  
- Layout / hierarchy / grouping  
- Menu and button hierarchy / ordering  
- Sidebar organization (Proyecto support role)  
- Visual hierarchy / density / polish  
- Content-forward workspace presentation  
- Smart Start presentation without jargon  
- Reports/Pack discoverability and Resultados cue  

### Forbidden

Lovable is **not** authorized to redesign or assert as required:

- Scientific engines / SPE workflow contracts  
- Window / Dock / LayoutEngine / AppShell five-region models  
- Session / IndexedDB / `.sgproj` persistence schemas  
- Visibility / Command schema  
- Data models  
- Governance / SemVer / CTR declare  
- ARCH-U activation  
- Repository architecture migration  

**Adopt face, not architecture.** Lovable is a visual exploration tool — **not** architecture authority, repository SSOT, Window/Dock/Layout authority, Session authority, scientific-engine authority, or governance authority.

### Inputs (mandatory together)

| Truth | Source |
|-------|--------|
| Current-state | `docs/CRP/visual-corpus/` + INDEX + CAPTURE-MANIFEST |
| Target-direction | Proposal A (CRP-3) · APPROVED WITH FENCES (CRP-4) |
| Architecture boundary | CRP-4 GREEN / YELLOW / RED |
| Brief | [`LOVABLE-INPUT-PACKAGE.md`](../visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md) |

---

## 12. Plan A → Repository Handoff

After **SUCCESSFUL** Lovable exploration:

| Step | Action |
|------|--------|
| **1** | **Freeze** the accepted visual target (screenshots / annotated reference · versioned under CRP docs) |
| **2** | Compare target against Proposal A (CRP-3/4) — record deltas as keep / ignore / clarify |
| **3** | Extract only desired **layout · hierarchy · grouping · navigation organization · visual treatment** |
| **4** | Map each desired change to actual repository owners (per CRP-4 matrix) |
| **5** | Respect CRP-4 fences: **GREEN** = direct · **YELLOW** = controlled · **RED** = no implementation without new authorization |
| **6** | Cursor implements against the real repository (not Lovable codegen as SSOT) |

**Hard rule:** Do **not** copy Lovable architecture into the repository merely because the visual result is good.

---

## 13. Plan B — Activation Conditions

Plan B is **READY** and **APPROVED** (CRP-4 §18). Activate when **any** of:

- Plan A fails mandatory success criteria after bounded attempts  
- Lovable cannot produce a credible Proposal A target  
- Output requires excessive reconstruction (F7)  
- Output conflicts with architecture (F3/F4/F6)  
- Output degrades scientific journey (F2) or Pack (F5)  
- Repeated exploration is no longer productive (F9/F10)  
- Owner/gate declares Plan A REJECT at E2  

### Plan B workflow

```text
CRP-3 Proposal A
  → ChatGPT implementation specification
  → repository mapping (CRP-4 owners)
  → Cursor controlled implementation
  → GREEN/YELLOW fence validation
  → visual validation vs corpus + Proposal A
  → CTR preparation
```

### Plan B success bar

**Same Product Face acceptance criteria as Plan A (A1–A16).**  
Difference is mechanism only: visual target specified directly rather than explored through Lovable. Plan B is **not** a lower-quality target.

---

## 14. Plan C — Activation Conditions

Plan C is **READY** and **APPROVED** (CRP-4 §19). Activate **only if**:

- Full Proposal A implementation becomes too risky for CTR timing  
- Scope threatens CTR  
- Implementation complexity becomes disproportionate  
- Visual redesign cannot be safely completed under GREEN/YELLOW  
- Plan B itself escalates beyond safe controlled surface  

### Plan C minimum (CTR floor)

1. Collapse empty IDE (L/R/B)  
2. Gate seeds  
3. Demote dual header (+ Ready)  
4. StatusBar policy (hide until meaningful)  
5. Preserve Smart Start  
6. Preserve tabs  
7. Preserve scientific journey  
8. Preserve Reportes/Pack  
9. Optional Pack cue from Resultados  

Plan C is the **CTR floor**, not the preferred outcome.

---

## 15. Implementation Fence (carried from CRP-4)

Unchanged; restated for path clarity:

| Fence | Meaning |
|-------|---------|
| **GREEN** | Brand demotion · Ready removal · Smart Start copy · false CTA hide · Pack cue · tab/sidebar label-order (non-structural) · seed early-return · token-consistent density |
| **YELLOW** | PlanningMode / PanelState commercial defaults · StatusBar hide without removing grid region · sidebar regroup composition · full-bleed verify after collapse · lab-profile × panels |
| **RED** | LayoutEngine / AppShell region model · Window model · Dock model · Session/persistence/schema · Visibility/Command schema · AppShell Inspector populate · SPE/engine · ARCH-U |

**RED items mandatory for Proposal A CTR: none.**

---

## 16. Architecture Protection

| Guard | Status |
|-------|--------|
| ARCH-U | **NOT ACTIVATED** |
| Window model | **UNCHANGED** |
| Dock model | **UNCHANGED** |
| LayoutEngine / AppShell region model | **UNCHANGED** |
| Session / persistence | **UNCHANGED** |
| Scientific engines / SPE contracts | **UNCHANGED** |
| SPE-1 | **CERTIFIED / CLOSED** |
| SemVer | **1.0.0** |
| CTR | **NOT YET** |

---

## 17. Visual Corpus Inputs (confirmed)

| Item | Status |
|------|--------|
| Corpus root | `docs/CRP/visual-corpus/` |
| Index | [`../visual-corpus/INDEX.md`](../visual-corpus/INDEX.md) |
| Manifest | [`../visual-corpus/CAPTURE-MANIFEST.json`](../visual-corpus/CAPTURE-MANIFEST.json) |
| PNG count | **20** baseline states/screens |
| Lovable package | **READY** — [`LOVABLE-INPUT-PACKAGE.md`](../visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md) |
| Critical gap | **NONE** blocking path selection |
| Lovable execution in CRP-5.3 | **NOT PERFORMED** |

---

## 18. Proposal A Target (reference)

Approved Product Face (CRP-3/4):

- One brand  
- Journey tabs own Inicio → Datos → Análisis → Resultados → Reportes  
- Proyecto sidebar  
- Content-forward workspace  
- IDE scaffold collapsed  
- Seeds off  
- StatusBar hidden until meaningful  
- Smart Start without jargon  
- Reportes as Pack home  
- Pack cue from Resultados  

Authority: [`CRP-3-Layout-IA-Proposal.md`](./CRP-3-Layout-IA-Proposal.md) · [`CRP-4-Layout-Decision-Gate.md`](./CRP-4-Layout-Decision-Gate.md)

---

## 19. Validation Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) | No `src` changes |
| SPE-1.V umbrella | `npm run validate:spe-1v-umbrella` | **PASS** (exit 0) | SPE CLOSED preserved |
| Workspace architecture | cite CRP-1 / prior | **FAIL 22/26 pre-existing** | Disclosed; not fixed in CRP-5.3 |
| Git `src/**` | `git status -- src` | Clean | Baseline integrity |

---

## 20. Documentation / Git

### Created

- `docs/CRP/official-records/CRP-5-3-Path-Selection.md` (this file)

### Updated

- `docs/CRP/official-records/README.md`
- `docs/CRP/visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md` (path-selected status)
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/ROADMAP.md`
- `docs/SPE/official-records/README.md` (next pointer only)

### Untouched

- SPE-1 Official Record bodies  
- **`src/**`**  
- SemVer / tags  
- Visual corpus PNGs (no re-capture required)

---

## 21. CRP-5.3 Gate

| Criterion | Result |
|-----------|--------|
| Explicit selected path | **PASS** — Plan A |
| Explicit fallback + CTR floor | **PASS** — Plan B / Plan C |
| Success + failure criteria defined | **PASS** |
| Bounded attempt policy defined | **PASS** |
| Lovable fence defined | **PASS** |
| Repository handoff defined | **PASS** |
| Corpus / package readiness confirmed | **PASS** |
| Implementation fences restated | **PASS** |
| Architecture protection confirmed | **PASS** |
| `src/**` untouched · Lovable not executed | **PASS** |
| Path actionable for next phase | **PASS** |

### **CRP-5.3 = PASS**

```text
STOP
Next = Plan A — Lovable Visual Exploration
Do NOT execute Lovable inside CRP-5.3 (already stopped here)
Do NOT implement Proposal A
Do NOT modify src/**
Do NOT activate ARCH-U
Do NOT reopen SPE-1
Do NOT bump SemVer
Do NOT declare CTR
```

---

## Final certification language

```text
CRP-5.3                        = PASS (Path Selection)
PLAN A                         = SELECTED / PRIORITY
PLAN B                         = ACTIVE FALLBACK (pre-authorized)
PLAN C                         = ACTIVE CTR FLOOR (pre-authorized)
Lovable                        = AUTHORIZED NEXT · NOT EXECUTED HERE
Proposal A                     = APPROVED WITH FENCES (unchanged)
Visual Corpus                  = READY (CRP-5.2)
src/**                         = NO CHANGES
ARCH-U                         = NOT ACTIVE
Window/Dock/Layout models      = UNCHANGED
SPE-1                          = CERTIFIED / CLOSED
SemVer                         = 1.0.0
Commercial Test Ready          = NOT YET
Next                           = Lovable Visual Exploration (bounded)
```

**End of Official Record — CRP-5.3 PASS · STOP**
