# UX-3.6 — Theme Runtime Selectors & Memoization Foundation

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.6 — Theme Runtime Selectors & Memoization Foundation  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.5 Theme Hooks & Consumption API COMPLETE  

**Declaración:**

```text
UX-3.6 = Theme Runtime Selectors & Memoization Foundation (private infra)
SCOPE = ThemeSelector · ThemeRuntime alias · createSelector · memoSelector SSOT
         · equality · WeakMap cache · validate:ux-3.6
API FREEZE = preserved (UX-3.1 → UX-3.5 surfaces unchanged)
NO Runtime change · NO Resolver change · NO Provider change · NO contract change
NO Theme ID change · NO CSS change · NO hooks consumption change · NO Jest
NO public exports · helpers.ts keeps UX-3.5 adapter only
Next: component migration / selective Runtime consumption via selectors
```

---

## 1. Purpose

Incorporate the first official private layer of memoized Theme Runtime selectors so future consumers can request only the Runtime subset they need — without changing public APIs, hooks, Resolver, or visual output.

---

## 2. Architecture

```text
ThemeRuntime = ResolvedDesignTokens   (type alias only)

src/ui/theme/runtime/selectors/       (PRIVATE)
  ThemeSelector.ts    ThemeRuntime + ThemeSelector<T>
  equality.ts         referenceEqual · strictEqual · shallowEqual
  cache.ts            WeakMap<Runtime, WeakMap<Function, Result>>
  createSelector.ts   passthrough (prepared; no memo)
  memoSelector.ts     SSOT (UX-3.5 signature + WeakMap for objects)
  index.ts            private barrel

hooks/helpers.ts
  memoSelector → thin adapter → runtime/selectors SSOT
```

Consumption hooks (`useTokens`, `useElevation`, `useMotion`, `*Token`, `hooks/selectors.ts`) remain identity views and do **not** call this layer yet.

---

## 3. ThemeRuntime & ThemeSelector

```ts
export type ThemeRuntime = ResolvedDesignTokens;
export type ThemeSelector<T> = (runtime: ThemeRuntime) => T;
```

Architectural naming only — no new Runtime object, no Resolver change.

---

## 4. memoSelector (SSOT)

Signature frozen (UX-3.5 compatible):

```ts
memoSelector(tokens, previousTokens, previousResult, select)
```

Behavior:

1. Identity fast-path when `Object.is(tokens, previousTokens)`
2. WeakMap only if `typeof tokens === "object" && tokens !== null`
3. Primitives → `select(tokens)` with no cache

Cache invariants: selector = function identity; never serialized; never exposed; ephemeral (WeakMap / GC).

---

## 5. createSelector

Passthrough factory — returns exactly the selector received. No memoization in this phase.

---

## 6. Decisions

| Decision | Choice |
|----------|--------|
| `ThemeRuntime` | Alias of `ResolvedDesignTokens` |
| `memoSelector` SSOT | `theme/runtime/selectors/memoSelector.ts` |
| UX-3.5 helpers | Thin `export function` adapter (keeps validate:ux-3.5) |
| Public barrels | Unchanged — selectors private |
| Equality | `referenceEqual`=`Object.is`; `strictEqual`=`===`; `shallowEqual` shallow+`Object.is` |
| Tests | `validate:ux-3.6` only (no Jest) |

---

## 7. Invariants

- Runtime / Resolver / TokenCache / contracts / Theme IDs / CSS unchanged
- Hooks consumption layer unchanged
- No new `@/ui` / `theme/index` / `runtime/index` / `hooks/index` exports
- Single `memoSelector` implementation (SSOT); helpers only adapt
- API Freeze from UX-3.1–UX-3.5 preserved

---

## 8. Exclusions

- No providers, contexts, listeners, observers, subscriptions, React effects
- No component migration
- No wiring of selectors into consumption hooks
- No visual / token / Theme ID changes
- No Jest suite

---

## 9. Validation

```bash
npm run validate:ux-3.5
npm run validate:ux-3.6
```

Expected: `UX-3.5 Validation: 6/6 PASS` · `UX-3.6 Validation: 8/8 PASS`

---

## Related

- [`ux/docs/ThemeRuntime.md`](../../ux/docs/ThemeRuntime.md)
- [`ux/docs/CHANGELOG.md`](../../ux/docs/CHANGELOG.md)
- [`docs/UX/UX-3.5.md`](./UX-3.5.md)
