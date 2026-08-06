# UX-8.4 — Hover System Foundation

> **Architectural principles:**
> - Registry = único SSOT de hover (`HoverRegistryApi` + `hoverRegistry`).
> - HoverState = `{ hoveredWindowId, hoveredContentId, hoveredSeriesId }` only.
> - **Hover Semantics Freeze:** current state only — no enter / leave / history /
>   coordinates; axes independent; mixed nulls VALID.
> - factory → private state → API Freeze → clone-on-read.
> - HoverRegistry = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos; no `windows/**`.
> - Sin WindowRegistry · sin Focus · sin Selection · sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.4 — Hover System Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.3 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.4 = Hover System Foundation
SCOPE = HoverTypes → HoverState → HoverRegistry → HoverContext → HoverProvider → useHover → local barrel
HoverState = { hoveredWindowId, hoveredContentId, hoveredSeriesId } ONLY
Hover Semantics Freeze = current state only · no enter/leave/history/coordinates · mixed nulls VALID
Registry Freeze = hoverWindow / hoverContent / hoverSeries / clear / get / getState ONLY
API Stability Freeze = get() ≡ getState() · no behavioral differences
Singleton Freeze = hoverRegistry for infrastructure/testing ONLY · React via Provider + useHover
HoverRegistry = sole hover authority
NO WindowRegistry · NO Focus · NO Selection · NO tooltips · NO DOM mouse events
NO production mount · NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1 / UX-8.2 / UX-8.3 = VIGENTE
Next: UX-8.5 Keyboard Navigation
```

---

## 1. Objective / Objetivo

Crear la infraestructura oficial de Hover bajo `src/ui/hover/`, **sin montar
Provider en la app**, **sin modificar WindowRegistry**, **sin integración con
Focus / Selection**, **sin tooltips ni render**, **sin impacto funcional visible**.

```text
UX-8.4 establishes the Hover System Foundation only.
It does not wire hover into WindowManager, FloatingWindow, Tabs, Content,
Series, Focus, Selection, Commands, tooltips, or product chrome.
```

---

## 2. Architecture

```text
HoverProvider
        │
        ▼
HoverRegistry
        │
        ▼
HoverState

HoverWindowId / HoverContentId / HoverSeriesId
        │
        ▼
HoverState { hoveredWindowId, hoveredContentId, hoveredSeriesId }
        │
        ▼
HoverRegistryApi + hoverRegistry
  hoverWindow / hoverContent / hoverSeries / clear / get / getState
        │
        ▼
HoverProvider + HoverContext
        │
        ▼
useHover() (read-only Context access)
```

Registry = única autoridad.

| Componente | Responsabilidad |
|------------|-----------------|
| `HoverTypes` | Branded IDs + casters |
| `HoverState` | Snapshot de tres ejes + `createHoverState` |
| `HoverRegistryApi` | SSOT mutable: hover* / clear / get / getState |
| `hoverRegistry` | Empty singleton (infra/testing only) |
| `HoverContext` | Declara `HoverContextValue` |
| `HoverProvider` | Posee registry vía `useRef` |
| `useHover()` | Acceso read-only al Context |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 3. Hover Semantics Freeze

Hover representa **únicamente el estado actual**.

There is **NO**:

- `enter` / `leave`
- `lastHover` / history
- coordinates
- ownership / metadata / timestamps

Axes are completely independent. Changing one axis NEVER mutates another.
There is no hierarchy. Mixed null states are valid.

**Valid example:**

```text
hoveredWindowId  = WindowA
hoveredContentId = null
hoveredSeriesId  = Series17
```

Future tooltip / overlay consumers query `HoverRegistry` without changing this model.

---

## 4. API Freeze

### Types

```ts
type HoverWindowId = string & { readonly __brand: "HoverWindowId" };
type HoverContentId = string & { readonly __brand: "HoverContentId" };
type HoverSeriesId = string & { readonly __brand: "HoverSeriesId" };

function asHoverWindowId(id: string): HoverWindowId;
function asHoverContentId(id: string): HoverContentId;
function asHoverSeriesId(id: string): HoverSeriesId;
```

Never import WindowTypes, WindowRegistry, Focus, or Selection.

### State

```ts
type HoverState = Readonly<{
  readonly hoveredWindowId: HoverWindowId | null;
  readonly hoveredContentId: HoverContentId | null;
  readonly hoveredSeriesId: HoverSeriesId | null;
}>;
```

### Registry Freeze

`HoverRegistryApi` queda **congelado** en UX-8.4.

Métodos oficiales (exactamente seis):

```text
hoverWindow() · hoverContent() · hoverSeries() · clear() · get() · getState()
```

```ts
interface HoverRegistryApi {
  hoverWindow(id: HoverWindowId): void;
  hoverContent(id: HoverContentId): void;
  hoverSeries(id: HoverSeriesId): void;
  clear(): void;
  get(): HoverState;
  getState(): HoverState;
}

