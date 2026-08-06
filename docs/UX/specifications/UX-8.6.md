# UX-8.6 — Clipboard Foundation

> **Architectural principles:**
> - Registry = único SSOT de clipboard (`ClipboardRegistryApi` +
>   `clipboardRegistry`).
> - ClipboardState = `{ entry }` only.
> - **Clipboard Contract Freeze:** logical payload only — not browser/OS
>   clipboard · Clipboard API · MIME · files · images · copied text.
> - **Clipboard Semantics Freeze:** `set(entry)` replaces completely — no
>   accumulate · no history · no stack.
> - **Entry Replacement Freeze:** `set()` always replace — never merge / patch /
>   partial update.
> - **Payload Opaqueness Freeze:** `payload: unknown` is opaque — never inspect /
>   validate / serialize / transform.
> - **Clipboard Identity Freeze:** `id` is opaque — never generate / modify /
>   uniqueness-validate / interpret.
> - **Entry Immutability Freeze:** never mutate existing entry — new entry →
>   replace → snapshot.
> - **Stateless Clipboard Freeze:** ONLY `entry` — no history / stack / queue /
>   undo / redo / previousEntry.
> - **Browser Clipboard Freeze:** no `navigator.clipboard` · ClipboardEvent ·
>   window · document · execCommand.
> - factory → private state → API Freeze → clone-on-read.
> - ClipboardRegistry = única autoridad (Authorities Matrix).
> - Dependency Rule: solo contratos públicos; no Registry/Provider/Context ajenos.
> - Sin product mount · sin expansión `@/ui`.
> - Architecture Freeze: [`UX-8-architecture.md`](./UX-8-architecture.md).

**Épica:** UX-8 — Workspace Interaction System  
**Microfase:** UX-8.6 — Clipboard Foundation  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-8.5 RELEASE CERTIFIED · Architecture SSOT FROZEN · UX-8.0 Roadmap FROZEN  
**SSOT de arquitectura:** [`UX-8-architecture.md`](./UX-8-architecture.md)  
**SSOT de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)

**Declaración:**

```text
UX-8.6 = Clipboard Foundation
SCOPE = ClipboardTypes → ClipboardState → ClipboardRegistry
        → ClipboardContext → ClipboardProvider → useClipboard
        → local barrel
ClipboardState = { entry } ONLY
ClipboardEntry = { id, kind, payload } ONLY
Clipboard Contract Freeze = logical payload only · NOT browser/OS clipboard
Clipboard Semantics Freeze = set() replaces completely · no accumulate/history/stack
Entry Replacement Freeze = set() always replace · never merge/patch/partial
Payload Opaqueness Freeze = payload opaque · never inspect/validate/serialize
Clipboard Identity Freeze = id opaque · never generate/modify/uniqueness-validate
Entry Immutability Freeze = never mutate existing entry · new → replace → snapshot
Stateless Clipboard Freeze = entry ONLY · no history/stack/queue/undo/previousEntry
Browser Clipboard Freeze = no navigator.clipboard · ClipboardEvent · window ·
  document · execCommand
Registry Freeze = set / clear / get / getState ONLY
API Stability Freeze = get() ≡ getState() · no behavioral differences
Singleton Freeze = clipboardRegistry for infrastructure/testing ONLY ·
  React via Provider + useClipboard
ClipboardRegistry = sole clipboard authority
NO Focus · NO Selection · NO Hover · NO Keyboard · NO Commands · NO OS clipboard
NO production mount · NO @/ui public barrel expansion
NO cross-registry mutation
Dependency Rule = VIGENTE
Architecture Freeze UX-8 = VIGENTE
API FREEZE UX-3 / UX-4 / UX-5 / UX-6 / UX-7 / UX-8.1–UX-8.5 = VIGENTE
Next: UX-8.7 Interaction Commands Foundation
```

---

## 1. Objective / Objetivo

Crear la infraestructura oficial de Clipboard bajo `src/ui/clipboard/`,
**sin montar Provider en la app**, **sin navigator.clipboard**, **sin copy/paste**,
**sin integración con Focus / Selection / Hover / Keyboard / Commands**,
**sin impacto funcional visible**.

```text
UX-8.6 establishes the Clipboard Foundation only.
It models a logical ClipboardEntry via a pure API.
It does not wire OS clipboard, Clipboard API, copy, paste, cut,
Focus, Selection, Hover, Keyboard, Commands, or product chrome.
```

---

## 2. Architecture

