# UX-I0 — Visual Modernization Foundation

**Status:** **PLANNING CERTIFIED** · **RELEASE READY**  
**Date:** 2026-08-06  
**Nature:** Implementation Planning only · No implementation · No code  
**Authority:** UX Design System (UX-1…UX-9 RELEASE / SERIES CERTIFIED) · UX-I0 Planning baseline  
**Constraints:** Design System as SSOT · Consume never redesign · Incremental migration · No ENGINE/DATA/AI changes · No breaking changes · No intentional tech debt  

---

## Purpose

Materialize the certified UX-I0 Planning baseline into the official implementation record.

This document **authorizes the UX-I0 Build**.  
It does **not** perform implementation.

---

## Sources

### Primary

| Source | Role |
|--------|------|
| UX-I0 Planning (latest certified planning baseline) | Planning SSOT materialized herein |

### Reference — Design System

| Artifact | Path |
|----------|------|
| Design System v3 | `ux/docs/DESIGN_SYSTEM.md` |
| Color tokens | `ux/docs/COLOR_TOKENS.md` |
| Typography | `ux/docs/TYPOGRAPHY.md` |
| Spacing | `ux/docs/SPACING.md` |
| Motion | `ux/docs/MOTION.md` |
| Theme technical contract | `src/ui/docs/THEME.md` |
| Runtime package | `src/ui/` (`@/ui`) |

### Reference — Existing UX architecture

| Artifact | Path / note |
|----------|-------------|
| ThemeProvider | `src/ui/providers/` · public via `@/ui` |
| ThemeRuntimeHost | `src/app/theme-runtime-host.tsx` (app adapter; adapt host, not Provider) |
| Legacy dual-stack | Official `--color-*` vs D48 `--app-*` (`src/lib/ui/`) |

### Read-only — RELEASE CERTIFIED domains

| Domain | Status | Rule |
|--------|--------|------|
| ENGINE | RELEASE CERTIFIED | Never modify |
| DATA | RELEASE CERTIFIED | Never modify |
| AI | RELEASE CERTIFIED | Never modify |

---

## Nature

| Allowed | Forbidden |
|---------|-----------|
| Implementation Planning | Implementation |
| Documentation of baseline | Code |
| Authorization of UX-I0 Build | Component migration |
| Freeze of strategy & gates | Token redesign |
| | Architecture redesign |
| | Runtime changes |
| | Feature development |

---

## 1. Executive Summary

Materialize the certified implementation baseline for **Visual Modernization**.

The Design System becomes the **only visual authority**.  
Legacy visual infrastructure enters **migration**.

UX-I0 does not invent a theme system: Theme Runtime Host already mounts the certified `ThemeProvider`. Build adopts official tokens and CSS variables across product chrome, progressively replacing the inherited Cursor/Lovable appearance while preserving runtime stability and all RELEASE CERTIFIED domains.

---

## 2. Implementation Philosophy

| Principle | Binding rule |
|-----------|--------------|
| Consume | Use the certified Design System |
| Never redesign | No new tokens, scales, themes, or visual language |
| Never duplicate | No parallel token tables as long-term SSOT |
| Never fork | No forked visual tokens or theme maps |

**Visual definition** lives in `src/ui` + `ux/docs`.  
**Application** only consumes those definitions.

---

## 3. Implementation Goal

Replace progressively the inherited Cursor/Lovable appearance with the certified Design System.

Maintain **runtime stability** throughout migration.

Visible progress is expected from early waves (**W0–W2**), not only at series end.

---

## 4. Implementation Scope

### Includes

| Concern | Intent |
|---------|--------|
| Theme integration | Official ThemeIds, maps, CSS variables |
| Theme runtime | Existing `ThemeProvider` + `ThemeRuntimeHost` |
| Shell migration | App shell / status bar → `--color-*` |
| Primitive migration | Shared `components/ui` |
| Workspace migration | Workspace chrome + local token facades |
| Window migration | Window chrome colors only |
| Feature migration | Later waves; incremental |
| Documentation | Planning + Build records |
| Validation | UX-I0 gates + existing UX validators |
| Certification | Planning now · Build later |

