# Foundation Tokens — Technical Contract

> Package docs for `src/ui/foundation/tokens`. Functional SSOT remains in `ux/docs/*`.

**Contract version:** `TOKEN_CONTRACT_VERSION = "3.1.2"`

Theme System is versioned separately: `THEME_CONTRACT_VERSION = "3.1.3"` (see `THEME.md`). These contracts are **decoupled**.

## Layers

```text
Primitive Tokens  →  Semantic Tokens  →  (Component Tokens)  →  UI
                         ↓
                   Theme Maps / CSS vars (src/ui/theme — not under foundation/)
```

- **Primitive** — raw scales (`color`, `spacing`, `radius`, …). Hex only here.
- **Semantic** — meaning via `TokenRef` paths into primitive. No hex/rgb. Includes `focus`.
- **Theme / CSS** — see `THEME.md` (UX-3.1.3).
- **Component Tokens** — deferred to UX-3.2.

## Types vs data

| Path | Role |
|------|------|
| `tokens/types/` | Type contracts (`ColorScale`, `TokenRef`, …) |
| `tokens/primitive/` | Primitive data (`as const`) |
| `tokens/semantic/` | Semantic data (refs only; + `focus.ts`) |
| `tokens/validators/` | Pure contract validators (not app runtime) |

## Domains (IN)

color, spacing, radius, typography, shadow, elevation, motion, opacity, zIndex, **focus**

## Naming

- Docs / CSS: `color.surface.default`, `--color-surface-default`
- TypeScript: `primitive.color.slate[50]`, `semantic.color.surface.default`
- Spacing doc `space-4` ↔ TS `space4`
- CSS prefixes (`--color-*`, `--spacing-*`, `--focus-*`) are **distinct** from UX-2 `--app-*`

## Dependency rules

```text
semantic  →  primitive     ✓
primitive →  semantic      ✗
tokens    →  theme         ✗
tokens    →  @/lib/ui      ✗
@/lib/ui  →  @/ui          ✗ (until migration)
```

UI Dependency Layers (frozen since UX-3.1.1):

```text
Application → Patterns → Components → Primitives → Foundation
```

## Public API

`@/ui` exports: `primitive`, `semantic`, `TOKEN_CONTRACT_VERSION`, theme surface, `ThemeProvider` — see `src/ui/index.ts`.

Validators (tokens and theme) are available for package tests — **not** reexported from `@/ui`.

## Validators

- `isPrimitiveToken(path)`
- `isSemanticToken(path)`
- `isTokenReference(value)`
- `validateSemanticReferences()`

## Layer evolution

| Layer | UX-3.1.2 | UX-3.1.3 | UX-3.2 |
| ----- | -------- | -------- | ----- |
| Primitive | yes | yes | yes |
| Semantic | yes | yes | yes |
| Theme Maps | no | yes | yes |
| CSS Variables | no | yes | yes |
| Component Tokens | no | no | yes |
| Focus semantic (`focus.ts`) | no | yes | yes |

## Coexistence with UX-2

| | UX-2 `src/lib/ui` | UX-3 `foundation/tokens` |
|--|-------------------|---------------------------|
| Form | Tailwind strings + `--app-*` | TS primitive/semantic objects |
| Runtime | Active app SSOT | Contract + theme infra (not mounted) |

Do not reexport or bridge `UI_TOKENS` from `@/ui`.

## Conceptual map (documentation only)

| UX-2 (approx.) | UX-3 semantic |
|----------------|---------------|
| `--app-surface` | `color.surface.default` |
| `--app-text` | `color.text.primary` |
| `--app-border` | `color.border.default` |
| `--app-accent` | `color.brand.primary` |
