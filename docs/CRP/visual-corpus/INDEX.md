# CRP-5.2 Visual Corpus Index

**Series:** Commercial Readiness Preparation  
**Phase:** CRP-5.2 — Baseline Visual Corpus  
**Capture date:** 2026-08-12  
**App URL:** `http://localhost:3000` (local `npm run dev`, SemVer **1.0.0**)  
**Machine capture:** Playwright via Microsoft Edge (`channel: msedge`) · helper `_capture-corpus.mjs`  
**Manifest:** [`CAPTURE-MANIFEST.json`](./CAPTURE-MANIFEST.json)

## Separation rule

| Layer | Content |
|-------|---------|
| **CURRENT BASELINE (before)** | PNG screenshots in this tree — unmodified product face (CRP-5.2) — **do not replace** |
| **DESIRED REFERENCE (E0)** | Frozen compositional target — [`e0-target/E0-VISUAL-TARGET-FREEZE.md`](./e0-target/E0-VISUAL-TARGET-FREEZE.md) · CRP-6 · **not** Lovable architecture |
| **PROPOSAL A TARGET** | Text — CRP-3/4 · aligned with E0 freeze |

---

## Corpus index

| ID | State | Route/Context | Key Elements | Purpose | File | Reproducible |
|----|-------|---------------|--------------|---------|------|--------------|
| VC-01 | Cold start / Inicio | `/` · tab Inicio · Modo Estándar | Brand, tabs, Smart Start, sidebar, Explorer, Inspector, seeds, Ready | First impression | [`cold-start/VC-01-cold-start-inicio.png`](./cold-start/VC-01-cold-start-inicio.png) | Yes — empty session reload |
| VC-01b | Capture verify | Same as VC-01 | Edge-channel methodology check | Capture integrity | [`cold-start/VC-01b-edge-verify.png`](./cold-start/VC-01b-edge-verify.png) | Yes |
| VC-02 | Smart Start | Inicio | Six journey cards + natural-language objective | Smart Start surface | [`cold-start/VC-02-smart-start-detail.png`](./cold-start/VC-02-smart-start-detail.png) | Yes |
| VC-03 | Toolbar + tabs | Inicio clip | Brand strip + 5 tabs | Primary nav | [`navigation/VC-03-toolbar-tabs.png`](./navigation/VC-03-toolbar-tabs.png) | Yes |
| VC-04 | Sidebar expanded | Inicio | Dashboard Científico groups / CTAs | Sidebar IA | [`navigation/VC-04-sidebar-expanded.png`](./navigation/VC-04-sidebar-expanded.png) | Yes |
| VC-05 | IDE scaffold | Inicio · tall viewport | Explorer + Inspector + Console open | PlanningMode L/R/B default | [`scaffold/VC-05-explorer-inspector-console.png`](./scaffold/VC-05-explorer-inspector-console.png) | Yes — scroll to Console |
| VC-06 | Seed windows | Inicio | Ventana Workspace A/B · ux-9.2-seed-content | Demo residue | [`seeds/VC-06-seed-windows.png`](./seeds/VC-06-seed-windows.png) | Yes — auto on activation seed |
| VC-07 | Datos empty | tab Datos | Import CTA, empty dataset, scaffold squeeze | Journey Datos | [`journey/VC-07-datos-empty.png`](./journey/VC-07-datos-empty.png) | Yes |
| VC-08 | Análisis | tab Análisis | Visualización categories vs right Inspector | Journey Análisis · naming collision | [`journey/VC-08-analisis.png`](./journey/VC-08-analisis.png) | Yes |
| VC-09 | Resultados empty | tab Resultados | Empty canvas, continuity links | Journey Resultados | [`journey/VC-09-resultados-empty.png`](./journey/VC-09-resultados-empty.png) | Yes |
| VC-10 | Reportes / Pack | tab Reportes | Pack Lite disabled, PDF, exports | Publication path | [`journey/VC-10-reportes-pack.png`](./journey/VC-10-reportes-pack.png) | Yes |
| VC-11 | StatusBar region | Inicio · tall | Footer Status Bar region | Empty status theater | [`chrome/VC-11-statusbar-region.png`](./chrome/VC-11-statusbar-region.png) | Yes |
| VC-12a | Width 1440 | Inicio | Desktop density | Responsive baseline | [`responsive/VC-12a-width-1440.png`](./responsive/VC-12a-width-1440.png) | Yes |
| VC-12b | Width 1280 | Inicio | Reduced desktop | Density under squeeze | [`responsive/VC-12b-width-1280.png`](./responsive/VC-12b-width-1280.png) | Yes |
| VC-13 | Dual header close-up | Inicio clip | Toolbar brand vs workspace strip | Brand hierarchy | [`chrome/VC-13-dual-header.png`](./chrome/VC-13-dual-header.png) | Yes |
| VC-14 | Floating chrome | Inicio | Seed window chrome chips | Window face | [`seeds/VC-14-floating-window-chrome.png`](./seeds/VC-14-floating-window-chrome.png) | Yes |
| VC-15 | False affordances | Inicio | New Series, empty panels, Ready, SCI-* copy | False affordances | [`false-affordances/VC-15-false-affordances.png`](./false-affordances/VC-15-false-affordances.png) | Yes |
| VC-16 | Sidebar collapsed | Inicio · collapse control | Icon rail; Dashboard Científico hidden | Width/layout state | [`responsive/VC-16-sidebar-collapsed.png`](./responsive/VC-16-sidebar-collapsed.png) | Yes — “Colapsar barra lateral” |
| VC-17 | Menu / sidebar groups | Datos | Científico / Análisis / Recursos / Ajustes | Navigation baseline | [`navigation/VC-17-sidebar-menu-groups.png`](./navigation/VC-17-sidebar-menu-groups.png) | Yes |
| VC-18 | PlanningMode panels | Datos · tall | L/R open + workspace squeeze | Scaffold on journey tab | [`scaffold/VC-18-planningmode-panels.png`](./scaffold/VC-18-planningmode-panels.png) | Yes |

