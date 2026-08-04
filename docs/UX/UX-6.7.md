# UX-6.7 — Toolbar Foundation

> **Architectural principles:**
> - Toolbar references `CommandId` only; `commandRegistry` remains the sole command SSOT.
> - `Toolbar` is opaque — public brand contract only; read helpers are package-internal (Diagnostics only).
> - Builder pipeline: validate → freeze → preserve order → seal.
> - Catalog order is a public contract (no alphabetical / ToolbarId / CommandId sorting).
> - No React UI · no execution · no production mount.
> - UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 public contracts remain frozen and untouched.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.7 — Toolbar Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.3 Pipeline · UX-6.4 Shortcuts · UX-6.5 Palette · UX-6.6 Menus · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.7 = Toolbar Foundation
SCOPE = Definition · Catalog · Opaque Toolbar · Builder · Context · Provider · Hook · Bridge · Diagnostics
commandRegistry = sole CommandId SSOT
TOOLBAR_CATALOG = structural seed (references CommandId · never owns commands)
Toolbar = opaque public contract (NOT implementation)
Builder = validate → freeze → preserve order → seal
Context = { toolbar }
NO React UI · NO Buttons · NO Icons · NO Separators · NO Overflow
NO Mouse · NO Keyboard · NO Shortcuts wiring · NO pipeline dispatch · NO execution
NO AppShell · NO Context Menu · NO AdaptiveToolbar chrome
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 = VIGENTE
Next: UX-6.8 Context Menus
```

---

## 1. Purpose / Objetivo

Introducir la infraestructura de **Toolbar** como una capa estructural
desacoplada que describe una colección ordenada e inmutable de ítems `CommandId`.

```text
UX-6.7 establishes the Toolbar structural foundation only.
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
| UX-6.6 Menus | [`UX-6.6.md`](./UX-6.6.md) · `validate:ux-6.6` |
| `commandRegistry` SSOT | [`CommandRegistry.ts`](../../src/ui/commands/CommandRegistry.ts) |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `ToolbarTypes` · `ToolbarDefinition` · `ToolbarItem` · `ToolbarCatalog`
- `Toolbar` (opaque) · `ToolbarBuilder`
- `ToolbarContext` · `ToolbarProvider` · `useToolbar` · `ToolbarBridge`
- `ToolbarDiagnostics`
- Docs + `validate:ux-6.7`

**Out**

- React UI (Buttons / Icons / Separators / Overflow / Mouse / Keyboard)
- Command execution / pipeline dispatch
- Shortcuts product wiring
- AppShell · Context Menus · AdaptiveToolbar chrome
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel
- Changing frozen UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 contracts
- Registering commands into `commandRegistry`
- Exporting opaque read helpers from the local barrel

---

## 4. Architecture

```text
commandRegistry (SSOT CommandId)
        │  referenced by
        ▼
TOOLBAR_CATALOG (structure only · order is public contract)
        │
        ▼
ToolbarBuilder
   │
   ├─ validate   (duplicate ToolbarId · empty catalog · empty items → throw)
   ├─ freeze
   └─ preserve order (exact TOOLBAR_CATALOG order · no sort)
        │
        ▼
Toolbar (opaque · duplicatedItems precomputed)
        │
        ▼
ToolbarProvider (useRef) → Context { toolbar }
        │
        ▼
useToolbar()
        │
        ▼
ToolbarBridge
        │
        ▼
ToolbarDiagnostics
```

### TOOLBAR_CATALOG

| Layer | Responsibility |
|-------|----------------|
| **commandRegistry** | Sole SSOT of commands |
| **TOOLBAR_CATALOG** | Declares ordered tool collections — never owns commands |
| **ToolbarBuilder** | validate → freeze → preserve order → seal |
| **Toolbar** | Opaque handle; internals private (WeakMap) |

Initial seed:

```text
Primary (toolbar.primary)
 ├─ system.catalog
 ├─ system.diagnostics
 └─ system.ping
```

Toolbars only reference `CommandId`. No implicit command creation. No registration.

### Catalog order contract (public / frozen)

```text
Toolbar order and item order are preserved exactly as declared in TOOLBAR_CATALOG.
```

- No alphabetical sort
- No reorder by `ToolbarId`
- No reorder by `CommandId`
- Toolbar order and item order inside each toolbar are part of the public contract

### Builder pipeline

1. **validate** — duplicate `ToolbarId` → throw; empty catalog → throw; empty `items` → throw
2. **freeze** — `Object.freeze` definitions / item lists
3. **preserve order** — exact catalog order
4. **seal** — opaque `Toolbar` with Builder-precomputed `duplicatedItems`

### Opaque Toolbar contract

```ts
type Toolbar = Readonly<{
  readonly __brand: "Toolbar";
}>;
```