```text
ClipboardProvider
        │
        ▼
ClipboardRegistry
        │
        ▼
ClipboardState { entry }

ClipboardEntry { id, kind, payload }
        │
        ▼
ClipboardRegistryApi + clipboardRegistry
  set / clear / get / getState
        │
        ▼
ClipboardProvider + ClipboardContext
        │
        ▼
useClipboard() (read-only Context access)
```

Registry = única autoridad.

| Componente | Responsabilidad |
|------------|-----------------|
| `ClipboardTypes` | `ClipboardEntry` contract |
| `ClipboardState` | Snapshot `{ entry }` + factory |
| `ClipboardRegistryApi` | SSOT mutable: set / clear / get / getState |
| `clipboardRegistry` | Empty singleton (infra/testing only) |
| `ClipboardContext` | Declara `ClipboardContextValue` |
| `ClipboardProvider` | Posee registry vía `useRef` |
| `useClipboard()` | Acceso read-only al Context |
| `index.ts` | Único export oficial del módulo (local barrel) |

Future integration path (UX-9, out of scope here):

```text
User action → Adapter → ClipboardRegistry → OS / Clipboard API
```

---

## 3. Clipboard Contract Freeze

`ClipboardEntry` represents a **logical payload only**.

It does **NOT** represent:

```text
Browser Clipboard · OS Clipboard · Clipboard API
MIME · files · images · copied text
```

Interpretation and browser integration belong to UX-9.

---

## 4. Clipboard Semantics Freeze

`set(entry)` **replaces** the entire clipboard content.

```text
set(entry) → entry is fully replaced
```

There is **NO**:

- accumulation of entries
- clipboard history
- stack of entries

`clear()` sets `entry = null`.

---

## 5. Entry Replacement Freeze

`set(entry)` always performs a **full replace**.

Never:

```text
merge · patch · partial update · incremental mutation
```

---

## 6. Payload Opaqueness Freeze

`payload: unknown` is completely **opaque**.

The Registry MUST NOT:

```text
inspect · validate · serialize · deserialize · transform · interpret
```

the payload. The Registry stores and returns `payload` only.

This avoids coupling Clipboard with Series · Windows · Graphs · JSON ·
Clipboard API · MIME · Browser until UX-9.

---

## 7. Clipboard Identity Freeze

`ClipboardEntry.id` is an **opaque** identifier.

The Registry NEVER:

```text
generates · modifies · validates uniqueness · interprets
```

`id`. It stores the `ClipboardEntry` exactly as received.

---

## 8. Entry Immutability Freeze

A stored `ClipboardEntry` is **never mutated**.

Any change follows:

```text
new ClipboardEntry
        ↓
     replace
        ↓
     snapshot
```

Never mutate fields of an existing entry (`entry.id = …`,
`entry.kind = …`, `entry.payload = …`).

---

## 9. Stateless Clipboard Freeze

The registry stores **ONLY**:

```text
entry: ClipboardEntry | null
```

There is **NO**:

- `history`
- `stack`
- `queue`
- `undo` / `redo`
- `previousEntry`
- timestamps · metadata

---

## 10. Browser Clipboard Freeze

The module does **not** know:

```text
navigator.clipboard · ClipboardEvent · Clipboard API
window · document · execCommand
```

No browser clipboard integration. Real OS/browser clipboard → UX-9.

---

## 11. API Freeze

### Types

```ts
type ClipboardEntry = Readonly<{
  readonly id: string;
  readonly kind: string;
  readonly payload: unknown;
}>;
```

Never import navigator.clipboard, ClipboardEvent, DOM, Focus, Selection,
Hover, or Keyboard.

### State

```ts
type ClipboardState = Readonly<{
  readonly entry: ClipboardEntry | null;
}>;
```

### Registry Freeze

`ClipboardRegistryApi` queda **congelado** en UX-8.6.

Métodos oficiales (exactamente cuatro):

```text
set() · clear() · get() · getState()
```

```ts
interface ClipboardRegistryApi {
  set(entry: ClipboardEntry): void;
  clear(): void;
  get(): ClipboardState;
  getState(): ClipboardState;
}

function createClipboardRegistry(): ClipboardRegistryApi;
const clipboardRegistry: ClipboardRegistryApi;
```

Historical Semantics:

- `set(entry)`: full replace of private `entry` with a new frozen
  `ClipboardEntry` (Entry Replacement · Entry Immutability).
- `clear()`: `entry → null`.
- `get()` / `getState()`: clone-on-read vía `createClipboardState`
  (Object.freeze).

