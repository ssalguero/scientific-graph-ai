# UX-8.3 — Multi Selection Foundation

> **Architectural principles:**
> - Registry = único SSOT de selección (`SelectionRegistryApi` + `selectionRegistry`).
> - Compatibility Freeze: campos singulares UX-8.2 + `selected*Ids` (dual fields).
> - Projection Freeze: singulars ALWAYS derived from Sets (`size 0 → null` · `size 1 → id` · `size > 1 → null`) in `createSelectionState` only.
> - Set Ownership Freeze: Mutable Set → clone → SelectionSet → SelectionState → consumer.
> - Independence Freeze: axes completely independent — no hierarchy, no sync.
> - factory → private Sets → API Freeze (16) → clone-on-read.
> - SelectionRegistry = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos; no `windows/**`.
> - Sin WindowRegistry · sin Focus · sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.3 — Multi Selection Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.2 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.3 = Multi Selection Foundation
SCOPE = SelectionSet → SelectionState (dual) → SelectionRegistry (16) → local barrel
Compatibility Freeze = singular UX-8.2 fields preserved + selected*Ids
Projection Freeze = size 0→null · size 1→id · size >1→null · ONLY in createSelectionState
Set Ownership Freeze = Mutable Set → clone → SelectionSet → SelectionState → consumer
API Freeze = 16 methods · historical 6 preserved · no extras
Historical Semantics = select* replaces axis with {id} · clear ≡ clearAllSelections
Range Freeze = range*(start, end, orderedIds) · inclusive · no-op if missing · reverse OK
Ctrl/Shift Freeze = toggle* = Ctrl · range* = Shift · NO DOM · NO keyboard listeners
Independence Freeze = axes independent · mixed empties VALID
Singleton Freeze = selectionRegistry infra/testing ONLY · React via Provider + useSelection
SelectionRegistry = sole selection authority
NO WindowRegistry · NO Focus · NO product mount · NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1 / UX-8.2 = VIGENTE
Next: UX-8.4 Hover System
```

---

## 1. Objective / Objetivo

Incorporar la infraestructura oficial de **multiselección** bajo `src/ui/selection/`,
sin romper el contrato de UX-8.2, **sin UI**, **sin eventos DOM**, **sin atajos de
teclado**, **sin montar Provider en la app**, **sin modificar WindowRegistry**.

```text
UX-8.3 establishes Multi Selection infrastructure only.
It does not wire selection into WindowManager, FloatingWindow, Tabs, Content,
Series, Focus, Hover, Keyboard, Clipboard, Commands, or product chrome.
```

---

## 2. Evolution from UX-8.2

| UX-8.2 | UX-8.3 |
|--------|--------|
| `selectedWindowId` / Content / Series | Preserved (Compatibility Freeze) |
| Single id per axis | + `selected*Ids` SelectionSet per axis |
| 6 registry methods | + 10 methods (16 total) |
| No multi-select | toggle / range / clear per axis |
| No SelectionSet | `SelectionSet.ts` |

UX-8.2 consumers remain valid: `select*` / `clear` / `get` / `getState` and singular
fields continue to work. The UX-8.2 contract is a preserved **subset**.

---

## 3. Architecture

```text
Selection
    │
    ▼
SelectionRegistry (sole authority)
    │
    ├── Snapshot (UX-8.2 subset)
    └── Multi Selection (UX-8.3)

SelectionTypes
        │
        ▼
SelectionSet (immutable · clone-on-read)
        │
        ▼
SelectionState { singulars + selected*Ids }
        │
        ▼
SelectionRegistryApi (16 methods)
        │
        ▼
SelectionProvider + SelectionContext + useSelection
(no structural changes)
```

---

## 4. Compatibility Freeze

`SelectionState` MUST preserve:

```text
selectedWindowId · selectedContentId · selectedSeriesId
```

And adds ONLY:

```text
selectedWindowIds · selectedContentIds · selectedSeriesIds
```

Historical API MUST continue working. Nothing may break UX-8.2 consumers.

---

## 5. Projection Freeze

Singular values are **ALWAYS** derived from Sets. Single place of truth:
`createSelectionState()`.

```text
size == 0  →  null
size == 1  →  that id
size > 1   →  null
```

Do not duplicate projection logic in the Registry or elsewhere.

---

## 6. Set Ownership Freeze

Registry owns mutable Sets. Consumers NEVER receive mutable Sets.

```text
Mutable Set (private Registry)
        ↓
      clone
        ↓
   SelectionSet (immutable snapshot)
        ↓
   SelectionState
        ↓
     consumer
```

Never:

```text
consumer → Mutable Set interno
```

---

## 7. SelectionSet

```ts
type SelectionSet<T> = Readonly<{
  readonly size: number;
  has(id: T): boolean;
  values(): IterableIterator<T>;
  [Symbol.iterator](): IterableIterator<T>;
}>;

