# Lovable Input Package (CRP-5.2 / CRP-5.3)

**Status:** **PLAN A E0 COMPLETE** — E0 **ACCEPT** · Visual Target **FROZEN** ([`CRP-6-Visual-Target-Acceptance-and-Repository-Handoff.md`](../../official-records/CRP-6-Visual-Target-Acceptance-and-Repository-Handoff.md)) · freeze pointer [`../e0-target/E0-VISUAL-TARGET-FREEZE.md`](../e0-target/E0-VISUAL-TARGET-FREEZE.md)  
**Prior path authority:** [`CRP-5-3-Path-Selection.md`](../../official-records/CRP-5-3-Path-Selection.md)  
**Authority:** Proposal A **APPROVED WITH FENCES** ([`../../official-records/CRP-4-Layout-Decision-Gate.md`](../../official-records/CRP-4-Layout-Decision-Gate.md))  
**Visual baseline (before):** [`../INDEX.md`](../INDEX.md) · **Desired reference:** E0 freeze (not Lovable architecture)

---

## 1. Current visual corpus

Provide Lovable (Plan A selected by CRP-5.3 — execute in next phase only) with:

- Full index: [`../INDEX.md`](../INDEX.md)
- Especially: VC-01 (cold start), VC-02 (Smart Start), VC-05 (scaffold), VC-06/14 (seeds), VC-07…10 (journey), VC-13 (dual header), VC-15 (false affordances), VC-16 (sidebar collapse)

**Instruction:** Treat PNGs as **CURRENT STATE ONLY**. Do not invent a prettier “before.”

---

## 2. Problem map (from CRP-2, evidenced by corpus)

| Problem | Evidence | Commercial impact |
|---------|----------|-------------------|
| Dual brand / dual chrome | VC-01, VC-13 | Weak product identity |
| Open empty IDE scaffold | VC-05, VC-18 | Reads as unfinished IDE |
| Seed floating windows | VC-06, VC-14 | Demo residue over journey |
| Canvas squeezed | VC-07…10 | Scientific content secondary |
| False affordances | VC-15, Explorer New Series, Console chips | Fake capability |
| Static Ready / empty StatusBar | VC-01, VC-11 | Status theater |
| Smart Start internal jargon | VC-02 (SCI-*/ARCH-* in cards) | Tribal knowledge |
| Pack cue weak on Resultados | VC-09 vs VC-10 | Publication path not obvious from Results |
| Sidebar competes as product face | VC-04, VC-17 | Journey vs project ownership blur |

---

## 3. Proposal A target principles (TEXTUAL — no fake mock)

Reproduce visually:

1. **Single brand** in toolbar only  
2. **Tabs own journey:** Inicio · Datos · Análisis · Resultados · Reportes  
3. **Proyecto sidebar** supporting, not competing  
4. **Content-forward workspace** (full-bleed scientific content)  
5. **IDE collapsed/hidden** by default (Explorer / Inspector / Console)  
6. **Seeds off** on commercial face  
7. **StatusBar hidden** until meaningful  
8. **Smart Start** without SCI-*/ARCH-* jargon  
9. **Reports/Pack** discoverable; soft Pack cue from Resultados  

Wireframe reference: CRP-3 §3 composition ASCII.

---

## 4. Preservation list (MUST REMAIN)

- Smart Start on Inicio  
- Tabs: Inicio, Datos, Análisis, Resultados, Reportes (names/order/roles)  
- Pack / PDF on Reportes (SPE-1.2 Pack Lite)  
- Scientific journey engines and certified SPE functionality  
- Project persistence / `.sgproj` / local projects (behavior)  
- Lab profile modes (Básico / Estándar / Experto) as secondary  

---

## 5. Visual removal / demotion list

- Empty Explorer / Inspector / Console open by default  
- Seed windows (`Ventana Workspace A/B`, WorkspaceActivationSeed)  
- Duplicate “Scientific Graph AI” workspace H1  
- Static “Ready” theater  
- Misleading New Series / inert ActionButtons / Console Warnings·Errors chips when empty  
- Competing “Dashboard Científico” as second brand feel  
- English IDE crumbs dominating Spanish product grammar  

---

## 6. Architecture disclaimer (HARD FENCE)

Lovable must **not** infer or propose as required:

- Window model rewrite  
- Dock model / DockLayout rewrite  
- LayoutEngine / AppShell five-region model rewrite  
- Session / IndexedDB / `.sgproj` schema rewrite  
- Visibility / Command schema redesign  
- Scientific engine / SPE workflow changes  
- Governance / SemVer / CTR declare  
- ARCH-U activation  

**Adopt face, not architecture.** Implementation remains in-repo under CRP-4 GREEN/YELLOW fences after Owner path selection.

---

## 7. Plan path note

| Path | Role |
|------|------|
| **Plan A** | **E0 ACCEPT** — visual target frozen (CRP-6); repository implementation next under Owner authorization |
| **Plan B** | **ACTIVE FALLBACK** — controlled repository redesign using same corpus + Proposal A (not activated) |
| **Plan C** | **ACTIVE CTR FLOOR** — Commercial Minimum Face subset (not activated) |

**Path selection authority:** [`CRP-5-3-Path-Selection.md`](../../official-records/CRP-5-3-Path-Selection.md).  
**Handoff / freeze authority:** [`CRP-6-Visual-Target-Acceptance-and-Repository-Handoff.md`](../../official-records/CRP-6-Visual-Target-Acceptance-and-Repository-Handoff.md).  
This package remains the Plan A brief; Lovable is **not** architectural SSOT.
