# Theme System — Technical Contract

> Package docs for `src/ui/theme` and `src/ui/providers` ThemeProvider.
> Functional SSOT remains in `ux/docs/*` (esp. DESIGN_SYSTEM §5 Temas).
> Architecture / runtime / validation narratives: `ux/docs/ThemeArchitecture.md`, `ThemeRuntime.md`, `ThemeValidation.md`.

**Theme contract version:** `THEME_CONTRACT_VERSION = "3.1.3"` (unchanged in UX-3.1.4)

**Foundation token contract:** `TOKEN_CONTRACT_VERSION = "3.1.2"` (unchanged; contracts are decoupled).

## Scope

| Phase | In | Out |
|-------|----|-----|
| UX-3.1.3 | Theme Maps, CSS generators, package-local ThemeProvider | App wiring, persistence, UX-2 bridge |
| UX-3.1.4 | `contracts/`, `runtime/` (validator orchestrator, registry, inspector, utils, adapters seam) | Public API changes, new themes/tokens, visual changes |

## ThemeIds

```text
light | dark | highContrastLight | highContrastDark
```

`DEFAULT_THEME = "light"`. All four exist in the contract even when maps share many refs.

## Layers

```text
Theme Maps (themeable)  →  resolve TokenRef  →  primitive leaf  →  CSS vars
Invariant semantic      →  same pipeline (spacing, radius, typography, …)
ThemeProvider host      →  data-theme + style vars (package only)
runtime/                →  validation orchestration, inspection, utilities (package-internal)
```

Themes only remap tokens. They never change layout, sizes, spacing keys, or structure.

### Themeable domains

`color`, `focus`, `elevation`

### Invariant domains

`spacing`, `radius`, `typography`, `motion`, `opacity`, `zIndex`

## Folder structure

```text
src/ui/theme/
  version.ts, ids.ts, types.ts, index.ts
  contracts/     # thin contract re-exports only
  maps/          # SSOT catalog (light, dark, HC light, HC dark)
  css/           # pure generators
  validators/    # existing rule implementations (unchanged in UX-3.1.4)
  runtime/       # orchestrator, registry, inspector, utils, errors, warnings
    adapters/    # UX-3.2 extension seam → delegates to validators/
src/ui/providers/
  theme-provider.tsx, theme-context.ts
```

Do **not** create `foundation/theme/` or a parallel `src/theme/`.

## contracts/

Barrel only. Re-exports `THEME_CONTRACT_VERSION`, ids, `ThemeMap`, `ResolvedTheme`. No new types.

## validators/ vs runtime ThemeValidator

| Layer | Role |
|-------|------|
| `validators/` | Owns validation **rules** (`validateThemeMap`, `validateAllThemes`, …) |
| `runtime/adapters/` | Thin delegation to those rules (extension seam for UX-3.2) |
| `runtime/ThemeValidator` | Pure **orchestrator** — calls adapters only; returns serializable `ThemeValidationResult`; never throws |

UX-3.1.4 does **not** duplicate or migrate validation rules.

## Runtime (package-internal)

- **ThemeRegistry** — instantiable `Map<ThemeId, ThemeMap>`; **not** SSOT (SSOT = `maps/themes`)
- **ThemeInspector** — read-only; explicit source = registry **or** static catalog
- **ThemeUtils** — pure/immutable; `deepMergeTheme` merges themeable domains only
- **ThemeAssertions** — throw `ThemeErrors` subclasses; internal use
- **ThemeWarnings** — `{ code, message }`; never thrown

Not reexported from `@/ui`.

## CSS variable naming (public Theme Contract)

Names are part of the public Theme Contract. **Renaming a generated CSS variable is a breaking change** (bump major `THEME_CONTRACT_VERSION` + ADR).

```text
color.surface.default  →  --color-surface-default
focus.ringColor        →  --focus-ring-color
elevation.card         →  --elevation-card
spacing.default        →  --spacing-default
```

Algorithm: semantic path segments → kebab-case → `--` + join with `-`.

Prefixes (`--color-*`, `--focus-*`, `--spacing-*`, …) are **distinct** from UX-2 `--app-*`.

Pure API (no DOM):

- `resolveTheme(theme)`
- `getThemeCssVars(theme)`
- `getThemeCssText(theme, selector?)`

## ThemeProvider

- `"use client"` — ready for Next.js App Router
- Applies `data-theme` + CSS vars **only on its host element**
- Exposes `useTheme()`

### Forbidden side effects (hard rule)

```text
ThemeProvider
  ↓
No side effects outside its own host.
```

Must not: write to `<html>` / `<body>` / `document.documentElement`; register global listeners; touch `window` / `localStorage` / cookies; sync `prefers-color-scheme`; bridge UX-2.