### Token / theme concerns (Build scope)

| Concern | Certified source | Integration intent |
|---------|------------------|--------------------|
| Theme Provider | `@/ui` `ThemeProvider` | Keep host adapter; expand authorized consumption |
| Color / Focus / Elevation | Theme maps → CSS vars | Prefer `--color-*` / `--focus-*` / `--elevation-*` |
| Typography / Spacing / Radius / Motion / Shadows | Invariant semantics → CSS vars | Consume generated vars; no new scales |
| Theme Context | `useTheme` | Chrome that must react to theme id |
| CSS Variables | `getThemeCssVars` pipeline | Single naming contract; no rename |
| Global styles | `src/app/globals.css` | Align body/host with `data-theme` (no new visual language) |
| Theme switching | Existing `setTheme` / ThemeIds | Enable product use of DS themes only; host-only adaptations |
| Light / Dark / HC | Four ThemeMaps | Compatibility as defined; default remains `light` until Build flips intentionally |

### Excludes

- Design System redesign  
- Architecture redesign  
- New visual language  
- Feature implementation (product capabilities)  
- ENGINE / DATA / AI modifications  
- New tokens, typography scales, components, patterns, or UX principles  
- Redesign of ThemeProvider internals or ThemeMaps  
- Full elimination of `--app-*` in a single step  

---

## 5. Dependencias


| Dependency | Status |
|------------|--------|
| UX-3 Theme System + UX-3.21 Runtime Certified | Satisfied |
| UX-4 Theme Runtime Host (UX-4.1) | Satisfied |
| UX-5…UX-9 RELEASE / SERIES CERTIFIED | Satisfied (do not regress) |
| `@/ui` public API + THEME / TOKEN contract versions | Frozen SSOT |
| ENGINE / DATA / AI RELEASE CERTIFIED | Must remain untouched |

---

## 6. Arquitectura de integración

```text
ux/docs + src/ui/foundation + src/ui/theme/maps   = SSOT (immutable in UX-I*)
        ↓
ThemeProvider (certified) ← ThemeRuntimeHost (app adapter only)
        ↓
[data-theme] + CSS variables on host element
        ↓
Product UI consumes var(--color-*), var(--spacing-*), …
        ↓
Legacy src/lib/ui (--app-*) shrinks wave-by-wave
        (documented bridge → collapse duplicates)
```

### Visual Authority

| Layer | Owns | Does not own |
|-------|------|--------------|
| Design System | Visual definitions (SSOT) | Product feature logic |
| Application | Consumption / migration | Visual definitions |

### Rules

- Design System = only SSOT; no duplicate token tables in feature folders long-term.  
- Import policy: expand authorized `@/ui` consumption for **presentation chrome** only; never open ENGINE / DATA / AI to UI imports.  
- Dual-stack allowed only as a **documented transitional bridge**, not a permanent second SSOT.  
- Policy: **adapt the host, not the Provider**.  

### Theme contract (frozen)

| Item | Value |
|------|-------|
| ThemeIds | `light` \| `dark` \| `highContrastLight` \| `highContrastDark` |
| Themeable domains | `color`, `focus`, `elevation` |
| Invariant domains | `spacing`, `radius`, `typography`, `motion`, `opacity`, `zIndex` |
| Official CSS prefixes | `--color-*`, `--focus-*`, `--elevation-*`, `--spacing-*`, … |
| Legacy prefix | `--app-*` (D48; migration target) |

---

## 7. Migration Strategy

Materialize waves **W0 → W6**.  
Preserve **dual-stack compatibility** until migration completion for each surface.

### Adoption order

