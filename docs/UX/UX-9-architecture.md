# UX-9 — Productivity Layer Architecture (SSOT)

```text
Status: FROZEN
Series: UX-9
Document: Architecture SSOT
Version: 1.0
Prerequisites: UX-8 RELEASE CERTIFIED
Next Domains: ENGINE · DATA · AI · COLLAB · PLUGINS · PERFORMANCE · RELEASE
```

**Épica:** UX-9 — Productivity Layer  
**Documento:** Architecture SSOT (no es una microfase)  
**Fecha:** 2026-08-05  
**Prerrequisitos:** UX-8 CLOSED · UX-8 RELEASE CERTIFIED ([`UX-8.10.md`](./UX-8.10.md))  
**Roadmap de serie:** [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md) (referencia este documento; no lo redefine)  
**UX-8 Architecture SSOT (frozen):** [`UX-8-architecture.md`](./UX-8-architecture.md)

---

## SSOT precedence

> This document is the Single Source of Truth for the **architecture** of UX-9.
> Microphase docs (`UX-9.1` … `UX-9.10`) and validators must not redefine the
> global model. If a microphase conflicts with this document, this document
> takes precedence until a new architecture freeze or ADR supersedes it.
>
> UX-8 architecture remains frozen and is not rewritten by UX-9.

---

## Series discipline

```text
UX-5  → Features
UX-6  → Commands
UX-7  → Visibility
UX-8  → Interaction
UX-9  → Productivity
```

UX-9 does not restart the stack. It converts certified infrastructure into a
visible, usable productivity experience.

---

## Declaración

```text
UX-9 = Productivity Layer
Implementation strategy = Visual Integration (NOT the series name)
Reuse only · no parallel infrastructure to UX-1 → UX-8
ProductCompositionHost = architectural target (not implemented in UX-9.0)
Dependency Rule = VIGENTE
Authorities Matrix = VIGENTE
No cross-registry mutation
Orchestration only inside ProductCompositionHost
Clipboard Integration Bridge = VIGENTE (adapters; never direct navigator coupling)
Undo Thin History Adapter = exception ONLY in UX-9.7
UX-9.8 Polish ≠ registries · Diagnostics ≠ UI
Visible User Outcome = governance rule for UX-9.1 → UX-9.8
UX-8 architecture = FROZEN (intoque)
```

---

## 1. Series identity

```text
Official name:           UX-9 — Productivity Layer
Implementation strategy: Visual Integration of certified UX-1 → UX-8 infrastructure
```

UX-9 implements **Productivity** using **Visual Integration**.

Visual Integration is **not** the official series name. It is the strategy by
which the Productivity Layer makes existing infrastructure perceptible and
usable without building a new base layer.

```text
UX-8 = interaction infrastructure (estado)
UX-9 = visible productivity on that infrastructure
```

---

## 2. Core principle — No parallel infrastructure

**Frozen:**

```text
NO new Registry
NO new Provider
NO new Context
NO new Dispatcher
NO new State model
NO new Contract
parallel to UX-1 → UX-8.
```

UX-9 **reuses** certified surfaces. It may mount, bridge, and paint them. It
must not invent an equivalent interaction or command stack.

**Exceptions** require either:

- an explicit freeze in this document (see Undo / Redo), or
- an **ADR** before expansion.

---

## 3. ProductCompositionHost (architectural target)

**Frozen target tree** (architecture only — **not implemented in UX-9.0**):

```text
ProductCompositionHost
  └─ WindowManager
      └─ WorkspaceLayout
          └─ UX Providers (certified)
              └─ Visible Product UI
```

### Rules

- `ProductCompositionHost` is the **authorized composition point** for UX
  providers in the Productivity Layer.
- Microphases must not mount ad-hoc provider constellations inside `page.tsx`.
- When the host exists, `page.tsx` mounts the host; the host owns composition.
- AppShell remains layout chrome (UX-4 freeze). Providers are not stuffed into
  AppShell layout-only slots in violation of prior freezes.

---

## 4. Provider composition (reuse only)

Future composition mounts **existing** providers / surfaces only:

