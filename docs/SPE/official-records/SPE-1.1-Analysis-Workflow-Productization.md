# Official Record

# SPE-1.1 — Analysis Workflow Productization

**Domain:** SPE — Scientific Product Expansion  
**Series / Phase:** SPE-1.1  
**Date:** 2026-08-11  
**Nature:** Thin productization of guided scientific workflow continuity — **NO NEW ENGINES · NO SPE-1.2 PACK · NO ARCHITECTURE UNFREEZE**  
**Status:** **PASS**  
**Planning Authority:** [`../SPE-Planning-Charter.md`](../SPE-Planning-Charter.md) (**IN FORCE / FROZEN**)  
**Prior phases:** SPE-1.0 freeze · [`SPE-1-E-Entry-Hygiene.md`](./SPE-1-E-Entry-Hygiene.md) (**PASS**)  
**Prior tip (cite-only):** `66b6005b4d2445755eabbd853eff2d581c1c5ba8`

```text
SPE-1.1 PASS
  ≠ SPE-1.2 Publication Pack Lite
  ≠ EXPORT-3 ZIP · AIR-1 · ARCH-U · OBS-1
  ≠ new scientific engines / algorithms
  ≠ Session / Window / Dock / Layout / schema changes
```

---

## 1. Objective

Close the guided **analysis → results → Reports / Scientific Report** continuity gap for `compare-groups`, while preserving `evaluate-publication`.

---

## 2. Implementation summary

### Before

```text
compare-groups → … → review-results (results) → STOP
```

User had no guided step into Informes / `showScientificReport`.

### After

```text
compare-groups → … → review-results (results)
  → report (reports + showScientificReport) → publication-output readiness
```

`evaluate-publication` last step unchanged (reports + `showScientificReport`).

### Productization (thin)

- Added `report` step to `buildCompareGroupsWorkflowSteps`
- Catalog + Smart Start IA copy pointing toward Comparar grupos → Informes
- Completion host tab follows last step (reports) instead of hardcoding `data`
- Completion panel copy names Informes / export readiness (not Pack Lite)

---

## 3. Files changed

| Path | Purpose |
|------|---------|
| `src/lib/scientific/workflow/templates.ts` | compare-groups → Reports bridge step |
| `src/lib/scientific/workflow/catalog.ts` | Catalog description |
| `src/lib/smart-start/options.ts` | Analyze-dataset IA toward guided Comparar grupos |
| `src/app/page.tsx` | Completed workflow host tab = last step tab |
| `src/components/workflow/GuidedWorkflowPanel.tsx` | Completion copy / export readiness |
| `src/lib/scientific/workflow/__tests__/workflow-visibility-snapshot.cases.ts` | SPE-1.1 bridge cases |
| `scripts/validate-workflow-unit.ts` | minCaseCount 15 |

---

## 4. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| AC-1 | evaluate-publication continuity | **PASS** (last step preserved; unit case) |
| AC-2 | compare-groups analysis → results | **PASS** (prior steps unchanged) |
| AC-3 | results → Reports / Scientific Report bridge | **PASS** (new report step + cases) |
| AC-4 | scientific calculation semantics unchanged | **PASS** (no engine edits) |
| AC-5 | visibility / toggle semantics authoritative | **PASS** (reuses `showScientificReport`) |
| AC-6 | no architecture breach | **PASS** (diff review) |
| AC-7 | publication output readiness only (≠ Pack Lite) | **PASS** |
| AC-8 | regression floor | **PASS** (gates below) |

---

## 5. Validation

| Command | Result |
|---------|--------|
| `npm run validate:workflow-unit` | **PASS** (15/15; includes SPE11.*) |
| `npm run validate:methodology-unit` | **PASS** |
| `npm run validate:comparison-unit` | **PASS** |
| `npm run validate:visibility-unit` | **PASS** |
| `npm run validate:smart-start-unit` | **PASS** |
| `npm run validate-prod1-gate` | **PASS** |
| `npm run validate:engine-import-export-unit` | **PASS** |
| `npx tsc --noEmit` | **PASS** |

---

## 6. Manual smoke

| Smoke | Path | Result |
|-------|------|--------|
| **A** | evaluate-publication → Scientific Report | **PASS** (static + unit: last step reports + toggle) |
| **B** | compare-groups → results → Reports → Scientific Report | **PASS** (static + unit: bridge step + apply toggle) |
| **C** | Existing export affordance reachable without SPE-1.2 | **PASS** (Reports tab / existing EXPORT-1/2 UI unchanged; Pack Lite not implemented) |

**Disclosure:** Interactive browser Continuity smoke **NOT RUN** (environment) — objective proof via SPE11 unit cases + orchestration review of `applyCurrentGuidedWorkflowStep` (toggle → navigate → advance).

---

## 7. Architecture fence

**PASS.** No changes to Session, Window/Dock/Layout model, IndexedDB / `.sgproj` schema, Recharts interior, AI runtime, plugins, collab realtime, or scientific calculation modules.

---

## 8. Residuals

| Item | Disposition |
|------|-------------|
| SPE-1.2 Publication Pack Lite | Next phase — not started |
| Full EXPORT-3 ZIP | Deferred |
| OBS-1 residual validators | Outside SPE-1.1 |
| Interactive browser smoke corpus | Optional Owner follow-up |
| SCI-40 / mandatory SCI-58 | Still OUT of SPE DoD |

---

## 9. Execution boundary

```text
SPE-1.1 PASS / READY FOR SPE-1.2
SPE-1.2 BUILD NOT STARTED
SPE-1.2 requires separate Owner authorization / execution step.
```

---

## 10. Certification gates — SPE-1.1

```text
GATE SPE-1.1  BRIDGE IMPLEMENTED                 PASS
GATE SPE-1.1  EVALUATE-PUBLICATION PRESERVED     PASS
GATE SPE-1.1  VALIDATION FLOOR                   PASS
GATE SPE-1.1  ARCHITECTURE FENCE                 PASS
GATE SPE-1.1  PACK LITE BOUNDARY                 PASS (not implemented)
SERIES PHASE  SPE-1.1                            PASS
```

---

## 11. Authority cites

- [`../SPE-Planning-Charter.md`](../SPE-Planning-Charter.md)
- [`SPE-1-Planning-Freeze.md`](./SPE-1-Planning-Freeze.md)
- [`SPE-1-E-Entry-Hygiene.md`](./SPE-1-E-Entry-Hygiene.md)
- [`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md) · [`../../roadmaps/ROADMAP.md`](../../roadmaps/ROADMAP.md)

**End of Official Record — SPE-1.1 PASS**
