# CRP-6.1 — Visual Fidelity Correction / E0 Translation

**Date:** 2026-08-12  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** GREEN visual fidelity correction within authorized Product Face composition — **NO Phase 2 · NO ARCH-U · NO SPE REOPEN · NO SEMVER BUMP · NO CTR DECLARE**  
**Authority:** E0 Visual Target Freeze · CRP-6 · CRP-6.1 Phase 1 PASS · CRP-4 fences  
**Baseline:** SemVer **1.0.0** · SPE-1 **CERTIFIED / CLOSED** · CTR **NOT YET** · ARCH-U **NOT ACTIVE**

---

## 1. Execution Summary

| Element | Status |
|---------|--------|
| **Phase** | CRP-6.1 Visual Fidelity Correction |
| **Result** | **PASS** (pending Owner visual spot-check) |
| **Scope** | Presentation / composition / token usage only |
| **Phase 2** | **NOT IMPLEMENTED** |
| **Next** | Owner authorization for Phase 2 (infrastructure suppression) |

```text
CRP-6.1 Visual Fidelity = PASS (GREEN corrections applied)
Phase 2 = NOT AUTHORIZED
SPE-1 = CLOSED · SemVer = 1.0.0 · CTR = NOT YET · ARCH-U = NOT ACTIVE
```

---

## 2. Audit mismatch list (pre-edit)

Compared running Phase 1 Product Face vs frozen E0 composition (textual + CRP-6 §4; no E0 PNG attached in freeze dir).

| ID | Class | Mismatch | Disposition |
|----|-------|----------|-------------|
| M1 | V1 | Header stack tall (brand + context + instructional + tabs + lab profile) | **Corrected** — compact brand/context row; instructional removed from header |
| M2 | V1 | Workspace squeezed by Explorer/Inspector/Console | **V6 deferred** (Phase 2) |
| M3 | V1/V5 | Product-face context strip competed with workspace | **Corrected** — demoted `sr-only` |
| M4 | V4 | Journey tabs as saturated pill fills | **Corrected** — underline journey treatment |
| M5 | V2 | ThemeProvider locked to light; dark prefs did not apply DS tokens | **Corrected** — `ThemeModeSync` + host default dark |
| M6 | V2 | `appShellDark` inverse hack inverted when tokens sync | **Corrected** — canvas/primary for both modes |
| M7 | V2/V4 | Loud success-green primary CTAs | **Corrected** — brand primary token compositions |
| M8 | V2 | Commercial cold start high-key light vs graphite E0 | **Corrected** — default preference `dark` |
| M9 | V3/V5 | Smart Start heading too small / dense | **Corrected** — hero scale + spacing + max-width |
| M10 | V4 | Lab profile bar visually loud | **Corrected** — quieter chrome |
| M11 | V4 | Resultados Pack CTAs equal weight | **Corrected** — Generar reporte primary · Pack secondary |
| M12 | V5 | Reportes title/subtitle rhythm | **Corrected** — spacing |
| M13 | V6 | Seed windows / open IDE scaffold / StatusBar | **Deferred Phase 2** |

---

## 3. Implemented corrections

1. **Theme fidelity** — Default commercial theme dark graphite via preferences + ThemeRuntimeHost; page `themeMode` synced into ThemeProvider CSS vars.
2. **Shell surfaces** — App shell uses theme-resolved canvas/primary (no inverse hack).
3. **CTA accent** — Sidebar/project primary compositions use brand tokens (restrained accent) instead of feedback-success green.
4. **Header** — Single compact brand + secondary project context; journey tabs as underline strip.
5. **Smart Start** — Content-forward hero width, heading scale, card spacing, demoted expert card.
6. **Workspace chrome** — Product-face context strip visually removed (source marker retained).
7. **Results → Pack** — Primary/secondary CTA hierarchy on continuity bar.
8. **Lab profile** — Visually subordinate.

---

## 4. Intentionally deferred (Phase 2)

| Item | Fence |
|------|-------|
| PlanningMode / PanelState collapse | YELLOW |
| StatusBar hide | YELLOW |
| Contextual Inspector | YELLOW |
| Seed window gating | YELLOW |
| Full-bleed workspace (remove Explorer squeeze) | YELLOW |

---

## 5. Files changed

### Modified

- `src/app/page.tsx`
- `src/app/theme-runtime-host.tsx`
- `src/app/LabUsageProfileSelector.tsx`
- `src/components/home/SmartStartScreen.tsx`
- `src/components/workspace/WorkspaceContent.tsx`
- `src/lib/ui/tokens.ts`
- `src/lib/app-preferences/domain/defaults.ts`
- `src/lib/app-preferences/domain/validation.ts`
- `src/lib/app-preferences/__tests__/user-preferences.cases.ts`
- `src/lib/app-preferences/__tests__/local-storage-adapter.cases.ts`

### Added

- `src/app/theme-mode-sync.tsx`
- `docs/CRP/official-records/CRP-6-1-Visual-Fidelity-Correction.md` (this file)

---

## 6. Architecture protection

| Guard | Status |
|-------|--------|
| SPE-1 | **CLOSED** |
| Window / Dock / Layout models | **UNCHANGED** |
| PanelState / PlanningMode | **UNCHANGED** |
| Session / persistence / engines | **UNCHANGED** |
| SemVer | **1.0.0** |
| CTR | **NOT YET** |
| ARCH-U | **NOT ACTIVE** |

---

## 7. Validation

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** |
| `npm run validate:spe-1v-umbrella` | **PASS** |
| `npm run validate:ui-sidebar-architecture` | **PASS** (12/12) |

---

## 8. Phase gate

### **CRP-6.1 Visual Fidelity Correction = PASS**

**STOP.** Do not start Phase 2 without explicit Owner authorization.
