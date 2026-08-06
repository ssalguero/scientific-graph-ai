# UX-8 — Workspace Interaction Architecture (SSOT)

```text
Status: FROZEN
Series: UX-8
Document: Architecture SSOT
Version: 1.0
Prerequisites: UX-7 RELEASE CERTIFIED
Next Series: UX-9 (Productivity Layer)
```

**Épica:** UX-8 — Workspace Interaction System  
**Documento:** Architecture SSOT (no es una microfase)  
**Fecha:** 2026-08-04  
**Prerrequisitos:** UX-7 CLOSED · UX-7 RELEASE CERTIFIED ([`UX-7.10.md`](./UX-7.10.md))  
**Roadmap de serie:** [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md) (referencia este documento; no lo redefine)

---

## SSOT precedence

> This document is the Single Source of Truth for the **architecture** of UX-8.
> Microphase docs (`UX-8.1` … `UX-8.10`) and validators must not redefine the
> global model. If a microphase conflicts with this document, this document
> takes precedence until a new architecture freeze or ADR supersedes it.

---

## Declaración

```text
UX-8 = Workspace Interaction System (estado de interacción)
UX-9 = Productivity Layer (acciones del usuario sobre UX-8)
Infrastructure first · no product mount in UX-8
API Freeze por microfase
Local barrels only · no @/ui expansion until authorized
Dependency Rule = VIGENTE
Authorities Matrix = VIGENTE
No cross-registry mutation
WindowRegistry / WindowManager / Runtime / UX-5–7 = INTOCABLES
```

---

## 1. Interaction Layer

```text
UI Interaction Layer (src/ui/*)
        │
        ├─ Focus
        ├─ Selection
        ├─ Hover
        ├─ Keyboard Navigation
        ├─ Clipboard
        ├─ Interaction Commands
        └─ Interaction Diagnostics
```

UX-8 owns **interaction state infrastructure** only. It does not own window
lifecycle, docking, geometry, scientific engines, command execution (UX-6),
or discoverability chrome (UX-7).

---

## 2. Domain modules

| Dominio | Módulo | Microfase |
|---------|--------|-----------|
| Focus | `src/ui/focus/` | UX-8.1 |
| Selection | `src/ui/selection/` | UX-8.2 · UX-8.3 |
| Hover | `src/ui/hover/` | UX-8.4 |
| Keyboard navigation | `src/ui/keyboard-nav/` | UX-8.5 |
| Clipboard | `src/ui/clipboard/` | UX-8.6 |
| Interaction commands | `src/ui/interaction-commands/` | UX-8.7 |
| Interaction diagnostics | `src/ui/interaction-diagnostics/` | UX-8.8 |

---

## 3. Focus (summary)

- `FocusState` = `{ focusedId, lastFocusedId }` only (`FocusTargetId | null`).
- **No** `blurred` field — focus absence is derived.
- `isFocused(id)` is **derived** (`focusedId === id`).
- Window references use `windowId: string` only — never import `WindowRegistry`.
- `FocusRegistry` is the sole focus authority.

---

## 4. Selection (summary)

- Axes: `selectedWindow` · `selectedContent` · `selectedSeries`.
- **Independence Freeze:** axes are independent — not a mandatory hierarchy.
  A window may host multiple contents; `selectedWindow !== selectedContent` is valid.
- Multi-select (UX-8.3) extends Selection without a new module root.

---

## 5. Hover (summary)

- Enter / leave / hover target.
- Preparation for tooltips; no tooltip rendering in UX-8.4.
- No coupling to UX-7 tooltip modules in foundation phases.

---

## 6. Keyboard Navigation (summary)

```text
KeyboardNavigation NO escucha eventos DOM.
NO window.addEventListener / document.addEventListener.
Solo expone: next() · previous() · move(Direction) · escape()
Integración DOM → UX-9.
```

---

## 7. Clipboard (summary)