1. **Freeze & inventory** — map `--app-*` / hardcoded palette call sites.  
2. **Host integrity** — ThemeProvider vars reach the tree; reconcile `globals.css` vs `data-theme`.  
3. **Chrome-first** — shell → primitives → workspace chrome.  
4. **Facade collapse** — replace local `*_TOKENS.ts` maps that alias `--app-*` with official vars (no new tokens).  
5. **Theme switching** — wire `useTheme().setTheme` only after chrome is stable on official vars.  
6. **Legacy quarantine** — chart / scientific domain colors excluded until a later contract.  

### Waves — components / surfaces affected


| Wave | Paths | Notes |
|------|-------|-------|
| W0 | `theme-runtime-host`, `layout`, `globals.css` | Host / globals integrity |
| W1 | `app-shell`, `status-bar` | Already partial `--color-*` |
| W2 | `components/ui/*` | Shared buttons / panels |
| W3 | `workspace/*` chrome + local token maps | Stop double-theming via `getAppShell` |
| W4 | `windows/*` chrome | Color only; keep interaction bridges |
| W5 | home / settings / workflow | `UI_TOKENS` consumers |
| W6 | feature panels | Incremental (import, worksheets, comparison, reports, …) |
| Out | `engine`, `data`, `ai`, chart math / series colors | Forbidden or separate contract |

---

## 8. Riesgos


| Risk | Mitigation |
|------|------------|
| Dual-stack visual drift | Wave gates; no new `--app-*` keys; prefer official vars |
| Accidental ThemeProvider / API change | Host-only edits; contract version asserts |
| Theme switch before chrome migration | Gate switching after W1–W2 |
| Chart / domain color mistaken for chrome | Explicit exclusion list |
| Breaking UX-6…9 interaction | Color / CSS only; no provider / interaction refactors |
| Debt via new local token files | Forbid new maps; collapse existing facades |

---

## 9. Quality Gates

Materialize all certified gates defined by UX-I0 Planning.  
Gates are **implemented in Build**; definitions are frozen here.

| Gate | Criterion |
|------|-----------|
| **UX-I0-G1** Architecture | No ENGINE / DATA / AI UI imports; host policy preserved |
| **UX-I0-G2** SSOT | No new tokens / themes; contract versions unchanged |
| **UX-I0-G3** Boundaries | Migration only under `src/app` presentation + `src/components` + authorized `src/lib/ui` bridge |
| **UX-I0-G4** Dual-stack discipline | Documented bridge; no new `--app-*` introductions |
| **UX-I0-G5** Theme compatibility | All four ThemeIds still resolve; default `light` documented |
| **UX-I0-G6** Non-regression | Existing `validate:ux-*` / `validate:theme-runtime` remain PASS |
| **UX-I0-G7** Documentation | Planning record + Build checklist completed |

---

## 10. Validators

Materialize the validator strategy defined by UX-I0 Planning.  
**No validator redesign.** Scripts are authored in Build; names and roles are frozen here.


| Validator (planned) | Role |
|---------------------|------|
| `validate-ux-i0-planning.ts` / doc gate | Planning artifact presence + required sections |
| `validate-ux-i0-boundaries.ts` | Forbidden domain paths untouched; no DS source mutation |
| `validate-ux-i0-ssot.ts` | No new token / theme files under foundation / maps |
| `validate-ux-i0-adoption.ts` | Wave assertions (chrome uses `--color-*`; no new `--app-*` keys) |
| Umbrella `validate:ux-i0` | Aggregates Build gates |

Planning phase documents these without adding scripts.

---

## 11. Checklist de implementación (UX-I0 Build)

- [ ] Confirm ThemeRuntimeHost remains the sole Provider mount  
- [ ] Reconcile globals vs `data-theme` host  
- [ ] Inventory `--app-*` / hardcoded colors by wave  
- [ ] Migrate W0 → W5 per architecture rules (W6 incremental)  
- [ ] Enable theme switching UI only after chrome-on-official-vars  
- [ ] Collapse duplicate local token maps  
- [ ] Run existing UX validators + new UX-I0 gates  
- [ ] Verify UX Success Metrics  
- [ ] Write Build completion record (separate from this Planning record)  

