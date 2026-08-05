# UX-8.1 — Focus System Foundation

> **Architectural principles:**
> - Registry = único SSOT de foco (`FocusRegistryApi` + `focusRegistry`).
> - FocusState = `{ focusedId, lastFocusedId }` only — **sin** campo `blurred`.
> - `isFocused(id)` = derivado (`focusedId === id`).
> - factory → private state → API Freeze → clone-on-read.
> - FocusRegistry = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos; no `windows/**`.
> - Sin WindowRegistry · sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.1 — Focus System Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.0 Roadmap FROZEN · Architecture SSOT FROZEN · UX-7.10 RELEASE CERTIFIED  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.1 = Focus System Foundation
SCOPE = FocusTypes → FocusState → FocusRegistry → FocusContext → FocusProvider → useFocus → local barrel
FocusState = { focusedId, lastFocusedId } ONLY
NO blurred field · isFocused(id) DERIVED
Registry Freeze = focus / blur / getState / isFocused / clear ONLY
FocusRegistry = sole focus authority
NO WindowRegistry import · windowId: string via asFocusTargetId
NO production mount · NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 = VIGENTE
Next: UX-8.2 Selection Foundation
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de Focus bajo `src/ui/focus/`, **sin montar
Provider en la app**, **sin modificar WindowRegistry**, **sin impacto funcional
visible**.

```text
UX-8.1 establishes the Focus System Foundation only.
It does not wire focus into WindowManager, FloatingWindow, or product chrome.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-7 RELEASE CERTIFIED | [`UX-7.10.md`](./UX-7.10.md) · `validate:ux-7.10` |
| Architecture SSOT FROZEN | [`UX-8-architecture.md`](./UX-8-architecture.md) |
| Roadmap UX-8.0 FROZEN | [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md) |
| Sin `src/ui/focus/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/focus/` flat
- `FocusTypes` · `FocusState` · `FocusRegistry` · `FocusContext` · `FocusProvider` · `useFocus`
- Local `index.ts` barrel
- Docs + `validate:ux-8.1`

**Out**

- Selection / Hover / Keyboard / Clipboard / Interaction Commands / Diagnostics (→ UX-8.2+)
- Product mount / AppShell / `page.tsx` wiring
- Expanding `@/ui` public barrel
- WindowRegistry / WindowAPI / Floating chrome mutations
- DOM focus / `tabIndex` / visual focus rings

---

## 4. Architecture / Pipeline

```text
FocusTargetId (asFocusTargetId(windowId: string))
        │
        ▼
FocusState { focusedId, lastFocusedId }
        │
        ▼
FocusRegistryApi + focusRegistry
  focus / blur / getState / isFocused / clear
        │
        ▼
FocusProvider + FocusContext
        │
        ▼
useFocus() (read-only Context access)
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `FocusTypes` | Branded `FocusTargetId` + `asFocusTargetId` |
| `FocusState` | Snapshot `{ focusedId, lastFocusedId }` + `createFocusState` |
| `FocusRegistryApi` | SSOT mutable: focus / blur / getState / isFocused / clear |
| `focusRegistry` | Empty singleton SSOT |
| `FocusContext` | Declara `FocusContextValue` |
| `FocusProvider` | Posee registry vía `useRef` |
| `useFocus()` | Acceso read-only al Context |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No blurred field (estado duplicado)
No WindowRegistry / WindowManager / WindowAPI
No Floating / Drag / Resize / Snap
No Selection / Hover / Keyboard / Clipboard mutation
No DOM listeners · no tabIndex · no CSS focus rings
No production App wiring · no page.tsx · no AppShell
No @/ui public barrel expansion
No cross-registry mutation
```

---

## 7. API Freeze

### Types

```ts
type FocusTargetId = string & { readonly __brand: "FocusTargetId" };
function asFocusTargetId(id: string): FocusTargetId;
```

Window references: `asFocusTargetId(windowId)` where `windowId: string`.
Never import WindowRegistry.

### State

```ts
type FocusState = Readonly<{
  readonly focusedId: FocusTargetId | null;
  readonly lastFocusedId: FocusTargetId | null;
}>;
```

**No `blurred`.** Absence of focus = `focusedId === null` or `!isFocused(id)`.

### Registry Freeze

`FocusRegistryApi` queda **congelado** en UX-8.1.

Métodos oficiales:

```text
focus() · blur() · getState() · isFocused() · clear()
```

```ts
interface FocusRegistryApi {
  focus(id: FocusTargetId): void;
  blur(): void;
  getState(): FocusState;
  isFocused(id: FocusTargetId): boolean;
  clear(): void;
}

