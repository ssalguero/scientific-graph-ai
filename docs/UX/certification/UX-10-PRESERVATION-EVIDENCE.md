# UX-10 — Preservation Evidence

**Assessment date:** 2026-08-08  
**Method:** `git status`, `git diff --stat`, targeted `git diff --name-only` on architecture-sensitive paths; validator PASS where domain-relevant.

---

## 1. Architecture preservation

| Subsystem | Status | Evidence |
|-----------|--------|----------|
| AppShell | **PRESERVED** | No diff under `src/components/app-shell/` |
| Workspace architecture modules | **PRESERVED** | Only presentation class tweaks in `WorkspaceContent.tsx`; no layout/token module rewrite |
| Windows | **PRESERVED** | No diff under `src/components/windows/` |
| Tabs | **PRESERVED** | No diff under `src/components/tabs/` / `tab-ui/` |
| Docking | **PRESERVED** | No docking architecture files in P0 change set |
| Session | **PRESERVED** | No diff under `src/components/session/` |
| Persistence architecture | **PRESERVED** | Only presentation helpers (`persistenceViews.ts`, project panels, `userMessages.ts`); no SessionRegistry/Provider/DirtyTracker/AutosaveScheduler changes |
| Restore | **PRESERVED** | `SessionRestoreEngine` not modified |
| Autosave architecture | **PRESERVED** | Presentation of existing `autosaveIndicator` only |

**Verdict:** **ARCHITECTURE: PRESERVED / CERTIFICATION READY**

---

## 2. Design System preservation

| Check | Result | Evidence |
|-------|--------|----------|
| Token SSOT (`src/lib/ui/tokens.ts`, `src/ui/`) | Untouched | Empty targeted diff |
| `ux/docs/` / governance docs | Untouched | Empty targeted diff |
| Parallel token system | Not created | Only app-owned legacy bridge |
| Bridge change | Consumes DS | `--app-accent-soft` = `color-mix` of `--color-brand-primary` + `--color-surface-default` in `legacy-app-token-bridge.ts` (+3 lines) |

**Verdict:** **DESIGN SYSTEM: PRESERVED / CERTIFICATION READY**

---

## 3. Geometry preservation

| Check | Result |
|-------|--------|
| Window geometry | No unauthorized changes |
| Tab geometry | No unauthorized changes |
| Docking | No unauthorized changes |
| Workspace chrome geometry / resize / snap | No unauthorized changes |

**Verdict:** **GEOMETRY: PRESERVED / CERTIFICATION READY**

---

## 4. DATA / GRAPH / Export integrity

| Domain | Status | Evidence |
|--------|--------|----------|
| DATA semantics / engines | **PRESERVED** | No diff under `src/data/` |
| Import / Worksheet semantics | **PRESERVED** | Presentation-only panel/wizard edits |
| GRAPH math / axes / series (`src/lib/graph/**`) | **PRESERVED** | Empty targeted diff; graph-axes/series/rendering/interaction units PASS |
| Chart export core | **PRESERVED** | `src/app/chartExport.ts` / export coordination untouched; `validate:export1-chart-export-unit` PASS |
| MainComposedChart architecture | **PRESERVED** | File not in P0 change set (deeper plot chrome deferred) |

**Verdict:** **DOMAIN CONTRACTS: PRESERVED / CERTIFICATION READY**

---

## 5. Performance preservation

| Check | Result | Evidence |
|-------|--------|----------|
| New polling / timers / duplicated graph recompute | Not observed in P0 presentation scope | Diff limited to UI components |
| Heatmap / bubble / PCA perf documental gates | PASS | `validate:prod2e-d26/d27/d28-*-perf` exit 0 |

**Verdict:** **PERFORMANCE: PRESERVED / CERTIFICATION READY**

---

## Unauthorized-change audit

No unauthorized architecture, Design System foundation, geometry, DATA, GRAPH math, Export core, Session, or Performance architecture changes were found in the P0 working tree.

Presentation-only changes remain uncommitted; certification does not commit them.
