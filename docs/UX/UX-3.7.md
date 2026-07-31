# UX-3.7 — Runtime Context Optimization

**Épica:** UX-3 — Design System Theme System  
**Microfase:** UX-3.7 — Runtime Context Optimization  
**Fecha:** 2026-07-31  
**Prerrequisitos:** UX-3.6 Theme Runtime Selectors & Memoization Foundation COMPLETE  

**Declaración:**

```text
UX-3.7 = Runtime Context Optimization (private infra)
SCOPE = semantic fingerprint · identity cache · stableRuntime
         · InternalRuntimeProvider · validate:ux-3.7
SOT = TokenCache (único constructor de ThemeRuntime)
UX-3.7 = stabilize + reuse only · NEVER create runtimes · NEVER replace TokenCache
API FREEZE = absolute (ThemeContext · ThemeRuntime alias · hooks · selectors)
NO public hooks · NO public exports · NO second semantic cache · NO Jest
Next: UX-3.8 Runtime instrumentation / perf measurement
```

---

## 1. Purpose

Optimizar la estabilidad referencial del `ThemeRuntime` en la infraestructura privada del Theme System para minimizar propagaciones innecesarias de Context, sin cambiar comportamiento observable ni API pública.

---

## 2. Contract Invariants (Freeze)

### 2.1 Semantic Fingerprint

El fingerprint representa **únicamente el contenido lógico** del `ThemeRuntime`.

Nunca depende de:

- identidad del objeto
- WeakMap ids
- referencias
- timestamps
- caches
- valores efímeros

Responde únicamente: ¿este `ThemeRuntime` representa exactamente los mismos Design Tokens?

### 2.2 Identity Cache

Infraestructura privada equivalente a `WeakMap<ThemeRuntime, Fingerprint>` (más registro fingerprint→referencia para reuse).

La cache:

- solo reutiliza referencias
- nunca construye Runtime
- nunca modifica Runtime
- nunca forma parte del API público

### 2.3 Stability Rule

```text
same fingerprint      ⇒ same runtime reference
different fingerprint ⇒ different resolved runtime
```

UX-3.7 nunca crea un Runtime artificial.

### 2.4 Source of Truth

El único constructor autorizado de `ThemeRuntime` continúa siendo **TokenCache**.

UX-3.7:

- no resuelve tokens (la capa `context/` no llama al Resolver)
- no recalcula tokens
- no reemplaza TokenCache
- únicamente estabiliza referencias ya resueltas

### 2.5 No Cache Duplication

No aparece una segunda cache semántica. La infraestructura nueva funciona **por encima** de TokenCache y nunca lo reemplaza.

### 2.6 API Freeze

Permanece idéntico:

- `ThemeContext` / `ThemeProvider` / `ThemeContextValue = { theme, setTheme, cssVars }`
- `ThemeRuntime` (= alias de `ResolvedDesignTokens`)
- `useTheme` / `useTokens` / `useElevation` / `useMotion`
- selectors UX-3.6 / `createSelector` / `memoSelector`

---

## 3. Architecture

```text
src/ui/theme/runtime/context/          (PRIVATE)
  runtimeFingerprint.ts   semantic fingerprint
  runtimeIdentity.ts      WeakMap memo ThemeRuntime → Fingerprint
  providerCache.ts        fingerprint → runtime reference (reuse only)
  stableRuntime.ts        stability rule
  runtimeContext.tsx      InternalRuntimeProvider
  index.ts                private barrel

ThemeProvider
├── ThemeContext.Provider
│     value = { theme, setTheme, cssVars }   // unchanged
└── InternalRuntimeProvider                  // private
      value = stableRuntime(resolve(theme))
```

`ThemeProvider` obtiene el runtime vía `resolve(theme)` → TokenCache (SoT), luego aplica `stableRuntime`. Los hooks públicos **no** consumen el context privado.

---

## 4. Decisions

| Decision | Choice |
|----------|--------|
| Fingerprint | Content walk of Design Token domains (sorted keys / primitives) |
| Identity memo | `WeakMap<object, Fingerprint>` |
| Reference reuse | `Map<Fingerprint, ThemeRuntime>` above TokenCache |
| Public ThemeContext | Unchanged `{ theme, setTheme, cssVars }` |
| Hooks | Unchanged; no `useRuntime*` |
| Tests | `validate:ux-3.7` only (no Jest) |

---

## 5. Invariants

- TokenCache remains the only ThemeRuntime constructor
- UX-3.7 context layer never builds / mutates runtimes
- Same semantic fingerprint ⇒ same stabilized reference
- No new `@/ui` / `theme/index` / `runtime/index` / `hooks/index` / `providers/index` exports
- API Freeze UX-3.1–UX-3.6 preserved

---

## 6. Exclusions

- No public hooks (`useRuntime`, `useThemeRuntime`, `useRuntimeContext`)
- No stores / signals / EventEmitter / zustand / redux / mobx
- No hook migration onto InternalRuntimeContext
- No visual / token / Theme ID / CSS changes
- No Jest suite

---

## 7. Validation

```bash
npm run validate:ux-3.5
npm run validate:ux-3.6
npm run validate:ux-3.7
```

Expected:

```text
validate:ux-3.7
PASS
10/10
```

---

## Related

- [`ux/docs/ThemeRuntime.md`](../../ux/docs/ThemeRuntime.md)
- [`ux/docs/CHANGELOG.md`](../../ux/docs/CHANGELOG.md)
- [`docs/UX/UX-3.6.md`](./UX-3.6.md)