function createFocusRegistry(): FocusRegistryApi;
const focusRegistry: FocusRegistryApi; // empty singleton
```

- `focus(id)`: si cambia el foco, `lastFocusedId ← focusedId` (si no null), luego `focusedId ← id`.
- `blur()`: `lastFocusedId ← focusedId`, luego `focusedId ← null`.
- `getState()`: clone-on-read vía `createFocusState` (Object.freeze).
- `isFocused(id)`: **derivado** — `focusedId === id` (no se almacena).
- `clear()`: ambos ids a `null`.

Naming: `FocusRegistryApi` + `focusRegistry` (en diagramas: **FocusRegistry**).

### Provider / Context

```ts
type FocusContextValue = Readonly<{
  registry: FocusRegistryApi;
}>;
```

Provider owns registry. No setters · no useState · no useReducer · no product mount.

### Hook

```ts
function useFocus(): FocusContextValue;
// throws: "Focus hooks must be used inside FocusProvider."
```

---

## 8. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Focus | `FocusRegistry` |

Ningún otro registry puede modificar FocusRegistry.
Coordinación entre módulos → UX-9+ únicamente.

---

## 9. Dependency Rule

Files under `src/ui/focus/` may depend only on:

- Local focus module files
- `react` (Context / Provider / hook only)

Must **not** import:

- Other UX module Registry / Provider / Context implementations
- `src/components/windows/**`
- Runtime / scientific / graph math
- Commands / Visibility / Features internals for wiring

---

## 10. Extension Points

| Congelado en UX-8.1 | Diferido |
|---------------------|----------|
| FocusState (2 fields) | Selection → UX-8.2 |
| Registry Freeze (5 métodos) | Multi-select → UX-8.3 |
| Provider / Context / useFocus | Hover → UX-8.4 |
| Local barrel only | Keyboard nav → UX-8.5 |
| Empty singleton · no product mount | DOM focus wiring → UX-9 |

---

## 11. Exclusions / Decoupling fence

Protected prior surfaces (must not change):

- WindowRegistry · WindowTypes · WindowManager · WindowAPI
- Floating / Drag / Resize / Snap
- Tabs / Series / Content
- UX-5 Features · UX-6 Commands · UX-7 Visibility
- Runtime · `src/lib/scientific/**`
- `src/ui/index.ts` · `page.tsx` · AppShell

---

## 12. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.1.1 | Docs con FocusState · Registry Freeze · Authorities · Dependency Rule · No blurred |
| CA-UX-8.1.2 | Módulo `src/ui/focus/` + archivos core |
| CA-UX-8.1.3 | FocusState solo `focusedId` + `lastFocusedId` |
| CA-UX-8.1.4 | Registry Freeze: focus / blur / getState / isFocused / clear |
| CA-UX-8.1.5 | `isFocused` derivado · clone-on-read en `getState` |
| CA-UX-8.1.6 | Barrel local · sin expansión `@/ui` |
| CA-UX-8.1.7 | Dependency Rule · no windows/** · no Registry/Provider/Context ajenos |
| CA-UX-8.1.8 | Sin product mount · WindowRegistry intacto |
| CA-UX-8.1.9 | Roadmap marca UX-8.1 COMPLETE |
| CA-UX-8.1.10 | `validate:ux-8.1` PASS |

---

## 13. Gate

```text
validate:ux-8.1 → PASS
```

**Next:** UX-8.2 — Selection Foundation
