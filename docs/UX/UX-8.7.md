# UX-8.7 — Interaction Commands Foundation

> **Architectural principles:**
> - Dispatcher = único SSOT de interaction commands
>   (`InteractionCommandDispatcherApi` + `interactionCommandDispatcher`).
> - Dispatcher state = `{ lastResult }` only.
> - **Shape Validation Freeze:** `dispatch()` validates structural shape only.
> - **Dispatch Semantics Freeze:** validate → result → replace `lastResult` →
>   return — never application logic / handlers / UX-6 / Runtime.
> - **Dispatch Determinism Freeze:** same input → same result; independent of
>   React · Runtime · environment · time · global state; sole side effect =
>   replace `lastResult`.
> - **Stateless Dispatch Freeze:** ONLY `lastResult` — no history / queue /
>   pending / retries / stack.
> - **Command Opaqueness Freeze:** `type` / `payload` opaque beyond shape.
> - **Command Identity Freeze:** `id` opaque — never generate / modify /
>   uniqueness-validate / interpret.
> - **Result Immutability Freeze:** never mutate existing result — new result →
>   replace → snapshot.
> - **Result Snapshot Freeze:** `get` / `getState` clone-on-read; never expose
>   internal references.
> - factory → private state → API Freeze → clone-on-read.
> - InteractionCommandDispatcher = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos.
> - Sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.7 — Interaction Commands Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.6 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.7 = Interaction Commands Foundation
SCOPE = InteractionCommand → InteractionCommandResult
        → InteractionCommandDispatcher
        → InteractionCommandContext → InteractionCommandProvider
        → useInteractionCommands → local barrel
DispatcherState = { lastResult } ONLY
InteractionCommand = { id, type, payload } ONLY
InteractionCommandResult = { accepted, reason } ONLY
Shape Validation Freeze = dispatch validates shape only
Dispatch Semantics Freeze = validate → result → replace lastResult → return
Dispatch Determinism Freeze = same input → same result · sole effect = replace
Stateless Dispatch Freeze = lastResult ONLY · no history/queue/pending/retries
Command Opaqueness Freeze = type/payload opaque beyond shape
Command Identity Freeze = id opaque · never generate/modify/uniqueness-validate
Result Immutability Freeze = never mutate existing result · new → replace
Result Snapshot Freeze = get/getState clone-on-read · no internal refs
Dispatcher Freeze = no queue/async/scheduler/retry/middleware/handlers/plugins
API Freeze = dispatch / clear / get / getState ONLY
API Stability Freeze = get() ≡ getState() · no behavioral differences
Singleton Freeze = interactionCommandDispatcher for infrastructure/testing ONLY ·
  React via Provider + useInteractionCommands
InteractionCommandDispatcher = sole interaction-command authority
NO Focus · NO Selection · NO Hover · NO Keyboard · NO Clipboard · NO UX-6
NO Command Palette · NO handlers · NO Runtime · NO production mount
NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1–UX-8.6 = VIGENTE
Next: UX-8.8 Interaction Diagnostics
```

---

## 1. Objective / Objetivo

Crear la infraestructura oficial de Interaction Commands bajo
`src/ui/interaction-commands/`,
**sin montar Provider en la app**, **sin Command Palette**, **sin handlers**,
**sin integración con UX-6 Commands / Focus / Selection / Hover / Keyboard /
Clipboard / Runtime**,
**sin impacto funcional visible**.

```text
UX-8.7 establishes the Interaction Commands Foundation only.
It models structural dispatch of InteractionCommand via a pure dispatcher.
It does not wire handlers, UX-6 Commands, Command Palette, Runtime,
or product chrome.
```

---

## 2. Architecture

```text
InteractionCommandProvider
        │
        ▼
InteractionCommandDispatcher
        │
        ▼
InteractionCommandContext { dispatcher }

InteractionCommand { id, type, payload }
        │
        ▼
InteractionCommandResult { accepted, reason }
        │
        ▼
InteractionCommandDispatcherApi + interactionCommandDispatcher
  dispatch / clear / get / getState
        │
        ▼
InteractionCommandProvider + InteractionCommandContext
        │
        ▼
