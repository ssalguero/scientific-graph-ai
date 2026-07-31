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

## UX-3.5 — Theme Hooks & Consumption API

Consumption façade under `theme/hooks/` (freeze-safe):

- Certified UX-3.3 `*Token` helpers unchanged
- New identity hooks: `useElevation`, `useMotion`
- Private `selectors.ts` / `helpers.ts` (not exported)
- `useTokens` remains under `theme/tokens/hooks` only
- Provider `useTheme` and Runtime unchanged

See [`docs/UX/UX-3.5.md`](../../docs/UX/UX-3.5.md).

## UX-3.6 — Theme Runtime Selectors & Memoization Foundation

Private selector infrastructure under `theme/runtime/selectors/` (not barreled publicly):

- `ThemeRuntime` alias of `ResolvedDesignTokens`
- `ThemeSelector<T>`, `createSelector` (passthrough), `memoSelector` SSOT
- Equality helpers + ephemeral WeakMap cache (object keys only)
- `hooks/helpers.memoSelector` is a thin UX-3.5-compatible adapter
- Runtime / Resolver / consumption hooks unchanged

See [`docs/UX/UX-3.6.md`](../../docs/UX/UX-3.6.md).

## UX-3.7 — Runtime Context Optimization

Private referential-stability layer under `theme/runtime/context/` (not barreled publicly):

- Semantic `runtimeFingerprint` (logical Design Token content only)
- Identity cache (`WeakMap` memo + fingerprint→reference reuse)
- `stableRuntime` rule: same fingerprint ⇒ same reference; never creates runtimes
- `InternalRuntimeProvider` behind `ThemeProvider`; public `ThemeContext` unchanged
- TokenCache remains the sole ThemeRuntime constructor; context layer sits above it

See [`docs/UX/UX-3.7.md`](../../docs/UX/UX-3.7.md).

## Related docs

- `ThemeArchitecture.md`
- `ThemeValidation.md`
- `docs/UX/UX-3.4.md`
- `docs/UX/UX-3.5.md`
- `docs/UX/UX-3.6.md`
- `docs/UX/UX-3.7.md`