Not mounted in the application in UX-3.1.3 / UX-3.1.4.

## Versioning (decoupled)

| Contract | Constant | Bumps when |
|----------|----------|------------|
| Foundation Tokens | `TOKEN_CONTRACT_VERSION` | Foundation contract changes |
| Theme System | `THEME_CONTRACT_VERSION` | Theme ids, maps shape, CSS names, provider host contract |

UX-3.1.4 does **not** bump `THEME_CONTRACT_VERSION` (remains `"3.1.3"`).

## Public API (`@/ui`)

Exports theme data + generators + `ThemeProvider` / `useTheme`.
Does **not** export theme validators or runtime.

Package-local consumption (UX-3.5): `src/ui/theme/hooks` exports certified `*Token` helpers plus `useElevation` / `useMotion`. `useTokens` lives under `theme/tokens/hooks` only. Not re-exported from `@/ui`.

Private selector foundation (UX-3.6): `src/ui/theme/runtime/selectors/` (`ThemeRuntime` alias, `ThemeSelector`, `createSelector`, `memoSelector` SSOT, equality, WeakMap cache). Not re-exported from `@/ui`, `theme/index`, `theme/runtime/index`, or `theme/hooks/index`.

Private runtime context optimization (UX-3.7): `src/ui/theme/runtime/context/` (semantic fingerprint, identity cache, `stableRuntime`, `InternalRuntimeProvider`). Sits above TokenCache; never builds runtimes; not re-exported from public barrels. Public `ThemeContext` remains `{ theme, setTheme, cssVars }`.

Private runtime metrics foundation (UX-3.10): `src/ui/theme/runtime/metrics/` (scalar counters, frozen Collector/Reporter, immutable snapshots). Not re-exported from public barrels. Unrelated to UX-3.4.4 `tokens/runtime/RuntimeMetrics.ts` (Benchmark aggregate).

Private runtime diagnostics foundation (UX-3.11): `src/ui/theme/runtime/diagnostics/` (frozen Level/Code, Builder message SSOT, pure Engine → RuntimeHealth). Consumes RuntimeSnapshot + RuntimeMetricsSnapshot only. Not re-exported from public barrels. Not wired into ThemeProvider.

Private runtime health integration (UX-3.12): `src/ui/theme/runtime/health/` (composed RuntimeHealth from Snapshot + Metrics + DiagnosticEngine; frozen Status/Builder/Reporter). Distinct from diagnostics/RuntimeHealth. Not re-exported from public barrels. Not wired into ThemeProvider.

Private runtime health aggregation (UX-3.13): `src/ui/theme/runtime/aggregation/` (immutable RuntimeAggregation from consecutive RuntimeHealth samples; instance Accumulator; frozen Builder/Reporter). Builder not barrel-exported. Not re-exported from public barrels. Not wired into ThemeProvider.

Private runtime telemetry foundation (UX-3.14): `src/ui/theme/runtime/telemetry/` (immutable RuntimeTelemetrySnapshot composing RuntimeSnapshot + RuntimeMetricsSnapshot + RuntimeHealth; instance Collector; frozen Builder/Reporter). Composition snapshot — not a historical log. Not re-exported from public barrels. Not wired into ThemeProvider.

Consumption freeze: no application imports of `@/ui` until an integration microfase authorizes wiring.

## Gate

```text
npm run validate:theme-runtime
npm run validate:ux-3.3
npm run validate:ux-3.4
npm run validate:ux-3.5
npm run validate:ux-3.6
npm run validate:ux-3.7
npm run validate:ux-3.8
npm run validate:ux-3.9
npm run validate:ux-3.10
npm run validate:ux-3.11
npm run validate:ux-3.12
npm run validate:ux-3.13
npm run validate:ux-3.14
```

## Integration Contract (future — not implemented here)

Server-controlled `theme` prop; optional elevation of `data-theme` to `<html>`; persistence; FOUC prevention — belong to a dedicated wiring microfase. Component migration consuming certified hooks / selective Runtime selectors → later microfase after UX-3.6. Theme Runtime Snapshot & DevTools Foundation → UX-3.8 COMPLETE. Theme Runtime Observers Foundation → UX-3.9 COMPLETE. Theme Runtime Metrics Foundation → UX-3.10 COMPLETE. Runtime Diagnostics Foundation → UX-3.11 COMPLETE. Runtime Health Integration Foundation → UX-3.12 COMPLETE. Runtime Health Aggregation Foundation → UX-3.13 COMPLETE. Runtime Telemetry Foundation → UX-3.14 COMPLETE. Next: UX-3.15 (placeholder). Visual / interactive DevTools → UX-3.15+ / UX-4.x.
