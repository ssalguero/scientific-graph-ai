# CRP-6.3 — Workspace-First Navigation, Product Iconography & Interaction Continuity

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** GREEN Product Face navigation / Home launcher / optional sidebar presentation — **NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE · NO AI/Scientific Engine · NO typography invent**  
**Authority:** Owner visual/navigation audit · Owner visual decisions amendment · CRP-4 fences · E0 freeze · CRP-6.2 / 6.2.2 / E1  
**Baseline:** SemVer **1.0.0** · commit `95f60b7` · SPE-1 **CERTIFIED / CLOSED** · CTR **NOT YET** · ARCH-U **NOT ACTIVE**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **Phase** | Controlled Product Face Implementation — **CRP-6.3** |
| **Result** | **PASS** (validators green; Owner visual spot-check recommended) |
| **Scope** | Home launcher · Product Iconography · optional sidebar presentation · motion · capability accents |
| **Typography** | **DEFERRED** (unchanged) |

```text
CRP-6.3 = PASS
HOME = icon-only capability launcher + compact objective
SIDEBAR = architecture kept; Home presentation suppressed (zero-width)
ADVANCED = gateway (sixth entry, lower weight)
Capability accents = evidenced pink/violet/coral + tokenized green/yellow
SPE-1 CLOSED · SemVer 1.0.0 · CTR NOT YET · ARCH-U NOT ACTIVE
STOP — await Owner visual acceptance / next authorization
```

---

## 2. Objective

Feel simple while remaining capable: reduce simultaneous navigation exposure without removing capability. Home answers “what can I do?”; journey situates; workspace executes; sidebar is optional secondary chrome.

---

## 3. Navigation responsibility freeze

| Layer | Owns | Must not |
|-------|------|----------|
| **HOME** | Capability launcher + objective entry | Lab inventory, permanent Project console, permanent sidebar |
| **TOP JOURNEY** | Five tabs | Tool inventory |
| **WORKSPACE** | Dominant task surface | Competing permanent menus |
| **SIDEBAR** | Progressive disclosure when needed | Permanent product face; capability icon rail |
| **ADVANCED** | Gateway to expert/modules | Permanent inventory of future AI/Engine/Plugins |

### Duplication map (frozen)

| ENTRY | RESPONSIBILITY |
|-------|----------------|
| Importar / Datos | Home discovers → Datos workspace executes |
| Comparar | Home discovers → Datos/compare executes |
| Crear gráfico | Home discovers → Datos/curvas executes |
| Analizar | Home discovers → Análisis workspace |
| Evaluar / Publicar | Home discovers → Análisis/Reportes |
| Avanzado | Home gateway → expert/advanced views |
| Abrir proyecto | Quiet header / contextual Project (not permanent Home icon wall) |
| Objetivo NL | Dual entry with icons (no AI required) |

---

## 4. Owner visual decisions (locked)

1. **DEFAULT = ICON ONLY** — title + one-line description on hover/focus; aria-label; keyboard parity.
2. Capability icons live on **Home launcher** — not an icon-only sidebar rail. No emoji / decorative wall / mixed generations.
3. Accents: pink · violet · green · yellow · coral/red — dark palette protected; smallest evidence-backed extension (product curve palettes: `#ec4899`, `#a855f7`, `#f97316` + existing green/amber/red).
4. Objective: **¿Qué deseas hacer hoy?** / **Describe tu objetivo...** compact above icons.
5. Advanced = gateway, sixth entry, lower weight.
6. Sidebar architecture kept; presentation may be zero-width when unnecessary.
7. Motion = existing tokens; subtle / short / purposeful.
8. Typography deferred.

---

## 5. Scope boundary

| Zone | Items |
|------|-------|
| **GREEN** | Smart Start Home composition · options/routing · WorkspaceIcon capability glyphs · sidebar presentation hide · motion · capability accent bridge |
| **YELLOW** | Future AI/Engine binding to objective input · D45 emoji migration |
| **RED** | New managers · AI/Scientific engines · typography invent · sidebar architecture deletion · Theme Contract rewrite |

---

## 6. Validation gates

| Check | Command | Expect |
|-------|---------|--------|
| Types | `npx tsc --noEmit` | **PASS** |
| Sidebar | `npm run validate:ui-sidebar-architecture` | **PASS** |
| Smart Start | `npm run validate:smart-start-unit` | **PASS** |
| Workflow | `npm run validate:workflow-unit` | **PASS** |
| SPE | `npm run validate:spe-1v-umbrella` | **PASS** |

Known unrelated tension: `validate-ux-2.20` leaf still fails on pre-existing UX-2.19 doc/roadmap delegate checks (registry extension itself typechecks).

---

## 7. Phase gate

**PASS** — `tsc`, `validate:smart-start-unit`, `validate:ui-sidebar-architecture`, `validate:workflow-unit`, `validate:spe-1v-umbrella`. Typography remains deferred. CTR **NOT YET**. Owner visual spot-check recommended before commercial claims.