useInteractionCommands() (read-only Context access)
```

Dispatcher = única autoridad.

| Componente | Responsabilidad |
|------------|-----------------|
| `InteractionCommand` | Command contract `{ id, type, payload }` |
| `InteractionCommandResult` | Structural result `{ accepted, reason }` |
| `InteractionCommandDispatcherApi` | SSOT mutable: dispatch / clear / get / getState |
| `interactionCommandDispatcher` | Empty singleton (infra/testing only) |
| `InteractionCommandContext` | Declara `InteractionCommandContextValue` |
| `InteractionCommandProvider` | Posee dispatcher vía `useRef` |
| `useInteractionCommands()` | Acceso read-only al Context |
| `index.ts` | Único export oficial del módulo (local barrel) |

---

## 3. Dispatcher Freeze

The dispatcher has **no**:

```text
queue · async · scheduler · retry · middleware · handlers · plugins
```

It is a pure structural dispatch surface.

---

## 4. Dispatch Semantics Freeze

`dispatch(command)` **ONLY**:

```text
validate shape
        ↓
create InteractionCommandResult
        ↓
replace lastResult
        ↓
return result
```

Never:

```text
execute business logic · call handlers · call UX-6
call Runtime · modify other registries
```

---

## 5. Dispatch Determinism Freeze

`dispatch(command)` is **deterministic**.

Same `InteractionCommand` input → same `InteractionCommandResult`.

Must **not** depend on:

```text
React · Runtime · environment · time · global state · registries
```

The **only** allowed side effect is:

```text
lastResult → replace
```

---

## 6. Stateless Dispatch Freeze

The dispatcher stores **ONLY**:

```text
lastResult: InteractionCommandResult | null
```

There is **NO**:

- `history`
- `queue`
- `pending`
- `retries`
- `execution stack`
- timestamps · metadata

---

## 7. Shape Validation Freeze

`dispatch(command)` performs **ONLY** structural validation.

Accepted **only** when:

```text
command is a non-null object
typeof command.id === "string"
typeof command.type === "string"
command has its own "payload" property
```

`payload` value may be anything, including `undefined`.

Otherwise:

```text
accepted = false
reason = short string
```

No additional validation.

---

## 8. Command Opaqueness Freeze

The dispatcher **never interprets** `payload` or `type` beyond structural
validation. They are opaque values.

---

## 9. Command Identity Freeze

`InteractionCommand.id` is completely **opaque**.

The dispatcher NEVER:

```text
generates · modifies · validates uniqueness · interprets
```

`id`. It only transports it (shape check: `typeof id === "string"`).

---

## 10. Result Immutability Freeze

Every `dispatch()` creates a **NEW** `InteractionCommandResult`.

Never mutate an existing result. `lastResult` is always **replaced** completely
— never partially updated.

---

## 11. Result Snapshot Freeze

`lastResult` is an internal snapshot.

The result returned by `dispatch()` is **immutable** (`Object.freeze`).

`get()` and `getState()`:

```text
get() / getState()
        ↓
clone
        ↓
snapshot
```

They **never** return the internal reference. Clone-on-read only.

---

## 12. API Freeze

### Types

```ts
type InteractionCommand = Readonly<{
  id: string;
  type: string;
  payload: unknown;
}>;

type InteractionCommandResult = Readonly<{
  accepted: boolean;
  reason: string | null;
}>;

type InteractionCommandDispatcherState = Readonly<{
  lastResult: InteractionCommandResult | null;
}>;
```

### Dispatcher Freeze (methods)

`InteractionCommandDispatcherApi` queda **congelado** en UX-8.7.

Métodos oficiales (exactamente cuatro):

```text
dispatch() · clear() · get() · getState()
```

```ts
interface InteractionCommandDispatcherApi {
  dispatch(command: InteractionCommand): InteractionCommandResult;
  clear(): void;
  get(): InteractionCommandDispatcherState;
  getState(): InteractionCommandDispatcherState;
}

