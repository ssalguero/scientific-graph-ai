# UX-3.4 — Runtime Optimization

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.4 — Runtime Optimization  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.3 Validation & API Freeze COMPLETE  

**Declaración:**

```text
UX-3.4 = Runtime Optimization (transparent)
SCOPE = ThemeTokenResolver · TokenCache · ThemeProvider · private benchmark infra
API FREEZE = preserved (UX-3.1 → UX-3.3 surfaces unchanged)
NO public API change · NO barrel change · NO snapshot drift · NO Theme ID change
NO contract change · NO CSS value change · NO app/ imports into theme/
Next: future performance measurement phases (helpers ready, hot path unwired)
```

---

## 1. Purpose

Reduce Theme Token Runtime cost (allocations, cache key work, React re-renders) without changing observable behavior. Consumers see identical tokens, identical CSS values, identical public APIs.

---

## 2. Architecture

```text
ThemeTokenResolver.resolve(theme)
  → TokenCache.get (O(1) string Map)
  → miss: ResolverOptimization (shared invariants + themeable trees)
  → TokenValidation
  → TokenCache.set (freeze once)
  → frozen ResolvedDesignTokens (stable reference)

ThemeProvider
  → getStableThemeCssVars(themeId)  // private identity cache
  → memoized context value { theme, setTheme, cssVars }
  → useTokens → useMemo(() => resolve(theme), [theme])
```

Private modules live under `src/ui/theme/tokens/runtime/` (token resolution runtime). They are **not** part of the UX-3.1 `theme/runtime/` registry barrel.

| Private module | Role |
|----------------|------|
| `ResolverOptimization.ts` | Lazy-once frozen invariant domains + themeable tree walk |
| `Benchmark.ts` | `start` / `stop` / `measure` / `reset` (opt-in) |
| `PerformanceCounters.ts` | `inc` / `get` / `reset` (opt-in) |
| `RuntimeMetrics.ts` | `snapshot` / `reset` aggregate |
| `providers/stable-theme-css-vars.ts` | ThemeId → stable cssVars ref |

---

## 3. Resolver optimization (UX-3.4.1)

### Shared invariant domains

Domains that do **not** depend on `ThemeMap`:

- `typography`, `spacing`, `radius`, `motion`, `shadows`, `layout`

**Rule:** Shared invariant domains MUST be initialized lazily exactly once per process and frozen before reuse. Never rebuild on each import, each cache miss, or each theme switch.

Theme-varying domains (`colors`, `elevation`) still deep-clone via `resolveThemeableTree`.

`EMPTY_LAYOUT` is the frozen empty `layout` singleton from the shared set.

### Resolver identity invariant

After first successful resolution for a given `themeId`:

```ts
Object.is(resolve(themeId), resolve(themeId)) // MUST be true
```

Snapshot JSON equality is necessary but not sufficient; reference identity is part of the contract.

Optional private leaf memo: `Map<path, cssString>` for TokenRef leaves (same strings).

---

## 4. Cache optimization (UX-3.4.2)

Public API unchanged: `has` / `get` / `set` / `clear`.

- **Observable store:** `Map<string, ResolvedDesignTokens>` (sole semantics).
- `WeakMap<ThemeMap, string>`: fingerprint memo only.
  - **Restriction:** WeakMap entries MUST NOT participate in observable cache semantics. Miss / unused / GC / object identity change → full fingerprint + same Map lookup. Behavior identical.
- No clone on cache hit; skip redundant deep-freeze when the graph is already fully frozen.
- No public `delete()`.

---

## 5. React runtime (UX-3.4.3)

- Context `value`, `cssVars`, `hostStyle` memoized.
- `setTheme` stabilized via `useRef` for `controlledTheme` (`useCallback` with `[]`).
- Private `getStableThemeCssVars(themeId)` — same values as `getThemeCssVars`, stable references.
- `useTokens` keeps `useMemo(() => resolve(theme), [theme])`.
- Slice helpers (`useColorToken`, …) untouched (UX-3.3 freeze).

---

## 6. Benchmark infrastructure (UX-3.4.4)

Private helpers only. Default **disabled** (`setEnabled(false)`). Not imported on the resolve/cache hot path.

- `Benchmark`: `start`, `stop`, `measure`, `reset`
- `PerformanceCounters`: `inc`, `get`, `reset`
- `RuntimeMetrics`: `snapshot`, `reset`

---

## 7. Decisions

| Decision | Choice |
|----------|--------|
| Placement of private helpers | `tokens/runtime/` (colocated with resolver/cache) |
| Invariant domain lifetime | Lazy once per process, frozen |
| WeakMap role | Non-semantic fingerprint memo only |
| Benchmark wiring | Standalone; hot path unwired by default |
| cssVars stability | Private provider helper (do not change public CSS API semantics) |

---

## 8. Invariants

- Public names / exports / `@/ui` surface unchanged
- Tokens barrel exact freeze (UX-3.2.6 / UX-3.3)
- Theme IDs, contracts, snapshots, CSS values unchanged
- No `app/` imports into `src/ui/theme/`
- Resolver identity after first resolution
- API Freeze from UX-3.1–UX-3.3 preserved

---

## 9. Exclusions

- No new themes / tokens / contracts
- No visual redesign
- No public Benchmark / Metrics exports
- No production timing on hot path
- No changes to `@/ui` curated surface

---

## 10. Validation

```bash
npm run validate:ux-3.4
npm run validate:ux-3.3
```

`validate:ux-3.4` → **10/10 PASS**, including:

```ts
Object.is(
  ThemeTokenResolver.resolve("light"),
  ThemeTokenResolver.resolve("light"),
) // true
```

---

## Related

- [`ux/docs/ThemeRuntime.md`](../../ux/docs/ThemeRuntime.md)
- [`ux/docs/CHANGELOG.md`](../../ux/docs/CHANGELOG.md)