| Surface | Origin | Role in UX-9 |
|---------|--------|--------------|
| Focus | UX-8.1 · `src/ui/focus/` | Visual focus |
| Selection | UX-8.2 / 8.3 · `src/ui/selection/` | Visible selection |
| Hover | UX-8.4 · `src/ui/hover/` | Hover feedback |
| Keyboard Navigation | UX-8.5 · `src/ui/keyboard-nav/` | Keyboard productivity |
| Clipboard | UX-8.6 · `src/ui/clipboard/` | Logical clipboard + bridge |
| Interaction Commands | UX-8.7 · `src/ui/interaction-commands/` | Interaction dispatch surface |
| Visibility / Discoverability | UX-7 · `src/ui/visibility/` · visual-integration | Visible discoverability |
| Command Palette | UX-6.5 · `src/ui/palette/` | Visible palette UI |
| Commands / Shortcuts | UX-6 · `src/ui/commands/` | Command execution stack |

**No new Provider hierarchy.** Composition order is decided in the
implementing microphases under this target tree.

---

## 5. Authorities Matrix

| Dominio | Autoridad | Notas |
|---------|-----------|-------|
| Window lifecycle | WindowManager / WindowAPI (D55+) | Activate, focus, minimize, close |
| Focus (interaction) | `FocusRegistry` | Bridged to visible chrome; no parallel focus store |
| Selection | `SelectionRegistry` | Axes independent per UX-8 |
| Hover | `HoverRegistry` | Feedback only; no tooltip engine rewrite |
| Keyboard navigation | Keyboard Navigation API | Intent API; DOM listeners are integration, not new authority |
| Clipboard (logical) | `ClipboardRegistry` | Snapshots only |
| Clipboard (transport) | Clipboard Integration Bridge | Adapters; never direct architectural coupling to browser |
| Interaction commands | `InteractionCommandDispatcher` | Distinct from UX-6 execution dispatcher |
| Command palette (data) | UX-6.5 palette catalog / index / search | Visual shell is UX-9 product chrome |
| Commands (execution) | UX-6 command stack | Not rewritten |
| Visibility | Visibility / Discoverability (UX-7) | Metadata + views; no new visibility registry |
| Diagnostics | Interaction Diagnostics (query-only) | Never mutates UI or registries |
| Panel orientation | `ActivePanelProvider` (workspace) | Orthogonal to UX-8 Focus |

### No shared ownership

Each domain has one authority. Integration may **orchestrate** calls; it must
not create dual writers for the same state.

---

## 6. Dependency Rule

```text
No cross-registry mutation.
Orchestration of certified registries happens only inside
ProductCompositionHost (or thin bridges owned by that composition layer).

Modules must not import internal implementations of other UX modules
to mutate them. Public contracts / hooks / APIs only.
```

Decoupling inherited from UX-8 remains vigente. UX-9 adds the allowed
orchestration locus: **ProductCompositionHost**.

---

## 7. Reused infrastructure inventory

All of the following are **reused**, not replaced:

| Module path | Series |
|-------------|--------|
| `src/ui/focus/` | UX-8 |
| `src/ui/selection/` | UX-8 |
| `src/ui/hover/` | UX-8 |
| `src/ui/keyboard-nav/` | UX-8 |
| `src/ui/clipboard/` | UX-8 |
| `src/ui/interaction-commands/` | UX-8 |
| `src/ui/interaction-diagnostics/` | UX-8 |
| `src/ui/visibility/` | UX-7 |
| `src/ui/visual-integration/` | UX-7.8 |
| `src/ui/palette/` | UX-6.5 |
| `src/ui/commands/` | UX-6 |

UX-8 architecture SSOT remains frozen: [`UX-8-architecture.md`](./UX-8-architecture.md).

---

## 8. Components affected (product chrome)

UX-9 may modify or wire the following **existing** surfaces for visible
productivity (not a mandate to rewrite all of them in every microphase):

