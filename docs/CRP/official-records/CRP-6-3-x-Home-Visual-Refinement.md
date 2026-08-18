# CRP-6.3.x — Home Visual Refinement (Clean Workspace-First Shell)

**Date:** 2026-08-13  
**Series:** Commercial Readiness Preparation (CRP)  
**Nature:** GREEN visual / shell refinement + **FINAL visual calibration** — **NO architecture redesign · NO new capabilities · NO typography invent · NO auth implementation · NO infrastructure deletion · NO new logo invent**  
**Authority:** Owner CRP-6.3.x mockup calibration authorization · CRP-6.3 PASS · CRP-4 fences  
**Baseline:** CRP-6.3 / 6.3.x · SemVer **1.0.0** · CTR **NOT YET**

---

## Objective

Converge Home visually on the Owner-approved mockup: **optical vertical centering** of one composition (heading + objective + tiles), proportion, and polished launch tiles — not further indiscriminate scale.

## FINAL calibration (Owner-authorized)

| Area | Change |
|------|--------|
| Stage fill | Home stage/launcher/canvas use flex center + `min-height: calc(100dvh - 6.5rem)` to defeat content-sized WorkspaceBodyLayout collapse |
| Height chain | `:has()` + `.flex.min-w-0.flex-col` / `.sm:flex-row` fill rules under `data-crp-home-shell` |
| Heading | 32px semibold; full-string `#ec4899 → #c026d3 → #a855f7` text gradient only |
| Vertical rhythm | `mt-6` heading→objective; `mt-9` objective→tiles (one group) |
| Objective | `max-w-[40rem]`, `h-[3.25rem]`, `px-6`, rounded-xl control group |
| Tiles | ~124px, `rounded-2xl`, soft accent tint/border, icon 54px, `gap-6`, `w-max` row |
| Advanced | Quieter (opacity 60) |
| Chrome | Expand rails / sidebar / panels presentation-hidden; no body frame |
| Brand mark | Existing `/icon.png` retained (brand identity deferred) |

## Validation

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | **PASS** |
| `validate:smart-start-unit` | **PASS** |
| `validate:ui-sidebar-architecture` | **PASS** |
| `validate:workflow-unit` | **PASS** |
| `validate:spe-1v-umbrella` | **PASS** |

## Browser

Headless 1440×1000 capture after stage min-height fix: composition optically centered in stage below header; six tiles one row; auth + mark + nav present; no Profile/Level; open stage.

**Status:** FINAL composition calibration **PASS** (validators + optical browser check). Destination-screen phase not started.