function createHoverRegistry(): HoverRegistryApi;
const hoverRegistry: HoverRegistryApi; // empty singleton
```

Historical Semantics:

- `hoverWindow(id)`: set `hoveredWindowId` only; no-op if same id.
- `hoverContent(id)`: set `hoveredContentId` only; no-op if same id.
- `hoverSeries(id)`: set `hoveredSeriesId` only; no-op if same id.
- `clear()`: all three ids → `null`.
- `get()` / `getState()`: clone-on-read vía `createHoverState` (Object.freeze).

**Forbidden:** `enter` · `leave` · `isHovered` · `hasHover` · `clearWindow` ·
`clearContent` · `clearSeries`.

Naming: `HoverRegistryApi` + `hoverRegistry` (en diagramas: **HoverRegistry**).

---

## 5. API Stability Freeze

`get()` y `getState()` son **intencionalmente equivalentes** en UX-8.x.
Ambos permanecen congelados por estabilidad de API; ningún consumidor debe
asumir diferencias de comportamiento.

---

## 6. Singleton Freeze

El singleton `hoverRegistry` existe únicamente para escenarios de
infraestructura y testing. Los consumidores React deben acceder al registry
exclusivamente mediante `HoverProvider` y `useHover()`.

---

## 7. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Hover | `HoverRegistry` |

Ningún otro registry puede modificar HoverRegistry.
FocusRegistry, SelectionRegistry, WindowRegistry — prohibido mutar Hover.
Coordinación entre módulos → UX-9+ únicamente.

---

## 8. Dependency Rule

Files under `src/ui/hover/` may depend only on:

- Local hover module files
- `react` (Context / Provider / hook only)

Must **not** import:

- Other UX module Registry / Provider / Context implementations
- Focus / Selection modules
- Keyboard / Clipboard / Interaction Commands
- `src/components/windows/**`
- Runtime / scientific / graph math
- Commands / Visibility / Features / Tabs internals for wiring

---

## 9. Out of Scope

```text
No DOM mouse events · no enter/leave listeners
No tooltips · no visual hover · no rendering
No Focus / Selection / Keyboard / Clipboard / Commands integration
No production App wiring · no page.tsx · no AppShell
No @/ui public barrel expansion
No WindowRegistry / WindowManager / WindowAPI mutations
No cross-registry mutation
```

---

## 10. Integration Fence

Protected prior surfaces (must not change):

- WindowRegistry · WindowTypes · WindowManager · WindowAPI
- Floating / Drag / Resize / Snap
- Tabs / Series / Content
- Focus module (`src/ui/focus/`)
- Selection module (`src/ui/selection/`)
- UX-5 Features · UX-6 Commands · UX-7 Visibility
- Runtime · `src/lib/scientific/**`
- `src/ui/index.ts` · `page.tsx` · AppShell
- `docs/UX/UX-8-architecture.md` · historical validators

No conectar Hover con:

```text
WindowRegistry · WindowManager · FloatingWindow
Tabs · Content · Series · Visibility
Commands · Selection · Focus · Keyboard · Clipboard
Tooltips · DOM mouse listeners
```

---

## 11. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.4.1 | Docs con HoverState · Hover Semantics Freeze · API Freeze · API Stability Freeze · Singleton Freeze · Authorities · Dependency Rule |
| CA-UX-8.4.2 | Módulo `src/ui/hover/` + siete archivos core |
| CA-UX-8.4.3 | HoverState solo tres ejes nullable |
| CA-UX-8.4.4 | Registry Freeze: hoverWindow / hoverContent / hoverSeries / clear / get / getState |
| CA-UX-8.4.5 | get ≡ getState · clone-on-read · axis independence enforced |
| CA-UX-8.4.6 | Barrel local · sin expansión `@/ui` |
| CA-UX-8.4.7 | Dependency Rule · no windows/** · no Focus · no Selection · no Registry/Provider/Context ajenos |
| CA-UX-8.4.8 | Sin product mount · WindowRegistry intacto |
| CA-UX-8.4.9 | Roadmap marca UX-8.4 COMPLETE |
| CA-UX-8.4.10 | `validate:ux-8.4` PASS |

---

## 12. Gate

```text
validate:ux-8.4 → PASS
```

**Next:** UX-8.5 — Keyboard Navigation
