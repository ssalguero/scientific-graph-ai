# UX-6.1 — Command System Foundation

> **Architectural principles:**
> - Registry = único SSOT de commands (`CommandRegistryApi` + `commandRegistry`).
> - Definition = identity only; State = runtime `enabled` / `visible`.
> - Empty registry by design — registration deferred to UX-6.2.
> - Sin ejecución · sin handlers · sin shortcuts · sin chrome wiring.
> - Sin dependencias de interacción (`window` / `document` / keyboard / mouse).
> - API Freeze de toda la infraestructura foundation.
> - Sin cambios funcionales visibles · sin montaje en producción.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.1 — Command System Foundation  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-6.0 Roadmap FROZEN · UX-5.10 SERIES CERTIFIED  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.1 = Command System Foundation
SCOPE = full infrastructure stack (Definition → Diagnostics)
Registry = empty by design (CommandRegistryApi + commandRegistry)
State = { id, enabled, visible } separated from Definition
Provider owns registry + states + Context
useCommands() = read-only
Bridge = pass-through availability assertion
Diagnostics = createCommandDiagnosticsReport → { count, ids, enabled, visible }
NO registration of production commands
NO execution · NO handlers · NO dispatcher · NO executor
NO keyboard · NO mouse · NO shortcuts · NO palette · NO menus · NO toolbar
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-3 / UX-4 / UX-5 = VIGENTE
Next: UX-6.2 Command Registration
```

---

## 1. Purpose / Objetivo

Crear la infraestructura completa del Command System bajo `src/ui/commands/`,
**sin registrar comandos de producción**, **sin ejecutar acciones**, **sin
montar Provider/Bridge en la app** y **sin impacto funcional visible**.

```text
UX-6.1 establishes the Command System foundation only.
It does not register, execute, or expose commands in the product UI.
```

---

## 2. Architectural decision — empty registry

> Registration is intentionally deferred to UX-6.2.
> UX-6.1 guarantees only the existence of the Command infrastructure.
> The registry remains empty by design.
> No production commands are created or mounted in this phase.

An empty `commandRegistry` is the **expected** outcome of UX-6.1, not an
incomplete implementation. UX-6.2 will register real commands **without**
modifying any APIs frozen in UX-6.1.

---

## 3. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-5 SERIES CERTIFIED | [`UX-5.10.md`](./UX-5.10.md) · `validate:ux-5.10` |
| Feature Architecture frozen | [`src/ui/features/`](../../src/ui/features/) |
| Sin `src/ui/commands/` | objetivo de esta microfase |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 4. In Scope / Out of Scope

**In**

- `src/ui/commands/` flat (same convention as features)
- `CommandTypes` · `CommandDefinition` · `CommandRegistry` · `CommandState`
- `CommandContext` · `CommandProvider` · `useCommands` · `CommandBridge`
- `CommandDiagnostics` · local `index.ts`
- Docs + `validate:ux-6.1`

**Out**

- Registration of real commands (→ UX-6.2)
- Execution pipeline / handlers / dispatcher / executor (→ UX-6.3)
- Keyboard shortcuts (→ UX-6.4)
- Command palette (→ UX-6.5)
- Menus / toolbar / context menus (→ UX-6.6–6.8)
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel

---

## 5. Architecture / Pipeline

```text
CommandDefinition ({ id })
        │
        ▼
CommandRegistryApi (Map SSOT, query-only) + commandRegistry
        │
        ▼
CommandState ({ id, enabled, visible })
        │
        ▼
CommandProvider + CommandContext (owns registry + states)
        │
        ▼
useCommands() (read-only)
        │
        ▼
CommandBridge (pass-through availability assertion)
        │
        ▼
createCommandDiagnosticsReport → { count, ids, enabled, visible }
```

---

## 6. API Freeze

### Definition

```ts
type CommandDefinition = Readonly<{ readonly id: CommandId }>;
```

### Registry

```ts
interface CommandRegistryApi {
  get(id: CommandId): CommandDefinition | undefined;
  has(id: CommandId): boolean;
  size(): number;
  getAll(): readonly CommandDefinition[];
}

