# UX-8.5 — Keyboard Navigation Foundation

> **Architectural principles:**
> - Registry = único SSOT de keyboard navigation (`KeyboardNavigationRegistryApi` +
>   `keyboardNavigationRegistry`).
> - KeyboardNavigationState = `{ lastDirection }` only.
> - **Navigation Semantics Freeze:** intent only — NEXT ≠ Tab · UP ≠ ArrowUp ·
>   ESCAPE ≠ KeyboardEvent Escape.
> - **Direction Normalization Freeze:** `move()` is the ONLY canonical operation;
>   `next` / `previous` / `escape` delegate to `move(NEXT|PREVIOUS|ESCAPE)`.
> - **Stateless Navigation Freeze:** ONLY `lastDirection` — no index / target /
>   cursor / stack / history.
> - **DOM Freeze:** no KeyboardEvent · no window · no document · no listeners.
> - factory → private state → API Freeze → clone-on-read.
> - KeyboardNavigationRegistry = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos.
> - Sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.5 — Keyboard Navigation Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.4 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.5 = Keyboard Navigation Foundation
SCOPE = KeyboardNavigationTypes → KeyboardNavigationState → KeyboardNavigationRegistry
        → KeyboardNavigationContext → KeyboardNavigationProvider → useKeyboardNavigation
        → local barrel
KeyboardNavigationState = { lastDirection } ONLY
Navigation Semantics Freeze = intent only · NEXT ≠ Tab · no physical key mapping
Direction Normalization Freeze = move() canonical · next ≡ move(NEXT) ·
  previous ≡ move(PREVIOUS) · escape ≡ move(ESCAPE)
Stateless Navigation Freeze = lastDirection ONLY · no index/target/cursor/stack/history
DOM Freeze = no KeyboardEvent · no window · no document · no listeners
Registry Freeze = next / previous / move / escape / clear / get / getState ONLY
API Stability Freeze = get() ≡ getState() · no behavioral differences
Singleton Freeze = keyboardNavigationRegistry for infrastructure/testing ONLY ·
  React via Provider + useKeyboardNavigation
KeyboardNavigationRegistry = sole keyboard-nav authority
NO Focus · NO Selection · NO Hover · NO Clipboard · NO Commands · NO DOM events
NO production mount · NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1–UX-8.4 = VIGENTE
Next: UX-8.6 Clipboard Foundation
```

---

## 1. Objective / Objetivo

Crear la infraestructura oficial de Keyboard Navigation bajo
`src/ui/keyboard-nav/`, **sin montar Provider en la app**, **sin listeners DOM**,
**sin KeyboardEvent**, **sin integración con Focus / Selection / Hover**,
**sin impacto funcional visible**.

```text
UX-8.5 establishes the Keyboard Navigation Foundation only.
It models navigation intent via a pure API.
It does not wire physical keyboard events, Focus, Selection, Hover,
Clipboard, Commands, or product chrome.
```

---

## 2. Architecture

```text
KeyboardNavigationProvider
        │
        ▼
KeyboardNavigationRegistry
        │
        ▼
KeyboardNavigationState { lastDirection }

KeyboardNavigationDirection
  NEXT | PREVIOUS | UP | DOWN | LEFT | RIGHT | ESCAPE
        │
        ▼
KeyboardNavigationRegistryApi + keyboardNavigationRegistry
  next / previous / move / escape / clear / get / getState
        │
        ▼
KeyboardNavigationProvider + KeyboardNavigationContext
        │
        ▼