**Forbidden:** `copy` · `paste` · `cut` · `read` · `write` · `sync` ·
`import` · `export`.

Naming: `ClipboardRegistryApi` + `clipboardRegistry`
(en diagramas: **ClipboardRegistry**).

---

## 12. API Stability Freeze

`get()` y `getState()` son **intencionalmente equivalentes** en UX-8.x.
Ambos permanecen congelados por estabilidad de API; ningún consumidor debe
asumir diferencias de comportamiento.

```text
get() ≡ getState()
```

---

## 13. Singleton Freeze

El singleton `clipboardRegistry` existe únicamente para escenarios de
infraestructura y testing. Los consumidores React deben acceder al registry
exclusivamente mediante `ClipboardProvider` y `useClipboard()`.

---

## 14. Authorities

| Dominio | Autoridad |
|---------|-----------|
| Clipboard | `ClipboardRegistry` |

Ningún otro registry puede modificar ClipboardRegistry.
FocusRegistry, SelectionRegistry, HoverRegistry,
KeyboardNavigationRegistry, WindowRegistry — prohibido mutar clipboard.
Coordinación entre módulos → UX-9+ únicamente.

---

## 15. Dependency Rule

Files under `src/ui/clipboard/` may depend only on:

- Local clipboard module files
- `react` (Context / Provider / hook only)

Must **not** import:

- Other UX module Registry / Provider / Context implementations
- Focus / Selection / Hover / Keyboard / Interaction Commands
- `src/components/windows/**` · WindowRegistry
- Runtime / scientific / graph math
- `navigator.clipboard` · ClipboardEvent · window · document · execCommand
- Commands / Visibility / Features / Tabs internals for wiring

---

## 16. Out of Scope

```text
No navigator.clipboard · no Clipboard API · no ClipboardEvent
No copy() · paste() · cut()
No OS clipboard · no MIME · no serialization
No multiple entries · no clipboard history · no undo / redo
No Focus / Selection / Hover / Keyboard / Commands integration
No production App wiring · no page.tsx · no AppShell
No @/ui public barrel expansion
No WindowRegistry / WindowManager / WindowAPI mutations
No cross-registry mutation
No clipboard UI
```

---

## 17. Integration Fence

Protected prior surfaces (must not change):

- WindowRegistry · WindowTypes · WindowManager · WindowAPI
- Floating / Drag / Resize / Snap
- Tabs / Series / Content
- Focus module (`src/ui/focus/`)
- Selection module (`src/ui/selection/`)
- Hover module (`src/ui/hover/`)
- Keyboard Navigation module (`src/ui/keyboard-nav/`)
- UX-5 Features · UX-6 Commands · UX-7 Visibility
- Runtime · `src/lib/scientific/**`
- `src/ui/index.ts` · `page.tsx` · AppShell
- `docs/UX/UX-8-architecture.md` · historical validators

No conectar Clipboard con:

```text
WindowRegistry · WindowManager · FloatingWindow
Tabs · Content · Series · Visibility
Commands · Selection · Focus · Hover · Keyboard
navigator.clipboard · ClipboardEvent · OS clipboard
```

---

## 18. Acceptance Criteria

| ID | Criterio |
|----|----------|
| CA-UX-8.6.1 | Docs con Contract · Semantics · Entry Replacement · Payload Opaqueness · Identity · Immutability · Stateless · Browser · API · API Stability · Singleton · Authorities · Dependency Rule |
| CA-UX-8.6.2 | Módulo `src/ui/clipboard/` + siete archivos core |
| CA-UX-8.6.3 | State solo `entry` (Stateless Clipboard Freeze) |
| CA-UX-8.6.4 | ClipboardEntry solo `id` / `kind` / `payload` |
| CA-UX-8.6.5 | API Freeze: set / clear / get / getState |
| CA-UX-8.6.6 | set() replace only · clear() → null · get ≡ getState |
| CA-UX-8.6.7 | Identity opaque · payload opaque · entry immutable |
| CA-UX-8.6.8 | Barrel local · sin expansión `@/ui` |
| CA-UX-8.6.9 | Dependency Rule · Browser Clipboard Freeze · no foreign registries |
| CA-UX-8.6.10 | Sin product mount · WindowRegistry intacto |
| CA-UX-8.6.11 | Roadmap marca UX-8.6 COMPLETE |
| CA-UX-8.6.12 | `validate:ux-8.6` PASS |

---

## 19. Gate

```text
validate:ux-8.6 → PASS
```

**Next:** UX-8.7 — Interaction Commands Foundation