- `ClipboardRegistry` stores **only** immutable `ClipboardEntry` snapshots.
- No real objects · no React refs · no `navigator.clipboard` in UX-8.
- Functional copy/paste → UX-9.

---

## 8. Interaction Commands (summary)

**Namespace Freeze (closed):**

| Export | Rol |
|--------|-----|
| `InteractionCommand` | Definición / identidad |
| `InteractionCommandResult` | Resultado estructural |
| `InteractionCommandDispatcher` | Dispatch |
| `InteractionCommandContext` | Contexto de dispatch |

Prohibido exportar o aliasar `CommandDispatcher` / `CommandContext` genéricos.
Desacoplado de UX-6 `CommandExecutionDispatcher`.

---

## 9. Diagnostics (summary)

- Query-only over public registry/query APIs.
- Never `registry.update()` · `registry.clear()` · `registry.focus()` · any mutation.
- Own validator in UX-8.8.

---

## 10. Authorities Matrix

| Dominio | Autoridad |
|---------|-----------|
| Focus | `FocusRegistry` |
| Selection | `SelectionRegistry` |
| Hover | `HoverRegistry` |
| Keyboard navigation | Keyboard Navigation API (`next` / `previous` / `move` / `escape`) |
| Clipboard | `ClipboardRegistry` |
| Interaction commands | `InteractionCommandDispatcher` |
| Diagnostics | Query-only sobre registries (sin autoridad de mutación) |

### Decoupling rule

```text
Ningún registry puede modificar el estado de otro registry.
La coordinación entre módulos se realiza únicamente mediante
capas de integración futuras (UX-9+).
```

Prohibido, por ejemplo: `SelectionRegistry` → `FocusRegistry.focus()`, o
`HoverRegistry` mutando selección.

---

## 11. Dependency Rule

```text
Los módulos UX-8 pueden depender únicamente de contratos públicos
(types, interfaces o IDs) de otras capas.

NO pueden importar implementaciones internas (Registry, Provider, Context)
de otros módulos UX ni de src/components/windows/**.
```

Comunicación por contratos públicos; ausencia de dependencias cruzadas sobre
implementaciones (misma filosofía UX-5 → UX-7).

---

## 12. No Ownership

UX-8 does **not** own or mutate:

| Surface | Owner / freeze |
|---------|----------------|
| WindowRegistry / WindowAPI / WindowManager | D55+ |
| Floating / Drag / Resize / Snap | D56–D59 |
| Tabs / Series / Content | D60–D63 |
| Dock interaction | D53 |
| Layout Engine | D54 |
| AppShell | UX-4 |
| Features | UX-5 |
| Commands / Shortcuts / Menus / Palette | UX-6 |
| Visibility / Discoverability | UX-7 |
| Runtime | UX-3.21 |
| `src/lib/scientific/**` / graph math | Hard rules |

Panel focus (`src/components/workspace/focus/`) remains orthogonal UI orientation.

---

## 13. Future Integrations (UX-9+)

| Deferred | Destino |
|----------|---------|
| DOM keyboard listeners (`addEventListener`) | UX-9 |
| Click-to-focus / WindowAPI.focus wiring / z-order | UX-9+ |
| Functional clipboard (copy/paste) | UX-9 |
| Command Palette visual + product mount | UX-9 |
| Undo / Redo | UX-9 |
| Advanced DnD / smart context menus | UX-10+ |
| Configurable shortcuts / macros / IA | post–UX-8 |
| Selection persistence | post–UX-8 |
| `@/ui` public barrel expansion | microfase que lo autorice |

---

## 14. Series discipline

```text
UX-5  → estado de features
UX-6  → infraestructura de comandos
UX-7  → infraestructura de visibilidad
UX-8  → infraestructura de interacción
UX-9  → productividad sobre esa infraestructura
```

---

**Architecture Freeze UX-8 = VIGENTE** · referenced by [`UX-8.0-roadmap.md`](./UX-8.0-roadmap.md)
