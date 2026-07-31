# Theme System — Technical Contract

> Package docs for `src/ui/theme` and `src/ui/providers` ThemeProvider.
> Functional SSOT remains in `ux/docs/*` (esp. DESIGN_SYSTEM §5 Temas).

**Theme contract version:** `THEME_CONTRACT_VERSION = "3.1.3"`

**Foundation token contract:** `TOKEN_CONTRACT_VERSION = "3.1.2"` (unchanged; contracts are decoupled).

## Scope (UX-3.1.3)

| In | Out |
|----|-----|
| Theme Maps (4 variants) | App wiring / `app/layout` |
| Pure CSS variable generation | `globals.css` / Tailwind |
| Package-local ThemeProvider | `documentElement` / global side effects |
| `semantic/focus.ts` | UI Primitives / Component Tokens |
| | Persistence / system preference / UX-2 bridge |

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
```

Themes only remap tokens. They never change layout, sizes, spacing keys, or structure.

### Themeable domains

`color`, `focus`, `elevation`

### Invariant domains

`spacing`, `radius`, `typography`, `motion`, `opacity`, `zIndex`

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

Not mounted in the application in UX-3.1.3.

## Versioning (decoupled)

| Contract | Constant | Bumps when |
|----------|----------|------------|
| Foundation Tokens | `TOKEN_CONTRACT_VERSION` | Foundation contract changes |
| Theme System | `THEME_CONTRACT_VERSION` | Theme ids, maps shape, CSS names, provider host contract |

## Folder structure

```text
src/ui/theme/
  version.ts, ids.ts, types.ts, index.ts
  maps/          # light, dark, highContrastLight, highContrastDark
  css/           # pure generators
  validators/    # package tests — not reexported from @/ui
src/ui/providers/
  theme-provider.tsx, theme-context.ts
```

Do **not** create `foundation/theme/`.

## Public API (`@/ui`)

Exports theme data + generators + `ThemeProvider` / `useTheme`.
Does **not** export theme validators.

Consumption freeze: no application imports of `@/ui` until an integration microfase authorizes wiring.

## Integration Contract (future — not implemented here)

Server-controlled `theme` prop; optional elevation of `data-theme` to `<html>`; persistence; FOUC prevention — belong to a dedicated wiring microfase.
