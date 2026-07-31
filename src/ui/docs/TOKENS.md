# Foundation Tokens — Technical Contract

> Package docs for `src/ui/foundation/tokens`. Functional SSOT remains in `ux/docs/*`.

**Contract version:** `TOKEN_CONTRACT_VERSION = "3.1.2"`

## Layers

```text
Primitive Tokens  →  Semantic Tokens  →  (Component Tokens)  →  UI
```

- **Primitive** — raw scales (`color`, `spacing`, `radius`, …). Hex only here.
- **Semantic** — meaning via `TokenRef` paths into primitive. No hex/rgb.
- **Component / Theme / CSS** — deferred (see evolution table).

## Types vs data

| Path | Role |
|------|------|
| `tokens/types/` | Type contracts (`ColorScale`, `TokenRef`, …) |
| `tokens/primitive/` | Primitive data (`as const`) |
| `tokens/semantic/` | Semantic data (refs only) |
| `tokens/validators/` | Pure contract validators (not app runtime) |

## Domains (IN)

color, spacing, radius, typography, shadow, elevation, motion, opacity, zIndex

## Naming

- Docs / CSS (future): `color.surface.default`, `--color-surface-default`
- TypeScript: `primitive.color.slate[50]`, `semantic.color.surface.default`
- Spacing doc `space-4` ↔ TS `space4`
- Future CSS prefixes (`--color-*`, `--spacing-*`) are **distinct** from UX-2 `--app-*`

## Dependency rules

```text
semantic  →  primitive     ✓
primitive →  semantic      ✗
tokens    →  @/lib/ui      ✗
@/lib/ui  →  @/ui          ✗ (until migration)
```

UI Dependency Layers (frozen since UX-3.1.1):

```text
Application → Patterns → Components → Primitives → Foundation
```

## Public API

`@/ui` exports: `primitive`, `semantic`, `TOKEN_CONTRACT_VERSION`, and types `PrimitiveTokens`, `SemanticTokens`, `TokenRef`.

Validators are available from `foundation/tokens` for package tests — **not** reexported from `@/ui`.

## Validators

- `isPrimitiveToken(path)`
- `isSemanticToken(path)`
- `isTokenReference(value)`
- `validateSemanticReferences()`

No ThemeProvider / CSS / app wiring in 3.1.2.

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
| Runtime | Active app SSOT | Contract only (no consumers yet) |

Do not reexport or bridge `UI_TOKENS` from `@/ui` in this microfase.

## Conceptual map (documentation only)

| UX-2 (approx.) | UX-3 semantic |
|----------------|---------------|
| `--app-surface` | `color.surface.default` |
| `--app-text` | `color.text.primary` |
| `--app-border` | `color.border.default` |
| `--app-accent` | `color.brand.primary` |
