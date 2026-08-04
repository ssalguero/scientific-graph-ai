# UX-6.6 — Menus Foundation

> **Architectural principles:**
> - Menus reference `CommandId` only; `commandRegistry` remains the sole command SSOT.
> - `MenuTree` is opaque — public contract only, not storage internals.
> - Builder pipeline: validate → freeze → preserve order → seal.
> - Catalog order is a public contract (no alphabetical / MenuId / CommandId sorting).
> - No React UI · no execution · no production mount.
> - UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 public contracts remain frozen and untouched.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.6 — Menus Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.3 Pipeline · UX-6.4 Shortcuts · UX-6.5 Palette · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.6 = Menus Foundation
SCOPE = Definition · Catalog · Opaque Tree · Builder · Context · Provider · Hook · Bridge · Diagnostics
commandRegistry = sole CommandId SSOT
MENU_CATALOG = structural seed (references CommandId · never owns commands)
MenuTree = opaque public contract (NOT implementation)
Builder = validate → freeze → preserve order → seal
Context = { tree }
NO React UI · NO Menubar · NO Dropdown · NO Floating · NO Hover · NO Focus
NO Mouse · NO Keyboard · NO Shortcuts wiring · NO pipeline dispatch · NO execution
NO AppShell · NO Toolbar · NO Context Menu
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 = VIGENTE
Next: UX-6.7 Toolbar Integration
```

---

## 1. Purpose / Objetivo

Introducir la infraestructura de **Menus** como una capa estructural
desacoplada que describe una jerarquía inmutable de entradas `CommandId`.

```text
UX-6.6 establishes the Menus structural foundation only.
It does not render UI, capture input, wire chrome, or execute commands.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6.1 Foundation | [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1` |
| UX-6.3 Execution Pipeline | [`UX-6.3.md`](./UX-6.3.md) · `validate:ux-6.3` |
| UX-6.4 Shortcuts | [`UX-6.4.md`](./UX-6.4.md) · `validate:ux-6.4` |
| UX-6.5 Command Palette | [`UX-6.5.md`](./UX-6.5.md) · `validate:ux-6.5` |
| `commandRegistry` SSOT | [`CommandRegistry.ts`](../../src/ui/commands/CommandRegistry.ts) |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `MenuTypes` · `MenuDefinition` · `MenuEntry` · `MenuCatalog`
- `MenuTree` (opaque) · `MenuTreeBuilder`
- `MenuContext` · `MenuProvider` · `useMenus` · `MenuBridge`
- `MenuDiagnostics`
- Docs + `validate:ux-6.6`

**Out**

- React UI (Menubar / Dropdown / Floating / Hover / Focus / Mouse / Keyboard)
- Command execution / pipeline dispatch
- Shortcuts product wiring
- AppShell · Toolbar · Context Menus
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel
- Changing frozen UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 contracts
- Registering commands into `commandRegistry`

---

## 4. Architecture

```text
commandRegistry (SSOT CommandId)
        │  referenced by
        ▼
MENU_CATALOG (structure only · order is public contract)
        │
        ▼
MenuTreeBuilder
   │
   ├─ validate   (duplicate MenuId · empty title → throw)
   ├─ freeze
   └─ preserve order (exact MENU_CATALOG order · no sort)
        │
        ▼
MenuTree (opaque · duplicatedEntries precomputed)
        │
        ▼
MenuProvider (useRef) → Context { tree }
        │
        ▼
useMenus()
        │
        ▼
MenuBridge
        │
        ▼
MenuDiagnostics
```

### MENU_CATALOG

| Layer | Responsibility |
|-------|----------------|
| **commandRegistry** | Sole SSOT of commands |
| **MENU_CATALOG** | Declares menu hierarchy — never owns commands |
| **MenuTreeBuilder** | validate → freeze → preserve order → seal |
| **MenuTree** | Opaque handle; internals private (WeakMap) |

Initial seed:

```text
System (menu.system)
 ├─ system.catalog
 ├─ system.diagnostics
 └─ system.ping
```

Menus only reference `CommandId`. No implicit command creation. No registration.

### Catalog order contract (public / frozen)

```text
Menu order is preserved exactly as declared in MENU_CATALOG.
```

- No alphabetical sort
- No reorder by `MenuId`
- No reorder by `CommandId`
- Menu order and entry order inside each menu are part of the public contract

### Builder pipeline

1. **validate** — duplicate `MenuId` → throw; empty / whitespace-only title → throw
2. **freeze** — `Object.freeze` definitions / entry lists
3. **preserve order** — exact catalog order
4. **seal** — opaque `MenuTree` with Builder-precomputed `duplicatedEntries`

### Opaque MenuTree contract

```ts
type MenuTree = Readonly<{
  readonly __brand: "MenuTree";
}>;
```

- Public API freeze: opaque type + Builder construction + read helpers.
- Internals stay private (WeakMap).
- No insert · no delete · no mutate once sealed.

---

## 5. Provider / Hook / Bridge

- **Context** exposes `{ tree }` only (opaque handle).
- **Provider** builds the tree once via `useRef(buildMenuTree())`.
- **useMenus()** returns exact Provider-owned Context value; throws outside Provider.
- **MenuBridge** asserts Provider presence, then pass-through `children`.
- **NO production mount** of Provider or Bridge in this phase.

---

## 6. Diagnostics

```ts
type MenuDiagnosticsReport = Readonly<{
  menus: readonly MenuId[];
  entries: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedEntries: readonly CommandId[];
}>;
```

- Pure function · no class · no React · no side effects.
- `orphanCommands` = entry CommandIds missing from compared `commandRegistry`.
- `duplicatedEntries` = Builder-precomputed (Diagnostics only reads via helpers).

---

## 7. API Freeze

### New (UX-6.6)

```ts
type MenuEntry = Readonly<{
  commandId: CommandId;
}>;

type MenuDefinition = Readonly<{
  id: MenuId;
  title: string;
  entries: readonly MenuEntry[];
}>;

type MenuTree = Readonly<{
  readonly __brand: "MenuTree";
}>;

type MenuContextValue = Readonly<{
  tree: MenuTree;
}>;

type MenuDiagnosticsReport = Readonly<{
  menus: readonly MenuId[];
  entries: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedEntries: readonly CommandId[];
}>;
```

Freeze: Definition · Entry · **MenuTree public contract** (not implementation) · Catalog order · Context · Provider · Hook · Bridge · Diagnostics.

### Unchanged (UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5)

- `CommandDefinition` · `CommandState` · `CommandRegistryApi`
- `CommandContextValue` = `{ registry, states }`
- `CommandProvider` · `useCommands()` · `CommandBridge`
- `CommandExecutionPipeline` and related execution contracts
- Shortcut Definition / Registry / Resolver / Context / Provider / Hook / Bridge
- Command Palette Definition / Index / Search / Context / Provider / Hook / Bridge

---

## 8. Exclusions / Decoupling fence

Prohibited under `src/ui/menus/` for this phase:

- Menubar · Dropdown · Floating · Hover · Focus · Mouse · Keyboard chrome
- `window` · `document` · `KeyboardEvent` · listeners
- handlers · callbacks · pipeline dispatch · business execute
- AppShell · Toolbar · Context Menus · Shortcuts product wiring
- `src/ui/index.ts` modification

Pure modules (types / definition / catalog / tree / builder / diagnostics / barrel) remain React-free. React is allowed only in Context / Provider / Hook / Bridge.

---

## 9. Protected files

| Path | Role |
|------|------|
| `MenuTypes.ts` | `MenuId` brand |
| `MenuDefinition.ts` | `{ id, title, entries }` / `{ commandId }` |
| `MenuCatalog.ts` | `MENU_CATALOG` seed |
| `MenuTree.ts` | Opaque tree + private storage |
| `MenuTreeBuilder.ts` | validate → freeze → preserve order → seal |
| `MenuContext.tsx` | Private context |
| `MenuProvider.tsx` | Owns opaque tree via `useRef` |
| `useMenus.ts` | Read-only hook |
| `MenuBridge.tsx` | Availability bridge |
| `MenuDiagnostics.ts` | Pure report |
| `index.ts` | Local barrel |

---

## 10. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.6.1 | Menus stack structure (11 modules + docs) |
| CA-UX-6.6.2 | `MENU_CATALOG` System seed; `MenuEntry` / `MenuDefinition` shape |
| CA-UX-6.6.3 | Builder validate → freeze → preserve order → seal |
| CA-UX-6.6.4 | Opaque `MenuTree`; WeakMap private; immutable |
| CA-UX-6.6.5 | Context `{ tree }`; Provider `useRef`; Hook; Bridge |
| CA-UX-6.6.6 | Diagnostics: menus · entries · orphanCommands · duplicatedEntries |
| CA-UX-6.6.7 | API Freeze UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 intact |
| CA-UX-6.6.8 | No React UI chrome |
| CA-UX-6.6.9 | No execution · no production mount |
| CA-UX-6.6.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.6` → **PASS 10/10**

---

## 11. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.7 | Toolbar Integration |
| UX-6.8 | Context Menus |
| UX-6.9–6.10 | Diagnostics/Metrics · Integration Certification |

Visual menu chrome (menubar, keyboard navigation, interactive submenus, selection → execution) remains a later interaction-layer concern.
