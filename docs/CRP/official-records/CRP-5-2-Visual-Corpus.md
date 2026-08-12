# CRP-5.2 — Baseline Visual Corpus

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** Visual evidence / baseline corpus — **NO `src/**` IMPLEMENTATION · NO LOVABLE EXECUTION · NO PROPOSAL A IMPLEMENTATION · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Evidence basis:** Live app at `http://localhost:3000` · CRP-0…4 · CRP-1 VC-01…14 backlog · Proposal A APPROVED WITH FENCES  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · Commercial Test Ready **NOT YET**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **CRP-5.2** | **PASS** |
| **Corpus** | **COMPLETE** for VC-01…14 + CORP-01…12 |
| **Screens / states captured** | **20** PNG assets · **19** capture IDs (+ VC-01b verify) |
| **Lovable** | Input package **READY** · **NOT EXECUTED** |
| **`src/**` changes** | **NONE** |
| **SPE-1 / SemVer / CTR / ARCH-U** | Untouched · CLOSED / 1.0.0 / NOT YET / NOT ACTIVE |
| **Next** | **CRP-5.3 — Path Selection** |

```text
CRP-5.2 = PASS
Visual Corpus = docs/CRP/visual-corpus/
Lovable = NOT YET
STOP — next = CRP-5.3 Path Selection
```

---

## 2. Purpose

### Purpose A — Baseline evidence

Document the **actual** Product Face before any Commercial Readiness implementation.

### Purpose B — Design input

Provide faithful visual reference for later **Plan A — Lovable-assisted visual exploration** (only if CRP-5.3 selects Plan A).

Corpus answers: *What does the product look like today, what should Lovable understand, and what visual problems are we solving?*

**Not** an implementation specification.

---

## 3. Capture methodology

| Item | Value |
|------|-------|
| Runtime | `npm run dev` → Next.js 16 local · `http://localhost:3000` |
| Primary capture | Playwright headless **Microsoft Edge** (`docs/CRP/visual-corpus/_capture-corpus.mjs`) |
| Supplemental | Cursor browser MCP screenshots (cross-check cold start / journey) |
| Session | Empty cold session · Modo **Estándar** · no dataset import |
| Integrity | Screenshots unmodified · no beautify · no Proposal A fake mocks |
| Dev noise | Next.js hydration toast removed only in capture helper DOM (not `src/**`) |
| Timestamp | 2026-08-12T01:31:44.650Z ([`CAPTURE-MANIFEST.json`](../visual-corpus/CAPTURE-MANIFEST.json)) |

---

## 4. Corpus location

```text
docs/CRP/visual-corpus/
  INDEX.md
  CAPTURE-MANIFEST.json
  _capture-corpus.mjs
  cold-start/
  journey/
  scaffold/
  seeds/
  navigation/
  chrome/
  false-affordances/
  responsive/
  lovable-package/LOVABLE-INPUT-PACKAGE.md
```

Authoritative index: [`../visual-corpus/INDEX.md`](../visual-corpus/INDEX.md)

---

## 5. Corpus Index (summary)

Full table in INDEX.md. VC coverage of CRP-1 backlog:

| CRP-1 ID | Corpus ID | Status |
|----------|-----------|--------|
| VC-01 | VC-01 | **CAPTURED** |
| VC-02 | VC-02 | **CAPTURED** (Smart Start on Inicio; expert dismissal not required — scaffold already visible with Smart Start) |
| VC-03 | VC-03 | **CAPTURED** |
| VC-04 | VC-04 | **CAPTURED** |
| VC-05 | VC-05 | **CAPTURED** |
| VC-06 | VC-06 | **CAPTURED** |
| VC-07 | VC-07 | **CAPTURED** |
| VC-08 | VC-08 | **CAPTURED** |
| VC-09 | VC-09 | **CAPTURED** (empty Results — authorized) |
| VC-10 | VC-10 | **CAPTURED** (Pack disabled empty — authorized) |
| VC-11 | VC-11 | **CAPTURED** |
| VC-12 | VC-12a / VC-12b | **CAPTURED** |
| VC-13 | VC-13 | **CAPTURED** |
| VC-14 | VC-14 | **CAPTURED** |

Additional: VC-15…18 (false affordances, sidebar collapse, menu groups, PlanningMode on Datos).

---

## 6. State coverage notes

### Cold Start / Inicio

Dual chrome + Smart Start + open Explorer/Inspector + seed windows + static Ready — VC-01/02.

### Scientific journey

Datos → Análisis → Resultados → Reportes (empty session) — VC-07…10. Journey chrome and CTAs visible without forcing clean data.

### IDE scaffold

Explorer / Inspector / Console expanded (PlanningMode default) — VC-05, VC-18. Dock remains empty / non-product face.

### Seeds

`Ventana Workspace A` (ux-9.2-seed-content) + `Ventana Workspace B` auto-present — VC-06, VC-14. Activation seed behavior **not disabled**.

### Menu / Sidebar

Dashboard Científico, project CTAs, Científico/Análisis/Recursos/Ajustes — VC-04, VC-17; collapsed rail — VC-16.

### Header / Chrome

Toolbar brand + workspace “Scientific Graph AI” + Ready — VC-13; StatusBar region — VC-11.

### False affordances

New Series, empty Properties/Appearance, Console READY/WARNINGS/ERRORS chips, SCI-*/ARCH-* Smart Start copy — VC-15 / VC-02 / VC-05.

### Width / layout