useKeyboardNavigation() (read-only Context access)
```

Registry = única autoridad.

| Componente | Responsabilidad |
|------------|-----------------|
| `KeyboardNavigationTypes` | `KeyboardNavigationDirection` enum |
| `KeyboardNavigationState` | Snapshot `{ lastDirection }` + factory |
| `KeyboardNavigationRegistryApi` | SSOT mutable: next / previous / move / escape / clear / get / getState |
| `keyboardNavigationRegistry` | Empty singleton (infra/testing only) |
| `KeyboardNavigationContext` | Declara `KeyboardNavigationContextValue` |
| `KeyboardNavigationProvider` | Posee registry vía `useRef` |
| `useKeyboardNavigation()` | Acceso read-only al Context |
| `index.ts` | Único export oficial del módulo (local barrel) |

Future integration path (UX-9, out of scope here):

```text
KeyboardEvent → Adapter → KeyboardNavigationRegistry → Focus / Selection
```

---

## 3. Navigation Semantics Freeze

The registry models **navigation intent only**. It does **not** represent
physical keys.

| Intent | Does NOT mean |
|--------|----------------|
| `NEXT` | Tab |
| `PREVIOUS` | Shift+Tab |
| `UP` | ArrowUp |
| `DOWN` | ArrowDown |
| `LEFT` | ArrowLeft |
| `RIGHT` | ArrowRight |
| `ESCAPE` | KeyboardEvent Escape |

Physical key mapping belongs to UX-9.

---

## 4. Direction Normalization Freeze

`move()` is the **ONLY** canonical mutation operation.

Shortcuts are semantic aliases that **must delegate** to `move()` — they MUST
NOT duplicate logic:

```text
next()     ≡ move(NEXT)
previous() ≡ move(PREVIOUS)
escape()   ≡ move(ESCAPE)
```

This prevents UX-9 from implementing divergent behavior in `next()` vs
`move(NEXT)`.

---

## 5. Stateless Navigation Freeze

The registry stores **ONLY**:

```text
lastDirection: KeyboardNavigationDirection | null
```

There is **NO**:

- `currentIndex`
- `currentTarget`
- `currentFocus`
- `currentSelection`
- `navigationStack`
- `history`
- timestamps · metadata · counters · keycodes · modifiers

The module models navigation **intent**, not its **execution**.
Execution (focus moves, selection changes, DOM traversal) belongs to future
integrations.

---

## 6. DOM Freeze

The module does **not** know:

```text
KeyboardEvent · window · document · DOM
addEventListener · removeEventListener · EventTarget · HTMLElement
```

No DOM imports. No listeners. Real keyboard event integration → UX-9.

---

## 7. API Freeze

### Types

```ts
enum KeyboardNavigationDirection {
  NEXT = "NEXT",
  PREVIOUS = "PREVIOUS",
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  ESCAPE = "ESCAPE",
}
```

Never import KeyboardEvent, DOM, Focus, Selection, or Hover.

### State

```ts
type KeyboardNavigationState = Readonly<{
  readonly lastDirection: KeyboardNavigationDirection | null;
}>;
```

### Registry Freeze

`KeyboardNavigationRegistryApi` queda **congelado** en UX-8.5.

Métodos oficiales (exactamente siete):

```text
next() · previous() · move() · escape() · clear() · get() · getState()
```

```ts
interface KeyboardNavigationRegistryApi {
  next(): void;
  previous(): void;
  move(direction: KeyboardNavigationDirection): void;
  escape(): void;
  clear(): void;
  get(): KeyboardNavigationState;
  getState(): KeyboardNavigationState;
}

