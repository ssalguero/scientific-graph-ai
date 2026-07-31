# Theme Runtime

> Runtime utilities for the Theme System (package-internal).
> Technical reference: `src/ui/docs/THEME.md`.

## Scope (UX-3.1.4)

Runtime strengthens infrastructure only:

- No visual changes
- No public `@/ui` API changes
- No ThemeProvider / CSS generator changes

## ThemeErrors

Throwable classes used by Assertions:

- `ThemeNotFoundError`
- `ThemeContractError`
- `ThemeVariableError`
- `InvalidThemeDefinitionError`
- `UnknownThemeError`

## ThemeWarnings

Serializable warnings (never thrown):

```ts
interface ThemeWarning {
  code: string;
  message: string;
}
```

Factories cover duplicate registration, deprecated token, missing optional token, legacy theme, unused semantic group.

## ThemeRegistry

Instantiable class — **not** the application SSOT.

```ts
class ThemeRegistry {
  private readonly maps: Map<ThemeId, ThemeMap>;
  // register / unregister / has / get / list / clear / size
}
```

SSOT remains `maps/themes`. Duplicate `register` returns a `ThemeWarning` with code `duplicate-registration`.

## ThemeInspector

Read-only. Must receive an **explicit** source:

- a `ThemeRegistry` instance, **or**
- the static catalog (`themes`)

Never both implicitly. Does not touch ThemeProvider or mutate registry state.

APIs: `listThemes`, `getTheme`, `themeExists`, `getContractVersion`, `getThemeNames`, `countThemes`.

## ThemeUtils

Pure and immutable:

- `cloneTheme`
- `freezeTheme`
- `deepMergeTheme` — **themeable domains only** (`color`, `focus`, `elevation`); never Foundation invariants
- `normalizeTheme`
- `compareThemes`

## Adapters folder

`runtime/adapters/` is the documented extension point for UX-3.2. See `ThemeValidation.md`.

## UX-3.4 — Runtime Optimization

Token-resolution hot path (`tokens/runtime/`) gained private, non-exported optimizations (shared invariant domains, cache fingerprint memo, React reference stability, benchmark helpers). See [`docs/UX/UX-3.4.md`](../../docs/UX/UX-3.4.md). Public barrels and Theme Registry APIs in this folder are unchanged.

## Related docs

- `ThemeArchitecture.md`
- `ThemeValidation.md`
- `docs/UX/UX-3.4.md`