1440 · 1280 · sidebar collapsed — VC-12a/b, VC-16. Panel-collapsed commercial default = **NOT CURRENTLY AVAILABLE**.

---

## 7. Visual Gap Register

| Corpus | Current problem | Proposal A response | Priority | Evidence |
|--------|-----------------|---------------------|----------|----------|
| Cold Start | Dual chrome + scaffold + seeds | Single hierarchy · content-forward · seeds off | **P0** | VC-01, VC-05, VC-06 |
| Header | Duplicate brand + Ready theater | Single brand · demote context · remove Ready | **P0** | VC-13 |
| IDE Scaffold | Empty Explorer/Inspector/Console open | Collapse/hide default | **P0** | VC-05, VC-18 |
| Datos | Canvas squeezed by panels | Content-forward workspace | **P0** | VC-07 |
| Análisis | Right empty Inspector vs in-canvas inspector | Collapse IDE Inspector; keep analysis UI | **P0** | VC-08 |
| Resultados | Empty canvas + weak Pack path cue | Contextual Pack cue → Reportes | **P1** | VC-09 |
| Reportes | Pack CTA present but disabled/obscured by seeds | Keep Pack home; clear visibility when ready | **P1** | VC-10 |
| Seeds | Demo floating windows | Gate off commercial face | **P0** | VC-06, VC-14 |
| False affordances | New Series / Console chips / jargon | Hide/demote inert chrome; plain Smart Start copy | **P0** | VC-15, VC-02 |
| Sidebar | Dense competing chrome | Proyecto-first support sidebar | **P1** | VC-04, VC-17 |
| StatusBar | Empty footer region | Hide until meaningful | **P1** | VC-11 |
| Width | Density worse at 1280 with panels | Collapse panels + content-first | **P1** | VC-12b |

Issues limited to CRP-2/3 diagnoses — none invented.

---

## 8. Proposal A Visual Target Reference (TEXT ONLY)

From CRP-3/4 — for corpus consumers:

- Single brand header  
- Tabs own journey (Inicio…Reportes)  
- Proyecto sidebar  
- Content-forward workspace  
- IDE collapsed  
- Seeds off  
- StatusBar hidden until meaningful  
- Smart Start without jargon  
- Reports/Pack visibility + Resultados Pack cue  

**No fake target screenshot generated.**

---

## 9. Lovable Input Package

| Item | Status |
|------|--------|
| Package path | [`../visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md`](../visual-corpus/lovable-package/LOVABLE-INPUT-PACKAGE.md) |
| Current corpus | Ready |
| Problem map | Ready |
| Target principles | Ready |
| Preservation list | Ready |
| Removal/demotion list | Ready |
| Architecture disclaimer | Ready |
| Lovable execution | **NOT PERFORMED** (gated by CRP-5.3) |

---

## 10. Missing Evidence

| Gap | Severity | Notes |
|-----|----------|-------|
| Populated Resultados (with chart) | Low for path selection | Empty Results authorized by VC-09; SPE path still certified |
| Pack Lite **enabled** state | Low | Disabled empty CTA is the commercial empty-face truth |
| IDE panels fully collapsed screenshot | Medium → mitigated | Default open fully documented; collapse control exists but seed overlay blocked automated click (VC-19 attempt) |
| Dock product content | N/A | **NOT CURRENTLY AVAILABLE** as commercial face |

**No critical gap blocking CRP-5.3 path selection.**

---

## 11. Baseline Integrity

| Check | Result |
|-------|--------|
| `src/**` | **NO CHANGES** |
| Product Face / CSS / layout code | Untouched |
| Seeds / PlanningMode / StatusBar behavior | Untouched |
| Session state persisted into repo | **No** |
| Unexpected config commits | None intended (Playwright may exist under `node_modules` local-only via `--no-save`) |

---

## 12. Validation Results

| Check | Command | Result | Notes |
|-------|---------|--------|-------|
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0) | No `src` changes |
| SPE-1.V umbrella | `npm run validate:spe-1v-umbrella` | **PASS** (exit 0) | SPE CLOSED preserved |
| Workspace architecture | cite CRP-1 / prior | **FAIL 22/26 pre-existing** | Disclosed; not fixed |
| Git `src/**` | `git status -- src` | Clean | Baseline integrity |

---

## 13. Documentation / Git

### Created

- `docs/CRP/official-records/CRP-5-2-Visual-Corpus.md` (this file)
- `docs/CRP/visual-corpus/**` (INDEX, PNGs, Lovable package, capture helper)

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

## 14. CRP-5.3 Readiness

| Question | Answer |
|----------|--------|
| Enough evidence to choose Plan A / B / C? | **YES** |
| Plan A Lovable package usable? | **YES** — if CRP-5.3 selects Plan A |
| Path selected in CRP-5.2? | **NO** — selection is CRP-5.3 only |
| Priority reminder | Plan A Lovable = priority path; confirm against corpus + fences in CRP-5.3 |

---

## 15. CRP-5.2 Gate

| Criterion | Result |
|-----------|--------|
| VC-01…14 captured or authorized empty-state equivalents | **PASS** |
| CORP-01…12 covered or N/A recorded | **PASS** |
| Current vs Proposal A separated | **PASS** |
| Lovable package ready without execution | **PASS** |
| `src/**` untouched | **PASS** |
| Usable for design validation / path selection | **PASS** |

### **CRP-5.2 = PASS**

```text
STOP
Next = CRP-5.3 Path Selection
Do NOT execute Lovable
Do NOT implement Proposal A
Do NOT modify src/**
```
