# Theme Architecture

> Functional architecture for the Design System Theme System.
> Technical package details: `src/ui/docs/THEME.md`.

**Contract version:** `THEME_CONTRACT_VERSION = "3.1.3"` (UX-3.1.4 does not bump the contract).

## Purpose

Themes remap **themeable** semantic tokens. They never change layout, sizes, spacing keys, or structure.

## Themeable vs invariant

| Themeable (ThemeMap) | Foundation invariants (not on ThemeMap) |
|----------------------|-----------------------------------------|
| `color` | `spacing` |
| `focus` | `radius` |
| `elevation` | `typography` |
| | `motion` |
| | `opacity` |
| | `zIndex` |

## Catalog SSOT

The application theme catalog SSOT is:

```text
src/ui/theme/maps/themes
```

Four variants: `light`, `dark`, `highContrastLight`, `highContrastDark`.

## Package layout (conceptual)

```text
src/ui/theme/
  contracts/     # contract surface (re-exports)
  maps/          # SSOT definitions
  css/           # pure CSS variable generation
  validators/    # validation rules
  runtime/       # orchestration, registry utility, inspector, utils
    adapters/    # extension seam for UX-3.2+
```

## Registry is not SSOT

`ThemeRegistry` is an instantiable runtime utility (`Map<ThemeId, ThemeMap>`). It does **not** replace `maps/themes`. Multiple registries may exist for future catalogs; the product SSOT remains the static maps module.

## Extension seam — `runtime/adapters/`

Prepared in UX-3.1.4 for UX-3.2 (Design Tokens Integration / additional consumers or theme sources):

```text
ThemeValidator
      ↓
runtime/adapters/
      ↓
existing validators (rules stay where they are)
```

Adapters today only delegate to existing validators. New sources/consumers must extend adapters — not fork validation rules into the orchestrator.

## Related docs

- `ThemeRuntime.md` — Registry, Inspector, Utils, Errors
- `ThemeValidation.md` — Validator orchestration vs `validators/`
- `DESIGN_SYSTEM.md` §5 Temas
