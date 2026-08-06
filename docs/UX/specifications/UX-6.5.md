# UX-6.5 — Command Palette Foundation

> **Architectural principles:**
> - Palette projects exclusively from `commandRegistry.getAll()`.
> - `CommandPaletteIndex` is opaque — public contract only, not storage internals.
> - `search(index, text)` → `readonly CommandId[]` (structural; no fuzzy/ranking).
> - No React UI · no overlay · no execution · no production mount.
> - UX-6.1 / UX-6.3 / UX-6.4 public contracts remain frozen and untouched.

**Épica:** UX-6 — Command System  
**Microfase:** UX-6.5 — Command Palette Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-6.1 Foundation · UX-6.3 Pipeline · UX-6.4 Shortcuts · UX-6.0 Roadmap FROZEN  
**SSOT de serie:** [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md)

**Declaración:**

```text
UX-6.5 = Command Palette Foundation
SCOPE = Definition · Catalog projection · Opaque Index · Search · Context · Provider · Hook · Bridge · Diagnostics
commandRegistry.getAll() = sole data source
CommandPaletteCatalog = projection (NOT a parallel command catalog)
CommandPaletteIndex = opaque public contract (NOT implementation)
search(index, text) → readonly CommandId[]
Context = { index }
NO React UI · NO Modal · NO Overlay · NO Dialog · NO Input · NO Focus
NO Keyboard · NO Shortcuts wiring · NO pipeline dispatch · NO execution
NO fuzzy · NO ranking · NO score · NO MRU · NO history
NO production mount · NO @/ui public barrel expansion
API FREEZE UX-6.1 / UX-6.3 / UX-6.4 = VIGENTE
Next: UX-6.6 Menus Integration
```

---

## 1. Purpose / Objetivo

Introducir la infraestructura de **Command Palette** como una capa de
consulta desacoplada sobre el `commandRegistry`.