function createInteractionCommandDispatcher(): InteractionCommandDispatcherApi;
const interactionCommandDispatcher: InteractionCommandDispatcherApi;
```

Historical Semantics:

- `dispatch(command)`: shape-validate → new frozen result → replace
  `lastResult` → return result.
- `clear()`: `lastResult → null`.
- `get()` / `getState()`: clone-on-read vía `snapshot()` (Object.freeze).

**Forbidden:** `register` · `unregister` · `subscribe` · `execute` ·
`invoke` · `emit` · `process`.

Naming: `InteractionCommandDispatcherApi` + `interactionCommandDispatcher`
(en diagramas: **InteractionCommandDispatcher**).

---

## 13. API Stability Freeze

`get()` y `getState()` son **intencionalmente equivalentes** en UX-8.x.
Ambos permanecen congelados por estabilidad de API; ningún consumidor debe
asumir diferencias de comportamiento.

```text
get() ≡ getState()
```

---

## 14. Singleton Freeze

El singleton `interactionCommandDispatcher` existe únicamente para escenarios
de infraestructura y testing. Los consumidores React deben acceder al
dispatcher exclusivamente mediante `InteractionCommandProvider` y
`useInteractionCommands()`.

---

## 15. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Interaction commands | `InteractionCommandDispatcher` |

Ningún otro registry puede modificar InteractionCommandDispatcher.
FocusRegistry, SelectionRegistry, HoverRegistry,
KeyboardNavigationRegistry, ClipboardRegistry, WindowRegistry,
CommandExecutionDispatcher — prohibido mutar interaction commands.
Coordinación entre módulos → UX-9+ únicamente.

---

## 16. Dependency Rule

Files under `src/ui/interaction-commands/` may depend only on:

- Local interaction-commands module files
- `react` (Context / Provider / hook only)

Must **not** import:

- UX-6 Commands · CommandExecutionDispatcher · CommandContext
- Other UX module Registry / Provider / Context implementations
- Focus / Selection / Hover / Keyboard / Clipboard
- `src/components/windows/**` · WindowRegistry
- Runtime / scientific / graph math
- Visibility / Features / Tabs internals for wiring

---

## 17. Out of Scope

```text
No Command Palette · no handlers · no business logic
No UX-6 Commands integration · no CommandExecutionDispatcher
No async dispatch · no queues · no middleware · no plugins · no subscriptions
No Runtime integration · no Focus / Selection / Hover / Keyboard / Clipboard
No production App wiring · no page.tsx · no AppShell
No @/ui public barrel expansion
No WindowRegistry / WindowManager / WindowAPI mutations
No cross-registry mutation
No Interaction Commands UI
```

---

## 18. Integration Fence

Protected prior surfaces (must not change):

- WindowRegistry · WindowTypes · WindowManager · WindowAPI
- Floating / Drag / Resize / Snap
- Tabs / Series / Content
- Focus module (`src/ui/focus/`)
- Selection module (`src/ui/selection/`)
- Hover module (`src/ui/hover/`)
- Keyboard Navigation module (`src/ui/keyboard-nav/`)
- Clipboard module (`src/ui/clipboard/`)
- UX-5 Features · UX-6 Commands · UX-7 Visibility
- Runtime · `src/lib/scientific/**`
- `src/ui/index.ts` · `page.tsx` · AppShell
- `docs/UX/UX-8-architecture.md` · historical validators

No conectar Interaction Commands con:

```text
WindowRegistry · WindowManager · FloatingWindow
Tabs · Content · Series · Visibility
Commands · Selection · Focus · Hover · Keyboard · Clipboard
Command Palette · Runtime · scientific
```

---

## 19. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.7.1 | Docs con Dispatcher · Semantics · Determinism · Stateless · Shape · Opaqueness · Identity · Immutability · Snapshot · API · API Stability · Singleton · Authorities · Dependency Rule |
| CA-UX-8.7.2 | Módulo `src/ui/interaction-commands/` + siete archivos core |
| CA-UX-8.7.3 | State solo `lastResult` (Stateless Dispatch Freeze) |
| CA-UX-8.7.4 | InteractionCommand solo `id` / `type` / `payload` |
| CA-UX-8.7.5 | InteractionCommandResult solo `accepted` / `reason` |
| CA-UX-8.7.6 | API Freeze: dispatch / clear / get / getState |
| CA-UX-8.7.7 | dispatch shape-only · clear() → null · get ≡ getState |
| CA-UX-8.7.8 | Identity opaque · type/payload opaque · result immutable · snapshot |
| CA-UX-8.7.9 | Barrel local · sin expansión `@/ui` |
| CA-UX-8.7.10 | Dependency Rule · no UX-6 · no foreign registries |
| CA-UX-8.7.11 | Sin product mount · WindowRegistry intacto |
| CA-UX-8.7.12 | Roadmap marca UX-8.7 COMPLETE |
| CA-UX-8.7.13 | `validate:ux-8.7` PASS |

---

## 20. Gate

```text
validate:ux-8.7 → PASS
```

**Next:** UX-8.8 — Interaction Diagnostics
