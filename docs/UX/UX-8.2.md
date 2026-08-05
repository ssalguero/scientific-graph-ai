# UX-8.2 — Selection Foundation

> **Architectural principles:**
> - Registry = único SSOT de selección (`SelectionRegistryApi` + `selectionRegistry`).
> - SelectionState = `{ selectedWindowId, selectedContentId, selectedSeriesId }` only.
> - **Independence Freeze:** axes are completely independent — no hierarchy, no sync.
> - factory → private state → API Freeze → clone-on-read.
> - SelectionRegistry = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos; no `windows/**`.
> - Sin WindowRegistry · sin Focus · sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.2 — Selection Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.1 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.2 = Selection Foundation
SCOPE = SelectionTypes → SelectionState → SelectionRegistry → SelectionContext → SelectionProvider → useSelection → local barrel
SelectionState = { selectedWindowId, selectedContentId, selectedSeriesId } ONLY
Independence Freeze = axes independent · mixed nulls VALID
Registry Freeze = selectWindow / selectContent / selectSeries / clear / get / getState ONLY
API Stability Freeze = get() ≡ getState() · no behavioral differences
Singleton Freeze = selectionRegistry for infrastructure/testing ONLY · React via Provider + useSelection
SelectionRegistry = sole selection authority
NO WindowRegistry · NO Focus · NO multi-select (→ UX-8.3)
NO production mount · NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1 = VIGENTE
Next: UX-8.3 Multi Selection
```

---

## 1. Purpose / Objetivo

Crear la infraestructura oficial de Selection bajo `src/ui/selection/`, **sin montar
Provider en la app**, **sin modificar WindowRegistry**, **sin integración con Focus**,
**sin impacto funcional visible**.

```text
UX-8.2 establishes the Selection Foundation only.
It does not wire selection into WindowManager, FloatingWindow, Tabs, Content,
Series, Focus, Hover, Commands, or product chrome.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-8.1 RELEASE CERTIFIED | [`UX-8.1.md`](./UX-8.1.md) · `validate:ux-8.1` |
| Architecture SSOT FROZEN | [`UX-8-architecture.md`](./UX-8-architecture.md) |
| Roadmap UX-8.0 FROZEN | [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md) |
| Sin `src/ui/selection/` | objetivo de esta microfase |

---

## 3. In Scope / Out of Scope

**In**

- `src/ui/selection/` flat
- `SelectionTypes` · `SelectionState` · `SelectionRegistry` · `SelectionContext` · `SelectionProvider` · `useSelection`
- Local `index.ts` barrel
- Docs + `validate:ux-8.2`

**Out**

- Multi Selection / toggle / range / Ctrl / Shift (→ UX-8.3)
- Hover / Keyboard / Clipboard / Interaction Commands / Diagnostics (→ UX-8.4+)
- Product mount / AppShell / `page.tsx` wiring
- Expanding `@/ui` public barrel
- WindowRegistry / WindowAPI / Floating chrome mutations
- Focus / Hover integration
- UI rendering

---

## 4. Architecture / Pipeline

```text
SelectionWindowId / SelectionContentId / SelectionSeriesId
        │
        ▼
SelectionState { selectedWindowId, selectedContentId, selectedSeriesId }
        │
        ▼
SelectionRegistryApi + selectionRegistry
  selectWindow / selectContent / selectSeries / clear / get / getState
        │
        ▼
SelectionProvider + SelectionContext
        │
        ▼
useSelection() (read-only Context access)
```

---

## 5. Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `SelectionTypes` | Branded IDs + casters |
| `SelectionState` | Snapshot de tres ejes + `createSelectionState` |
| `SelectionRegistryApi` | SSOT mutable: select* / clear / get / getState |
| `selectionRegistry` | Empty singleton (infra/testing only) |
| `SelectionContext` | Declara `SelectionContextValue` |
| `SelectionProvider` | Posee registry vía `useRef` |
| `useSelection()` | Acceso read-only al Context |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 6. No responsabilidades

```text
No multi-select · no toggle · no range · no isSelected
No WindowRegistry / WindowManager / WindowAPI
No Floating / Drag / Resize / Snap
No Focus / Hover / Keyboard / Clipboard mutation
No Tabs / Content / Series integration
No DOM listeners · no UI rendering
No production App wiring · no page.tsx · no AppShell
No @/ui public barrel expansion
No cross-registry mutation
```

---

## 7. API Freeze

### Types

```ts
type SelectionWindowId = string & { readonly __brand: "SelectionWindowId" };
type SelectionContentId = string & { readonly __brand: "SelectionContentId" };
type SelectionSeriesId = string & { readonly __brand: "SelectionSeriesId" };

function asSelectionWindowId(id: string): SelectionWindowId;
function asSelectionContentId(id: string): SelectionContentId;
function asSelectionSeriesId(id: string): SelectionSeriesId;
```

Never import WindowTypes, WindowRegistry, or Focus.

### State

```ts
type SelectionState = Readonly<{
  readonly selectedWindowId: SelectionWindowId | null;
  readonly selectedContentId: SelectionContentId | null;
  readonly selectedSeriesId: SelectionSeriesId | null;
}>;
```

### Registry Freeze

