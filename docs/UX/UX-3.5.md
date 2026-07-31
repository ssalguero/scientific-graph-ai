# UX-3.5 — Theme Hooks & Consumption API

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.5 — Theme Hooks & Consumption API (Freeze-safe)  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.4 Runtime Optimization COMPLETE  

**Declaración:**

```text
UX-3.5 = Theme Consumption Façade (freeze-safe)
SCOPE = useElevation · useMotion · private selectors · private helpers · validate:ux-3.5
API FREEZE = preserved (UX-3.1 → UX-3.4 surfaces unchanged)
NO Runtime change · NO Provider change · NO contract change · NO Theme ID change
NO CSS change · NO adapters · NO aliases · NO Jest
Next: UX-3.6 component migration consuming certified hooks
```

---

## 1. Purpose

Complete the Theme consumption layer so Design System components can read tokens through a single, identity-preserving façade — without altering Runtime, Provider, or visual output.

---

## 2. Architecture

```text
ThemeProvider (frozen)
        │
        ▼
useTheme() → { theme, setTheme, cssVars }   // providers — unchanged
        │
        ▼
useTokens() → ResolvedDesignTokens          // theme/tokens only — unchanged
        │
        ▼
theme/hooks/
  useColorToken | useSpacingToken | useTypographyToken
  useRadiusToken | useShadowToken
  useElevation | useMotion
        │  (identity: return useTokens().<slice>)
        ▼
UI components (migration starts UX-3.6)
```

Private (not barreled):

| Module | Role |
|--------|------|
| `selectors.ts` | Pure `selectX(tokens) → tokens.x` identity accessors |
| `helpers.ts` | `assertTheme`, `assertTokens`, `freezeDev`, reserved `memoSelector` |

---

## 3. New hooks (UX-3.5)

```ts
export function useElevation() {
  return useTokens().elevation;
}

export function useMotion() {
  return useTokens().motion;
}
```

Same purity rules as UX-3.3: sole import of Runtime `useTokens`, no `useMemo` / `useCallback` / `useRef`, no Runtime/Cache imports, no object construction.

---

## 4. Certified UX-3.3 hooks (unchanged)

`useColorToken`, `useSpacingToken`, `useTypographyToken`, `useRadiusToken`, `useShadowToken` remain exactly as certified. They are **not** routed through selectors.

---

## 5. Barrel

[`src/ui/theme/hooks/index.ts`](../../src/ui/theme/hooks/index.ts) exports exactly:

- `useColorToken`
- `useSpacingToken`
- `useTypographyToken`
- `useRadiusToken`
- `useShadowToken`
- `useElevation`
- `useMotion`

`useTokens` is **not** re-exported (canonical location: `theme/tokens/hooks`). Selectors and helpers stay private.

---

## 6. Decisions

| Decision | Choice |
|----------|--------|
| Provider `useTheme` shape | Unchanged `{ theme, setTheme, cssVars }` |
| Hook renames (`useColor`, …) | Forbidden — keep UX-3.3 names |
| Selectors | Identity only; no memo this phase |
| `memoSelector` | Present, unused by selectors |
| `@/ui` exports | Consumption hooks remain package-local |
| Tests | `validate:ux-3.5` only (no Jest) |

---

## 7. Invariants

- Runtime / Provider / contracts / Theme IDs / CSS vars unchanged
- Specialized hooks are identity-only Runtime views
- Zero allocations inside hook bodies
- Public API delta: `+useElevation`, `+useMotion`, `+validate:ux-3.5`, plus drop of `useTokens` re-export from `theme/hooks`
- API Freeze from UX-3.1–UX-3.4 preserved

---

## 8. Exclusions

- No `useThemeState` / enriched theme context
- No new themes, tokens, CSS, or visual changes
- No adapters, aliases, or flattened token views
- No component migration (UX-3.6)
- No Jest suite

---

## 9. Validation

```bash
npm run validate:ux-3.3
npm run validate:ux-3.4
npm run validate:ux-3.5
```

---

## Related

- [`ux/docs/ThemeRuntime.md`](../../ux/docs/ThemeRuntime.md)
- [`ux/docs/CHANGELOG.md`](../../ux/docs/CHANGELOG.md)
- [`docs/UX/UX-3.4.md`](./UX-3.4.md)
