# UX-6.8 — Context Menus Foundation

> **Architectural principles:**
> - Context Menus reference `CommandId` only; `commandRegistry` remains the sole command SSOT.
> - `ContextMenus` is opaque — public brand contract only; read helpers are package-internal (Diagnostics only).
> - Builder pipeline: validate → freeze → preserve order → seal.
> - Catalog order is a public contract (no alphabetical / ContextMenuId / CommandId sorting).
> - No React UI · no browser events · no execution · no production mount.
> - UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 / UX-6.7 public contracts remain frozen and untouched.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.8 — Context Menus Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.3 Pipeline · UX-6.4 Shortcuts · UX-6.5 Palette · UX-6.6 Menus · UX-6.7 Toolbar · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.8 = Context Menus Foundation
SCOPE = Definition · Catalog · Opaque ContextMenus · Builder · Context · Provider · Hook · Bridge · Diagnostics
commandRegistry = sole CommandId SSOT
CONTEXT_MENU_CATALOG = structural seed (references CommandId · never owns commands)
ContextMenus = opaque public contract (NOT implementation)
Builder = validate → freeze → preserve order → seal
Context = { contextMenus }
NO React UI · NO MouseEvent · NO contextmenu · NO ContextMenuEvent · NO DOM
NO Floating Menu · NO Overlay · NO Posicionamiento
NO pipeline dispatch · NO execution
NO AppShell
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 / UX-6.7 = VIGENTE
Next: UX-6.9 Command Diagnostics & Metrics
```

---

## 1. Purpose / Objetivo

Introducir la infraestructura de **Context Menus** como una capa estructural
desacoplada que describe una colección ordenada e inmutable de ítems `CommandId`.

```text
UX-6.8 establishes the Context Menus structural foundation only.
It does not render UI, capture browser events, wire chrome, or execute commands.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6.1 Foundation | [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1` |
| UX-6.3 Execution Pipeline | [`UX-6.3.md`](./UX-6.3.md) · `validate:ux-6.3` |
| UX-6.4 Shortcuts | [`UX-6.4.md`](./UX-6.4.md) · `validate:ux-6.4` |
| UX-6.5 Command Palette | [`UX-6.5.md`](./UX-6.5.md) · `validate:ux-6.5` |
| UX-6.6 Menus | [`UX-6.6.md`](./UX-6.6.md) · `validate:ux-6.6` |
| UX-6.7 Toolbar | [`UX-6.7.md`](./UX-6.7.md) · `validate:ux-6.7` |
| `commandRegistry` SSOT | [`CommandRegistry.ts`](../../src/ui/commands/CommandRegistry.ts) |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `ContextMenuTypes` · `ContextMenuDefinition` · `ContextMenuItem` · `ContextMenuCatalog`
- `ContextMenus` (opaque) · `ContextMenuBuilder`
- `ContextMenuContext` · `ContextMenuProvider` · `useContextMenus` · `ContextMenuBridge`
- `ContextMenuDiagnostics`
- Docs + `validate:ux-6.8`

**Out**

- React UI · MouseEvent · contextmenu · ContextMenuEvent · DOM
- Floating Menu · Overlay · Posicionamiento
- Command execution / pipeline dispatch
- AppShell mount
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel
- Changing frozen UX-6.1–UX-6.7 contracts
- Registering commands into `commandRegistry`
- Exporting opaque read helpers from the local barrel

---

## 4. Architecture

```text
commandRegistry (SSOT CommandId)
        │  referenced by
        ▼
CONTEXT_MENU_CATALOG (structure only · order is public contract)
        │
        ▼
ContextMenuBuilder
   │
   ├─ validate   (duplicate ContextMenuId · empty catalog · empty items → throw)
   ├─ freeze
   └─ preserve order (exact CONTEXT_MENU_CATALOG order · no sort)
        │
        ▼
ContextMenus (opaque · duplicatedItems precomputed)
        │
        ▼
ContextMenuProvider (useRef) → Context { contextMenus }
        │
        ▼
useContextMenus()
        │
        ▼
ContextMenuBridge
        │
        ▼
ContextMenuDiagnostics
```

### CONTEXT_MENU_CATALOG

| Layer | Responsibility |
|-------|----------------|
| **commandRegistry** | Sole SSOT of commands |
| **CONTEXT_MENU_CATALOG** | Declares ordered context-menu collections — never owns commands |
| **ContextMenuBuilder** | validate → freeze → preserve order → seal |
| **ContextMenus** | Opaque handle; internals private (WeakMap) |

Initial seed:

```text
Default (context.default)
 ├─ system.catalog
 ├─ system.diagnostics
 └─ system.ping
```

Context menus only reference `CommandId`. No implicit command creation. No registration.

### Catalog order contract (public / frozen)

```text
Context-menu order and item order are preserved exactly as declared in CONTEXT_MENU_CATALOG.
```

- No alphabetical sort
- No reorder by `ContextMenuId`
- No reorder by `CommandId`
- Order is part of the public contract

### Builder pipeline

1. **validate** — duplicate `ContextMenuId` → throw; empty catalog → throw; empty `items` → throw
2. **freeze** — `Object.freeze` definitions / item lists
3. **preserve order** — exact catalog order
4. **seal** — opaque `ContextMenus` with Builder-precomputed `duplicatedItems`

### Opaque ContextMenus contract

```ts
type ContextMenus = Readonly<{
  readonly __brand: "ContextMenus";
}>;
```

- Public API freeze: opaque type + Builder construction.
- Read helpers (`getContextMenus*`) are **package-internal** — consumed only by `ContextMenuDiagnostics`; **not** re-exported from the local barrel.
- Internals stay private (WeakMap).
- No insert · no delete · no mutate once sealed.

---

## 5. Provider / Hook / Bridge

- **Context** exposes `{ contextMenus }` only (opaque handle).
- **Provider** builds the collection once via `useRef(buildContextMenus())`.
- **useContextMenus()** returns exact Provider-owned Context value; throws outside Provider.
- **ContextMenuBridge** asserts Provider presence, then pass-through `children`.
- **NO production mount** of Provider or Bridge in this phase.

---

## 6. Diagnostics

```ts
type ContextMenuDiagnosticsReport = Readonly<{
  contextMenus: readonly ContextMenuId[];
  items: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;
```

- Pure function · no class · no React · no side effects.
- `orphanCommands` = item CommandIds missing from compared `commandRegistry`.
- `duplicatedItems` = Builder-precomputed (Diagnostics only reads via package-internal helpers).
- Diagnostics is the sole intended consumer of opaque read helpers.

---

## 7. API Freeze

### New (UX-6.8)

```ts
type ContextMenuItem = Readonly<{
  commandId: CommandId;
}>;

type ContextMenuDefinition = Readonly<{
  id: ContextMenuId;
  items: readonly ContextMenuItem[];
}>;

type ContextMenus = Readonly<{
  readonly __brand: "ContextMenus";
}>;

type ContextMenuContextValue = Readonly<{
  contextMenus: ContextMenus;
}>;

type ContextMenuDiagnosticsReport = Readonly<{
  contextMenus: readonly ContextMenuId[];
  items: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;
```

Freeze: Definition · Item · **ContextMenus public contract** (not implementation) · Catalog order · Context · Provider · Hook · Bridge · Diagnostics.

### Unchanged (UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 / UX-6.7)

- `CommandDefinition` · `CommandState` · `CommandRegistryApi`
- `CommandContextValue` = `{ registry, states }`
- `CommandProvider` · `useCommands()` · `CommandBridge`
- `CommandExecutionPipeline` and related execution contracts
- Shortcut Definition / Registry / Resolver / Context / Provider / Hook / Bridge
- Command Palette Definition / Index / Search / Context / Provider / Hook / Bridge
- Menu Definition / Entry / MenuTree / Catalog / Context / Provider / Hook / Bridge / Diagnostics
- Toolbar Definition / Item / Toolbar / Catalog / Context / Provider / Hook / Bridge / Diagnostics

---

## 8. Exclusions / Decoupling fence

Prohibited under `src/ui/context-menus/` for this phase:

- MouseEvent · contextmenu · ContextMenuEvent · DOM · Floating Menu · Overlay · positioning
- `window` · `document` · listeners
- handlers · callbacks · pipeline dispatch · business execute
- AppShell product wiring
- `src/ui/index.ts` modification
- Barrel export of `getContextMenus*` / `sealContextMenus`

Pure modules (types / definition / catalog / ContextMenus / builder / diagnostics / barrel) remain React-free. React is allowed only in Context / Provider / Hook / Bridge.

---

## 9. Protected files

| Path | Role |
|------|------|
| `ContextMenuTypes.ts` | `ContextMenuId` brand |
| `ContextMenuDefinition.ts` | `{ id, items }` / `{ commandId }` |
| `ContextMenuCatalog.ts` | `CONTEXT_MENU_CATALOG` seed |
| `ContextMenus.ts` | Opaque collection + private storage |
| `ContextMenuBuilder.ts` | validate → freeze → preserve order → seal |
| `ContextMenuContext.tsx` | Private context |
| `ContextMenuProvider.tsx` | Owns opaque ContextMenus via `useRef` |
| `useContextMenus.ts` | Read-only hook |
| `ContextMenuBridge.tsx` | Availability bridge |
| `ContextMenuDiagnostics.ts` | Pure report |
| `index.ts` | Local barrel (no helpers · no React) |

---

## 10. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.8.1 | Context Menus stack structure (11 modules + docs) |
| CA-UX-6.8.2 | `CONTEXT_MENU_CATALOG` `context.default` seed; item / definition shape |
| CA-UX-6.8.3 | Builder validate → freeze → preserve order → seal |
| CA-UX-6.8.4 | Opaque `ContextMenus`; WeakMap private; helpers not in barrel |
| CA-UX-6.8.5 | Context `{ contextMenus }`; Provider `useRef`; Hook; Bridge |
| CA-UX-6.8.6 | Diagnostics: contextMenus · items · orphanCommands · duplicatedItems |
| CA-UX-6.8.7 | API Freeze UX-6.1–UX-6.7 intact |
| CA-UX-6.8.8 | No browser events / DOM under context-menus/ |
| CA-UX-6.8.9 | No execution · no production mount |
| CA-UX-6.8.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.8` → **PASS 10/10**

---

## 11. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.9 | Command Diagnostics & Metrics |
| UX-6.10 | Integration Certification |

Context-menu chrome (opening, mouse interaction, positioning → execution) remains a later interaction-layer concern.
With UX-6.8, the main command-surface foundations (Shortcuts · Palette · Menus · Toolbar · Context Menus) are complete at the infrastructure layer.