`SelectionRegistryApi` queda **congelado** en UX-8.2.

Métodos oficiales:

```text
selectWindow() · selectContent() · selectSeries() · clear() · get() · getState()
```

```ts
interface SelectionRegistryApi {
  selectWindow(id: SelectionWindowId): void;
  selectContent(id: SelectionContentId): void;
  selectSeries(id: SelectionSeriesId): void;
  clear(): void;
  get(): SelectionState;
  getState(): SelectionState;
}

function createSelectionRegistry(): SelectionRegistryApi;
const selectionRegistry: SelectionRegistryApi; // empty singleton
```

- `selectWindow(id)`: set `selectedWindowId` only; no-op if same id.
- `selectContent(id)`: set `selectedContentId` only; no-op if same id.
- `selectSeries(id)`: set `selectedSeriesId` only; no-op if same id.
- `clear()`: all three ids → `null`.
- `get()` / `getState()`: clone-on-read vía `createSelectionState` (Object.freeze).

Naming: `SelectionRegistryApi` + `selectionRegistry` (en diagramas: **SelectionRegistry**).

### API Stability Freeze

`get()` y `getState()` son equivalentes en UX-8.x. Ambos permanecen congelados
para preservar compatibilidad futura; ningún consumidor debe asumir diferencias
de comportamiento.

### Singleton Freeze

El singleton `selectionRegistry` existe únicamente para escenarios de
infraestructura y testing. Los consumidores React deben acceder al registry
exclusivamente mediante `SelectionProvider` y `useSelection()`.

### Provider / Context

```ts
type SelectionContextValue = Readonly<{
  registry: SelectionRegistryApi;
}>;
```

Provider owns registry. No setters · no useState · no useReducer · no product mount.

### Hook

```ts
function useSelection(): SelectionContextValue;
// throws: "Selection hooks must be used inside SelectionProvider."
```

No mutation helpers on the hook. Mutations only via `registry.*`.

---

## 8. Independence Freeze

Selection axes are **completely independent**.

Selecting one axis NEVER:

- clears another
- synchronizes another
- derives another

There is no hierarchy. Mixed null states are valid.

**Valid example:**

```text
selectedWindowId  = WindowA
selectedContentId = null
selectedSeriesId  = Series17
```

This prepares UX-8.3 (Multi Selection) without redesigning the model.

---

## 9. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Selection | `SelectionRegistry` |

Ningún otro registry puede modificar SelectionRegistry.
FocusRegistry, HoverRegistry, WindowRegistry — prohibido mutar Selection.
Coordinación entre módulos → UX-9+ únicamente.

---

## 10. Dependency Rule

Files under `src/ui/selection/` may depend only on:

- Local selection module files
- `react` (Context / Provider / hook only)

Must **not** import:

- Other UX module Registry / Provider / Context implementations
- Focus / Hover modules
- `src/components/windows/**`
- Runtime / scientific / graph math
- Commands / Visibility / Features / Tabs internals for wiring

---

## 11. Extension Points

| Congelado en UX-8.2 | Diferido |
|---------------------|----------|
| SelectionState (3 axes) | Multi-select → UX-8.3 |
| Registry Freeze (6 métodos) | Toggle / range / isSelected → UX-8.3 |
| Independence Freeze | Hover → UX-8.4 |
| Provider / Context / useSelection | Keyboard nav → UX-8.5 |
| Local barrel only | Product wiring → UX-9 |
| Empty singleton · no product mount | |

---

## 12. Exclusions / Integration Fence

Protected prior surfaces (must not change):

- WindowRegistry · WindowTypes · WindowManager · WindowAPI
- Floating / Drag / Resize / Snap
- Tabs / Series / Content
- Focus module (`src/ui/focus/`)
- UX-5 Features · UX-6 Commands · UX-7 Visibility
- Runtime · `src/lib/scientific/**`
- `src/ui/index.ts` · `page.tsx` · AppShell

No conectar Selection con:

```text
WindowRegistry · WindowManager · FloatingWindow
Tabs · Content · Series · Visibility
Commands · Hover · Focus · Keyboard · Clipboard
```

---

## 13. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.2.1 | Docs con SelectionState · API Freeze · API Stability Freeze · Singleton Freeze · Independence Freeze · Authorities · Dependency Rule |
| CA-UX-8.2.2 | Módulo `src/ui/selection/` + siete archivos core |
| CA-UX-8.2.3 | SelectionState solo tres ejes nullable |
| CA-UX-8.2.4 | Registry Freeze: selectWindow / selectContent / selectSeries / clear / get / getState |
| CA-UX-8.2.5 | get ≡ getState · clone-on-read · Independence Freeze enforced |
| CA-UX-8.2.6 | Barrel local · sin expansión `@/ui` |
| CA-UX-8.2.7 | Dependency Rule · no windows/** · no Focus · no Registry/Provider/Context ajenos |
| CA-UX-8.2.8 | Sin product mount · WindowRegistry intacto |
| CA-UX-8.2.9 | Roadmap marca UX-8.2 COMPLETE |
| CA-UX-8.2.10 | `validate:ux-8.2` PASS |

---

## 14. Gate

```text
validate:ux-8.2 → PASS
```

**Next:** UX-8.3 — Multi Selection