```text
UX-6.5 establishes the Command Palette query foundation only.
It does not render UI, capture keyboard, wire chrome, or execute commands.
```

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-6.1 Foundation | [`UX-6.1.md`](./UX-6.1.md) · `validate:ux-6.1` |
| UX-6.3 Execution Pipeline | [`UX-6.3.md`](./UX-6.3.md) · `validate:ux-6.3` |
| UX-6.4 Shortcuts | [`UX-6.4.md`](./UX-6.4.md) · `validate:ux-6.4` |
| `commandRegistry` SSOT | [`CommandRegistry.ts`](../../src/ui/commands/CommandRegistry.ts) |
| Roadmap UX-6.0 FROZEN | [`UX-6.0-roadmap.md`](./UX-6.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- `CommandPaletteTypes` · `CommandPaletteDefinition` · `CommandPaletteCatalog`
- `CommandPaletteIndex` (opaque) · `CommandPaletteSearch`
- `CommandPaletteContext` · `CommandPaletteProvider` · `useCommandPalette` · `CommandPaletteBridge`
- `CommandPaletteDiagnostics`
- Docs + `validate:ux-6.5`

**Out**

- React UI (Modal / Overlay / Dialog / Input / Focus)
- Browser keyboard capture / Shortcuts product wiring
- Command execution / pipeline dispatch
- Fuzzy search · ranking · score · MRU · history · favorites
- Menus / toolbar / context menus (→ UX-6.6–6.8)
- Production mount of Provider / Bridge
- Expanding `@/ui` public barrel
- Changing frozen UX-6.1 / UX-6.3 / UX-6.4 contracts

---

## 4. Architecture

```text
commandRegistry.getAll()
        │
        ▼
CommandPaletteCatalog   (projection)
        │
        ▼
CommandPaletteIndex     (opaque)
        │
        ▼
CommandPaletteProvider  (useRef owns index; Context = { index })
        │
        ▼
useCommandPalette()
        │
        ▼
CommandPaletteBridge
        │
        ▼
search(index, text)
        │
        ▼
readonly CommandId[]
```

### Projection from commandRegistry

| Layer | Responsibility |
|-------|----------------|
| **commandRegistry** | Sole SSOT of commands (`getAll()`) |
| **CommandPaletteCatalog** | Projects `{ commandId }` entries — never owns commands |
| **CommandPaletteIndex** | Opaque search structure; keywords derived at build only |
| **CommandPaletteSearch** | Structural query API; never inspects Index internals |

Empty `commandRegistry` ⇒ empty catalog / index / search results (correct today).

### Opaque Index contract

```ts
type CommandPaletteIndex = Readonly<{
  readonly __brand: "CommandPaletteIndex";
}>;
```

- Public API freeze: opaque type + `createCommandPaletteIndex(catalog)`.
- Internals (tokens / maps / haystacks) stay private (WeakMap).
- Search must not access `index.tokens`, `index.map`, `index.lookup`.
- Storage implementation (Map / Trie / radix tree) may change later without breaking the contract.

### Keyword derivation (build-time only)

```text
system.catalog
        ↓
system
catalog
system.catalog
```

Keywords are **not** part of `CommandPaletteDefinition`. They are not persisted.

### Search rules

```ts
search(index: CommandPaletteIndex, text: string): readonly CommandId[]
```

- `trim()`; empty → all `CommandId`s in catalog order
- Case-insensitive substring / token match over `commandId` + derived keywords
- Preserve catalog order; one appearance per `CommandId`
- No fuzzy · ranking · score · MRU · history · reorder

---

## 5. Provider / Hook / Bridge

- **Context** exposes `{ index }` only (opaque handle).
- **Provider** builds catalog + index from `commandRegistry` and owns the index via `useRef`.
- **useCommandPalette()** returns exact Provider-owned Context value; throws outside Provider.
- **CommandPaletteBridge** asserts Provider presence, then pass-through `children`.
- **NO production mount** of Provider or Bridge in this phase.

---

## 6. API Freeze

### New (UX-6.5)

```ts
type CommandPaletteDefinition = Readonly<{
  commandId: CommandId;
}>;

type CommandPaletteIndex = Readonly<{
  readonly __brand: "CommandPaletteIndex";
}>;

function createCommandPaletteIndex(
  catalog: readonly CommandPaletteDefinition[],
): CommandPaletteIndex;

function search(
  index: CommandPaletteIndex,
  text: string,
): readonly CommandId[];

type CommandPaletteContextValue = Readonly<{
  index: CommandPaletteIndex;
}>;

type CommandPaletteDiagnosticsReport = Readonly<{
  entries: readonly CommandId[];
  keywords: readonly string[];
  duplicatedKeywords: readonly string[];
  orphanEntries: readonly CommandId[];
}>;
```

Freeze: Definition · **Index public contract** (not implementation) · Search API · Context · Provider · Hook · Bridge · Diagnostics.

### Unchanged (UX-6.1 / UX-6.3 / UX-6.4)

- `CommandDefinition` · `CommandState` · `CommandRegistryApi`
- `CommandContextValue` = `{ registry, states }`
- `CommandProvider` · `useCommands()` · `CommandBridge`
- `CommandExecutionPipeline` and related execution contracts
- Shortcut Definition / Registry / Resolver / Context / Provider / Hook / Bridge

---

## 7. Exclusions / Decoupling fence

Prohibited under `src/ui/palette/` for this phase:

- Modal · Overlay · Dialog · Input · Focus · Keyboard chrome
- `window` · `document` · `KeyboardEvent` · listeners
- handlers · callbacks · pipeline dispatch · business execute
- fuzzy · ranking · score · MRU · history
- AppShell · Toolbar · Menus · Shortcuts product wiring
- `src/ui/index.ts` modification

Pure modules (types / definition / catalog / index / search / diagnostics / barrel) remain React-free. React is allowed only in Context / Provider / Hook / Bridge.

---

## 8. Protected files

| Path | Role |
|------|------|
| `CommandPaletteTypes.ts` | Shared type aliases |
| `CommandPaletteDefinition.ts` | Identity `{ commandId }` |
| `CommandPaletteCatalog.ts` | Projection from `getAll()` |
| `CommandPaletteIndex.ts` | Opaque index + private storage |
| `CommandPaletteSearch.ts` | `search(index, text)` |
| `CommandPaletteContext.tsx` | Private context |
| `CommandPaletteProvider.tsx` | Owns opaque index via `useRef` |
| `useCommandPalette.ts` | Read-only hook |
| `CommandPaletteBridge.tsx` | Availability bridge |
| `CommandPaletteDiagnostics.ts` | Pure report |
| `index.ts` | Local barrel |

---

## 9. Acceptance criteria

| ID | Criterion |
|----|-----------|
| CA-UX-6.5.1 | Palette stack structure (11 modules + docs) |
| CA-UX-6.5.2 | Catalog projects from `commandRegistry.getAll()` only |
| CA-UX-6.5.3 | Opaque Index contract; keywords derived at build |
| CA-UX-6.5.4 | `search(index, text)` → `CommandId[]`; no internals access |
| CA-UX-6.5.5 | Context `{ index }`; Provider `useRef`; Hook; Bridge |
| CA-UX-6.5.6 | Diagnostics: entries · keywords · duplicatedKeywords · orphanEntries |
| CA-UX-6.5.7 | API Freeze UX-6.1 / UX-6.3 / UX-6.4 intact |
| CA-UX-6.5.8 | No React UI chrome |
| CA-UX-6.5.9 | No execution · no production mount |
| CA-UX-6.5.10 | `tsc --noEmit` compiles |

Gate: `npm run validate:ux-6.5` → **PASS 10/10**

---

## 10. Próximas fases

| Fase | Objetivo |
|------|----------|
| UX-6.6 | Menus Integration |
| UX-6.7–6.8 | Toolbar · Context Menus |
| UX-6.9–6.10 | Diagnostics/Metrics · Integration Certification |

Visual palette chrome (overlay, search box, keyboard navigation, selection → execution) remains a later interaction-layer concern.