function createKeyboardNavigationRegistry(): KeyboardNavigationRegistryApi;
const keyboardNavigationRegistry: KeyboardNavigationRegistryApi;
```

Historical Semantics:

- `move(d)`: set `lastDirection = d` (canonical).
- `next()`: delegates to `move(NEXT)`.
- `previous()`: delegates to `move(PREVIOUS)`.
- `escape()`: delegates to `move(ESCAPE)` — records intent only; executes nothing.
- `clear()`: `lastDirection → null`.
- `get()` / `getState()`: clone-on-read vía `createKeyboardNavigationState` (Object.freeze).

**Forbidden:** `handleKey` · `onKeyDown` · `onKeyUp` · `registerShortcut` ·
`bind` · `execute` · `focus` · `select`.

Naming: `KeyboardNavigationRegistryApi` + `keyboardNavigationRegistry`
(en diagramas: **KeyboardNavigationRegistry**).

---

## 8. API Stability Freeze

`get()` y `getState()` son **intencionalmente equivalentes** en UX-8.x.
Ambos permanecen congelados por estabilidad de API; ningún consumidor debe
asumir diferencias de comportamiento.

---

## 9. Singleton Freeze

El singleton `keyboardNavigationRegistry` existe únicamente para escenarios de
infraestructura y testing. Los consumidores React deben acceder al registry
exclusivamente mediante `KeyboardNavigationProvider` y `useKeyboardNavigation()`.

---

## 10. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Keyboard navigation | `KeyboardNavigationRegistry` |

Ningún otro registry puede modificar KeyboardNavigationRegistry.
FocusRegistry, SelectionRegistry, HoverRegistry, WindowRegistry — prohibido
mutar keyboard-nav. Coordinación entre módulos → UX-9+ únicamente.

---

## 11. Dependency Rule

Files under `src/ui/keyboard-nav/` may depend only on:

- Local keyboard-nav module files
- `react` (Context / Provider / hook only)

Must **not** import:

- Other UX module Registry / Provider / Context implementations
- Focus / Selection / Hover / Clipboard / Interaction Commands
- `src/components/windows/**` · WindowRegistry
- Runtime / scientific / graph math
- KeyboardEvent / DOM APIs
- Commands / Visibility / Features / Tabs internals for wiring

---

## 12. Out of Scope

```text
No KeyboardEvent · no DOM listeners
No Tab / Shift+Tab / Arrow keys / Escape key handling
No Focus / Selection / Hover / Clipboard / Commands integration
No shortcuts · no Command Palette
No production App wiring · no page.tsx · no AppShell
No @/ui public barrel expansion
No WindowRegistry / WindowManager / WindowAPI mutations
No cross-registry mutation
No visual navigation · no navigation execution
```

---

## 13. Integration Fence

Protected prior surfaces (must not change):

- WindowRegistry · WindowTypes · WindowManager · WindowAPI
- Floating / Drag / Resize / Snap
- Tabs / Series / Content
- Focus module (`src/ui/focus/`)
- Selection module (`src/ui/selection/`)
- Hover module (`src/ui/hover/`)
- UX-5 Features · UX-6 Commands · UX-7 Visibility
- Runtime · `src/lib/scientific/**`
- `src/ui/index.ts` · `page.tsx` · AppShell
- `docs/UX/UX-8-architecture.md` · historical validators

No conectar Keyboard Navigation con:

```text
WindowRegistry · WindowManager · FloatingWindow
Tabs · Content · Series · Visibility
Commands · Selection · Focus · Hover · Clipboard
DOM keyboard listeners · physical key maps
```

---

## 14. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.5.1 | Docs con Navigation Semantics · Direction Normalization · Stateless Navigation · DOM · API · API Stability · Singleton · Authorities · Dependency Rule |
| CA-UX-8.5.2 | Módulo `src/ui/keyboard-nav/` + siete archivos core |
| CA-UX-8.5.3 | State solo `lastDirection` (Stateless Navigation Freeze) |
| CA-UX-8.5.4 | API Freeze: next / previous / move / escape / clear / get / getState |
| CA-UX-8.5.5 | Direction Normalization: next/previous/escape delegan a move() |
| CA-UX-8.5.6 | get ≡ getState · clone-on-read |
| CA-UX-8.5.7 | Barrel local · sin expansión `@/ui` |
| CA-UX-8.5.8 | Dependency Rule · DOM Freeze · no foreign registries |
| CA-UX-8.5.9 | Sin product mount · WindowRegistry intacto |
| CA-UX-8.5.10 | Roadmap marca UX-8.5 COMPLETE |
| CA-UX-8.5.11 | `validate:ux-8.5` PASS |

---

## 15. Gate

```text
validate:ux-8.5 → PASS
```

**Next:** UX-8.6 — Clipboard Foundation