---

## 12. Acceptance Criteria

Materialize **exactly** the certified planning criteria.

### Planning (this phase)

| Criterion | Status |
|-----------|--------|
| Official record exists with all required sections (including UX Success Metrics) | ✓ |
| SSOT and exclusions unambiguous | ✓ |
| First consumers and waves named with concrete paths | ✓ |
| Gates / validators / DoD / Build roadmap defined | ✓ |
| No implementation files modified in Planning | ✓ |
| Declared **PLANNING CERTIFIED** and Build authorized | ✓ |

### Build (future — not started)

Build shall satisfy Quality Gates UX-I0-G1…G7, the implementation checklist, and UX Success Metrics without reinterpretation of this baseline.

---

## 13. UX Success Metrics

Qualitative success criteria for the UX-I0 objective (**not** numeric KPIs).

Build completion shall demonstrate:

- Legacy Cursor chrome is **progressively replaced** by Design System surfaces.  
- Theme switching is visually consistent.  
- Visual consistency across Shell, Workspace, and Shared Components.  
- No duplicated token sources.  
- Reduced usage of legacy `--app-*` variables.  
- No visual regressions.  
- All RELEASE CERTIFIED domains remain unaffected.  
- **Visible progress after W0–W2.**  

---

## 14. Definition of Done

| Criterion | Status |
|-----------|--------|
| Planning baseline fully materialized in this record | ✓ |
| Series index + UX docs link present | ✓ (with companion index) |
| Status **PLANNING CERTIFIED** · **RELEASE READY** | ✓ |
| Implementation **NOT STARTED** | ✓ |
| Ready for **UX-I0 Build** without further planning reinterpretation | ✓ |

---

## 15. Roadmap de UX-I0 Build


| Step | Focus |
|------|-------|
| B0 | Host / globals integrity (W0) |
| B1 | W1 chrome completion |
| B2 | W2 primitives |
| B3 | W3 workspace chrome + facade collapse |
| B4 | Theme switching product enablement (DS ThemeIds only) |
| B5 | W4–W5 surfaces |
| B6 | Validators + Build certification record + Success Metrics check |
| Later | W6 features / chart domain-color adoption (out of UX-I0 core if needed) |

---

## 16. Certification Status


| Item | Status |
|------|--------|
| Planning | **CERTIFIED** |
| Implementation | **IMPLEMENTED** · Foundation **COMPLETE** (see Build record) |
| Design System | **CERTIFIED** (UX-1…UX-9) |
| ENGINE | **RELEASE CERTIFIED** |
| DATA | **RELEASE CERTIFIED** |
| AI | **RELEASE CERTIFIED** |
| This record | **PLANNING CERTIFIED** · **RELEASE READY** |
| Build record | [UX-I0-Visual-Modernization-Foundation-BUILD.md](./UX-I0-Visual-Modernization-Foundation-BUILD.md) |
| Next | **UX-I1 — Application Shell Modernization** |

---

## 17. Out of Scope

- Implementation  
- Code  
- Component migration  
- Feature development  
- Runtime changes  
- Token redesign  
- Architecture redesign  
- Modifications to ENGINE / DATA / AI  
- New visual language or Design System fork  

---

## Official Declarations

- UX-I0 Visual Modernization Foundation (Planning): **COMPLETE**  
- Visual authority: **Design System (SSOT)**  
- Legacy visual infrastructure: **ENTERING MIGRATION** (Build)  
- Runtime behavior (this phase): **UNCHANGED**  
- Planning: **PRESERVED** · **CERTIFIED** · **RELEASE READY**  
- Next authorized phase: **UX-I1 — Application Shell Modernization**  

---

## Registration Note

`PROJECT_STATUS` / master roadmap synchronization is a **governance follow-up** and is not required to certify this Planning record. This document is the SSOT for UX-I0 Planning authorization of Build.