const commandRegistry: CommandRegistryApi; // empty singleton
```

Contract and singleton use **distinct names** (`CommandRegistryApi` ≠
`commandRegistry`). There is **no** type named `CommandRegistry`.

### State

```ts
type CommandState = Readonly<{
  readonly id: CommandId;
  readonly enabled: boolean;
  readonly visible: boolean;
}>;
```

### Provider / Context

```ts
type CommandContextValue = Readonly<{
  registry: CommandRegistryApi;
  states: ReadonlyMap<CommandId, CommandState>;
}>;
```

Provider owns registry + states. No setters · no useState · no useReducer.

### Hook

```ts
function useCommands(): CommandContextValue;
// throws: "Command hooks must be used inside CommandProvider."
```

### Bridge

Pass-through: `useCommands()` availability assertion only; returns `children`.

### Diagnostics

```ts
function createCommandDiagnosticsReport(
  registry: CommandRegistryApi,
  states: ReadonlyMap<CommandId, CommandState>,
): CommandDiagnosticsReport;

type CommandDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly CommandId[];
  enabled: readonly CommandId[];
  visible: readonly CommandId[];
}>;
```

Pure function — no class.

---

## 7. Decisiones

| Decisión | Elección |
|----------|----------|
| Location | `src/ui/commands/` flat (1A) |
| Model split | Definition `{ id }` · State `{ id, enabled, visible }` (2A) |
| Registry naming | `CommandRegistryApi` + `commandRegistry` |
| Diagnostics | `createCommandDiagnosticsReport` (functional) |
| Registration | Deferred to UX-6.2 · empty by design |
| Production mount | None in UX-6.1 |

---

## 8. Exclusions / Decoupling fence

Files under `src/ui/commands/` must not import or reference:

- `react-dom`
- UI product components
- `window` / `document`
- `KeyboardEvent` / `MouseEvent`

Pure modules (`CommandTypes`, `CommandDefinition`, `CommandRegistry`,
`CommandState`, `CommandDiagnostics`) remain React-free. React is allowed only
in Context / Provider / Bridge / hook client modules.

Also prohibited: execute · handlers · callbacks · dispatcher · executor ·
shortcuts · palette · menus · toolbar · plugins · undo/redo · product wiring ·
`src/ui/index.ts` modification.

---

## 9. Protected files

| Path | Role |
|------|------|
| `src/ui/commands/CommandTypes.ts` | Branded id |
| `src/ui/commands/CommandDefinition.ts` | Identity definition |
| `src/ui/commands/CommandRegistry.ts` | Registry API + empty SSOT |
| `src/ui/commands/CommandState.ts` | Runtime state |
| `src/ui/commands/CommandContext.tsx` | Private context |
| `src/ui/commands/CommandProvider.tsx` | Ownership |
| `src/ui/commands/useCommands.ts` | Read-only hook |
| `src/ui/commands/CommandBridge.tsx` | Pass-through bridge |
| `src/ui/commands/CommandDiagnostics.ts` | Pure diagnostics |
| `src/ui/commands/index.ts` | Local barrel |

---

## 10. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.1.1 | Structure `src/ui/commands/` + required files |
| CA-UX-6.1.2 | Definition contract (`id` only) |
| CA-UX-6.1.3 | `CommandRegistryApi` + empty `commandRegistry` |
| CA-UX-6.1.4 | State `{ id, enabled, visible }` separated from Definition |
| CA-UX-6.1.5 | Provider owns registry + states + Context |
| CA-UX-6.1.6 | `useCommands()` read-only |
| CA-UX-6.1.7 | Bridge pass-through · no business logic |
| CA-UX-6.1.8 | Diagnostics report `{ count, ids, enabled, visible }` |
| CA-UX-6.1.9 | API Freeze + decoupling fences |
| CA-UX-6.1.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.1` → **PASS 10/10**

---

## 11. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.2 | Command Registration (populate registry without changing frozen APIs) |
| UX-6.3 | Command Execution Pipeline |
| UX-6.4 | Keyboard Shortcuts Foundation |
| UX-6.5+ | Palette · Menus · Toolbar · Context Menus · Metrics · Certification |