**Count:** **20** PNG assets (VC-01…18 + VC-01b) · **19** indexed capture IDs in manifest (+ VC-01b verify).

---

## CORP group coverage

| Group | Status | Evidence |
|-------|--------|----------|
| CORP-01 Cold Start | **COVERED** | VC-01, VC-01b |
| CORP-02 Smart Start | **COVERED** | VC-02 |
| CORP-03 Datos | **COVERED** | VC-07 |
| CORP-04 Análisis | **COVERED** | VC-08 |
| CORP-05 Resultados | **COVERED** (empty session) | VC-09 |
| CORP-06 Reportes / Pack | **COVERED** (Pack disabled empty) | VC-10 |
| CORP-07 IDE Scaffold | **COVERED** | VC-05, VC-18 |
| CORP-08 Seeds | **COVERED** | VC-06, VC-14 |
| CORP-09 Menu / Sidebar | **COVERED** | VC-04, VC-17, VC-16 |
| CORP-10 Header / Chrome | **COVERED** | VC-03, VC-13, VC-11 |
| CORP-11 False Affordances | **COVERED** | VC-15 (+ panels in VC-05) |
| CORP-12 Width / Layout | **COVERED** | VC-12a, VC-12b, VC-16 |

---

## States not currently available / gaps

| Item | Status |
|------|--------|
| IDE panels collapsed as commercial default | **NOT CURRENTLY AVAILABLE** — default PlanningMode leaves L/R/B open (VC-05/VC-18) |
| Automated click “Collapse Explorer” while seeds present | **CAPTURE BLOCKED** — seed overlay intercepts pointer (attempted VC-19) |
| Resultados with populated chart | **EVIDENCE GAP** — not required for empty-session baseline; would need dataset import (state-changing) |
| Pack Lite enabled | **EVIDENCE GAP** — disabled until graph/report content exists (VC-10 shows disabled CTA — valid empty face) |
| Dock populated product dock | **NOT CURRENTLY AVAILABLE** as commercial face content (empty dock remains architectural) |
| Fake Proposal A mock screenshot | **FORBIDDEN** — textual target only |

---

## Reproduction notes

1. `npm run dev` → `http://localhost:3000`  
2. Cold empty session (no dataset).  
3. Optional: `node docs/CRP/visual-corpus/_capture-corpus.mjs` (requires Playwright + Edge/Chrome).  
4. Do **not** persist session/localStorage changes into the repo for baseline purity.  
5. Next.js hydration toast is capture-environment noise — removed only in headless capture helper via DOM cleanup; product not modified.