| Component / surface | Role |
|---------------------|------|
| `page.tsx` | Mounts ProductCompositionHost (when implemented) |
| ProductCompositionHost | Authorized provider composition (target) |
| WindowManager | Window lifecycle already mounted |
| FloatingWindow / window chrome | Active / inactive / focus visual differentiation |
| WorkspaceLayout | Workspace bridge to AppShell |
| AppShell | Layout chrome; respect UX-4 freezes |
| Dock | Selection / focus / hover chrome |
| Tabs | Active / selected visual states |
| Panels | Active / focus / hover consistency |
| Workspace chrome / status surfaces | Polish targets (UX-9.8) |

---

## 9. Clipboard — Integration Bridge

**Frozen:**

```text
ClipboardRegistry
  + Clipboard Integration Bridge
      ├─ Browser Clipboard Adapter   (navigator.clipboard)  — UX-9.5 candidate
      ├─ Desktop Adapter             — future
      └─ Plugin Adapter              — future
```

### Rules

- Architecture **never** depends directly on `navigator.clipboard`.
- Product code talks to the **bridge**; the bridge selects an adapter.
- Logical state remains in `ClipboardRegistry` (UX-8.6).
- Desktop and Plugin adapters are out of scope for early UX-9.5
  implementation unless a microphase explicitly delivers them; they remain
  architectural slots.

---

## 10. Undo / Redo — Thin History Adapter (exception)

**Fact:** UX-6 `CommandExecutionDispatcher` is structural ack/reject only.
There is **no** certified undo/redo backend today.

**Frozen exception for UX-9.7 only:**

A **Thin History Adapter** is allowed **only** inside UX-9.7 if all of the
following hold:

- no new interaction-style Registry parallel to UX-8
- no rewrite of the UX-6 command pipeline
- no duplication of interaction infrastructure
- scope limited to connecting existing command outcomes to visible Undo/Redo UI

If UX-9.7 would require a new domain engine, an **ADR** is mandatory before
expansion.

---

## 11. UX-9.8 — Polish and Diagnostics (one phase, two blocks)

One microfase; two independent blocks:

| Block | Nature | Frozen rule |
|-------|--------|-------------|
| **Workspace Polish** | Product | Polish **never** mutates registries |
| **Workspace Diagnostics** | Internal support / infrastructure | Diagnostics **never** mutates UI |

Diagnostics overlays are optional, **off by default**, and not shown to end
users by default. They reuse Interaction Diagnostics (query-only).

---

## 12. Visible productivity metrics

UX-9 success is measured by **visible changes without DevTools**.

Each functional microphase (UX-9.1 → UX-9.8) must expose observable UX
improvements. See roadmap governance: **Visible User Outcome**.

Guidance (perception targets):

| Phase | User should notice |
|-------|--------------------|
| UX-9.1 | Active window · distinct chrome |
| UX-9.2 | Focus · selection |
| UX-9.3 | Hover · visibility |
| UX-9.4 | Keyboard navigation |
| UX-9.5 | Copy / paste working |
| UX-9.6 | Command palette working |
| UX-9.7 | Undo / redo |
| UX-9.8 | Application “feels finished” |

---

## 13. Future product domains (post–UX-9)

UX-9 does **not** replace upcoming product domains. After Productivity Layer
certification, planned domains include:

```text
ENGINE
DATA
AI
COLLAB
PLUGINS
PERFORMANCE
RELEASE
```

Advanced DnD, smart context menus, configurable shortcuts, macros, AI features,
and selection persistence remain **outside** UX-9 (see roadmap Out of Scope).

---

## 14. No Ownership (inherited freezes)

UX-9 does **not** rewrite or claim ownership of:

| Surface | Owner / freeze |
|---------|----------------|
| UX-1 → UX-8 certified contracts | Prior series freezes |
| WindowRegistry internals | D55+ (lifecycle used via public API) |
| Runtime | UX-3.21 |
| Scientific / graph math | Hard rules · `src/lib/scientific/**` |
| AppShell layout contracts | UX-4 |

---

**Architecture Freeze UX-9 = VIGENTE** · referenced by [`UX-9.0-roadmap.md`](./UX-9.0-roadmap.md)
