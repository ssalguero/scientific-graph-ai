# UX-6.3 — Command Execution Pipeline Foundation

> **Architectural principles:**
> - Pipeline = structural dispatch only (`dispatch` → `CommandExecutionResult`).
> - No handlers · no callbacks · no business logic · no app mutation.
> - UX-6.1 / UX-6.2 public contracts remain frozen and untouched.
> - Provider may own the pipeline privately; Context API stays `{ registry, states }`.
> - Sin cambios funcionales visibles · sin montaje en producción.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.3 — Command Execution Pipeline Foundation  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.3 = Command Execution Pipeline Foundation
SCOPE = Request · Context · Dispatcher · Pipeline · Result · diagnostics
dispatch = structural acknowledgment only (notFound | notEnabled | acknowledged)
NO handlers · NO callbacks · NO business execution
NO keyboard · NO mouse · NO shortcuts · NO palette · NO menus · NO toolbar
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.2 = VIGENTE
Next: UX-6.4 Keyboard Shortcuts Foundation
```

---

## 1. Purpose / Objetivo

Introducir la infraestructura del **Execution Pipeline** sobre el Command System,
**sin ejecutar lógica de negocio**, **sin handlers**, **sin montar Provider/Bridge
en la app** y **sin impacto funcional visible**.

```text
UX-6.3 establishes the Command Execution Pipeline foundation only.
It does not run business actions, wire chrome, or expand public APIs.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6.1 Foundation | [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1` |
| `CommandRegistryApi` + `commandRegistry` | [`CommandRegistry.ts`](../../src/ui/commands/CommandRegistry.ts) |
| Provider / Context / Hook / Bridge frozen | UX-6.1 API Freeze |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `CommandExecutionTypes` · `CommandExecutionContext` · `CommandExecutionResult`
- `CommandExecutionDispatcher` · `CommandExecutionPipeline`
- Diagnostics `pipelineReady`
- Provider private ownership of pipeline (Context API unchanged)
- Docs + `validate:ux-6.3`

**Out**

- Handlers / callbacks / real business execution
- Keyboard shortcuts (→ UX-6.4)
- Command palette (→ UX-6.5)
- Menus / toolbar / context menus (→ UX-6.6–6.8)
- New command registration
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel
- Changing frozen UX-6.1 / UX-6.2 contracts

---

## 4. Architecture / Pipeline

```text
commandRegistry (SSOT)
        │
        ▼
CommandExecutionPipeline
        │
        ├── CommandExecutionRequest
        ├── CommandExecutionContext  (registry + states)
        ├── CommandExecutionDispatcher (internal · structural)
        └── CommandExecutionResult   (notFound | notEnabled | acknowledged)
        │
        ▼
CommandProvider (owns pipeline privately · Context API intact)
        │
        ▼
useCommands() → CommandBridge → createCommandDiagnosticsReport(+ pipelineReady)
```

Series context (prior layers):

```text
CommandCatalog / Registration / Builder  →  commandRegistry  →  Execution Pipeline
(UX-6.2 when present)                      (UX-6.1 SSOT)       (UX-6.3)
```

---

## 5. Flujo de ejecución (estructural)

1. Caller builds `CommandExecutionRequest` via `createCommandExecutionRequest`.
2. `pipeline.dispatch(request)` delegates to the internal dispatcher.
3. Dispatcher consults `context.registry` / `context.states` only.
4. Returns frozen `CommandExecutionResult`:
   - `notFound` — id absent from registry
   - `notEnabled` — state exists and `enabled === false`
   - `acknowledged` — structural accept (**no business logic**)

No handlers are looked up. No application state is mutated.

---

## 6. API Freeze

### Unchanged (UX-6.1 / UX-6.2)

- `CommandDefinition` · `CommandState` · `CommandRegistryApi`
- `CommandContextValue` = `{ registry, states }`
- `CommandProvider` props · `useCommands()` · `CommandBridge`

### New (UX-6.3 only)

```ts
type CommandExecutionRequest = Readonly<{ readonly commandId: CommandId }>;

type CommandExecutionStatus = "notFound" | "notEnabled" | "acknowledged";

type CommandExecutionResult = Readonly<{
  readonly commandId: CommandId;
  readonly status: CommandExecutionStatus;
  readonly ok: boolean;
}>;

type CommandExecutionContext = Readonly<{
  readonly registry: CommandRegistryApi;
  readonly states: ReadonlyMap<CommandId, CommandState>;
}>;

type CommandExecutionDispatcher = Readonly<{
  dispatch(request, context): CommandExecutionResult;
}>;

type CommandExecutionPipeline = Readonly<{
  dispatch(request): CommandExecutionResult;
  getContext(): CommandExecutionContext;
}>;
```

### Diagnostics (additive)

```ts
type CommandDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly CommandId[];
  enabled: readonly CommandId[];
  visible: readonly CommandId[];
  pipelineReady: boolean; // UX-6.3
}>;
```

---

## 7. Decisiones

| Decisión | Elección |
|----------|----------|
| Entry verb | `dispatch` (not a business `execute` surface) |
| Outcomes | Structural triad only |
| Provider | Owns pipeline privately; Context freeze intact |
| Diagnostics | Additive `pipelineReady` only |
| Business handlers | Deferred (post–UX-6.3) |

---

## 8. Exclusions / Decoupling fence

Prohibited under `src/ui/commands/` for this phase:

- handlers · callbacks · real business execution
- keyboard / mouse / shortcuts / palette / menus / toolbar
- plugins · undo / redo · AppShell · production wiring
- additional React components · visible behavior
- `src/ui/index.ts` modification

Pure execution modules remain React-free.

---

## 9. Protected files

| Path | Role |
|------|------|
| `CommandExecutionTypes.ts` | Request + status |
| `CommandExecutionContext.ts` | Read-only context |
| `CommandExecutionDispatcher.ts` | Internal structural dispatcher |
| `CommandExecutionPipeline.ts` | Pipeline orchestration |
| `CommandExecutionResult.ts` | Immutable result |
| `CommandDiagnostics.ts` | + `pipelineReady` |
| `CommandProvider.tsx` | Private pipeline ownership |
| `index.ts` | Local barrel exports |

---

## 10. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.3.1 | Execution pipeline structure (5 new modules) |
| CA-UX-6.3.2 | Execution context contract |
| CA-UX-6.3.3 | Dispatcher structure (structural only) |
| CA-UX-6.3.4 | Execution result contract |
| CA-UX-6.3.5 | Provider owns pipeline · Context API intact |
| CA-UX-6.3.6 | Diagnostics reports `pipelineReady` |
| CA-UX-6.3.7 | API Freeze UX-6.1 / UX-6.2 intact |
| CA-UX-6.3.8 | No business execution / no handlers / no callbacks |
| CA-UX-6.3.9 | No production mount |
| CA-UX-6.3.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.3` → **PASS 10/10**

---

## 11. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.4 | Keyboard Shortcuts Foundation |
| UX-6.5 | Command Palette Foundation |
| UX-6.6–6.8 | Menus · Toolbar · Context Menus |
| UX-6.9–6.10 | Diagnostics/Metrics · Integration Certification |