function createSelectionSet<T>(ids?: Iterable<T>): SelectionSet<T>;
const EMPTY_SELECTION_SET: SelectionSet<never>;
```

- Immutable snapshot · Set-based internally · clone-on-read
- No metadata · no timestamps · no ordering contract · no public mutators

---

## 8. API Freeze

`SelectionRegistryApi` exposes **exactly 16 methods**.

### Historical (UX-8.2 preserved)

```text
selectWindow · selectContent · selectSeries · clear · get · getState
```

### Toggle (Ctrl semantics)

```text
toggleWindow · toggleContent · toggleSeries
```

### Clear per axis

```text
clearWindowSelection · clearContentSelection · clearSeriesSelection
```

### Clear all

```text
clearAllSelections
```

### Range (Shift semantics)

```text
rangeWindow · rangeContent · rangeSeries
```

```ts
interface SelectionRegistryApi {
  selectWindow(id: SelectionWindowId): void;
  selectContent(id: SelectionContentId): void;
  selectSeries(id: SelectionSeriesId): void;
  clear(): void;
  get(): SelectionState;
  getState(): SelectionState;
  toggleWindow(id: SelectionWindowId): void;
  toggleContent(id: SelectionContentId): void;
  toggleSeries(id: SelectionSeriesId): void;
  clearWindowSelection(): void;
  clearContentSelection(): void;
  clearSeriesSelection(): void;
  clearAllSelections(): void;
  rangeWindow(
    start: SelectionWindowId,
    end: SelectionWindowId,
    orderedIds: readonly SelectionWindowId[],
  ): void;
  rangeContent(
    start: SelectionContentId,
    end: SelectionContentId,
    orderedIds: readonly SelectionContentId[],
  ): void;
  rangeSeries(
    start: SelectionSeriesId,
    end: SelectionSeriesId,
    orderedIds: readonly SelectionSeriesId[],
  ): void;
}
```

No additional helpers. No `isSelected` · `has` · `size` · `contains` on the registry.

### API Stability Freeze

`get()` ≡ `getState()` — intentionally equivalent; clone-on-read.

### Singleton Freeze

`selectionRegistry` = infrastructure / testing only. React via `SelectionProvider` + `useSelection()`.

---

## 9. Historical Semantics

- `select*(id)` → **replaces** the axis Set with `{id}` (UX-8.2 single-select preserved).
- `clear()` and `clearAllSelections()` are **intentionally equivalent** (vacían los tres ejes).

---

## 10. Range Freeze

```ts
rangeWindow(start, end, orderedIds: readonly SelectionWindowId[]): void
rangeContent(start, end, orderedIds: readonly SelectionContentId[]): void
rangeSeries(start, end, orderedIds: readonly SelectionSeriesId[]): void
```

- `orderedIds` supplied by caller — Registry MUST NOT inspect WindowRegistry.
- Inclusive range between `start` and `end` indices.
- If `start` or `end` missing from `orderedIds` → **no-op**.
- If identical → singleton `{start}`.
- Reverse order supported (`end` before `start`).

---

## 11. Ctrl / Shift Freeze

No DOM. No keyboard listeners.

| Operation | Models |
|-----------|--------|
| `toggle*` | Ctrl semantics |
| `range*` | Shift semantics |

Only infrastructure. Real keyboard integration → UX-8.5.

---

## 12. Independence Freeze

Operations never mutate another axis.

```text
Window  → Window only
Content → Content only
Series  → Series only
```

**Valid example:**

```text
Window:  A, B
Content: (empty)
Series:  S1, S2
```

Mixed empties / multi per axis are valid. No hierarchy. No sync.

---

## 13. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Selection | `SelectionRegistry` |

Ningún otro registry puede modificar SelectionRegistry.
FocusRegistry, HoverRegistry, WindowRegistry — prohibido mutar Selection.
Coordinación entre módulos → UX-9+ únicamente.

---

## 14. Dependency Rule

Files under `src/ui/selection/` may depend only on:

- Local selection module files
- `react` (Context / Provider / hook only)

Must **not** import:

- WindowRegistry · `windows/**`
- Focus · Hover · Keyboard · Clipboard · Interaction Commands
- foreign Registry / Provider / Context
- Runtime / scientific / graph math

---

## 15. Out of Scope

```text
No DOM events · no keyboard listeners · no actual Ctrl/Shift handling
No UI · no rendering · no visual selection
No Focus / Hover / Clipboard / Interaction Commands integration
No production wiring · no page.tsx · no AppShell · no @/ui expansion
No WindowRegistry / WindowManager mutations
No isSelected / has / size / contains helpers on registry
```

---

## 16. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.3.1 | Docs con Compatibility · Projection · Set Ownership · API · Range · Independence · Authorities · Dependency Rule |
| CA-UX-8.3.2 | `SelectionSet.ts` + dual-field SelectionState + Registry 16 methods |
| CA-UX-8.3.3 | Projection Freeze enforced only in `createSelectionState` |
| CA-UX-8.3.4 | Set Ownership Freeze · clone-on-read · clear ≡ clearAllSelections |
| CA-UX-8.3.5 | Historical 6 methods preserved · Range Freeze with orderedIds |
| CA-UX-8.3.6 | Independence Freeze · Dependency Rule · Authorities |
| CA-UX-8.3.7 | Barrel local · sin expansión `@/ui` · sin product mount |
| CA-UX-8.3.8 | WindowRegistry / page / AppShell intactos |
| CA-UX-8.3.9 | Roadmap marca UX-8.3 COMPLETE |
| CA-UX-8.3.10 | `validate:ux-8.3` PASS |

---

## 17. Gate

```text
validate:ux-8.3 → PASS
```

**Next:** UX-8.4 — Hover System