- Naming is intentional: `Toolbar` / `ToolbarBuilder` (ordered collection — **not** `ToolbarTree`).
- Public API freeze: opaque type + Builder construction.
- Read helpers (`getToolbar*`) are **package-internal** — consumed only by `ToolbarDiagnostics`; **not** re-exported from the local barrel.
- Internals stay private (WeakMap).
- No insert · no delete · no mutate once sealed.

---

## 5. Provider / Hook / Bridge

- **Context** exposes `{ toolbar }` only (opaque handle).
- **Provider** builds the toolbar once via `useRef(buildToolbar())`.
- **useToolbar()** returns exact Provider-owned Context value; throws outside Provider.
- **ToolbarBridge** asserts Provider presence, then pass-through `children`.
- **NO production mount** of Provider or Bridge in this phase.

---

## 6. Diagnostics

```ts
type ToolbarDiagnosticsReport = Readonly<{
  toolbars: readonly ToolbarId[];
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

### New (UX-6.7)

```ts
type ToolbarItem = Readonly<{
  commandId: CommandId;
}>;

type ToolbarDefinition = Readonly<{
  id: ToolbarId;
  items: readonly ToolbarItem[];
}>;

type Toolbar = Readonly<{
  readonly __brand: "Toolbar";
}>;

type ToolbarContextValue = Readonly<{
  toolbar: Toolbar;
}>;

type ToolbarDiagnosticsReport = Readonly<{
  toolbars: readonly ToolbarId[];
  items: readonly CommandId[];
  orphanCommands: readonly CommandId[];
  duplicatedItems: readonly CommandId[];
}>;
```

Freeze: Definition · Item · **Toolbar public contract** (not implementation) · Catalog order · Context · Provider · Hook · Bridge · Diagnostics.

### Unchanged (UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6)

- `CommandDefinition` · `CommandState` · `CommandRegistryApi`
- `CommandContextValue` = `{ registry, states }`
- `CommandProvider` · `useCommands()` · `CommandBridge`
- `CommandExecutionPipeline` and related execution contracts
- Shortcut Definition / Registry / Resolver / Context / Provider / Hook / Bridge
- Command Palette Definition / Index / Search / Context / Provider / Hook / Bridge
- Menu Definition / Entry / MenuTree / Catalog / Context / Provider / Hook / Bridge / Diagnostics

---

## 8. Exclusions / Decoupling fence

Prohibited under `src/ui/toolbar/` for this phase:

- Buttons · Icons · Separators · Overflow · Mouse · Keyboard chrome
- `window` · `document` · `KeyboardEvent` · listeners
- handlers · callbacks · pipeline dispatch · business execute
- AppShell · Context Menus · AdaptiveToolbar product wiring
- `src/ui/index.ts` modification
- Barrel export of `getToolbar*` / `sealToolbar`

Pure modules (types / definition / catalog / toolbar / builder / diagnostics / barrel) remain React-free. React is allowed only in Context / Provider / Hook / Bridge.

---

## 9. Protected files

| Path | Role |
|------|------|
| `ToolbarTypes.ts` | `ToolbarId` brand |
| `ToolbarDefinition.ts` | `{ id, items }` / `{ commandId }` |
| `ToolbarCatalog.ts` | `TOOLBAR_CATALOG` seed |
| `Toolbar.ts` | Opaque toolbar + private storage |
| `ToolbarBuilder.ts` | validate → freeze → preserve order → seal |
| `ToolbarContext.tsx` | Private context |
| `ToolbarProvider.tsx` | Owns opaque toolbar via `useRef` |
| `useToolbar.ts` | Read-only hook |
| `ToolbarBridge.tsx` | Availability bridge |
| `ToolbarDiagnostics.ts` | Pure report |
| `index.ts` | Local barrel (no helpers · no React) |

---

## 10. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.7.1 | Toolbar stack structure (11 modules + docs) |
| CA-UX-6.7.2 | `TOOLBAR_CATALOG` Primary seed; `ToolbarItem` / `ToolbarDefinition` shape |
| CA-UX-6.7.3 | Builder validate → freeze → preserve order → seal |
| CA-UX-6.7.4 | Opaque `Toolbar`; WeakMap private; helpers not in barrel |
| CA-UX-6.7.5 | Context `{ toolbar }`; Provider `useRef`; Hook; Bridge |
| CA-UX-6.7.6 | Diagnostics: toolbars · items · orphanCommands · duplicatedItems |
| CA-UX-6.7.7 | API Freeze UX-6.1 / UX-6.3 / UX-6.4 / UX-6.5 / UX-6.6 intact |
| CA-UX-6.7.8 | No React UI chrome |
| CA-UX-6.7.9 | No execution · no production mount |
| CA-UX-6.7.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.7` → **PASS 10/10**

---

## 11. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.8 | Context Menus |
| UX-6.9–6.10 | Diagnostics/Metrics · Integration Certification |

Visual toolbar chrome (buttons, icons, overflow, interaction → execution) remains a later interaction-layer concern.
