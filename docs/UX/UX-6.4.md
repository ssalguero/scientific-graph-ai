# UX-6.4 — Keyboard Shortcuts Foundation

> **Architectural principles:**
> - Shortcuts resolve `ShortcutKey` → `CommandId` only.
> - Registry = pure catalog (`get` / `has` / `size` / `getAll`).
> - Resolver owns the key index; Provider owns the Resolver privately.
> - No browser events · no command execution · no production mount.
> - UX-6.1 / UX-6.3 public contracts remain frozen and untouched.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.4 — Keyboard Shortcuts Foundation  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.3 Pipeline · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.4 = Keyboard Shortcuts Foundation
SCOPE = Catalog · Registration · Builder · Registry · Context · Provider · Hook · Bridge · Resolver · Diagnostics
resolve = ShortcutKey → CommandId only
Registry = pure catalog (NO findByShortcut)
Resolver = owns private key index from getAll()
Provider owns Resolver privately · Context = { registry }
NO browser events · NO KeyboardEvent · NO listeners
NO handlers · NO callbacks · NO command execution · NO pipeline dispatch
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.3 = VIGENTE
Next: UX-6.5 Command Palette Foundation
```

---

## 1. Purpose / Objetivo

Introducir la infraestructura de **Keyboard Shortcuts** desacoplada del
navegador, de la UI de producción y de la ejecución de comandos.

```text
UX-6.4 establishes the Keyboard Shortcuts foundation only.
It does not listen to keyboard events, wire chrome, or execute commands.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6.1 Foundation | [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1` |
| UX-6.3 Execution Pipeline | [`UX-6.3.md`](./UX-6.3.md) · `validate:ux-6.3` |
| `CommandId` branded identity | [`CommandTypes.ts`](../../src/ui/commands/CommandTypes.ts) |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `ShortcutTypes` · `ShortcutDefinition` · `ShortcutCatalog`
- `ShortcutRegistration` · `ShortcutRegistry` · `ShortcutRegistryBuilder`
- `ShortcutContext` · `ShortcutProvider` · `useShortcuts` · `ShortcutBridge`
- `ShortcutResolver` · `ShortcutDiagnostics`
- Docs + `validate:ux-6.4`

**Out**

- Browser keyboard capture (`keydown` / `KeyboardEvent` / listeners)
- Command execution / pipeline dispatch
- Command palette (→ UX-6.5)
- Menus / toolbar / context menus (→ UX-6.6–6.8)
- Functional shortcuts (Save / Undo / Redo / Export / Open)
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel
- Changing frozen UX-6.1 / UX-6.3 contracts

---

## 4. Architecture

```text
ShortcutCatalog
        │
        ▼
ShortcutRegistration
        │
        ▼
ShortcutRegistryBuilder
        │
        ▼
shortcutRegistry
        │
        ▼
ShortcutContext
        │
        ▼
ShortcutProvider
        │
        ▼
useShortcuts()
        │
        ▼
ShortcutBridge
        │
        ▼
ShortcutResolver
        │
        ▼
CommandExecutionPipeline   (NOT wired in UX-6.4)
```

### Registry vs Resolver

| Layer | Responsibility |
|-------|----------------|
| **Registry** | Pure catalog storage + id query (`get` / `has` / `size` / `getAll`) |
| **Resolver** | Builds private `ShortcutKey → CommandId` index from `getAll()`; exposes `resolve(key)` |

---

## 5. Catalog seed

| ShortcutKey | CommandId |
|-------------|-----------|
| `Ctrl+Shift+P` | `system.catalog` |
| `Ctrl+Alt+D` | `system.diagnostics` |
| `Ctrl+Alt+P` | `system.ping` |

Soft-coupled to branded `CommandId` strings (UX-6.2 CommandCatalog may land later).

---

## 6. API Freeze

### New (UX-6.4)

```ts
type ShortcutDefinition = Readonly<{
  id: ShortcutId;
  key: ShortcutKey;
  commandId: CommandId;
}>;

interface ShortcutRegistryApi {
  get(id: ShortcutId): ShortcutDefinition | undefined;
  has(id: ShortcutId): boolean;
  size(): number;
  getAll(): readonly ShortcutDefinition[];
}

type ShortcutContextValue = Readonly<{
  registry: ShortcutRegistryApi;
}>;

type ShortcutResolver = Readonly<{
  resolve(key: ShortcutKey): CommandId | undefined;
}>;

type ShortcutDiagnosticsReport = Readonly<{
  count: number;
  ids: readonly ShortcutId[];
  shortcuts: readonly ShortcutKey[];
  duplicates: readonly ShortcutId[];
}>;
```

### Unchanged (UX-6.1 / UX-6.3)

- `CommandDefinition` · `CommandState` · `CommandRegistryApi`
- `CommandContextValue` = `{ registry, states }`
- `CommandProvider` · `useCommands()` · `CommandBridge`
- `CommandExecutionPipeline` and related execution contracts

---

## 7. Provider / Hook / Bridge

- **Context** exposes `{ registry }` only.
- **Provider** owns `shortcutRegistry` and privately creates `ShortcutResolver` via `useRef` (mirrors Commands private pipeline ownership).
- **useShortcuts()** returns exact Provider-owned Context value; throws outside Provider.
- **ShortcutBridge** asserts Provider presence, then pass-through `children`.
- **NO production mount** of Provider or Bridge in this phase.

---

## 8. Exclusions / Decoupling fence

Prohibited under `src/ui/shortcuts/` for this phase:

- `window` · `document` · `KeyboardEvent` · `addEventListener` · `removeEventListener`
- `preventDefault` · `stopPropagation` · `onKeyDown`
- handlers · callbacks · pipeline dispatch · business execute
- AppShell · Toolbar · Menus · Palette product wiring
- `src/ui/index.ts` modification

Pure modules (types / definition / catalog / registration / registry / builder / resolver / diagnostics) remain React-free. React is allowed only in Context / Provider / Hook / Bridge.

---

## 9. Protected files

| Path | Role |
|------|------|
| `ShortcutTypes.ts` | Branded ids |
| `ShortcutDefinition.ts` | Identity `{ id, key, commandId }` |
| `ShortcutCatalog.ts` | Official seed |
| `ShortcutRegistration.ts` | Build-time dup guard |
| `ShortcutRegistry.ts` | Query-only catalog API |
| `ShortcutRegistryBuilder.ts` | Catalog → singleton |
| `ShortcutContext.tsx` | Private context |
| `ShortcutProvider.tsx` | Private resolver ownership |
| `useShortcuts.ts` | Read-only hook |
| `ShortcutBridge.tsx` | Availability bridge |
| `ShortcutResolver.ts` | Key → CommandId |
| `ShortcutDiagnostics.ts` | Pure report |
| `index.ts` | Local barrel |

---

## 10. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.4.1 | Shortcut stack structure (13 modules + docs) |
| CA-UX-6.4.2 | Official catalog seed (3 system shortcuts) |
| CA-UX-6.4.3 | Registration + Builder with duplicate guard |
| CA-UX-6.4.4 | Registry API query-only (no `findByShortcut`) |
| CA-UX-6.4.5 | Resolver owns key index; returns CommandId only |
| CA-UX-6.4.6 | Diagnostics: count · ids · shortcuts · duplicates |
| CA-UX-6.4.7 | API Freeze UX-6.1 / UX-6.3 intact |
| CA-UX-6.4.8 | No browser events |
| CA-UX-6.4.9 | No execution · no production mount |
| CA-UX-6.4.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.4` → **PASS 10/10**

---

## 11. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.5 | Command Palette Foundation |
| UX-6.6–6.8 | Menus · Toolbar · Context Menus |
| UX-6.9–6.10 | Diagnostics/Metrics · Integration Certification |

Browser keyboard integration (keydown → Resolver → Pipeline) remains a later interaction-layer concern.
